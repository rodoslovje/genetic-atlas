import os
import sys
import json
import pandas as pd


def main():
    input_csv = "input/slo-mtdna-test.csv"
    output_json = "data/slo-mtdna.json"

    if not os.path.exists(input_csv):
        print(f"Error: Required file {input_csv} not found.")
        sys.exit(1)

    # The mtDNA test file is exported with semicolons
    df = pd.read_csv(input_csv, sep=";", dtype=str)

    # Strip BOM and whitespace from column names just in case
    df.rename(columns=lambda x: x.strip("\ufeff").strip(), inplace=True)

    # Map column names to standard JSON properties
    df.rename(
        columns={
            "Kit Number": "kit",
            "Name": "surname",
            "Group": "group",
            "Maternal Ancestor Name": "ancestor",
            "Country": "country",
            "Haplogroup": "haplogroup",
            "Mitotree Haplogroup": "mitotree",
        },
        inplace=True,
    )

    # Clean up data
    df = df.fillna("")

    df["haplogroup"] = df.apply(
        lambda row: row["mitotree"] if row["mitotree"] else row["haplogroup"], axis=1
    )

    def get_surname(name):
        words = str(name).strip().split()
        if not words:
            return ""
        if len(words) > 1 and words[-1] in ["Jr.", "Sr.", "Jr", "Sr"]:
            return words[-2]
        return words[-1]

    df["surname"] = df["surname"].apply(get_surname)

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
        "surname",
        "ancestor",
        "country",
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
