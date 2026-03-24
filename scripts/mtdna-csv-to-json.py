import os
import sys
import json
import pandas as pd


def main():
    input_mtdna = "input/slo-mtdna.csv"
    input_snp = "input/slo-mtdna-snp.csv"
    input_test = "input/slo-mtdna-test.csv"
    output_json = "data/slo-mtdna.json"

    # Check if files exist
    for file_path in [input_mtdna, input_snp, input_test]:
        if not os.path.exists(file_path):
            print(f"Error: Required file {file_path} not found.")
            sys.exit(1)

    # Read the CSV files
    df_mtdna = pd.read_csv(input_mtdna, dtype=str)
    df_snp = pd.read_csv(input_snp, dtype=str)

    # The mtDNA test file is exported with semicolons
    df_test = pd.read_csv(
        input_test, sep=";", dtype=str, usecols=lambda c: not c.startswith("Unnamed:")
    )

    # Strip BOM and whitespace from column names just in case
    for df in [df_mtdna, df_snp, df_test]:
        df.rename(columns=lambda x: x.strip("\ufeff").strip(), inplace=True)
        # Standardize the join key
        df.rename(columns={"Kit Number": "kit"}, inplace=True)

    # Select necessary columns from each file
    mtdna_cols = [
        "kit",
        "Name",
        "Sub Group",
        "Maternal Ancestor Name",
        "Map Location",
        "Country",
        "Latitude",
        "Longitude",
    ]
    mtdna_cols = [c for c in mtdna_cols if c in df_mtdna.columns]
    df_mtdna = df_mtdna[mtdna_cols].copy()
    if "Name" in df_mtdna.columns:
        df_mtdna.rename(columns={"Name": "Name_mtdna"}, inplace=True)

    # Preserve original order from the primary file
    df_mtdna["sort_order"] = range(len(df_mtdna))

    snp_cols = ["kit", "Haplogroup", "Mitotree Haplogroup", "Haplotype"]
    snp_cols = [c for c in snp_cols if c in df_snp.columns]
    df_snp = df_snp[snp_cols].copy()

    test_cols = ["kit", "Name"]
    test_cols = [c for c in test_cols if c in df_test.columns]
    df_test = df_test[test_cols].copy()
    if "Name" in df_test.columns:
        df_test.rename(columns={"Name": "surname_test"}, inplace=True)

    # Merge dataframes on 'kit'
    df = df_mtdna.merge(df_snp, on="kit", how="outer")
    df = df.merge(df_test, on="kit", how="outer")

    # Restore original order and drop the tracking column
    df = df.sort_values("sort_order", na_position="last")
    df.drop(columns=["sort_order"], inplace=True)

    # Map column names to standard JSON properties
    df.rename(
        columns={
            "Name_mtdna": "surname_mtdna",
            "Sub Group": "group",
            "Maternal Ancestor Name": "ancestor",
            "Map Location": "location",
            "Country": "country",
            "Latitude": "latitude",
            "Longitude": "longitude",
            "Haplogroup": "haplogroup",
            "Mitotree Haplogroup": "mitotree",
            "Haplotype": "haplotype",
        },
        inplace=True,
    )

    # Clean up data
    df = df.fillna("")
    df["group"] = df["group"].str.replace(" haplogroup", "", regex=False).str.strip()
    df["location"] = df["location"].replace("No Location Saved", "")

    df["haplogroup"] = df.apply(
        lambda row: (
            row["mitotree"] if row.get("mitotree") else row.get("haplogroup", "")
        ),
        axis=1,
    )

    def get_surname(name):
        words = str(name).strip().split()
        if not words:
            return ""
        if len(words) > 1 and words[-1] in ["Jr.", "Sr.", "Jr", "Sr"]:
            return words[-2]
        return words[-1]

    if "surname_test" in df.columns and "surname_mtdna" in df.columns:
        df["surname_mtdna"] = df["surname_mtdna"].apply(get_surname)
        df["surname"] = df.apply(
            lambda row: (
                row["surname_test"]
                if row.get("surname_test")
                else row.get("surname_mtdna", "")
            ),
            axis=1,
        )
    elif "surname_test" in df.columns:
        df.rename(columns={"surname_test": "surname"}, inplace=True)
    elif "surname_mtdna" in df.columns:
        df["surname"] = df["surname_mtdna"].apply(get_surname)

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
        "Ireland": "ie",
        "Lithuania": "lt",
        "Poland": "pl",
        "Finland": "fi",
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

    df["country"] = df["country"].apply(lambda x: country_map[x])

    # Enforce specific field order for JSON output
    field_order = [
        "kit",
        "group",
        "haplogroup",
        "haplotype",
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
