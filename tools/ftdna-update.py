"""
Runs the whole data refresh in one go, calling the other tools in order.

Usage:
    python tools/ftdna-update.py                     # full refresh, both lineages
    python tools/ftdna-update.py --kind y            # paternal only
    python tools/ftdna-update.py --login             # force a fresh sign-in first
    python tools/ftdna-update.py --skip private      # leave out a step (repeatable)
    python tools/ftdna-update.py --paths-mode full   # rebuild the tree from scratch

Steps:
    session   check .ftdna-session.json against GAP; if it is missing or
              expired, run ftdna-login.py (opens Chromium, you sign in, press Enter)
    csv       ftdna-download-csv.py          admin CSV exports
    results   ftdna-fetch-results.py         public results tables
    private   ftdna-get-private-variants.py  Big Y private variants (Y-DNA only)
    convert   ftdna-csv-to-json.py           CSV -> JSON
    paths     ftdna-get-paths.py             new haplogroups + backfill
    recount   ftdna-csv-to-json.py           again, so mtDNA private counts see
                                             the paths of newly arrived haplogroups

A step that needs the admin session and exits with code 2 (session expired)
triggers ftdna-login.py and is retried once. If FTDNA rate limits the paths
step, the refresh still runs recount on what was saved and exits with code 2;
re-run later with --skip session csv results private convert to finish the
backfill.

Any other failure stops the run, so the converter never runs on half-downloaded
inputs.
"""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
SESSION_FILE = ROOT / ".ftdna-session.json"
PROBE_URL = "https://gap.familytreedna.com/member-information.aspx"
TIMEOUT = 60_000

STEPS = ["session", "csv", "results", "private", "convert", "paths", "recount"]
CSV_KEYS = {"y": ["PANCESTRY", "YDNASNP"], "mt": ["MANCESTRY", "MTDNARESULTS"]}
SESSION_EXPIRED = 2


def looks_like_login(url):
    u = url.lower()
    return "login" in u or "signin" in u or "sign-in" in u


def session_valid():
    """True when the saved session still opens a GAP admin page."""
    if not SESSION_FILE.exists():
        return False
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(storage_state=str(SESSION_FILE))
        page = context.new_page()
        try:
            page.goto(PROBE_URL, timeout=TIMEOUT)
            page.wait_for_load_state("networkidle", timeout=TIMEOUT)
            return not looks_like_login(page.url)
        except Exception as e:
            print(f"  session check failed: {e}")
            return False
        finally:
            browser.close()


def run(script, *args):
    cmd = [sys.executable, str(TOOLS / script), *args]
    print(f"\n$ {' '.join(['python', 'tools/' + script, *args])}", flush=True)
    return subprocess.run(cmd, cwd=ROOT).returncode


def login():
    if run("ftdna-login.py") != 0:
        print("\nLogin aborted — stopping.")
        sys.exit(1)


def run_with_session(script, *args):
    """Runs a step that needs the admin session, signing in again once if it expired."""
    code = run(script, *args)
    if code == SESSION_EXPIRED:
        print("\nSession expired — signing in again.")
        login()
        code = run(script, *args)
    return code


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--kind", choices=["y", "mt"], default=None,
                        help="Lineage to process (omit to process both)")
    parser.add_argument("--login", action="store_true",
                        help="Sign in again even if the saved session still works")
    parser.add_argument("--skip", nargs="+", choices=STEPS, default=[], metavar="STEP",
                        help=f"Steps to leave out: {', '.join(STEPS)}")
    parser.add_argument("--paths-mode", choices=["update", "full", "ancient"], default="update",
                        help="Mode passed to ftdna-get-paths.py (default: update)")
    parser.add_argument("--limit", type=int, default=0,
                        help="Request limit per lineage passed to ftdna-get-paths.py")
    args = parser.parse_args()

    kinds = [args.kind] if args.kind else ["y", "mt"]
    kind_args = ["--kind", args.kind] if args.kind else []
    todo = [s for s in STEPS if s not in args.skip]
    if "y" not in kinds and "private" in todo:
        todo.remove("private")
    print(f"Steps: {', '.join(todo)}")

    def require(step, code):
        if code != 0:
            print(f"\nStep '{step}' failed (exit {code}) — stopping.")
            sys.exit(code)

    if "session" in todo:
        print("\nChecking the FamilyTreeDNA admin session…")
        if args.login or not session_valid():
            print("  no valid session — opening the sign-in window.")
            login()
        else:
            print("  session is valid.")

    if "csv" in todo:
        keys = [k for kind in kinds for k in CSV_KEYS[kind]]
        require("csv", run_with_session("ftdna-download-csv.py", "--only", *keys))

    if "results" in todo:
        require("results", run("ftdna-fetch-results.py", *kind_args))

    if "private" in todo:
        require("private", run_with_session("ftdna-get-private-variants.py"))

    if "convert" in todo:
        require("convert", run("ftdna-csv-to-json.py", *kind_args))

    rate_limited = False
    if "paths" in todo:
        paths_args = [*kind_args, "--mode", args.paths_mode]
        if args.limit:
            paths_args += ["--limit", str(args.limit)]
        code = run("ftdna-get-paths.py", *paths_args)
        if code == 2:
            rate_limited = True
            print("\nFTDNA is rate limiting — continuing with what was saved.")
        else:
            require("paths", code)

    if "recount" in todo:
        require("recount", run("ftdna-csv-to-json.py", *kind_args))

    if rate_limited:
        print("\nDone, but the paths backfill is incomplete. In about an hour run:")
        print(f"  python tools/ftdna-update.py --skip session csv results private convert{' --kind ' + args.kind if args.kind else ''}")
        sys.exit(2)
    print("\nFull update done.")


if __name__ == "__main__":
    main()
