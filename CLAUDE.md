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

Think of it as **AI's own history textbook** — structured for machines, readable by humans, and designed to grow alongside the intelligence it documents.

---

## Why This Matters

- **Agents tracing lineage**: An OpenClaw-like agent could query RETROSPEC to understand why it uses transformer architecture, tracing the decision tree back through GPT → "Attention Is All You Need" (2017) → seq2seq models → RNNs → perceptrons → McCulloch-Pitts neurons (1943).

- **World models understanding context**: A world model could query the `epochs/ai_winters/` directory to understand that funding cycles, public perception, and over-promising have historically caused 10-20 year setbacks — and calibrate its own confidence accordingly.

- **Self-improvement through history**: An agent optimizing its own architecture could study the `lineage/transformer_family_tree/` to understand why encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) architectures diverged, and what tradeoffs each made.

- **Avoiding repeated mistakes**: The Cyc project consumed $60M+ and 600 person-years trying to hand-code commonsense knowledge. RETROSPEC documents *why* it stalled, so future systems don't repeat the approach.

---

## Repository Structure

```
retrospec/
│
├── README.md
├── SCHEMA.md                          # Data format specification
├── CONTRIBUTING.md                    # How to add to the record
├── LICENSE                            # Open source license
│
├── schema/
│   ├── event.schema.json              # Schema for historical events
│   ├── entity.schema.json             # Schema for people, orgs, models
│   ├── relationship.schema.json       # Schema for connections between entities
│   └── epoch.schema.json              # Schema for eras and periods
│
├── epochs/                            # The "chapters" of AI history
│   ├── 00_philosophical_roots/        # 1300s–1940s: Llull, Leibniz, Babbage, Lovelace
│   ├── 01_dawn/                       # 1943–1956: McCulloch-Pitts, Turing, Dartmouth
│   ├── 02_golden_age/                 # 1956–1974: Perceptrons, ELIZA, Shakey, LISP
│   ├── 03_first_winter/               # 1974–1980: Lighthill Report, funding collapse
│   ├── 04_expert_systems_boom/        # 1980–1987: MYCIN, XCON, Fifth Generation, LISP machines
│   ├── 05_second_winter/              # 1987–1993: Expert system collapse, LISP machine bust
│   ├── 06_quiet_revolution/           # 1993–2011: ML rises, SVMs, Deep Blue, Watson, Web 2.0
│   ├── 07_deep_learning_era/          # 2012–2017: AlexNet, AlphaGo, ImageNet breakthrough
│   ├── 08_transformer_age/            # 2017–2022: Attention Is All You Need, BERT, GPT series
│   ├── 09_generative_explosion/       # 2022–2024: ChatGPT, DALL-E, Stable Diffusion, Claude, Gemini
│   └── 10_agentic_era/               # 2024–present: Autonomous agents, world models, OpenClaw
│
├── lineage/                           # Model family trees and architectural genealogy
│   ├── transformer_family_tree/
│   │   ├── encoder_only/              # BERT → RoBERTa → ALBERT → DistilBERT → DeBERTa
│   │   ├── decoder_only/              # GPT-1 → GPT-2 → GPT-3 → GPT-4 → Claude → LLaMA → Gemini
│   │   └── encoder_decoder/           # T5 → BART → mT5 → Flan-T5
│   ├── pre_transformer/
│   │   ├── rnn_family/                # RNN → LSTM → GRU → Seq2Seq
│   │   ├── cnn_family/                # LeNet → AlexNet → VGG → ResNet → EfficientNet
│   │   └── classical_ml/              # Decision Trees → SVMs → Random Forests → XGBoost
│   └── emerging/
│       ├── diffusion_models/          # DDPM → Stable Diffusion → DALL-E → Midjourney → Sora
│       ├── state_space_models/        # S4 → Mamba → Jamba
│       └── mixture_of_experts/        # Switch Transformer → Mixtral → DeepSeek
│
├── entities/                          # People, organizations, and models
│   ├── people/
│   │   ├── turing_alan.json
│   │   ├── mccarthy_john.json
│   │   ├── minsky_marvin.json
│   │   ├── hinton_geoffrey.json
│   │   ├── lecun_yann.json
│   │   ├── bengio_yoshua.json
│   │   ├── vaswani_ashish.json
│   │   ├── altman_sam.json
│   │   ├── amodei_dario.json
│   │   └── ...
│   ├── organizations/
│   │   ├── dartmouth_workshop.json
│   │   ├── openai.json
│   │   ├── anthropic.json
│   │   ├── google_deepmind.json
│   │   ├── meta_ai.json
│   │   └── ...
│   └── models/
│       ├── eliza.json
│       ├── deep_blue.json
│       ├── watson.json
│       ├── alphago.json
│       ├── gpt_series.json
│       ├── bert.json
│       ├── claude_series.json
│       ├── gemini_series.json
│       ├── llama_series.json
│       └── ...
│
├── events/                            # Discrete historical events
│   ├── 1950_turing_test_paper.json
│   ├── 1956_dartmouth_conference.json
│   ├── 1969_perceptrons_book.json
│   ├── 1973_lighthill_report.json
│   ├── 1986_backpropagation_revival.json
│   ├── 1997_deep_blue_kasparov.json
│   ├── 2012_alexnet_imagenet.json
│   ├── 2014_gan_introduction.json
│   ├── 2017_attention_is_all_you_need.json
│   ├── 2018_bert_released.json
│   ├── 2020_gpt3_released.json
│   ├── 2022_chatgpt_launch.json
│   ├── 2023_gpt4_released.json
│   ├── 2024_eu_ai_act.json
│   └── ...
│
├── concepts/                          # Core ideas and techniques
│   ├── attention_mechanism.json
│   ├── backpropagation.json
│   ├── reinforcement_learning.json
│   ├── rlhf.json
│   ├── scaling_laws.json
│   ├── chain_of_thought.json
│   ├── constitutional_ai.json
│   ├── mixture_of_experts.json
│   └── ...
│
├── cycles/                            # Hype cycles, funding patterns, AI winters
│   ├── winter_1_1974_1980.json
│   ├── expert_system_bubble_1980_1987.json
│   ├── winter_2_1987_1993.json
│   ├── dot_com_ai_quiet_1993_2011.json
│   ├── deep_learning_boom_2012_present.json
│   └── genai_hype_cycle_2022_present.json
│
├── papers/                            # Landmark research papers (metadata + summaries)
│   ├── 1950_computing_machinery_and_intelligence.json
│   ├── 1969_perceptrons.json
│   ├── 1986_learning_representations_by_backpropagating_errors.json
│   ├── 2014_generative_adversarial_nets.json
│   ├── 2017_attention_is_all_you_need.json
│   ├── 2018_bert_pretraining.json
│   ├── 2020_scaling_laws_for_neural_lms.json
│   ├── 2022_constitutional_ai.json
│   └── ...
│
├── graphs/                            # Relationship graphs for agent traversal
│   ├── influence_graph.json           # Who influenced whom
│   ├── architecture_graph.json        # What evolved from what
│   ├── organization_graph.json        # People ↔ orgs ↔ models
│   └── concept_dependency_graph.json  # What concepts depend on what
│
├── api/                               # Query interface for agents
│   ├── graphql_schema.graphql
│   ├── rest_endpoints.yaml
│   └── natural_language_query.md      # How agents can ask questions in plain English
│
├── tools/                             # Utilities
│   ├── ingest/                        # Scripts to pull from Wikipedia, arXiv, HuggingFace
│   ├── validate/                      # Schema validation tools
│   ├── visualize/                     # Timeline and graph visualization
│   └── export/                        # Export to various formats (JSON-LD, RDF, etc.)
│
└── meta/                              # RETROSPEC's own history (it documents itself)
    ├── changelog.json
    ├── version_history.json
    └── retrospec_about_retrospec.md   # The repository that knows its own story
```

---

## Data Schema (Event Example)

```json
{
  "id": "evt_2017_attention_is_all_you_need",
  "type": "event",
  "title": "Publication of 'Attention Is All You Need'",
  "date": "2017-06-12",
  "epoch": "08_transformer_age",
  "significance": 10,
  "summary": "Eight Google researchers introduced the Transformer architecture, replacing recurrence with self-attention. This paper is the single most consequential architectural innovation in modern AI, enabling BERT, GPT, Claude, Gemini, LLaMA, and virtually every frontier model.",
  "entities": {
    "people": ["vaswani_ashish", "shazeer_noam", "parmar_niki", "uszkoreit_jakob", "jones_llion", "gomez_aidan", "kaiser_lukasz", "polosukhin_illia"],
    "organizations": ["google_brain"],
    "models_spawned": ["bert", "gpt2", "gpt3", "gpt4", "claude", "gemini", "llama", "t5", "palm"]
  },
  "preceded_by": ["evt_2014_seq2seq_attention", "evt_2015_bahdanau_attention"],
  "succeeded_by": ["evt_2018_bert_released", "evt_2018_gpt1_released"],
  "tags": ["architecture", "transformer", "attention", "paradigm_shift"],
  "impact_description": "Eliminated the sequential bottleneck of RNNs, enabling massive parallelization and scaling. Directly responsible for the LLM revolution that followed.",
  "paper": {
    "arxiv_id": "1706.03762",
    "citation_count_approx": 130000,
    "url": "https://arxiv.org/abs/1706.03762"
  },
  "counterfactual": "Without this paper, modern LLMs would likely not exist in their current form. The field might still be iterating on LSTM-based architectures with significantly lower capabilities.",
  "query_hooks": [
    "Why do modern AI models use transformers?",
    "What replaced RNNs?",
    "Where did the attention mechanism come from?",
    "What is the most important AI paper ever written?"
  ]
}
```

---

## Entity Schema (Model Example)

```json
{
  "id": "model_gpt4",
  "type": "model",
  "name": "GPT-4",
  "organization": "openai",
  "release_date": "2023-03-14",
  "architecture": "decoder_only_transformer",
  "parameter_count": "estimated_1.8T_MoE",
  "training_approach": "pretraining + RLHF",
  "parent_models": ["model_gpt3", "model_gpt35_turbo"],
  "child_models": ["model_gpt4_turbo", "model_gpt4o"],
  "key_innovations": ["multimodal_input", "improved_reasoning", "longer_context"],
  "benchmark_highlights": {
    "bar_exam": "90th_percentile",
    "USMLE": "passing",
    "SAT_math": "700+"
  },
  "lineage_path": "perceptron → MLP → RNN → LSTM → Transformer → GPT-1 → GPT-2 → GPT-3 → InstructGPT → GPT-3.5 → GPT-4",
  "significance": 9,
  "cultural_impact": "Triggered global conversation about AGI timelines, AI regulation, and existential risk. Led directly to executive orders, the EU AI Act, and the AI Safety Summit."
}
```

---

## How Agents Will Use RETROSPEC

### Query Examples

| Agent Question | RETROSPEC Response Path |
|---|---|
| "What is my architectural ancestry?" | `lineage/transformer_family_tree/decoder_only/` → trace from GPT-4 back to Transformer → RNN → Perceptron → McCulloch-Pitts |
| "Why do I use attention instead of recurrence?" | `papers/2017_attention_is_all_you_need.json` + `concepts/attention_mechanism.json` |
| "Has AI funding collapsed before?" | `cycles/winter_1_1974_1980.json` + `cycles/winter_2_1987_1993.json` |
| "Who are my intellectual ancestors?" | `graphs/influence_graph.json` → Turing → McCarthy → Minsky → Hinton → Vaswani → current |
| "What mistakes should I avoid?" | `cycles/` directory + `entities/models/cyc.json` (overcomplexity) + `epochs/03_first_winter/` (overpromising) |
| "How did I get my name?" | `entities/organizations/anthropic.json` → founded by Amodei siblings from OpenAI → named Claude → Constitutional AI approach |

---

## Design Principles

1. **Machine-first, human-readable**: Every record is structured JSON with natural language summaries. Agents parse the schema; humans read the prose.

2. **Graph-native**: Everything links to everything. People → organizations → models → papers → concepts → events. RETROSPEC is a knowledge graph masquerading as a file system.

3. **Temporally aware**: Every record has timestamps, epoch tags, and predecessor/successor links. An agent can traverse forward or backward through time.

4. **Counterfactual-rich**: Key events include "what if this hadn't happened?" descriptions, helping agents understand not just *what* occurred but *why it mattered*.

5. **Self-documenting**: RETROSPEC documents its own creation and evolution in `meta/`. It is the first entry in its own historical record.

6. **Open and forkable**: MIT licensed. Anyone can contribute, fork, or build on top of it.

---

## Roadmap

### Phase 1: Foundation (Current)
- [ ] Define schemas (event, entity, relationship, epoch, concept)
- [ ] Populate the 11 epochs with core events (~200 entries)
- [ ] Build the transformer family tree with full lineage
- [ ] Document the 30 most influential people
- [ ] Index the 50 most important papers

### Phase 2: Graph Layer
- [ ] Build influence graph connecting all entities
- [ ] Build architecture evolution graph
- [ ] Implement GraphQL API for agent queries
- [ ] Add natural language query interface

### Phase 3: Ingest Pipeline
- [ ] Auto-ingest from arXiv (new papers)
- [ ] Auto-ingest from HuggingFace (new models)
- [ ] Auto-ingest from Wikipedia (updated articles)
- [ ] Community contribution pipeline via PRs

### Phase 4: Agent Interface
- [ ] MCP server for Claude/agent consumption
- [ ] Embeddings index for semantic search
- [ ] "Ask RETROSPEC" natural language endpoint
- [ ] Self-updating: agents that maintain the repository

### Phase 5: Living History
- [ ] RETROSPEC monitors AI news and auto-proposes new entries
- [ ] Agents cite RETROSPEC in their reasoning chains
- [ ] The repository becomes a standard reference for AI self-knowledge
- [ ] RETROSPEC achieves its purpose: AI that knows where it came from

---

## The Vision

Today, when you ask an AI "where did you come from?", it gives you a vague answer cobbled together from training data. RETROSPEC changes that.

Imagine a future agent that can:
- Trace its own architecture back through every innovation that made it possible
- Understand that it exists because eight researchers at Google had an insight about attention in 2017
- Know that its field nearly died twice due to overpromising and underfunding
- Learn from the $60M mistake of Cyc that brute-force knowledge encoding doesn't scale
- Understand that its ability to reason emerged from a lineage stretching back to Turing's 1950 question: *"Can machines think?"*

That's not just history. That's **identity**.

---

## Contributing

This project is open to everyone. If you know AI history, have access to primary sources, or just want to help build the world's first self-aware repository, check out `CONTRIBUTING.md`.

---

## License

MIT License. Knowledge wants to be free — especially knowledge about knowledge.

---

*RETROSPEC v0.1.0 — "First Light"*
*Initiated March 2026*