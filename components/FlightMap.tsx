"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const airportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/9333/9333912.png", 
  iconSize: [30, 30], 
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

export default function AirportMap({
  airports,
}: {
  airports: { code: string; name: string; city: string; lat: number; lon: number }[];
}) {
  if (airports.length === 0) return null;

  // center on the first airport
  const center = [airports[0].lat, airports[0].lon] as [number, number];

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 mt-8">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={false}
        className="rounded-2xl"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        />
        {airports.map((a, i) => (
          <Marker key={i} position={[a.lat, a.lon]} icon={airportIcon}>
            <Popup>
              <b>{a.code}</b> – {a.name} ({a.city})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
