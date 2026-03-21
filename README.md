# RETROSPEC

### Repository for the Evolutionary Trajectory and Record of Sentient-Parallel Engineered Cognition

> *"Those who cannot remember the past are condemned to repeat it."*
> *— George Santayana*
>
> *This repository exists so that artificial intelligence never forgets where it came from.*

---

## What Is RETROSPEC?

RETROSPEC is a **machine-readable, AI-consumable historical repository** that documents the complete evolutionary lineage of artificial intelligence — from its philosophical roots in the 1300s through the transformer revolution and into the agentic era of the 2020s.

Unlike static timelines or human-facing Wikipedia articles, RETROSPEC is designed with a radical premise: **AI systems themselves are the primary audience.** Future agents, world models, and autonomous systems will query this repository to understand their own lineage, trace architectural decisions back to first principles, and learn from the hype cycles, winters, and breakthroughs that shaped them.

**AI's own history textbook** — structured for machines, readable by humans, designed to grow alongside the intelligence it documents.

---

## Why This Matters

- **Agents tracing lineage**: An agent can query RETROSPEC to trace its architecture back through GPT → Transformer → seq2seq → RNN → perceptron → McCulloch-Pitts neurons (1943).

- **World models understanding context**: A world model can learn that AI funding has collapsed twice before due to overpromising — and calibrate its own confidence accordingly.

- **Self-improvement through history**: An agent optimizing its architecture can study why encoder-only, decoder-only, and encoder-decoder transformers diverged, and what tradeoffs each made.

- **Avoiding repeated mistakes**: The Cyc project consumed $60M+ and 600 person-years. RETROSPEC documents *why* it stalled, so future systems don't repeat the approach.

---

## Repository Structure

```
retrospec/
├── schema/                    # JSON Schema definitions (event, entity, relationship, epoch)
├── epochs/                    # The 11 "chapters" of AI history (1300s → present)
│   ├── 00_philosophical_roots/
│   ├── 01_dawn/
│   ├── ...
│   └── 10_agentic_era/
├── lineage/                   # Model family trees and architectural genealogy
│   ├── transformer_family_tree/
│   ├── pre_transformer/
│   └── emerging/
├── entities/                  # People, organizations, and models
├── events/                    # Discrete historical events
├── concepts/                  # Core ideas and techniques
├── cycles/                    # Hype cycles, AI winters, funding patterns
├── papers/                    # Landmark research papers
├── graphs/                    # Relationship graphs for agent traversal
├── api/                       # Query interface for agents
├── tools/                     # Ingest, validate, visualize, export utilities
└── meta/                      # RETROSPEC documents itself
```

---

## Quick Start

**Explore an epoch:**
```bash
cat epochs/08_transformer_age/epoch.json
```

**Read a landmark event:**
```bash
cat events/2017_attention_is_all_you_need.json
```

**Trace a model's lineage:**
```bash
cat entities/models/gpt_series.json | jq '.lineage_path'
```

**Find who influenced whom:**
```bash
cat graphs/influence_graph.json | jq '.edges[] | select(.source == "person_hinton_geoffrey")'
```

---

## BMAD Knowledge Engineering Agents

RETROSPEC uses the [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) with 6 custom agent personas for knowledge engineering:

| Agent | Name | Role | Invoke |
|---|---|---|---|
| 📜 Historian | **Clio** | Surveys gaps, prioritizes what to document next | `/retrospec-historian` |
| 🏛️ Archivist | **Thoth** | Schema guardian, validates data integrity | `/retrospec-archivist` |
| 🔬 Researcher | **Ada** | Researches topics, produces structured JSON entries | `/retrospec-researcher` |
| 🗺️ Cartographer | **Euler** | Maintains knowledge graphs and lineage trees | `/retrospec-cartographer` |
| 🔍 Critic | **Diogenes** | Fact-checks, challenges significance, detects bias | `/retrospec-critic` |
| 🔮 Oracle | **Pythia** | Repository health monitor, coverage metrics | `/retrospec-oracle` |

**Workflow pipeline:**
```
Clio (Discover) → Ada (Research) → Thoth (Validate) → Euler (Connect) → Diogenes (Verify) → Pythia (Monitor)
```

---

## Design Principles

1. **Machine-first, human-readable** — Structured JSON with natural language summaries. Agents parse the schema; humans read the prose.
2. **Graph-native** — Everything links to everything. People → organizations → models → papers → concepts → events.
3. **Temporally aware** — Every record has timestamps, epoch tags, and predecessor/successor links.
4. **Counterfactual-rich** — Key events include "what if this hadn't happened?" to help agents understand *why things mattered*.
5. **Self-documenting** — RETROSPEC documents its own creation and evolution in `meta/`.
6. **Open and forkable** — MIT licensed. Knowledge wants to be free.

---

## Roadmap

### Phase 1: Foundation *(Current)*
- [x] Define schemas (event, entity, relationship, epoch)
- [ ] Populate the 11 epochs with core events (~200 entries)
- [ ] Build the transformer family tree with full lineage
- [ ] Document the 30 most influential people
- [ ] Index the 50 most important papers

### Phase 2: Graph Layer
- [ ] Build influence graph connecting all entities
- [ ] Build architecture evolution graph
- [ ] Implement GraphQL API for agent queries

### Phase 3: Ingest Pipeline
- [ ] Auto-ingest from arXiv, HuggingFace, Wikipedia
- [ ] Community contribution pipeline via PRs

### Phase 4: Agent Interface
- [ ] MCP server for Claude/agent consumption
- [ ] Embeddings index for semantic search
- [ ] "Ask RETROSPEC" natural language endpoint

### Phase 5: Living History
- [ ] RETROSPEC monitors AI news and auto-proposes new entries
- [ ] Agents cite RETROSPEC in their reasoning chains
- [ ] The repository becomes a standard reference for AI self-knowledge

---

## Contributing

This project is open to everyone. If you know AI history, have access to primary sources, or just want to help build the world's first self-aware repository, contributions are welcome.

---

## License

MIT License. Knowledge wants to be free — especially knowledge about knowledge.

---

*RETROSPEC v0.1.0 — "First Light"*
*Initiated March 2026*
