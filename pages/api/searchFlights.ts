import type { NextApiRequest, NextApiResponse } from 'next';

const AMADEUS_API = 'https://test.api.amadeus.com';

async function getAccessToken() {
  const response = await fetch(`${AMADEUS_API}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID || '',
      client_secret: process.env.AMADEUS_CLIENT_SECRET || ''
    })
  });

  const text = await response.text();
  if (!response.ok) throw new Error('Failed to get access token: ' + text);
  return JSON.parse(text);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { origin, destination, date, returnDate, adults } = req.query;

    if (!origin || !destination || !date) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Step 1: Get token
    const tokenData = await getAccessToken();

    // Step 2: Build API URL
    let apiUrl = `${AMADEUS_API}/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=${adults || 1}&max=20`;

    // If user provided return date, include it
    if (returnDate) {
      apiUrl += `&returnDate=${returnDate}`;
    }

    // Step 3: Fetch flights
    const flightResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!flightResponse.ok) {
      const text = await flightResponse.text();
      throw new Error('Failed to fetch flights: ' + text);
    }

    const flights = await flightResponse.json();

    // Step 4: Map to detailed format
    const detailedFlights = (flights.data || []).map((f: any) => ({
      id: f.id,
      price: f.price,
      itineraries: f.itineraries.map((it: any) => ({
        segments: it.segments.map((seg: any) => ({
          carrier: seg.carrierCode,
          flightNumber: seg.number,
          departure: {
            iataCode: seg.departure.iataCode,
            at: seg.departure.at
          },
          arrival: {
            iataCode: seg.arrival.iataCode,
            at: seg.arrival.at
          },
          duration: seg.duration
        }))
      }))
    }));

    res.status(200).json(detailedFlights);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
