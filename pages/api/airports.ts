import type { NextApiRequest, NextApiResponse } from "next";
import { LRUCache } from "lru-cache";

type Airport = {
  name: string;
  iataCode: string;
  cityName: string;
  countryName: string;
};


const popularAirports: Airport[] = [
  { name: "Toronto Pearson International", iataCode: "YYZ", cityName: "Toronto", countryName: "Canada" },
  { name: "Los Angeles International", iataCode: "LAX", cityName: "Los Angeles", countryName: "United States" },
  { name: "John F. Kennedy International", iataCode: "JFK", cityName: "New York", countryName: "United States" },
  { name: "Heathrow", iataCode: "LHR", cityName: "London", countryName: "United Kingdom" },
  { name: "Charles de Gaulle", iataCode: "CDG", cityName: "Paris", countryName: "France" },
];


let cachedToken: string | null = null;
let tokenExpiry = 0;


const airportCache = new LRUCache<string, Airport[]>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const resp = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });

  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error(`Amadeus token fetch failed: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 30) * 1000; // 30s buffer
  return cachedToken!;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rawQuery = String(req.query.query || "").trim().toLowerCase();


  if (!rawQuery || rawQuery.length < 2) {
    return res.status(200).json(popularAirports);
  }

  // ✅ Check LRU cache first
  if (airportCache.has(rawQuery)) {
    return res.status(200).json(airportCache.get(rawQuery));
  }

  try {
    const token = await getAccessToken();

    const url = new URL("https://test.api.amadeus.com/v1/reference-data/locations");
    url.searchParams.set("subType", "AIRPORT,CITY");
    url.searchParams.set("keyword", rawQuery);
    url.searchParams.set("page[limit]", "15");

    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      const errData = await resp.text();
      throw new Error(`Amadeus API error: ${resp.status} ${errData}`);
    }

    const data = await resp.json();

    const airports: Airport[] =
      data.data?.map((item: any) => ({
        name: item.name,
        iataCode: item.iataCode || item.address?.cityCode || "",
        cityName: item.address?.cityName || "",
        countryName: item.address?.countryName || "",
      })) ?? [];

    const uniqueAirports = airports.filter(
      (a, idx, arr) => idx === arr.findIndex((b) => b.iataCode === a.iataCode)
    );

    airportCache.set(rawQuery, uniqueAirports);
    return res.status(200).json(uniqueAirports);
  } catch (err: any) {
    console.error("Airport API error:", err.message);
    return res.status(500).json({ error: "Failed to fetch airports" });
  }
}
