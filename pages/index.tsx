"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/searchbar";
import FlightCard from "@/components/flightcard";
import CurrencySelector from "@/components/currency";
import LoadingSpinner from "@/components/loading"; 
import Header from "@/components/header";
import Link from "next/link";

export default function Home() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [flightType, setFlightType] = useState("One-way");
  const [serviceClass, setServiceClass] = useState("Economy");
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Scroll state for header ---
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const searchFlights = async () => {
    if (!origin || !destination || !date) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setFlights([]);

    try {
      const formattedDate = date.toISOString().split("T")[0];
      const formattedReturnDate =
        returnDate && flightType === "Round-trip"
          ? returnDate.toISOString().split("T")[0]
          : "";

      const query = new URLSearchParams({
        origin,
        destination,
        date: formattedDate,
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
        flightType,
        serviceClass,
      });

      if (formattedReturnDate) {
        query.append("returnDate", formattedReturnDate);
      }

      const res = await fetch(`/api/searchFlights?${query.toString()}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setFlights(data);
      } else {
        setError(data.error || "Unexpected response from server.");
        setFlights([]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch flights.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C041C] text-textPrimary font-inter flex flex-col">
      <CurrencySelector>
        {(currency, rates) => (
          <>
            {/* Animated header */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: showHeader ? 0 : -100 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 w-full bg-[#0C041C] z-50 shadow-md"
            >
              <div className="flex w-full max-w-6xl mx-auto justify-between items-center p-4">
                <Header />
              </div>
            </motion.div>

            {/* Main content */}
            <main className="mt-24 flex-1 flex flex-col items-center p-6">
              <SearchBar
                origin={origin}
                setOrigin={setOrigin}
                destination={destination}
                setDestination={setDestination}
                date={date}
                setDate={setDate}
                returnDate={returnDate}
                setReturnDate={setReturnDate}
                adults={adults}
                setAdults={setAdults}
                children={children}
                setChildren={setChildren}
                infants={infants}
                setInfants={setInfants}
                flightType={flightType}
                setFlightType={setFlightType}
                serviceClass={serviceClass}
                setServiceClass={setServiceClass}
                onSearch={searchFlights}
              />

              {error && <p className="text-red-500 mt-4">{error}</p>}

              <motion.div
                className="mt-10 w-full max-w-4xl space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {flights.map((flight, idx) => (
                  <FlightCard
                    key={idx}
                    flight={flight}
                    currency={currency}
                    rates={rates}
                  />
                ))}
              </motion.div>

              {loading && (
                <div className="mt-10 flex justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </main>
          </>
        )}
      </CurrencySelector>

      {/* Footer stuck at bottom */}
      <footer className="backdrop-blur-md bg-blue-950/5 border-t border-white/10 w-full mt-auto z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Flyte. This project is under the MIT License.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/about" className="hover:text-blue-400 transition">
              About
            </Link>
            <Link href="/search" className="hover:text-blue-400 transition">
              Search Flights
            </Link>
            <Link href="/contact" className="hover:text-blue-400 transition">
              Contact
            </Link>
            <Link href="/donate" className="hover:text-blue-400 transition">
              Donate
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
