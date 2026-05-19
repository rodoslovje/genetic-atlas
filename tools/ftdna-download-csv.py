"""
Downloads admin CSV exports from the FamilyTreeDNA admin panel (GAP) using a
session captured by ftdna-login.py.

Usage:
    python tools/ftdna-download-csv.py                       # download all four
    python tools/ftdna-download-csv.py --only YDNASNP MTDNARESULTS

Each file is saved to data/input/ under the filename FTDNA suggests, so
ftdna-csv-to-json.py picks them up the same way it does with manual downloads.

If the saved session has expired, FTDNA redirects to login and the script
aborts with a clear message — re-run tools/ftdna-login.py and try again.

Requirements:
    pip install playwright
    playwright install chromium
"""

import argparse
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

SESSION_FILE = Path(".ftdna-session.json")
INPUT_DIR = Path("data/input")

DOWNLOAD_KEYS = ["PANCESTRY", "MANCESTRY", "YDNASNP", "MTDNARESULTS"]
BASE_URL = "https://gap.familytreedna.com/download-files.aspx?download={key}"
TIMEOUT = 60_000


def looks_like_login(url):
    u = url.lower()
    return "login" in u or "signin" in u or "sign-in" in u


def download_one(context, key):
    url = BASE_URL.format(key=key)
    page = context.new_page()
    try:
        with page.expect_download(timeout=TIMEOUT) as dl_info:
            # page.goto raises "Download is starting" when the URL serves a file
            # directly rather than an HTML page. The download event still fires.
            try:
                page.goto(url, timeout=TIMEOUT)
            except Exception as nav_err:
                if "Download is starting" not in str(nav_err):
                    raise
        download = dl_info.value
        dest = INPUT_DIR / download.suggested_filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        download.save_as(str(dest))
        print(f"  {key:<14} → {dest}")
        return True, False
    except PWTimeout:
        if looks_like_login(page.url):
            print(f"  {key:<14} session expired (redirected to {page.url})")
            return False, True
        print(f"  {key:<14} timed out waiting for download (url={page.url})")
        return False, False
    except Exception as e:
        print(f"  {key:<14} failed: {e}")
        return False, False
    finally:
        page.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument(
        "--only",
        nargs="+",
        choices=DOWNLOAD_KEYS,
        help="Subset of download keys to fetch (default: all four).",
    )
    args = parser.parse_args()

    if not SESSION_FILE.exists():
        print(f"No session file at {SESSION_FILE}.")
        print("Run: python tools/ftdna-login.py")
        sys.exit(1)

    targets = args.only or DOWNLOAD_KEYS
    print(f"Downloading {len(targets)} file(s) → {INPUT_DIR}/")

    expired = False
    failed = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(storage_state=str(SESSION_FILE), accept_downloads=True)

        for key in targets:
            ok, was_expired = download_one(context, key)
            if was_expired:
                expired = True
                break
            if not ok:
                failed.append(key)

        browser.close()

    if expired:
        print("\nSession expired — re-run: python tools/ftdna-login.py")
        sys.exit(2)
    if failed:
        print(f"\nFailed: {', '.join(failed)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
