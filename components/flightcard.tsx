"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Plug, Tv, Armchair, Clock } from "lucide-react";
import { FaPlane } from "react-icons/fa";
import { getAirportName, getAirportCity } from "@/utils/airportLookup";

// --- Types ---
type Segment = {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrier: string;
  flightNumber: string;
  duration: string;
  aircraft?: string;
};

type Itinerary = {
  segments: Segment[];
};

type Flight = {
  price: { total: string; currency: string };
  itineraries: Itinerary[];
  co2Emissions?: number;
  averageEmissions?: number;
};

type Props = {
  flight: Flight;
  currency?: string;
  rates?: Record<string, number>;
};

// --- Utils ---
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return { time: "", date: "" };
  const d = new Date(dateStr);
  return {
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
  };
};

const formatDuration = (dur: string) =>
  dur ? dur.replace("PT", "").replace("H", "h ").replace("M", "m") : "";

const calcLayover = (arrive: string, depart: string) => {
  if (!arrive || !depart) return "";
  const diff = new Date(depart).getTime() - new Date(arrive).getTime();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs > 0 ? hrs + "h " : ""}${mins}m layover`;
};

const diffDays = (from?: string, to?: string) => {
  if (!from || !to) return "";
  const d = Math.floor(
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)
  );
  return d > 0 ? `+${d}` : "";
};

const formatTotalDurationHM = (from?: string, to?: string) => {
  if (!from || !to) return "";
  const ms = new Date(to).getTime() - new Date(from).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

// --- UI helpers ---
type StopsLabelProps = { itin: Itinerary };
function StopsLabel({ itin }: StopsLabelProps) {
  const segments = itin?.segments ?? [];
  const stops = Math.max(0, segments.length - 1);
  if (stops === 0) return <>Non-stop</>;
  const firstStop = segments[0]?.arrival.iataCode;
  return (
    <>
      {stops} stop{stops > 1 ? "s" : ""}{" "}
      {firstStop ? getAirportCity(firstStop) || firstStop : ""}
    </>
  );
}

// Airline logo
function SegmentLogo({ carrier }: { carrier: string }) {
  const url = `http://img.wway.io/pics/root/${carrier}@png?exar=1&rs=fit:128:128`;
  return (
    <img
      src={url}
      alt={carrier}
      className="w-auto h-16 object-contain z-10 bg-white rounded-md p-2 border border-white/20"
    />
  );
}

// Preview row (collapsed card)
type ItineraryPreviewProps = { itin: Itinerary };
function ItineraryPreview({ itin }: ItineraryPreviewProps) {
  const segments = itin?.segments ?? [];
  if (!segments.length) return null;

  const first = segments[0];
  const last = segments[segments.length - 1];

  const dep = formatDateTime(first?.departure.at || "");
  const arr = formatDateTime(last?.arrival.at || "");
  const rel = diffDays(first?.departure.at, last?.arrival.at);
  const totalDur = formatTotalDurationHM(first?.departure.at, last?.arrival.at);

  const stopsCount = Math.max(0, segments.length - 1);

  return (
    <div className="flex items-center gap-6">
      {/* Departure */}
      <div className="text-center">
        <div className="font-bold text-lg text-white">{dep.time}</div>
        <div className="text-gray-300 text-sm">
          {first?.departure.iataCode} • {getAirportCity(first?.departure.iataCode)}
        </div>
      </div>

      {/* Timeline with plane */}
      <div className="flex-1 relative py-5">
        <div className="h-px w-full bg-white/20" />

        {stopsCount > 0 &&
          Array.from({ length: stopsCount }).map((_, i) => {
            const positionPercent = ((i + 1) / (stopsCount + 1)) * 100;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 
                           h-3 w-3 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50"
                style={{ left: `${positionPercent}%` }}
              />
            );
          })}

        <FaPlane
          className="absolute left-full -translate-x-1/2 top-1/2 -translate-y-1/2 
                     w-4 h-4 text-white z-10"
        />

        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs text-gray-300 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {totalDur}
        </div>

        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-sm text-gray-400">
          <StopsLabel itin={itin} />
        </div>
      </div>

      {/* Arrival */}
      <div className="text-center">
        <div className="font-bold text-lg text-white">
          {arr.time}{" "}
          {rel && <span className="text-xs font-normal text-gray-400">{rel}</span>}
        </div>
        <div className="text-gray-300 text-sm">
          {last?.arrival.iataCode} • {getAirportCity(last?.arrival.iataCode)}
        </div>
      </div>
    </div>
  );
}

export default function FlightCard({ flight, currency, rates }: Props) {
  const [expanded, setExpanded] = useState(false);

  const firstSegment = flight.itineraries?.[0]?.segments?.[0];
  const airlineCode = firstSegment?.carrier || "";
  const logoUrl = `http://img.wway.io/pics/root/${airlineCode}@png?exar=1&rs=fit:200:100`;

  const emissionColor =
    flight.averageEmissions && flight.co2Emissions
      ? flight.co2Emissions < flight.averageEmissions
        ? "text-green-400"
        : "text-red-400"
      : "text-gray-500";

  const convertedPrice = (() => {
    if (!currency || !rates) return flight.price.total;
    const base = parseFloat(flight.price.total);
    const rate = rates[currency] || 1;
    return (base * rate).toFixed(2);
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 w-full max-w-5xl cursor-pointer 
                 bg-white/10 backdrop-blur-lg border border-white/20 
                 shadow-lg shadow-black/30 hover:shadow-xl transition"
      onClick={() => setExpanded(!expanded)}
    >
      {/* --- Summary / Preview --- */}
      <div className="flex justify-between items-stretch gap-4">
        <div className="flex flex-1 gap-4 items-start">
          <img
            src={logoUrl}
            alt={airlineCode}
            className="h-14 w-auto object-contain mt-6 bg-white p-2 rounded-md"
          />
          <div className="flex flex-col gap-4 flex-1">
            {flight.itineraries?.[0]?.segments?.length && (
              <ItineraryPreview itin={flight.itineraries[0]} />
            )}
            {flight.itineraries?.[1]?.segments?.length && (
              <ItineraryPreview itin={flight.itineraries[1]} />
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-center gap-2 w-44">
          <div className="text-2xl font-bold text-white drop-shadow">
            {convertedPrice} {currency || flight.price.currency}
          </div>
          {flight.co2Emissions && (
            <p className={`text-xs ${emissionColor}`}>
              {flight.co2Emissions} kg CO₂e
            </p>
          )}
          <button
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 
                       rounded-lg font-semibold hover:bg-white/30 transition"
            onClick={(e) => e.stopPropagation()}
          >
            See Deals →
          </button>
        </div>
      </div>

      {/* --- Expanded details --- */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-2 pb-4 border-t border-white/20 mt-4"
          >
            {(flight.itineraries ?? []).map((itinerary, i) => {
              const segs = itinerary.segments ?? [];
              return (
                <div key={i} className="mt-4 space-y-6">
                  <p className="font-semibold text-sm text-white/80">
                    {i === 0 ? "Outbound Flight" : "Inbound Flight"}
                  </p>

                  {segs.map((seg, j) => {
                    const dep = formatDateTime(seg.departure.at);
                    const arr = formatDateTime(seg.arrival.at);
                    const hasNext = j < segs.length - 1;
                    return (
                      <div key={j} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <SegmentLogo carrier={seg.carrier} />
                        </div>

                        <div className="flex-1">
                          <div
                            className="flex justify-between items-center 
                                          bg-white/10 backdrop-blur-md 
                                          p-3 rounded-xl border border-white/20"
                          >
                            <div>
                              <p className="font-medium text-white">
                                {dep.time} {seg.departure.iataCode} •{" "}
                                {getAirportName(seg.departure.iataCode)} → {arr.time}{" "}
                                {seg.arrival.iataCode} •{" "}
                                {getAirportName(seg.arrival.iataCode)}
                              </p>
                              <p className="text-xs text-gray-300">
                                {dep.date} → {arr.date}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm font-medium text-white">
                                {seg.carrier} {seg.flightNumber}
                              </p>
                              <p className="text-xs text-gray-300">
                                {seg.aircraft || "Aircraft TBA"} •{" "}
                                {formatDuration(seg.duration)}
                              </p>
                            </div>

                            <div className="flex gap-2 text-gray-300">
                              <Wifi size={14} />
                              <Plug size={14} />
                              <Tv size={14} />
                              <Armchair size={14} />
                            </div>
                          </div>

                          {hasNext && (
                            <div className="text-center text-sm text-gray-400 mt-5">
                              {calcLayover(
                                segs[j].arrival.at,
                                segs[j + 1].departure.at
                              )}{" "}
                              – {getAirportCity(segs[j + 1].departure.iataCode)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
