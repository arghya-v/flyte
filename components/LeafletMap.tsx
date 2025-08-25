"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-curve";

// --- Custom Icon ---
const airportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/9333/9333912.png",
  iconSize: [35, 35],
  iconAnchor: [18, 35],
  popupAnchor: [0, -30],
});

export default function LeafletMap({
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
  routes?: [string, string][];
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

    // Add markers
    airports.forEach((airport) => {
      L.marker([airport.lat, airport.lon], { icon: airportIcon })
        .addTo(map)
        .bindPopup(`<b>${airport.name}</b><br/>${airport.city}`);
    });

    // Draw arcs
    routes?.forEach(([fromCode, toCode]) => {
      const a = airports.find((ap) => ap.code === fromCode);
      const b = airports.find((ap) => ap.code === toCode);
      if (!a || !b) return;

      const latMid = (a.lat + b.lat) / 2 + 10;
      const lonMid = (a.lon + b.lon) / 2;

      (L as any).curve(
        ["M", [a.lat, a.lon], "Q", [latMid, lonMid], [b.lat, b.lon]],
        { color: "deepskyblue", weight: 2 }
      ).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [airports, routes]);

  return <div id="map" style={{ height: "500px", width: "100%" }} />;
}
