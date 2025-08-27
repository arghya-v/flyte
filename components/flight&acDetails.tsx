"use client";
import { useEffect } from "react";

export default function FlightacDetails({ callsign }: { callsign: string }) {
  useEffect(() => {
    async function run() {
      try {
        // Step 1: Fetch flight route by callsign
        const routeRes = await fetch(
          `https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`,
          { cache: "no-store" }
        );

        if (!routeRes.ok) {
          console.error(`❌ Callsign lookup failed: ${routeRes.statusText}`);
          return;
        }

        const routeData = await routeRes.json();
        const flightRoute = routeData.response?.flightroute;

        if (!flightRoute) {
          console.log(`⚠️ No flight route found for ${callsign}`, routeData);
          return;
        }

        console.log("✅ Flight route:", flightRoute);

        // Step 2: Determine registration or ICAO24/mode_s
        let reg = flightRoute.aircraft?.registration;
        let icao24 = flightRoute.aircraft?.icao24 || flightRoute.aircraft?.mode_s;

        // Step 3: If neither exists, use OpenSky to get ICAO24
        if (!reg && !icao24) {
          const openskyRes = await fetch(
            `https://opensky-network.org/api/states/all?callsign=${encodeURIComponent(callsign)}`,
            { cache: "no-store" }
          );
          if (openskyRes.ok) {
            const openskyData = await openskyRes.json();
            // Find the exact callsign match, trimmed
            const state = openskyData.states?.find(
              (s: any[]) => s[1]?.trim() === callsign
            );
            if (state) {
              icao24 = state[0].toUpperCase(); // first element is ICAO24
              console.log("🌐 OpenSky ICAO24 fallback:", icao24);
            }
          }
        }

        // Step 4: Fetch aircraft info from ADSBdb using registration or ICAO24
        const id = (reg || icao24)?.toUpperCase();
        if (id) {
          const acRes = await fetch(
            `https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(id)}`,
            { cache: "no-store" }
          );

          if (acRes.ok) {
            const acData = await acRes.json();
            const aircraft = acData.response?.aircraft ?? null;

            if (aircraft) {
              // Ensure photo URLs are present
              aircraft.url_photo =
                aircraft.url_photo || "https://via.placeholder.com/300x200?text=No+Image";
              aircraft.url_photo_thumbnail =
                aircraft.url_photo_thumbnail || "https://via.placeholder.com/150x100?text=No+Image";
            }

            console.log("🛩️ Aircraft details:", aircraft);
          } else {
            console.warn(`⚠️ Aircraft lookup failed for ${id}`);
          }
        } else {
          console.log("ℹ️ No registration/ICAO24 available for aircraft lookup");
        }
      } catch (e) {
        console.error("Error fetching flight data:", e);
      }
    }

    run();
  }, [callsign]);

  return (
    <p></p>
  );
}
