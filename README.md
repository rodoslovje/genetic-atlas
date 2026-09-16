# Slovenian Genetic Atlas

Interactive web application and data tooling for the **Slovenian Genetic Atlas** (Slovenski genetski atlas), a project of the Slovenian Genealogical Society in cooperation with FamilyTreeDNA. The app visualises Y-DNA and mtDNA results contributed by the Slovenian community on three views — an interactive map, a Y-DNA haplotree, and an mtDNA haplotree.

## ✨ Features

- **Map view** with two-ring jitter that spreads markers sharing the same address so individual haplogroup colours stay visible.
- **Y-DNA & mtDNA tree views** rendered with D3, including era bands, lineage filters, prominent-tester highlighting, and SVG export.
- **Block tree**, a second viewing mode of each haplotree view (`?ymode=block`, `?mtmode=block`): an icicle view with time on the vertical axis, showing each branch's TMRCA with its 68 % range, its variants (equivalent SNPs for Y-DNA, the block's mutations for mtDNA), and project members as one column each below their terminal haplogroup. It follows the lineage filter; the search box picks the starting haplogroup (the first split among the matched members' lines) and highlights matches. Any block can be focused by clicking it, from a haplogroup tooltip, or via `?block=R-BY32501` / `?mblock=H5a`; both views export to SVG. The two lineages keep their modes and roots independently.
- **Haplogroup-aware search** across kit, surname, ancestor, location, and the full ancestry chain (a search for an upstream SNP matches every downstream tester).
- **Filterable lineages** with persistent state in the URL; "Ungrouped" is an opt-in filter and is intentionally not persisted.
- **Localisation** in seven languages — Slovenian, English, Croatian, French, German, Italian, Hungarian — with a single i18n key for every translatable string and `{key}` placeholder substitution.
- **PNG / SVG export** of the current view, complete with branded header and source attribution.
- **User Guide and Changelog** as standalone pages (`/guide/`, `/changelog/`), linked from the footer and opened in their own tab. Their text lives in `src/content/{guide,changelog}/<lang>.js`, one file per language with English as the source of record; both are kept in step with the app (see `CLAUDE.md`).

## 🌐 Web Application

Built with Vite, D3.js, and Leaflet.

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## 🛠️ Data Conversion Tools

Python scripts that turn FamilyTreeDNA exports into the JSON consumed by the web app.

### 1. Setup Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r tools/requirements.txt
playwright install chromium
```

### 2. Process Data

Each tool processes both lineages (Y-DNA and mtDNA) by default. Pass `--kind y` or `--kind mt` to limit it to one.

**1a. (One-time) Bootstrap a FamilyTreeDNA admin session:**

```bash
python tools/ftdna-login.py
```

Opens Chromium so you can sign in to GAP manually (including MFA / captcha). When the admin dashboard is visible, return to the terminal and press Enter — the session (cookies + localStorage) is saved to `.ftdna-session.json` (gitignored). Repeat whenever FTDNA expires the session.

**1b. Download the admin CSV exports:**

```bash
python tools/ftdna-download-csv.py             # all four
python tools/ftdna-download-csv.py --only YDNASNP MTDNARESULTS
```

Downloads `PANCESTRY`, `MANCESTRY`, `YDNASNP`, `MTDNARESULTS` into `data/input/` under the filenames FTDNA suggests (the same names you'd get from manual download). If the session has expired the script exits with code 2 and tells you to re-run `ftdna-login.py`.

Generated JSON files land in `data/output/` (which is not tracked in git — `data/` is a symlink to an external store).

**2. Fetch public results from FamilyTreeDNA:**

```bash
python tools/ftdna-fetch-results.py
```

**3. Convert and merge exported CSV into JSON:**

```bash
python tools/ftdna-csv-to-json.py
```

**4. Collect full SNP path for all haplogroups used (incremental update):**

```bash
python tools/ftdna-get-paths.py
```

**Full Rebuild (re-fetch every haplogroup):**

```bash
python tools/ftdna-get-paths.py --mode full
```

**Backfill variant lists (block tree data):**

Each FTDNA response carries the full `variants` list and the 68 % / 99 % TMRCA bounds only for the haplogroup that was requested, while its ancestors arrive with ages and tester counts alone. This pass fetches the nodes that still lack `variants`, most useful first (ancestry of full-sequence testers — Big Y for Y-DNA, FMS for mtDNA — youngest first). On an HTTP 429 the tool waits five minutes and retries the request once before giving up; progress is saved after every successful fetch, so an interrupted run resumes where it stopped. Use `--limit` to stay well under FTDNA's rate limit and re-run until nothing is left:

```bash
python tools/ftdna-get-paths.py --kind y --mode variants --limit 200
python tools/ftdna-get-paths.py --kind mt --mode variants --limit 200
```

The mtDNA payload lists the mutations of the whole ancestral path, each tagged with the haplogroup it belongs to, so only the requested node's own entries are kept.

Every node in `slo-ydna-paths.json` / `slo-mtdna-paths.json` carries:

| Field | Meaning |
|---|---|
| `haplogroup`, `parent`, `note` | tree topology and FTDNA historical-event label |
| `age` | TMRCA mean year (negative = BCE) |
| `age68`, `age99` | `[oldest, youngest]` TMRCA bounds at 68 % / 99 % confidence |
| `placements`, `modern`, `ancient` | FTDNA testers placed directly on the node / anywhere below it / ancient samples below it |
| `variants` | the block's variants — equivalent SNP names for Y-DNA, mutations for mtDNA; only on nodes fetched directly |

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
