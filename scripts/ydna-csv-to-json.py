import os
import sys
import json
import pandas as pd


def get_surname(name: str) -> str:
    words = str(name).strip().split()
    if not words:
        return ""
    if len(words) > 1 and words[-1] in ["Jr.", "Sr.", "Jr", "Sr"]:
        return words[-2]
    return words[-1]


def main():
    input_ydna = "input/slo-ydna.csv"
    input_fetched = "input/slo-ydna-fetched.csv"
    input_snp = "input/slo-ydna-snp.csv"
    output_json = "data/slo-ydna.json"

    # Check if files exist
    for file_path in [input_ydna, input_fetched, input_snp]:
        if not os.path.exists(file_path):
            print(f"Error: Required file {file_path} not found.")
            sys.exit(1)

    # Read the CSV files
    df_ydna = pd.read_csv(input_ydna, dtype=str)
    df_fetched = pd.read_csv(input_fetched, dtype=str)
    df_snp = pd.read_csv(input_snp, dtype=str)

    # Strip BOM and whitespace from column names just in case
    for df in [df_ydna, df_fetched, df_snp]:
        df.rename(columns=lambda x: x.strip("\ufeff").strip(), inplace=True)
        df.rename(columns={"Kit Number": "kit"}, inplace=True)

    # Primary source: slo-ydna.csv
    ydna_cols = [
        "kit", "Name", "Sub Group", "Paternal Ancestor Name",
        "Map Location", "Country", "Latitude", "Longitude",
    ]
    ydna_cols = [c for c in ydna_cols if c in df_ydna.columns]
    df_ydna = df_ydna[ydna_cols].copy()
    if "Name" in df_ydna.columns:
        df_ydna.rename(columns={"Name": "Name_ydna"}, inplace=True)

    # Preserve original order from the primary file
    df_ydna["sort_order"] = range(len(df_ydna))

    # Fetched: augments group, haplogroup and surname
    fetched_cols = ["kit", "Name", "Group", "Haplogroup", "Test"]
    fetched_cols = [c for c in fetched_cols if c in df_fetched.columns]
    df_fetched = df_fetched[fetched_cols].copy()
    df_fetched.rename(columns={
        "Name": "Name_fetched",
        "Group": "group_fetched",
        "Haplogroup": "haplogroup_fetched",
        "Test": "test",
    }, inplace=True)

    # SNP haplogroup
    snp_cols = ["kit", "Haplogroup"]
    snp_cols = [c for c in snp_cols if c in df_snp.columns]
    df_snp = df_snp[snp_cols].copy()
    if "Haplogroup" in df_snp.columns:
        df_snp.rename(columns={"Haplogroup": "haplogroup_snp"}, inplace=True)

    # Merge: primary LEFT JOIN fetched LEFT JOIN snp
    df = df_ydna.merge(df_fetched, on="kit", how="left")
    df = df.merge(df_snp, on="kit", how="left")

    # Restore original order and drop the tracking column
    df = df.sort_values("sort_order", na_position="last")
    df.drop(columns=["sort_order"], inplace=True)

    # Map column names to standard JSON properties
    df.rename(
        columns={
            "Name_ydna": "surname_ydna",
            "Paternal Ancestor Name": "ancestor",
            "Map Location": "location",
            "Country": "country",
            "Latitude": "latitude",
            "Longitude": "longitude",
        },
        inplace=True,
    )

    # Clean up data
    df = df.fillna("")
    df["location"] = df["location"].replace("No Location Saved", "")

    # Group: use Sub Group from primary, fall back to fetched if empty
    df["group"] = df.apply(
        lambda row: row.get("Sub Group", "") or row.get("group_fetched", ""),
        axis=1,
    )
    df["group"] = (
        df["group"]
        .str.replace(" haplogroup", "", regex=False)
        .str.replace(r"\s*\(.*?\)", "", regex=True)
        .str.strip()
    )

    df["surname"] = df.apply(
        lambda row: (
            get_surname(row["Name_fetched"]) if row.get("Name_fetched")
            else get_surname(row.get("surname_ydna", ""))
        ),
        axis=1,
    )

    if "haplogroup_fetched" in df.columns and "haplogroup_snp" in df.columns:
        df["haplogroup"] = df.apply(
            lambda row: (
                row["haplogroup_fetched"]
                if row.get("haplogroup_fetched")
                and str(row.get("haplogroup_fetched")).strip() != "-"
                else row.get("haplogroup_snp", "")
            ),
            axis=1,
        )
    elif "haplogroup_fetched" in df.columns:
        df.rename(columns={"haplogroup_fetched": "haplogroup"}, inplace=True)
    elif "haplogroup_snp" in df.columns:
        df.rename(columns={"haplogroup_snp": "haplogroup"}, inplace=True)

    # Convert lat/lon to float
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce").fillna(0.0)
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce").fillna(0.0)

    # Convert country names to standard 2-letter codes
    country_map = {
        "Slovenia": "si",
        "Germany": "de",
        "Italy": "it",
        "Italy (Friuli-Venezia Giulia)": "it",
        "Slovakia": "sk",
        "Spain": "es",
        "United States": "us",
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
        "Sweden": "se",
        "Russian Federation": "ru",
        "Switzerland": "ch",
        "Portugal": "pt",
        "Belarus": "by",
        "Unknown Origin": "",
        "": "",
    }

    unmapped = set(df["country"].unique()) - set(country_map.keys())
    if unmapped:
        print(
            f"Error: Cannot convert to standard country code. Unmapped countries: {', '.join(unmapped)}"
        )
        sys.exit(1)

    df["country"] = df["country"].map(country_map)

    # Enforce specific field order for JSON output
    field_order = [
        "kit",
        "test",
        "group",
        "haplogroup",
        "surname",
        "ancestor",
        "location",
        "country",
        "latitude",
        "longitude",
    ]
    df = df[[c for c in field_order if c in df.columns]]

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_json), exist_ok=True)

    # Convert to list of dictionaries
    records = df.to_dict(orient="records")

    # Save to JSON
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=4)

    print(f"Successfully processed {len(records)} records and saved to {output_json}")


if __name__ == "__main__":
    main()
