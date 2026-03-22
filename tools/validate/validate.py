#!/usr/bin/env python3
"""RETROSPEC schema validator.

Validates JSON data files against their corresponding JSON Schema definitions.
Determines the appropriate schema based on file location within the repository.

Usage:
    python validate.py <file_path>    Validate a single JSON file
    python validate.py all            Validate all JSON files in the repository
"""

import json
import os
import sys
from pathlib import Path

try:
    from jsonschema import Draft202012Validator, ValidationError
except ImportError:
    print("ERROR: jsonschema package not installed. Run: pip install jsonschema>=4.20.0")
    sys.exit(2)

# Repository root: two levels up from tools/validate/
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SCHEMA_DIR = REPO_ROOT / "schema"

# Directories to scan when running "all"
SCAN_DIRS = ["events", "entities", "papers", "concepts", "cycles", "epochs"]


def load_json(filepath: Path) -> dict:
    """Load and parse a JSON file, returning the parsed object."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def determine_schema_type(filepath: Path) -> str | None:
    """Determine the schema type based on file location relative to repo root.

    Returns one of: 'event', 'entity', 'epoch', or None if unknown.
    The entity schema uses a discriminated union (oneOf) for person/org/model,
    so all three sub-types validate against entity.schema.json.
    """
    try:
        rel = filepath.resolve().relative_to(REPO_ROOT)
    except ValueError:
        return None

    parts = rel.parts
    if len(parts) < 2:
        return None

    top_dir = parts[0]

    if top_dir == "events":
        return "event"
    elif top_dir == "entities":
        # entities/people/, entities/organizations/, entities/models/
        # All validate against entity.schema.json (discriminated union)
        return "entity"
    elif top_dir == "epochs":
        return "epoch"
    elif top_dir in ("papers", "concepts", "cycles"):
        # These share event-like structure but don't have a dedicated schema yet.
        # For now, attempt basic JSON parse validation only.
        return None

    return None


def load_schema(schema_type: str) -> dict:
    """Load the JSON Schema file for the given type."""
    schema_file = SCHEMA_DIR / f"{schema_type}.schema.json"
    if not schema_file.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_file}")
    return load_json(schema_file)


def validate_file(filepath: Path) -> tuple[bool, list[str]]:
    """Validate a single JSON file against its schema.

    Returns (passed, list_of_error_messages).
    """
    errors = []

    # Step 1: Parse JSON
    try:
        data = load_json(filepath)
    except json.JSONDecodeError as e:
        return False, [f"Invalid JSON: {e}"]
    except OSError as e:
        return False, [f"Cannot read file: {e}"]

    # Step 2: Determine schema type
    schema_type = determine_schema_type(filepath)
    if schema_type is None:
        # No schema available -- just confirm valid JSON
        return True, ["(no schema available -- JSON parse OK)"]

    # Step 3: Load schema and validate
    try:
        schema = load_schema(schema_type)
    except FileNotFoundError as e:
        return False, [str(e)]

    validator = Draft202012Validator(schema)
    for error in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        field_path = ".".join(str(p) for p in error.absolute_path) or "(root)"
        errors.append(f"  [{field_path}] {error.message}")

    if errors:
        return False, errors
    return True, []


def collect_json_files() -> list[Path]:
    """Collect all JSON files from the scannable directories."""
    files = []
    for dir_name in SCAN_DIRS:
        scan_path = REPO_ROOT / dir_name
        if scan_path.is_dir():
            for json_file in sorted(scan_path.rglob("*.json")):
                files.append(json_file)
    return files


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate.py <file_path | all>")
        sys.exit(2)

    target = sys.argv[1]

    if target == "all":
        files = collect_json_files()
        if not files:
            print("No JSON files found in scan directories.")
            print(f"Searched: {', '.join(SCAN_DIRS)}")
            print("RESULT: PASS (nothing to validate)")
            sys.exit(0)
    else:
        path = Path(target)
        if not path.is_absolute():
            path = Path.cwd() / path
        if not path.exists():
            print(f"ERROR: File not found: {path}")
            sys.exit(1)
        files = [path]

    total = 0
    passed = 0
    failed = 0
    skipped = 0

    print("=" * 60)
    print("RETROSPEC Schema Validation")
    print("=" * 60)

    for filepath in files:
        total += 1
        rel_path = filepath.resolve().relative_to(REPO_ROOT) if filepath.resolve().is_relative_to(REPO_ROOT) else filepath

        ok, messages = validate_file(filepath)

        if ok and messages and messages[0].startswith("(no schema"):
            skipped += 1
            print(f"  SKIP  {rel_path} -- no schema for this directory")
        elif ok:
            passed += 1
            print(f"  PASS  {rel_path}")
        else:
            failed += 1
            print(f"  FAIL  {rel_path}")
            for msg in messages:
                print(f"        {msg}")

    print("=" * 60)
    print(f"Total: {total}  |  Passed: {passed}  |  Failed: {failed}  |  Skipped: {skipped}")
    print("=" * 60)

    if failed > 0:
        print("RESULT: FAIL")
        sys.exit(1)
    else:
        print("RESULT: PASS")
        sys.exit(0)


if __name__ == "__main__":
    main()
