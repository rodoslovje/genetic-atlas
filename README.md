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
```

### 2. Process Data

**Convert and merge exported CSV into JSON:**

```bash
python scripts/ydna-csv-to-json.py
```

**Collect full SNP path for all haplogroups used (Incremental Update):**

```bash
python scripts/ydna-get-paths-ftdna.py
```

**Collect full SNP path for all haplogroups used (Full Rebuild):**

```bash
python scripts/ydna-get-paths-ftdna.py --mode full
```

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
