---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
completedAt: '2026-03-22'
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
---

# RETROSPEC - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for RETROSPEC, decomposing the requirements from the PRD into implementable stories optimized for parallel execution via git worktree agents.

## Requirements Inventory

### Functional Requirements

- FR1: Maintainers can create JSON entries for events, people, organizations, models, papers, and concepts following defined schemas
- FR2: Maintainers can assign significance scores (1-10) with required justification for scores 8+
- FR3: Maintainers can define counterfactual descriptions for events
- FR4: Maintainers can define query hooks (natural language questions) routing to entries
- FR5: Maintainers can assign entries to one of 11 epochs
- FR6: Contributors can submit new entries via PRs with automatic schema validation
- FR7: Maintainers can define typed, weighted relationships between entities
- FR8: Maintainers can build and maintain 4 knowledge graphs (influence, architecture, organization, concept dependency)
- FR9: Maintainers can define predecessor/successor chains forming traversable timelines
- FR10: Maintainers can define influenced_by/influenced chains for people
- FR11: Maintainers can define parent/child relationships for models forming lineage trees
- FR12: Agents can trace complete architectural lineage of any model back to earliest ancestor
- FR13: Agents can traverse transformer family tree across encoder-only, decoder-only, encoder-decoder branches
- FR14: Agents can follow concept dependency chains for prerequisite knowledge
- FR15: Users can follow influence chains across generations
- FR16: Agents can query RETROSPEC via MCP to look up any entity by ID
- FR17: Agents can query RETROSPEC via MCP to trace lineage of any model
- FR18: Agents can query RETROSPEC via MCP to search by epoch, tag, or significance
- FR19: Agents can query RETROSPEC via MCP to traverse influence/architecture graphs
- FR20: Agents can query RETROSPEC via MCP using natural language matched against query hooks
- FR21: Users can access structured documentation of all major AI hype cycles and winters
- FR22: Users can compare historical cycle trigger patterns against current conditions
- FR23: Users can view defining characteristics and warning signals for each cycle
- FR24: Users can browse all 11 epochs chronologically with rich summaries
- FR25: Users can view key events, figures, models, and concepts per epoch
- FR26: Users can navigate between epochs via preceded_by/succeeded_by chains
- FR27: System can validate any entry against JSON Schema and report violations
- FR28: System can detect dangling references (IDs that don't resolve)
- FR29: System can detect orphaned nodes (entries with no inbound relationships)
- FR30: CI pipelines automatically validate schema compliance on every PR
- FR31: Maintainers can view health dashboard (coverage, connectivity, consistency, freshness)
- FR32: Maintainers can view epoch coverage balance to detect documentation bias
- FR33: Maintainers can identify stale entries needing updates
- FR34: Users can explore RETROSPEC via interactive web interface
- FR35: Users can search entries across all categories
- FR36: Users can visualize model lineage trees as interactive graphs
- FR37: Users can visualize influence chains between people and organizations
- FR38: Users can navigate epochs chronologically with visual summaries
- FR39: Node.js developers can install RETROSPEC as npm package and query programmatically
- FR40: Python developers can install RETROSPEC as pip package and query programmatically
- FR41: Both packages support lineage tracing, entity lookup, and graph traversal
- FR42: Contributors can read clear guidelines (CONTRIBUTING.md)
- FR43: Contributors can read schema documentation (SCHEMA.md)
- FR44: Contributors can run local schema validation before submitting PRs
- FR45: Maintainers can review contributions for accuracy and significance calibration

### NonFunctional Requirements

- NFR1: 100% of entries pass JSON Schema validation — CI blocks merges on failure
- NFR2: Zero dangling references — every referenced entity ID resolves
- NFR3: No orphaned nodes — every entry referenced by at least 1 other entry
- NFR4: Significance calibration — no more than 15% of entries in any category at significance 9-10
- NFR5: Counterfactuals reviewed by at least one validation pass before merge
- NFR6: Historical claims traceable to at least one primary or authoritative source
- NFR7: Vercel web app pages load under 2 seconds on standard broadband
- NFR8: MCP query responses under 500ms for lookups, under 2 seconds for graph traversals
- NFR9: npm/Python package queries complete within 100ms for local access
- NFR10: Static site generation completes within 5 minutes for up to 1,000 entries
- NFR11: Repository structure supports up to 10,000 entries without architectural changes
- NFR12: Git performance maintained (clean diffs, fast clones) up to 5,000 entries
- NFR13: Vercel app handles 50,000 visitors/day traffic spikes
- NFR14: Graph traversal sub-second response up to 10,000 nodes
- NFR15: Vercel web app meets WCAG 2.1 AA compliance
- NFR16: Graph visualizations have text-based alternatives for screen readers
- NFR17: Color never sole means of conveying information
- NFR18: All schemas validate against JSON Schema draft 2020-12
- NFR19: MCP server tools conform to MCP specification
- NFR20: npm package supports Node.js 18+ with ESM and CJS builds
- NFR21: Python package supports Python 3.9+ on PyPI
- NFR22: Repository fully functional when cloned — no external dependencies for core data
- NFR23: Schema changes follow strict semver
- NFR24: New entry creation follows documented repeatable process
- NFR25: Repository health assessable in under 5 minutes

### Additional Requirements

- Existing schemas (event, entity, relationship, epoch) are already defined and validated
- Directory structure already scaffolded with 11 epoch directories, lineage trees, entities, etc.
- 66 entries already exist — new content must be consistent with existing entries
- 26 dangling references must be resolved (19 people, 7 organizations referenced but missing entity files)
- 6 BMAD agent personas (Clio, Thoth, Ada, Euler, Diogenes, Pythia) already created
- Git worktree parallelization strategy: multiple agents work on isolated branches simultaneously
- Entries must follow ID conventions: evt_, person_, org_, model_, paper_, concept_
- Significance scores 8+ require comparative justification

### UX Design Requirements

No UX design document — Vercel web interface is Phase 1.5, not in scope for Phase 1 epic breakdown.

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1, 2 | Create entries following schemas |
| FR2 | Epic 1, 2 | Assign significance scores |
| FR3 | Epic 2 | Define counterfactuals |
| FR4 | Epic 2 | Define query hooks |
| FR5 | Epic 1, 2 | Assign entries to epochs |
| FR6 | Epic 6 | PR submission with auto-validation |
| FR7 | Epic 1, 4 | Define typed relationships |
| FR8 | Epic 4 | Build 4 knowledge graphs |
| FR9 | Epic 1, 4 | Predecessor/successor chains |
| FR10 | Epic 1, 4 | Influenced_by/influenced chains |
| FR11 | Epic 4, 5 | Parent/child model relationships |
| FR12 | Epic 4, 5 | Trace model lineage |
| FR13 | Epic 5 | Traverse transformer family tree |
| FR14 | Epic 4 | Concept dependency chains |
| FR15 | Epic 4 | Influence chains across generations |
| FR21 | Epic 3 | AI cycle documentation |
| FR22 | Epic 3 | Compare cycle patterns |
| FR23 | Epic 3 | Cycle characteristics and warnings |
| FR24 | Epic 2 | Browse epochs chronologically |
| FR25 | Epic 2 | View key entities per epoch |
| FR26 | Epic 2 | Navigate epoch chains |
| FR27 | Epic 6 | Schema validation |
| FR28 | Epic 6 | Dangling reference detection |
| FR29 | Epic 6 | Orphaned node detection |
| FR30 | Epic 6 | CI pipeline validation |
| FR31 | Epic 8 | Health dashboard |
| FR32 | Epic 8 | Epoch coverage balance |
| FR33 | Epic 8 | Staleness identification |
| FR42 | Epic 7 | CONTRIBUTING.md |
| FR43 | Epic 7 | SCHEMA.md |
| FR44 | Epic 6 | Local schema validation |
| FR45 | Epic 7 | Contribution review process |

Deferred to Phase 1.5/2: FR16-FR20 (MCP), FR34-FR41 (Vercel, packages)

## Epic List

### Epic 1: Resolve Dangling References & Entity Completion
Fix all 26 dangling references by creating missing entity files (19 people, 7 organizations). Every referenced entity ID resolves to an actual entry. Foundation for graph traversal.
**FRs covered:** FR1, FR2, FR5, FR7, FR9, FR10
**Wave:** 1 (parallel) | **Agent:** Entity Filler

### Epic 2: Epoch Content Expansion
Fill 3 empty epochs (00, 05, 10), expand thin epochs to 5+ events each, close 19-month gap with emerging events (DeepSeek-R1, MCP, reasoning models, frontier parity).
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR24, FR25, FR26
**Wave:** 1 (parallel) | **Agent:** Epoch Filler

### Epic 3: AI Cycles & Winter Documentation
Create 6 cycle entries documenting AI winters, hype cycles, and funding patterns with trigger signals and pattern data.
**FRs covered:** FR21, FR22, FR23
**Wave:** 1 (parallel) | **Agent:** Cycle Writer

### Epic 4: Knowledge Graph Construction
Build 4 core graphs (influence, architecture, organization, concept dependency) from all entries. Core differentiator of RETROSPEC.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15
**Wave:** 2 (after Wave 1) | **Agent:** Cartographer (Euler)

### Epic 5: Transformer Family Tree & Lineage
Populate lineage directories: encoder-only, decoder-only, encoder-decoder, pre-transformer families, emerging architectures.
**FRs covered:** FR11, FR12, FR13
**Wave:** 1 (parallel) | **Agent:** Lineage Mapper

### Epic 6: Validation Tooling & CI Pipeline
Schema validation scripts, dangling ref detection, orphaned node detection, GitHub Actions CI. Contributors can validate locally, PRs auto-checked.
**FRs covered:** FR6, FR27, FR28, FR29, FR30, FR44
**Wave:** 1 (parallel) | **Agent:** Tooling Builder

### Epic 7: Community Onboarding Documentation
CONTRIBUTING.md, SCHEMA.md, updated README. Open-source contributors can discover, understand, and submit quality PRs.
**FRs covered:** FR42, FR43, FR45
**Wave:** 1 (parallel) | **Agent:** Documentation Writer

### Epic 8: Repository Health Dashboard
Automated health scripts measuring coverage, connectivity, consistency, freshness. Pythia's metrics automated.
**FRs covered:** FR31, FR32, FR33
**Wave:** 2 (after Wave 1) | **Agent:** Health Monitor Builder

### Parallelization Strategy

```
WAVE 1 (6 agents in parallel):
├── Epic 1: Entity Filler
├── Epic 2: Epoch Filler
├── Epic 3: Cycle Writer
├── Epic 5: Lineage Mapper
├── Epic 6: Validation Tooling
└── Epic 7: Documentation

WAVE 2 (2 agents, after Wave 1 merges):
├── Epic 4: Graph Construction
└── Epic 8: Health Dashboard
```

## Epic 1: Resolve Dangling References & Entity Completion

Fix all 26 dangling references by creating missing entity files. Every referenced entity ID resolves to an actual entry.

### Story 1.1: Create Missing People Entities (Transformer Authors)

As a maintainer,
I want entity files for all Transformer paper co-authors (Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin),
So that the "Attention Is All You Need" event entry has zero dangling people references.

**Acceptance Criteria:**

**Given** the event `evt_2017_attention_is_all_you_need` references 8 people
**When** all 7 missing author entity files are created in `entities/people/`
**Then** each file passes JSON Schema validation
**And** each entry has complete fields: id, type, name, born, nationality, affiliations, key_contributions, significance, summary
**And** influenced_by/influenced chains reference existing entity IDs

### Story 1.2: Create Missing People Entities (Key Figures)

As a maintainer,
I want entity files for Sutskever, Krizhevsky, Shannon, Rumelhart, Williams, Papert, Devlin, Bahdanau, Lighthill, Kasparov, Rochester, Brown,
So that all event entries have zero dangling people references.

**Acceptance Criteria:**

**Given** 12 person IDs are referenced in events but have no entity file
**When** all 12 entity files are created in `entities/people/`
**Then** each file passes JSON Schema validation
**And** each entry has accurate biographical data traceable to authoritative sources
**And** total people entities reaches 29+

### Story 1.3: Create Missing Organization Entities

As a maintainer,
I want entity files for Google Brain, IBM, University of Toronto, MILA, Dartmouth, University of Manchester, University of Montreal,
So that all event entries have zero dangling organization references.

**Acceptance Criteria:**

**Given** 7 organization IDs are referenced in events but have no entity file
**When** all 7 entity files are created in `entities/organizations/`
**Then** each file passes JSON Schema validation
**And** each org has founders, headquarters, key_models, and key_papers fields populated
**And** total organization entities reaches 12+

## Epic 2: Epoch Content Expansion

Fill 3 empty epochs, expand thin epochs, close the 19-month recency gap.

### Story 2.1: Populate Epoch 00 — Philosophical Roots

As a historian,
I want 5+ events documenting AI's philosophical prehistory (Llull, Leibniz, Babbage, Lovelace, Boole),
So that the Philosophical Roots epoch is no longer empty.

**Acceptance Criteria:**

**Given** epoch 00 currently has 0 events
**When** 5+ event entries are created covering 1305-1942
**Then** each event passes schema validation
**And** each has counterfactual and query_hooks fields populated
**And** preceded_by/succeeded_by chains form a connected timeline

### Story 2.2: Populate Epoch 05 — Second AI Winter

As a historian,
I want 5+ events documenting the second AI winter (LISP machine crash, Fifth Generation failure, expert system collapse),
So that the Second Winter epoch is no longer empty.

**Acceptance Criteria:**

**Given** epoch 05 currently has 0 events
**When** 5+ event entries are created covering 1987-1993
**Then** events document the causes and consequences of the second winter
**And** each has counterfactual descriptions explaining lessons from this period

### Story 2.3: Populate Epoch 10 — Agentic Era & Emerging Events

As a historian,
I want 8+ events documenting 2024-2026 developments (DeepSeek-R1, MCP standard, reasoning models, frontier parity, AAIF, vibe coding, A2A protocol, state AI laws),
So that the 19-month recency gap is closed.

**Acceptance Criteria:**

**Given** epoch 10 currently has 0 events and latest documented event is Aug 2024
**When** 8+ event entries are created covering Jul 2024 — Mar 2026
**Then** DeepSeek-R1 is documented with significance 9 and market impact details
**And** MCP becoming industry standard is documented with adoption metrics
**And** each event has query_hooks relevant to current agent developers

### Story 2.4: Expand Thin Epochs (02, 03, 04, 06)

As a historian,
I want 3-4 additional events per thin epoch (Golden Age, First Winter, Expert Systems, Quiet Revolution),
So that every epoch has minimum 5 events.

**Acceptance Criteria:**

**Given** epochs 02, 03, 04, 06 each have 1 event
**When** 3-4 events are added to each
**Then** each epoch reaches minimum 5 events
**And** coverage ratio between most and least populated epoch is < 10:1

### Story 2.5: Expand Models, Papers, and Concepts

As a researcher,
I want 15+ additional models, 17+ additional papers, and 7+ additional concepts,
So that the repository reaches Phase 1 content targets.

**Acceptance Criteria:**

**Given** current counts: 5 models, 8 papers, 8 concepts
**When** new entries are created across all three categories
**Then** models reaches 20+ (LLaMA, Stable Diffusion, Midjourney, DeepSeek, Mixtral, etc.)
**And** papers reaches 25+
**And** concepts reaches 15+

## Epic 3: AI Cycles & Winter Documentation

Create 6 cycle entries documenting AI winters, hype cycles, and funding patterns.

### Story 3.1: Document AI Winter Cycles

As a policy analyst,
I want structured entries for both AI winters (1974-1980, 1987-1993),
So that I can compare historical collapse triggers against current conditions.

**Acceptance Criteria:**

**Given** the cycles/ directory is empty
**When** 2 winter cycle entries are created
**Then** each includes: trigger_signals, duration, funding_impact, recovery_factors, lessons_learned
**And** each references related epoch and event entries

### Story 3.2: Document Hype & Boom Cycles

As a policy analyst,
I want structured entries for hype cycles (Expert System Bubble, Deep Learning Boom, GenAI Hype Cycle) and the Quiet Period,
So that the full pattern of boom-bust-recovery is documented.

**Acceptance Criteria:**

**Given** cycles/ has 0 entries
**When** 4 additional cycle entries are created
**Then** total cycle entries reach 6
**And** each cycle cross-references its epoch and key events
**And** current GenAI cycle includes comparison data against historical patterns

## Epic 4: Knowledge Graph Construction

Build 4 core graphs connecting all entries. RETROSPEC's core differentiator.

### Story 4.1: Build Influence Graph

As an agent,
I want a complete influence graph connecting people to the people they influenced,
So that I can traverse "who influenced whom" across AI history.

**Acceptance Criteria:**

**Given** all person entities exist with influenced_by/influenced fields
**When** `graphs/influence_graph.json` is created
**Then** every person entity appears as a node
**And** all influence relationships appear as typed, weighted edges
**And** the graph is traversable from any person to any connected person

### Story 4.2: Build Architecture Evolution Graph

As an agent,
I want a complete architecture graph showing how AI architectures evolved,
So that I can trace any model's architectural lineage.

**Acceptance Criteria:**

**Given** all model entities exist with parent_models/child_models fields
**When** `graphs/architecture_graph.json` is created
**Then** every model appears as a node with evolved_from relationships
**And** the graph includes pre-transformer, transformer, and emerging families

### Story 4.3: Build Organization Graph

As a researcher,
I want a graph connecting people to organizations to models,
So that I can answer "who built what, where."

**Acceptance Criteria:**

**Given** all entity files exist for people, organizations, and models
**When** `graphs/organization_graph.json` is created
**Then** all three entity types appear as nodes
**And** employed/founded/created relationships connect them

### Story 4.4: Build Concept Dependency Graph

As an agent,
I want a graph showing which AI concepts depend on which prerequisites,
So that I can understand foundational concepts needed for any technique.

**Acceptance Criteria:**

**Given** all concept entries exist with prerequisites/enables fields
**When** `graphs/concept_dependency_graph.json` is created
**Then** every concept appears as a node
**And** depends_on/enables relationships form a directed graph

## Epic 5: Transformer Family Tree & Lineage

Populate lineage directories with model family entries.

### Story 5.1: Populate Decoder-Only Lineage

As an agent,
I want the complete decoder-only transformer family tree (GPT-1 through GPT-4, Claude, LLaMA),
So that I can trace any decoder-only model's lineage.

**Acceptance Criteria:**

**Given** `lineage/transformer_family_tree/decoder_only/` is empty
**When** lineage entries are created for 8+ decoder-only models
**Then** each includes parent_model, child_models, key_innovations, lineage_path
**And** the chain is unbroken from GPT-1 to current frontier models

### Story 5.2: Populate Encoder-Only and Encoder-Decoder Lineages

As an agent,
I want the BERT family tree and T5/BART family tree,
So that all three transformer branches are documented.

**Acceptance Criteria:**

**Given** encoder-only and encoder-decoder lineage directories are empty
**When** lineage entries are created for 5+ models per branch
**Then** encoder-only covers: BERT → RoBERTa → ALBERT → DeBERTa → DistilBERT
**And** encoder-decoder covers: T5 → BART → mT5 → Flan-T5

### Story 5.3: Populate Pre-Transformer and Emerging Lineages

As a researcher,
I want lineage entries for pre-transformer families (RNN, CNN, classical ML) and emerging architectures (diffusion, SSM, MoE),
So that the full architectural landscape is documented.

**Acceptance Criteria:**

**Given** pre-transformer and emerging directories are empty
**When** lineage entries are created covering all 6 remaining directories
**Then** RNN family: RNN → LSTM → GRU → Seq2Seq documented
**And** CNN family: LeNet → AlexNet → VGG → ResNet → EfficientNet documented
**And** Emerging: diffusion, Mamba/SSM, Mixtral/MoE documented

## Epic 6: Validation Tooling & CI Pipeline

Automated quality enforcement for all entries.

### Story 6.1: Create Schema Validation Script

As a contributor,
I want a local validation script that checks entries against JSON schemas,
So that I can fix errors before submitting a PR.

**Acceptance Criteria:**

**Given** a JSON entry file exists
**When** the validation script is run against it
**Then** it reports pass/fail with specific field-level errors
**And** it validates all entry types (event, entity, epoch, relationship)

### Story 6.2: Create Referential Integrity Checker

As a maintainer,
I want a script that detects dangling references and orphaned nodes,
So that I can maintain graph consistency.

**Acceptance Criteria:**

**Given** the full repository of JSON entries
**When** the integrity checker is run
**Then** it lists all dangling references and orphaned nodes with counts and locations

### Story 6.3: Create GitHub Actions CI Workflow

As a maintainer,
I want every PR automatically validated for schema compliance and referential integrity,
So that broken entries never merge to main.

**Acceptance Criteria:**

**Given** a PR is submitted with new or modified JSON entries
**When** the CI workflow runs
**Then** schema validation and integrity checks run automatically
**And** the PR is blocked from merge if any check fails

## Epic 7: Community Onboarding Documentation

Contributors can discover, understand, and submit quality PRs.

### Story 7.1: Create CONTRIBUTING.md

As an open-source contributor,
I want a clear guide explaining how to add entries to RETROSPEC,
So that I can submit my first PR within 30 minutes.

**Acceptance Criteria:**

**Given** a new contributor visits the repository
**When** they read CONTRIBUTING.md
**Then** they understand entry types, schema structure, and ID conventions
**And** they know how to run local validation and submit a PR
**And** the guide includes a complete example of creating a new event entry

### Story 7.2: Create SCHEMA.md

As a contributor,
I want comprehensive documentation of all JSON schemas with field descriptions and examples,
So that I can create correctly structured entries.

**Acceptance Criteria:**

**Given** 4 schemas exist (event, entity, relationship, epoch)
**When** SCHEMA.md is created
**Then** every field in every schema is documented with type, description, and example
**And** naming conventions and significance guidelines are included

## Epic 8: Repository Health Dashboard

Automated health metrics in under 5 minutes.

### Story 8.1: Create Health Assessment Script

As a maintainer,
I want an automated script reporting coverage, connectivity, consistency, and freshness,
So that I can assess repository health without manual counting.

**Acceptance Criteria:**

**Given** the RETROSPEC repository
**When** the health script is run
**Then** it reports entry counts, events per epoch, dangling refs, orphaned nodes, graph connectivity, freshness
**And** execution completes in under 5 minutes

### Story 8.2: Create Epoch Balance Report

As a maintainer,
I want a report showing documentation balance across epochs and geographic representation,
So that I can prioritize filling gaps.

**Acceptance Criteria:**

**Given** entries exist across all categories
**When** the balance report is run
**Then** it shows entry count per epoch, flags epochs below threshold, shows geographic distribution
**And** highlights coverage ratio between most and least populated epochs
