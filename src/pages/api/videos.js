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

// Helper to extract links from text
function extractLinksFromText(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches.filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
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
      if (res.status === 503 || res.status === 502 || res.status === 500) {
        // Service unavailable
        return { error: "service_unavailable" };
      }
      return { error: "not_available" };
    }
    const data = await res.json();
    if (!data.transcript) {
      return { error: "not_available" };
    }
    return {
      transcript: data.transcript,
      links: data.links || [],
    };
  } catch (err) {
    console.error("Error fetching transcript from Python service:", err);
    return { error: "service_unavailable" };
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
            content: `Summarize the following YouTube transcript in a concise, clear way for someone who wants the key points and main ideas. If possible, include timestamps (e.g., 1:23, 12:45) for key moments or sections, so the viewer can jump to those parts in the video.\n\nTranscript:\n${transcript}`,
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

    // Extract links from video description
    const description = metadata?.snippet?.description || "";
    const descriptionLinks = extractLinksFromText(description);

    // Fetch transcript from Python microservice
    const transcriptResult = await fetchTranscriptFromPython(videoId);
    let summary = null;
    let chunks = [];
    if (transcriptResult.error === "service_unavailable") {
      return res.status(503).json({
        error:
          "Transcript service is temporarily unavailable. Please try again later.",
        videoId,
        status: "error",
        metadata,
      });
    }
    const transcript = transcriptResult.transcript || null;
    const transcriptLinks = transcriptResult.links || [];

    // Combine links from description and transcript, remove duplicates
    const allLinks = [...new Set([...descriptionLinks, ...transcriptLinks])];

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
      message: transcript
        ? "Transcript found."
        : "Transcript not available for this video.",
      metadata,
      transcript,
      summary,
      chunks, // array of { idx, text, embedding }
      links: allLinks, // Combined links from transcript and description
    });
  } catch (err) {
    console.error("API error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to process video." });
  }
}
