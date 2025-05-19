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

  // Look for any cache entries related to this videoId
  const cacheKeyPattern = new RegExp(`video_${videoId}`);
  let latestData = null;
  let latestTimestamp = 0;

  // Find the latest cache entry for this videoId
  for (const [key, value] of CACHE.entries()) {
    if (cacheKeyPattern.test(key) && value.timestamp > latestTimestamp) {
      latestData = value;
      latestTimestamp = value.timestamp;
    }
  }

  if (!latestData) {
    return res.status(404).json({
      error: "No data found for this videoId",
      progress: { percent: 0, currentStage: "Not found" },
    });
  }

  // Set appropriate headers to prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.status(200).json(latestData);
}
