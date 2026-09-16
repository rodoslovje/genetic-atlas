# Slovenian Genetic Atlas — working notes

Vite app that visualises the Y-DNA and mtDNA results of the FamilyTreeDNA
*Slovenian Origin* project on three views: a Leaflet map and two D3 lineage
trees, each of which can also be drawn as a block tree. Python tools under
`tools/` turn FamilyTreeDNA exports into the JSON the app reads. `README.md`
documents the data pipeline; this file is about working on the code.

```bash
npm run dev      # dev server on :35453
npm run build    # dist/ + a copy of data/output
npm run format   # prettier over src/**/*.js
```

`data/` is a symlink to an external store and is never committed.

## Layout

| Path | What lives there |
|---|---|
| `index.html` | the app shell: navbar, view container, panel, floating buttons, footer |
| `guide/index.html`, `changelog/index.html` | the two standalone document pages, at `/guide/` and `/changelog/` (see below) |
| `src/main.js` | routing, language switching, export, the footer |
| `src/shared.js` | app state, data loading, filters, tooltips, URL state |
| `src/i18n.js` | translation loading and `translate()`; no app dependencies |
| `src/map.js`, `src/tree.js`, `src/blocktree.js`, `src/lineage.js` | the three views |
| `src/content/` | User Guide and Changelog text, one file per language |
| `src/pages/page.js` | renderer for both document pages |
| `src/style/` | `srd-tokens.css` → `srd.css` (shared components) → `style.css` (app) / `page.css` (document pages) |

`srd-tokens.css` and `srd.css` are shared verbatim with
`rodoslovje/genealogical-index`; keep changes to them portable, and put
Atlas-only rules in `style.css`.

## Conventions

- **Every user-visible string is a translation key.** `src/i18n/en.json` is the
  source of record; the other six (`sl`, `hr`, `de`, `it`, `fr`, `hu`) follow.
  Use `t("key")` in the app, `data-i18n` / `data-i18n-html` /
  `data-i18n-title` / `data-i18n-placeholder` in HTML. A missing key falls back
  to the English bundle, so a locale may lag — but never add a string without a
  key.
- **The address bar is the state.** View, search, lineage filters, zoom, block
  tree mode and root all round-trip through `updateURLState()`, so any view can
  be shared as a link. New state that a reader would expect to survive a reload
  belongs there too.
- The Y-DNA and mtDNA views mirror each other; their per-view state comes in
  `y`/`mt` pairs (`blockStateKeys()`), and shared drawing code takes `kind`.

## User Guide and Changelog

Both are standalone pages that open in a new tab — `/guide/` and
`/changelog/`, linked from the footer — rather than dialogs over the app, so
a reader's search, tree or block tree is still there when they close the tab.
Content lives in `src/content/guide/<lang>.js` and
`src/content/changelog/<lang>.js` and is rendered by `src/pages/page.js`, which
picks the language from `?lang=` (passed by the footer links), then the stored
preference, then the browser. **English is the source of record**: a language
with no file falls back to English whole, and a changelog date a translation
lacks falls back entry by entry, so a new release shows before it is translated.

All seven languages are written. The guide is translated in full; the changelog
is translated for the entries inside the three-month window the page shows, and
older entries live on only in `en.js`.

**Keep both current as part of the change that needs them — not afterwards.**
When a change alters what a user sees or can do:

1. **Update the User Guide** in `src/content/guide/en.js`, then the other
   languages once they exist. Check each claim against the code rather than the
   previous wording — instructions that no longer match the app are worse than
   missing ones.
2. **Add a Changelog entry** under today's date in
   `src/content/changelog/en.js`, newest first, then translate it. Write it for
   a genealogist, not a developer: what they can now do and why it helps, in one
   to three sentences. The page shows only the **last three months**, counted
   back from the newest entry (`WINDOW_MONTHS` in `src/pages/page.js`); older
   entries stay in the file as the record of what shipped when, and only the
   ones still inside the window need translating.
3. **Features and functionality only.** Bug fixes, refactors, data refreshes,
   performance work with no visible effect and tooling changes get no entry. A
   fix earns one only when it restores something users had noticed was broken.
4. **A new user-visible string still needs its `en.json` key**, and the guide
   should name the control by exactly the English wording the app shows.

Purely internal work — the Python tools, build changes, code moved between
modules — needs neither. When it is unclear whether a change is user-visible,
ask rather than guessing.
