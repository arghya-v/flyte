"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Plug, Tv, Armchair, Clock } from "lucide-react";
import { FaPlane } from "react-icons/fa";
import { getAirportName, getAirportCity } from "@/utils/airportLookup";
import aircraftData from "@/data/aircraft.json";

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
const aircraftMap: Record<string, string> = aircraftData as Record<
  string,
  string
>;

// --- UI helpers ---
type StopsLabelProps = { itin: Itinerary };
function StopsLabel({ itin }: StopsLabelProps) {
  const segments = itin?.segments ?? [];
  const stops = Math.max(0, segments.length - 1);

  if (stops === 0) return <>Non-stop</>;

  const stopCodes = segments.slice(0, -1).map((seg) => seg.arrival.iataCode);

  return (
    <>
      {stops} stop{stops > 1 ? "s" : ""}{" "}
      {stops === 1
        ? getAirportCity(stopCodes[0]) || stopCodes[0]
        : stops === 2
        ? stopCodes.join(", ")
        : ""}
    </>
  );
}

function getAircraftName(code?: string) {
  if (!code) return "Aircraft TBA";
  return aircraftMap[code] || code; // fallback to code if missing
}

// Airline logo
function SegmentLogo({ carrier }: { carrier: string }) {
  const url = `http://img.wway.io/pics/root/${carrier}@png?exar=1&rs=fit:256:256`;
  return (
    <img
      src={url}
      alt={carrier}
      className="h-15 w-24 object-cover z-10 bg-white rounded-md p-2"
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
        <div className="font-bold text-lg">{dep.time}</div>
        <div className="text-gray-300 text-sm">
          {first?.departure.iataCode} •{" "}
          {getAirportCity(first?.departure.iataCode)}
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
          {rel && (
            <span className="text-xs font-normal text-gray-400">{rel}</span>
          )}
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
  const flightNumber = firstSegment?.flightNumber || "0000";
  const departureDate = firstSegment?.departure?.at || "unknown";
  // Skip rendering flights with codes starting with 6x, 7x, 8x (fake codes)
  if (
    airlineCode.startsWith("6X") ||
    airlineCode.startsWith("7X") ||
    airlineCode.startsWith("8X")
  ) {
    return null;
  }
  // ✅ Create unique flightId slug
  const flightId = `${airlineCode}-${flightNumber}-${departureDate}`;

  const logoUrl = `http://img.wway.io/pics/root/${airlineCode}@png?exar=1&rs=fit:200:100`;

  const emissionColor =
    flight.averageEmissions && flight.co2Emissions
      ? flight.co2Emissions < flight.averageEmissions
        ? "text-green-400"
        : "text-red-400"
      : "text-gray-500";

  const convertedPrice = useMemo(() => {
    if (!currency || !rates) return flight.price.total;

    const base = parseFloat(flight.price.total);
    const flightCurrency = flight.price.currency || "USD";

    const priceInUSD =
      flightCurrency === "USD" ? base : base / (rates[flightCurrency] || 1);

    const rate = rates[currency] || 1;
    const converted = priceInUSD * rate;

    // Format with commas and 2 decimal places
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency,
    }).format(converted);
  }, [flight.price.total, flight.price.currency, currency, rates]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 w-full max-w-5xl cursor-pointer 
                 bg-blue-950/20 backdrop-blur-lg border border-white/20 
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
          <div className="text-xl font-semibold text-white drop-shadow">
            {convertedPrice} {currency || flight.price.currency}
          </div>
          {flight.co2Emissions && (
            <p className={`text-xs ${emissionColor}`}>
              {flight.co2Emissions} kg CO₂e
            </p>
          )}

          {/* ✅ Learn More navigates to /flight/[id] */}
          <button
  onClick={(e) => {
    e.stopPropagation();
    // Save flight data to localStorage
    localStorage.setItem("selectedFlight", JSON.stringify(flight));

    // Navigate to dynamic page
    window.location.href = `/flight/${encodeURIComponent(flightId)}`;
  }}
  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 
             rounded-lg font-semibold hover:bg-white/30 transition"
>
  Learn More →
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
            className="px-2 pb-6 border-t border-white/10 mt-4"
          >
            {(flight.itineraries ?? []).map((itinerary, i) => {
              const segs = itinerary.segments ?? [];
              return (
                <div key={i} className="mt-6 space-y-5">
                  <p className="font-semibold text-4xl text-white text-center">
                    {i === 0 ? "⮦ Outbound Flight ⮧" : "⮦ Inbound Flight ⮧"}
                  </p>

                  {segs.map((seg, j) => {
                    const dep = formatDateTime(seg.departure.at);
                    const arr = formatDateTime(seg.arrival.at);
                    const hasNext = j < segs.length - 1;

                    return (
                      <div key={j}>
                        {/* Flight segment card */}
                        <div
                          className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-lg"
                          style={{ background: "rgba(12, 19, 46, 0.6)" }}
                        >
                          {/* Airline Logo on top right */}
                          <div className="absolute top-33.5 right-8">
                            <SegmentLogo carrier={seg.carrier} />
                          </div>

                          <div className="flex justify-between gap-8">
                            {/* LEFT COLUMN */}
                            <div className="flex flex-col items-start">
                              {/* Departure */}
                              <div className="flex items-center ml-0.5">
                                <svg
                                  width="64"
                                  height="64"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="text-blue-400"
                                >
                                  <path
                                    d="M7 17L17 7M17 7H7M17 7V17"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div>
                                  <div className="text-5xl font-bold text-white mt-5 mr-5">
                                    {seg.departure.iataCode}
                                  </div>
                                  <div className="text-md text-gray-300 ml-1">
                                    {getAirportName(seg.departure.iataCode)} (
                                    {getAirportCity(seg.departure.iataCode)})
                                  </div>
                                </div>
                              </div>

                              {/* Vertical flight line */}
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-px h-10 bg-gradient-to-b from-white to-gray-400"></div>
                                <div className="relative transform -translate-x-1 -translate-y-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 text-white my-3"
                                    fill="white"
                                    viewBox="0 0 20 20"
                                    transform="rotate(180)"
                                  >
                                    <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849" />
                                  </svg>
                                </div>
                                <div className="w-px h-10 bg-gradient-to-b from-gray-400 to-white"></div>
                              </div>

                              {/* Arrival */}
                              <div className="flex items-center ">
                                <svg
                                  width="64"
                                  height="64"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="rotate-90 text-green-400"
                                >
                                  <path
                                    d="M7 17L17 7M17 7H7M17 7V17"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div>
                                  <div className="text-5xl font-bold text-white">
                                    {seg.arrival.iataCode}
                                  </div>
                                  <div className="text-md text-gray-300">
                                    {getAirportName(seg.arrival.iataCode)} (
                                    {getAirportCity(seg.arrival.iataCode)})
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col text-right flex-1">
                              <div className="mb-8">
                                <div className="text-gray-300 text-sm">
                                  {dep.date}
                                </div>
                                <div className="text-2xl font-medium text-green-400">
                                  {dep.time}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  {seg.carrier} {seg.flightNumber}
                                </div>
                                <div className="text-sm text-gray-400 mb-3 font-semibold">
                                  {getAircraftName(seg.aircraft)}
                                </div>
                              </div>

                              <div className="mt-auto">
                                <div className="flex justify-end gap-3 mb-2 text-gray-300">
                                  <Wifi size={18} />
                                  <Plug size={18} />
                                  <Tv size={18} />
                                  <Armchair size={18} />
                                </div>

    
                                <div className="text-sm text-gray-400 mb-1">
                                  {formatDuration(seg.duration)}
                                </div>

                                <div className="text-2xl font-medium text-green-400">
                                  {arr.time}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {arr.date}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Layover OUTSIDE card */}
                        {hasNext && (
                          <div className="text-center text-sm text-gray-400 my-4">
                            {calcLayover(
                              seg.arrival.at,
                              segs[j + 1].departure.at
                            )}{" "}
                            – {getAirportCity(segs[j + 1].departure.iataCode)} (
                            {segs[j + 1].departure.iataCode})
                          </div>
                        )}
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
