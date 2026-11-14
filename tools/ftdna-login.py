"""
Bootstraps an authenticated FamilyTreeDNA admin (GAP) session that
ftdna-download-csv.py can reuse. Run once, and again whenever the saved
session expires.

Usage:
    python tools/ftdna-login.py              # window if there is a display, else --password
    python tools/ftdna-login.py --password   # type kit number + password in the terminal
    python tools/ftdna-login.py --cookie     # paste the Cookie header from another computer
    python tools/ftdna-login.py --remote   # headless browser driven over an ssh tunnel

Window mode (default when DISPLAY or WAYLAND_DISPLAY is set):
    1. Opens Chromium with a visible window on https://gap.familytreedna.com/.
    2. You sign in manually (password, MFA, captcha — whatever FTDNA asks for).
    3. When the GAP dashboard is visible, return to the terminal and press Enter.
    4. The script writes .ftdna-session.json (gitignored) with the cookies +
       localStorage of the authenticated context.

Password mode (default without a display, e.g. over ssh):
    Asks for the kit number / username and password (or reads FTDNA_USER and
    FTDNA_PASSWORD), fills in the sign-in form in a headless browser and, if
    FTDNA asks for a verification code, asks for that too. If FTDNA shows a
    captcha or the form changes, fall back to --cookie.

Cookie mode (--cookie):
    1. On any computer, sign in at https://gap.familytreedna.com/ in Chrome.
    2. Open DevTools (Cmd-Opt-I) → Network, reload the page, click the first
       request (gap.familytreedna.com), and under Request Headers copy the
       value of "Cookie" (right-click → Copy value).
    3. Paste it at the prompt. The cookies are HttpOnly, so document.cookie in
       the console does not show them — it has to be the request header.
    The script checks that the cookies open GAP before saving them.

Remote mode (--remote):
    Chromium runs headless with DevTools on 127.0.0.1:9222 of this machine.
        ssh -L 9222:localhost:9222 <this host>
        Chrome → chrome://inspect → Configure… → add localhost:9222
        → under Remote Target click "inspect" on the FamilyTreeDNA page
    Sign in in the live page shown there, then press Enter here.

Requirements:
    pip install playwright
    playwright install chromium
"""

import argparse
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

SESSION_FILE = Path(".ftdna-session.json")
LOGIN_URL = "https://gap.familytreedna.com/"
DEBUG_PORT = 9222
TIMEOUT = 60_000


def looks_like_login(url):
    u = url.lower()
    return "login" in u or "signin" in u or "sign-in" in u


def wait_for_enter(browser):
    print()
    print("When you see the GAP admin dashboard, return here and press Enter.")
    print("(Ctrl-C to abort without saving.)")
    try:
        input()
    except (KeyboardInterrupt, EOFError):
        print("Aborted.")
        browser.close()
        sys.exit(1)


def parse_cookie_header(text):
    """'Cookie: a=1; b=2' (or just 'a=1; b=2') → Playwright cookie dicts."""
    text = text.strip()
    if text.lower().startswith("cookie:"):
        text = text[len("cookie:"):]
    cookies = []
    for part in text.split(";"):
        name, sep, value = part.strip().partition("=")
        if not sep or not name:
            continue
        # The header does not say which host set each cookie; the parent domain
        # sends them to both gap. and www.familytreedna.com.
        cookies.append({
            "name": name, "value": value, "domain": ".familytreedna.com", "path": "/",
            "httpOnly": True, "secure": True, "sameSite": "Lax",
        })
    return cookies


def cookie_login(p):
    print(__doc__.split("Cookie mode")[1].split("Remote mode")[0].split(":", 1)[1].rstrip())
    print()
    try:
        import readline  # noqa: F401 — lifts the terminal's 4 KB line limit for long pastes
    except ImportError:
        pass
    try:
        header = input("Cookie: ")
    except (KeyboardInterrupt, EOFError):
        print("\nAborted.")
        sys.exit(1)
    cookies = parse_cookie_header(header)
    if not cookies:
        print("No cookies found in what was pasted.")
        sys.exit(1)

    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    context.add_cookies(cookies)
    page = context.new_page()
    try:
        page.goto(LOGIN_URL, timeout=TIMEOUT)
        page.wait_for_load_state("networkidle", timeout=TIMEOUT)
    except Exception as e:
        print(f"Could not open GAP: {e}")
        browser.close()
        sys.exit(1)
    if looks_like_login(page.url):
        print(f"FTDNA still asks for a sign-in ({page.url}) — the cookies are incomplete or expired.")
        browser.close()
        sys.exit(1)
    print(f"Signed in: {page.title()}")
    return browser, context


def password_login(p):
    import getpass
    user = os.environ.get("FTDNA_USER") or input("FTDNA kit number / username: ").strip()
    password = os.environ.get("FTDNA_PASSWORD") or getpass.getpass("Password: ")
    if not user or not password:
        print("Kit number and password are both needed.")
        sys.exit(1)

    browser = p.chromium.launch(headless=True, channel="chromium")
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto(LOGIN_URL, timeout=TIMEOUT)
    page.wait_for_load_state("networkidle", timeout=TIMEOUT)
    if not looks_like_login(page.url):
        print("Not asked to sign in — saving the session as it is.")
        return browser, context

    try:
        page.fill("#kitnum-input", user)
        page.fill("#password-input", password)
        page.click("#sign-in-btn")
    except Exception as e:
        print(f"The sign-in form has changed ({e}) — use --cookie instead.")
        browser.close()
        sys.exit(1)

    # Either we leave the sign-in page, or FTDNA shows an error / asks for a code.
    for _ in range(3):
        try:
            page.wait_for_url(lambda url: not looks_like_login(url), timeout=20_000)
            break
        except Exception:
            pass
        code_input = page.query_selector(
            "input[autocomplete='one-time-code'], input[name*='code' i], input[id*='code' i]")
        if code_input and code_input.is_visible():
            code = input("Verification code from FTDNA: ").strip()
            code_input.fill(code)
            code_input.press("Enter")
            continue
        error = page.query_selector(".alert, .error, .text-danger, [role='alert']")
        msg = error.inner_text().strip() if error and error.is_visible() else ""
        print(f"Still on the sign-in page{': ' + msg if msg else ''}.")
        if "captcha" in page.content().lower() and page.query_selector("iframe[src*='captcha']"):
            print("FTDNA asks for a captcha — use --cookie instead.")
        browser.close()
        sys.exit(1)

    page.wait_for_load_state("networkidle", timeout=TIMEOUT)
    if looks_like_login(page.url):
        print("Sign-in did not complete — use --cookie instead.")
        browser.close()
        sys.exit(1)
    print(f"Signed in: {page.title()}")
    return browser, context


def browser_login(p, remote):
    if remote:
        # channel="chromium" is the full browser in new headless mode, which
        # sign-in pages treat like a normal Chrome (the headless shell is not).
        browser = p.chromium.launch(
            headless=True,
            channel="chromium",
            args=[f"--remote-debugging-port={DEBUG_PORT}",
                  "--remote-debugging-address=127.0.0.1"],
        )
    else:
        browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto(LOGIN_URL)
    if remote:
        print(f"Chromium is running headless with DevTools on 127.0.0.1:{DEBUG_PORT}.")
        print("On your own computer:")
        print(f"  1. ssh -L {DEBUG_PORT}:localhost:{DEBUG_PORT} <this host>   (keep it open)")
        print(f"  2. Chrome → chrome://inspect → Configure… → add localhost:{DEBUG_PORT}")
        print("  3. Under Remote Target click \"inspect\" on the FamilyTreeDNA page")
        print("     and sign in in the page shown in the DevTools window.")
    else:
        print(f"Opening {LOGIN_URL} — sign in in the browser window.")
    wait_for_enter(browser)
    return browser, context


def main():
    parser = argparse.ArgumentParser(description="Sign in to FamilyTreeDNA GAP and save the session.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--password", action="store_true",
                      help="Type kit number and password in the terminal (headless)")
    mode.add_argument("--cookie", action="store_true",
                      help="Paste the Cookie header from a browser on another computer")
    mode.add_argument("--remote", action="store_true",
                      help=f"Headless browser with DevTools on 127.0.0.1:{DEBUG_PORT} (ssh tunnel)")
    mode.add_argument("--local", action="store_true",
                      help="Visible browser window even if no display is detected")
    args = parser.parse_args()
    has_display = bool(os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY"))
    use_password = args.password or not (args.cookie or args.remote or args.local or has_display)

    with sync_playwright() as p:
        if use_password:
            browser, context = password_login(p)
        elif args.cookie:
            browser, context = cookie_login(p)
        else:
            browser, context = browser_login(p, args.remote)
        context.storage_state(path=str(SESSION_FILE))
        browser.close()

    print(f"Saved session → {SESSION_FILE}")
    print("This file contains an auth cookie — keep it out of git.")


if __name__ == "__main__":
    main()
