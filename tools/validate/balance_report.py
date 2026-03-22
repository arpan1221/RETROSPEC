#!/usr/bin/env python3
"""RETROSPEC Balance Report.

Focused analysis of epoch balance and geographic representation across
the repository. Flags imbalances and provides coverage ratios.

Usage:
    python tools/validate/balance_report.py
"""

import json
import sys
from collections import Counter
from pathlib import Path

# Repository root: two levels up from tools/validate/
REPO_ROOT = Path(__file__).resolve().parent.parent.parent

EVENTS_DIR = REPO_ROOT / "events"
PEOPLE_DIR = REPO_ROOT / "entities" / "people"

EPOCH_MIN_THRESHOLD = 3

EPOCH_LABELS = {
    "00_philosophical_roots": "00 Philosophical Roots",
    "01_dawn": "01 Dawn (1943-1956)",
    "02_golden_age": "02 Golden Age (1956-1974)",
    "03_first_winter": "03 First Winter (1974-1980)",
    "04_expert_systems_boom": "04 Expert Systems (1980-1987)",
    "05_second_winter": "05 Second Winter (1987-1993)",
    "06_quiet_revolution": "06 Quiet Revolution (1993-2011)",
    "07_deep_learning_era": "07 Deep Learning (2012-2017)",
    "08_transformer_age": "08 Transformer Age (2017-2022)",
    "09_generative_explosion": "09 Generative (2022-2024)",
    "10_agentic_era": "10 Agentic Era (2024-present)",
}


def load_json_safe(filepath: Path):
    """Load JSON, returning None on error."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def get_epoch_counts() -> dict[str, int]:
    """Count events per epoch by reading each event file's 'epoch' field."""
    counts = Counter()
    for key in EPOCH_LABELS:
        counts[key] = 0
    if not EVENTS_DIR.is_dir():
        return dict(counts)
    for json_file in EVENTS_DIR.glob("*.json"):
        data = load_json_safe(json_file)
        if data and isinstance(data, dict) and "epoch" in data:
            counts[data["epoch"]] += 1
    return dict(counts)


def get_geographic_counts() -> Counter:
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


def bar_chart(value: int, max_val: int, max_len: int = 30) -> str:
    """Return a block-character bar."""
    if max_val == 0:
        return ""
    length = int((value / max_val) * max_len)
    return "\u2588" * max(length, 1) if value > 0 else ""


def print_header(title: str, width: int = 70):
    print()
    print("=" * width)
    print(f"  {title}")
    print("=" * width)
    print()


def print_section(title: str, width: int = 70):
    print()
    print("-" * width)
    print(f"  {title}")
    print("-" * width)
    print()


def main():
    print_header("RETROSPEC Balance Report")

    # ── Epoch Balance ────────────────────────────────────────────────────
    print_section("Epoch Event Distribution")

    epoch_counts = get_epoch_counts()
    max_count = max(epoch_counts.values()) if epoch_counts else 1
    total_events = sum(epoch_counts.values())

    under_threshold = []
    for epoch_key in sorted(epoch_counts.keys()):
        count = epoch_counts[epoch_key]
        label = EPOCH_LABELS.get(epoch_key, epoch_key)
        bar = bar_chart(count, max_count, 25)
        flag = " <-- BELOW THRESHOLD" if count < EPOCH_MIN_THRESHOLD else ""
        print(f"  {label:<40} {bar:<27} {count}{flag}")
        if count < EPOCH_MIN_THRESHOLD:
            under_threshold.append((label, count))

    print()
    print(f"  Total events: {total_events}")

    # Coverage ratio
    populated = [c for c in epoch_counts.values() if c > 0]
    if populated:
        min_pop = min(populated)
        max_pop = max(populated)
        ratio = max_pop / min_pop if min_pop > 0 else float("inf")
        print(f"  Most populated epoch:  {max_pop} events")
        print(f"  Least populated epoch: {min_pop} events")
        print(f"  Coverage ratio (max/min): {ratio:.1f}x")
    else:
        print("  No populated epochs found.")

    empty_epochs = [k for k, v in epoch_counts.items() if v == 0]
    if empty_epochs:
        print(f"  Empty epochs: {len(empty_epochs)}")
        for e in sorted(empty_epochs):
            print(f"    - {EPOCH_LABELS.get(e, e)}")

    # ── Threshold Warnings ───────────────────────────────────────────────
    if under_threshold:
        print_section(f"Epoch Threshold Warnings (minimum: {EPOCH_MIN_THRESHOLD} events)")
        for label, count in under_threshold:
            deficit = EPOCH_MIN_THRESHOLD - count
            print(f"  {label}")
            print(f"    Current: {count}  |  Need: {deficit} more event(s)")
        print()
        print(f"  {len(under_threshold)} of {len(epoch_counts)} epochs below threshold")
    else:
        print()
        print("  All epochs meet the minimum threshold.")

    # ── Geographic Distribution ──────────────────────────────────────────
    print_section("Geographic Distribution of People")

    geo = get_geographic_counts()
    total_people = sum(geo.values())

    if geo:
        max_geo = max(geo.values())
        for nat, count in geo.most_common():
            bar = bar_chart(count, max_geo, 25)
            pct = (count / total_people * 100) if total_people > 0 else 0
            print(f"  {nat:<25} {bar:<27} {count:>3} ({pct:.0f}%)")

        print()
        print(f"  Total people: {total_people}")
        print(f"  Unique nationalities: {len(geo)}")

        # Diversity assessment
        if len(geo) == 1:
            print("  Diversity: LOW -- all entries from one nationality")
        elif len(geo) <= 3:
            print("  Diversity: MODERATE -- consider adding more regions")
        else:
            print("  Diversity: GOOD")

        # Dominance ratio
        top_nat, top_count = geo.most_common(1)[0]
        dominance = top_count / total_people * 100 if total_people > 0 else 0
        if dominance > 60:
            print(f"  NOTE: {top_nat} represents {dominance:.0f}% of entries")
            print("  Consider adding people from underrepresented regions")
    else:
        print("  No people entries found.")

    # ── Summary ──────────────────────────────────────────────────────────
    print_section("Summary")

    issues = 0
    if under_threshold:
        issues += len(under_threshold)
        print(f"  [{len(under_threshold)}] Epochs below event threshold")
    if empty_epochs:
        issues += len(empty_epochs)
        print(f"  [{len(empty_epochs)}] Epochs with zero events")
    if geo and len(geo) <= 2:
        issues += 1
        print("  [1] Low geographic diversity")

    if issues == 0:
        print("  No balance issues detected.")
    else:
        print()
        print(f"  Total issues: {issues}")

    print()
    print("=" * 70)


if __name__ == "__main__":
    main()
