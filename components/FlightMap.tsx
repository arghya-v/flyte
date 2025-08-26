"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-curve";

// --- Custom Icon ---
const airportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/9333/9333912.png",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -30],
});

export default function FlightMap({
  airports = [],
  routes = [],
}: {
  airports?: {
    code: string;
    name: string;
    city: string;
    lat: number;
    lon: number;
  }[];
  routes?: {
    from: string;
    to: string;
    itineraryIndex: number;
  }[];
}) {
  useEffect(() => {
    if (!airports || airports.length === 0) return;

    const map = L.map("map").setView([airports[0].lat, airports[0].lon], 3);

    // --- Carto Dark basemap ---
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    // Add airport markers
    airports.forEach((airport) => {
      L.marker([airport.lat, airport.lon], { icon: airportIcon })
        .addTo(map)
        .bindPopup(`<b>${airport.name}</b><br/>${airport.city}`);
    });

    // Draw flight arcs, color by itineraryIndex
    routes?.forEach(({ from, to, itineraryIndex }) => {
      const a = airports.find((ap) => ap.code === from);
      const b = airports.find((ap) => ap.code === to);
      if (!a || !b) return;

      const latMid = (a.lat + b.lat) / 2 + 10; // lift the curve
      const lonMid = (a.lon + b.lon) / 2;

      const lineColor = itineraryIndex === 0 ? "limegreen" : "deepskyblue";

      (L as any).curve(
        ["M", [a.lat, a.lon], "Q", [latMid, lonMid], [b.lat, b.lon]],
        { color: lineColor, weight: 2 }
      ).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [airports, routes]);

  return <div id="map" style={{ height: "500px", width: "100%", borderRadius: "20px", overflow: 'hidden' }} />;
}
