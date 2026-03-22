// RETROSPEC Data Types — derived from schema/*.json

export interface RetroEvent {
  id: string;
  type: 'event';
  title: string;
  date: string;
  epoch: EpochId;
  significance: number;
  summary: string;
  entities: {
    people?: string[];
    organizations?: string[];
    models_spawned?: string[];
  };
  preceded_by?: string[];
  succeeded_by?: string[];
  tags: string[];
  impact_description: string;
  paper?: {
    arxiv_id: string | null;
    citation_count_approx: number;
    url: string;
  };
  counterfactual: string;
  query_hooks: string[];
}

export interface Person {
  id: string;
  type: 'person';
  name: string;
  born: string;
  died: string | null;
  nationality: string;
  affiliations: string[];
  key_contributions: string[];
  significance: number;
  influenced_by?: string[];
  influenced?: string[];
  papers?: string[];
  epoch_active: string;
  summary: string;
}

export interface Organization {
  id: string;
  type: 'organization';
  name: string;
  founded: string;
  founders?: string[];
  headquarters: string;
  org_type: string;
  key_models?: string[];
  key_papers?: string[];
  significance: number;
  summary: string;
}

export interface Model {
  id: string;
  type: 'model';
  name: string;
  organization: string;
  release_date: string;
  architecture: string;
  parameter_count?: string;
  training_approach?: string;
  parent_models?: string[];
  child_models?: string[];
  key_innovations?: string[];
  benchmark_highlights?: Record<string, string>;
  lineage_path?: string;
  significance: number;
  cultural_impact?: string;
}

export interface Paper {
  id: string;
  type: 'paper';
  title: string;
  authors: string[];
  date: string;
  venue: string;
  arxiv_id: string | null;
  url: string | null;
  citation_count_approx: number;
  epoch: string;
  significance: number;
  summary: string;
  key_contributions: string[];
  preceded_by?: string[];
  succeeded_by?: string[];
  related_events?: string[];
  related_concepts?: string[];
  impact: string;
  query_hooks: string[];
}

export interface Concept {
  id: string;
  type: 'concept';
  name: string;
  summary: string;
  introduced_date: string;
  introduced_by?: string[];
  epoch_introduced: string;
  significance: number;
  prerequisites?: string[];
  enables?: string[];
  related_papers?: string[];
  related_events?: string[];
  current_status: string;
  query_hooks: string[];
}

export interface Cycle {
  id: string;
  type: 'cycle';
  name: string;
  cycle_type: 'winter' | 'boom' | 'hype' | 'quiet';
  date_start: string;
  date_end: string;
  duration_years: number;
  summary: string;
  trigger_signals: string[];
  lessons_learned: string[];
  significance: number;
  query_hooks: string[];
}

export interface Epoch {
  id: string;
  type: 'epoch';
  name: string;
  number: number;
  date_start: string;
  date_end: string | null;
  summary: string;
  key_events: string[];
  key_figures: string[];
  key_models?: string[];
  key_concepts?: string[];
  defining_characteristics: string[];
  preceded_by: string | null;
  succeeded_by: string | null;
  significance: number;
}

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  entities: string[];
  events: string[];
  significance_sum: number;
  epoch_range: EpochId[];
}

export interface GraphData {
  id: string;
  type: 'graph';
  name: string;
  node_count: number;
  edge_count: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  name: string;
  significance?: number;
  type?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight?: number;
}

export type EpochId =
  | '00_philosophical_roots'
  | '01_dawn'
  | '02_golden_age'
  | '03_first_winter'
  | '04_expert_systems_boom'
  | '05_second_winter'
  | '06_quiet_revolution'
  | '07_deep_learning_era'
  | '08_transformer_age'
  | '09_generative_explosion'
  | '10_agentic_era';

export type AnyEntity = RetroEvent | Person | Organization | Model | Paper | Concept | Cycle;

export function getEntityName(entity: AnyEntity): string {
  if ('title' in entity && typeof (entity as any).title === 'string') return (entity as any).title;
  if ('name' in entity && typeof (entity as any).name === 'string') return (entity as any).name;
  return (entity as any).id ?? 'Unknown';
}

export function getEntityType(entity: AnyEntity): string {
  return entity.type;
}

export const EPOCH_LABELS: Record<EpochId, string> = {
  '00_philosophical_roots': 'Philosophical Roots',
  '01_dawn': 'Dawn of AI',
  '02_golden_age': 'Golden Age',
  '03_first_winter': 'First Winter',
  '04_expert_systems_boom': 'Expert Systems',
  '05_second_winter': 'Second Winter',
  '06_quiet_revolution': 'Quiet Revolution',
  '07_deep_learning_era': 'Deep Learning',
  '08_transformer_age': 'Transformer Age',
  '09_generative_explosion': 'Generative Explosion',
  '10_agentic_era': 'Agentic Era',
};

export const EPOCH_SHORT: Record<EpochId, string> = {
  '00_philosophical_roots': 'Roots',
  '01_dawn': 'Dawn',
  '02_golden_age': 'Golden',
  '03_first_winter': 'Winter I',
  '04_expert_systems_boom': 'Expert',
  '05_second_winter': 'Winter II',
  '06_quiet_revolution': 'Quiet',
  '07_deep_learning_era': 'Deep Learning',
  '08_transformer_age': 'Transformer',
  '09_generative_explosion': 'GenAI',
  '10_agentic_era': 'Agentic',
};
