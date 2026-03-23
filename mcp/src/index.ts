#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { data } from "./data.js";
import { semanticSearch } from "./search.js";

// Load all RETROSPEC data into memory
data.load();

// Load pre-computed embeddings for semantic search (non-blocking if file missing)
semanticSearch.loadEmbeddings();

const server = new McpServer({
  name: "retrospec",
  version: "0.1.0",
});

// Tool 1: Look up any entity by ID
server.tool(
  "retrospec_lookup",
  "Look up a RETROSPEC entity by its ID. Returns the full JSON entry for any event, person, organization, model, paper, concept, cycle, or epoch.",
  {
    id: z.string().describe("Entity ID (e.g., 'evt_2017_attention_is_all_you_need', 'person_turing_alan', 'model_gpt_series')"),
  },
  async ({ id }) => {
    const entity = data.lookup(id);
    if (!entity) {
      return {
        content: [{ type: "text", text: `Entity not found: ${id}. Try retrospec_search to find the right ID.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(entity, null, 2) }],
    };
  }
);

// Tool 2: Trace a model's complete lineage back to its earliest ancestor
server.tool(
  "retrospec_trace_lineage",
  "Trace the complete architectural lineage of an AI model back to its earliest ancestor. Follows parent_models chains recursively. Returns the chain of models with their key innovations.",
  {
    model_id: z.string().describe("Model entity ID (e.g., 'model_gpt_series', 'model_bert', 'model_alexnet')"),
  },
  async ({ model_id }) => {
    const chain = data.traceLineage(model_id);
    if (chain.length === 0) {
      return {
        content: [{ type: "text", text: `Model not found: ${model_id}. Use retrospec_search to find model IDs.` }],
      };
    }
    const summary = chain.map((m, i) => ({
      position: i,
      id: m.id,
      name: m.name,
      year: m.release_date ?? m.year,
      key_innovations: m.key_innovations ?? [],
      lineage_path: m.lineage_path ?? null,
    }));
    return {
      content: [
        {
          type: "text",
          text: `Lineage chain (${chain.length} models, newest to oldest):\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    };
  }
);

// Tool 3: Fuzzy search across all entities
server.tool(
  "retrospec_search",
  "Search RETROSPEC's knowledge graph by text. Fuzzy-matches against entity names, titles, summaries, and IDs. Returns the top matching entries.",
  {
    query: z.string().describe("Search query (e.g., 'attention mechanism', 'AI winter', 'Geoffrey Hinton')"),
    limit: z.number().optional().default(10).describe("Maximum results to return (default 10)"),
  },
  async ({ query, limit }) => {
    const results = data.search(query, limit);
    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `No results found for: "${query}"` }],
      };
    }
    const formatted = results.map((r) => ({
      id: r.entity.id,
      type: r.entity.type,
      name: r.entity.name ?? r.entity.title,
      significance: r.entity.significance,
      match_score: Math.round((1 - r.score) * 100) + "%",
      summary: (r.entity.summary ?? "").slice(0, 200) + "...",
    }));
    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} results for "${query}":\n\n${JSON.stringify(formatted, null, 2)}`,
        },
      ],
    };
  }
);

// Tool 4: Traverse the knowledge graph from a starting entity
server.tool(
  "retrospec_traverse_graph",
  "Traverse RETROSPEC's knowledge graphs from a starting entity. Follow influence, architecture, organization, or concept relationships to find connected entities.",
  {
    entity_id: z.string().describe("Starting entity ID"),
    graph: z
      .enum(["influence", "architecture", "organization", "concept"])
      .optional()
      .describe("Which graph to traverse (default: all graphs)"),
    depth: z.number().optional().default(1).describe("How many hops to follow (default 1)"),
  },
  async ({ entity_id, graph, depth }) => {
    const graphName = graph ? `graph_${graph}` : undefined;
    const connections = data.traverseGraph(entity_id, graphName, depth);
    if (connections.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No connections found for ${entity_id}${graph ? ` in ${graph} graph` : ""}. The entity may not appear in the requested graph.`,
          },
        ],
      };
    }
    const formatted = connections.map((c) => ({
      id: c.entity?.id ?? "unknown",
      name: c.entity?.name ?? c.entity?.title ?? "unknown",
      type: c.entity?.type,
      relationship: c.relationship,
      direction: c.direction,
      weight: c.weight,
    }));
    return {
      content: [
        {
          type: "text",
          text: `Found ${connections.length} connections from ${entity_id}${graph ? ` in ${graph} graph` : ""}:\n\n${JSON.stringify(formatted, null, 2)}`,
        },
      ],
    };
  }
);

// Tool 5: Get all events in an epoch
server.tool(
  "retrospec_epoch_events",
  "Get all events documented in a specific epoch of AI history, sorted chronologically. Epochs span from 00_philosophical_roots (1300s) to 10_agentic_era (2024+).",
  {
    epoch: z.string().describe(
      "Epoch ID: 00_philosophical_roots, 01_dawn, 02_golden_age, 03_first_winter, 04_expert_systems_boom, 05_second_winter, 06_quiet_revolution, 07_deep_learning_era, 08_transformer_age, 09_generative_explosion, 10_agentic_era"
    ),
  },
  async ({ epoch }) => {
    const events = data.getEpochEvents(epoch);
    if (events.length === 0) {
      return {
        content: [{ type: "text", text: `No events found for epoch: ${epoch}. Valid epochs: 00_philosophical_roots through 10_agentic_era.` }],
      };
    }
    const formatted = events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      significance: e.significance,
      summary: (e.summary ?? "").slice(0, 150) + "...",
    }));
    return {
      content: [
        {
          type: "text",
          text: `${events.length} events in ${epoch}:\n\n${JSON.stringify(formatted, null, 2)}`,
        },
      ],
    };
  }
);

// Tool 6: Semantic search using vector embeddings
server.tool(
  "retrospec_semantic_search",
  "Search RETROSPEC using semantic similarity (vector embeddings). More powerful than fuzzy text search — understands meaning, synonyms, and conceptual relationships. Requires pre-computed embeddings (run: cd tools/embeddings && npm install && npm run generate).",
  {
    query: z.string().describe("Natural language query (e.g., 'What caused AI funding to collapse?', 'neural network architectures for language')"),
    limit: z.number().optional().default(10).describe("Maximum results to return (default 10)"),
  },
  async ({ query, limit }) => {
    if (!semanticSearch.isAvailable) {
      return {
        content: [
          {
            type: "text",
            text: "Semantic search unavailable: embeddings not loaded. Generate them with: cd tools/embeddings && npm install && npm run generate",
          },
        ],
      };
    }

    try {
      const results = await semanticSearch.search(query, limit);
      if (results.length === 0) {
        return {
          content: [{ type: "text", text: `No semantic results for: "${query}"` }],
        };
      }

      // Resolve full entities for top results
      const formatted = results.map((r) => {
        const entity = data.lookup(r.id);
        return {
          id: r.id,
          type: entity?.type ?? "unknown",
          name: (entity as any)?.name ?? (entity as any)?.title ?? r.id,
          significance: (entity as any)?.significance,
          similarity: Math.round(r.similarity * 1000) / 1000,
          summary: ((entity as any)?.summary ?? r.text).slice(0, 200) + "...",
        };
      });

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} semantic matches for "${query}":\n\n${JSON.stringify(formatted, null, 2)}`,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Semantic search error: ${err.message}. The embedding model may still be loading (first query takes a few seconds).`,
          },
        ],
      };
    }
  }
);

// Connect via stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[retrospec] MCP server running on stdio");
}

main().catch((err) => {
  console.error("[retrospec] Fatal error:", err);
  process.exit(1);
});
