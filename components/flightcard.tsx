"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Plug, Tv, Armchair, Clock } from "lucide-react";
import { FaPlane } from "react-icons/fa";

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
      {stops} stop{stops > 1 ? "s" : ""} {firstStop ? firstStop : ""}
    </>
  );
}

// Airline logo for segment cards
function SegmentLogo({ carrier }: { carrier: string }) {
  const url = `http://img.wway.io/pics/root/${carrier}@png?exar=1&rs=fit:128:128`;
  return <img src={url} alt={carrier} className="w-18 h-18 object-contain z-10" />;
}

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
        <div className="font-bold text-lg">{dep.time}</div>
        <div className="text-gray-600 text-sm">{first?.departure.iataCode}</div>
      </div>

      {/* Timeline with plane */}
      <div className="flex-1 relative py-5">
        <div className="h-px w-full bg-gray-300" />

        {/* Stop dots */}
        {stopsCount > 0 &&
          Array.from({ length: stopsCount }).map((_, i) => {
            const positionPercent = ((i + 1) / (stopsCount + 1)) * 100;
            return (
              <div
                key={i}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-pink-500 ring-2 ring-white shadow"
                style={{ left: `${positionPercent}%` }}
              />
            );
          })}

        {/* Plane icon pinned to right */}
        <FaPlane
          className="absolute left-full -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 z-10"
          aria-hidden="true"
        />

        {/* Duration above */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {totalDur}
        </div>

        {/* Stops label below */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-sm text-gray-600">
          <span className="whitespace-nowrap">
            <StopsLabel itin={itin} />
          </span>
        </div>
      </div>

      {/* Arrival */}
      <div className="text-center">
        <div className="font-bold text-lg">
          {arr.time} {rel && <span className="text-xs font-normal text-gray-500">{rel}</span>}
        </div>
        <div className="text-gray-600 text-sm">{last?.arrival.iataCode}</div>
      </div>
    </div>
  );
}

export default function FlightCard({ flight }: Props) {
  const [expanded, setExpanded] = useState(false);

  const firstSegment = flight.itineraries?.[0]?.segments?.[0];
  const airlineCode = firstSegment?.carrier || "";
  const logoUrl = `http://img.wway.io/pics/root/${airlineCode}@png?exar=1&rs=fit:200:100`;

  const emissionColor =
    flight.averageEmissions && flight.co2Emissions
      ? flight.co2Emissions < flight.averageEmissions
        ? "text-green-500"
        : "text-red-500"
      : "text-gray-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-5xl hover:shadow-md transition cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* --- Summary / Preview --- */}
      <div className="flex justify-between items-stretch gap-4">
        {/* Left: logo + itineraries */}
        <div className="flex flex-1 gap-4 items-start">
          <img src={logoUrl} alt={airlineCode} className="h-14 w-auto object-contain mt-6" />
          <div className="flex flex-col gap-4 flex-1">
            {flight.itineraries?.[0]?.segments?.length && (
              <ItineraryPreview itin={flight.itineraries[0]} />
            )}
            {flight.itineraries?.[1]?.segments?.length && (
              <ItineraryPreview itin={flight.itineraries[1]} />
            )}
          </div>
        </div>

        {/* Right: price + CTA */}
        <div className="flex flex-col items-end justify-center gap-2 w-44">
          <div className="text-xl font-bold text-gray-900">
            {flight.price.total} {flight.price.currency}
          </div>
          {flight.co2Emissions && (
            <p className={`text-xs ${emissionColor}`}>{flight.co2Emissions} kg CO₂e</p>
          )}
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-800 transition"
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
            className="px-2 pb-4 border-t border-gray-200 mt-4"
          >
            {(flight.itineraries ?? []).map((itinerary, i) => {
              const segs = itinerary.segments ?? [];
              return (
                <div key={i} className="mt-4 space-y-6">
                  <p className="font-semibold text-sm text-gray-600">
                    {i === 0 ? "Outbound Flight" : "Inbound Flight"}
                  </p>

                  {segs.map((seg, j) => {
                    const dep = formatDateTime(seg.departure.at);
                    const arr = formatDateTime(seg.arrival.at);
                    const hasNext = j < segs.length - 1;
                    return (
                      <div key={j} className="flex gap-4">
                        {/* Logo replaces vertical line */}
                        <div className="flex flex-col items-center">
                          <SegmentLogo carrier={seg.carrier} />
                          
                        </div>

                        {/* Segment card */}
                        <div className="flex-1">
                          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">
                                {dep.time} {seg.departure.iataCode} – {arr.time} {seg.arrival.iataCode}
                              </p>
                              <p className="text-xs text-gray-500">
                                {dep.date} → {arr.date}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-700">
                                {seg.carrier} {seg.flightNumber}
                              </p>
                              <p className="text-xs text-gray-500">
                                {seg.aircraft || "Aircraft TBA"} • {formatDuration(seg.duration)}
                              </p>
                            </div>

                            <div className="flex gap-2 text-gray-500">
                              <Wifi size={14} />
                              <Plug size={14} />
                              <Tv size={14} />
                              <Armchair size={14} />
                            </div>
                          </div>

                          {/* Layover row */}
                          {hasNext && (
                            <div className="text-center text-xs text-gray-500 mt-1">
                              {calcLayover(segs[j].arrival.at, segs[j + 1].departure.at)} –{" "}
                              {segs[j + 1].departure.iataCode}
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
