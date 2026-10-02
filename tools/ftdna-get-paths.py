"""
Collects Y-DNA and/or mtDNA haplogroup paths from the FTDNA Discover JSON endpoint.

Usage:
    python tools/ftdna-get-paths.py                    # both lineages, incremental
    python tools/ftdna-get-paths.py --kind y           # paternal only
    python tools/ftdna-get-paths.py --mode full        # both, full rebuild
    python tools/ftdna-get-paths.py --mode ancient     # only the backfill below, no new
                                                       # haplogroups
    python tools/ftdna-get-paths.py --limit 100        # stop after 100 requests

Every mode ends with a backfill: each node whose ancient list has not been read
yet (one first seen as the ancestor of a fetched path) is fetched directly, which
also brings its variants and TMRCA bounds. An update therefore leaves the new
part of the tree complete; on a fresh tree the backfill is long, so pair it with
--limit and re-run.

Each node in the output carries:
    haplogroup, parent, note      tree topology and FTDNA historical-event label
    age                           TMRCA mean year (negative = BCE)
    age68, age99                  [oldest, youngest] TMRCA bounds at 68% / 99%
    placements, modern, ancient   FTDNA tester counts placed directly on the node /
                                  anywhere below it / ancient samples below it
    variants                      the block's variants - equivalent SNP names for Y-DNA,
                                  mutations for mtDNA; present only on nodes that were
                                  fetched directly (see the backfill above)

Every run also writes the ancient connections it saw to
data/output/slo-{y,mt}dna-ancient.json:

    fetched                       haplogroups whose own ancient list has been read
    samples                       one record per ancient burial, keyed by FTDNA's code

A burial is kept only when the app can both place and map it: it needs a
haplogroup_mrca that is in the paths file (the branch where it joins our tree),
coordinates, and a haplogroup of its own for this lineage. A burial reached from
several haplogroups is stored once, on the deepest MRCA seen for it.

--mode full rebuilds the tree topology from scratch but does not throw away the
backfills: a rebuilt node keeps the variants and TMRCA bounds it had before when
this run did not fetch it directly, and the ancient store is carried over too.
Burials (and read markers) whose haplogroup is no longer in the tree are pruned
once a run completes.

On an HTTP 429 a request is retried once after RATE_LIMIT_RETRY_DELAY; if FTDNA is
still throttling, the run stops and saves what it has (every successful fetch is
saved, so re-running picks up where it left off).
"""

import argparse
import collections
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
        "ancient_output": "data/output/slo-ydna-ancient.json",
        # Which haplogroup of an ancient sample belongs to this lineage, and
        # which one is worth keeping as a side note.
        "ancient_hg_field": "haplogroup_y",
        "ancient_other_field": "haplogroup_mt",
        "url_template": "https://discover.familytreedna.com/resources/y-dna/{hg}.json",
        "major_roots": YDNA_MAJOR_ROOTS,
        "include_group_in_targets": False,
        # Sentinel names that confirm a JSON sub-tree is the haplogroup path
        "path_root_sentinels": ["A0000"],
        # Whether the fallback find_path() accepts "parent" in addition to "parentName"
        "accept_parent_field": False,
        # People whose ancestry is prioritised in --mode ancient (Big Y testers)
        "is_priority_person": lambda p: (p.get("test") or "").startswith("Big Y"),
    },
    "mt": {
        "input": "data/output/slo-mtdna.json",
        "output": "data/output/slo-mtdna-paths.json",
        "ancient_output": "data/output/slo-mtdna-ancient.json",
        "ancient_hg_field": "haplogroup_mt",
        "ancient_other_field": "haplogroup_y",
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


# Canonical key order for one ancient sample.
ANCIENT_FIELD_ORDER = [
    "code", "name", "mrca", "haplogroup", "otherHaplogroup", "year", "years",
    "tmrca", "latitude", "longitude", "site", "geography", "country", "culture",
    "period", "sex", "uncertain", "studies",
]


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


# ---------------------------------------------------------------------------
# Ancient connections
# ---------------------------------------------------------------------------

def parse_ancient_entry(item, cfg, nodes_db):
    """One record from the payload's `ancient` list, or None when the app could
    not use it: it has to be placeable (a MRCA haplogroup that is in the paths
    file), mappable (coordinates) and dated, and it has to carry a haplogroup of
    its own for this lineage."""
    if not isinstance(item, dict):
        return None
    mrca = item.get("haplogroup_mrca")
    own = item.get(cfg["ancient_hg_field"])
    lat, lon = item.get("latitude"), item.get("longitude")
    year = item.get("age_estimate_mean")
    if not (is_valid_hg(mrca) and mrca in nodes_db and is_valid_hg(own)):
        return None
    if not (isinstance(lat, (int, float)) and isinstance(lon, (int, float))):
        return None
    if not isinstance(year, (int, float)):
        return None
    code = item.get("code")
    if not code:
        return None

    rec = {
        "code": code,
        "name": item.get("name") or code,
        "mrca": mrca,
        "haplogroup": own,
        "otherHaplogroup": item.get(cfg["ancient_other_field"]),
        "year": round(year),
        # [oldest, youngest], the same order as the nodes' age68 / age99 bounds.
        "years": [item["age_estimate_upper"], item["age_estimate_lower"]]
                 if item.get("age_estimate_upper") is not None
                 and item.get("age_estimate_lower") is not None else None,
        "tmrca": (item.get("time_mrca") or {}).get("mean"),
        "latitude": round(lat, 6),
        "longitude": round(lon, 6),
        "site": item.get("site"),
        "geography": item.get("geography"),
        "country": item.get("country_name"),
        "culture": item.get("culture"),
        "period": item.get("time_period"),
        "sex": item.get("sex"),
        "uncertain": True if item.get("uncertain_placement") else None,
        "studies": item.get("studies") or None,
    }
    return {k: v for k, v in rec.items() if v is not None and v != ""}


def merge_ancient(ancient_db, rec, nodes_db):
    """Store one burial, preferring the deepest MRCA it has been seen with: the
    same sample appears in the list of every haplogroup it connects to, and the
    deepest of those is where it belongs on our tree. At equal depth the newer
    record wins, so a refetch refreshes what was stored."""
    prev = ancient_db["samples"].get(rec["code"])
    if prev is not None and len(ancestry_of(prev["mrca"], nodes_db)) > len(ancestry_of(rec["mrca"], nodes_db)):
        return
    ancient_db["samples"][rec["code"]] = rec


def collect_ancient(payload, ancient_db, hg, cfg, nodes_db):
    """The payload's `ancient` list belongs to the haplogroup that was requested,
    so the node counts as read even when nothing in the list is usable."""
    if ancient_db is None or not isinstance(payload, dict):
        return
    ancient_db["fetched"].add(hg)
    for item in payload.get("ancient") or []:
        rec = parse_ancient_entry(item, cfg, nodes_db)
        if rec:
            merge_ancient(ancient_db, rec, nodes_db)


def load_ancient(cfg):
    db = {"fetched": set(), "samples": {}}
    path = cfg["ancient_output"]
    if not os.path.exists(path):
        return db
    try:
        with open(path, "r", encoding="utf-8") as f:
            stored = json.load(f)
        db["fetched"] = set(stored.get("fetched") or [])
        for rec in stored.get("samples") or []:
            if rec.get("code"):
                db["samples"][rec["code"]] = rec
        print(f"Loaded {len(db['samples'])} ancient samples from {path} "
              f"({len(db['fetched'])} haplogroups read)")
    except Exception as e:
        print(f"Warning: could not read {path}: {e}")
    return db


def prune_ancient(ancient_db, nodes_db):
    """Drop burials and read markers whose haplogroup has left the tree."""
    ancient_db["fetched"] &= set(nodes_db)
    ancient_db["samples"] = {c: r for c, r in ancient_db["samples"].items()
                             if r["mrca"] in nodes_db}


def save_ancient(cfg, ancient_db):
    path = cfg["ancient_output"]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    samples = sorted(ancient_db["samples"].values(),
                     key=lambda r: (r.get("year", 0), r.get("code", "")))
    ordered = [
        {**{k: r[k] for k in ANCIENT_FIELD_ORDER if k in r},
         **{k: v for k, v in r.items() if k not in ANCIENT_FIELD_ORDER}}
        for r in samples
    ]
    tmp_path = path + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump({"fetched": sorted(ancient_db["fetched"]), "samples": ordered},
                  f, indent=4, ensure_ascii=False)
    os.replace(tmp_path, path)


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

def fetch_one(hg, cfg, nodes_db, ancient_db=None, ancient_tree=None):
    """Fetch and store one haplogroup path.

    `ancient_tree` is what ancient MRCAs are placed against; it defaults to
    nodes_db, and a full rebuild passes the old tree behind the new one so
    carried-over burials keep their depth while the new tree is still partial.

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
    if ancient_tree is None:
        ancient_tree = nodes_db

    if (isinstance(next_data, dict)
            and "haplogroup" in next_data
            and "ancestors" in next_data):
        store_modern_response(next_data, nodes_db, hg)
        # After the path, so the MRCA of an ancient sample on a node first seen
        # in this very response is already known to be in the tree.
        collect_ancient(next_data, ancient_db, hg, cfg, ancient_tree)
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
    collect_ancient(next_data, ancient_db, hg, cfg, ancient_tree)
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


def plan_backfill(missing, people, cfg, nodes_db):
    """Order a backfill, most useful first: nodes on the ancestry of priority
    testers (Big Y for Y-DNA, full sequence for mtDNA), youngest first; then the
    rest. Used by --mode ancient."""
    priority_nodes = set()
    for p in people:
        if cfg["is_priority_person"](p) and is_valid_hg(p.get("haplogroup")):
            priority_nodes.update(ancestry_of(p["haplogroup"], nodes_db))

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

    # Load existing paths. A full rebuild starts its tree empty but keeps the
    # old one to carry over what only a direct fetch provides.
    existing_nodes = {}
    if os.path.exists(cfg["output"]):
        with open(cfg["output"], "r", encoding="utf-8") as f:
            try:
                for node in json.load(f):
                    existing_nodes[node["haplogroup"]] = node
                print(f"Loaded {len(existing_nodes)} existing nodes from {cfg['output']}")
            except Exception as e:
                print(f"Warning: could not read {cfg['output']}: {e}")

    nodes_db = existing_nodes if mode != "full" else {}
    previous = existing_nodes if mode == "full" else {}
    ancient_db = load_ancient(cfg)
    ancient_tree = collections.ChainMap(nodes_db, previous) if previous else nodes_db

    def path_pass():
        if mode == "full":
            candidates = list(target_haplogroups)
        else:
            candidates = [hg for hg in target_haplogroups if hg not in nodes_db]
        needs_fetch = lambda hg: hg not in nodes_db
        # Fetch order: person-derived (likely deep, leaf-ish SNPs) before major
        # roots, and longer names before shorter within each bucket. Each FTDNA
        # response includes the queried node's full ancestry, so fetching the
        # deepest target first lets the skip-already-populated check eliminate
        # its ancestors from later iterations — fewer HTTP requests overall.
        major_roots_set = set(cfg["major_roots"])
        return sorted(candidates, key=lambda h: (h in major_roots_set, -len(h), h)), needs_fetch

    def ancient_pass():
        # A node's own ancient list, like its variants and TMRCA bounds, only
        # arrives when that node is the one requested, so nodes first seen as
        # the ancestors of a fetched path stay unread until this pass. One
        # fetch fills all three.
        unread = [h for h in nodes_db if h not in ancient_db["fetched"]]
        return plan_backfill(unread, people, cfg, nodes_db), lambda hg: hg not in ancient_db["fetched"]

    # Every mode ends with the ancient backfill, so the nodes an update or a
    # rebuild adds are read in the same run; --mode ancient runs it alone.
    passes = [ancient_pass] if mode == "ancient" else [path_pass, ancient_pass]

    # The on-disk JSON is the source of truth. Write it after every successful
    # fetch (atomically via temp+rename) so kill -9 at any moment leaves a valid
    # checkpoint, and a partial "full" run can be resumed by re-running in
    # "update" mode.
    def save(complete=False):
        os.makedirs(os.path.dirname(cfg["output"]), exist_ok=True)
        # Fields the rebuild did not fetch (variants, bounds) come from the old
        # node of the same name; anything it did fetch wins.
        output_list = sorted(
            ({**previous.get(n["haplogroup"], {}), **n} for n in nodes_db.values()),
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
        # Mid-run the tree may still be partial, so prune only at the end.
        if complete:
            prune_ancient(ancient_db, nodes_db)
        save_ancient(cfg, ancient_db)

    requests_made = 0
    for plan in passes:
        # Planned only when its turn comes: the backfill has to see the nodes
        # the path pass just added.
        missing_hgs, needs_fetch = plan()
        label = "paths" if plan is path_pass else "ancient connections"
        print(f"Need to fetch {label} for {len(missing_hgs)} haplogroups"
              + (f" (limit {limit} this run)" if limit else ""))
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
            print(f"[{idx}/{len(missing_hgs)}] Fetching {hg} ...")
            requests_made += 1
            status = fetch_one(hg, cfg, nodes_db, ancient_db, ancient_tree)
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

    save(complete=True)
    print(f"Saved {len(nodes_db)} nodes to {cfg['output']}")
    print(f"Saved {len(ancient_db['samples'])} ancient samples to {cfg['ancient_output']}")
    return "ok"


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    parser.add_argument("--kind", choices=["y", "mt"], default=None,
                        help="Lineage to process (omit to process both)")
    parser.add_argument("--mode", choices=["update", "full", "ancient"], default="update",
                        help="update: fetch new haplogroups; full: rebuild everything; "
                             "ancient: skip both and only fetch nodes not yet requested "
                             "directly, for their variants and ancient connections "
                             "(update and full end with this too)")
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
