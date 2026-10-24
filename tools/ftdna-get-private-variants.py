"""
Downloads the Big Y private variants of every Big Y tested project member,
through the admin (GAP) session captured by ftdna-login.py.

Usage:
    python tools/ftdna-get-private-variants.py                 # every Big Y kit
    python tools/ftdna-get-private-variants.py --only IN99945  # selected kits
    python tools/ftdna-get-private-variants.py --missing       # kits not fetched yet

Flow:
    1. Reads kit number -> encrypted kit id (ekit) and the access level each
       member granted the admins from GAP's Member Information report.
    2. Takes the Big Y testers from data/input/slo-ydna-fetched.csv (Test column).
    3. For each one, opens the member's Big Y page as admin, then downloads the
       Private Variants CSV that page offers, in the same browser session.

Everything goes to one file, data/input/slo-big-y-private.json, keyed by kit:
the variants themselves (position, ancestral, derived), their count, the fetch
status and the access level. ftdna-csv-to-json.py merges the counts into
slo-ydna.json.

Members who gave the admins no access (or "Minimum") have no Big Y page to
open; they are listed with status "no-access" and keep no count.

FTDNA ties a login to one server for about an hour, so run this right after
ftdna-login.py. If the session has expired the script exits with code 2.
"""

import argparse
import csv
import datetime
import io
import json
import sys
import urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright

SESSION_FILE = Path(".ftdna-session.json")
FETCHED_CSV = Path("data/input/slo-ydna-fetched.csv")
OUTPUT = Path("data/input/slo-big-y-private.json")

MEMBERS_URL = "https://gap.familytreedna.com/member-information.aspx"
BIGY_URL = "https://www.familytreedna.com/my/big-y?ekit={ekit}"
DOWNLOAD_URL = "https://www.familytreedna.com/my/big-y/DownloadPrivateVariants?ekit={ekit}"
TIMEOUT = 120_000


def looks_like_login(url):
    u = url.lower()
    return "login" in u or "signin" in u or "sign-in" in u


class SessionExpired(Exception):
    pass


# Kit number, ekit and "Access Granted" of every row on the current page.
READ_ROWS_JS = """
() => {
  const table = document.querySelector('[id$="gvMembershipReport"]');
  if (!table) return null;
  const heads = [...table.querySelectorAll('thead th')].map(th => th.innerText.trim());
  const accessCol = heads.indexOf('Access Granted');
  return [...table.querySelectorAll('tbody tr')].map(tr => {
    const a = tr.querySelector('a[id*="lblKitNum"]');
    if (!a) return null;
    const ekit = new URL(a.href).searchParams.get('ekit');
    const cells = tr.querySelectorAll(':scope > td');
    return [a.innerText.trim(), ekit, accessCol >= 0 && cells[accessCol] ? cells[accessCol].innerText.trim() : ''];
  }).filter(Boolean);
}
"""


def read_members(page):
    """kit -> (ekit, access) over every page of the Member Information report."""
    page.goto(MEMBERS_URL, timeout=TIMEOUT)
    page.wait_for_load_state("networkidle", timeout=TIMEOUT)
    if looks_like_login(page.url):
        raise SessionExpired(page.url)

    members = {}
    current = 1
    while True:
        rows = page.evaluate(READ_ROWS_JS)
        if rows is None:
            raise RuntimeError(f"Member table not found on {page.url}")
        for kit, ekit, access in rows:
            members[kit] = (ekit, access)
        print(f"  members page {current}: {len(rows)} kits")
        # The ASP.NET pager posts back with 'Page$N'; "..." links jump to the next block.
        nxt = page.locator(f"a[href*=\"'Page${current + 1}'\"]")
        if nxt.count() == 0:
            break
        with page.expect_navigation(timeout=TIMEOUT):
            nxt.first.click(no_wait_after=True)
        page.wait_for_load_state("networkidle", timeout=TIMEOUT)
        current += 1
    return members


def bigy_kits():
    with open(FETCHED_CSV, encoding="utf-8") as f:
        return [r["Kit Number"] for r in csv.DictReader(f) if r.get("Test", "").startswith("Big Y")]


def parse_variants(text):
    """The download's rows (Position, Ancestral, Derived), header dropped."""
    rows = [r for r in csv.reader(io.StringIO(text)) if any(c.strip() for c in r)]
    return [{"position": int(r[0]), "ancestral": r[1], "derived": r[2]} for r in rows[1:]]


def fetch_one(context, page, kit, ekit):
    """Returns (status, variants or None)."""
    q = urllib.parse.quote(ekit, safe="")
    page.goto(BIGY_URL.format(ekit=q), timeout=TIMEOUT)
    page.wait_for_load_state("networkidle", timeout=TIMEOUT)
    if looks_like_login(page.url):
        raise SessionExpired(page.url)
    if "/my/big-y" not in page.url:
        return "no-bigy-page", None

    resp = context.request.get(DOWNLOAD_URL.format(ekit=q), timeout=TIMEOUT)
    ctype = resp.headers.get("content-type", "")
    text = resp.text()
    if resp.status != 200 or "html" in ctype:
        if "<title>FamilyTreeDNA - Sign In" in text:
            raise SessionExpired(resp.url)
        return f"http-{resp.status}" if resp.status != 200 else "not-csv", None

    return "ok", parse_variants(text)


def load_previous():
    if not OUTPUT.exists():
        return {}
    with open(OUTPUT, encoding="utf-8") as f:
        return json.load(f)


def save(results):
    """Indented JSON, except that each variant stays on one line — a Big Y kit
    has dozens of them, and five lines apiece would bury the kits."""
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    kits = []
    for kit, rec in sorted(results.items()):
        fields = [f'  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}' for k, v in rec.items() if k != "variants"]
        if "variants" in rec:
            lines = ",\n".join(f"   {json.dumps(v)}" for v in rec["variants"])
            fields.append(f'  "variants": [\n{lines}\n  ]' if lines else '  "variants": []')
        kits.append(f" {json.dumps(kit)}: {{\n" + ",\n".join(fields) + "\n }")
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write("{\n" + ",\n".join(kits) + "\n}\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--only", nargs="+", metavar="KIT", help="Fetch only these kit numbers.")
    parser.add_argument("--missing", action="store_true",
                        help="Skip kits that already have a successful fetch.")
    args = parser.parse_args()

    if not SESSION_FILE.exists():
        print(f"No session file at {SESSION_FILE}.")
        print("Run: python tools/ftdna-login.py")
        sys.exit(1)

    targets = args.only or bigy_kits()
    results = load_previous()
    if args.missing:
        targets = [k for k in targets if results.get(k, {}).get("status") != "ok"]
        if not targets:
            print("Every Big Y kit already has its private variants.")
            return
    today = datetime.date.today().isoformat()
    print(f"Fetching private variants for {len(targets)} Big Y kit(s)")

    expired = False
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(storage_state=str(SESSION_FILE))
        page = context.new_page()
        try:
            members = read_members(page)
            for i, kit in enumerate(targets, 1):
                ekit, access = members.get(kit, (None, ""))
                if not ekit:
                    status, variants = "not-in-project", None
                elif access not in ("Limited", "Advanced"):
                    status, variants = "no-access", None
                else:
                    status, variants = fetch_one(context, page, kit, ekit)
                prev = results.get(kit, {})
                if status != "ok" and prev.get("status") == "ok":
                    # Keep the last good list; a transient failure shouldn't erase it.
                    print(f"  [{i}/{len(targets)}] {kit:<10} {status} (keeping {prev['count']} from {prev['fetched']})")
                    continue
                results[kit] = {"status": status, "access": access, "fetched": today}
                if variants is not None:
                    results[kit].update(count=len(variants), variants=variants)
                print(f"  [{i}/{len(targets)}] {kit:<10} {status:<14} {'' if variants is None else len(variants)}")
                save(results)
        except SessionExpired as e:
            print(f"\nSession expired (redirected to {e}).")
            expired = True
        finally:
            browser.close()

    save(results)
    ok = sum(1 for r in results.values() if r["status"] == "ok")
    print(f"\n{ok} kit(s) with private variants → {OUTPUT}")
    if expired:
        print("Re-run: python tools/ftdna-login.py, then this script.")
        sys.exit(2)


if __name__ == "__main__":
    main()
