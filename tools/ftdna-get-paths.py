"""
Collects Y-DNA and/or mtDNA haplogroup paths from the FTDNA Discover JSON endpoint.

Usage:
    python tools/ftdna-get-paths.py                # both lineages, incremental
    python tools/ftdna-get-paths.py --kind y       # paternal only
    python tools/ftdna-get-paths.py --mode full    # both, full rebuild
"""

import argparse
import json
import os
import sys
import time
import urllib.parse

import requests

# Major haplogroup roots that are always included regardless of project membership.
# Lines preceded by '#' are temporarily disabled (e.g. FTDNA 403).
YDNA_MAJOR_ROOTS = [
    # "A-M91", "A-L1086",
    "A-V168", "A-V221",
    # "B-M60",
    "B-M182", "B-M112", "BT-M42",
    "C-M216", "C-F3393", "C-M217", "CF-P143", "CT-M168",
    "D-M174", "D-M15",
    # "D-M55",
    "DE-M145",
    "E-M96", "E-CTS9083", "E-M2", "E-M215", "E-V13",
    "F-M89", "F-F15527", "F-M427",
    # "F-M481",
    "G-M201", "G-M285", "G-L89", "G-P15", "GHIJK-F1329",
    "H-L901", "H-M2826", "H-P96", "HIJK-PF3494",
    "I-M170", "I-M253", "I-P215", "IJ-P124", "IJK-L15",
    "J-M304", "J-M267", "J-M172",
    "L-M20", "L-M22", "L-M317", "LT-L298",
    # "M-P256", "M-M4", "M-M353",
    "N-M231", "N-L735",
    # "N-M46",
    "N-L550", "NO-M214",
    "O-M175", "O-F265", "O-M122",
    "P-P295", "Q-M242",
    "R-M420", "R-M343", "R-M479",
    # "S-B254",
    "S-B255",
    # "S-P378",
    "T-M184",
]

MTDNA_MAJOR_ROOTS = [
    "A", "A2", "B", "B2", "B4", "C", "C1", "D", "D1", "D4", "E", "E1", "E2",
    "F", "F1", "F2", "G", "G1", "G2",
    "H", "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H10",
    "I", "I1", "I2", "I3", "I4", "J", "J1", "J2", "K", "K1", "K2",
    "L", "L0", "L1", "L2", "L3", "L4", "L5", "L6", "M", "M1",
    "N", "N1", "N1a", "N1b", "O", "O1", "O2", "P", "P1", "P2",
    "Q", "Q1", "Q2", "R", "R0",
    # "R1",
    "R2", "S", "S1", "S2", "T", "T1", "T2", "U",
    "V", "V1", "V2", "V3", "V7", "V13",
    "W", "W1", "W3", "W4", "W5", "X", "X1", "X2",
    "Y", "Y1", "Y2", "Z", "Z1", "Z2",
]

CONFIGS = {
    "y": {
        "input": "data/slo-ydna.json",
        "output": "data/slo-ydna-paths.json",
        "url_template": "https://discover.familytreedna.com/resources/y-dna/{hg}.json",
        "major_roots": YDNA_MAJOR_ROOTS,
        "include_group_in_targets": False,
        # Sentinel names that confirm a JSON sub-tree is the haplogroup path
        "path_root_sentinels": ["A0000"],
        # Whether the fallback find_path() accepts "parent" in addition to "parentName"
        "accept_parent_field": False,
    },
    "mt": {
        "input": "data/slo-mtdna.json",
        "output": "data/slo-mtdna-paths.json",
        "url_template": "https://discover.familytreedna.com/resources/mtdna/{hg}.json",
        "major_roots": MTDNA_MAJOR_ROOTS,
        "include_group_in_targets": True,
        "path_root_sentinels": ["Mitochondrial Eve", "L0", "L1"],
        "accept_parent_field": True,
    },
}

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.5",
}

REQUEST_TIMEOUT = 15
SLEEP_BETWEEN_REQUESTS = 0.5  # be nice to the API


def is_valid_hg(value):
    return bool(value) and value not in ("-", "???") and "!" not in value


def collect_targets(people, cfg):
    targets = set()
    for p in people:
        hg = p.get("haplogroup")
        if is_valid_hg(hg):
            targets.add(hg)
        if cfg["include_group_in_targets"]:
            grp = p.get("group")
            if is_valid_hg(grp):
                targets.add(grp)
    targets.update(cfg["major_roots"])
    return targets


def parse_age(item):
    """Extract the best available age from an FTDNA Discover node."""
    for time_key in ("tmrca", "formation"):
        block = item.get(time_key)
        if isinstance(block, dict):
            return block.get("meanYear") or block.get("mean")
    age_val = item.get("age")
    if isinstance(age_val, dict):
        return age_val.get("meanYear") or age_val.get("year") or age_val.get("mean")
    return age_val if age_val is not None else None


def parse_age_legacy(block):
    """Extract age from the {haplogroup, ancestors, time} response shape."""
    if isinstance(block, dict):
        tmrca = block.get("tmrca")
        if isinstance(tmrca, dict):
            return tmrca.get("mean")
        formed = block.get("formed")
        if isinstance(formed, dict):
            return formed.get("mean")
    return None


def store_modern_response(next_data, nodes_db):
    """Handle the {haplogroup, ancestors, time} response shape."""
    hg_info = next_data["haplogroup"]
    time_info = next_data.get("time", {})

    parent_name = ""
    for anc in next_data["ancestors"]:
        anc_name = anc.get("name")
        if not anc_name:
            continue
        if anc_name not in nodes_db:
            age = None
            if isinstance(anc.get("tmrca"), dict):
                age = anc["tmrca"].get("mean")
            nodes_db[anc_name] = {
                "haplogroup": anc_name,
                "parent": parent_name,
                "note": anc.get("note") or "",
                "age": age,
            }
        parent_name = anc_name

    hg_name = hg_info.get("name")
    if hg_name and hg_name not in nodes_db:
        age = parse_age_legacy(time_info)
        nodes_db[hg_name] = {
            "haplogroup": hg_name,
            "parent": hg_info.get("parent_name") or parent_name,
            "note": "",
            "age": age,
        }


def store_path_data(path_data, nodes_db):
    for item in path_data:
        node_name = item.get("name")
        if not node_name or node_name in nodes_db:
            continue
        note = item.get("historicalEvent") or item.get("note") or ""
        nodes_db[node_name] = {
            "haplogroup": node_name,
            "parent": item.get("parentName") or item.get("parent") or "",
            "note": note,
            "age": parse_age(item),
        }


def find_path_in_json(obj, target_hg, sentinels, accept_parent_field):
    """Walk arbitrary JSON looking for a list of {name, parentName} dicts that
    represents the path containing target_hg or one of the known root sentinels."""
    if isinstance(obj, list):
        if obj and isinstance(obj[0], dict) and "name" in obj[0]:
            has_parent_key = "parentName" in obj[0] or (accept_parent_field and "parent" in obj[0])
            if has_parent_key:
                names = [o.get("name") for o in obj if isinstance(o, dict)]
                if target_hg in names or any(s in names for s in sentinels):
                    return obj
        for item in obj:
            res = find_path_in_json(item, target_hg, sentinels, accept_parent_field)
            if res is not None:
                return res
    elif isinstance(obj, dict):
        for v in obj.values():
            res = find_path_in_json(v, target_hg, sentinels, accept_parent_field)
            if res is not None:
                return res
    return None


def fetch_one(hg, cfg, nodes_db):
    safe_hg = urllib.parse.quote(hg)
    url = cfg["url_template"].format(hg=safe_hg)

    try:
        response = requests.get(url, headers=HTTP_HEADERS, timeout=REQUEST_TIMEOUT)
    except Exception as e:
        print(f"  Error fetching {hg}: {e}")
        return

    if response.status_code == 404:
        print(f"  Warning: {hg} not found on FTDNA")
        return

    try:
        response.raise_for_status()
    except Exception as e:
        print(f"  Error fetching {hg}: {e}")
        return

    try:
        next_data = response.json()
    except ValueError:
        print(f"  Error: {hg} returned invalid JSON.")
        return

    # Shape 1: {haplogroup: {...}, ancestors: [...], time: {...}}
    if (isinstance(next_data, dict)
            and "haplogroup" in next_data
            and "ancestors" in next_data):
        store_modern_response(next_data, nodes_db)
        return

    # Shape 2: root JSON object is the haplogroup itself with embedded ancestors
    path_data = None
    if isinstance(next_data, dict) and "name" in next_data:
        # mt requires the ancestors key be present; y does not
        if cfg["accept_parent_field"]:
            if "ancestors" in next_data:
                path_data = [next_data] + next_data.get("ancestors", [])
        else:
            path_data = [next_data] + next_data.get("ancestors", [])

    # Shape 3: fall back to searching the JSON tree
    if not path_data:
        path_data = find_path_in_json(
            next_data, hg, cfg["path_root_sentinels"], cfg["accept_parent_field"]
        )

    if not path_data:
        print(f"  Error: {hg} path data not found in JSON payload.")
        return

    store_path_data(path_data, nodes_db)


def run_one(kind, mode):
    cfg = CONFIGS[kind]
    print(f"=== {kind.upper()}-DNA ({mode}) ===")

    if not os.path.exists(cfg["input"]):
        print(f"Error: {cfg['input']} not found.")
        return False

    with open(cfg["input"], "r", encoding="utf-8") as f:
        people = json.load(f)

    target_haplogroups = collect_targets(people, cfg)
    print(f"Found {len(target_haplogroups)} unique haplogroups in {cfg['input']}")

    # Load existing paths if in update mode
    existing_nodes = {}
    if mode == "update" and os.path.exists(cfg["output"]):
        with open(cfg["output"], "r", encoding="utf-8") as f:
            try:
                for node in json.load(f):
                    existing_nodes[node["haplogroup"]] = node
                print(f"Loaded {len(existing_nodes)} existing nodes from {cfg['output']}")
            except Exception as e:
                print(f"Warning: could not read {cfg['output']}: {e}")

    nodes_db = existing_nodes.copy() if mode == "update" else {}

    if mode == "full":
        missing_hgs = sorted(target_haplogroups)
    else:
        missing_hgs = sorted(hg for hg in target_haplogroups if hg not in nodes_db)

    print(f"Need to fetch paths for {len(missing_hgs)} haplogroups")

    for idx, hg in enumerate(missing_hgs, 1):
        print(f"[{idx}/{len(missing_hgs)}] Fetching path for {hg} ...")
        fetch_one(hg, cfg, nodes_db)
        time.sleep(SLEEP_BETWEEN_REQUESTS)

    output_list = list(nodes_db.values())
    output_list.sort(key=lambda n: (999999 if n.get("age") is None else n["age"], n.get("haplogroup", "")))

    os.makedirs(os.path.dirname(cfg["output"]), exist_ok=True)
    with open(cfg["output"], "w", encoding="utf-8") as f:
        json.dump(output_list, f, indent=4, ensure_ascii=False)

    print(f"Saved {len(output_list)} nodes to {cfg['output']}")
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--kind", choices=["y", "mt"], default=None,
                        help="Lineage to process (omit to process both)")
    parser.add_argument("--mode", choices=["update", "full"], default="update",
                        help="Update existing or rebuild full")
    args = parser.parse_args()

    kinds = [args.kind] if args.kind else ["y", "mt"]
    ok = True
    for kind in kinds:
        if not run_one(kind, args.mode):
            ok = False
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
