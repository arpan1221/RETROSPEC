"""RETROSPEC — Query the AI history knowledge graph from Python."""

import json
import os
from collections import deque
from pathlib import Path
from typing import Any, Dict, List, Optional

from thefuzz import fuzz


def _read_json(file_path: Path) -> Optional[dict]:
    """Read and parse a single JSON file, returning None on failure."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _read_json_dir(directory: Path) -> List[dict]:
    """Read all .json files in a directory, skipping failures."""
    if not directory.is_dir():
        return []
    results = []
    for fp in sorted(directory.iterdir()):
        if fp.suffix == ".json":
            data = _read_json(fp)
            if data is not None:
                results.append(data)
    return results


def _entity_name(entity: dict) -> str:
    """Return the display name for an entity (title or name or id)."""
    return entity.get("title") or entity.get("name") or entity.get("id", "")


class Retrospec:
    """In-memory queryable interface to the RETROSPEC knowledge graph.

    Parameters
    ----------
    data_dir : str or None
        Path to the RETROSPEC repository root.  When *None* the class walks
        upward from its own source file looking for a directory that contains
        an ``epochs/`` subdirectory.
    """

    def __init__(self, data_dir: Optional[str] = None):
        self._data_dir = Path(data_dir) if data_dir else self._find_data_dir()
        self._entity_index: Dict[str, dict] = {}
        self._events: List[dict] = []
        self._people: List[dict] = []
        self._orgs: List[dict] = []
        self._models: List[dict] = []
        self._papers: List[dict] = []
        self._concepts: List[dict] = []
        self._cycles: List[dict] = []
        self._epochs: List[dict] = []
        self._graphs: Dict[str, dict] = {}
        self._load()

    # ------------------------------------------------------------------
    # Data loading
    # ------------------------------------------------------------------

    @staticmethod
    def _find_data_dir() -> Path:
        """Walk upward from this file looking for a repo root with epochs/."""
        current = Path(__file__).resolve().parent
        for _ in range(10):
            if (current / "epochs").is_dir():
                return current
            current = current.parent
        raise FileNotFoundError(
            "Could not auto-detect RETROSPEC repo root. "
            "Pass the path explicitly: Retrospec('/path/to/RETROSPEC')"
        )

    def _load(self) -> None:
        root = self._data_dir

        self._events = _read_json_dir(root / "events")
        self._people = _read_json_dir(root / "entities" / "people")
        self._orgs = _read_json_dir(root / "entities" / "organizations")
        self._models = _read_json_dir(root / "entities" / "models")
        self._papers = _read_json_dir(root / "papers")
        self._concepts = _read_json_dir(root / "concepts")
        self._cycles = _read_json_dir(root / "cycles")

        # Epochs live in epochs/<dir>/epoch.json
        epochs_dir = root / "epochs"
        if epochs_dir.is_dir():
            for d in sorted(epochs_dir.iterdir()):
                epoch_file = d / "epoch.json"
                if epoch_file.is_file():
                    data = _read_json(epoch_file)
                    if data is not None:
                        self._epochs.append(data)
            self._epochs.sort(key=lambda e: e.get("number", 0))

        # Graphs
        graph_items = _read_json_dir(root / "graphs")
        for g in graph_items:
            gid = g.get("id", "")
            if gid:
                self._graphs[gid] = g
                short = gid.replace("graph_", "")
                self._graphs[short] = g

        # Build entity index
        all_entities = (
            self._events
            + self._people
            + self._orgs
            + self._models
            + self._papers
            + self._concepts
            + self._cycles
            + self._epochs
        )
        for entity in all_entities:
            eid = entity.get("id")
            if eid:
                self._entity_index[eid] = entity

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def lookup(self, id: str) -> Optional[dict]:
        """Look up an entity by its exact id."""
        return self._entity_index.get(id)

    def search(self, query: str, limit: int = 10) -> List[dict]:
        """Fuzzy-search across all entities by name/title/summary/id.

        Returns a list of ``{"entity": dict, "score": int}`` dicts sorted
        by descending relevance.  The *score* is 0-100 (higher is better).
        """
        query_lower = query.lower()
        scored: List[dict] = []

        for entity in self._entity_index.values():
            best = 0
            # Weight name/title more heavily
            name = _entity_name(entity)
            if name:
                name_score = fuzz.token_set_ratio(query_lower, name.lower())
                best = max(best, int(name_score * 1.2))  # boost

            eid = entity.get("id", "")
            if eid:
                id_score = fuzz.partial_ratio(query_lower, eid.lower())
                best = max(best, int(id_score * 0.8))

            summary = entity.get("summary", "")
            if summary:
                summary_score = fuzz.token_set_ratio(query_lower, summary.lower())
                best = max(best, summary_score)

            # Also check query_hooks
            for hook in entity.get("query_hooks", []):
                hook_score = fuzz.token_set_ratio(query_lower, hook.lower())
                best = max(best, hook_score)

            if best >= 50:
                scored.append({"entity": entity, "score": min(best, 100)})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:limit]

    def trace_lineage(self, model_id: str) -> List[dict]:
        """Trace the ancestry of a model via its ``parent_models`` field.

        Returns a list starting with the given model and walking back
        through the first parent at each step.
        """
        chain: List[dict] = []
        current = self._entity_index.get(model_id)
        if current is None:
            return chain

        visited: set = set()
        while current and current.get("id") not in visited:
            visited.add(current["id"])
            chain.append(current)
            parents = current.get("parent_models", [])
            if not parents:
                break
            current = self._entity_index.get(parents[0])

        return chain

    def epoch_events(self, epoch_id: str) -> List[dict]:
        """Return all events that belong to an epoch, sorted by date."""
        return sorted(
            [e for e in self._events if e.get("epoch") == epoch_id],
            key=lambda e: e.get("date", ""),
        )

    def traverse(
        self,
        entity_id: str,
        graph: Optional[str] = None,
        depth: int = 1,
    ) -> List[dict]:
        """BFS traversal of relationship graphs from *entity_id*.

        Parameters
        ----------
        entity_id : str
            Starting entity.
        graph : str or None
            Graph id or short name (e.g. ``"influence"``).  If *None*,
            searches all loaded graphs.
        depth : int
            How many hops to traverse (default 1).

        Returns a list of dicts with keys ``entity``, ``relationship``,
        ``weight``, and ``direction`` (``"incoming"`` or ``"outgoing"``).
        """
        results: List[dict] = []

        if graph:
            graphs_to_search = [self._graphs.get(graph)]
        else:
            # Deduplicate (short name aliases point to same dict)
            graphs_to_search = list({id(v): v for v in self._graphs.values()}.values())

        for g in graphs_to_search:
            if g is None:
                continue
            edges = g.get("edges", [])
            visited: set = set()
            queue: deque = deque()
            queue.append((entity_id, 0))

            while queue:
                current_id, current_depth = queue.popleft()
                if current_depth >= depth or current_id in visited:
                    continue
                visited.add(current_id)

                for edge in edges:
                    if edge.get("source") == current_id:
                        results.append(
                            {
                                "entity": self._entity_index.get(edge["target"]),
                                "relationship": edge.get("relationship", ""),
                                "weight": edge.get("weight"),
                                "direction": "outgoing",
                            }
                        )
                        if current_depth + 1 < depth:
                            queue.append((edge["target"], current_depth + 1))

                    if edge.get("target") == current_id:
                        results.append(
                            {
                                "entity": self._entity_index.get(edge["source"]),
                                "relationship": edge.get("relationship", ""),
                                "weight": edge.get("weight"),
                                "direction": "incoming",
                            }
                        )
                        if current_depth + 1 < depth:
                            queue.append((edge["source"], current_depth + 1))

        return results

    def stats(self) -> dict:
        """Return counts of all loaded entity types."""
        return {
            "events": len(self._events),
            "people": len(self._people),
            "organizations": len(self._orgs),
            "models": len(self._models),
            "papers": len(self._papers),
            "concepts": len(self._concepts),
            "cycles": len(self._cycles),
            "epochs": len(self._epochs),
            "graphs": len({id(v): v for v in self._graphs.values()}),
            "total": len(self._entity_index),
        }

    # ------------------------------------------------------------------
    # Convenience properties
    # ------------------------------------------------------------------

    @property
    def events(self) -> List[dict]:
        """All loaded events."""
        return list(self._events)

    @property
    def people(self) -> List[dict]:
        """All loaded people."""
        return list(self._people)

    @property
    def organizations(self) -> List[dict]:
        """All loaded organizations."""
        return list(self._orgs)

    @property
    def models(self) -> List[dict]:
        """All loaded models."""
        return list(self._models)

    @property
    def papers(self) -> List[dict]:
        """All loaded papers."""
        return list(self._papers)

    @property
    def concepts(self) -> List[dict]:
        """All loaded concepts."""
        return list(self._concepts)

    @property
    def cycles(self) -> List[dict]:
        """All loaded cycles."""
        return list(self._cycles)

    @property
    def epochs(self) -> List[dict]:
        """All loaded epochs."""
        return list(self._epochs)
