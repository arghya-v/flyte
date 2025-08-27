import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const flightCode = req.query.flightCode as string;
  if (!flightCode) return res.status(400).json({ error: "Missing flight code" });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "YouTube API key not set" });

  const query = `${flightCode} trip report and review airline`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=1&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return res.status(200).json({ videoId: data.items[0].id.videoId });
    }
    return res.status(200).json({ videoId: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ videoId: null });
  }
}