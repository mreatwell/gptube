import { NextApiRequest, NextApiResponse } from "next";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple in-memory cache
const CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache lifetime

// Extract steps from transcript using OpenAI
async function extractStepsFromTranscript(transcript, continueFrom = "") {
  if (!OPENAI_API_KEY || !transcript) return { steps: null, cutoff: false };

  // Create cache key from input
  const cacheKey = `steps_${transcript.substring(0, 100)}_${continueFrom ? "continued" : "initial"}`;
  const cachedResult = CACHE.get(cacheKey);
  const now = Date.now();

  // Return cached result if available and not expired
  if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
    console.log("Serving cached steps extraction result");
    return cachedResult.data;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at extracting step-by-step instructions from video transcripts.",
          },
          {
            role: "user",
            content: continueFrom
              ? `Continue extracting all steps and instructions from this transcript. Format each step with numbers and include any timestamps mentioned. Previous steps: ${continueFrom}\n\nRest of transcript: ${transcript}`
              : `Extract all steps and instructions from this transcript. Format as a numbered list with timestamps when available. Focus on actionable steps that someone would follow to replicate what's taught in the video.\n\nTranscript: ${transcript}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });
    if (!res.ok) {
      console.error("OpenAI API error for steps extraction:", await res.text());
      return { steps: null, cutoff: false };
    }
    const data = await res.json();
    const steps = data.choices?.[0]?.message?.content?.trim() || null;

    // Check if we might need to continue (token limit reached)
    const endingIndicatesMore =
      steps && (steps.endsWith("...") || steps.match(/\d+\.$/)); // Ends with a number and period

    const result = {
      steps,
      cutoff: endingIndicatesMore,
    };

    // Store in cache
    CACHE.set(cacheKey, {
      data: result,
      timestamp: now,
    });

    return result;
  } catch (err) {
    console.error("Error extracting steps:", err);
    return { steps: null, cutoff: false };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, continueFrom } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "Missing transcript" });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const result = await extractStepsFromTranscript(
      transcript,
      continueFrom || ""
    );

    if (!result.steps) {
      return res.status(404).json({ error: "Failed to extract steps" });
    }

    return res.status(200).json({
      steps: result.steps,
      cutoff: result.cutoff,
    });
  } catch (err) {
    console.error("API error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to extract steps." });
  }
}
