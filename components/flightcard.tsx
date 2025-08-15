import { motion } from "framer-motion";
import { useState, memo } from "react";

type Segment = {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrier: string;
  flightNumber: string;
  duration: string;
  co2?: string;
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

// Dynamic airline logo URL function using wway.io
const getAirlineLogo = (carrier: string) =>
  `http://img.wway.io/pics/root/${carrier}@png?exar=1&rs=fit:512:512`;

function FlightCardComponent({ flight }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[rgba(22,10,45,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.1)] shadow-lg rounded-2xl p-4 space-y-4 hover:shadow-2xl transition-all"
    >
      {/* Price */}
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold text-lg text-white">
          {flight.price.total} {flight.price.currency}
        </p>
      </div>

      {/* Itineraries */}
      {flight.itineraries.map((itinerary, i) => (
        <div key={i} className="space-y-4 relative">
          {itinerary.segments.map((seg, j) => {
            const [logoSrc, setLogoSrc] = useState(getAirlineLogo(seg.carrier));

            return (
              <div key={j} className="flex items-center space-x-4 relative">
                {/* Timeline Dot */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-white rounded-full z-10"></div>
                  {j < itinerary.segments.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-400/30"></div>
                  )}
                </div>

                {/* Segment Card */}
                <div className="flex-1 bg-[rgba(66,2,180,0.2)] hover:bg-[rgba(66,2,180,0.4)] rounded-2xl p-3 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Airline Logo */}
                  <div className="flex items-center justify-center min-w-[80px]">
                    <img
                      src={logoSrc}
                      alt={seg.carrier}
                      className="h-20 w-20 object-contain bg-white p-1"
                      onError={() =>
                        setLogoSrc("https://via.placeholder.com/48x48?text=?")
                      }
                    />
                  </div>

                  {/* Flight Code */}
                  <div className="flex flex-col items-start min-w-[80px]">
                    <span className="text-white font-medium">
                      {seg.carrier} {seg.flightNumber}
                    </span>
                  </div>

                  {/* Route & Time */}
                  <div className="flex flex-col items-center min-w-[160px]">
                    <span className="text-white font-semibold">
                      {seg.departure.iataCode} → {seg.arrival.iataCode}
                    </span>
                    <span className="text-gray-300 text-xs">
                      {seg.departure.at.split("T")[1]} -{" "}
                      {seg.arrival.at.split("T")[1]}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="min-w-[80px] text-center text-white font-medium">
                    {seg.duration.replace("PT", "")}
                  </div>

                  {/* CO2 Emissions */}
                  {seg.co2 && (
                    <div className="min-w-[80px] text-center text-green-400 font-medium text-xs">
                      {seg.co2} CO₂
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}

export default memo(FlightCardComponent);
