"use client";

import { useEffect, useRef } from "react";
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
  airports?: { code: string; name: string; city: string; lat: number; lon: number }[];
  routes?: { from: string; to: string; itineraryIndex: number }[];
}) {
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize map ONCE
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20, 0], 2); // default view

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }
  }, []);

  // Update markers & routes when data changes
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    // Clear previous layers
    layerGroup.clearLayers();

    if (airports.length > 0) {
      map.setView([airports[0].lat, airports[0].lon], 3);
    }

    // Add airport markers
    airports.forEach((airport) => {
      L.marker([airport.lat, airport.lon], { icon: airportIcon })
        .bindPopup(`<b>${airport.name}</b><br/>${airport.city}`)
        .addTo(layerGroup);
    });

    // Draw flight arcs
    routes?.forEach(({ from, to, itineraryIndex }) => {
      const a = airports.find((ap) => ap.code === from);
      const b = airports.find((ap) => ap.code === to);
      if (!a || !b) return;

      const latMid = (a.lat + b.lat) / 2 + 10;
      const lonMid = (a.lon + b.lon) / 2;
      const lineColor = itineraryIndex === 0 ? "limegreen" : "deepskyblue";

      (L as any).curve(
        ["M", [a.lat, a.lon], "Q", [latMid, lonMid], [b.lat, b.lon]],
        { color: lineColor, weight: 2 }
      ).addTo(layerGroup);
    });
  }, [airports, routes]);

  return <div id="map" style={{ height: "450px", width: "100%", borderRadius: "20px", overflow: "hidden" }} />;
}
