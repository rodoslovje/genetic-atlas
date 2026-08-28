# Slovenian Genetic Atlas

Interactive web application and data tooling for the **Slovenian Genetic Atlas** (Slovenski genetski atlas), a project of the Slovenian Genealogical Society in cooperation with FamilyTreeDNA. The app visualises Y-DNA and mtDNA results contributed by the Slovenian community on three views — an interactive map, a Y-DNA haplotree, and an mtDNA haplotree.

## ✨ Features

- **Map view** with two-ring jitter that spreads markers sharing the same address so individual haplogroup colours stay visible.
- **Y-DNA & mtDNA tree views** rendered with D3, including era bands, lineage filters, prominent-tester highlighting, and SVG export.
- **Haplogroup-aware search** across kit, surname, ancestor, location, and the full ancestry chain (a search for an upstream SNP matches every downstream tester).
- **Filterable lineages** with persistent state in the URL; "Ungrouped" is an opt-in filter and is intentionally not persisted.
- **Localisation** in seven languages — Slovenian, English, Croatian, French, German, Italian, Hungarian — with a single i18n key for every translatable string and `{key}` placeholder substitution.
- **PNG / SVG export** of the current view, complete with branded header and source attribution.

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

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
