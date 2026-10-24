"""
Converts FTDNA project CSV exports + scraped data into a single JSON file
for the Y-DNA and/or mtDNA visualisation.

Usage:
    python tools/ftdna-csv-to-json.py            # both lineages
    python tools/ftdna-csv-to-json.py --kind y   # paternal only
    python tools/ftdna-csv-to-json.py --kind mt  # maternal only
"""

import argparse
import glob
import json
import os
import re
import sys
import pandas as pd

CONFIGS = {
    "y": {
        "input_glob": "data/input/Slovenianorigin_Paternal_Ancestry_*.csv",
        "input_fetched": "data/input/slo-ydna-fetched.csv",
        "input_snp": "data/input/Slovenianorigin_YDNA_Haplogroups_Report.csv",
        "output": "data/output/slo-ydna.json",
        "ancestor_col": "Paternal Ancestor Name",
        "primary_name_alias": "Name_ydna",
        # Extra columns pulled from the fetched CSV: source -> renamed
        "fetched_extra": {"Test": "test"},
        # Extra columns pulled from the SNP CSV: source -> renamed
        "snp_extra": {},
        # Big Y private variant counts from ftdna-get-private-variants.py (optional).
        "input_private": "data/input/slo-big-y-private.json",
        # Priority list of columns to use for the final 'haplogroup' field.
        # First non-empty (and not "-") wins.
        "haplogroup_priority": ["haplogroup_fetched", "haplogroup_snp"],
        "field_order": [
            "kit", "test", "group", "haplogroup", "private", "surname",
            "ancestor", "location", "country", "latitude", "longitude",
        ],
    },
    "mt": {
        "input_glob": "data/input/Slovenianorigin_Maternal_Ancestry_*.csv",
        "input_fetched": "data/input/slo-mtdna-fetched.csv",
        "input_snp": "data/input/Slovenianorigin_MTDNA_Results.csv",
        "output": "data/output/slo-mtdna.json",
        "ancestor_col": "Maternal Ancestor Name",
        "primary_name_alias": "Name_mtdna",
        "fetched_extra": {"Mitotree Haplogroup": "mitotree"},
        "snp_extra": {"Mitotree Haplogroup": "mitotree_snp", "Haplotype": "haplotype"},
        # Private mutations are worked out from the full sequence in the SNP CSV
        # against the haplogroup's path (see mt_private_counts).
        "input_paths": "data/output/slo-mtdna-paths.json",
        # Mitotree wins over fetched, then SNP. mitotree_snp falls back to mitotree
        # via the merge step below.
        "haplogroup_priority": ["mitotree", "haplogroup_fetched", "haplogroup_snp"],
        "field_order": [
            "kit", "group", "haplogroup", "haplotype", "private", "surname",
            "ancestor", "location", "country", "latitude", "longitude",
        ],
    },
}

# Unified country -> 2-letter ISO code. Add new entries here, not in per-kind configs.
COUNTRY_MAP = {
    "Slovenia": "si",
    "Germany": "de",
    "Italy": "it",
    "Italy (Friuli-Venezia Giulia)": "it",
    "Slovakia": "sk",
    "Spain": "es",
    "United States": "us",
    "Canada": "ca",
    "Norway": "no",
    "Romania": "ro",
    "Morocco": "ma",
    "Hungary": "hu",
    "England": "gb",
    "United Kingdom": "gb",
    "Japan": "jp",
    "Czech Republic": "cz",
    "Bosnia and Herzegovina": "ba",
    "Serbia": "rs",
    "Croatia": "hr",
    "France": "fr",
    "Macedonia": "mk",
    "Burkina Faso": "bf",
    "Ukraine": "ua",
    "Saudi Arabia": "sa",
    "Austria": "at",
    "Ireland": "ie",
    "Lithuania": "lt",
    "Poland": "pl",
    "Finland": "fi",
    "Sweden": "se",
    "Russian Federation": "ru",
    "Switzerland": "ch",
    "Portugal": "pt",
    "Belarus": "by",
    "Netherlands": "nl",
    "Unknown Origin": "",
    "": "",
}


def find_newest(pattern):
    matches = sorted(glob.glob(pattern))
    return matches[-1] if matches else None


def get_surname(name):
    words = str(name).strip().split()
    if not words:
        return ""
    if len(words) > 1 and words[-1] in ["Jr.", "Sr.", "Jr", "Sr"]:
        return words[-2]
    return words[-1]


def first_nonempty(row, columns):
    """Return the first column value that is non-empty and not '-'."""
    for col in columns:
        val = row.get(col, "")
        if val and str(val).strip() != "-":
            return val
    return ""


def load_private(path):
    """kit -> private variant count, for kits fetched successfully."""
    if not path or not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        kits = json.load(f)
    return {kit: r["count"] for kit, r in kits.items() if r.get("status") == "ok"}


# Positions FTDNA's Mitotree leaves out of haplogroup calls because they mutate
# too often to mean anything: the poly-C and CA-repeat stretches of HVR2/HVR1,
# 16519, and the 9-bp repeat at 8281-8289 (which the paths write in repeat
# notation, so a member's raw deletions there would never match them).
MT_UNSTABLE = re.compile(r"^(\d+)")
MT_UNSTABLE_RANGES = [(303, 315), (522, 524), (573, 573), (8281, 8289),
                      (16182, 16183), (16193, 16193), (16519, 16519)]
MT_HETEROPLASMY = re.compile(r"[RYKMSW]$")


def mt_unstable(mutation):
    m = MT_UNSTABLE.match(mutation.lstrip("ACGT"))
    if not m:
        return True
    pos = int(m.group(1))
    return any(lo <= pos <= hi for lo, hi in MT_UNSTABLE_RANGES)


def norm_mt(mutation):
    return mutation.strip().strip("()").rstrip("!").upper()


def mt_private_counts(snp_path, paths_path, haplogroups):
    """kit -> number of the member's mutations that are not on their haplogroup's
    path: their private mutations, as FTDNA's Block Tree counts them.

    Needs the member's coding region (withheld ones read "Private") and a path
    whose every block has its variant list; anything less would overcount, so
    those kits get no count. Run ftdna-get-paths.py first for new haplogroups.
    """
    if not os.path.exists(paths_path):
        return {}
    with open(paths_path, encoding="utf-8") as f:
        nodes = {n["haplogroup"]: n for n in json.load(f)}
    df = pd.read_csv(snp_path, dtype=str).fillna("")
    df.rename(columns=lambda x: x.strip("﻿").strip(), inplace=True)

    def path_variants(hg):
        variants = set()
        while hg in nodes:
            node = nodes[hg]
            if "variants" in node:
                variants |= {norm_mt(v) for v in node["variants"]}
            elif "divergence" not in node.get("note", ""):
                return None  # not backfilled yet; the archaic placeholders above the root never are
            hg = node["parent"]
        return variants

    counts = {}
    for _, row in df.iterrows():
        kit = row["Kit Number"]
        if row.get("Coding Region Mutations", "") in ("", "Private"):
            continue
        hg = haplogroups.get(kit, "")
        if hg not in nodes:
            continue
        on_path = path_variants(hg)
        if on_path is None:
            continue
        own = {norm_mt(m) for col in ("HVR1 Mutations", "HVR2 Mutations", "Coding Region Mutations")
               for m in row.get(col, "").split(",") if m.strip()}
        counts[kit] = sum(1 for m in own - on_path if not mt_unstable(m) and not MT_HETEROPLASMY.search(m))
    return counts


def run_one(kind):
    cfg = CONFIGS[kind]
    print(f"=== {kind.upper()}-DNA ===")

    primary_path = find_newest(cfg["input_glob"])
    if not primary_path:
        print(f"Error: No file matching {cfg['input_glob']} found.")
        return False
    for file_path in [cfg["input_fetched"], cfg["input_snp"]]:
        if not os.path.exists(file_path):
            print(f"Error: Required file {file_path} not found.")
            return False

    df_primary = pd.read_csv(primary_path, dtype=str)
    df_fetched = pd.read_csv(cfg["input_fetched"], dtype=str)
    df_snp = pd.read_csv(cfg["input_snp"], dtype=str)

    # Strip BOM and whitespace from column names just in case
    for df in [df_primary, df_fetched, df_snp]:
        df.rename(columns=lambda x: x.strip("﻿").strip(), inplace=True)
        df.rename(columns={"Kit Number": "kit"}, inplace=True)

    # Primary source
    primary_cols = [
        "kit", "Name", "Sub Group", cfg["ancestor_col"],
        "Map Location", "Country", "Latitude", "Longitude",
    ]
    primary_cols = [c for c in primary_cols if c in df_primary.columns]
    df_primary = df_primary[primary_cols].copy()
    if "Name" in df_primary.columns:
        df_primary.rename(columns={"Name": cfg["primary_name_alias"]}, inplace=True)
    df_primary["sort_order"] = range(len(df_primary))  # preserve original order

    # Fetched: kit + Name + Group + Haplogroup + per-kind extras
    fetched_extra = cfg["fetched_extra"]
    fetched_cols = ["kit", "Name", "Group", "Haplogroup", *fetched_extra.keys()]
    fetched_cols = [c for c in fetched_cols if c in df_fetched.columns]
    df_fetched = df_fetched[fetched_cols].copy()
    df_fetched.rename(columns={
        "Name": "Name_fetched",
        "Group": "group_fetched",
        "Haplogroup": "haplogroup_fetched",
        **fetched_extra,
    }, inplace=True)

    # SNP: kit + Haplogroup + per-kind extras
    snp_extra = cfg["snp_extra"]
    snp_cols = ["kit", "Haplogroup", *snp_extra.keys()]
    snp_cols = [c for c in snp_cols if c in df_snp.columns]
    df_snp = df_snp[snp_cols].copy()
    df_snp.rename(columns={"Haplogroup": "haplogroup_snp", **snp_extra}, inplace=True)

    # primary LEFT JOIN fetched LEFT JOIN snp
    df = df_primary.merge(df_fetched, on="kit", how="left").merge(df_snp, on="kit", how="left")
    df = df.sort_values("sort_order", na_position="last")
    df.drop(columns=["sort_order"], inplace=True)

    df.rename(
        columns={
            cfg["primary_name_alias"]: "surname_primary",
            cfg["ancestor_col"]: "ancestor",
            "Map Location": "location",
            "Country": "country",
            "Latitude": "latitude",
            "Longitude": "longitude",
        },
        inplace=True,
    )

    df = df.fillna("")
    df["location"] = df["location"].replace("No Location Saved", "")

    # Group: Sub Group from primary, fall back to fetched if empty
    df["group"] = df.apply(
        lambda row: row.get("Sub Group", "") or row.get("group_fetched", ""),
        axis=1,
    )
    df["group"] = (
        df["group"]
        .str.replace(" haplogroup", "", regex=False)
        .str.replace(r"\s*\(.*?\)", "", regex=True)
        .str.strip()
        .replace("Ungrouped", "???")
    )

    # mtDNA-specific: mitotree (fetched) wins over mitotree_snp
    if "mitotree" in df.columns and "mitotree_snp" in df.columns:
        df["mitotree"] = df.apply(
            lambda row: row["mitotree"] if row["mitotree"] else row["mitotree_snp"],
            axis=1,
        )
    elif "mitotree_snp" in df.columns:
        df.rename(columns={"mitotree_snp": "mitotree"}, inplace=True)

    # Final haplogroup: first non-empty/'-' value from the priority list
    priority = [c for c in cfg["haplogroup_priority"] if c in df.columns]
    df["haplogroup"] = df.apply(lambda row: first_nonempty(row, priority), axis=1)

    # Surname: fetched Name if present, else from primary's Name
    df["surname"] = df.apply(
        lambda row: (
            get_surname(row["Name_fetched"]) if row.get("Name_fetched")
            else get_surname(row.get("surname_primary", ""))
        ),
        axis=1,
    )

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce").fillna(0.0)
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce").fillna(0.0)

    unmapped = set(df["country"].unique()) - set(COUNTRY_MAP.keys())
    if unmapped:
        print(f"Error: Cannot convert to standard country code. Unmapped countries: {', '.join(unmapped)}")
        return False
    df["country"] = df["country"].map(COUNTRY_MAP)

    if kind == "mt":
        private = mt_private_counts(cfg["input_snp"], cfg["input_paths"], dict(zip(df["kit"], df["haplogroup"])))
    else:
        private = load_private(cfg.get("input_private"))
    if private:
        df["private"] = df["kit"].map(private)

    df = df[[c for c in cfg["field_order"] if c in df.columns]]

    os.makedirs(os.path.dirname(cfg["output"]), exist_ok=True)
    records = df.to_dict(orient="records")
    # Only kits with a fetched count carry the field; the rest omit it rather
    # than read as zero.
    for r in records:
        if "private" in r:
            if pd.isna(r["private"]):
                del r["private"]
            else:
                r["private"] = int(r["private"])
    with open(cfg["output"], "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=4)

    print(f"Successfully processed {len(records)} records and saved to {cfg['output']}")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--kind", choices=["y", "mt"], default=None,
                        help="Lineage to process (omit to process both)")
    args = parser.parse_args()

    kinds = [args.kind] if args.kind else ["y", "mt"]
    ok = True
    for kind in kinds:
        if not run_one(kind):
            ok = False
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
