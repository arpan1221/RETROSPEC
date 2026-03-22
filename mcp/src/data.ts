import fs from "fs";
import path from "path";
import Fuse from "fuse.js";

// Root of the RETROSPEC data repository
const ROOT = path.resolve(import.meta.dirname, "../..");

interface AnyEntity {
  id: string;
  type: string;
  [key: string]: any;
}

interface GraphData {
  id: string;
  name: string;
  node_count: number;
  edge_count: number;
  nodes: Array<{ id: string; name: string; significance?: number; type?: string }>;
  edges: Array<{ source: string; target: string; relationship: string; weight?: number }>;
}

function readJsonFile(filePath: string): any | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function readJsonDir(dir: string): any[] {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJsonFile(path.join(fullPath, f)))
    .filter(Boolean);
}

// In-memory data store — loaded once on startup
class RetrospecData {
  private entities: Map<string, AnyEntity> = new Map();
  private events: AnyEntity[] = [];
  private people: AnyEntity[] = [];
  private orgs: AnyEntity[] = [];
  private models: AnyEntity[] = [];
  private papers: AnyEntity[] = [];
  private concepts: AnyEntity[] = [];
  private cycles: AnyEntity[] = [];
  private epochs: AnyEntity[] = [];
  private graphs: Map<string, GraphData> = new Map();
  private fuse!: Fuse<AnyEntity>;

  load(): void {
    console.error("[retrospec] Loading data from", ROOT);

    this.events = readJsonDir("events");
    this.people = readJsonDir("entities/people");
    this.orgs = readJsonDir("entities/organizations");
    this.models = readJsonDir("entities/models");
    this.papers = readJsonDir("papers");
    this.concepts = readJsonDir("concepts");
    this.cycles = readJsonDir("cycles");

    // Load epochs
    const epochsDir = path.join(ROOT, "epochs");
    if (fs.existsSync(epochsDir)) {
      this.epochs = fs
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
    const graphFiles = readJsonDir("graphs");
    for (const g of graphFiles) {
      if (g.id) this.graphs.set(g.id, g);
      // Also index by short name
      const shortName = g.id?.replace("graph_", "") ?? g.name?.toLowerCase().replace(/\s+/g, "_");
      if (shortName) this.graphs.set(shortName, g);
    }

    // Build entity index
    const allEntities = [
      ...this.events,
      ...this.people,
      ...this.orgs,
      ...this.models,
      ...this.papers,
      ...this.concepts,
      ...this.cycles,
      ...this.epochs,
    ];

    for (const entity of allEntities) {
      if (entity.id) this.entities.set(entity.id, entity);
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

    console.error(
      `[retrospec] Loaded ${this.entities.size} entities (${this.events.length} events, ${this.people.length} people, ${this.orgs.length} orgs, ${this.models.length} models, ${this.papers.length} papers, ${this.concepts.length} concepts, ${this.cycles.length} cycles, ${this.epochs.length} epochs, ${this.graphs.size / 2} graphs)`
    );
  }

  lookup(id: string): AnyEntity | null {
    return this.entities.get(id) ?? null;
  }

  search(query: string, limit: number = 10): Array<{ entity: AnyEntity; score: number }> {
    return this.fuse
      .search(query, { limit })
      .map((r) => ({ entity: r.item, score: r.score ?? 0 }));
  }

  traceLineage(modelId: string): AnyEntity[] {
    const chain: AnyEntity[] = [];
    let current = this.entities.get(modelId);
    if (!current) return chain;

    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      chain.push(current);
      const parents = current.parent_models as string[] | undefined;
      if (!parents?.length) break;
      current = this.entities.get(parents[0]);
    }

    return chain;
  }

  traverseGraph(
    entityId: string,
    graphName?: string,
    depth: number = 1
  ): Array<{ entity: AnyEntity | null; relationship: string; weight?: number; direction: string }> {
    const results: Array<{
      entity: AnyEntity | null;
      relationship: string;
      weight?: number;
      direction: string;
    }> = [];

    const graphsToSearch = graphName
      ? [this.graphs.get(graphName)]
      : Array.from(new Set(this.graphs.values()));

    for (const graph of graphsToSearch) {
      if (!graph) continue;
      const visited = new Set<string>();
      const queue: Array<{ id: string; currentDepth: number }> = [{ id: entityId, currentDepth: 0 }];

      while (queue.length > 0) {
        const { id, currentDepth } = queue.shift()!;
        if (currentDepth >= depth || visited.has(id)) continue;
        visited.add(id);

        for (const edge of graph.edges) {
          if (edge.source === id) {
            results.push({
              entity: this.entities.get(edge.target) ?? null,
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
              entity: this.entities.get(edge.source) ?? null,
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

  getEpochEvents(epochId: string): AnyEntity[] {
    return this.events
      .filter((e) => e.epoch === epochId)
      .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  }

  getStats() {
    return {
      events: this.events.length,
      people: this.people.length,
      organizations: this.orgs.length,
      models: this.models.length,
      papers: this.papers.length,
      concepts: this.concepts.length,
      cycles: this.cycles.length,
      epochs: this.epochs.length,
      graphs: this.graphs.size / 2,
      total: this.entities.size,
    };
  }
}

export const data = new RetrospecData();
