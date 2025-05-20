import { NextApiRequest, NextApiResponse } from "next";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

// Get embedding for a string using OpenAI
async function getEmbedding(text) {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    if (!res.ok) {
      console.error("OpenAI Embedding API error:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.data?.[0]?.embedding || null;
  } catch (err) {
    console.error("Error calling OpenAI Embedding API:", err);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chunks, question } = req.body;
  if (!chunks || !Array.isArray(chunks) || !question) {
    return res.status(400).json({ error: "Missing chunks or question" });
  }
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    // Embed the question
    const questionEmbedding = await getEmbedding(question);
    if (!questionEmbedding) throw new Error("Failed to embed question");
    // Compute similarity for each chunk
    const scoredChunks = chunks.map((chunk) => ({
      ...chunk,
      similarity: chunk.embedding
        ? cosineSimilarity(questionEmbedding, chunk.embedding)
        : -1,
    }));
    // Sort by similarity, descending
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    // Select top 2 most relevant chunks
    const topChunks = scoredChunks.slice(0, 2);
    const context = topChunks.map((c) => c.text).join("\n---\n");
    // Ask OpenAI using only the most relevant chunks
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
                "You are a helpful assistant. Answer questions using only the information in the provided YouTube transcript chunks. If the answer is not in the transcript, say so.",
            },
            {
              role: "user",
              content: `Relevant transcript chunks:\n${context}\n\nQuestion: ${question}`,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      }
    );
    if (!openaiRes.ok) {
      console.error("OpenAI API error:", await openaiRes.text());
      return res
        .status(500)
        .json({ error: "Failed to get answer from OpenAI" });
    }
    const data = await openaiRes.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || null;
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Q&A API error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to answer question." });
  }
}
