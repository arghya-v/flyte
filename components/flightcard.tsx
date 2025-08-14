import { motion } from 'framer-motion';

type Segment = {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrier: string;
  flightNumber: string;
  duration: string;
};

type Itinerary = {
  segments: Segment[];
};

type Flight = {
  price: { total: string; currency: string };
  itineraries: Itinerary[];
};

type Props = {
  flight: Flight;
};

export default function FlightCard({ flight }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-md rounded-xl p-4 space-y-3 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold text-lg">
          {flight.price.total} {flight.price.currency}
        </p>
      </div>

      {flight.itineraries.map((itinerary, i) => (
        <div key={i} className="border-t pt-2 space-y-1">
          {itinerary.segments.map((seg, j) => (
            <div
              key={j}
              className="flex justify-between text-sm py-1 hover:bg-gray-50 rounded transition"
            >
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
    </motion.div>
  );
}