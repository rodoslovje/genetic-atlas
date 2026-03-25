import os
import sys
import json
import time
import argparse
import requests
import urllib.parse


def main():
    parser = argparse.ArgumentParser(
        description="Collect mtDNA haplogroup paths from FTDNA"
    )
    parser.add_argument(
        "--mode",
        choices=["update", "full"],
        default="update",
        help="Update existing or rebuild full",
    )
    args = parser.parse_args()

    input_json = "data/slo-mtdna.json"
    output_json = "data/slo-mtdna-paths.json"

    if not os.path.exists(input_json):
        print(f"Error: {input_json} not found.")
        sys.exit(1)

    with open(input_json, "r", encoding="utf-8") as f:
        people = json.load(f)

    # Get unique haplogroups from people
    target_haplogroups = set()
    for p in people:
        hg = p.get("haplogroup")
        if hg and hg != "-":
            target_haplogroups.add(hg)
        grp = p.get("group")
        if grp and grp != "-":
            target_haplogroups.add(grp)

    # Ensure all major mtDNA haplogroup roots are always included
    major_roots = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L0",
        "L1",
        "L2",
        "L3",
        "L4",
        "L5",
        "L6",
        "M",
        "N",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ]
    target_haplogroups.update(major_roots)

    print(f"Found {len(target_haplogroups)} unique haplogroups in {input_json}")

    # Load existing paths if in update mode
    existing_nodes = {}
    if args.mode == "update" and os.path.exists(output_json):
        with open(output_json, "r", encoding="utf-8") as f:
            try:
                paths = json.load(f)
                for node in paths:
                    existing_nodes[node["haplogroup"]] = node
                print(f"Loaded {len(existing_nodes)} existing nodes from {output_json}")
            except Exception as e:
                print(f"Warning: could not read {output_json}: {e}")

    nodes_db = existing_nodes.copy() if args.mode == "update" else {}

    missing_hgs = [hg for hg in target_haplogroups if hg not in nodes_db]
    if args.mode == "full":
        missing_hgs = list(target_haplogroups)

    missing_hgs.sort()

    print(f"Need to fetch paths for {len(missing_hgs)} haplogroups")

    for idx, hg in enumerate(missing_hgs, 1):
        if hg in nodes_db and args.mode == "update":
            continue

        print(f"[{idx}/{len(missing_hgs)}] Fetching path for {hg} ...")

        # FTDNA Discover JSON endpoint
        safe_hg = urllib.parse.quote(hg)
        url = f"https://discover.familytreedna.com/resources/mtdna/{safe_hg}.json"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.5",
        }

        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 404:
                print(f"  Warning: {hg} not found on FTDNA")
            else:
                response.raise_for_status()

                try:
                    next_data = response.json()

                    if (
                        isinstance(next_data, dict)
                        and "haplogroup" in next_data
                        and "ancestors" in next_data
                    ):
                        hg_info = next_data["haplogroup"]
                        time_info = next_data.get("time", {})

                        parent_name = ""
                        for anc in next_data["ancestors"]:
                            anc_name = anc.get("name")
                            if not anc_name:
                                continue
                            if anc_name not in nodes_db:
                                age = None
                                if "tmrca" in anc and isinstance(anc["tmrca"], dict):
                                    age = anc["tmrca"].get("mean")
                                note = anc.get("note") or ""
                                nodes_db[anc_name] = {
                                    "haplogroup": anc_name,
                                    "parent": parent_name,
                                    "note": note,
                                    "age": age,
                                }
                            parent_name = anc_name

                        hg_name = hg_info.get("name")
                        if hg_name and hg_name not in nodes_db:
                            age = None
                            if "tmrca" in time_info and isinstance(
                                time_info["tmrca"], dict
                            ):
                                age = time_info["tmrca"].get("mean")
                            elif "formed" in time_info and isinstance(
                                time_info["formed"], dict
                            ):
                                age = time_info["formed"].get("mean")

                            nodes_db[hg_name] = {
                                "haplogroup": hg_name,
                                "parent": hg_info.get("parent_name") or parent_name,
                                "note": "",
                                "age": age,
                            }
                    else:
                        path_data = None
                        if (
                            isinstance(next_data, dict)
                            and "name" in next_data
                            and "ancestors" in next_data
                        ):
                            path_data = [next_data] + next_data.get("ancestors", [])
                        else:

                            def find_path(obj):
                                if isinstance(obj, list):
                                    if (
                                        len(obj) > 0
                                        and isinstance(obj[0], dict)
                                        and "name" in obj[0]
                                        and (
                                            "parentName" in obj[0] or "parent" in obj[0]
                                        )
                                    ):
                                        names = [
                                            o.get("name")
                                            for o in obj
                                            if isinstance(o, dict)
                                        ]
                                        if (
                                            hg in names
                                            or "Mitochondrial Eve" in names
                                            or "L0" in names
                                            or "L1" in names
                                        ):
                                            return obj
                                    for item in obj:
                                        res = find_path(item)
                                        if res is not None:
                                            return res
                                elif isinstance(obj, dict):
                                    for k, v in obj.items():
                                        res = find_path(v)
                                        if res is not None:
                                            return res
                                return None

                            path_data = find_path(next_data)

                        if not path_data:
                            print(f"  Error: {hg} path data not found in JSON payload.")
                        else:
                            for item in path_data:
                                node_name = item.get("name")
                                if not node_name:
                                    continue
                                if node_name not in nodes_db:
                                    age = None
                                    if "tmrca" in item and isinstance(
                                        item["tmrca"], dict
                                    ):
                                        age = item["tmrca"].get("meanYear") or item[
                                            "tmrca"
                                        ].get("mean")
                                    elif "formation" in item and isinstance(
                                        item["formation"], dict
                                    ):
                                        age = item["formation"].get("meanYear") or item[
                                            "formation"
                                        ].get("mean")
                                    elif "age" in item:
                                        age_val = item["age"]
                                        age = (
                                            age_val.get("meanYear")
                                            or age_val.get("year")
                                            or age_val.get("mean")
                                            if isinstance(age_val, dict)
                                            else age_val
                                        )

                                    nodes_db[node_name] = {
                                        "haplogroup": node_name,
                                        "parent": item.get("parentName")
                                        or item.get("parent")
                                        or "",
                                        "note": item.get("historicalEvent", "")
                                        or item.get("note", ""),
                                        "age": age,
                                    }
                except ValueError:
                    print(f"  Error: {hg} returned invalid JSON.")
        except Exception as e:
            print(f"  Error fetching {hg}: {e}")

        time.sleep(0.5)

    output_list = list(nodes_db.values())

    def sort_key(n):
        age = n.get("age")
        return (999999 if age is None else age, n.get("haplogroup", ""))

    output_list.sort(key=sort_key)

    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(output_list, f, indent=4, ensure_ascii=False)

    print(f"Saved {len(output_list)} nodes to {output_json}")


if __name__ == "__main__":
    main()
