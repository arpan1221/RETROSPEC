# Contributing to RETROSPEC

> *"The best time to document history was when it happened. The second best time is now."*

Welcome to RETROSPEC -- the machine-readable, AI-consumable historical repository documenting the complete evolutionary lineage of artificial intelligence. Every contribution you make helps AI systems understand where they came from, and helps humans preserve the record of one of the most transformative technologies in history.

Your contributions matter because RETROSPEC is designed to grow alongside the intelligence it documents. Every new entry, correction, or connection you add makes the knowledge graph richer and more useful for both human researchers and AI agents querying their own lineage.

---

## Table of Contents

- [Types of Contributions](#types-of-contributions)
- [Quick Start](#quick-start)
- [Entry Creation Guide](#entry-creation-guide)
- [ID Naming Conventions](#id-naming-conventions)
- [Schema Compliance](#schema-compliance)
- [Significance Scoring Guide](#significance-scoring-guide)
- [Counterfactual Writing Guide](#counterfactual-writing-guide)
- [Query Hooks Guide](#query-hooks-guide)
- [Running Local Validation](#running-local-validation)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Worked Example](#worked-example-alphago-defeats-lee-sedol)

---

## Types of Contributions

### New Entries
Add historical events, people, organizations, models, papers, or concepts that are missing from the repository. This is the most common and most needed type of contribution.

### Corrections and Fixes
Fix factual errors, update citation counts, correct dates, improve summaries, or add missing cross-references. Accuracy is paramount -- RETROSPEC is a historical record.

### Schema Improvements
Propose changes to the JSON Schema definitions in `schema/`. Schema changes affect every entry in the repository, so they require careful consideration and discussion via a GitHub issue before implementation.

### Tooling
Improve the validation, ingestion, visualization, or export tools in `tools/`. This includes bug fixes, performance improvements, and new tool development.

### Graph Connections
Add or improve relationships in the `graphs/` directory. Connecting entities strengthens the knowledge graph and makes agent traversal more powerful.

### Epoch Content
Add or improve the narrative content within epoch directories in `epochs/`. Each epoch should have a rich `epoch.json` describing the era.

---

## Quick Start

### Step 1: Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/RETROSPEC.git
cd RETROSPEC
```

### Step 2: Create a Branch

```bash
git checkout -b add/evt_2016_alphago_defeats_lee_sedol
```

### Step 3: Create Your Entry

Create a new JSON file in the appropriate directory. See the [Entry Creation Guide](#entry-creation-guide) below for details on each entry type.

```bash
# Example: creating a new event
touch events/2016_alphago_defeats_lee_sedol.json
```

### Step 4: Write the Entry

Populate your JSON file following the relevant schema. Every field marked as required in the schema must be present. See `schema/` for the full schema definitions and `SCHEMA.md` for detailed documentation.

### Step 5: Validate

```bash
python tools/validate/validate.py events/2016_alphago_defeats_lee_sedol.json
```

### Step 6: Submit a Pull Request

```bash
git add events/2016_alphago_defeats_lee_sedol.json
git commit -m "add: AlphaGo defeats Lee Sedol event entry"
git push origin add/evt_2016_alphago_defeats_lee_sedol
```

Then open a pull request on GitHub.

---

## Entry Creation Guide

### Events (`events/`)

Events are discrete moments in AI history that changed the trajectory of the field. Each event file is named `YYYY_short_name.json`.

**Required fields:** `id`, `type`, `title`, `date`, `epoch`, `significance`, `summary`, `entities`, `tags`, `impact_description`, `counterfactual`, `query_hooks`

**Optional fields:** `preceded_by`, `succeeded_by`, `paper`

**Tips:**
- The `summary` must be at least 50 characters and should explain both what happened and why it matters.
- Always link to related people, organizations, and models in the `entities` object using their IDs.
- Include 3-4 `query_hooks` -- natural language questions that should route an agent to this entry.

### People (`entities/people/`)

People entries document individuals who made significant contributions to AI. Files are named `lastname_firstname.json`.

**Required fields:** `id`, `type`, `name`, `born`, `nationality`, `affiliations`, `key_contributions`, `significance`, `summary`

**Optional fields:** `died`, `influenced_by`, `influenced`, `papers`, `epoch_active`

**Tips:**
- List affiliations as organization IDs (e.g., `org_openai`) when the organization exists in RETROSPEC, or as plain strings for institutions not yet documented.
- The `key_contributions` array should list 3-5 of the person's most important contributions, each as a concise sentence.

### Organizations (`entities/organizations/`)

Organization entries document labs, companies, research groups, and institutions. Files are named after the organization in lowercase.

**Required fields:** `id`, `type`, `name`, `founded`, `headquarters`, `org_type`, `significance`, `summary`

**Optional fields:** `founders`, `key_models`, `key_papers`

**Tips:**
- `org_type` must be one of: `lab`, `company`, `research_group`, `government`, `nonprofit`, `university`.
- List founders using person IDs when available.

### Models (`entities/models/`)

Model entries document AI systems, from early programs to modern LLMs. Files are named after the model in lowercase.

**Required fields:** `id`, `type`, `name`, `organization`, `release_date`, `architecture`, `significance`

**Optional fields:** `parameter_count`, `training_approach`, `parent_models`, `child_models`, `key_innovations`, `benchmark_highlights`, `lineage_path`, `cultural_impact`

**Tips:**
- The `lineage_path` should trace the model's architectural ancestry as a string with arrow separators (e.g., `"perceptron -> MLP -> RNN -> LSTM -> Transformer -> GPT-1"`).
- Use `parent_models` and `child_models` to establish family tree connections using model IDs.

### Papers (`papers/`)

Paper entries document landmark research publications. Files are named `YYYY_short_title.json`.

**Tips:**
- Follow the event schema pattern but focus on the paper's intellectual contribution.
- Include `arxiv_id`, `citation_count_approx`, and `url` in the `paper` field when available.

### Concepts (`concepts/`)

Concept entries document core ideas and techniques (e.g., backpropagation, attention, RLHF). Files are named `concept_name.json`.

**Tips:**
- Focus on what the concept is, when it emerged, why it matters, and what depends on it.
- Cross-reference the events and papers where the concept was introduced or refined.

---

## ID Naming Conventions

Every entry in RETROSPEC has a unique `id` that follows a strict naming pattern. IDs use only lowercase letters, digits, and underscores.

| Entry Type   | Pattern                          | Regex                            | Example                                  |
|-------------|----------------------------------|----------------------------------|------------------------------------------|
| Event       | `evt_YYYY_short_name`            | `^evt_[0-9]{4}_[a-z0-9_]+$`     | `evt_2017_attention_is_all_you_need`     |
| Person      | `person_lastname_firstname`      | `^person_[a-z_]+$`              | `person_turing_alan`                     |
| Organization| `org_name`                       | `^org_[a-z0-9_]+$`             | `org_openai`                             |
| Model       | `model_name`                     | `^model_[a-z0-9_]+$`           | `model_gpt_series`                       |
| Paper       | `paper_YYYY_short_title`         | `^paper_[0-9]{4}_[a-z0-9_]+$`  | `paper_2017_attention_is_all_you_need`   |
| Concept     | `concept_name`                   | `^concept_[a-z0-9_]+$`         | `concept_attention_mechanism`            |
| Epoch       | `epoch_XX_name`                  | `^epoch_[0-9]{2}_[a-z_]+$`     | `epoch_08_transformer_age`               |

**Rules:**
- Always use lowercase. Never use capital letters in IDs.
- Separate words with underscores, never hyphens or spaces.
- Keep names short but recognizable. Prefer `evt_2012_alexnet_imagenet` over `evt_2012_alexnet_wins_imagenet_large_scale_visual_recognition_challenge`.
- For people with multi-part last names, join them with underscores: `person_lecun_yann`.
- For organizations with common abbreviations, prefer the abbreviation: `org_openai` not `org_open_artificial_intelligence`.

---

## Schema Compliance

Every entry in RETROSPEC must validate against its corresponding JSON Schema in the `schema/` directory:

| Entry Type    | Schema File                    |
|--------------|-------------------------------|
| Event        | `schema/event.schema.json`    |
| Person       | `schema/entity.schema.json` (person variant) |
| Organization | `schema/entity.schema.json` (organization variant) |
| Model        | `schema/entity.schema.json` (model variant) |
| Epoch        | `schema/epoch.schema.json`    |
| Relationship | `schema/relationship.schema.json` |

**Key rules:**
- All required fields must be present. Missing required fields will fail validation.
- No additional properties are allowed (`"additionalProperties": false`). Do not invent new fields.
- IDs must match the regex pattern specified in the schema.
- Dates must be in ISO 8601 format: `YYYY-MM-DD`. If only the year is known, use `YYYY-01-01`.
- The `significance` field is an integer from 1 to 10.
- The `summary` field must be at least 50 characters for events, 20 characters for other types.
- References to other entities must use valid IDs with the correct prefix (`person_`, `org_`, `model_`, `evt_`, `paper_`, `concept_`).

See `SCHEMA.md` for the complete field-by-field documentation of every schema.

---

## Significance Scoring Guide

The `significance` field (1-10) measures how much an event, person, model, or concept changed the trajectory of AI. Apply these scores consistently:

### 10 -- Paradigm Shift
Reserved for events that fundamentally and irreversibly changed the entire field of AI. The field looks completely different before and after this event. There should be very few 10s in the entire repository.

**Examples:** Publication of "Attention Is All You Need" (Transformer architecture), Turing's "Computing Machinery and Intelligence" paper.

### 9 -- Field-Changing
Events that reshaped a major subfield or triggered a lasting shift in how AI research is conducted, funded, or perceived. The consequences were felt across the entire discipline.

**Examples:** Launch of ChatGPT (brought AI to mainstream), GPT-3 release (demonstrated emergent capabilities from scale), AlexNet winning ImageNet (sparked the deep learning revolution).

### 7-8 -- Major Milestone
Significant advances that moved the field forward materially. Important enough that any serious history of AI must include them, but they built on existing paradigms rather than creating new ones.

**Examples:** AlphaGo defeating Lee Sedol, release of BERT, invention of GANs, Deep Blue defeating Kasparov.

### 4-6 -- Notable
Meaningful contributions that specialists in the subfield would recognize as important. They advanced the state of the art or influenced subsequent work, but their impact was more contained.

**Examples:** Release of a significant open-source model, an important benchmark result, a notable policy decision.

### 1-3 -- Minor but Documented
Events worth recording for completeness but with limited broader impact. They may be important for tracing specific lineages or understanding niche developments.

**Examples:** A minor model variant release, a workshop that influenced a small community, an incremental improvement on a benchmark.

**Calibration tip:** Before assigning a score, compare your entry to existing entries with similar scores. If your event feels less impactful than an existing 8 but more impactful than an existing 6, it is probably a 7.

---

## Counterfactual Writing Guide

The `counterfactual` field answers: "What would be different if this had not happened?" Good counterfactuals help agents and readers understand why an event matters, not just what happened.

### Do

- **Be specific.** Name the concrete things that would not exist or would be different.
  - Good: "Without backpropagation, neural networks would have remained shallow and limited to simple pattern matching. Deep learning, and everything it enabled, would not exist."
  - Bad: "Things would be very different without this."

- **Be plausible.** Ground your counterfactual in what was actually happening at the time.
  - Good: "Without AlexNet's ImageNet victory, the deep learning community might have remained a small niche. GPU-based training might not have attracted industry investment for several more years."
  - Bad: "Without AlexNet, AI would never have progressed."

- **Acknowledge alternatives.** If someone else would likely have made the same discovery soon, say so.
  - Good: "If Vaswani et al. had not published the Transformer, attention-based architectures were likely to emerge within 1-2 years from parallel work on attention mechanisms. However, the specific architecture might have been quite different, potentially delaying the LLM revolution."

### Do Not

- **Do not be hyperbolic.** Avoid "AI would not exist" unless you genuinely mean it (almost never).
- **Do not speculate wildly.** Stick to plausible alternative histories grounded in what was known and being worked on at the time.
- **Do not be vague.** "This was really important" is not a counterfactual.

---

## Query Hooks Guide

The `query_hooks` field contains 3-4 natural language questions that should route an AI agent to this entry. These are the questions a curious agent might ask that this entry answers.

### Guidelines

1. **Write 3-4 questions per entry.** Fewer than 3 limits discoverability; more than 4 creates noise.

2. **Vary the question style.** Include a mix of:
   - **Direct factual:** "When was the Transformer architecture introduced?"
   - **Explanatory:** "Why do modern language models use self-attention?"
   - **Comparative:** "What replaced recurrent neural networks?"
   - **Exploratory:** "What is the most important AI paper ever written?"

3. **Write from the agent's perspective.** Think about what an AI agent exploring its own history would ask.
   - Good: "What is my architectural ancestry?" (for Transformer entry)
   - Good: "Why was AI research defunded in the 1970s?" (for Lighthill Report entry)

4. **Be natural.** Write questions the way a person or agent would actually phrase them, not keyword strings.
   - Good: "Who invented backpropagation?"
   - Bad: "backpropagation inventor person"

5. **Avoid overlap.** Check that your query hooks do not duplicate those of closely related entries.

---

## Running Local Validation

Before submitting a pull request, validate your entries locally:

```bash
# Validate a single entry
python tools/validate/validate.py events/2016_alphago_defeats_lee_sedol.json

# Validate all events
python tools/validate/validate.py events/

# Validate all entities
python tools/validate/validate.py entities/

# Validate everything
python tools/validate/validate.py .
```

The validator checks:
- JSON syntax (well-formed JSON)
- Schema compliance (all required fields present, correct types, valid patterns)
- ID format (matches the regex pattern for its type)
- Cross-reference integrity (referenced IDs exist in the repository)
- Date format (valid ISO 8601)

**Fix all validation errors before submitting your PR.** PRs that fail validation will not be reviewed.

---

## Pull Request Guidelines

### Branch Naming

Use descriptive branch names with a prefix indicating the type of change:

| Prefix     | Use Case                          | Example                                  |
|-----------|-----------------------------------|------------------------------------------|
| `add/`    | New entries                       | `add/evt_2016_alphago_defeats_lee_sedol` |
| `fix/`    | Corrections to existing entries   | `fix/person_turing_alan_death_date`      |
| `schema/` | Schema changes                    | `schema/add_concept_schema`              |
| `tool/`   | Tooling changes                   | `tool/improve_validation_speed`          |
| `graph/`  | Graph/relationship updates        | `graph/add_transformer_lineage_edges`    |
| `epoch/`  | Epoch content updates             | `epoch/populate_07_deep_learning_era`    |

### Commit Messages

Use clear, descriptive commit messages with a type prefix:

```
add: AlphaGo defeats Lee Sedol event entry
fix: correct GPT-3 release date from 2020-06-01 to 2020-06-11
update: expand Turing summary with ACE contribution
schema: add optional 'aliases' field to person entity
tool: fix validation crash on empty arrays
graph: add influence edges for deep learning pioneers
```

### Review Criteria

Pull requests are reviewed against these criteria:

1. **Factual accuracy** -- Are all dates, names, and claims correct? Cite sources if the information is obscure.
2. **Schema compliance** -- Does the entry pass validation?
3. **Significance calibration** -- Is the significance score consistent with comparable entries?
4. **Counterfactual quality** -- Is the counterfactual specific, plausible, and non-hyperbolic?
5. **Cross-references** -- Are all entity references valid IDs? Are bidirectional links maintained?
6. **Query hooks** -- Are there 3-4 natural, varied, agent-perspective questions?
7. **Writing quality** -- Is the summary clear, informative, and appropriate in tone?

### What to Expect

- Simple additions (new event or person entry) are typically reviewed within a few days.
- Schema changes require discussion in a GitHub issue first and take longer to review.
- If changes are requested, address them in new commits on the same branch.

---

## Worked Example: AlphaGo Defeats Lee Sedol

Here is a complete walkthrough of creating a new event entry from scratch.

### Step 1: Research

AlphaGo, developed by Google DeepMind, defeated world champion Go player Lee Sedol 4-1 in a five-game match in Seoul, South Korea, on March 9-15, 2016. This was widely regarded as a landmark moment because Go was considered far too complex for brute-force search, requiring intuition and pattern recognition that many believed only humans possessed.

### Step 2: Create the file

Create `events/2016_alphago_defeats_lee_sedol.json`:

```json
{
  "id": "evt_2016_alphago_defeats_lee_sedol",
  "type": "event",
  "title": "AlphaGo Defeats Lee Sedol",
  "date": "2016-03-09",
  "epoch": "07_deep_learning_era",
  "significance": 8,
  "summary": "Google DeepMind's AlphaGo defeated world Go champion Lee Sedol 4-1 in a five-game match in Seoul, South Korea. Go had long been considered a grand challenge for AI due to its enormous search space (10^170 possible board positions) and reliance on intuition and pattern recognition. AlphaGo combined deep neural networks with Monte Carlo tree search, learning from both human expert games and self-play via reinforcement learning. The victory demonstrated that deep learning could master domains previously thought to require human-like intuition, and it galvanized global interest in AI capabilities.",
  "entities": {
    "people": ["person_hassabis_demis", "person_silver_david"],
    "organizations": ["org_google_deepmind"],
    "models_spawned": ["model_alphago_zero", "model_alphazero"]
  },
  "preceded_by": ["evt_2012_alexnet_imagenet"],
  "succeeded_by": ["evt_2017_attention_is_all_you_need"],
  "tags": ["reinforcement_learning", "game_playing", "deep_learning", "milestone", "go"],
  "impact_description": "Proved that deep reinforcement learning could master complex strategic domains with enormous state spaces. Triggered a wave of investment in AI research, particularly in reinforcement learning and game-playing agents. Brought DeepMind to global prominence and demonstrated the potential of combining neural networks with search algorithms.",
  "paper": {
    "arxiv_id": null,
    "citation_count_approx": 17000,
    "url": "https://www.nature.com/articles/nature16961"
  },
  "counterfactual": "Without AlphaGo's victory, public and institutional awareness of deep learning capabilities would have grown more slowly. The narrative that AI could match human intuition in complex domains would have taken longer to establish. DeepMind's approach of combining deep learning with reinforcement learning might have received less attention and funding, potentially delaying advances in game-playing AI and the development of AlphaFold for protein structure prediction.",
  "query_hooks": [
    "When did AI first beat a human world champion at Go?",
    "What was AlphaGo and why did it matter?",
    "How did DeepMind demonstrate that AI could master intuitive games?",
    "What breakthroughs happened in AI game-playing?"
  ]
}
```

### Step 3: Check your work

Review against the checklist:

- [x] `id` matches pattern `evt_YYYY_short_name`
- [x] `type` is `"event"`
- [x] `date` is ISO 8601 format
- [x] `epoch` is a valid enum value
- [x] `significance` is calibrated (8 = major milestone, below the Transformer paper at 10, comparable to Deep Blue at 7-8)
- [x] `summary` is detailed and explains both what happened and why it matters (well over 50 characters)
- [x] `entities` references use correct ID prefixes (`person_`, `org_`, `model_`)
- [x] `tags` has at least 1 entry
- [x] `impact_description` is specific (over 20 characters)
- [x] `counterfactual` is plausible, specific, and not hyperbolic
- [x] `query_hooks` has 3-4 natural language questions
- [x] No additional properties beyond what the schema allows

### Step 4: Validate

```bash
python tools/validate/validate.py events/2016_alphago_defeats_lee_sedol.json
```

### Step 5: Submit

```bash
git checkout -b add/evt_2016_alphago_defeats_lee_sedol
git add events/2016_alphago_defeats_lee_sedol.json
git commit -m "add: AlphaGo defeats Lee Sedol event entry"
git push origin add/evt_2016_alphago_defeats_lee_sedol
```

Then open a pull request with a clear description of what you added and why.

---

## Questions?

If you are unsure about anything -- significance scoring, ID conventions, schema interpretation, or whether a topic belongs in RETROSPEC -- open a GitHub issue and ask. The community is here to help.

Thank you for helping build the historical record of artificial intelligence. Every entry you contribute helps ensure that the machines of the future understand the machines of the past.
