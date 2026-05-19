# Slovenian Origin - FamilyTreeDNA Web & Tools

This repository contains the web application and data conversion tools for the **Slovenian Origin** project at FamilyTreeDNA. It includes an interactive frontend for visualizing Y-DNA and mtDNA data, as well as Python scripts to convert FamilyTreeDNA CSV exports into a web-friendly JSON format.

## 🌐 Web Application

The frontend is built using Vite, D3.js, and Leaflet.

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

These Python tools are used to process FamilyTreeDNA exported data for the web application.

### 1. Setup Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r tools/requirements.txt
playwright install chromium
```

### 2. Process Data

Each tool processes both lineages (Y-DNA and mtDNA) by default. Pass `--kind y` or `--kind mt` to limit it to one.

**1. Download latest data from Slovenian Origin admin interface on FamilyTreeDNA and put it into the `data/input/` folder.**

Generated JSON files land in `data/output/` (which is not tracked in git — `data/` is a symlink to an external store).

**2. Fetch public results from FamilyTreeDNA:**

```bash
python tools/ftdna-fetch-results.py
```

**3. Convert and merge exported CSV into JSON:**

```bash
python tools/ftdna-csv-to-json.py
```

**4. Collect full SNP path for all haplogroups used (Incremental Update):**

```bash
python tools/ftdna-get-paths.py
```

**Full Rebuild (re-fetch every haplogroup):**

```bash
python tools/ftdna-get-paths.py --mode full
```

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
