import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  co2Emissions?: number;
};

type Props = {
  flight: Flight;
};

export default function FlightCard({ flight }: Props) {
  const [expanded, setExpanded] = useState(false);

  const firstSegment = flight.itineraries[0]?.segments[0];
  const lastSegment =
    flight.itineraries[0]?.segments[flight.itineraries[0].segments.length - 1];
  const airlineCode = firstSegment?.carrier || '';
  const logoUrl = `http://img.wway.io/pics/root/${airlineCode}@png?exar=1&rs=fit:100:50`;

  const formatTime = (timeStr: string) =>
    timeStr ? timeStr.split('T')[1].slice(0, 5) : '';
  const formatDuration = (dur: string) =>
    dur ? dur.replace('PT', '').replace('H', 'h ').replace('M', 'm') : '';

  const outboundStops = flight.itineraries[0]
    ? flight.itineraries[0].segments.length - 1
    : 0;
  const inboundStops = flight.itineraries[1]
    ? flight.itineraries[1].segments.length - 1
    : null;

  return (
    <motion.div
  layout
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-[rgba(22,10,45,0.5)] backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(66,2,180,0.3)] border border-[rgba(255,255,255,0.1)] overflow-hidden cursor-pointer hover:shadow-[0_12px_40px_rgba(66,2,180,0.4)] transition-shadow"
  onClick={() => setExpanded(!expanded)}
>
  {/* Top summary row */}
  <div className="flex items-center justify-between p-4">
    {/* Airline info */}
    <div className="flex items-center gap-3">
      <img
        src={logoUrl}
        alt={airlineCode}
        className="h-9 w-auto object-contain rounded-md bg-white p-1"
      />
      <div>
        <p className="font-semibold text-white">
          {firstSegment?.departure.iataCode} → {lastSegment?.arrival.iataCode}
        </p>
        <p className="text-sm text-gray-300">
          {formatTime(firstSegment?.departure.at || '')} – {formatTime(lastSegment?.arrival.at || '')}
        </p>
      </div>
    </div>

    {/* Duration & stops */}
    <div className="text-center text-white">
      <p className="text-sm font-medium">
        {formatDuration(firstSegment?.duration || '')}
      </p>
      <p className="text-xs text-gray-300">
        {outboundStops === 0 ? 'Direct' : `${outboundStops} stop${outboundStops > 1 ? 's' : ''}`}
      </p>
    </div>

    {/* Price */}
    <div className="text-right text-white">
      <p className="text-lg font-bold text-blue-400">
        {flight.price.total} {flight.price.currency}
      </p>
      {flight.co2Emissions && (
        <p className="text-xs text-green-400">
          {flight.co2Emissions} kg CO₂
        </p>
      )}
    </div>
  </div>

  {/* Expanded details */}
  <AnimatePresence>
    {expanded && (
      <motion.div
        key="details"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="px-4 pb-4 border-t border-[rgba(255,255,255,0.1)]"
      >
        {flight.itineraries.map((itinerary, i) => (
          <div key={i} className="mt-3 space-y-3">
            <p className="font-semibold text-sm text-gray-300">
              {i === 0 ? 'Outbound Flight' : 'Return Flight'}
              {i === 1 && inboundStops !== null
                ? ` • ${inboundStops === 0 ? 'Direct' : `${inboundStops} stop${inboundStops > 1 ? 's' : ''}`}`
                : ''}
            </p>
            {itinerary.segments.map((seg, j) => (
              <div
                key={j}
                className="flex justify-between items-center bg-[rgba(255,255,255,0.05)] p-2 rounded-md text-sm"
              >
                <div className="text-white">
                  <p className="font-medium">
                    {seg.departure.iataCode} → {seg.arrival.iataCode}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatTime(seg.departure.at)} – {formatTime(seg.arrival.at)}
                  </p>
                </div>
                <div className="text-right text-white">
                  <p className="text-xs text-gray-300">
                    {seg.carrier} {seg.flightNumber}
                  </p>
                  <p className="text-xs">{formatDuration(seg.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
  );
}