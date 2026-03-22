#!/usr/bin/env python3
"""RETROSPEC referential integrity checker.

Scans all JSON data files, collects declared IDs, then checks that every
cross-reference points to an existing ID. Also detects orphaned nodes
(entries with zero inbound references).

Usage:
    python check_integrity.py
"""

import json
import os
import sys
from collections import defaultdict
from pathlib import Path

# Repository root: two levels up from tools/validate/
REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# Directories to scan for JSON data files
SCAN_DIRS = ["events", "entities", "papers", "concepts", "cycles", "epochs"]

# Fields that contain references to other entity IDs.
# Maps field name (or dotted path) to whether it is an array or scalar.
# "array" fields contain lists of IDs; "scalar" fields contain a single ID.
REFERENCE_FIELDS = {
    # Event schema
    "entities.people": "array",
    "entities.organizations": "array",
    "entities.models_spawned": "array",
    "preceded_by": "array",
    "succeeded_by": "array",
    # Entity: person
    "influenced_by": "array",
    "influenced": "array",
    "papers": "array",
    # Entity: organization
    "founders": "array",
    "key_models": "array",
    "key_papers": "array",
    # Entity: model
    "organization": "scalar",
    "parent_models": "array",
    "child_models": "array",
    # Epoch
    "key_events": "array",
    "key_figures": "array",
    "key_models": "array",  # also in epoch (same key, fine)
    # Relationship schema (in graphs/)
    "source": "scalar",
    "target": "scalar",
}

# ID prefixes that indicate a cross-referenceable entity
KNOWN_PREFIXES = ("evt_", "person_", "org_", "model_", "epoch_", "concept_", "paper_", "cycle_")


def load_json_safe(filepath: Path) -> dict | list | None:
    """Load JSON, returning None on error."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"  WARNING: Cannot parse {filepath}: {e}")
        return None


def extract_value(data: dict, dotted_key: str):
    """Extract a value from a dict using a dotted key path like 'entities.people'."""
    parts = dotted_key.split(".")
    current = data
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current


def looks_like_id(value: str) -> bool:
    """Check if a string looks like a RETROSPEC entity ID."""
    return any(value.startswith(prefix) for prefix in KNOWN_PREFIXES)


def collect_all_json_files() -> list[Path]:
    """Collect all JSON files from scan directories and graphs/."""
    files = []
    for dir_name in SCAN_DIRS + ["graphs"]:
        scan_path = REPO_ROOT / dir_name
        if scan_path.is_dir():
            for json_file in sorted(scan_path.rglob("*.json")):
                files.append(json_file)
    return files


def main():
    files = collect_all_json_files()

    if not files:
        print("No JSON files found to check.")
        print("RESULT: PASS (nothing to check)")
        sys.exit(0)

    # Phase 1: Collect all declared IDs
    all_ids: set[str] = set()
    file_id_map: dict[str, Path] = {}  # id -> file that declares it
    all_data: list[tuple[Path, dict]] = []

    print("=" * 60)
    print("RETROSPEC Referential Integrity Check")
    print("=" * 60)
    print()
    print(f"Scanning {len(files)} JSON file(s)...")
    print()

    for filepath in files:
        data = load_json_safe(filepath)
        if data is None:
            continue

        # Handle both single objects and arrays (e.g., graph files may be arrays)
        items = data if isinstance(data, list) else [data]
        for item in items:
            if not isinstance(item, dict):
                continue
            all_data.append((filepath, item))
            entry_id = item.get("id")
            if entry_id and isinstance(entry_id, str):
                all_ids.add(entry_id)
                file_id_map[entry_id] = filepath

    print(f"Found {len(all_ids)} declared ID(s)")
    print()

    # Phase 2: Collect all references and check for dangling refs
    dangling: list[tuple[str, str, Path]] = []  # (ref_id, field, source_file)
    inbound_refs: dict[str, set[str]] = defaultdict(set)  # target_id -> set of source_ids

    for filepath, item in all_data:
        source_id = item.get("id", str(filepath))

        for field, cardinality in REFERENCE_FIELDS.items():
            value = extract_value(item, field)
            if value is None:
                continue

            ref_ids = []
            if cardinality == "array" and isinstance(value, list):
                ref_ids = [v for v in value if isinstance(v, str)]
            elif cardinality == "scalar" and isinstance(value, str):
                ref_ids = [value]

            for ref_id in ref_ids:
                # Only check IDs that look like RETROSPEC entity references
                if not looks_like_id(ref_id):
                    continue

                inbound_refs[ref_id].add(source_id if isinstance(source_id, str) else str(filepath))

                if ref_id not in all_ids:
                    dangling.append((ref_id, field, filepath))

    # Phase 3: Find orphaned nodes (declared IDs with 0 inbound references)
    orphaned: list[tuple[str, Path]] = []
    for entry_id, filepath in file_id_map.items():
        if entry_id not in inbound_refs:
            orphaned.append((entry_id, filepath))

    # Report results
    print("-" * 60)
    print("DANGLING REFERENCES")
    print("-" * 60)
    if dangling:
        for ref_id, field, filepath in sorted(dangling):
            rel_path = filepath.resolve().relative_to(REPO_ROOT) if filepath.resolve().is_relative_to(REPO_ROOT) else filepath
            print(f"  DANGLING  {ref_id}")
            print(f"            referenced in field '{field}' of {rel_path}")
        print()
        print(f"Total dangling references: {len(dangling)}")
    else:
        print("  None found.")
    print()

    print("-" * 60)
    print("ORPHANED NODES (0 inbound references)")
    print("-" * 60)
    if orphaned:
        for entry_id, filepath in sorted(orphaned):
            rel_path = filepath.resolve().relative_to(REPO_ROOT) if filepath.resolve().is_relative_to(REPO_ROOT) else filepath
            print(f"  ORPHAN  {entry_id}  ({rel_path})")
        print()
        print(f"Total orphaned nodes: {len(orphaned)}")
    else:
        print("  None found.")
    print()

    # Summary
    print("=" * 60)
    print("SUMMARY")
    print(f"  Total IDs declared:       {len(all_ids)}")
    print(f"  Dangling references:      {len(dangling)}")
    print(f"  Orphaned nodes:           {len(orphaned)}")
    print("=" * 60)

    if dangling:
        print("RESULT: FAIL (dangling references found)")
        sys.exit(1)
    else:
        # Orphans are warnings, not failures -- new entries naturally start orphaned
        if orphaned:
            print("RESULT: PASS (with orphan warnings)")
        else:
            print("RESULT: PASS")
        sys.exit(0)


if __name__ == "__main__":
    main()
