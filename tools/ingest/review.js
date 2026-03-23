#!/usr/bin/env node

/**
 * RETROSPEC Proposal Review
 *
 * Interactive CLI tool that lists all ingest proposals and allows a human
 * reviewer to accept (move to the correct RETROSPEC directory), reject
 * (delete), or skip each one.
 *
 * Usage: node review.js
 */

import { readFileSync, writeFileSync, unlinkSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const PROPOSALS_DIR = join(REPO_ROOT, "_bmad-output", "ingest-proposals");

/**
 * Recursively collect all .json files from a directory.
 */
function collectProposals(dir) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectProposals(fullPath));
    } else if (entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Determine the target directory for an accepted proposal.
 */
function getTargetPath(proposal) {
  if (proposal.type === "paper") {
    const filename = `${proposal.id.replace(/^paper_/, "")}.json`;
    return join(REPO_ROOT, "papers", filename);
  }
  if (proposal.type === "model") {
    const filename = `${proposal.id.replace(/^model_/, "")}.json`;
    return join(REPO_ROOT, "entities", "models", filename);
  }
  if (proposal.type === "event") {
    const filename = `${proposal.id.replace(/^evt_/, "")}.json`;
    return join(REPO_ROOT, "events", filename);
  }
  return null;
}

/**
 * Remove the _meta field from a proposal for final storage.
 */
function stripMeta(proposal) {
  const clean = { ...proposal };
  delete clean._meta;
  return clean;
}

/**
 * Ask a question via readline and return the answer.
 */
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim().toLowerCase()));
  });
}

/**
 * Main entrypoint.
 */
async function main() {
  console.log("RETROSPEC Proposal Review");
  console.log("=========================\n");

  const proposalFiles = collectProposals(PROPOSALS_DIR);

  if (proposalFiles.length === 0) {
    console.log("No proposals found. Run the ingest scripts first:");
    console.log("  node arxiv.js");
    console.log("  node huggingface.js");
    return;
  }

  console.log(`Found ${proposalFiles.length} proposal(s) to review.\n`);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let accepted = 0;
  let rejected = 0;
  let skipped = 0;

  for (let i = 0; i < proposalFiles.length; i++) {
    const filePath = proposalFiles[i];
    let proposal;
    try {
      proposal = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.log(`  ERROR: Could not parse ${filePath}: ${err.message}`);
      continue;
    }

    const meta = proposal._meta || {};
    const relativePath = filePath.replace(REPO_ROOT + "/", "");

    console.log("─".repeat(70));
    console.log(`Proposal ${i + 1}/${proposalFiles.length}`);
    console.log(`  File:       ${relativePath}`);
    console.log(`  Source:     ${meta.source || "unknown"}`);
    console.log(`  Type:       ${proposal.type || "unknown"}`);
    console.log(`  ID:         ${proposal.id || "unknown"}`);
    console.log(`  Title/Name: ${proposal.title || proposal.name || "unknown"}`);
    console.log(`  Confidence: ${meta.confidence ?? "N/A"}`);
    console.log(`  Reason:     ${meta.reason || "N/A"}`);

    if (proposal.type === "paper") {
      console.log(`  arXiv:      ${proposal.arxiv_id || "N/A"}`);
      console.log(`  Date:       ${proposal.date || "N/A"}`);
      console.log(`  Authors:    ${(proposal.authors || []).slice(0, 5).join(", ")}${(proposal.authors || []).length > 5 ? "..." : ""}`);
    } else if (proposal.type === "model") {
      console.log(`  Org:        ${proposal.organization || "N/A"}`);
      console.log(`  Arch:       ${proposal.architecture || "N/A"}`);
      if (meta.downloads) console.log(`  Downloads:  ${meta.downloads.toLocaleString()}`);
      if (meta.likes) console.log(`  Likes:      ${meta.likes.toLocaleString()}`);
      if (meta.huggingface_url) console.log(`  HF URL:     ${meta.huggingface_url}`);
    }

    const targetPath = getTargetPath(proposal);
    if (targetPath) {
      console.log(`  Target:     ${targetPath.replace(REPO_ROOT + "/", "")}`);
    }

    console.log();

    const answer = await ask(rl, "  [a]ccept / [r]eject / [s]kip ? ");

    if (answer === "a" || answer === "accept") {
      if (!targetPath) {
        console.log("  Cannot determine target path. Skipping.\n");
        skipped++;
        continue;
      }

      // Ensure target directory exists
      const targetDir = dirname(targetPath);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Write cleaned proposal to target
      const clean = stripMeta(proposal);
      writeFileSync(targetPath, JSON.stringify(clean, null, 2) + "\n");

      // Remove the proposal file
      unlinkSync(filePath);

      console.log(`  ACCEPTED -> ${targetPath.replace(REPO_ROOT + "/", "")}\n`);
      accepted++;
    } else if (answer === "r" || answer === "reject") {
      unlinkSync(filePath);
      console.log("  REJECTED (deleted)\n");
      rejected++;
    } else {
      console.log("  SKIPPED\n");
      skipped++;
    }
  }

  rl.close();

  console.log("─".repeat(70));
  console.log(`\nReview complete.`);
  console.log(`  Accepted: ${accepted}`);
  console.log(`  Rejected: ${rejected}`);
  console.log(`  Skipped:  ${skipped}`);
}

main();
