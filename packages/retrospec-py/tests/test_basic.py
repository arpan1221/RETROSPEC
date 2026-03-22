"""Basic smoke tests for the retrospec package."""

from pathlib import Path

import pytest

from retrospec import Retrospec

# Point to the repo root (two levels up from packages/retrospec-py)
REPO_ROOT = str(Path(__file__).resolve().parent.parent.parent.parent)


@pytest.fixture(scope="module")
def r():
    return Retrospec(REPO_ROOT)


def test_init(r):
    s = r.stats()
    assert s["total"] > 100, f"Expected >100 entities, got {s['total']}"


def test_search(r):
    results = r.search("transformer")
    assert len(results) > 0
    # Results should have entity and score keys
    assert "entity" in results[0]
    assert "score" in results[0]


def test_lookup(r):
    entry = r.lookup("person_turing_alan")
    assert entry is not None
    assert entry["name"] == "Alan Turing"


def test_epoch_events(r):
    events = r.epoch_events("10_agentic_era")
    assert len(events) > 0


def test_trace_lineage(r):
    chain = r.trace_lineage("model_gpt_series")
    assert len(chain) >= 1
    assert chain[0].get("id") == "model_gpt_series"


def test_traverse(r):
    results = r.traverse("person_hinton_geoffrey", graph="influence")
    # May be empty if the graph doesn't have this entity, but should not error
    assert isinstance(results, list)


def test_properties(r):
    assert isinstance(r.events, list)
    assert isinstance(r.people, list)
    assert isinstance(r.organizations, list)
    assert isinstance(r.models, list)
    assert isinstance(r.papers, list)
    assert isinstance(r.concepts, list)
    assert isinstance(r.cycles, list)
    assert isinstance(r.epochs, list)


def test_stats_keys(r):
    s = r.stats()
    expected_keys = {
        "events", "people", "organizations", "models",
        "papers", "concepts", "cycles", "epochs", "graphs", "total",
    }
    assert expected_keys == set(s.keys())


def test_search_limit(r):
    results = r.search("neural", limit=3)
    assert len(results) <= 3


def test_lookup_missing(r):
    assert r.lookup("nonexistent_id_xyz") is None


def test_trace_lineage_missing(r):
    assert r.trace_lineage("nonexistent_model") == []
