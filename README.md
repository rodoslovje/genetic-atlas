# Slovenian Origin - FamilyTreeDNA Web & Tools

This repository contains the web application and data conversion tools for the **Slovenian Origin** project at FamilyTreeDNA. It includes an interactive frontend for visualizing Y-DNA and mtDNA data, as well as Python scripts to convert FamilyTreeDNA CSV exports into a web-friendly JSON format.

## 🌐 Web Application

The frontend is built using Vite, D3.js, and Leaflet.

### Installation

```bash
yarn install
```

### Development Server

```bash
yarn dev
```

### Production Build

```bash
yarn build
```

## 🛠️ Data Conversion Tools

These Python scripts process FamilyTreeDNA exported data for the web application.

### 1. Setup Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
playwright install chromium
```

### 2. Process Data

**1. Download latest data from Slovenian Origin admin interface on FamilyTreeDNA and put it into `input/` folder.**

**2. Fetch public results from FamilyTreeDNA:**

```bash
python scripts/ydna-fetch-results.py
python scripts/mtdna-fetch-results.py
```

**2. Convert and merge exported CSV into JSON:**

```bash
python scripts/ydna-csv-to-json.py
python scripts/mtdna-csv-to-json.py
```

**Collect full SNP path for all haplogroups used (Incremental Update):**

```bash
python scripts/ydna-get-paths-ftdna.py
python scripts/mtdna-get-paths-ftdna.py
```

**Collect full SNP path for all haplogroups used (Full Rebuild):**

```bash
python scripts/ydna-get-paths-ftdna.py --mode full
python scripts/mtdna-get-paths-ftdna.py --mode full
```

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
