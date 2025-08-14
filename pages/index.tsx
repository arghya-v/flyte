// pages/index.tsx
import { useState } from 'react';

export default function Home() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchFlights = async () => {
    if (!origin || !destination || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFlights([]);

    try {
      const res = await fetch(
        `/api/searchFlights?origin=${origin}&destination=${destination}&date=${date}&adults=${adults}`
      );
      const data = await res.json();
      setFlights(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch flights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Flight Search</h1>

      <div className="bg-white shadow-md rounded p-6 w-full max-w-md space-y-4">
        {/* Inputs */}
        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Origin (IATA code)</label>
          <input
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. YYZ"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Destination (IATA code)</label>
          <input
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g. LHR"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Departure Date</label>
          <input
            type="date"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-semibold">Adults</label>
          <input
            type="number"
            min={1}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={searchFlights}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </div>

      {/* Flight results */}
      <div className="mt-8 w-full max-w-3xl space-y-4">
        {flights.map((flight, idx) => (
          <div key={idx} className="bg-white shadow-md rounded p-4 space-y-2">
            <p className="font-semibold text-lg">
              Price: {flight.price.total} {flight.price.currency}
            </p>
            {flight.itineraries.map((itinerary: any, i: number) => (
              <div key={i} className="border-t pt-2 space-y-1">
                {itinerary.segments.map((seg: any, j: number) => (
                  <div key={j} className="flex justify-between text-sm">
                    <span>
                      {seg.departure.iataCode} → {seg.arrival.iataCode}
                    </span>
                    <span>
                      {seg.departure.at.split('T')[1]} - {seg.arrival.at.split('T')[1]}
                    </span>
                    <span>{seg.carrier} {seg.flightNumber}</span>
                    <span>{seg.duration.replace('PT', '')}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
