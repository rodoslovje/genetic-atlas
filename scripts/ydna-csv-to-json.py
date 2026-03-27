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
    input_snp = "input/slo-ydna-snp.csv"
    input_test = "input/slo-ydna-test.csv"
    output_json = "data/slo-ydna.json"

    # Check if files exist
    for file_path in [input_ydna, input_snp, input_test]:
        if not os.path.exists(file_path):
            print(f"Error: Required file {file_path} not found.")
            sys.exit(1)

    # Read the CSV files
    # The test file is exported with semicolons
    df_ydna = pd.read_csv(input_ydna, dtype=str)
    df_snp = pd.read_csv(input_snp, dtype=str)

    # Using usecols to drop empty unnamed columns at the end of the test csv
    df_test = pd.read_csv(
        input_test, sep=";", dtype=str, usecols=lambda c: not c.startswith("Unnamed:")
    )

    # Strip BOM and whitespace from column names just in case
    for df in [df_ydna, df_snp, df_test]:
        df.rename(columns=lambda x: x.strip("\ufeff").strip(), inplace=True)

    # Standardize the join key
    df_ydna.rename(columns={"Kit Number": "kit"}, inplace=True)
    df_snp.rename(columns={"Kit Number": "kit"}, inplace=True)

    # Select necessary columns from each file
    ydna_cols = [
        "kit",
        "Name",
        "Sub Group",
        "Paternal Ancestor Name",
        "Map Location",
        "Country",
        "Latitude",
        "Longitude",
    ]
    ydna_cols = [c for c in ydna_cols if c in df_ydna.columns]
    df_ydna = df_ydna[ydna_cols].copy()
    if "Name" in df_ydna.columns:
        df_ydna.rename(columns={"Name": "Name_ydna"}, inplace=True)

    # Preserve original order from the primary file
    df_ydna["sort_order"] = range(len(df_ydna))

    snp_cols = ["kit", "Haplogroup"]
    snp_cols = [c for c in snp_cols if c in df_snp.columns]
    df_snp = df_snp[snp_cols].copy()
    if "Haplogroup" in df_snp.columns:
        df_snp.rename(columns={"Haplogroup": "haplogroup_snp"}, inplace=True)

    test_cols = ["kit", "surname", "haplogroup", "test"]
    test_cols = [c for c in test_cols if c in df_test.columns]
    df_test = df_test[test_cols].copy()
    if "surname" in df_test.columns:
        df_test.rename(columns={"surname": "surname_test"}, inplace=True)
    if "haplogroup" in df_test.columns:
        df_test.rename(columns={"haplogroup": "haplogroup_test"}, inplace=True)

    # Merge dataframes on 'kit'
    df = df_ydna.merge(df_snp, on="kit", how="outer")
    df = df.merge(df_test, on="kit", how="outer")

    # Restore original order and drop the tracking column
    df = df.sort_values("sort_order", na_position="last")
    df.drop(columns=["sort_order"], inplace=True)

    # Map column names to standard JSON properties
    df.rename(
        columns={
            "Name_ydna": "surname_ydna",
            "Sub Group": "group",
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
    df["group"] = (
        df["group"]
        .str.replace(" haplogroup", "", regex=False)
        .str.replace(r"\s*\(.*?\)", "", regex=True)
        .str.strip()
    )
    df["location"] = df["location"].replace("No Location Saved", "")

    if "surname_test" in df.columns and "surname_ydna" in df.columns:
        df["surname_ydna"] = df["surname_ydna"].apply(get_surname)
        df["surname"] = df.apply(
            lambda row: (
                row["surname_test"] if row["surname_test"] else row["surname_ydna"]
            ),
            axis=1,
        )
    elif "surname_test" in df.columns:
        df.rename(columns={"surname_test": "surname"}, inplace=True)
    elif "surname_ydna" in df.columns:
        df["surname"] = df["surname_ydna"].apply(get_surname)

    if "haplogroup_test" in df.columns and "haplogroup_snp" in df.columns:
        df["haplogroup"] = df.apply(
            lambda row: (
                row["haplogroup_test"]
                if row.get("haplogroup_test")
                and str(row.get("haplogroup_test")).strip() != "-"
                else row.get("haplogroup_snp", "")
            ),
            axis=1,
        )
    elif "haplogroup_test" in df.columns:
        df.rename(columns={"haplogroup_test": "haplogroup"}, inplace=True)
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
