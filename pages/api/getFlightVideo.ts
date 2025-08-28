import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const flightCode = req.query.flightCode as string;
  let airline = req.query.airline as string | null;
  const serviceClass = (req.query.serviceClass as string) || null;

  if (!flightCode) return res.status(400).json({ error: "Missing flight code" });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "YouTube API key not set" });

  try {
    // 🔹 Step 1: Fetch airline if not provided
    if (!airline) {
      try {
        const routeRes = await fetch(
          `https://api.adsbdb.com/v0/callsign/${encodeURIComponent(flightCode)}`
        );
        if (routeRes.ok) {
          const routeData = await routeRes.json();
          airline = routeData.response?.flightroute?.airline?.name || null;
        }
      } catch (err) {
        console.warn("⚠️ Airline lookup failed:", err);
      }
    }
    if (airline === "SATA International") {
  airline = "Azores";
}

    // 🔹 Step 2: Build YouTube query
    const queryParts = [];
    if (airline) queryParts.push(airline);
    if (serviceClass) queryParts.push(serviceClass);
    queryParts.push("trip report review simply aviation economy");

    const query = queryParts.join(" ");

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=1&key=${apiKey}`;

    // 🔹 Step 3: Call YouTube
    const response = await fetch(url);
    const data = await response.json();
    const payload = {
      videoId: data.items && data.items.length > 0 ? data.items[0].id.videoId : null,
      airline,
      serviceClass,
      query,
    };
    console.log("YouTube search payload:", payload);
    if (data.items && data.items.length > 0) {
      return res.status(200).json({
        videoId: data.items[0].id.videoId,
        airline: airline,
        serviceClass: serviceClass,
        query: query, // useful for debugging
      });
    }

    return res.status(200).json({
      videoId: null,
      airline: airline,
      serviceClass: serviceClass,
      query: query,
    });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ videoId: null, airline, serviceClass });
  }
}
