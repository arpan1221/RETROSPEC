/**
 * RETROSPEC Semantic Search
 *
 * Uses pre-computed embeddings + Transformers.js to perform
 * vector similarity search over the RETROSPEC knowledge graph.
 *
 * - Entity embeddings are loaded from data/embeddings.json (pre-computed)
 * - Query embeddings are generated on-the-fly using all-MiniLM-L6-v2
 * - The model is loaded once on first query and cached in memory
 */

import fs from "fs";
import path from "path";

// Transformers.js types
type Pipeline = (
  texts: string | string[],
  options?: { pooling?: string; normalize?: boolean }
) => Promise<any>;

interface EmbeddingEntry {
  id: string;
  text: string;
  embedding: number[];
}

interface EmbeddingsData {
  model: string;
  dimension: number;
  count: number;
  generated_at: string;
  entries: EmbeddingEntry[];
}

export interface SemanticSearchResult {
  id: string;
  text: string;
  similarity: number;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export class SemanticSearch {
  private entries: EmbeddingEntry[] = [];
  private extractor: Pipeline | null = null;
  private modelLoading: Promise<Pipeline> | null = null;
  private loaded = false;

  /**
   * Load pre-computed embeddings from data/embeddings.json
   */
  loadEmbeddings(): boolean {
    const embeddingsPath = path.resolve(
      import.meta.dirname,
      "../../data/embeddings.json"
    );

    if (!fs.existsSync(embeddingsPath)) {
      console.error(
        `[semantic-search] Embeddings file not found at ${embeddingsPath}. Run: cd tools/embeddings && npm install && npm run generate`
      );
      return false;
    }

    try {
      const raw = fs.readFileSync(embeddingsPath, "utf-8");
      const data: EmbeddingsData = JSON.parse(raw);
      this.entries = data.entries;
      this.loaded = true;
      console.error(
        `[semantic-search] Loaded ${data.count} embeddings (model: ${data.model}, dim: ${data.dimension})`
      );
      return true;
    } catch (err) {
      console.error("[semantic-search] Failed to load embeddings:", err);
      return false;
    }
  }

  /**
   * Load the embedding model (lazy, on first query).
   * Caches after first load.
   */
  private async getExtractor(): Promise<Pipeline> {
    if (this.extractor) return this.extractor;

    if (this.modelLoading) return this.modelLoading;

    this.modelLoading = (async () => {
      console.error(
        "[semantic-search] Loading embedding model (Xenova/all-MiniLM-L6-v2)..."
      );
      // Dynamic import to handle the ESM module
      const { pipeline } = await import("@xenova/transformers");
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      this.extractor = extractor as Pipeline;
      console.error("[semantic-search] Embedding model loaded");
      return this.extractor;
    })();

    return this.modelLoading;
  }

  /**
   * Generate an embedding for a query string
   */
  async embedQuery(query: string): Promise<number[]> {
    const extractor = await this.getExtractor();
    const output = await extractor(query, {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(output[0].data);
  }

  /**
   * Search by pre-computed query embedding
   */
  searchByEmbedding(
    queryEmbedding: number[],
    limit: number = 10
  ): SemanticSearchResult[] {
    if (!this.loaded || this.entries.length === 0) return [];

    const scored = this.entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      similarity: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, limit);
  }

  /**
   * Full semantic search: embed query + find nearest neighbors
   */
  async search(
    query: string,
    limit: number = 10
  ): Promise<SemanticSearchResult[]> {
    if (!this.loaded) {
      console.error(
        "[semantic-search] Embeddings not loaded, cannot perform semantic search"
      );
      return [];
    }

    const queryEmbedding = await this.embedQuery(query);
    return this.searchByEmbedding(queryEmbedding, limit);
  }

  get isAvailable(): boolean {
    return this.loaded;
  }

  get entryCount(): number {
    return this.entries.length;
  }
}

export const semanticSearch = new SemanticSearch();
