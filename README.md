# Slovenian Genetic Atlas

Interactive web application and data tooling for the **Slovenian Genetic Atlas** (Slovenski genetski atlas), a project of the Slovenian Genealogical Society in cooperation with FamilyTreeDNA. The app visualises Y-DNA and mtDNA results contributed by the Slovenian community on three views — an interactive map, a Y-DNA haplotree, and an mtDNA haplotree.

## ✨ Features

- **Map view** with two-ring jitter that spreads markers sharing the same address so individual haplogroup colours stay visible.
- **Y-DNA & mtDNA tree views** rendered with D3, including era bands, lineage filters, prominent-tester highlighting, and SVG export.
- **Haplogroup-aware search** across kit, surname, ancestor, location, and the full ancestry chain (a search for an upstream SNP matches every downstream tester).
- **Filterable lineages** with persistent state in the URL; "Ungrouped" is an opt-in filter and is intentionally not persisted.
- **Localisation** in six languages — Slovenian, English, Croatian, German, Italian, Hungarian — with a single i18n key for every translatable string and `{key}` placeholder substitution.
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

**1. Download the latest data from the Slovenian Genetic Atlas admin interface on FamilyTreeDNA and put it into the `data/input/` folder.**

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
