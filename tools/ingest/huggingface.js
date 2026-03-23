#!/usr/bin/env node

/**
 * RETROSPEC HuggingFace Auto-Ingest
 *
 * Queries the HuggingFace API for trending/recent models, filters for notable
 * entries, and generates proposed RETROSPEC model entity entries for human review.
 *
 * Usage: node huggingface.js
 * Output: _bmad-output/ingest-proposals/huggingface/proposal_model_name.json
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const OUTPUT_DIR = join(REPO_ROOT, "_bmad-output", "ingest-proposals", "huggingface");

// Known organizations that produce significant models
const NOTABLE_ORGS = [
  "meta-llama",
  "mistralai",
  "google",
  "microsoft",
  "openai",
  "stabilityai",
  "bigscience",
  "EleutherAI",
  "tiiuae",
  "Qwen",
  "deepseek-ai",
  "databricks",
  "NousResearch",
  "01-ai",
  "allenai",
  "CohereForAI",
  "nvidia",
  "apple",
  "amazon",
  "HuggingFaceH4",
  "bigcode",
  "mosaicml",
  "cerebras",
  "xai-org",
];

// Architecture keywords mapped to RETROSPEC architecture labels
const ARCHITECTURE_MAP = {
  llama: "decoder_only_transformer",
  mistral: "decoder_only_transformer",
  gpt: "decoder_only_transformer",
  falcon: "decoder_only_transformer",
  mpt: "decoder_only_transformer",
  phi: "decoder_only_transformer",
  qwen: "decoder_only_transformer",
  gemma: "decoder_only_transformer",
  deepseek: "decoder_only_transformer",
  bert: "encoder_only_transformer",
  roberta: "encoder_only_transformer",
  deberta: "encoder_only_transformer",
  t5: "encoder_decoder_transformer",
  bart: "encoder_decoder_transformer",
  flan: "encoder_decoder_transformer",
  "stable-diffusion": "diffusion_model",
  sdxl: "diffusion_model",
  flux: "diffusion_model",
  whisper: "encoder_decoder_transformer",
  mamba: "state_space_model",
  mixtral: "mixture_of_experts_transformer",
};

/**
 * Detect the architecture from model ID and tags.
 */
function detectArchitecture(modelId, tags) {
  const combined = `${modelId} ${(tags || []).join(" ")}`.toLowerCase();
  for (const [keyword, arch] of Object.entries(ARCHITECTURE_MAP)) {
    if (combined.includes(keyword)) return arch;
  }
  return "unknown";
}

/**
 * Map a HuggingFace org ID to a RETROSPEC org ID.
 */
function mapOrg(author) {
  const mapping = {
    "meta-llama": "org_meta_ai",
    mistralai: "org_mistral",
    google: "org_google_deepmind",
    microsoft: "org_microsoft",
    openai: "org_openai",
    stabilityai: "org_stability_ai",
    EleutherAI: "org_eleutherai",
    "deepseek-ai": "org_deepseek",
    Qwen: "org_alibaba",
    nvidia: "org_nvidia",
    apple: "org_apple",
    "xai-org": "org_xai",
    allenai: "org_allen_institute",
    CohereForAI: "org_cohere",
  };
  return mapping[author] || `org_${author.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

/**
 * Score a model's relevance (0.0 - 1.0).
 */
function scoreRelevance(model) {
  let score = 0;
  let reasons = [];

  // Known org bonus
  const author = model.modelId?.split("/")[0] || "";
  if (NOTABLE_ORGS.includes(author)) {
    score += 0.3;
    reasons.push(`Notable org: ${author}`);
  }

  // Download count tiers
  const downloads = model.downloads || 0;
  if (downloads >= 1000000) {
    score += 0.3;
    reasons.push(`Very high downloads: ${downloads.toLocaleString()}`);
  } else if (downloads >= 100000) {
    score += 0.2;
    reasons.push(`High downloads: ${downloads.toLocaleString()}`);
  } else if (downloads >= 10000) {
    score += 0.1;
    reasons.push(`Moderate downloads: ${downloads.toLocaleString()}`);
  }

  // Likes count
  const likes = model.likes || 0;
  if (likes >= 1000) {
    score += 0.2;
    reasons.push(`Very high likes: ${likes}`);
  } else if (likes >= 100) {
    score += 0.1;
    reasons.push(`High likes: ${likes}`);
  }

  // Trending bonus (it's in the trending list)
  score += 0.1;
  reasons.push("Trending on HuggingFace");

  score = Math.min(1.0, Math.round(score * 100) / 100);
  return { score, reasons };
}

/**
 * Generate a clean slug from a model ID.
 */
function slugify(modelId) {
  return modelId
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 60);
}

/**
 * Estimate significance (1-10) from relevance score.
 */
function estimateSignificance(score) {
  if (score >= 0.8) return 9;
  if (score >= 0.6) return 8;
  if (score >= 0.4) return 7;
  if (score >= 0.25) return 6;
  return 5;
}

/**
 * Determine the RETROSPEC epoch based on the model creation date.
 */
function getEpoch(dateStr) {
  if (!dateStr) return "10_agentic_era";
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (year >= 2024) return "10_agentic_era";
  if (year >= 2022) return "09_generative_explosion";
  if (year >= 2017) return "08_transformer_age";
  return "07_deep_learning_era";
}

/**
 * Build a RETROSPEC model entity proposal.
 */
function buildProposal(model, relevance) {
  const author = model.modelId?.split("/")[0] || "unknown";
  const modelName = model.modelId?.split("/")[1] || model.modelId;
  const slug = slugify(model.modelId);
  const id = `model_${slugify(modelName)}`;

  const releaseDate = model.createdAt
    ? model.createdAt.substring(0, 10)
    : model.lastModified
      ? model.lastModified.substring(0, 10)
      : new Date().toISOString().substring(0, 10);

  const tags = model.tags || [];
  const architecture = detectArchitecture(model.modelId, tags);

  const proposal = {
    id,
    type: "model",
    name: modelName,
    organization: mapOrg(author),
    release_date: releaseDate,
    architecture,
    parameter_count: "unknown",
    training_approach: "unknown",
    parent_models: [],
    child_models: [],
    key_innovations: [],
    benchmark_highlights: {},
    lineage_path: "",
    significance: estimateSignificance(relevance.score),
    cultural_impact: "",
    _meta: {
      source: "huggingface",
      ingested_at: new Date().toISOString(),
      status: "proposed",
      confidence: relevance.score,
      reason: relevance.reasons.join(". ") + ".",
      huggingface_id: model.modelId,
      huggingface_url: `https://huggingface.co/${model.modelId}`,
      downloads: model.downloads || 0,
      likes: model.likes || 0,
      tags: tags.slice(0, 20),
    },
  };

  return { proposal, filename: `proposal_${slug}.json` };
}

/**
 * Main entrypoint.
 */
async function main() {
  console.log("RETROSPEC HuggingFace Ingest");
  console.log("============================\n");

  const HF_URL = "https://huggingface.co/api/models?sort=likes&direction=-1&limit=20&filter=text-generation";

  console.log(`Fetching from HuggingFace API...\n  ${HF_URL}\n`);

  let models;
  try {
    const response = await fetch(HF_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    models = await response.json();
  } catch (err) {
    console.error(`Failed to fetch from HuggingFace: ${err.message}`);
    process.exit(1);
  }

  console.log(`Fetched ${models.length} trending models.\n`);

  if (!Array.isArray(models) || models.length === 0) {
    console.log("No models found. Exiting.");
    return;
  }

  // Filter by relevance threshold
  const THRESHOLD = 0.2;
  let proposalCount = 0;

  // Ensure output dir exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const model of models) {
    const relevance = scoreRelevance(model);

    if (relevance.score < THRESHOLD) {
      const name = model.modelId || "unknown";
      console.log(`  SKIP (${relevance.score.toFixed(2)}): ${name}`);
      continue;
    }

    const { proposal, filename } = buildProposal(model, relevance);
    const outPath = join(OUTPUT_DIR, filename);

    writeFileSync(outPath, JSON.stringify(proposal, null, 2) + "\n");
    proposalCount++;
    console.log(`  SAVE (${relevance.score.toFixed(2)}): ${filename}`);
  }

  console.log(`\nDone. ${proposalCount} proposals saved to:`);
  console.log(`  ${OUTPUT_DIR}\n`);
  console.log("Run 'node review.js' to review and accept/reject proposals.");
}

main();
