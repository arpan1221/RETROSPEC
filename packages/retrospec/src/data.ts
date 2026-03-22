import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import type {
  AnyEntity,
  GraphData,
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

function readJsonFile(filePath: string): any | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function readJsonDir(dir: string): any[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJsonFile(path.join(dir, f)))
    .filter(Boolean);
}

/**
 * Resolve the RETROSPEC data root directory.
 *
 * Priority:
 *  1. Explicit dataDir passed by caller
 *  2. Bundled data at ../data/ (for published package)
 *  3. Walk up from this file to find a directory containing epochs/ and events/
 */
function resolveRoot(dataDir?: string): string {
  if (dataDir) {
    if (!fs.existsSync(dataDir)) {
      throw new Error(`RETROSPEC data directory not found: ${dataDir}`);
    }
    return dataDir;
  }

  // Try bundled data (published package layout)
  const bundled = path.resolve(import.meta.dirname, "..", "data");
  if (fs.existsSync(path.join(bundled, "events"))) {
    return bundled;
  }

  // Walk up from this file looking for the repo root
  let candidate = path.resolve(import.meta.dirname);
  for (let i = 0; i < 10; i++) {
    if (
      fs.existsSync(path.join(candidate, "events")) &&
      fs.existsSync(path.join(candidate, "epochs"))
    ) {
      return candidate;
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) break;
    candidate = parent;
  }

  throw new Error(
    "Could not locate RETROSPEC data. Pass the path to the RETROSPEC repo root as the first argument to the Retrospec constructor."
  );
}

export class RetrospecData {
  private root: string;
  private entityMap: Map<string, AnyEntity> = new Map();
  private _events: RetroEvent[] = [];
  private _people: Person[] = [];
  private _orgs: Organization[] = [];
  private _models: Model[] = [];
  private _papers: Paper[] = [];
  private _concepts: Concept[] = [];
  private _cycles: Cycle[] = [];
  private _epochs: Epoch[] = [];
  private graphMap: Map<string, GraphData> = new Map();
  private fuse!: Fuse<AnyEntity>;

  constructor(dataDir?: string) {
    this.root = resolveRoot(dataDir);
  }

  load(): void {
    this._events = readJsonDir(path.join(this.root, "events"));
    this._people = readJsonDir(path.join(this.root, "entities/people"));
    this._orgs = readJsonDir(path.join(this.root, "entities/organizations"));
    this._models = readJsonDir(path.join(this.root, "entities/models"));
    this._papers = readJsonDir(path.join(this.root, "papers"));
    this._concepts = readJsonDir(path.join(this.root, "concepts"));
    this._cycles = readJsonDir(path.join(this.root, "cycles"));

    // Load epochs
    const epochsDir = path.join(this.root, "epochs");
    if (fs.existsSync(epochsDir)) {
      this._epochs = fs
        .readdirSync(epochsDir)
        .filter((d) => {
          const epochFile = path.join(epochsDir, d, "epoch.json");
          return fs.existsSync(epochFile);
        })
        .map((d) => readJsonFile(path.join(epochsDir, d, "epoch.json")))
        .filter(Boolean)
        .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    }

    // Load graphs
    const graphFiles: GraphData[] = readJsonDir(path.join(this.root, "graphs"));
    for (const g of graphFiles) {
      if (g.id) this.graphMap.set(g.id, g);
      const shortName =
        g.id?.replace("graph_", "") ??
        g.name?.toLowerCase().replace(/\s+/g, "_");
      if (shortName) this.graphMap.set(shortName, g);
    }

    // Build entity index
    const allEntities: AnyEntity[] = [
      ...this._events,
      ...this._people,
      ...this._orgs,
      ...this._models,
      ...this._papers,
      ...this._concepts,
      ...this._cycles,
      ...this._epochs,
    ];

    for (const entity of allEntities) {
      if (entity.id) this.entityMap.set(entity.id, entity);
    }

    // Build Fuse.js search index
    this.fuse = new Fuse(allEntities, {
      keys: [
        { name: "name", weight: 2 },
        { name: "title", weight: 2 },
        { name: "summary", weight: 1 },
        { name: "id", weight: 0.5 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }

  lookup(id: string): AnyEntity | null {
    return this.entityMap.get(id) ?? null;
  }

  search(query: string, limit: number = 10): SearchResult[] {
    return this.fuse
      .search(query, { limit })
      .map((r) => ({ entity: r.item, score: r.score ?? 0 }));
  }

  traceLineage(modelId: string): AnyEntity[] {
    const chain: AnyEntity[] = [];
    let current = this.entityMap.get(modelId);
    if (!current) return chain;

    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      chain.push(current);
      const parents = (current as any).parent_models as string[] | undefined;
      if (!parents?.length) break;
      current = this.entityMap.get(parents[0]);
    }

    return chain;
  }

  traverseGraph(
    entityId: string,
    graphName?: string,
    depth: number = 1
  ): Connection[] {
    const results: Connection[] = [];

    const graphsToSearch = graphName
      ? [this.graphMap.get(graphName)]
      : Array.from(new Set(this.graphMap.values()));

    for (const graph of graphsToSearch) {
      if (!graph) continue;
      const visited = new Set<string>();
      const queue: Array<{ id: string; currentDepth: number }> = [
        { id: entityId, currentDepth: 0 },
      ];

      while (queue.length > 0) {
        const { id, currentDepth } = queue.shift()!;
        if (currentDepth >= depth || visited.has(id)) continue;
        visited.add(id);

        for (const edge of graph.edges) {
          if (edge.source === id) {
            results.push({
              entity: this.entityMap.get(edge.target) ?? null,
              relationship: edge.relationship,
              weight: edge.weight,
              direction: "outgoing",
            });
            if (currentDepth + 1 < depth) {
              queue.push({ id: edge.target, currentDepth: currentDepth + 1 });
            }
          }
          if (edge.target === id) {
            results.push({
              entity: this.entityMap.get(edge.source) ?? null,
              relationship: edge.relationship,
              weight: edge.weight,
              direction: "incoming",
            });
            if (currentDepth + 1 < depth) {
              queue.push({ id: edge.source, currentDepth: currentDepth + 1 });
            }
          }
        }
      }
    }

    return results;
  }

  getEpochEvents(epochId: string): RetroEvent[] {
    return this._events
      .filter((e) => e.epoch === epochId)
      .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  }

  getStats(): Stats {
    return {
      events: this._events.length,
      people: this._people.length,
      organizations: this._orgs.length,
      models: this._models.length,
      papers: this._papers.length,
      concepts: this._concepts.length,
      cycles: this._cycles.length,
      epochs: this._epochs.length,
      graphs: this.graphMap.size / 2,
      total: this.entityMap.size,
    };
  }

  get events(): RetroEvent[] {
    return this._events;
  }
  get people(): Person[] {
    return this._people;
  }
  get organizations(): Organization[] {
    return this._orgs;
  }
  get models(): Model[] {
    return this._models;
  }
  get papers(): Paper[] {
    return this._papers;
  }
  get concepts(): Concept[] {
    return this._concepts;
  }
  get cycles(): Cycle[] {
    return this._cycles;
  }
  get epochs(): Epoch[] {
    return this._epochs;
  }
}
