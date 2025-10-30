import { Router } from "express";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import { VoyageAIClient } from "voyageai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Input from "../models/document.js"; // Mongoose model

dotenv.config();

const router = Router();
const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  debug: false,
});

// Config
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "3600", 10); // seconds
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 120 });

const VECTOR_SEARCH_LIMIT = 20; // number of vector results to request from DB
const FINAL_CONTEXT_LIMIT = 4; // how many chunks to include in the LLM prompt
const SIMILARITY_THRESHOLD = 0.7; // minimum vector similarity to consider
const CHUNK_SIZE = 800; // approximate characters/tokens for chunking
const CHUNK_OVERLAP = 120; // overlap characters between chunks

/**
 * Simple sentence-aware chunker.
 * Splits by newline or sentence-ending punctuation without slicing mid-sentence when possible.
 */
function chunkText(
  text,
  { chunkSize = CHUNK_SIZE, chunkOverlap = CHUNK_OVERLAP } = {}
) {
  const sentences = text
    .replace(/\r/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length <= chunkSize) {
      current = (current + " " + sentence).trim();
    } else {
      if (current) chunks.push(current);
      // If sentence itself > chunkSize, we still have to split it
      if (sentence.length > chunkSize) {
        for (let i = 0; i < sentence.length; i += chunkSize - chunkOverlap) {
          const piece = sentence.slice(i, i + chunkSize);
          if (piece.trim()) chunks.push(piece.trim());
        }
        current = "";
      } else {
        current = sentence;
      }
    }
  }
  if (current) chunks.push(current);

  // add metadata-like overlap (append last N chars of prev chunk to next) - already handled by greedy approach
  return chunks.map((c, i) => ({ chunk: c, order: i }));
}

/**
 * Ingest route helper: create embeddings for chunked text and store with metadata
 */
async function embedAndStoreChunks(chunks, metadata = {}) {
  const created = [];
  for (const { chunk, order } of chunks) {
    try {
      const embeddingResponse = await client.embed({
        input: chunk,
        model: "voyage-3-large",
      });
      const embedding = embeddingResponse.data[0].embedding;
      const doc = await Input.create({
        text: chunk,
        embedding,
        metadata: { ...metadata, chunkOrder: order },
        createdAt: new Date(),
      });
      created.push(doc);
    } catch (err) {
      console.error("embedAndStoreChunks error for chuk:", err);
    }
  }
  return created;
}

/**
 * Create query embedding (with caching)
 */
async function getQueryEmbedding(queryText) {
  const cacheKey = `embedding::${queryText}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const resp = await client.embed({
    input: queryText,
    model: "voyage-3-large",
  });
  const embedding = resp.data[0].embedding;
  cache.set(cacheKey, embedding);
  return embedding;
}

/**
 * Perform hybrid search: apply metadata/text pre-filters then vectorSearch
 * Accepts: filters (object), keywords (string array or raw query)
 */
async function hybridSearch({ embeddingVector, filters = {}, keywords = "" }) {
  // Build $match stage from filters and optional keyword-based $text or regex
  const matchStage = {};
  if (filters && Object.keys(filters).length) {
    // copy allowed filters (guarded)
    if (filters.category) matchStage["metadata.category"] = filters.category;
    if (filters.source) matchStage["metadata.source"] = filters.source;
    if (filters.minDate || filters.maxDate) {
      matchStage.createdAt = {};
      if (filters.minDate)
        matchStage.createdAt.$gte = new Date(filters.minDate);
      if (filters.maxDate)
        matchStage.createdAt.$lte = new Date(filters.maxDate);
    }
  }

  // If keywords provided, use case-insensitive regex OR text search if you created a text index
  if (keywords && typeof keywords === "string" && keywords.trim()) {
    // create a regex OR clause for a few words (beware regex injection for untrusted input)
    const terms = keywords
      .split(/\s+/)
      .map((t) => t.replace(/[^a-zA-Z0-9]/g, ""))
      .filter(Boolean)
      .slice(0, 8);
    if (terms.length) {
      const regex = terms.join("|");
      matchStage.$or = [{ text: { $regex: regex, $options: "i" } }];
    }
  }

  const pipeline = [];
  if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

  pipeline.push({
    $vectorSearch: {
      index: "vector_scan",
      path: "embedding",
      queryVector: embeddingVector,
      numCandidates: 200,
      limit: VECTOR_SEARCH_LIMIT,
    },
  });

  pipeline.push(
    {
      $project: {
        text: 1,
        metadata: 1,
        similarityScore: { $meta: "vectorSearchScore" },
        _id: 1,
      },
    },
    { $match: { similarityScore: { $gte: SIMILARITY_THRESHOLD } } },
    { $sort: { similarityScore: -1 } }
  );

  const results = await Input.aggregate(pipeline).allowDiskUse(true);
  return results;
}

/**
 * Optional reranking using Voyage cross-encoder / rerank endpoint if available.
 * Falls back to keeping original order.
 */
async function rerankWithVoyage(queryText, docs) {
  if (!docs || !docs.length) return docs;
  try {
    // If Voyage provides a rerank endpoint similar to client.rerank, use it.
    // We'll attempt a best-effort call and fall back gracefully if not supported.
    if (typeof client.rerank === "function") {
      const rerankResp = await client.rerank({
        query: queryText,
        documents: docs.map((d) => d.text),
        model: "rerank-2",
      });

      // Assume rerankResp.data contains scores in same order
      const scored = rerankResp.data.map((score, i) => ({
        ...docs[i],
        rerankScore: score,
      }));
      scored.sort((a, b) => b.rerankScore - a.rerankScore);
      return scored;
    }
  } catch (err) {
    console.warn(
      "Rerank step failed, continuing with original ordering",
      err?.message || err
    );
  }
  return docs;
}

/**
 * Build a compact context string limited by FINAL_CONTEXT_LIMIT and token/char truncation
 */
function buildPromptContext(docs) {
  const selected = docs.slice(0, FINAL_CONTEXT_LIMIT);
  return selected
    .map(
      (d, i) => `[Source ${i + 1} | ${(d.similarityScore * 100).toFixed(1)}%]
${d.text.trim()}`
    )
    .join("\n\n");
}

/**
 * Optional summarization of long context pieces using Gemini to reduce tokens.
 */
async function summarizeLongContexts(docs, charLimit = 1200) {
  // If chunks are already short, skip
  const toSummarize = docs.map((d) => ({ id: d._id, text: d.text }));
  const summarized = [];
  for (const doc of toSummarize) {
    if (doc.text.length <= charLimit) {
      summarized.push({ ...doc, summary: doc.text });
      continue;
    }
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5" });
      const prompt = `Summarize the following text in 1-2 short paragraphs, keep only facts and key points.\n\nText:\n${doc.text.slice(
        0,
        6000
      )}`;
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      summarized.push({ ...doc, summary: result.response.text().trim() });
    } catch (err) {
      console.warn("Summarization failed, using raw text", err?.message || err);
      summarized.push({ ...doc, summary: doc.text.slice(0, charLimit) });
    }
  }
  return summarized.map((s) => ({ ...s, text: s.summary }));
}

// --------------------- ROUTES ---------------------

// Ingest route: accepts { text, metadata }
router.post("/ingest", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.text) {
      return res
        .status(400)
        .json({ success: false, message: "Missing text in request body" });
    }

    const metadata = payload.metadata || {};

    // Chunk text intelligently
    const chunks = chunkText(payload.text);

    // Store chunks with embeddings
    const created = await embedAndStoreChunks(chunks, metadata);

    return res
      .status(200)
      .json({ success: true, insertedChunks: created.length });
  } catch (err) {
    console.error("/ingest error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

// Query route: accepts { text, filters, keywords }
router.post("/query", async (req, res) => {
  try {
    const queryText = req.body?.text?.trim();
    const filters = req.body?.filters || {};
    const keywords = req.body?.keywords || ""; // lexical boost

    if (!queryText)
      return res
        .status(400)
        .json({ success: false, message: "No query provided" });

    // Check cache for full response
    const cacheKey = `resp::${queryText}::${JSON.stringify(
      filters
    )}::${keywords}`;
    const cachedResp = cache.get(cacheKey);
    if (cachedResp) {
      return res
        .status(200)
        .json({ success: true, ...cachedResp, cached: true });
    }

    // Step 1: get embedding (cached)
    const embeddingVector = await getQueryEmbedding(queryText);

    // Step 2: hybrid search
    let results = await hybridSearch({ embeddingVector, filters, keywords });

    if (!results || !results.length) {
      return res.status(404).json({
        success: true,
        question: queryText,
        message: "No sufficiently similar results found",
        relevantData: [],
      });
    }

    // Step 3: optional reranking (best-effort)
    results = await rerankWithVoyage(queryText, results);

    // Step 4: optionally summarize long contexts to save tokens (best-effort)
    const topResults = results.slice(0, VECTOR_SEARCH_LIMIT);
    const summarized = await summarizeLongContexts(topResults, 1200);

    // Step 5: Build final prompt context (limit number of chunks)
    const context = buildPromptContext(summarized);

    // Safety: if context is empty or too short, return not found
    if (!context || context.trim().length < 10) {
      return res.status(404).json({
        success: true,
        question: queryText,
        message: "No sufficiently informative context found",
        relevantData: [],
      });
    }

    // Step 6: Construct instruction (strict RAG)
    const professionalPrompt = `
SYSTEM INSTRUCTION:
You are an intelligent assistant that answers questions using only the provided context.
You must:
- Answer factually and clearly.
- Use information ONLY from the retrieved context.
- If the context doesn’t provide enough data, say exactly:
  "The available information does not fully answer this query based on the provided sources."
- Do not invent or guess facts.
- Do not use markdown or bullet points.

USER QUESTION:
"${queryText}"

RETRIEVED CONTEXT:
${context}

FINAL ANSWER:
`;

    // Step 7: Call generative model (Gemini)
    let aiAnswer = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: professionalPrompt }] }],
        // optional: temperature, maxOutputTokens etc. can be set via model options if supported
      });
      aiAnswer = result.response.text().trim();
    } catch (err) {
      console.error("LLM generation failed:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate answer" });
    }

    const responsePayload = {
      question: queryText,
      relevantData: summarized
        .slice(0, FINAL_CONTEXT_LIMIT)
        .map((d) => ({ text: d.text, similarityScore: d.similarityScore })),
      answer: aiAnswer,
    };

    // Cache the response for future identical queries
    cache.set(cacheKey, responsePayload);

    return res.status(200).json({ success: true, ...responsePayload });
  } catch (err) {
    console.error("/query error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

export default router;