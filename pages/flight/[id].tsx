"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Plug, Tv, Armchair, Share2 } from "lucide-react";
import dynamic from "next/dynamic";
import Footer from "@/components/footer";
import { getAirportName, getAirportCity, getAirportCoords } from "@/utils/airportLookup";
import aircraftData from "@/data/aircraft.json";
import FlightacDetails from "@/components/flight&acDetails";
import FlightBookingLinks from "@/components/booking";
import Header from "@/components/header";
const AirportMap = dynamic(() => import("../../components/FlightMap"), { ssr: false });



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

const SegmentLogo = ({ carrier }: { carrier: string }) => {
  const url = `http://img.wway.io/pics/root/${carrier}@png?exar=1&rs=fit:256:256`;
  return <img src={url} alt={carrier} className="h-15 w-24 object-cover z-10 bg-white rounded-md p-2" />;
};

export default function FlightDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // hide header when scrolling down
      } else {
        setShowHeader(true); // show header when scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  const [flight, setFlight] = useState<any | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!id || !flight) return;

    let flightCode = Array.isArray(id) ? id[0] : id;
    const parts = flightCode.split("-");
    if (parts.length >= 2) flightCode = parts[0] + parts[1];

    const airline = flight.validatingAirlineCodes?.[0] || "";
    const serviceClass = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "";
    const prettyClass =
      serviceClass.toLowerCase() === "economy"
        ? "economy"
        : serviceClass
        ? serviceClass.toLowerCase() + " class"
        : "";

    async function fetchVideo() {
      try {
        const res = await fetch(
          `/api/getFlightVideo?flightCode=${encodeURIComponent(flightCode)}&airline=${encodeURIComponent(
            airline
          )}&serviceClass=${encodeURIComponent(prettyClass || "")}`
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

  const firstItinerary = (flight.itineraries ?? [])[0];
  const firstSegs = firstItinerary?.segments ?? [];

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

  return (
    <div className="min-h-screen p-6 text-white" style={{ backgroundColor: "#0E0A27" }}>
      <h1 className="text-xs font-md mb-6 text-center text-right text-white/30">
        Flight ID: {Array.isArray(id) ? id[0] : id}
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        
        {/* LEFT COLUMN: Original Flight Cards */}
        <div className="flex-1 mb-18">
          {(flight.itineraries ?? []).map((itinerary: any, i: number) => {
            const segs = itinerary.segments ?? [];
            return (
              <div key={i} className="mt-8 space-y-6">
                <p className="font-semibold text-4xl text-white text-center mt-4 mb-4">
                  {i === 0 ? "⮦ Outbound Flight ⮧" : "⮦ Return Flight ⮧"}
                </p>
                <motion.div
                initial={{ y: 0 }}
                animate={{ y: showHeader ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 w-full z-50 "
              >
                <div className="flex w-full max-w-6xl mx-auto justify-between items-center p-4">
                  <Header />
                </div>
              </motion.div>
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
                        <div className="absolute md:top-33.5 right-8 top-38 mt-1">
                          <SegmentLogo carrier={seg.carrier} />
                        </div>

                        <FlightacDetails callsign={seg.carrier + seg.flightNumber} />

                        <div className="flex justify-between gap-8">
                          {/* LEFT: Departure / Arrival */}
                          <div className="flex flex-col items-start">
                            <div className="flex items-center">
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
                                  {getAirportName(seg.departure.iataCode)} ({getAirportCity(seg.departure.iataCode)})
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
                            <div className="flex items-center">
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
                              <div className="text-sm text-gray-400 mt-1">
                                {seg.carrier} {seg.flightNumber}
                              </div>
                              <div className="text-xs text-gray-400 font-semibold mb-1 z-10">{getAircraftName(seg.aircraft)}</div>
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
                      </motion.div>

                      {/* Layover Info */}
                      {hasNext && (
                        <div className="text-center text-sm text-gray-400 my-4">
                          {calcLayover(seg.arrival.at, segs[j + 1].departure.at)} –{" "}
                          {getAirportCity(segs[j + 1].departure.iataCode)} ({segs[j + 1].departure.iataCode})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Map + Video + Booking Links */}
        <div className="flex-1 flex flex-col gap-6 mt-10 items-center z-10">
          <div className="h-96 w-full">
            <h1 className="font-semibold text-3xl mb-2">Route Map:</h1>
            <div className="mb-50 mt-3">
              <AirportMap airports={airports} routes={routes} />
            </div>
          </div>

         <div className="mt-40">
  <h2 className="text-2xl font-semibold mb-2">Flight Review Video</h2>
  <p className="text-xs text-gray-400 mb-2">
  Flight review videos are uploaded by third-party creators and reflect their personal experiences and opinions. The content may be subjective and does not necessarily represent the airline or service quality.{" "}
  <a
    href="https://tally.so/r/npQPyy"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 hover:underline transition"
  >
    Report incorrect video
  </a>
</p>
  
  <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg bg-[#0D0F2C] border border-white flex items-center justify-center">
    {videoId ? (
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Flight Review Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <span className="text-gray-400 text-lg font-medium">
        Video access temporarily unavailable
        <p className="text-xs text-gray-400 text-center">(likely due to daily rate limits lol)</p>
      </span>
    )}
  </div>
</div>
          {flight.itineraries?.length > 0 && (
  <div className="mt-10 md:mt-10 mb-20">
    <FlightBookingLinks
      origin={flight.itineraries[0].segments[0].departure.iataCode}
      destination={flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
      departDate={flight.itineraries[0].segments[0].departure.at.split("T")[0]}
      returnDate={
        flight.itineraries.length > 1
          ? flight.itineraries[1].segments[0].departure.at.split("T")[0]
          : undefined
      }
      passengers={flight.travelerPricings?.length || 1}
      cabin={flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "economy"}
    />
  </div>
          )}
        </div>
      </div >
      <div className="mt-50 md:mt-5">
      <Footer/>
      </div>
    </div>
  );
}

