# retrospec

Query the RETROSPEC AI history knowledge graph from Python.

## Install

```bash
pip install retrospec
```

## Usage

```python
from retrospec import Retrospec

r = Retrospec('/path/to/RETROSPEC')

# Search
r.search('attention mechanism')

# Lookup
r.lookup('evt_2017_attention_is_all_you_need')

# Trace lineage
r.trace_lineage('model_gpt_series')

# Epoch events
r.epoch_events('08_transformer_age')

# Traverse graph
r.traverse('person_hinton_geoffrey', graph='influence')

# Stats
r.stats()
```
