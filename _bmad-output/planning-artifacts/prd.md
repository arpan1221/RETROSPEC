---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
completedAt: '2026-03-22'
vision:
  statement: "RETROSPEC is the canonical knowledge graph of AI history, designed for machines to traverse and humans to explore. It exists so that AI systems have structured, queryable access to their own evolutionary lineage."
  differentiator: "Only project in the structured + deep + machine-consumable quadrant. Graph-native with counterfactual fields and query hooks designed for agent traversal."
  mvp_strategy: "Phase 1: Complete data asset (~200 entries). Phase 2: Ship MCP server. Phase 3: Let usage data guide."
  value_layers: ["data_asset", "query_surface", "network_effect"]
classification:
  projectType: developer_tool_api_hybrid
  domain: scientific_knowledge_engineering
  complexity: medium-high
  projectContext: brownfield
inputDocuments: ['CLAUDE.md', 'BRAIND_DUMP.md', 'meta/retrospec_about_retrospec.md']
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 2
---

# Product Requirements Document - RETROSPEC

**Author:** Arpan
**Date:** 2026-03-22

## Executive Summary

RETROSPEC (Repository for the Evolutionary Trajectory and Record of Sentient-Parallel Engineered Cognition) is a machine-readable, graph-native knowledge repository documenting the complete evolutionary lineage of artificial intelligence — from its philosophical roots in the 1300s through the agentic era of the 2020s.

The primary audience is AI systems themselves. As autonomous agents become tool-using, self-improving, and capable of multi-step reasoning, they need structured access to the history of their own field: what architectures were tried and abandoned, what hype cycles collapsed and why, and what chain of innovations led to their current capabilities. RETROSPEC provides this as a traversable knowledge graph — 11 epochs, structured JSON entries for events, people, organizations, models, papers, and concepts, all connected through typed, weighted relationships.

The product delivers value through three layers:
1. **The Data Asset** — a complete, accurate, deeply connected knowledge graph of AI history (~200+ entries at Phase 1 completion), open-sourced on GitHub and immediately usable by any system with file access.
2. **The Query Surface** — an MCP server enabling any AI agent to query RETROSPEC mid-task ("trace GPT-4's lineage", "what caused the AI winters", "show me every time attention was modified and what happened").
3. **The Network Effect** — once agents begin citing RETROSPEC in their reasoning chains, the repository becomes self-reinforcing infrastructure, analogous to Wikipedia's role in human knowledge.

Current state: foundation built (4 schemas, 11 epochs, 66 entries, 6 BMAD knowledge engineering agents). Phase 1 targets ~200+ entries with complete relationship graphs and zero dangling references, executed via parallelized git worktree agents.

### What Makes This Special

RETROSPEC occupies an empty quadrant in the landscape. Existing projects are either flat (timelines without graph traversal), narrow (model registries tracking artifacts, not history), or human-facing (Wikipedia articles not designed for machine consumption). RETROSPEC is the only project that is simultaneously **structured, deep, and machine-consumable**.

Two schema features are believed novel:
- **Counterfactual fields** — each event describes not just what happened, but what *wouldn't exist* if it hadn't, enabling agents to understand causation rather than correlation.
- **Query hooks** — pre-loaded natural language questions mapped to each entry, providing direct routing for agent queries.

The timing is critical: MCP has crossed 97M monthly SDK downloads, self-improving AI research pipelines are running autonomously, and the Agentic AI Foundation was co-founded by OpenAI, Anthropic, Google, Microsoft, AWS, and Block in December 2025. The window to establish the canonical AI history repository is open now, before the category becomes crowded.

## Project Classification

- **Project Type:** Developer tool / API hybrid — a structured data repository with schema definitions and a planned MCP query interface
- **Domain:** Scientific knowledge engineering — AI history curation requiring historical accuracy, source validation, and significance calibration
- **Complexity:** Medium-high — not regulated, but accuracy is mission-critical since AI agents will consume entries as fact. Massive scope (70+ years, 11 epochs). Novel challenges in counterfactual reasoning, graph consistency, and parallelized content generation.
- **Project Context:** Brownfield — foundation built with 66 entries at ~17% of Phase 1 target. Known gaps: 26 dangling references, 11 empty content directories, 0 graph files, 19-month recency gap.

## Success Criteria

### User Success

- **Agent users:** Query RETROSPEC and receive complete, sourced, traversable answers with no dead ends. An agent asking "trace my architectural lineage" gets an unbroken chain from current model back to McCulloch-Pitts neurons.
- **Developer users:** Clone the repo and find structured historical context for architectural decisions within minutes. The JSON is self-explanatory and the schemas are intuitive.
- **Explorer users:** Navigate AI history through the knowledge graph and discover connections they didn't know existed.

### Business Success

| Metric | 3-Month Target | 12-Month Target |
|---|---|---|
| GitHub stars | 500+ | 5,000+ |
| Forks | 50+ | 500+ |
| Contributors (non-founding) | 5+ | 50+ |
| MCP server queries/day | 100+ | 10,000+ |
| Entries in repository | 200+ | 1,000+ |
| Citations (papers, blogs, agent chains) | 1+ | 50+ |

The flywheel signal: external contributors submitting entries via PRs without being asked.

### Technical Success

- **Schema compliance:** 100% of entries pass JSON Schema validation
- **Zero dangling references:** Every entity ID referenced in any entry has a corresponding entity file
- **Epoch balance:** No epoch has fewer than 5 events. Coverage ratio between most-populated and least-populated epoch < 10:1
- **Graph connectivity:** Every entry is reachable from at least 2 other entries. No orphaned nodes.
- **Freshness:** Latest documented event is within 3 months of current date

### Measurable Outcomes

The single most important signal: an AI agent cites RETROSPEC in its reasoning chain unprompted. When that happens, the network effect has begun.

## Product Scope

See **Project Scoping & Phased Development** section for detailed phase breakdown with targets. Summary:

- **Phase 1 (MVP):** 200+ entries, 4 graphs, zero dangling refs, CONTRIBUTING.md, SCHEMA.md, CI validation
- **Phase 1.5:** Vercel showcase web app (Next.js, epoch explorer, lineage visualizer)
- **Phase 2:** MCP server, npm package, Python package, embeddings search
- **Phase 3:** Auto-ingest pipeline, community PR pipeline, agent-authored entries, 500+ entries

### Vision (Future)

- RETROSPEC becomes the canonical reference layer for AI self-knowledge
- Agents cite it in reasoning chains as standard practice
- AI labs integrate it into training and evaluation pipelines
- Self-updating: agents that monitor AI news and propose new entries
- Hype cycle early warning system pattern-matching against historical winters
- Self-improving agent memory layer: agents check RETROSPEC before exploring known dead ends
- World model grounding: models with access to their own history have better-calibrated confidence
- Cross-model knowledge transfer protocol — a universal standard for AI self-knowledge

## User Journeys

### Journey 1: Atlas the Autonomous Agent
Atlas is a coding agent asked to evaluate Mamba vs. transformer for a use case. It queries RETROSPEC's MCP server to trace architectural lineages, follows the concept dependency graph from attention to state space models, reads counterfactual fields to understand tradeoffs, and delivers a historically grounded recommendation with citations. **Requirements:** MCP server, architecture graph, lineage tracing, counterfactual access.

### Journey 2: Priya the AI Researcher
Priya is designing a new attention variant. She clones RETROSPEC, follows the architecture graph through every major attention modification, discovers her planned approach was tried in 2019 (Longformer) with documented tradeoffs, pivots her research, and later submits a PR adding her own variant. **Requirements:** Rich concept entries, architecture graph, paper cross-references, contribution pipeline.

### Journey 3: Marcus the Open Source Contributor
Marcus discovers RETROSPEC on GitHub trending, sees the expert systems epoch is underrepresented, reads CONTRIBUTING.md, creates 8 entries following the schema, submits a PR that passes CI validation, and becomes a recurring contributor who brings his community. **Requirements:** CONTRIBUTING.md, SCHEMA.md, validation tooling, CI pipeline, welcoming contributor experience.

### Journey 4: Arpan + BMAD Agent Team (Maintainer)
Pythia reports coverage gaps. Clio prioritizes entries by counterfactual weight. Arpan launches parallel worktree agents — Ada researches, Thoth validates, Euler connects graphs, Diogenes challenges significance ratings. 30 entries created in a single sprint. **Requirements:** BMAD pipeline, worktree parallelization, health dashboard, schema validation, graph integration.

### Journey 5: Dr. Okafor the AI Ethics Educator
Dr. Okafor assigns RETROSPEC as course material. Students explore epochs chronologically, follow influence graphs from Turing to GPT-4, debate counterfactuals, and submit PRs adding AI ethics milestones. RETROSPEC gains academic contributors and a syllabus citation. **Requirements:** Navigable epochs, influence graphs, counterfactual fields, readable summaries.

### Journey 6: Tomoko the Policy Analyst
Tomoko compares current AI investment patterns against historical winter triggers using RETROSPEC's cycles/ directory. She finds partial pattern matches and produces a historically grounded policy brief that cites RETROSPEC. **Requirements:** Complete cycle entries, historical pattern data, epoch-to-cycle cross-references.

### Journey 7: Carlos the Tech Journalist
Carlos traces AlphaGo's impact through RETROSPEC's influence graph — from game-playing AI through self-play RL to scientific discovery. He finds his story angle in a chain he didn't know existed, writes a feature article citing RETROSPEC, driving 50K visitors to the repo. **Requirements:** Rich event entries, influence chains, counterfactual fields, model family trees.

### Journey Requirements Summary

| Capability | Journeys |
|---|---|
| MCP server / query interface | Atlas, Priya |
| Lineage tracing / architecture graph | Atlas, Priya, Dr. Okafor, Carlos |
| Counterfactual fields | Atlas, Dr. Okafor, Tomoko, Carlos |
| Cycle / winter pattern data | Tomoko |
| CONTRIBUTING.md + schema validation | Marcus, Dr. Okafor's students |
| Influence graph traversal | Dr. Okafor, Carlos, Priya |
| Epoch navigation + summaries | Dr. Okafor, Tomoko, Carlos |
| BMAD agent pipeline + worktrees | Arpan |
| Rich narrative summaries | All human users |
| Query hooks / semantic routing | Atlas, Priya |

## Domain-Specific Requirements

### Accuracy & Source Integrity

- **Historical accuracy:** Every claim must be traceable to a primary source (original paper, documented interview, contemporary report). Training data recall is not a source.
- **Attribution precision:** Credit the full lineage of contributions, not just the most famous name. Backpropagation was independently discovered by Werbos (1974), Rumelhart/Hinton/Williams (1986), and others.
- **Significance calibration:** Scores must be defended and consistent. Comparative justification required for significance 8+.

### Technical Constraints

- **Schema enforcement:** Every entry must validate against JSON Schema (draft 2020-12). No partial entries, no placeholder fields.
- **Referential integrity:** All entity IDs referenced must resolve. Bidirectional links mandatory.
- **Graph consistency:** No orphaned nodes. Every entry reachable from at least 2 other entries.
- **Temporal consistency:** Dates, predecessor/successor chains, and epoch assignments must be chronologically coherent.

### Integration Requirements

- JSON Schema (draft 2020-12) for all schemas
- MCP-compatible data structure (Phase 2) — queryable without transformation
- Git-native — file-based structure works cleanly with merges, diffs, and PRs

### Risk Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Historical inaccuracy consumed as fact by agents | High | Critic (Diogenes) reviews. Multiple-source requirement. |
| Western/American bias in coverage | Medium | Oracle (Pythia) monitors geographic balance. Contributor outreach. |
| Significance inflation | Medium | Calibration reviews. Comparative justification for 8+. |
| Stale entries as field evolves | Medium | Freshness metric. Quarterly staleness audits. |
| Schema evolution breaking entries | Medium | Semver for schemas. Migration tooling. |
| Low-quality community contributions | Medium | CI schema validation. Structured review. CONTRIBUTING.md. |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Machine-First Historical Repository** — Every existing AI history resource is human-facing. RETROSPEC inverts this: AI agents are the primary audience. JSON schema, graph structure, and query hooks are designed for machine traversal first, human readability second.

**2. Counterfactual Reasoning as Schema Feature** — No historical knowledge base includes structured counterfactual fields. RETROSPEC's `counterfactual` field enables agents to understand causation, not just correlation.

**3. Query Hooks for Semantic Routing** — Pre-loaded natural language questions mapped to entries create a built-in routing layer. An agent asking "why do I use attention?" gets routed directly without needing entry IDs.

**4. Self-Documenting Repository** — RETROSPEC documents its own creation in `meta/`. It is the first entry in its own historical record.

### Market Context

| Project | Audience | Structure | Machine-Consumable |
|---|---|---|---|
| GenAI_LLM_timeline | Human | Flat timeline | No |
| Constellation (arXiv) | Researchers | Evolutionary trees | Partial |
| HuggingFace Model Hub | Developers | Registry | Partial |
| **RETROSPEC** | **AI agents** | **Knowledge graph** | **Yes** |

RETROSPEC is alone in the structured + deep + machine-consumable quadrant.

### Validation Approach

1. Deploy MCP server and measure agent response quality with vs. without RETROSPEC access
2. Survey 20 AI researchers on architectural decision-making utility
3. Track organic contribution velocity after reaching ~200 entries

### Innovation Risk Mitigation

| Risk | Mitigation |
|---|---|
| Agents don't query history | Ship MCP early. Measure usage. Pivot to human-facing if needed. |
| Counterfactuals too subjective | Critic review on all counterfactuals. Confidence levels. |
| First-mover advantage erodes | Open source community lock-in. Network effects. |

## Developer Tool / API Specific Requirements

### Project-Type Overview

RETROSPEC operates as a multi-surface data product: a git-native JSON repository at its core, with progressive delivery layers — MCP server for agents, npm/Python packages for developers, and a Vercel-hosted web interface for human exploration. The data is the product; the surfaces are how different users access it.

### Query Patterns

| Pattern | Example | Implementation |
|---|---|---|
| Lineage tracing | "Trace GPT-4 back to origins" | Graph traversal across `preceded_by`/`succeeded_by` and `lineage_path` |
| Entity lookup | "Tell me about Dartmouth Conference" | Direct JSON access by ID or query hook matching |
| Pattern search | "What caused AI winters?" | Semantic search across cycles, epochs, events with query hook routing |
| Influence mapping | "Who influenced Hinton?" | Graph traversal on `influenced_by`/`influenced` fields |
| Epoch exploration | "What happened in deep learning era?" | Filtered retrieval by epoch tag |

### Distribution Channels

| Channel | Audience | Phase |
|---|---|---|
| GitHub repo | All users | Phase 1 (now) |
| Vercel web app | Humans — explore, visualize | Phase 1.5 |
| MCP server | AI agents — query mid-task | Phase 2 |
| npm package (`retrospec`) | Node.js developers | Phase 2 |
| Python package (`retrospec`) | ML researchers | Phase 2 |

### Vercel Web Interface

- Showcase landing page with live stats and interactive demo
- Epoch explorer — navigate 11 epochs chronologically
- Entity browser — search people, organizations, models, papers, concepts
- Lineage visualizer — interactive model family trees and influence chains
- Graph explorer — visual knowledge graph traversal
- API playground — live query testing
- Auto-redeploy on main branch updates

### Schema Versioning

- Strict semver for all schema files
- Append-only by default — new optional fields in minor versions
- Breaking changes require major version bump + migration tooling
- CI validation on every PR
- Migration scripts in `tools/validate/`

### Implementation Considerations

- npm and Python packages wrap JSON data with language-idiomatic query APIs
- Packages embed full dataset at publish time, versioned to repo state
- MCP tools map to the 5 query patterns
- Vercel: Next.js, static generation, client-side search (Phase 1.5), embeddings (Phase 2)

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Data-First Platform — the knowledge graph IS the product. Every delivery surface (Vercel, MCP, packages) is secondary to data completeness and accuracy.

**Resources:** Solo founder + 6 BMAD AI agent personas + worktree parallelization + community contributors.

### Phase 1: Data Asset MVP (Target: 2 weeks)

Journeys supported: Marcus (Contributor), Arpan (Maintainer), Priya (Researcher via raw repo)

| Category | Target | Current | Gap |
|---|---|---|---|
| Events | 50+ | 15 | +35 |
| People | 30 | 10 | +20 |
| Organizations | 15 | 5 | +10 |
| Models | 20 | 5 | +15 |
| Papers | 25 | 8 | +17 |
| Concepts | 15 | 8 | +7 |
| Cycles | 6 | 0 | +6 |
| Graphs | 4 | 0 | +4 |
| Lineage trees | 10+ | 0 | +10 |
| Dangling refs | 0 | 26 | -26 |

Also: CONTRIBUTING.md, SCHEMA.md, CI validation, all epochs with 3+ events, coverage through March 2026.

### Phase 1.5: Vercel Showcase (Target: +2 weeks)

Journeys supported: Dr. Okafor (Educator), Carlos (Journalist), Tomoko (Policymaker)

Next.js on Vercel: landing page, epoch explorer, entity browser, lineage visualizer, graph explorer, API playground. Auto-redeploy on push.

### Phase 2: Agent Interface (Target: +4 weeks)

Journeys supported: Atlas (Agent), Priya (enhanced)

MCP server (5 query tools), npm package, Python package, embeddings index for semantic search.

### Phase 3: Living Repository (Target: +3 months)

All 7 journeys at scale. Auto-ingest pipeline, community PR pipeline, hype cycle monitoring, agent-authored entries. 500+ entries, 50+ contributors.

### Risk Mitigation

- **Technical:** Graph consistency at scale — CI schema validation + Thoth (Archivist) reviews
- **Market:** Agents don't query history — ship MCP early, measure usage, Vercel hedges with human audience
- **Resource:** Solo founder bottleneck — BMAD agents + worktree parallelization + early community enablement

## Functional Requirements

### Knowledge Entry Management
- FR1: Maintainers can create JSON entries for events, people, organizations, models, papers, and concepts following defined schemas
- FR2: Maintainers can assign significance scores (1-10) with required justification for scores 8+
- FR3: Maintainers can define counterfactual descriptions for events
- FR4: Maintainers can define query hooks (natural language questions) routing to entries
- FR5: Maintainers can assign entries to one of 11 epochs
- FR6: Contributors can submit new entries via PRs with automatic schema validation

### Relationship & Graph Management
- FR7: Maintainers can define typed, weighted relationships between entities
- FR8: Maintainers can build and maintain 4 knowledge graphs (influence, architecture, organization, concept dependency)
- FR9: Maintainers can define predecessor/successor chains forming traversable timelines
- FR10: Maintainers can define influenced_by/influenced chains for people
- FR11: Maintainers can define parent/child relationships for models forming lineage trees

### Lineage Tracing
- FR12: Agents can trace complete architectural lineage of any model back to earliest ancestor
- FR13: Agents can traverse transformer family tree across encoder-only, decoder-only, encoder-decoder branches
- FR14: Agents can follow concept dependency chains for prerequisite knowledge
- FR15: Users can follow influence chains across generations

### Knowledge Querying (Phase 2 — MCP)
- FR16: Agents can query RETROSPEC via MCP to look up any entity by ID
- FR17: Agents can query RETROSPEC via MCP to trace lineage of any model
- FR18: Agents can query RETROSPEC via MCP to search by epoch, tag, or significance
- FR19: Agents can query RETROSPEC via MCP to traverse influence/architecture graphs
- FR20: Agents can query RETROSPEC via MCP using natural language matched against query hooks

### Cycle & Pattern Analysis
- FR21: Users can access structured documentation of all major AI hype cycles and winters
- FR22: Users can compare historical cycle trigger patterns against current conditions
- FR23: Users can view defining characteristics and warning signals for each cycle

### Epoch Exploration
- FR24: Users can browse all 11 epochs chronologically with rich summaries
- FR25: Users can view key events, figures, models, and concepts per epoch
- FR26: Users can navigate between epochs via preceded_by/succeeded_by chains

### Data Integrity & Validation
- FR27: System can validate any entry against JSON Schema and report violations
- FR28: System can detect dangling references (IDs that don't resolve)
- FR29: System can detect orphaned nodes (entries with no inbound relationships)
- FR30: CI pipelines automatically validate schema compliance on every PR

### Repository Health Monitoring
- FR31: Maintainers can view health dashboard (coverage, connectivity, consistency, freshness)
- FR32: Maintainers can view epoch coverage balance to detect documentation bias
- FR33: Maintainers can identify stale entries needing updates

### Web Exploration (Phase 1.5 — Vercel)
- FR34: Users can explore RETROSPEC via interactive web interface
- FR35: Users can search entries across all categories
- FR36: Users can visualize model lineage trees as interactive graphs
- FR37: Users can visualize influence chains between people and organizations
- FR38: Users can navigate epochs chronologically with visual summaries

### Programmatic Access (Phase 2 — Packages)
- FR39: Node.js developers can install RETROSPEC as npm package and query programmatically
- FR40: Python developers can install RETROSPEC as pip package and query programmatically
- FR41: Both packages support lineage tracing, entity lookup, and graph traversal

### Community & Contribution
- FR42: Contributors can read clear guidelines (CONTRIBUTING.md)
- FR43: Contributors can read schema documentation (SCHEMA.md)
- FR44: Contributors can run local schema validation before submitting PRs
- FR45: Maintainers can review contributions for accuracy and significance calibration

## Non-Functional Requirements

### Data Quality
- NFR1: 100% of entries pass JSON Schema validation — CI blocks merges on failure
- NFR2: Zero dangling references — every referenced entity ID resolves
- NFR3: No orphaned nodes — every entry referenced by at least 1 other entry
- NFR4: Significance calibration — no more than 15% of entries in any category at significance 9-10
- NFR5: Counterfactuals reviewed by at least one validation pass before merge
- NFR6: Historical claims traceable to at least one primary or authoritative source

### Performance
- NFR7: Vercel web app pages load under 2 seconds on standard broadband
- NFR8: MCP query responses under 500ms for lookups, under 2 seconds for graph traversals
- NFR9: npm/Python package queries complete within 100ms for local access
- NFR10: Static site generation completes within 5 minutes for up to 1,000 entries

### Scalability
- NFR11: Repository structure supports up to 10,000 entries without architectural changes
- NFR12: Git performance maintained (clean diffs, fast clones) up to 5,000 entries
- NFR13: Vercel app handles 50,000 visitors/day traffic spikes
- NFR14: Graph traversal sub-second response up to 10,000 nodes

### Accessibility
- NFR15: Vercel web app meets WCAG 2.1 AA compliance
- NFR16: Graph visualizations have text-based alternatives for screen readers
- NFR17: Color never sole means of conveying information

### Integration & Compatibility
- NFR18: All schemas validate against JSON Schema draft 2020-12
- NFR19: MCP server tools conform to MCP specification
- NFR20: npm package supports Node.js 18+ with ESM and CJS builds
- NFR21: Python package supports Python 3.9+ on PyPI
- NFR22: Repository fully functional when cloned — no external dependencies for core data

### Maintainability
- NFR23: Schema changes follow strict semver
- NFR24: New entry creation follows documented repeatable process
- NFR25: Repository health assessable in under 5 minutes
