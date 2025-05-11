import { NextApiRequest, NextApiResponse } from "next";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper to extract YouTube video ID from URL
function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes("youtube.com")) {
      const v = urlObj.searchParams.get("v");
      if (v) return v;
      // Handle /embed/VIDEO_ID or /v/VIDEO_ID
      const match = urlObj.pathname.match(/\/(embed|v)\/([\w-]{11})/);
      if (match) return match[2];
    }
    // Fallback: try to get last path segment
    const parts = urlObj.pathname.split("/");
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

// Fetch video metadata from YouTube Data API
async function fetchVideoMetadata(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch video metadata");
  const data = await res.json();
  if (!data.items || !data.items.length) throw new Error("Video not found");
  return data.items[0];
}

// Fetch transcript from local Python microservice
async function fetchTranscriptFromPython(videoId) {
  try {
    const res = await fetch(
      `http://localhost:8001/transcript?video_id=${videoId}`
    );
    if (!res.ok) {
      console.error("Transcript service returned non-OK:", res.status);
      return null;
    }
    const data = await res.json();
    return data.transcript;
  } catch (err) {
    console.error("Error fetching transcript from Python service:", err);
    return null;
  }
}

// Summarize transcript using OpenAI (gpt-4o)
async function summarizeTranscript(transcript) {
  if (!OPENAI_API_KEY) return null;
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
              "You are an expert at summarizing YouTube video transcripts.",
          },
          {
            role: "user",
            content: `Summarize the following YouTube transcript in a concise, clear way for someone who wants the key points and main ideas.\n\nTranscript:\n${transcript}`,
          },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
    });
    if (!res.ok) {
      console.error("OpenAI API error:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("Error calling OpenAI API:", err);
    return null;
  }
}

// Chunk transcript into overlapping chunks
function chunkTranscript(text, chunkSize = 1000, overlap = 200) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.length > 0) chunks.push(chunk);
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

// Get embedding for a chunk using OpenAI
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

  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid YouTube URL" });
  }

  const videoId = extractVideoId(url);
  if (!videoId || videoId.length < 8) {
    return res
      .status(400)
      .json({ error: "Could not extract video ID from URL" });
  }

  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ error: "YouTube API key not configured" });
  }

  try {
    // Fetch video metadata
    const metadata = await fetchVideoMetadata(videoId);
    // Fetch transcript from Python microservice
    const transcript = await fetchTranscriptFromPython(videoId);
    let summary = null;
    let chunks = [];
    if (transcript) {
      summary = await summarizeTranscript(transcript);
      // Chunk transcript and get embeddings
      const chunkTexts = chunkTranscript(transcript, 1000, 200);
      chunks = await Promise.all(
        chunkTexts.map(async (text, idx) => ({
          idx,
          text,
          embedding: await getEmbedding(text),
        }))
      );
    }
    return res.status(200).json({
      videoId,
      status: "processing",
      message: transcript ? "Transcript found." : "Transcript not available.",
      metadata,
      transcript,
      summary,
      chunks, // array of { idx, text, embedding }
    });
  } catch (err) {
    console.error("API error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to process video." });
  }
}
