import airports from "@/data/airports.json";

type Airport = {
  icao: string;
  iata?: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  elevation?: number;
  lat?: number;
  lon?: number;
  tz?: string;
};

// airports is Record<string, Airport>
const airportMap: Record<string, Airport> = airports as Record<string, Airport>;

// Build a map by IATA (for quick lookup)
const airportByIATA: Record<string, Airport> = Object.values(airportMap).reduce(
  (acc, airport) => {
    if (airport.iata) {
      acc[airport.iata] = airport;
    }
    return acc;
  },
  {} as Record<string, Airport>
);

export function getAirportName(iata: string) {
  return airportByIATA[iata]?.name || iata;
}

export function getAirportCity(iata: string) {
  return airportByIATA[iata]?.city || "";
}

export function getAirportCoords(iata: string) {
  const airport = airportByIATA[iata];
  return airport && airport.lat && airport.lon
    ? { lat: airport.lat, lon: airport.lon }
    : { lat: 0, lon: 0 };
}
