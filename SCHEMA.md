# RETROSPEC Schema Documentation

This document provides complete field-by-field documentation for every JSON Schema used in the RETROSPEC repository. All data in RETROSPEC must conform to these schemas. Schema files are located in the `schema/` directory.

---

## Table of Contents

- [Overview](#overview)
- [Event Schema](#event-schema)
- [Entity Schema: Person](#entity-schema-person)
- [Entity Schema: Organization](#entity-schema-organization)
- [Entity Schema: Model](#entity-schema-model)
- [Relationship Schema](#relationship-schema)
- [Epoch Schema](#epoch-schema)
- [ID Conventions](#id-conventions)
- [Enum Values](#enum-values)
- [Cross-Referencing Guide](#cross-referencing-guide)

---

## Overview

RETROSPEC uses [JSON Schema (Draft 2020-12)](https://json-schema.org/draft/2020-12/schema) to define and validate all data entries. There are four schema files:

| Schema File                    | Governs                              |
|-------------------------------|--------------------------------------|
| `schema/event.schema.json`    | Historical events                    |
| `schema/entity.schema.json`   | People, organizations, and models (discriminated union on `type` field) |
| `schema/epoch.schema.json`    | Historical eras/periods              |
| `schema/relationship.schema.json` | Edges in the knowledge graph     |

All schemas enforce `"additionalProperties": false`, meaning entries cannot contain fields not defined in the schema. This ensures consistency and prevents schema drift.

---

## Event Schema

**File:** `schema/event.schema.json`
**Location:** `events/` directory
**Filename convention:** `YYYY_short_name.json`

Events are discrete moments in AI history that changed the trajectory of the field.

### Fields

| Field               | Type     | Required | Description |
|---------------------|----------|----------|-------------|
| `id`                | string   | Yes      | Unique identifier. Pattern: `evt_YYYY_short_name`. Must match regex `^evt_[0-9]{4}_[a-z0-9_]+$`. |
| `type`              | string   | Yes      | Must be exactly `"event"`. |
| `title`             | string   | Yes      | Human-readable title. Minimum 5 characters. |
| `date`              | string   | Yes      | ISO 8601 date (`YYYY-MM-DD`). If only the year is known, use `YYYY-01-01`. |
| `epoch`             | string   | Yes      | The epoch this event belongs to. Must be one of the [epoch enum values](#epoch-values). |
| `significance`      | integer  | Yes      | Historical significance score from 1 (minor) to 10 (paradigm shift). |
| `summary`           | string   | Yes      | Detailed summary of what happened and why it matters. Minimum 50 characters. |
| `entities`          | object   | Yes      | Related entities. See sub-fields below. |
| `tags`              | array    | Yes      | Categorical tags for filtering. Array of strings, minimum 1 item. |
| `impact_description`| string   | Yes      | Specific description of what this event changed. Minimum 20 characters. |
| `counterfactual`    | string   | Yes      | What would not exist or be different if this event had not happened. Minimum 20 characters. |
| `query_hooks`       | array    | Yes      | Natural language questions that should route an agent to this entry. Array of strings, minimum 1 item. |
| `preceded_by`       | array    | No       | IDs of events that directly preceded or enabled this one. Each must match `^evt_`. |
| `succeeded_by`      | array    | No       | IDs of events that directly followed from this one. Each must match `^evt_`. |
| `paper`             | object   | No       | Associated paper metadata. See sub-fields below. |

### `entities` Sub-Fields

| Field              | Type  | Description |
|--------------------|-------|-------------|
| `people`           | array | IDs of people involved. Each must match `^person_`. |
| `organizations`    | array | IDs of organizations involved. Each must match `^org_`. |
| `models_spawned`   | array | IDs of models that resulted from or were enabled by this event. Each must match `^model_`. |

No additional properties are allowed in the `entities` object.

### `paper` Sub-Fields

| Field                  | Type              | Description |
|------------------------|-------------------|-------------|
| `arxiv_id`             | string or null    | The arXiv identifier (e.g., `"1706.03762"`), or `null` if not on arXiv. |
| `citation_count_approx`| integer           | Approximate citation count. Minimum 0. |
| `url`                  | string            | URL to the paper. Must be a valid URI. |

### Example

```json
{
  "id": "evt_2017_attention_is_all_you_need",
  "type": "event",
  "title": "Publication of 'Attention Is All You Need'",
  "date": "2017-06-12",
  "epoch": "08_transformer_age",
  "significance": 10,
  "summary": "Eight Google researchers introduced the Transformer architecture, replacing recurrence entirely with self-attention. This paper is the single most consequential architectural innovation in modern AI.",
  "entities": {
    "people": ["person_vaswani_ashish", "person_shazeer_noam"],
    "organizations": ["org_google_brain"],
    "models_spawned": ["model_bert", "model_gpt_series"]
  },
  "preceded_by": ["evt_2014_seq2seq_attention"],
  "succeeded_by": ["evt_2018_bert_released", "evt_2018_gpt1_released"],
  "tags": ["architecture", "transformer", "attention", "paradigm_shift"],
  "impact_description": "Eliminated the sequential bottleneck of RNNs, enabling massive parallelization and scaling.",
  "paper": {
    "arxiv_id": "1706.03762",
    "citation_count_approx": 130000,
    "url": "https://arxiv.org/abs/1706.03762"
  },
  "counterfactual": "Without this paper, modern LLMs would likely not exist in their current form.",
  "query_hooks": [
    "Why do modern AI models use transformers?",
    "What replaced RNNs?",
    "Where did the attention mechanism come from?",
    "What is the most important AI paper ever written?"
  ]
}
```

---

## Entity Schema: Person

**File:** `schema/entity.schema.json` (person variant, discriminated by `"type": "person"`)
**Location:** `entities/people/` directory
**Filename convention:** `lastname_firstname.json`

### Fields

| Field               | Type           | Required | Description |
|---------------------|----------------|----------|-------------|
| `id`                | string         | Yes      | Unique identifier. Pattern: `person_lastname_firstname`. Must match regex `^person_[a-z_]+$`. |
| `type`              | string         | Yes      | Must be exactly `"person"`. |
| `name`              | string         | Yes      | Full human-readable name (e.g., `"Alan Turing"`). |
| `born`              | string         | Yes      | Date of birth in ISO 8601 format (`YYYY-MM-DD`). |
| `died`              | string or null | No       | Date of death in ISO 8601 format, or `null` if still living. |
| `nationality`       | string         | Yes      | Nationality (e.g., `"British"`, `"Canadian-American"`). |
| `affiliations`      | array          | Yes      | Organization IDs or institution names. Array of strings. |
| `key_contributions` | array          | Yes      | Most important contributions. Array of strings, minimum 1 item. |
| `significance`      | integer        | Yes      | Significance score from 1 to 10. |
| `influenced_by`     | array          | No       | IDs of people who influenced this person. Array of strings. |
| `influenced`        | array          | No       | IDs of people this person influenced. Array of strings. |
| `papers`            | array          | No       | IDs of papers authored. Array of strings. |
| `epoch_active`      | string         | No       | Primary epoch during which this person was most active. |
| `summary`           | string         | Yes      | Biographical summary. Minimum 20 characters. |

### Example

```json
{
  "id": "person_turing_alan",
  "type": "person",
  "name": "Alan Turing",
  "born": "1912-06-23",
  "died": "1954-06-07",
  "nationality": "British",
  "affiliations": ["org_university_of_manchester", "org_bletchley_park"],
  "key_contributions": [
    "Turing machine -- the theoretical foundation of all computation",
    "\"Computing Machinery and Intelligence\" (1950) -- posed \"Can machines think?\""
  ],
  "significance": 10,
  "influenced_by": ["person_church_alonzo", "person_godel_kurt"],
  "influenced": ["person_mccarthy_john", "person_minsky_marvin"],
  "papers": ["paper_1950_computing_machinery_and_intelligence"],
  "epoch_active": "01_dawn",
  "summary": "Alan Turing is the father of both computer science and artificial intelligence."
}
```

---

## Entity Schema: Organization

**File:** `schema/entity.schema.json` (organization variant, discriminated by `"type": "organization"`)
**Location:** `entities/organizations/` directory
**Filename convention:** `org_name.json`

### Fields

| Field          | Type    | Required | Description |
|----------------|---------|----------|-------------|
| `id`           | string  | Yes      | Unique identifier. Pattern: `org_name`. Must match regex `^org_[a-z0-9_]+$`. |
| `type`         | string  | Yes      | Must be exactly `"organization"`. |
| `name`         | string  | Yes      | Full human-readable name (e.g., `"OpenAI"`). |
| `founded`      | string  | Yes      | Date founded in ISO 8601 format (`YYYY-MM-DD`). |
| `founders`     | array   | No       | IDs of founding individuals. Array of strings. |
| `headquarters` | string  | Yes      | Location of headquarters (e.g., `"San Francisco, USA"`). |
| `org_type`     | string  | Yes      | Type of organization. Must be one of the [org_type enum values](#organization-type-values). |
| `key_models`   | array   | No       | IDs of notable models produced. Array of strings. |
| `key_papers`   | array   | No       | IDs of notable papers published. Array of strings. |
| `significance` | integer | Yes      | Significance score from 1 to 10. |
| `summary`      | string  | Yes      | Organizational summary. Minimum 20 characters. |

### Example

```json
{
  "id": "org_openai",
  "type": "organization",
  "name": "OpenAI",
  "founded": "2015-12-11",
  "founders": ["person_altman_sam", "person_musk_elon", "person_sutskever_ilya"],
  "headquarters": "San Francisco, USA",
  "org_type": "company",
  "key_models": ["model_gpt_series", "model_dall_e", "model_codex"],
  "key_papers": ["paper_2020_scaling_laws_for_neural_lms"],
  "significance": 9,
  "summary": "OpenAI was founded in 2015 as a nonprofit AI research lab. It developed the GPT series and launched ChatGPT, triggering a global AI arms race."
}
```

---

## Entity Schema: Model

**File:** `schema/entity.schema.json` (model variant, discriminated by `"type": "model"`)
**Location:** `entities/models/` directory
**Filename convention:** `model_name.json`

### Fields

| Field                | Type    | Required | Description |
|----------------------|---------|----------|-------------|
| `id`                 | string  | Yes      | Unique identifier. Pattern: `model_name`. Must match regex `^model_[a-z0-9_]+$`. |
| `type`               | string  | Yes      | Must be exactly `"model"`. |
| `name`               | string  | Yes      | Human-readable model name (e.g., `"GPT-4"`). |
| `organization`       | string  | Yes      | ID of the organization that created the model. |
| `release_date`       | string  | Yes      | Release date in ISO 8601 format (`YYYY-MM-DD`). |
| `architecture`       | string  | Yes      | Architecture type (e.g., `"decoder_only_transformer"`). |
| `parameter_count`    | string  | No       | Parameter count as a descriptive string (e.g., `"175B"`, `"estimated 1.8T MoE"`). |
| `training_approach`  | string  | No       | Training methodology (e.g., `"pretraining + RLHF"`). |
| `parent_models`      | array   | No       | IDs of predecessor models. Array of strings. |
| `child_models`       | array   | No       | IDs of successor/derived models. Array of strings. |
| `key_innovations`    | array   | No       | List of key innovations. Array of strings. |
| `benchmark_highlights`| object | No       | Notable benchmark results. Keys are benchmark names (strings), values are result descriptions (strings). |
| `lineage_path`       | string  | No       | Full architectural ancestry as a readable string with arrow separators. |
| `significance`       | integer | Yes      | Significance score from 1 to 10. |
| `cultural_impact`    | string  | No       | Description of the model's cultural and societal impact. |

### Example

```json
{
  "id": "model_gpt_series",
  "type": "model",
  "name": "GPT Series (GPT-1 through GPT-4)",
  "organization": "org_openai",
  "release_date": "2018-06-11",
  "architecture": "decoder_only_transformer",
  "parameter_count": "117M (GPT-1) to estimated 1.8T MoE (GPT-4)",
  "training_approach": "Unsupervised pretraining on web text, then RLHF fine-tuning",
  "parent_models": [],
  "child_models": ["model_chatgpt", "model_gpt4_turbo", "model_gpt4o"],
  "key_innovations": [
    "Demonstrated that scaling decoder-only transformers produces emergent capabilities",
    "In-context learning and few-shot prompting (GPT-3)"
  ],
  "benchmark_highlights": {
    "bar_exam": "90th percentile (GPT-4)",
    "MMLU": "86.4% (GPT-4)"
  },
  "lineage_path": "perceptron -> MLP -> RNN -> LSTM -> Transformer -> GPT-1 -> GPT-2 -> GPT-3 -> GPT-4",
  "significance": 10,
  "cultural_impact": "The GPT series is the most influential model family in AI history."
}
```

---

## Relationship Schema

**File:** `schema/relationship.schema.json`
**Location:** `graphs/` directory (as edges within graph JSON files)

Relationships are edges in the RETROSPEC knowledge graph, connecting entities of any type.

### Fields

| Field              | Type    | Required | Description |
|--------------------|---------|----------|-------------|
| `source`           | string  | Yes      | ID of the source entity. Can be any valid entity ID (`person_`, `org_`, `model_`, `evt_`, `concept_`). |
| `target`           | string  | Yes      | ID of the target entity. Can be any valid entity ID. |
| `relationship_type`| string  | Yes      | The type of relationship. Must be one of the [relationship_type enum values](#relationship-type-values). |
| `description`      | string  | Yes      | Human-readable description of this specific relationship. Minimum 5 characters. |
| `weight`           | number  | No       | Strength of the relationship from 0.0 (weak/indirect) to 1.0 (direct/strong). |
| `bidirectional`    | boolean | No       | Whether the relationship applies in both directions. Defaults to `false`. |
| `epoch`            | string  | No       | The epoch in which this relationship was established. |

### Example

```json
{
  "source": "person_hinton_geoffrey",
  "target": "person_lecun_yann",
  "relationship_type": "influenced",
  "description": "Hinton's work on backpropagation and deep learning directly influenced LeCun's development of convolutional neural networks.",
  "weight": 0.9,
  "bidirectional": false,
  "epoch": "06_quiet_revolution"
}
```

---

## Epoch Schema

**File:** `schema/epoch.schema.json`
**Location:** `epochs/XX_name/epoch.json`
**Filename convention:** `epoch.json` within an epoch directory

Epochs are the "chapters" of AI history. Each represents a distinct period with its own themes, breakthroughs, and characteristics.

### Fields

| Field                       | Type           | Required | Description |
|-----------------------------|----------------|----------|-------------|
| `id`                        | string         | Yes      | Unique identifier. Pattern: `epoch_XX_name`. Must match regex `^epoch_[0-9]{2}_[a-z_]+$`. |
| `type`                      | string         | Yes      | Must be exactly `"epoch"`. |
| `name`                      | string         | Yes      | Human-readable name (e.g., `"The Transformer Age"`). |
| `number`                    | integer        | Yes      | Sequential epoch number from 0 to 10. |
| `date_start`                | string         | Yes      | Start date in ISO 8601 format (`YYYY-MM-DD`). |
| `date_end`                  | string or null | No       | End date in ISO 8601 format, or `null` if the epoch is ongoing. |
| `summary`                   | string         | Yes      | Rich summary of the epoch. Minimum 50 characters. |
| `key_events`                | array          | Yes      | IDs of the most significant events in this epoch. Each must match `^evt_`. |
| `key_figures`               | array          | Yes      | IDs of the most influential people. Each must match `^person_`. |
| `key_models`                | array          | No       | IDs of notable models from this epoch. Each must match `^model_`. |
| `key_concepts`              | array          | No       | Core concepts that emerged or matured in this epoch. Array of strings. |
| `defining_characteristics`  | array          | Yes      | What made this epoch distinct. Array of strings, minimum 1 item. |
| `preceded_by`               | string or null | No       | ID of the previous epoch, or `null` for the first epoch. |
| `succeeded_by`              | string or null | No       | ID of the next epoch, or `null` for the current/last epoch. |
| `significance`              | integer        | Yes      | How transformative this epoch was, from 1 to 10. |

### Example

```json
{
  "id": "epoch_08_transformer_age",
  "type": "epoch",
  "name": "The Transformer Age",
  "number": 8,
  "date_start": "2017-06-12",
  "date_end": "2022-11-30",
  "summary": "The Transformer architecture replaced RNNs as the dominant paradigm, enabling BERT, GPT, and the scaling revolution that would lead to the generative AI explosion.",
  "key_events": ["evt_2017_attention_is_all_you_need", "evt_2018_bert_released"],
  "key_figures": ["person_vaswani_ashish", "person_devlin_jacob"],
  "key_models": ["model_bert", "model_gpt_series"],
  "key_concepts": ["self-attention", "transfer learning", "scaling laws"],
  "defining_characteristics": [
    "Transformer architecture became the universal backbone for NLP and beyond",
    "Scaling laws demonstrated predictable improvement with more data and compute"
  ],
  "preceded_by": "epoch_07_deep_learning_era",
  "succeeded_by": "epoch_09_generative_explosion",
  "significance": 10
}
```

---

## ID Conventions

All IDs in RETROSPEC follow strict naming patterns enforced by regex in the schemas. IDs use only lowercase ASCII letters, digits, and underscores.

### Patterns

| Entity Type   | Pattern                      | Regex                          | Examples |
|--------------|------------------------------|--------------------------------|----------|
| Event        | `evt_YYYY_short_name`        | `^evt_[0-9]{4}_[a-z0-9_]+$`   | `evt_2017_attention_is_all_you_need`, `evt_1956_dartmouth_conference` |
| Person       | `person_lastname_firstname`  | `^person_[a-z_]+$`            | `person_turing_alan`, `person_hinton_geoffrey`, `person_lecun_yann` |
| Organization | `org_name`                   | `^org_[a-z0-9_]+$`           | `org_openai`, `org_google_deepmind`, `org_meta_ai` |
| Model        | `model_name`                 | `^model_[a-z0-9_]+$`         | `model_gpt_series`, `model_bert`, `model_claude_series` |
| Paper        | `paper_YYYY_short_title`     | `^paper_[0-9]{4}_[a-z0-9_]+$`| `paper_2017_attention_is_all_you_need`, `paper_1950_computing_machinery_and_intelligence` |
| Concept      | `concept_name`               | `^concept_[a-z0-9_]+$`       | `concept_attention_mechanism`, `concept_backpropagation` |
| Epoch        | `epoch_XX_name`              | `^epoch_[0-9]{2}_[a-z_]+$`   | `epoch_08_transformer_age`, `epoch_01_dawn` |

### Rules

1. **Lowercase only.** Never use uppercase letters in IDs.
2. **Underscores as separators.** Never use hyphens, spaces, or camelCase.
3. **Keep it short.** Use the shortest recognizable name. Prefer `evt_2012_alexnet_imagenet` over `evt_2012_alexnet_wins_imagenet_challenge`.
4. **People: lastname first.** Always `person_lastname_firstname`, not the reverse.
5. **Multi-part names.** Join with underscores: `person_lecun_yann`, `person_von_neumann_john`.
6. **Abbreviations for orgs.** Use common abbreviations: `org_openai`, `org_mit`, not spelled-out forms.
7. **Model series.** When documenting a model family, use `model_name_series`: `model_gpt_series`, `model_claude_series`.
8. **Years in events and papers.** Always include the four-digit year as the first component after the prefix.

---

## Enum Values

The following fields accept only specific predefined values.

### Epoch Values

Used in the `epoch` field of events and the `id` of epoch entries.

| Value                      | Period         | Description |
|---------------------------|----------------|-------------|
| `00_philosophical_roots`  | 1300s-1940s    | Llull, Leibniz, Babbage, Lovelace -- philosophical and mechanical precursors |
| `01_dawn`                 | 1943-1956      | McCulloch-Pitts neurons, Turing's paper, Dartmouth Conference |
| `02_golden_age`           | 1956-1974      | Perceptrons, ELIZA, Shakey, LISP, early optimism |
| `03_first_winter`         | 1974-1980      | Lighthill Report, funding collapse, disillusionment |
| `04_expert_systems_boom`  | 1980-1987      | MYCIN, XCON, Fifth Generation Project, LISP machines |
| `05_second_winter`        | 1987-1993      | Expert system collapse, LISP machine bust |
| `06_quiet_revolution`     | 1993-2011      | ML rises quietly -- SVMs, Deep Blue, Watson, Web 2.0 data |
| `07_deep_learning_era`    | 2012-2017      | AlexNet, ImageNet breakthrough, AlphaGo, GPU computing |
| `08_transformer_age`      | 2017-2022      | Attention Is All You Need, BERT, GPT series, scaling laws |
| `09_generative_explosion` | 2022-2024      | ChatGPT, DALL-E, Stable Diffusion, Claude, Gemini |
| `10_agentic_era`          | 2024-present   | Autonomous agents, world models, tool use, multi-agent systems |

### Relationship Type Values

Used in the `relationship_type` field of relationship entries.

| Value              | Directionality | Description |
|--------------------|---------------|-------------|
| `influenced`       | A -> B        | Source intellectually influenced target's work |
| `evolved_from`     | A -> B        | Source architecture/model evolved from target |
| `founded`          | A -> B        | Source person founded target organization |
| `created`          | A -> B        | Source person/org created target model/concept |
| `published`        | A -> B        | Source person/org published target paper |
| `trained_at`       | A -> B        | Source person trained/studied at target institution |
| `collaborated_with`| A <-> B       | Source and target collaborated (often bidirectional) |
| `preceded`         | A -> B        | Source event preceded target event chronologically |
| `succeeded`        | A -> B        | Source event succeeded target event chronologically |
| `depends_on`       | A -> B        | Source concept depends on target concept |
| `enabled`          | A -> B        | Source event/concept enabled target event/model |
| `employed`         | A -> B        | Source organization employed target person |
| `funded`           | A -> B        | Source entity funded target entity |
| `competed_with`    | A <-> B       | Source and target were competitors (often bidirectional) |
| `forked_from`      | A -> B        | Source organization/model forked from target |
| `inspired`         | A -> B        | Source loosely inspired target (weaker than `influenced`) |

### Organization Type Values

Used in the `org_type` field of organization entities.

| Value            | Description |
|------------------|-------------|
| `lab`            | Research laboratory (e.g., Google Brain, FAIR) |
| `company`        | Commercial company (e.g., OpenAI, Anthropic) |
| `research_group` | Academic or institutional research group |
| `government`     | Government body or agency |
| `nonprofit`      | Nonprofit organization |
| `university`     | University or academic institution |

---

## Cross-Referencing Guide

RETROSPEC is a knowledge graph. Entries gain their power from connections to other entries. Proper cross-referencing is essential.

### Reference Rules

1. **Always use the full ID.** When referencing another entry, use its complete ID including the prefix: `person_turing_alan`, not `turing_alan` or `Turing`.

2. **Use the correct prefix.** The prefix must match the entity type:
   - People: `person_`
   - Organizations: `org_`
   - Models: `model_`
   - Events: `evt_`
   - Papers: `paper_`
   - Concepts: `concept_`
   - Epochs: `epoch_`

3. **Verify that referenced entries exist.** Before referencing an ID, confirm that the corresponding JSON file exists in the repository. The validation tool checks this automatically.

4. **Maintain bidirectional links.** When entity A references entity B, entity B should reference entity A in return. This applies to:

   | If you add...                          | Also add...                            |
   |----------------------------------------|----------------------------------------|
   | `preceded_by: ["evt_A"]` in event B    | `succeeded_by: ["evt_B"]` in event A   |
   | `influenced: ["person_B"]` in person A | `influenced_by: ["person_A"]` in person B |
   | `parent_models: ["model_A"]` in model B| `child_models: ["model_B"]` in model A |
   | `key_models: ["model_X"]` in org Y     | `organization: "org_Y"` in model X     |
   | `founders: ["person_X"]` in org Y      | `affiliations: ["org_Y"]` in person X  |

5. **Link across entity types.** The most valuable connections cross entity boundaries:
   - Events reference people, organizations, and models in their `entities` field.
   - People reference organizations in `affiliations` and papers in `papers`.
   - Models reference organizations in `organization` and other models in `parent_models`/`child_models`.
   - Epochs reference events in `key_events`, people in `key_figures`, and models in `key_models`.

6. **Use relationships for non-structural connections.** When a connection does not fit into a schema field (e.g., "Hinton influenced LeCun"), create a relationship entry in the appropriate graph file under `graphs/`.

### Cross-Reference Example

When adding a new event for "BERT Released" that references the Transformer paper event and Google as the organization:

**In `events/2018_bert_released.json`:**
```json
{
  "preceded_by": ["evt_2017_attention_is_all_you_need"],
  "entities": {
    "organizations": ["org_google_brain"]
  }
}
```

**Update `events/2017_attention_is_all_you_need.json` to include:**
```json
{
  "succeeded_by": ["evt_2018_bert_released"]
}
```

This ensures that an agent traversing the graph in either direction -- forward from the Transformer paper or backward from BERT -- can follow the chain.

### Dangling Reference Policy

A "dangling reference" is an ID that appears in an entry but does not correspond to any file in the repository. Dangling references are acceptable during active development (you may reference a person or model that has not been documented yet), but they should be resolved over time. The validation tool flags dangling references as warnings, not errors.
