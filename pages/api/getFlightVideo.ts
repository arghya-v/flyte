import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const flightCode = (req.query.flightCode as string)?.trim();
  let airline = (req.query.airline as string)?.trim() || "";
  const serviceClass = (req.query.serviceClass as string)?.trim() || null;

  if (!flightCode) {
    return res.status(400).json({ error: "Missing flight code" });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "YouTube API key not set" });
  }

  try {
    // 🔹 Step 1: Fetch airline if not provided or empty
    if (!airline) {
      try {
        const routeRes = await fetch(
          `https://api.adsbdb.com/v0/callsign/${encodeURIComponent(flightCode)}`
        );
        if (routeRes.ok) {
          const routeData = await routeRes.json();
          const name = routeData.response?.flightroute?.airline?.name?.trim();
          airline = name && name.length > 0 ? name : flightCode.slice(0, 2);
        } else {
          airline = flightCode.slice(0, 2);
        }
      } catch (err) {
        console.warn("⚠️ Airline lookup failed:", err);
        airline = flightCode.slice(0, 2);
      }
    }

    // 🔹 Optional special case(s)
    if (airline === "SATA International") airline = "Azores";
    if (airline === "AI") airline = "Air India";
    if (airline === "BA") airline = "British Airways";
    if (airline === "AF") airline = "Air France";
    if (airline === "KL") airline = "KLM Royal Dutch Airlines";
    if (airline === "LH") airline = "Lufthansa";
    if (airline === "SQ") airline = "Singapore Airlines";
    if (airline === "CX") airline = "Cathay Pacific";
    if (airline === "EK") airline = "Emirates";
    if (airline === "QR") airline = "Qatar Airways";
    if (airline === "VS") airline = "Virgin Atlantic";
    if (airline === "DL") airline = "Delta Air Lines";
    if (airline === "AA") airline = "American Airlines";
    if (airline === "UA") airline = "United Airlines";
    if (airline === "QF") airline = "Qantas";
    if (airline === "AC") airline = "Air Canada";

    airline = airline.trim(); // ensure no extra whitespace

    // 🔹 Step 2: Build YouTube query
    const queryParts = [airline];
    if (serviceClass) queryParts.push(serviceClass);
    queryParts.push("trip report review simply aviation economy");
    const query = queryParts.join(" ");

    // 🔹 Step 3: Call YouTube
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=1&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const videoId =
      data.items && data.items.length > 0 ? data.items[0].id.videoId : null;

    const payload = {
      videoId,
      airline,
      serviceClass,
      query,
    };

    console.log("YouTube search payload:", payload);

    return res.status(200).json(payload);
  } catch (err) {
    console.error("⚠️ Handler error:", err);
    return res.status(500).json({
      videoId: null,
      airline,
      serviceClass,
      query: "trip report review simply aviation economy",
    });
  }
}
