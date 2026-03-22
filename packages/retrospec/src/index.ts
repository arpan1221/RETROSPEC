import { RetrospecData } from "./data.js";
import type {
  AnyEntity,
  SearchResult,
  Connection,
  Stats,
  RetroEvent,
  Person,
  Organization,
  Model,
  Paper,
  Concept,
  Cycle,
  Epoch,
} from "./types.js";

export type {
  AnyEntity,
  SearchResult,
  Connection,
  Stats,
  RetroEvent,
  Person,
  Organization,
  Model,
  Paper,
  Concept,
  Cycle,
  Epoch,
  GraphData,
  GraphNode,
  GraphEdge,
  EpochId,
} from "./types.js";

/**
 * Main entry point for querying the RETROSPEC AI history knowledge graph.
 *
 * @example
 * ```ts
 * import Retrospec from 'retrospec';
 * const r = new Retrospec('/path/to/RETROSPEC');
 * r.search('attention mechanism');
 * r.lookup('evt_2017_attention_is_all_you_need');
 * r.traceLineage('model_gpt_series');
 * ```
 */
export class Retrospec {
  private data: RetrospecData;

  /**
   * @param dataDir Path to the RETROSPEC repository root. If omitted, the
   *   library will attempt to locate bundled data or walk up the directory tree.
   */
  constructor(dataDir?: string) {
    this.data = new RetrospecData(dataDir);
    this.data.load();
  }

  /** Look up any entity by its ID. */
  lookup(id: string): AnyEntity | null {
    return this.data.lookup(id);
  }

  /** Fuzzy search across all entities by name, title, or summary. */
  search(query: string, limit?: number): SearchResult[] {
    return this.data.search(query, limit);
  }

  /** Trace a model's lineage back through its parent_models chain. */
  traceLineage(modelId: string): AnyEntity[] {
    return this.data.traceLineage(modelId);
  }

  /** Get all events belonging to an epoch, sorted chronologically. */
  epochEvents(epochId: string): RetroEvent[] {
    return this.data.getEpochEvents(epochId);
  }

  /**
   * Traverse the knowledge graph starting from an entity.
   *
   * @param entityId  The starting entity ID
   * @param options.graph  Optional graph name (e.g. 'influence', 'architecture')
   * @param options.depth  How many hops to traverse (default 1)
   */
  traverse(
    entityId: string,
    options?: { graph?: string; depth?: number }
  ): Connection[] {
    return this.data.traverseGraph(
      entityId,
      options?.graph,
      options?.depth ?? 1
    );
  }

  /** Get repository statistics. */
  stats(): Stats {
    return this.data.getStats();
  }

  /** Get all events. */
  events(): RetroEvent[] {
    return this.data.events;
  }

  /** Get all people. */
  people(): Person[] {
    return this.data.people;
  }

  /** Get all organizations. */
  organizations(): Organization[] {
    return this.data.organizations;
  }

  /** Get all models. */
  models(): Model[] {
    return this.data.models;
  }

  /** Get all papers. */
  papers(): Paper[] {
    return this.data.papers;
  }

  /** Get all concepts. */
  concepts(): Concept[] {
    return this.data.concepts;
  }

  /** Get all cycles. */
  cycles(): Cycle[] {
    return this.data.cycles;
  }

  /** Get all epochs. */
  epochs(): Epoch[] {
    return this.data.epochs;
  }
}

export default Retrospec;
