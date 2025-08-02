import json
from pathlib import Path

import yaml
from jsonschema import validate

BASE = Path(__file__).resolve().parent
DATA_DIR = BASE / "building-structure"
SCHEMA_DIR = DATA_DIR / "schemas"

FILES = [
    ("points.yml", "points.schema.json"),
    ("hss_columns.yml", "hss_columns.schema.json"),
]


def main():
    for data_name, schema_name in FILES:
        data_path = DATA_DIR / data_name
        schema_path = SCHEMA_DIR / schema_name
        with data_path.open() as f:
            data = yaml.safe_load(f)
        with schema_path.open() as f:
            schema = json.load(f)
        validate(instance=data, schema=schema)
        print(f"{data_name} passed schema validation")


if __name__ == "__main__":
    main()
