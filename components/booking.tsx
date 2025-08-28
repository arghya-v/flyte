import React from "react";
import { useEffect } from "react";
type BookingProps = {
  origin: string;
  destination: string;
  departDate: string; // in YYYY-MM-DD format
  returnDate?: string; // optional, for round trips
  passengers?: number;
  cabin?: string; // economy, business, first
};

export default function FlightBookingLinks({
  origin,
  destination,
  departDate,
  returnDate,
  passengers = 1,
  cabin = "economy",
}: BookingProps) {
  // Kayak URL
const kayakUrl =
  returnDate && returnDate.trim() !== ""
    ? `https://www.kayak.com/flights/${origin}-${destination}/${departDate}/${returnDate}?sort=bestflight_a`
    : `https://www.kayak.com/flights/${origin}-${destination}/${departDate}?fs=fdDir%3Dfalse&ucs=1k37tp8&sort=bestflight_a`;



  // Skyscanner URL
  const cabinMap: Record<string, string> = {
    economy: "economy",
    business: "business",
    first: "first",
  };
  const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${origin}/${destination}/${departDate}${
    returnDate ? `/${returnDate}` : ""
  }/?adults=${passengers}&cabinclass=${cabinMap[cabin.toLowerCase()] || "economy"}`;

 useEffect(() => {
    console.log("Kayak URL:", kayakUrl);
    console.log("Skyscanner URL:", skyscannerUrl);
  }, [kayakUrl, skyscannerUrl]);
  return (
    <div className="mt-8 flex gap-4 justify-center">
      <a
        href={kayakUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-orange-500 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-colors duration-300 flex items-center gap-2"
      >
        Book with Kayak
      </a>

      <a
        href={skyscannerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-colors duration-300 flex items-center gap-2"
      >
        Book with Skyscanner
      </a>
    </div>
  );
}
