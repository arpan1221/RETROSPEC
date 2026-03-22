---
title: 'RETROSPEC MCP Server'
slug: 'retrospec-mcp-server'
created: '2026-03-22'
status: 'in-progress'
stepsCompleted: [1, 2, 3]
tech_stack: ['typescript', '@modelcontextprotocol/sdk', 'fuse.js', 'node.js']
files_to_create:
  - 'mcp/package.json'
  - 'mcp/tsconfig.json'
  - 'mcp/src/index.ts'
  - 'mcp/src/data.ts'
  - 'mcp/src/tools.ts'
  - 'mcp/src/types.ts'
  - '.mcp.json'
code_patterns: ['mcp-server', 'stdio-transport', 'tool-definitions']
test_patterns: []
---

# Tech-Spec: RETROSPEC MCP Server

**Created:** 2026-03-22

## Overview

### Problem Statement

RETROSPEC's 170+ entries are only accessible by cloning the repo or visiting the web app. AI agents need a standardized way to query the knowledge graph mid-task via the Model Context Protocol.

### Solution

A TypeScript MCP server exposing 5 tools that any MCP-compatible client (Claude Desktop, Claude Code, Cursor, etc.) can call. Uses stdio transport, reads from the RETROSPEC JSON files. Installable locally via npm.

### Scope

**In Scope:**
- 5 MCP tools: lookup, trace_lineage, search, traverse_graph, epoch_events
- TypeScript MCP server using `@modelcontextprotocol/sdk`
- Stdio transport
- Data loading from RETROSPEC JSON files
- `.mcp.json` config for Claude Code integration
- README with setup instructions

**Out of Scope:**
- HTTP/SSE transport, write operations, authentication, embeddings search, npm registry publishing

## Context for Development

### Confirmed Clean Slate
No existing MCP server. The `mcp/` directory will be new. Data loading logic mirrors `web/lib/data.ts`.

### MCP Server Pattern
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({ name: "retrospec", version: "0.1.0" });

server.tool("tool_name", "description", { param: z.string() }, async (args) => {
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Architecture

```
mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        — Server entry point, tool registration
│   ├── data.ts         — JSON file loading (mirrors web/lib/data.ts)
│   ├── tools.ts        — Tool implementations (5 tools)
│   └── types.ts        — Shared types (copy from web/lib/types.ts)
```

## Implementation Plan

### Tasks

- [ ] **Task 1: Project scaffolding**
  - File: `mcp/package.json` — deps: `@modelcontextprotocol/sdk`, `fuse.js`, `zod`. Scripts: `build`, `start`
  - File: `mcp/tsconfig.json` — target ES2022, module NodeNext, outDir dist
  - File: `mcp/src/types.ts` — Copy essential types from web/lib/types.ts

- [ ] **Task 2: Data loading layer**
  - File: `mcp/src/data.ts`
  - Reads all JSON from parent directory (events/, entities/, papers/, concepts/, cycles/, epochs/, graphs/)
  - Builds in-memory index: Map<string, AnyEntity> for O(1) lookup by ID
  - Builds Fuse.js search index on names/titles/summaries
  - Caches on first load (server stays running)

- [ ] **Task 3: Implement 5 MCP tools**
  - File: `mcp/src/tools.ts`

  **Tool 1: retrospec_lookup**
  - Input: `{ id: string }` — entity ID (e.g., "evt_2017_attention_is_all_you_need")
  - Output: Full JSON entry
  - Handles: not found → error message

  **Tool 2: retrospec_trace_lineage**
  - Input: `{ model_id: string }` — model entity ID
  - Output: Complete lineage chain from the model back to its earliest ancestor, following parent_models recursively. Returns array of models with their key innovations.
  - Handles: non-model entity → error, no parent → returns single entry

  **Tool 3: retrospec_search**
  - Input: `{ query: string, limit?: number }` — fuzzy text search
  - Output: Top N matching entities (default 10) with id, name/title, type, significance, summary snippet
  - Uses Fuse.js with threshold 0.3

  **Tool 4: retrospec_traverse_graph**
  - Input: `{ entity_id: string, graph?: string, depth?: number }`
  - graph: "influence" | "architecture" | "organization" | "concept" (default: all)
  - depth: how many hops (default 1)
  - Output: All connected entities at specified depth with relationship types and weights

  **Tool 5: retrospec_epoch_events**
  - Input: `{ epoch: string }` — epoch ID (e.g., "08_transformer_age")
  - Output: All events in that epoch, sorted by date, with summaries

- [ ] **Task 4: Server entry point**
  - File: `mcp/src/index.ts`
  - Creates McpServer with name "retrospec", version "0.1.0"
  - Registers all 5 tools from tools.ts
  - Connects via StdioServerTransport
  - Loads data on startup

- [ ] **Task 5: Integration config**
  - File: `.mcp.json` at project root for Claude Code:
  ```json
  {
    "mcpServers": {
      "retrospec": {
        "command": "node",
        "args": ["mcp/dist/index.js"],
        "env": {}
      }
    }
  }
  ```
  - Update README to document MCP setup

## Acceptance Criteria

- [ ] AC1: Given Claude Code has RETROSPEC MCP configured, when a user asks "look up the transformer paper", then the agent calls retrospec_search and returns the entry
- [ ] AC2: Given retrospec_lookup is called with "model_gpt_series", then the full GPT series entry is returned
- [ ] AC3: Given retrospec_trace_lineage is called with "model_gpt_series", then the chain GPT → Transformer → RNN → Perceptron is returned
- [ ] AC4: Given retrospec_search is called with "attention mechanism", then concept_attention_mechanism and related entries appear in results
- [ ] AC5: Given retrospec_traverse_graph is called with "person_hinton_geoffrey" on the influence graph, then LeCun, Bengio, Sutskever, Krizhevsky appear as connected
- [ ] AC6: Given retrospec_epoch_events is called with "09_generative_explosion", then ChatGPT launch, GPT-4, EU AI Act events are returned sorted by date
- [ ] AC7: Given the MCP server is running, when `npx @anthropic-ai/mcp-inspector` connects, then all 5 tools are listed and callable
- [ ] AC8: Given `.mcp.json` exists at project root, when Claude Code opens the project, then the RETROSPEC MCP server is available

## Dependencies

| Package | Purpose |
|---|---|
| @modelcontextprotocol/sdk | MCP server framework |
| fuse.js | Fuzzy search |
| zod | Input validation for tool params |
| typescript | Build |

## Notes

- Data loads once on server startup and stays cached in memory
- Stdio transport means one server per client session (standard MCP pattern)
- Future: add HTTP transport for remote deployment, embeddings for semantic search
