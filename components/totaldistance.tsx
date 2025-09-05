"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAirportCoords } from "@/utils/airportLookup";
import { Cascadia_Code } from "next/font/google";

const cascadia = Cascadia_Code({
  subsets: ["latin"],
  weight: ["700", "400"],
});

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function TotalDistance({ flight }: { flight: any }) {
  if (!flight) return null;

  const totalDistance = (flight.itineraries ?? []).reduce(
    (sum: number, itinerary: any) => {
      return (
        sum +
        (itinerary.segments ?? []).reduce((segSum: number, seg: any) => {
          const dep = getAirportCoords(seg.departure.iataCode);
          const arr = getAirportCoords(seg.arrival.iataCode);
          if (!dep || !arr) return segSum;
          return segSum + haversineDistance(dep.lat, dep.lon, arr.lat, arr.lon);
        }, 0)
      );
    },
    0
  );

  const [displayValue, setDisplayValue] = useState(0);

  // Animate counting up
  useEffect(() => {
    let start = displayValue;
    let end = Math.round(totalDistance);
    if (start === end) return;

    let step = Math.ceil((end - start) / 30);
    let current = start;

    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= end) || (step < 0 && current <= end)) {
        current = end;
        clearInterval(interval);
      }
      setDisplayValue(current);
    }, 30);

    return () => clearInterval(interval);
  }, [totalDistance]);

  const digitsKm = displayValue.toString().split("");
  const miles = Math.round(totalDistance * 0.621371);
  const digitsMiles = miles.toString().split("");

  return (
    <div className="w-full bg-[#0D0F2C] backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">
        Route Distance
      </h2>

      {/* KM Counter */}
      <div className="flex gap-2 justify-center">
        {digitsKm.map((digit, i) => (
          <div
            key={i}
            className="relative w-16 h-20 flex items-center justify-center bg-blue-950 rounded-lg overflow-hidden 
                       backdrop-blur-md border border-white/30 shadow-md"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={digit}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className={`text-8xl font-bold text-white ${cascadia.className}`}
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
        <span
          className={`text-lg text-gray-300 ml-2 flex items-end pb-1 ${cascadia.className}`}
        >
          km
        </span>
      </div>

      {/* Miles Counter */}
      <div className="flex gap-1 justify-center mt-3">
        {digitsMiles.map((digit, i) => (
          <div
            key={i}
            className="relative w-8 h-12 flex items-center justify-center rounded-md overflow-hidden 
                       backdrop-blur-sm border border-white/20 shadow-sm bg-blue-950"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={digit}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 18,
                }}
                className={`text-xl font-bold text-gray-200 ${cascadia.className}`}
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
        <span
          className={`text-sm text-gray-400 ml-1 flex items-end pb-1 ${cascadia.className}`}
        >
          miles
        </span>
      </div>
    </div>
  );
}
