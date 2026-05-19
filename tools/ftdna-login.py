"""
Bootstraps an authenticated FamilyTreeDNA admin (GAP) session that
ftdna-download-csv.py can reuse. Run once, and again whenever the saved
session expires.

Usage:
    python tools/ftdna-login.py

Flow:
    1. Opens Chromium with a visible window.
    2. Navigates to https://gap.familytreedna.com/.
    3. You sign in manually (password, MFA, captcha — whatever FTDNA asks for).
    4. When the GAP dashboard is visible, return to the terminal and press Enter.
    5. The script writes .ftdna-session.json (gitignored) with the cookies +
       localStorage of the authenticated context.

Requirements:
    pip install playwright
    playwright install chromium
"""

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

SESSION_FILE = Path(".ftdna-session.json")
LOGIN_URL = "https://gap.familytreedna.com/"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        print(f"Opening {LOGIN_URL} — sign in in the browser window.")
        page.goto(LOGIN_URL)

        print()
        print("When you see the GAP admin dashboard, return here and press Enter.")
        print("(Ctrl-C to abort without saving.)")
        try:
            input()
        except (KeyboardInterrupt, EOFError):
            print("Aborted.")
            browser.close()
            sys.exit(1)

        context.storage_state(path=str(SESSION_FILE))
        browser.close()

    print(f"Saved session → {SESSION_FILE}")
    print("This file contains an auth cookie — keep it out of git.")


if __name__ == "__main__":
    main()
