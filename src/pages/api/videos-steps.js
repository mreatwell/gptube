import { NextApiRequest, NextApiResponse } from "next";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MAX_TOKENS = 3500; // ~14k tokens for gpt-3.5-turbo, leave room for response

function truncateText(text, maxChars = 12000) {
  // Truncate to fit in context window
  return text.length > maxChars ? text.slice(0, maxChars) : text;
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
    let prompt = "";
    if (!continueFrom) {
      const truncated = truncateText(transcript);
      prompt = `Extract and list all actionable steps, tasks, or processes described in this transcript. For each, break it down into subtasks if possible. Ignore filler and focus on concrete actions.\n\nTranscript:\n${truncated}`;
    } else {
      prompt = `Continue extracting actionable steps, tasks, or processes from the following transcript. Continue from where the previous extraction left off.\n\nTranscript:\n${truncateText(transcript)}`;
      if (continueFrom) {
        prompt += `\n\nPrevious extracted steps:\n${continueFrom}`;
      }
    }
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
                "You are an expert at extracting actionable steps from transcripts.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 700,
          temperature: 0.3,
        }),
      }
    );
    if (!openaiRes.ok) {
      console.error("OpenAI API error:", await openaiRes.text());
      return res.status(500).json({ error: "Failed to get steps from OpenAI" });
    }
    const data = await openaiRes.json();
    const steps = data.choices?.[0]?.message?.content?.trim() || null;
    // If the response is close to max_tokens, it's likely cut off
    const cutoff =
      (steps && steps.length > 3000) ||
      data.choices?.[0]?.finish_reason === "length";
    return res.status(200).json({ steps, cutoff });
  } catch (err) {
    console.error("Steps API error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to extract steps." });
  }
}
