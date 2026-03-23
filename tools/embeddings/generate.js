#!/usr/bin/env node

/**
 * RETROSPEC Embedding Generator
 *
 * Scans all RETROSPEC JSON entities and generates 384-dim embeddings
 * using all-MiniLM-L6-v2 via Transformers.js (local, no API key needed).
 *
 * Usage: cd tools/embeddings && npm install && npm run generate
 * Output: ../../data/embeddings.json
 */

import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUTPUT = path.join(ROOT, "data", "embeddings.json");

// ── Helpers ──────────────────────────────────────────────────────────────────

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function readJsonDir(dir) {
  const fullPath = path.resolve(ROOT, dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJsonFile(path.join(fullPath, f)))
    .filter(Boolean);
}

function loadEpochs() {
  const epochsDir = path.join(ROOT, "epochs");
  if (!fs.existsSync(epochsDir)) return [];
  return fs
    .readdirSync(epochsDir)
    .filter((d) => {
      const epochFile = path.join(epochsDir, d, "epoch.json");
      return fs.existsSync(epochFile);
    })
    .map((d) => readJsonFile(path.join(epochsDir, d, "epoch.json")))
    .filter(Boolean);
}

/**
 * Build a searchable text string from an entity by combining
 * whichever fields are available.
 */
function entityToText(entity) {
  const parts = [];

  // Identity
  if (entity.id) parts.push(entity.id.replace(/_/g, " "));
  if (entity.name) parts.push(entity.name);
  if (entity.title) parts.push(entity.title);
  if (entity.type) parts.push(`type: ${entity.type}`);

  // Descriptive text
  if (entity.summary) parts.push(entity.summary);
  if (entity.impact_description) parts.push(entity.impact_description);
  if (entity.impact) parts.push(entity.impact);
  if (entity.cultural_impact) parts.push(entity.cultural_impact);
  if (entity.counterfactual) parts.push(entity.counterfactual);

  // Structured fields
  if (entity.key_contributions) parts.push(entity.key_contributions.join(", "));
  if (entity.key_innovations) parts.push(entity.key_innovations.join(", "));
  if (entity.defining_characteristics) parts.push(entity.defining_characteristics.join(", "));
  if (entity.tags) parts.push(entity.tags.join(", "));
  if (entity.query_hooks) parts.push(entity.query_hooks.join(". "));
  if (entity.lessons_learned) parts.push(entity.lessons_learned.join(". "));
  if (entity.trigger_signals) parts.push(entity.trigger_signals.join(", "));

  // Affiliations / relationships
  if (entity.affiliations) parts.push(entity.affiliations.join(", "));
  if (entity.architecture) parts.push(entity.architecture);
  if (entity.training_approach) parts.push(entity.training_approach);
  if (entity.lineage_path) parts.push(entity.lineage_path);

  // Authors for papers
  if (entity.authors) parts.push(entity.authors.join(", "));

  return parts.join(". ").slice(0, 2000); // Cap at 2000 chars for model input
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[embeddings] Loading RETROSPEC entities...");

  const allEntities = [
    ...readJsonDir("events"),
    ...readJsonDir("entities/people"),
    ...readJsonDir("entities/organizations"),
    ...readJsonDir("entities/models"),
    ...readJsonDir("papers"),
    ...readJsonDir("concepts"),
    ...readJsonDir("cycles"),
    ...loadEpochs(),
  ];

  console.log(`[embeddings] Found ${allEntities.length} entities`);

  if (allEntities.length === 0) {
    console.error("[embeddings] ERROR: No entities found. Check that RETROSPEC data directories exist.");
    process.exit(1);
  }

  // Prepare text for each entity
  const entries = allEntities
    .filter((e) => e.id)
    .map((e) => ({
      id: e.id,
      text: entityToText(e),
    }));

  console.log(`[embeddings] Loading embedding model (Xenova/all-MiniLM-L6-v2)...`);
  console.log(`[embeddings] First run downloads ~30MB model (cached in ~/.cache/huggingface after)`);

  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  console.log(`[embeddings] Model loaded. Generating embeddings for ${entries.length} entities...`);

  const BATCH_SIZE = 16;
  const results = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const texts = batch.map((e) => e.text);

    const output = await extractor(texts, { pooling: "mean", normalize: true });

    for (let j = 0; j < batch.length; j++) {
      const embedding = Array.from(output[j].data);
      results.push({
        id: batch[j].id,
        text: batch[j].text,
        embedding,
      });
    }

    const done = Math.min(i + BATCH_SIZE, entries.length);
    console.log(`[embeddings] ${done}/${entries.length} entities embedded`);
  }

  // Write output
  const outputData = {
    model: "all-MiniLM-L6-v2",
    dimension: 384,
    count: results.length,
    generated_at: new Date().toISOString(),
    entries: results,
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(outputData, null, 2));

  const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
  console.log(`[embeddings] Done! Wrote ${results.length} embeddings to ${OUTPUT} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error("[embeddings] Fatal error:", err);
  process.exit(1);
});
