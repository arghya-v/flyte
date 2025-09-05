import React, { useEffect } from "react";

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

  function formatDateForSkyscanner(date: string) {
    const [year, month, day] = date.split("-");
    return year.slice(2) + month + day; // e.g., "2025-09-06" -> "250906"
  }

  const skyscannerUrl = `https://www.skyscanner.ca/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${formatDateForSkyscanner(departDate)}${
    returnDate ? `/${formatDateForSkyscanner(returnDate)}` : ""
  }/?adultsv2=${passengers}&childrenv2=&cabinclass=${
    cabinMap[cabin.toLowerCase()] || "economy"
  }&ref=home&rtn=${returnDate ? 1 : 0}&outboundaltsenabled=false&inboundaltsenabled=false&preferdirects=false`;

  useEffect(() => {
    console.log("Kayak URL:", kayakUrl);
    console.log("Skyscanner URL:", skyscannerUrl);
  }, [kayakUrl, skyscannerUrl]);

  return (
    <div className="mt-2 flex flex-col items-center">
      <p className="text-sm text-gray-500 text-center max-w-md mb-4">
        Disclaimer: Flyte is not affiliated with Kayak or Skyscanner. These links are provided
        for convenience only.
      </p>
      {/* Buttons */}
      <div className="flex gap-6 flex-wrap justify-center">
        <a
          href={kayakUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-orange-500 hover:bg-orange-700 text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-lg transition-colors duration-300"
        >
          Book with Kayak
        </a>

        <a
          href={skyscannerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 text-lg rounded-xl shadow-lg transition-colors duration-300"
        >
          Book with Skyscanner
        </a>
      </div>
    </div>
  );
}
