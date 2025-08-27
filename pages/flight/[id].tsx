"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Plug, Tv, Armchair } from "lucide-react";
import dynamic from "next/dynamic";

import { getAirportName, getAirportCity, getAirportCoords } from "@/utils/airportLookup";
import aircraftData from "@/data/aircraft.json";
import FlightacDetails from "@/components/flight&acDetails";

// --- Dynamic Components ---
const AirportMap = dynamic(() => import("../../components/FlightMap"), { ssr: false });

// --- Helpers ---
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

const aircraftMap: Record<string, string> = aircraftData as Record<string, string>;

const getAircraftName = (code?: string) => (code ? aircraftMap[code] || code : "Aircraft TBA");

// --- Components ---
const SegmentLogo = ({ carrier }: { carrier: string }) => {
  const url = `http://img.wway.io/pics/root/${carrier}@png?exar=1&rs=fit:256:256`;
  return <img src={url} alt={carrier} className="h-15 w-24 object-cover z-10 bg-white rounded-md p-2" />;
};

// --- Main Page ---
export default function FlightDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [flight, setFlight] = useState<any | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Load flight from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("selectedFlight");
    if (stored) {
      try {
        setFlight(JSON.parse(stored));
      } catch {
        console.error("Error parsing flight data");
      }
    }
  }, [id]);

  // Fetch flight review video
  useEffect(() => {
    if (!id || !flight) return;

    // Ensure it's a string, not array
    let flightCode = Array.isArray(id) ? id[0] : id;

    // Strip date/time if present: "WS-425-2025-09-06T12:00:00" -> "WS425"
    const parts = flightCode.split("-");
    if (parts.length >= 2) flightCode = parts[0] + parts[1];

    // Pull airline + service class
    const airline = flight.validatingAirlineCodes?.[0] || "";
    const serviceClass =
      flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "";

    // Normalize cabin name for YouTube query
    const prettyClass =
      serviceClass.toLowerCase() === "economy"
        ? "economy"
        : serviceClass
        ? serviceClass.toLowerCase() + " class"
        : "";

    async function fetchVideo() {
      try {
        const res = await fetch(
          `/api/getFlightVideo?flightCode=${encodeURIComponent(
            flightCode
          )}&airline=${encodeURIComponent(airline)}&serviceClass=${encodeURIComponent(
            prettyClass
          )}`
        );

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("Response not JSON:", text);
          return;
        }

        setVideoId(data.videoId);
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    }

    fetchVideo();
  }, [id, flight]);

  if (!flight) return <p className="p-6 text-white">Loading flight details...</p>;

  // --- Map Data ---
  const airports = (flight.itineraries ?? [])
    .flatMap((it: any) => it.segments ?? [])
    .flatMap((seg: any) => [
      {
        code: seg.departure.iataCode,
        name: getAirportName(seg.departure.iataCode),
        city: getAirportCity(seg.departure.iataCode),
        ...getAirportCoords(seg.departure.iataCode),
      },
      {
        code: seg.arrival.iataCode,
        name: getAirportName(seg.arrival.iataCode),
        city: getAirportCity(seg.arrival.iataCode),
        ...getAirportCoords(seg.arrival.iataCode),
      },
    ]);

  const routes = (flight.itineraries ?? []).flatMap((itinerary: any, idx: number) =>
    (itinerary.segments ?? []).map((seg: any) => ({
      from: seg.departure.iataCode,
      to: seg.arrival.iataCode,
      itineraryIndex: idx,
    }))
  );

  // --- Render ---
  return (
    <div className="absolute top-5 left-5 max-w-3xl w-full p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-right">Flight Details: {Array.isArray(id) ? id[0] : id}</h1>

      {(flight.itineraries ?? []).map((itinerary: any, i: number) => {
        const segs = itinerary.segments ?? [];
        return (
          <div key={i} className="mt-8 space-y-6">
            <p className="font-semibold text-4xl text-white text-center mt-4 mb-4">
              {i === 0 ? "⮦ Outbound Flight ⮧" : "⮦ Return Flight ⮧"}
            </p>

            {segs.map((seg: any, j: number) => {
              const dep = formatDateTime(seg.departure.at);
              const arr = formatDateTime(seg.arrival.at);
              const hasNext = j < segs.length - 1;

              return (
                <div key={j}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-lg"
                    style={{ background: "rgba(12, 19, 46, 0.6)" }}
                  >
                    <div className="absolute top-33.5 right-8">
                      <SegmentLogo carrier={seg.carrier} />
                    </div>

                    <FlightacDetails callsign={seg.carrier + seg.flightNumber} />

                    <div className="flex justify-between gap-8">
                      {/* LEFT: Departure / Arrival */}
                      <div className="flex flex-col items-start">
                        <div className="flex items-center">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div>
                            <div className="text-5xl font-bold text-white mt-5 mr-5">{seg.departure.iataCode}</div>
                            <div className="text-md text-gray-300 ml-1">
                              {getAirportName(seg.departure.iataCode)} ({getAirportCity(seg.departure.iataCode)})
                            </div>
                          </div>
                        </div>

                        {/* Vertical flight line */}
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-px h-10 bg-gradient-to-b from-white to-gray-400"></div>
                          <div className="relative transform -translate-x-1 -translate-y-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 text-white my-3" fill="white" viewBox="0 0 20 20" transform="rotate(180)">
                              <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849" />
                            </svg>
                          </div>
                          <div className="w-px h-10 bg-gradient-to-b from-gray-400 to-white"></div>
                        </div>

                        {/* Arrival */}
                        <div className="flex items-center">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="rotate-90 text-green-400">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <div>
                            <div className="text-5xl font-bold text-white mt-5 mr-5">{seg.arrival.iataCode}</div>
                            <div className="text-md text-gray-300 ml-1">
                              {getAirportName(seg.arrival.iataCode)} ({getAirportCity(seg.arrival.iataCode)})
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: Times / Extras */}
                      <div className="flex flex-col text-right flex-1">
                        <div className="mb-8">
                          <div className="text-gray-300 text-sm">{dep.date}</div>
                          <div className="text-2xl font-medium text-green-400">{dep.time}</div>
                          <div className="text-sm text-gray-400 mt-1">{seg.carrier} {seg.flightNumber}</div>
                          <div className="text-sm text-gray-400 font-semibold">{getAircraftName(seg.aircraft)}</div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex justify-end gap-3 mb-2 text-gray-300">
                            <Wifi size={18} />
                            <Plug size={18} />
                            <Tv size={18} />
                            <Armchair size={18} />
                          </div>
                          <div className="text-sm text-gray-400 mb-1">{formatDuration(seg.duration)}</div>
                          <div className="text-2xl font-medium text-green-400">{arr.time}</div>
                          <div className="text-gray-400 text-sm">{arr.date}</div>
                        </div>
                      </div>
                    </div>

                    {/* Layover Info */}
                    {hasNext && (
                      <div className="text-center text-sm text-gray-400 my-4">
                        {calcLayover(seg.arrival.at, segs[j + 1].departure.at)} – {getAirportCity(segs[j + 1].departure.iataCode)} ({segs[j + 1].departure.iataCode})
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Flight Map */}
      <AirportMap airports={airports} routes={routes} />

      {/* Flight Review Video */}
      {videoId ? (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-right">Flight Review Video</h2>
          <p className="text-xs text-gray-700">Disclaimer: Flight review videos are uploaded by third-party creators and reflect their personal experiences and opinions. The content may be subjective and does not necessarily represent the airline or service quality.</p>
          <div className="w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Flight Review Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <p className="mt-12 text-gray-400 text-right">No flight review video found.</p>
      )}
    </div>
  );
}
