#!/usr/bin/env python3
"""RETROSPEC Health Dashboard.

Generates a comprehensive ASCII health report covering coverage, epoch balance,
referential integrity, graph statistics, freshness, geographic diversity, and
significance score distribution.

Usage:
    python tools/validate/health_dashboard.py
"""

import json
import os
import sys
from collections import Counter, defaultdict
from datetime import date, datetime
from pathlib import Path

# Repository root: two levels up from tools/validate/
REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# ── Directories ──────────────────────────────────────────────────────────────
EVENTS_DIR = REPO_ROOT / "events"
PEOPLE_DIR = REPO_ROOT / "entities" / "people"
ORGS_DIR = REPO_ROOT / "entities" / "organizations"
MODELS_DIR = REPO_ROOT / "entities" / "models"
PAPERS_DIR = REPO_ROOT / "papers"
CONCEPTS_DIR = REPO_ROOT / "concepts"
CYCLES_DIR = REPO_ROOT / "cycles"
LINEAGE_DIR = REPO_ROOT / "lineage"
GRAPHS_DIR = REPO_ROOT / "graphs"
EPOCHS_DIR = REPO_ROOT / "epochs"

# Integrity-check config (mirrors check_integrity.py)
SCAN_DIRS = ["events", "entities", "papers", "concepts", "cycles", "epochs"]
REFERENCE_FIELDS = {
    "entities.people": "array",
    "entities.organizations": "array",
    "entities.models_spawned": "array",
    "preceded_by": "array",
    "succeeded_by": "array",
    "influenced_by": "array",
    "influenced": "array",
    "papers": "array",
    "founders": "array",
    "key_models": "array",
    "key_papers": "array",
    "organization": "scalar",
    "parent_models": "array",
    "child_models": "array",
    "key_events": "array",
    "key_figures": "array",
    "source": "scalar",
    "target": "scalar",
}
KNOWN_PREFIXES = ("evt_", "person_", "org_", "model_", "epoch_", "concept_", "paper_", "cycle_")

# Dashboard width
W = 56

# Epoch labels for display
EPOCH_LABELS = {
    "00_philosophical_roots": "00 Philosophical",
    "01_dawn": "01 Dawn",
    "02_golden_age": "02 Golden Age",
    "03_first_winter": "03 First Winter",
    "04_expert_systems_boom": "04 Expert Sys",
    "05_second_winter": "05 Second Winter",
    "06_quiet_revolution": "06 Quiet Rev",
    "07_deep_learning_era": "07 Deep Learn",
    "08_transformer_age": "08 Transformer",
    "09_generative_explosion": "09 Generative",
    "10_agentic_era": "10 Agentic",
}

EPOCH_MIN_THRESHOLD = 3


# ── Helpers ──────────────────────────────────────────────────────────────────

def load_json_safe(filepath: Path):
    """Load JSON, returning None on error."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def count_json_files(directory: Path) -> int:
    """Count .json files in a directory (non-recursive)."""
    if not directory.is_dir():
        return 0
    return sum(1 for f in directory.iterdir() if f.suffix == ".json")


def count_json_files_recursive(directory: Path) -> int:
    """Count .json files recursively."""
    if not directory.is_dir():
        return 0
    return sum(1 for _ in directory.rglob("*.json"))


def collect_all_json(dirs: list[str]) -> list[tuple[Path, dict]]:
    """Collect all JSON data entries from the given directories."""
    results = []
    for dir_name in dirs:
        scan_path = REPO_ROOT / dir_name
        if not scan_path.is_dir():
            continue
        for json_file in sorted(scan_path.rglob("*.json")):
            data = load_json_safe(json_file)
            if data is None:
                continue
            items = data if isinstance(data, list) else [data]
            for item in items:
                if isinstance(item, dict):
                    results.append((json_file, item))
    return results


def extract_value(data: dict, dotted_key: str):
    """Extract a value from a dict using a dotted key path."""
    parts = dotted_key.split(".")
    current = data
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current


def looks_like_id(value: str) -> bool:
    return any(value.startswith(p) for p in KNOWN_PREFIXES)


# ── Data Collection ──────────────────────────────────────────────────────────

def get_coverage() -> dict[str, int]:
    """Count entries per category."""
    return {
        "Events": count_json_files(EVENTS_DIR),
        "People": count_json_files(PEOPLE_DIR),
        "Orgs": count_json_files(ORGS_DIR),
        "Models": count_json_files(MODELS_DIR),
        "Papers": count_json_files(PAPERS_DIR),
        "Concepts": count_json_files(CONCEPTS_DIR),
        "Cycles": count_json_files(CYCLES_DIR),
        "Lineage": count_json_files_recursive(LINEAGE_DIR),
        "Graphs": count_json_files(GRAPHS_DIR),
    }


def get_epoch_counts() -> dict[str, int]:
    """Count events per epoch by reading each event file's 'epoch' field."""
    counts = Counter()
    # Initialize all known epochs to 0
    for key in EPOCH_LABELS:
        counts[key] = 0
    if not EVENTS_DIR.is_dir():
        return dict(counts)
    for json_file in EVENTS_DIR.glob("*.json"):
        data = load_json_safe(json_file)
        if data and isinstance(data, dict) and "epoch" in data:
            counts[data["epoch"]] += 1
    return dict(counts)


def get_integrity() -> tuple[int, int]:
    """Return (dangling_count, orphaned_count) using check_integrity logic."""
    all_data = collect_all_json(SCAN_DIRS + ["graphs"])

    all_ids: set[str] = set()
    file_id_map: dict[str, Path] = {}
    for filepath, item in all_data:
        entry_id = item.get("id")
        if entry_id and isinstance(entry_id, str):
            all_ids.add(entry_id)
            file_id_map[entry_id] = filepath

    dangling_count = 0
    inbound_refs: dict[str, set[str]] = defaultdict(set)

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
                if not looks_like_id(ref_id):
                    continue
                src_key = source_id if isinstance(source_id, str) else str(filepath)
                inbound_refs[ref_id].add(src_key)
                if ref_id not in all_ids:
                    dangling_count += 1

    orphaned_count = sum(1 for eid in file_id_map if eid not in inbound_refs)
    return dangling_count, orphaned_count


def get_graph_stats() -> list[tuple[str, bool, int, int]]:
    """Return list of (graph_name, exists, node_count, edge_count)."""
    expected = [
        "influence_graph.json",
        "architecture_graph.json",
        "organization_graph.json",
        "concept_dependency_graph.json",
    ]
    results = []
    for name in expected:
        path = GRAPHS_DIR / name
        exists = path.is_file()
        nodes = 0
        edges = 0
        if exists:
            data = load_json_safe(path)
            if isinstance(data, dict):
                nodes = len(data.get("nodes", []))
                edges = len(data.get("edges", []))
            elif isinstance(data, list):
                edges = len(data)
        results.append((name.replace(".json", ""), exists, nodes, edges))
    return results


def get_freshness() -> tuple[str, int]:
    """Find the most recent event date and return (date_str, days_behind)."""
    latest = None
    if EVENTS_DIR.is_dir():
        for json_file in EVENTS_DIR.glob("*.json"):
            data = load_json_safe(json_file)
            if data and isinstance(data, dict) and "date" in data:
                try:
                    d = datetime.strptime(data["date"], "%Y-%m-%d").date()
                    if latest is None or d > latest:
                        latest = d
                except (ValueError, TypeError):
                    pass
    if latest is None:
        return "N/A", -1
    today = date.today()
    delta = (today - latest).days
    return latest.isoformat(), delta


def get_geographic_diversity() -> Counter:
    """Count people by nationality."""
    counts = Counter()
    if not PEOPLE_DIR.is_dir():
        return counts
    for json_file in PEOPLE_DIR.glob("*.json"):
        data = load_json_safe(json_file)
        if data and isinstance(data, dict):
            nat = data.get("nationality", "Unknown")
            counts[nat] += 1
    return counts


def get_significance_distribution() -> Counter:
    """Collect significance scores across all entries."""
    dist = Counter()
    all_data = collect_all_json(SCAN_DIRS)
    for _, item in all_data:
        sig = item.get("significance")
        if sig is not None:
            try:
                dist[int(sig)] += 1
            except (ValueError, TypeError):
                pass
    return dist


# ── Rendering ────────────────────────────────────────────────────────────────

def box_top():
    return f"\u2554{'═' * W}\u2557"


def box_bottom():
    return f"\u255a{'═' * W}\u255d"


def box_sep():
    return f"\u2560{'═' * W}\u2563"


def box_line(text: str):
    # Pad/truncate to fit inside the box
    visible = text[:W]
    return f"\u2551 {visible:<{W - 1}}\u2551"


def bar_chart(value: int, max_val: int, max_bar_len: int = 16) -> str:
    """Return a block-character bar."""
    if max_val == 0:
        return ""
    length = int((value / max_val) * max_bar_len)
    return "\u2588" * max(length, 1) if value > 0 else ""


def render_dashboard():
    """Render the full ASCII health dashboard."""
    lines = []

    # ── Header ───────────────────────────────────────────────────────────
    lines.append(box_top())
    lines.append(box_line("    RETROSPEC Health Dashboard"))
    lines.append(box_line(f"    Generated: {date.today().isoformat()}"))

    # ── Coverage ─────────────────────────────────────────────────────────
    coverage = get_coverage()
    lines.append(box_sep())
    lines.append(box_line("Coverage"))

    items = list(coverage.items())
    # Print two per line
    for i in range(0, len(items), 2):
        left = f"  {items[i][0]}: {items[i][1]}"
        if i + 1 < len(items):
            right = f"{items[i+1][0]}: {items[i+1][1]}"
            line = f"{left:<26}{right}"
        else:
            line = left
        lines.append(box_line(line))

    total = sum(coverage.values())
    lines.append(box_line(f"  Total entries: {total}"))

    # ── Epoch Balance ────────────────────────────────────────────────────
    epoch_counts = get_epoch_counts()
    lines.append(box_sep())
    lines.append(box_line("Epoch Balance"))

    max_count = max(epoch_counts.values()) if epoch_counts else 1
    under_threshold = []
    for epoch_key in sorted(epoch_counts.keys()):
        count = epoch_counts[epoch_key]
        label = EPOCH_LABELS.get(epoch_key, epoch_key)
        bar = bar_chart(count, max_count, 14)
        flag = " !" if count < EPOCH_MIN_THRESHOLD else ""
        line = f"  {label:<18}{bar:<15}{count}{flag}"
        lines.append(box_line(line))
        if count < EPOCH_MIN_THRESHOLD:
            under_threshold.append(label)

    if under_threshold:
        lines.append(box_line(""))
        lines.append(box_line(f"  WARNING: {len(under_threshold)} epoch(s) below"))
        lines.append(box_line(f"  minimum threshold ({EPOCH_MIN_THRESHOLD} events)"))

    # ── Integrity ────────────────────────────────────────────────────────
    dangling, orphaned = get_integrity()
    lines.append(box_sep())
    lines.append(box_line("Integrity"))
    lines.append(box_line(f"  Dangling refs:  {dangling}"))
    lines.append(box_line(f"  Orphaned nodes: {orphaned}"))
    if dangling == 0 and orphaned == 0:
        lines.append(box_line("  Status: CLEAN"))
    elif dangling > 0:
        lines.append(box_line("  Status: NEEDS ATTENTION"))
    else:
        lines.append(box_line("  Status: OK (orphans are warnings)"))

    # ── Graph Statistics ─────────────────────────────────────────────────
    graph_stats = get_graph_stats()
    lines.append(box_sep())
    lines.append(box_line("Graph Files"))
    for name, exists, nodes, edges in graph_stats:
        if exists:
            lines.append(box_line(f"  {name}"))
            lines.append(box_line(f"    nodes: {nodes}  edges: {edges}"))
        else:
            lines.append(box_line(f"  {name}: MISSING"))

    # ── Freshness ────────────────────────────────────────────────────────
    latest_date, days_behind = get_freshness()
    lines.append(box_sep())
    lines.append(box_line("Freshness"))
    lines.append(box_line(f"  Latest event: {latest_date}"))
    if days_behind >= 0:
        lines.append(box_line(f"  Days behind:  {days_behind}"))
        if days_behind > 365:
            lines.append(box_line("  WARNING: Data may be stale (>1 year)"))
        elif days_behind > 90:
            lines.append(box_line("  NOTE: Consider adding recent events"))
    else:
        lines.append(box_line("  No event dates found"))

    # ── Geographic Diversity ─────────────────────────────────────────────
    geo = get_geographic_diversity()
    lines.append(box_sep())
    lines.append(box_line("Geographic Diversity (People)"))
    if geo:
        for nat, count in geo.most_common():
            lines.append(box_line(f"  {nat:<30}{count}"))
        lines.append(box_line(f"  Unique nationalities: {len(geo)}"))
    else:
        lines.append(box_line("  No nationality data found"))

    # ── Significance Distribution ────────────────────────────────────────
    sig_dist = get_significance_distribution()
    lines.append(box_sep())
    lines.append(box_line("Significance Score Distribution"))
    if sig_dist:
        max_sig = max(sig_dist.values()) if sig_dist else 1
        for score in range(1, 11):
            count = sig_dist.get(score, 0)
            bar = bar_chart(count, max_sig, 20)
            lines.append(box_line(f"  {score:>2}: {bar:<22}{count}"))
    else:
        lines.append(box_line("  No significance scores found"))

    # ── Footer ───────────────────────────────────────────────────────────
    lines.append(box_bottom())

    return "\n".join(lines)


def main():
    print(render_dashboard())


if __name__ == "__main__":
    main()
