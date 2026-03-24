# Spletna stran in orodja za pretvorbo Slovenian Origin projekta iz FTDNA

## Spletna predstavitev

### Install

yarn install

### Run local test server

yarn dev

### Build production version

yarn build

## Orodja za pretvorbo Slovenian Origin FTDNA podatkov za prikaz na spletni strani

### Pripravi virtualno delovno okolje (.venv)

python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt

### Pretvorba testiranih iz CSV (copy&paste iz FTDNA) v JSON

python scripts/ydna-csv-to-json.py

### Pobiranje celotne SNP poti iz FTDNA za vse končne SNP (update)

python scripts/ydna-get-paths-ftdna.py

### Pobiranje celotne SNP poti iz FTDNA za vse končne SNP (full rebuild)

python scripts/ydna-get-paths-ftdna.py --mode full
