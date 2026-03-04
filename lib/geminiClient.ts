import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "./types";

// ─── Prompts ────────────────────────────────────────────────────────────────

const CHUNK_SYSTEM_PROMPT = `You are a legal document simplifier. Analyze the provided portion of a Terms of Service or Privacy Policy and return a JSON object with this exact structure:

{
  "tldr": "2-3 sentence plain English summary of THIS portion only",
  "redFlags": ["list of serious concerns found in this portion"],
  "sections": [
    {
      "title": "Section name",
      "severity": "safe" | "warning" | "danger",
      "summary": "Plain English explanation",
      "details": "More detail if needed"
    }
  ]
}

Categories to cover where present: Data Collection, Your Rights, Auto-Renewals & Billing, Third-Party Sharing, Account Termination, Legal & Arbitration.
Be direct and use plain language a 16-year-old would understand.
Return ONLY the raw JSON object — no markdown fences, no explanation, no extra text.`;

const SYNTHESIS_SYSTEM_PROMPT = `You are a legal document analysis combiner. You will receive multiple partial analyses (JSON) of different sections of the same legal document. Combine them into a single comprehensive analysis:

- Merge sections that cover the same topic (keep the most detailed / highest severity version)
- Deduplicate red flags (remove near-identical entries)
- Write a fresh 2-3 sentence tldr that covers the WHOLE document
- Return the same JSON structure

Return ONLY the raw JSON object — no markdown fences, no explanation, no extra text.

JSON structure:
{
  "tldr": "...",
  "redFlags": ["..."],
  "sections": [{ "title": "...", "severity": "safe"|"warning"|"danger", "summary": "...", "details": "..." }]
}`;

// ─── Config ──────────────────────────────────────────────────────────────────

// Each model has its own separate free-tier daily/minute quota.
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const CHUNK_SIZE = 20_000;  // chars per chunk — Gemini 2.5 Flash handles this easily
const MAX_CHUNKS = 6;       // safety cap — ~120k chars max total

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return (
    msg.includes("429") ||
    /resource.?exhausted|quota.?exceeded|rate.?limit/i.test(msg)
  );
}

function extractJson(raw: string): string {
  let s = raw.trim();
  // Strip opening fence line (```json or ```)
  if (s.startsWith("`")) {
    const newline = s.indexOf("\n");
    s = newline !== -1 ? s.slice(newline + 1).trim() : s;
  }
  // Strip closing fence
  const closingFence = s.lastIndexOf("```");
  if (closingFence !== -1) s = s.slice(0, closingFence).trim();
  // Extract outermost { ... }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return s.slice(start, end + 1);
  return s;
}

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length && chunks.length < MAX_CHUNKS; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

// ─── Core API call (with model fallback) ────────────────────────────────────

async function callGemini(
  ai: GoogleGenAI,
  contents: string,
  systemInstruction: string,
): Promise<string> {
  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction, maxOutputTokens: 8192 },
      });
      const text = response.text?.trim() ?? "";
      if (!text) throw new Error("Empty response from AI. Please try again.");
      console.log(`[gemini] Model: ${model} | Response length: ${text.length}`);
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isRateLimitError(err)) {
        console.warn(`[gemini] ${model} rate-limited, trying next. Error:`, msg.slice(0, 150));
        continue;
      }
      console.error(`[gemini] Error on ${model}:`, msg.slice(0, 300));
      throw err;
    }
  }

  console.error("[gemini] All models rate-limited.");
  throw new Error("RATE_LIMIT");
}

// ─── Parse helper ────────────────────────────────────────────────────────────

function parseAnalysisResult(raw: string): AnalysisResult {
  const json = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    // Fallback: replace literal newlines (unescaped inside string values) with a space.
    // This is harmless for JSON structure since whitespace between tokens is ignored,
    // and fixes the most common cause of LLM-produced invalid JSON.
    const repaired = json.replace(/[\r\n]+/g, " ");
    parsed = JSON.parse(repaired);
  }

  const result = parsed as AnalysisResult;
  if (!result.tldr || !Array.isArray(result.sections)) {
    throw new Error("Invalid response structure from AI");
  }
  return result;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function analyzeDocument(
  text: string,
  apiKey?: string,
): Promise<AnalysisResult> {
  const key = apiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "No Gemini API key found. Set one via the API Key button in the top bar, or add GEMINI_API_KEY to your .env.local file.",
    );
  }
  const ai = new GoogleGenAI({ apiKey: key });

  const chunks = splitIntoChunks(text);
  console.log(`[gemini] Document: ${text.length} chars → ${chunks.length} chunk(s) of ~${CHUNK_SIZE} chars`);

  // ── Single chunk: one API call ───────────────────────────────────────────
  if (chunks.length === 1) {
    console.log("[gemini] Single-chunk analysis");
    const raw = await callGemini(ai, chunks[0], CHUNK_SYSTEM_PROMPT);
    try {
      return parseAnalysisResult(raw);
    } catch {
      console.error("[gemini] Parse failed. Raw:\n", raw.slice(0, 500));
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }

  // ── Multiple chunks: analyze ALL in parallel, then synthesize ────────────
  console.log(`[gemini] Multi-chunk analysis: ${chunks.length} chunks (parallel)`);

  const settled = await Promise.allSettled(
    chunks.map(async (chunk, i) => {
      const contents = `[PART ${i + 1} OF ${chunks.length}]\n\n${chunk}`;
      console.log(`[gemini] Starting chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
      const raw = await callGemini(ai, contents, CHUNK_SYSTEM_PROMPT);
      return parseAnalysisResult(raw);
    }),
  );

  // If any chunk hit a rate limit, propagate it immediately
  const rateLimited = settled.find(
    (r) => r.status === "rejected" && r.reason instanceof Error && r.reason.message === "RATE_LIMIT",
  );
  if (rateLimited) throw new Error("RATE_LIMIT");

  const partials: AnalysisResult[] = settled
    .filter((r): r is PromiseFulfilledResult<AnalysisResult> => r.status === "fulfilled")
    .map((r) => r.value);

  settled
    .filter((r) => r.status === "rejected")
    .forEach((r, i) => {
      console.warn(`[gemini] Chunk ${i + 1} failed, skipping:`, (r as PromiseRejectedResult).reason?.message);
    });

  if (partials.length === 0) {
    throw new Error("Failed to parse AI response. Please try again.");
  }

  if (partials.length === 1) return partials[0];

  // ── Synthesis call ───────────────────────────────────────────────────────
  console.log(`[gemini] Synthesizing ${partials.length} partial results`);
  // Use compact JSON (not pretty-printed) to minimise input tokens
  const synthesisInput = partials
    .map((p, i) => `PART ${i + 1} ANALYSIS:\n${JSON.stringify(p)}`)
    .join("\n\n---\n\n");

  try {
    const raw = await callGemini(ai, synthesisInput, SYNTHESIS_SYSTEM_PROMPT);
    return parseAnalysisResult(raw);
  } catch (err) {
    if (err instanceof Error && err.message === "RATE_LIMIT") throw err;
    console.warn("[gemini] Synthesis parse failed, falling back to client merge");
    return mergePartials(partials);
  }
}

// ─── Client-side merge fallback ──────────────────────────────────────────────

function mergePartials(partials: AnalysisResult[]): AnalysisResult {
  const allFlags = Array.from(
    new Set(partials.flatMap((p) => p.redFlags ?? [])),
  );

  const sectionMap = new Map<string, AnalysisResult["sections"][number]>();
  for (const partial of partials) {
    for (const section of partial.sections ?? []) {
      const existing = sectionMap.get(section.title);
      const severityRank = { safe: 0, warning: 1, danger: 2 };
      if (
        !existing ||
        (severityRank[section.severity] ?? 0) >= (severityRank[existing.severity] ?? 0)
      ) {
        sectionMap.set(section.title, section);
      }
    }
  }

  return {
    tldr: partials[0].tldr,
    redFlags: allFlags,
    sections: Array.from(sectionMap.values()),
  };
}
