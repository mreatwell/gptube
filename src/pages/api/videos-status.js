import { NextApiRequest, NextApiResponse } from "next";

// Access the same cache as the videos.js endpoint
let CACHE = new Map();
if (global._GPTUBE_CACHE) {
  CACHE = global._GPTUBE_CACHE;
} else {
  global._GPTUBE_CACHE = CACHE;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId parameter" });
  }

  // Call your FastAPI backend
  const backendUrl = `https://yt-transcript-service.onrender.com/transcript/?url=https://www.youtube.com/watch?v=${videoId}`;
  try {
    const response = await fetch(backendUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Backend error" });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch from backend" });
  }
}
