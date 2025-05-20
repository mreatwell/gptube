import { NextApiRequest, NextApiResponse } from "next";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple in-memory cache for video processing results
// In production, consider using Redis or another external cache
let CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache lifetime

// Share the cache with other endpoints via global state
if (global._GPTUBE_CACHE) {
  CACHE = global._GPTUBE_CACHE;
} else {
  global._GPTUBE_CACHE = CACHE;
}

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
  console.log(
    "summarizeTranscript called. API key present:",
    Boolean(OPENAI_API_KEY)
  );
  if (!OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY is missing!");
    return null;
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
              "You are an expert at summarizing YouTube video transcripts.",
          },
          {
            role: "user",
            content: `Summarize the following YouTube transcript in a concise, clear way for someone who wants the key points and main ideas. If possible, include timestamps (e.g., 1:23, 12:45) for key moments or sections, so the viewer can jump to those parts in the video.\n\nTranscript:\n${transcript}`,
          },
        ],
        max_tokens: 1000,
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

// Extract steps from transcript using OpenAI
async function extractStepsFromTranscript(transcript, continueFrom = "") {
  if (!OPENAI_API_KEY || !transcript) return null;
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

    // Check if we need to continue (token limit reached)
    const endingIndicatesMore =
      steps && (steps.endsWith("...") || steps.match(/\d+\.$/)); // Ends with a number and period
    return {
      steps,
      cutoff: endingIndicatesMore,
    };
  } catch (err) {
    console.error("Error extracting steps:", err);
    return { steps: null, cutoff: false };
  }
}

// Helper to track processing progress
class ProcessingTracker {
  constructor() {
    this.stages = [
      {
        name: "metadata",
        label: "Loading video metadata",
        completed: false,
        weight: 1,
      },
      {
        name: "transcript",
        label: "Fetching transcript",
        completed: false,
        weight: 2,
      },
      {
        name: "summary",
        label: "Generating summary",
        completed: false,
        weight: 3,
      },
      { name: "steps", label: "Extracting steps", completed: false, weight: 3 },
      {
        name: "embeddings",
        label: "Processing for Q&A",
        completed: false,
        weight: 2,
      },
    ];
    this.totalWeight = this.stages.reduce(
      (sum, stage) => sum + stage.weight,
      0
    );
  }

  markComplete(stageName) {
    const stage = this.stages.find((s) => s.name === stageName);
    if (stage) stage.completed = true;
  }

  getProgress() {
    const completedWeight = this.stages
      .filter((s) => s.completed)
      .reduce((sum, stage) => sum + stage.weight, 0);

    return {
      percent: Math.round((completedWeight / this.totalWeight) * 100),
      stages: this.stages.map((s) => ({ ...s })),
      currentStage: this.stages.find((s) => !s.completed)?.label || "Complete",
    };
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
    // Check cache first with better cache key (include potential query parameters)
    const cacheKey = `video_${videoId}_${url.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const cachedData = CACHE.get(cacheKey);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      console.log(`Serving cached response for video ID: ${videoId}`);
      return res.status(200).json({
        ...cachedData,
        fromCache: true,
        status: "processed",
        progress: { percent: 100, stages: [], currentStage: "Complete" },
      });
    }

    // Initialize processing tracker
    const tracker = new ProcessingTracker();

    // Prepare the initial response object
    const responseData = {
      videoId,
      status: "processing",
      message: "Starting video processing...",
      progress: tracker.getProgress(),
      fromCache: false,
      timestamp: now,
    };

    // Start by sending the initial response to the client
    res.status(200).json(responseData);

    // Update cache with initial status
    CACHE.set(cacheKey, { ...responseData });
    console.log(`Processing started for video ID: ${videoId} - 0%`);

    // From this point on, we'll continue processing but the client already has a response
    // The client will poll for updates, and we'll update the cache as we go

    // Fetch video metadata - Stage 1
    console.log(`Fetching metadata for video ID: ${videoId}`);
    const metadata = await fetchVideoMetadata(videoId);
    tracker.markComplete("metadata");

    // Update the cache with metadata
    CACHE.set(cacheKey, {
      ...responseData,
      metadata,
      progress: tracker.getProgress(),
      message: "Fetching transcript...",
      timestamp: Date.now(),
    });
    console.log(
      `Metadata fetched for video ID: ${videoId} - ${tracker.getProgress().percent}%`
    );

    // Extract links from video description
    const description = metadata?.snippet?.description || "";
    const descriptionLinks = extractLinksFromText(description);

    // Fetch transcript from Python microservice - Stage 2
    console.log(`Fetching transcript for video ID: ${videoId}`);
    const transcriptResult = await fetchTranscriptFromPython(videoId);
    tracker.markComplete("transcript");

    // Update cache with transcript
    const updatedResponseData = {
      ...responseData,
      metadata,
      progress: tracker.getProgress(),
      timestamp: Date.now(),
    };

    if (transcriptResult.error === "service_unavailable") {
      const errorData = {
        ...updatedResponseData,
        error:
          "Transcript service is temporarily unavailable. Please try again later.",
        status: "error",
      };
      CACHE.set(cacheKey, errorData);
      console.log(`Transcript service unavailable for video ID: ${videoId}`);
      return; // Response already sent
    }

    const transcript = transcriptResult.transcript || null;
    const transcriptLinks = transcriptResult.links || [];

    // Combine links from description and transcript
    const allLinks = [...new Set([...descriptionLinks, ...transcriptLinks])];

    // Update cache with transcript & links
    CACHE.set(cacheKey, {
      ...updatedResponseData,
      transcript,
      links: allLinks,
      message: transcript
        ? "Transcript found. Generating summary..."
        : "Transcript not available for this video.",
      timestamp: Date.now(),
    });
    console.log(
      `Transcript fetched for video ID: ${videoId} - ${tracker.getProgress().percent}%`
    );

    if (transcript) {
      // Process in parallel but update cache after each step completes

      // Start summary generation - Stage 3
      console.log(`Generating summary for video ID: ${videoId}`);
      const summaryPromise = summarizeTranscript(transcript).then((summary) => {
        tracker.markComplete("summary");
        // Update cache with summary
        const currentData = CACHE.get(cacheKey) || {};
        CACHE.set(cacheKey, {
          ...currentData,
          summary,
          progress: tracker.getProgress(),
          timestamp: Date.now(),
        });
        console.log(
          `Summary generated for video ID: ${videoId} - ${tracker.getProgress().percent}%`
        );
        return summary;
      });

      // Start steps extraction - Stage 4
      console.log(`Extracting steps for video ID: ${videoId}`);
      const stepsPromise = extractStepsFromTranscript(transcript).then(
        (stepsResult) => {
          tracker.markComplete("steps");
          // Update cache with steps
          const currentData = CACHE.get(cacheKey) || {};
          CACHE.set(cacheKey, {
            ...currentData,
            steps: stepsResult.steps,
            stepsCutoff: stepsResult.cutoff,
            progress: tracker.getProgress(),
            timestamp: Date.now(),
          });
          console.log(
            `Steps extracted for video ID: ${videoId} - ${tracker.getProgress().percent}%`
          );

          // If steps are cut off, try to get the rest immediately
          if (stepsResult.cutoff && stepsResult.steps) {
            return extractStepsFromTranscript(
              transcript,
              stepsResult.steps
            ).then((continueResult) => {
              if (continueResult.steps) {
                const updatedSteps =
                  stepsResult.steps + "\n" + continueResult.steps;
                // Update cache with continued steps
                const latestData = CACHE.get(cacheKey) || {};
                CACHE.set(cacheKey, {
                  ...latestData,
                  steps: updatedSteps,
                  stepsCutoff: continueResult.cutoff,
                  timestamp: Date.now(),
                });
                console.log(
                  `Additional steps extracted for video ID: ${videoId}`
                );
              }
              return stepsResult;
            });
          }
          return stepsResult;
        }
      );

      // Start chunking for embeddings - Stage 5
      console.log(`Processing Q&A embeddings for video ID: ${videoId}`);
      const chunksPromise = Promise.all(
        chunkTranscript(transcript, 1000, 200).map(async (text, idx) => ({
          idx,
          text,
          embedding: await getEmbedding(text),
        }))
      ).then((chunks) => {
        tracker.markComplete("embeddings");
        // Update cache with chunks
        const currentData = CACHE.get(cacheKey) || {};
        CACHE.set(cacheKey, {
          ...currentData,
          chunks,
          progress: tracker.getProgress(),
          timestamp: Date.now(),
        });
        console.log(
          `Q&A embeddings processed for video ID: ${videoId} - ${tracker.getProgress().percent}%`
        );
        return chunks;
      });

      // Wait for all operations to complete
      await Promise.all([summaryPromise, stepsPromise, chunksPromise]);

      // Final cache update
      const currentData = CACHE.get(cacheKey) || {};
      CACHE.set(cacheKey, {
        ...currentData,
        status: "complete",
        message: "Processing complete.",
        timestamp: Date.now(),
      });
      console.log(`Processing completed for video ID: ${videoId} - 100%`);
    } else {
      // No transcript, mark remaining stages complete
      tracker.markComplete("summary");
      tracker.markComplete("steps");
      tracker.markComplete("embeddings");

      // Final cache update for no transcript case
      CACHE.set(cacheKey, {
        ...updatedResponseData,
        progress: tracker.getProgress(),
        status: "complete",
        message: "No transcript available.",
        timestamp: Date.now(),
      });
      console.log(`No transcript available for video ID: ${videoId} - 100%`);
    }

    // Cleanup old cache entries periodically
    if (Math.random() < 0.1) {
      // 10% chance to run cleanup on each request
      for (const [key, value] of CACHE.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          CACHE.delete(key);
        }
      }
    }

    return; // Response already sent
  } catch (err) {
    console.error("API error:", err);
    // Try to send error response, but might fail if headers already sent
    try {
      return res
        .status(500)
        .json({ error: err.message || "Failed to process video." });
    } catch (e) {
      console.error("Could not send error response, headers already sent:", e);
    }
  }
}
