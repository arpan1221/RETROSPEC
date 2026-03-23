#!/usr/bin/env node

/**
 * RETROSPEC arXiv Auto-Ingest
 *
 * Queries the arXiv API for recent AI/ML papers, filters for high-relevance
 * entries, and generates proposed RETROSPEC paper entries for human review.
 *
 * Usage: node arxiv.js
 * Output: _bmad-output/ingest-proposals/arxiv/proposal_YYYY_short_title.json
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const OUTPUT_DIR = join(REPO_ROOT, "_bmad-output", "ingest-proposals", "arxiv");

// Keywords that signal high relevance to RETROSPEC
const HIGH_RELEVANCE_KEYWORDS = [
  "transformer",
  "language model",
  "large language model",
  "llm",
  "diffusion",
  "reinforcement learning",
  "agent",
  "agentic",
  "attention mechanism",
  "chain of thought",
  "in-context learning",
  "fine-tuning",
  "rlhf",
  "constitutional ai",
  "alignment",
  "scaling law",
  "mixture of experts",
  "multimodal",
  "world model",
  "state space model",
  "mamba",
  "retrieval augmented",
  "rag",
  "benchmark",
  "safety",
  "interpretability",
  "mechanistic interpretability",
  "emergent",
  "reasoning",
  "self-supervised",
  "foundation model",
  "instruction tuning",
  "prompt",
  "vision language",
];

// Known significant organizations
const KNOWN_ORGS = [
  "google",
  "deepmind",
  "openai",
  "anthropic",
  "meta",
  "microsoft",
  "nvidia",
  "stanford",
  "mit",
  "berkeley",
  "carnegie mellon",
  "oxford",
  "cambridge",
  "tsinghua",
  "mistral",
  "cohere",
  "allen institute",
  "hugging face",
  "huggingface",
  "eleuther",
  "stability",
];

/**
 * Determine the RETROSPEC epoch based on the paper date.
 */
function getEpoch(dateStr) {
  const year = parseInt(dateStr.substring(0, 4), 10);
  if (year >= 2024) return "10_agentic_era";
  if (year >= 2022) return "09_generative_explosion";
  if (year >= 2017) return "08_transformer_age";
  if (year >= 2012) return "07_deep_learning_era";
  if (year >= 1993) return "06_quiet_revolution";
  return "05_second_winter";
}

/**
 * Parse Atom XML response from arXiv using regex (no external deps).
 * Returns an array of paper objects.
 */
function parseAtomXML(xml) {
  const entries = [];
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryPattern.exec(xml)) !== null) {
    const block = match[1];

    const getField = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : "";
    };

    const title = getField("title").replace(/\s+/g, " ");
    const summary = getField("summary").replace(/\s+/g, " ");
    const published = getField("published").substring(0, 10); // YYYY-MM-DD

    // Extract arxiv ID from the <id> tag (URL form)
    const idUrl = getField("id");
    const arxivId = idUrl.replace("http://arxiv.org/abs/", "").replace(/v\d+$/, "");

    // Extract authors
    const authors = [];
    const authorPattern = /<author>\s*<name>([^<]+)<\/name>/g;
    let authorMatch;
    while ((authorMatch = authorPattern.exec(block)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    // Extract categories
    const categories = [];
    const catPattern = /term="([^"]+)"/g;
    let catMatch;
    while ((catMatch = catPattern.exec(block)) !== null) {
      categories.push(catMatch[1]);
    }

    // Extract links
    const pdfMatch = block.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);
    const pdfUrl = pdfMatch ? pdfMatch[1] : `https://arxiv.org/pdf/${arxivId}`;

    entries.push({
      title,
      summary,
      published,
      arxivId,
      authors,
      categories,
      pdfUrl,
      absUrl: `https://arxiv.org/abs/${arxivId}`,
    });
  }

  return entries;
}

/**
 * Score a paper's relevance to RETROSPEC (0.0 - 1.0).
 */
function scoreRelevance(paper) {
  const textLower = `${paper.title} ${paper.summary}`.toLowerCase();
  let score = 0;
  let matchedKeywords = [];

  // Keyword hits
  for (const kw of HIGH_RELEVANCE_KEYWORDS) {
    if (textLower.includes(kw)) {
      score += 0.1;
      matchedKeywords.push(kw);
    }
  }

  // Known org bonus
  const authorText = paper.authors.join(" ").toLowerCase();
  const summaryLower = paper.summary.toLowerCase();
  for (const org of KNOWN_ORGS) {
    if (authorText.includes(org) || summaryLower.includes(org)) {
      score += 0.15;
      break;
    }
  }

  // Multiple authors often indicates a larger, more significant effort
  if (paper.authors.length >= 8) score += 0.05;

  // Cap at 1.0
  score = Math.min(1.0, score);
  score = Math.round(score * 100) / 100;

  return { score, matchedKeywords };
}

/**
 * Generate a short slug from a title for use in filenames.
 */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 60)
    .replace(/_+$/, "");
}

/**
 * Estimate significance (1-10) from relevance score.
 */
function estimateSignificance(relevanceScore) {
  if (relevanceScore >= 0.7) return 8;
  if (relevanceScore >= 0.5) return 7;
  if (relevanceScore >= 0.35) return 6;
  if (relevanceScore >= 0.2) return 5;
  return 4;
}

/**
 * Build a RETROSPEC paper proposal from a parsed arXiv entry.
 */
function buildProposal(paper, relevance) {
  const year = paper.published.substring(0, 4);
  const slug = slugify(paper.title);
  const id = `paper_${year}_${slug}`;

  // Generate tags from matched keywords
  const tags = [...new Set(relevance.matchedKeywords.map((kw) => kw.replace(/\s+/g, "_")))];
  if (tags.length === 0) tags.push("ai_research");

  const proposal = {
    id,
    type: "paper",
    title: paper.title,
    authors: paper.authors,
    date: paper.published,
    venue: "arXiv preprint",
    arxiv_id: paper.arxivId,
    url: paper.absUrl,
    citation_count_approx: 0,
    epoch: getEpoch(paper.published),
    significance: estimateSignificance(relevance.score),
    summary: paper.summary,
    key_contributions: [
      `See full paper: ${paper.absUrl}`,
    ],
    preceded_by: [],
    succeeded_by: [],
    related_events: [],
    related_concepts: [],
    impact: "To be determined upon review.",
    query_hooks: [
      `What is ${paper.title}?`,
      `Tell me about ${paper.title}`,
    ],
    _meta: {
      source: "arxiv",
      ingested_at: new Date().toISOString(),
      status: "proposed",
      confidence: relevance.score,
      reason: `Matched keywords: ${relevance.matchedKeywords.join(", ")}. ${paper.authors.length} authors. Categories: ${paper.categories.join(", ")}.`,
    },
  };

  return { proposal, filename: `proposal_${year}_${slug}.json` };
}

/**
 * Main entrypoint.
 */
async function main() {
  console.log("RETROSPEC arXiv Ingest");
  console.log("======================\n");

  const ARXIV_URL =
    "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=20";

  console.log(`Fetching from arXiv API...\n  ${ARXIV_URL}\n`);

  let xml;
  try {
    const response = await fetch(ARXIV_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    xml = await response.text();
  } catch (err) {
    console.error(`Failed to fetch from arXiv: ${err.message}`);
    process.exit(1);
  }

  const papers = parseAtomXML(xml);
  console.log(`Parsed ${papers.length} papers from arXiv.\n`);

  if (papers.length === 0) {
    console.log("No papers found. Exiting.");
    return;
  }

  // Filter by relevance threshold
  const THRESHOLD = 0.2;
  let proposalCount = 0;

  // Ensure output dir exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const paper of papers) {
    const relevance = scoreRelevance(paper);

    if (relevance.score < THRESHOLD) {
      console.log(`  SKIP (${relevance.score.toFixed(2)}): ${paper.title.substring(0, 70)}...`);
      continue;
    }

    const { proposal, filename } = buildProposal(paper, relevance);
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
