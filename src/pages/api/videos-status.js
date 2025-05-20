import { NextApiRequest, NextApiResponse } from "next";

// Access the same cache as the videos.js endpoint
let CACHE = global._GPTUBE_CACHE || new Map();

export default function handler(req, res) {
  console.log("Request method:", req.method);
  console.log("Query params:", req.query);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId parameter" });
  }

  // Use the same cache key logic as /api/videos.js
  const cacheKey = `video_${videoId}`;
  const data = CACHE.get(cacheKey);

  if (!data) {
    // Not ready yet, still processing
    return res.status(200).json({
      status: "processing",
      message: "Processing video...",
      progress: { percent: 0, stages: [], currentStage: "Starting" },
    });
  }

  // If summary/steps/etc. are missing, still processing
  if (data.status !== "complete") {
    return res.status(200).json({
      ...data,
      status: "processing",
      message: data.message || "Processing video...",
    });
  }

  // All done!
  return res.status(200).json(data);
}
