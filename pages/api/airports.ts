import type { NextApiRequest, NextApiResponse } from "next";

type Airport = {
  name: string;
  iataCode: string;
  cityName: string;
  countryName: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  if (!query) return res.status(400).json([]);

  try {
    // 1️⃣ Get access token from Amadeus
    const tokenResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID!,
        client_secret: process.env.AMADEUS_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) throw new Error("Failed to get Amadeus access token");

    // 2️⃣ Fetch airports and cities using the access token
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${query}&page[limit]=15`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    // 3️⃣ Map to your format, fallback to cityCode if iataCode is missing
    const airports = data.data?.map((item: any) => ({
      name: item.name,
      iataCode: item.iataCode || item.address?.cityCode || "",
      cityName: item.address?.cityName || "",
      countryName: item.address?.countryName || "",
    })) || [];

    // 4️⃣ Remove duplicates by iataCode
    const uniqueAirports = Array.from(
      new Map(airports.map((a: Airport) => [a.iataCode, a])).values()
    );

    res.status(200).json(uniqueAirports);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
}
