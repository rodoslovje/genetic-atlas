"""
Fetches the mtDNA results table from the FamilyTreeDNA public project page
and saves it as a CSV file. Iterates through all pages.

Requirements:
    pip install playwright
    playwright install chromium
"""

import csv
import re
import sys
from playwright.sync_api import sync_playwright

URL = "https://www.familytreedna.com/public/Slovenianorigin?iframe=mtresults"
OUTPUT = "input/slo-mtdna-fetched.csv"
TIMEOUT = 60_000  # ms
PAGE_SETTLE_MS = 4000  # wait after clicking a page button


def extract_headers(page):
    return page.evaluate(
        """() => {
        return Array.from(document.querySelectorAll('table thead tr th')).map(th => {
            const child = th.querySelector('span, a, button');
            return (child ? child.textContent : th.textContent).trim().split('\\n')[0].trim();
        }).filter(t => t);
    }"""
    )


def extract_rows(page):
    return page.evaluate(
        """() => {
        const rows = [];
        let currentGroup = '';
        for (const tr of document.querySelectorAll('table tbody tr')) {
            const tds = tr.querySelectorAll('td');
            if (tds.length === 0) continue;  // column header rows (<th> only)
            // Group header: single <td> with colspan (e.g. "H haplogroup")
            if (tds.length === 1 && tds[0].getAttribute('colspan')) {
                const text = tds[0].textContent.trim();
                if (text) currentGroup = text.split(/\\s+/)[0];
                continue;
            }
            const cells = Array.from(tds).map(td => td.textContent.trim().replace(/\\s+/g, ' '));
            const first = cells[0] || '';
            if (!first || first.includes(' ') || first === 'Min' || first === 'Max' || first === 'Mode') continue;
            rows.push([...cells, currentGroup]);
        }
        return rows;
    }"""
    )


def get_total_pages(page):
    body = page.locator("body").inner_text()
    m = re.search(r"of\s+(\d+)", body, re.IGNORECASE)
    return int(m.group(1)) if m else 1


def click_page(page, num):
    dismiss_cookie_banner(page)
    btn = page.locator(f"a:text-is('{num}'), button:text-is('{num}')")
    visible = [el for el in btn.all() if el.is_visible()]
    if not visible:
        print(f"  No button found for page {num}")
        return False
    visible[0].click()
    page.wait_for_timeout(PAGE_SETTLE_MS)
    return True


def dismiss_cookie_banner(page):
    """Remove cookie consent overlay so it doesn't intercept clicks."""
    page.evaluate(
        """() => {
        const banner = document.querySelector('.cky-consent-container');
        if (banner) banner.remove();
    }"""
    )


def fetch_all(headless=True):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        pg = browser.new_page()

        print(f"Loading {URL} ...")
        pg.goto(URL, timeout=TIMEOUT)
        pg.wait_for_selector("table tbody tr", timeout=TIMEOUT)
        pg.wait_for_timeout(2000)
        dismiss_cookie_banner(pg)

        total = get_total_pages(pg)
        print(f"Total pages: {total}")

        headers = extract_headers(pg)
        # Insert "Group" before "Haplogroup"
        group_idx = (
            headers.index("Haplogroup") if "Haplogroup" in headers else len(headers)
        )
        headers.insert(group_idx, "Group")
        print(f"Columns: {len(headers)}")

        def reorder(rows):
            result = []
            for row in rows:
                group = row.pop()
                row.insert(group_idx, group)
                result.append(row)
            return result

        all_rows = []
        rows = reorder(extract_rows(pg))
        print(f"  Page 1: {len(rows)} rows")
        all_rows.extend(rows)

        for page_num in range(2, total + 1):
            print(f"  Clicking page {page_num} ...")
            if not click_page(pg, page_num):
                break
            rows = reorder(extract_rows(pg))
            print(f"  Page {page_num}: {len(rows)} rows")
            all_rows.extend(rows)

        browser.close()
        return headers, all_rows


def main():
    headers, rows = fetch_all()

    if not rows:
        print("No data rows found.")
        sys.exit(1)

    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"Saved {len(rows)} rows → {OUTPUT}")


if __name__ == "__main__":
    main()
