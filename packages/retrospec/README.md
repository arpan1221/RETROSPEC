# retrospec

Query the RETROSPEC AI history knowledge graph.

## Install

```
npm install retrospec
```

## Usage

```ts
import Retrospec from 'retrospec';

const r = new Retrospec('/path/to/RETROSPEC');

// Search
r.search('attention mechanism');

// Lookup
r.lookup('evt_2017_attention_is_all_you_need');

// Trace lineage
r.traceLineage('model_gpt_series');

// Epoch events
r.epochEvents('08_transformer_age');

// Traverse graph
r.traverse('person_hinton_geoffrey', { graph: 'influence' });

// Stats
r.stats();
```
