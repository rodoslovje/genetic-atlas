/* =============================================================
 * Renderer for the two standalone pages, /guide/ and /changelog/.
 *
 * They are separate pages rather than dialogs inside the Atlas so
 * that whatever the reader was looking at — a search, a tree, a
 * block tree — is still there when they close the tab, and so both
 * have a URL that can be shared.
 *
 * Content lives in ../content/{guide,changelog}/<lang>.js, one file
 * per language, lazy-loaded here. English is the source of record
 * and the fallback for every language that hasn't caught up yet.
 * ============================================================= */

import { translations, loadTranslation, preferredLang, translate } from "../i18n.js";

const GUIDES = import.meta.glob("../content/guide/*.js", { import: "default" });
const CHANGELOGS = import.meta.glob("../content/changelog/*.js", { import: "default" });

/** ?lang= (what the Atlas's own footer links pass, so a reader stays in the
 *  language they were just reading) → the stored preference → the browser. */
function wantedLang() {
    const asked = new URLSearchParams(window.location.search).get("lang");
    return asked || preferredLang();
}

/** Loads one globbed content module, or null when that language has no
 *  translation yet — an expected state, not an error. */
async function load(map, dir, lang) {
    const loader = map[`../content/${dir}/${lang}.js`];
    if (!loader) return null;
    try {
        return await loader();
    } catch (err) {
        console.warn(`Could not load the ${dir} in "${lang}", falling back to English.`, err);
        return null;
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** The guide as a heading, an intro and one section per topic. Section bodies
 *  are our own HTML, so they go in as written. */
function renderGuide(guide) {
    const sections = guide.sections.map(s => `
      <section class="page-section" id="${escapeHtml(s.id)}">
        <h2>${escapeHtml(s.heading)}</h2>
        ${s.body}
      </section>`).join("\n");

    return `
      <h1>${escapeHtml(guide.title)}</h1>
      ${guide.intro ? `<p class="page-intro">${guide.intro}</p>` : ""}
      ${sections}`;
}

/** The contents, which live in their own column beside the guide. */
function renderToc(guide) {
    const items = guide.sections
        .map(s => `<li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.heading)}</a></li>`)
        .join("\n");
    return `<ul>${items}</ul>`;
}

/** Marks the entry for whichever section is currently at the top of the
 *  screen, so a reader of a long guide can see where they are. The band is the
 *  top quarter of the viewport: a section entering it — scrolling either way —
 *  becomes the current one. */
function trackReadingPosition() {
    const links = Array.from(document.querySelectorAll(".page-toc a"));
    const sections = Array.from(document.querySelectorAll(".page-section"));
    if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const href = `#${entry.target.id}`;
            links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === href));
        }
    }, { rootMargin: "0px 0px -75% 0px" });

    sections.forEach(s => observer.observe(s));
}

/** Merges a translated changelog over the English one: entries are matched by
 *  date and items by position, so a release that hasn't been translated yet
 *  still shows — in English — instead of disappearing from the page. */
function mergeChangelog(base, translated) {
    if (!translated || !translated.entries || !translated.entries.length) return base;
    const byDate = new Map(translated.entries.map(e => [e.date, e]));
    return {
        title: translated.title || base.title,
        intro: translated.intro || base.intro,
        entries: base.entries.map(entry => {
            const t = byDate.get(entry.date);
            if (!t) return entry;
            return { ...entry, items: entry.items.map((item, i) => t.items?.[i] || item) };
        }),
    };
}

// The page shows the last three months of releases — enough for a returning
// reader to see what is new, without the whole history of the project. Older
// entries stay in the content file (and in the project's git history); they
// simply stop being drawn once they fall out of the window.
const WINDOW_MONTHS = 3;

/** The window is measured back from the newest entry rather than from today, so
 *  the changelog never empties out during a quiet stretch between releases. */
function recentEntries(entries) {
    if (!entries.length) return entries;
    const asDate = (e) => new Date(`${e.date}T00:00:00Z`);
    const cutoff = new Date(Math.max(...entries.map(e => asDate(e).getTime())));
    cutoff.setUTCMonth(cutoff.getUTCMonth() - WINDOW_MONTHS);
    return entries.filter(e => asDate(e) >= cutoff);
}

function renderChangelog(changelog) {
    const entries = recentEntries(changelog.entries).map(({ date, items }) => {
        const lis = items.map(it => `<li><strong>${it.title}</strong> — ${it.text}</li>`).join("\n");
        return `
      <section class="changelog-entry">
        <h2 class="changelog-date">${escapeHtml(date)}</h2>
        <ul>${lis}</ul>
      </section>`;
    }).join("\n");

    return `
      <h1>${escapeHtml(changelog.title)}</h1>
      ${changelog.intro ? `<p class="page-intro">${changelog.intro}</p>` : ""}
      ${entries}`;
}

/** Translates the page chrome — brand, back link, footer links — the same way
 *  main.js does for the app, and stamps the build / data dates into the footer. */
function applyChrome(dict, pageTitle) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) el.innerText = el.classList.contains("page-back")
            ? `← ${translate(dict, key)}`
            : translate(dict, key);
    });

    document.title = `${pageTitle} - ${translate(dict, "brand")}`;

    const formatDate = (iso) => iso.slice(0, 10);
    const versionEl = document.getElementById("footer-version");
    const dataEl = document.getElementById("footer-data");
    if (versionEl) versionEl.innerText = translate(dict, "versionLabel", formatDate(__BUILD_DATE__));
    if (dataEl) dataEl.innerText = translate(dict, "dataUpdateLabel", formatDate(__DATA_DATE__));

    localizePageLinks(document);
}

/** Keeps the reader's language when they move between the two pages — in the
 *  footer and in any link the content itself makes to the other page. Safe to
 *  run twice: the existing query is replaced, not appended to. */
function localizePageLinks(root) {
    const lang = document.documentElement.lang;
    root.querySelectorAll('a[href^="/guide/"], a[href^="/changelog/"]').forEach(el => {
        el.href = `${el.getAttribute("href").split("?")[0]}?lang=${encodeURIComponent(lang)}`;
    });
}

async function main() {
    const container = document.getElementById("page-content");
    const page = document.body.dataset.page;
    if (!container || !page) return;

    const lang = wantedLang();
    const dict = (await loadTranslation(lang)) || translations.en;
    document.documentElement.lang = translations[lang] ? lang : "en";

    if (page === "guide") {
        const guide = (await load(GUIDES, "guide", lang)) || (await load(GUIDES, "guide", "en"));
        applyChrome(dict, translate(dict, "userGuide"));
        container.innerHTML = renderGuide(guide);
        const toc = document.getElementById("page-toc");
        if (toc) toc.innerHTML = renderToc(guide);
        trackReadingPosition();
    } else {
        const en = await load(CHANGELOGS, "changelog", "en");
        const translated = lang === "en" ? null : await load(CHANGELOGS, "changelog", lang);
        applyChrome(dict, translate(dict, "changelog"));
        container.innerHTML = renderChangelog(mergeChangelog(en, translated));
    }

    // The content is in place only now, so its own cross-page links are done here.
    localizePageLinks(container);
}

main().catch(err => console.error("Could not render the page.", err));
