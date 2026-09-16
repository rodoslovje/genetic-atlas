"""
Collects Y-DNA and/or mtDNA haplogroup paths from the FTDNA Discover JSON endpoint.

Usage:
    python tools/ftdna-get-paths.py                    # both lineages, incremental
    python tools/ftdna-get-paths.py --kind y           # paternal only
    python tools/ftdna-get-paths.py --mode full        # both, full rebuild
    python tools/ftdna-get-paths.py --mode variants    # backfill variant lists for nodes
                                                       # that were only seen as ancestors
    python tools/ftdna-get-paths.py --limit 100        # stop after 100 requests

Each node in the output carries:
    haplogroup, parent, note      tree topology and FTDNA historical-event label
    age                           TMRCA mean year (negative = BCE)
    age68, age99                  [oldest, youngest] TMRCA bounds at 68% / 99%
    placements, modern, ancient   FTDNA tester counts placed directly on the node /
                                  anywhere below it / ancient samples below it
    variants                      the block's variants - equivalent SNP names for Y-DNA,
                                  mutations for mtDNA; present only on nodes that were
                                  fetched directly (see --mode variants)

On an HTTP 429 a request is retried once after RATE_LIMIT_RETRY_DELAY; if FTDNA is
still throttling, the run stops and saves what it has (every successful fetch is
saved, so re-running picks up where it left off).
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
    "A-L1090",
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
        "input": "data/output/slo-ydna.json",
        "output": "data/output/slo-ydna-paths.json",
        "url_template": "https://discover.familytreedna.com/resources/y-dna/{hg}.json",
        "major_roots": YDNA_MAJOR_ROOTS,
        "include_group_in_targets": False,
        # Sentinel names that confirm a JSON sub-tree is the haplogroup path
        "path_root_sentinels": ["A0000"],
        # Whether the fallback find_path() accepts "parent" in addition to "parentName"
        "accept_parent_field": False,
        # People whose ancestry is prioritised in --mode variants (Big Y testers)
        "is_priority_person": lambda p: (p.get("test") or "").startswith("Big Y"),
    },
    "mt": {
        "input": "data/output/slo-mtdna.json",
        "output": "data/output/slo-mtdna-paths.json",
        "url_template": "https://discover.familytreedna.com/resources/mtdna/{hg}.json",
        "major_roots": MTDNA_MAJOR_ROOTS,
        "include_group_in_targets": True,
        "path_root_sentinels": ["Mitochondrial Eve", "L0", "L1"],
        "accept_parent_field": True,
        "is_priority_person": lambda p: bool(p.get("haplotype")),
    },
}

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.5",
}

REQUEST_TIMEOUT = 15
SLEEP_BETWEEN_REQUESTS = 0.5  # be nice to the API
RATE_LIMIT_RETRY_DELAY = 300  # wait this long (s) and retry once after an HTTP 429

# Canonical key order for the output file (unknown keys are appended after these).
FIELD_ORDER = [
    "haplogroup", "parent", "note", "age", "age68", "age99",
    "placements", "modern", "ancient", "variants",
]
COUNT_FIELDS = ("placements", "modern", "ancient")


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


# ---------------------------------------------------------------------------
# Payload parsing
# ---------------------------------------------------------------------------

def parse_time_block(block):
    """Return {age, age68, age99} from an FTDNA time block such as
    {mean, oldest, youngest, oldest68, youngest68, oldest99, youngest99}.
    Keys whose data is absent are omitted."""
    out = {}
    if not isinstance(block, dict):
        return out
    mean = block.get("meanYear")
    if mean is None:
        mean = block.get("mean")
    if mean is not None:
        out["age"] = mean
    for key, lo, hi in (("age68", "oldest68", "youngest68"),
                        ("age99", "oldest99", "youngest99")):
        if block.get(lo) is not None and block.get(hi) is not None:
            out[key] = [block[lo], block[hi]]
    return out


def parse_time(item):
    """Extract the best available age (and bounds) from an FTDNA Discover node."""
    for time_key in ("tmrca", "formation", "formed"):
        parsed = parse_time_block(item.get(time_key))
        if parsed:
            return parsed
    age_val = item.get("age")
    if isinstance(age_val, dict):
        mean = age_val.get("meanYear") or age_val.get("year") or age_val.get("mean")
        return {"age": mean} if mean is not None else {}
    return {"age": age_val} if age_val is not None else {}


def parse_counts(item):
    return {k: item[k] for k in COUNT_FIELDS if isinstance(item.get(k), int)}


def parse_variants(item, owner=None):
    """Return the list of equivalent variant names defining `owner`, or None when
    the payload has no variants list at all (so the caller can tell 'unknown'
    from 'none').

    The Y-DNA payload scopes `variants` to the queried node, but the mtDNA one
    lists the mutations of the whole ancestral path, each tagged with the
    haplogroup it belongs to. Keep only the owner's own entries — without this
    every node would inherit its ancestors' mutations as well (70 instead of 3
    for U2e1b1)."""
    raw = item.get("variants")
    if not isinstance(raw, list):
        return None
    names = []
    for v in raw:
        if isinstance(v, dict):
            if owner and isinstance(v.get("haplogroup"), str) and v["haplogroup"] != owner:
                continue
            name = v.get("name")
        else:
            name = v
        if isinstance(name, str) and name:
            names.append(name)
    return names


def merge_node(nodes_db, name, parent=None, note=None, fields=None, fetched=False):
    """Create or enrich a node.

    Topology fields (parent, note) are only filled in when missing, so an
    incremental run never rewires an existing tree. Data fields (age, bounds,
    counts, variants) are filled in when missing, or overwritten when the node
    was the direct target of the request (fetched=True) and thus freshest."""
    node = nodes_db.get(name)
    if node is None:
        node = {"haplogroup": name, "parent": parent or "", "note": note or "", "age": None}
        nodes_db[name] = node
    else:
        if parent and not node.get("parent"):
            node["parent"] = parent
        if note and not node.get("note"):
            node["note"] = note
    for key, value in (fields or {}).items():
        if value is None:
            continue
        if fetched or node.get(key) is None:
            node[key] = value
    return node


def store_modern_response(next_data, nodes_db, hg):
    """Handle the {haplogroup, ancestors, time, variants, ...} response shape.

    `ancestors` lists every node from the root down to (and including) the
    queried haplogroup, each with its own tmrca and tester counts. Variants
    and the full time block are only given for the queried node."""
    hg_info = next_data["haplogroup"]
    hg_name = hg_info.get("name") or hg

    parent_name = ""
    parent_of_hg = ""
    for anc in next_data["ancestors"]:
        anc_name = anc.get("name")
        if not anc_name:
            continue
        if anc_name == hg_name:
            parent_of_hg = parent_name
        merge_node(nodes_db, anc_name, parent=parent_name, note=anc.get("note"),
                   fields={**parse_time(anc), **parse_counts(anc)})
        parent_name = anc_name
    if not parent_of_hg and parent_name != hg_name:
        parent_of_hg = parent_name

    fields = parse_time(next_data.get("time", {}))
    variants = parse_variants(next_data, owner=hg_name)
    if variants is not None:
        fields["variants"] = variants
    merge_node(nodes_db, hg_name,
               parent=hg_info.get("parent_name") or parent_of_hg,
               fields=fields, fetched=True)


def store_path_data(path_data, nodes_db, hg):
    for item in path_data:
        node_name = item.get("name")
        if not node_name:
            continue
        fields = {**parse_time(item), **parse_counts(item)}
        variants = parse_variants(item, owner=node_name)
        if variants is not None:
            fields["variants"] = variants
        merge_node(nodes_db, node_name,
                   parent=item.get("parentName") or item.get("parent"),
                   note=item.get("historicalEvent") or item.get("note"),
                   fields=fields, fetched=(node_name == hg))


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


# ---------------------------------------------------------------------------
# Fetching
# ---------------------------------------------------------------------------

def fetch_one(hg, cfg, nodes_db):
    """Fetch and store one haplogroup path.

    A first HTTP 429 is waited out once (RATE_LIMIT_RETRY_DELAY) and the request
    repeated; FTDNA's throttle is usually short enough that a long run gets
    through this way instead of stopping a few hundred nodes in. Progress is
    saved after every successful fetch, so the pause risks nothing.

    Returns "ok" on success, "rate_limited" if FTDNA responded with HTTP 429
    twice, otherwise None.
    """
    safe_hg = urllib.parse.quote(hg)
    url = cfg["url_template"].format(hg=safe_hg)

    for attempt in range(2):
        try:
            response = requests.get(url, headers=HTTP_HEADERS, timeout=REQUEST_TIMEOUT)
        except Exception as e:
            print(f"  Error fetching {hg}: {e}")
            return

        if response.status_code != 429:
            break

        if attempt == 0:
            mins = RATE_LIMIT_RETRY_DELAY / 60
            print(f"  Rate limited (HTTP 429) while fetching {hg}; "
                  f"waiting {mins:.0f} min and retrying once ...")
            time.sleep(RATE_LIMIT_RETRY_DELAY)
    else:
        print(f"  Still rate limited (HTTP 429) after retrying {hg}")
        return "rate_limited"

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
        store_modern_response(next_data, nodes_db, hg)
        return "ok"

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

    store_path_data(path_data, nodes_db, hg)
    return "ok"


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

def ancestry_of(hg, nodes_db):
    """All nodes from hg up to the root, following parent pointers."""
    out = []
    seen = set()
    while hg and hg in nodes_db and hg not in seen:
        seen.add(hg)
        out.append(hg)
        hg = nodes_db[hg].get("parent")
    return out


def plan_variants(people, cfg, nodes_db):
    """Nodes lacking a variants list, most useful first: those on the ancestry
    of priority testers (Big Y for Y-DNA), youngest first; then the rest."""
    priority_nodes = set()
    for p in people:
        if cfg["is_priority_person"](p) and is_valid_hg(p.get("haplogroup")):
            priority_nodes.update(ancestry_of(p["haplogroup"], nodes_db))
    missing = [h for h, n in nodes_db.items() if "variants" not in n]

    def sort_key(h):
        age = nodes_db[h].get("age")
        return (h not in priority_nodes, -(age if age is not None else -10**9), h)

    return sorted(missing, key=sort_key)


def run_one(kind, mode, limit):
    cfg = CONFIGS[kind]
    print(f"=== {kind.upper()}-DNA ({mode}) ===")

    if not os.path.exists(cfg["input"]):
        print(f"Error: {cfg['input']} not found.")
        return "error"

    with open(cfg["input"], "r", encoding="utf-8") as f:
        people = json.load(f)

    target_haplogroups = collect_targets(people, cfg)
    print(f"Found {len(target_haplogroups)} unique haplogroups in {cfg['input']}")

    # Load existing paths unless doing a full rebuild
    existing_nodes = {}
    if mode != "full" and os.path.exists(cfg["output"]):
        with open(cfg["output"], "r", encoding="utf-8") as f:
            try:
                for node in json.load(f):
                    existing_nodes[node["haplogroup"]] = node
                print(f"Loaded {len(existing_nodes)} existing nodes from {cfg['output']}")
            except Exception as e:
                print(f"Warning: could not read {cfg['output']}: {e}")

    nodes_db = existing_nodes if mode != "full" else {}

    if mode == "variants":
        missing_hgs = plan_variants(people, cfg, nodes_db)
        # A node acquires "variants" only when fetched directly, so nothing
        # gets populated as a side effect of an earlier request.
        needs_fetch = lambda hg: "variants" not in nodes_db.get(hg, {})
    else:
        if mode == "full":
            candidates = list(target_haplogroups)
        else:
            candidates = [hg for hg in target_haplogroups if hg not in nodes_db]
        # Fetch order: person-derived (likely deep, leaf-ish SNPs) before major
        # roots, and longer names before shorter within each bucket. Each FTDNA
        # response includes the queried node's full ancestry, so fetching the
        # deepest target first lets the skip-already-populated check eliminate
        # its ancestors from later iterations — fewer HTTP requests overall.
        major_roots_set = set(cfg["major_roots"])
        missing_hgs = sorted(candidates, key=lambda h: (h in major_roots_set, -len(h), h))
        needs_fetch = lambda hg: hg not in nodes_db

    print(f"Need to fetch paths for {len(missing_hgs)} haplogroups"
          + (f" (limit {limit} this run)" if limit else ""))

    # The on-disk JSON is the source of truth. Write it after every successful
    # fetch (atomically via temp+rename) so kill -9 at any moment leaves a valid
    # checkpoint, and a partial "full" run can be resumed by re-running in
    # "update" mode.
    def save():
        os.makedirs(os.path.dirname(cfg["output"]), exist_ok=True)
        output_list = sorted(
            nodes_db.values(),
            key=lambda n: (999999 if n.get("age") is None else n["age"], n.get("haplogroup", "")),
        )
        ordered = [
            {**{k: n[k] for k in FIELD_ORDER if k in n},
             **{k: v for k, v in n.items() if k not in FIELD_ORDER}}
            for n in output_list
        ]
        tmp_path = cfg["output"] + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(ordered, f, indent=4, ensure_ascii=False)
        os.replace(tmp_path, cfg["output"])

    requests_made = 0
    for idx, hg in enumerate(missing_hgs, 1):
        # Each FTDNA response includes the full ancestry, so by the time we
        # reach a haplogroup that was an ancestor of an earlier target, it
        # is already in nodes_db — no need to re-fetch it.
        if not needs_fetch(hg):
            print(f"[{idx}/{len(missing_hgs)}] {hg} already populated from earlier path; skipping")
            continue
        if limit and requests_made >= limit:
            remaining = sum(1 for h in missing_hgs[idx - 1:] if needs_fetch(h))
            save()
            print(f"Reached --limit {limit}; {remaining} haplogroups still to fetch. "
                  f"Saved {len(nodes_db)} nodes to {cfg['output']} (partial)")
            return "ok"
        print(f"[{idx}/{len(missing_hgs)}] Fetching path for {hg} ...")
        requests_made += 1
        status = fetch_one(hg, cfg, nodes_db)
        if status == "ok":
            save()
        if status == "rate_limited":
            save()
            print(f"Saved {len(nodes_db)} nodes to {cfg['output']} (partial)")
            print("FTDNA is still rate limiting requests (HTTP 429) after a retry. "
                  "Stopping now to avoid a longer block. Please retry in about "
                  "1 hour to fetch the remaining haplogroups.")
            return "rate_limited"
        time.sleep(SLEEP_BETWEEN_REQUESTS)

    save()
    print(f"Saved {len(nodes_db)} nodes to {cfg['output']}")
    return "ok"


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--kind", choices=["y", "mt"], default=None,
                        help="Lineage to process (omit to process both)")
    parser.add_argument("--mode", choices=["update", "full", "variants"], default="update",
                        help="update: fetch new haplogroups only; full: rebuild everything; "
                             "variants: fetch nodes that still lack their SNP list")
    parser.add_argument("--limit", type=int, default=0,
                        help="Maximum number of HTTP requests per lineage this run "
                             "(0 = unlimited); useful to stay under FTDNA's rate limit")
    args = parser.parse_args()

    kinds = [args.kind] if args.kind else ["y", "mt"]
    ok = True
    for kind in kinds:
        status = run_one(kind, args.mode, args.limit)
        if status == "rate_limited":
            # Don't start the next lineage; FTDNA is throttling us.
            sys.exit(2)
        if status != "ok":
            ok = False
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
