import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { callsign: string } }
) {
  const callsign = params.callsign.toUpperCase().trim();

  try {
    // Step 1: Fetch flight route from ADSBdb
    const routeRes = await fetch(
      `https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`,
      { headers: { "User-Agent": "your-app/1.0" }, cache: "no-store" }
    );

    let flightRoute = null;
    if (routeRes.ok) {
      const routeData = await routeRes.json();
      flightRoute = routeData.response?.flightroute ?? null;
    }

    // Step 2: Determine ICAO24 / registration
    let aircraft = null;
    let reg = flightRoute?.aircraft?.registration;
    let icao24 = flightRoute?.aircraft?.icao24 || flightRoute?.aircraft?.mode_s;

    // Step 3: If both missing, fetch ICAO24 from OpenSky
    if (!reg && !icao24) {
      const openskyRes = await fetch(
        `https://opensky-network.org/api/states/all?callsign=${encodeURIComponent(callsign)}`,
        { cache: "no-store" }
      );

      if (openskyRes.ok) {
        const openskyData = await openskyRes.json();
        const state = openskyData.states?.[0] || null;
        if (state) {
          icao24 = state[0]; // first element is ICAO24
        }
      }
    }

    // Step 4: Fetch aircraft info from ADSBdb if we have an ID
    const id = (reg || icao24)?.toUpperCase();
    if (id) {
      const acRes = await fetch(
        `https://api.adsbdb.com/v0/aircraft/${encodeURIComponent(id)}?callsign=${encodeURIComponent(callsign)}`,
        { headers: { "User-Agent": "your-app/1.0" }, cache: "no-store" }
      );
      if (acRes.ok) {
        const acData = await acRes.json();
        aircraft = acData.response?.aircraft ?? null;
        if (aircraft) {
          aircraft.url_photo =
            aircraft.url_photo || "https://via.placeholder.com/300x200?text=No+Image";
          aircraft.url_photo_thumbnail =
            aircraft.url_photo_thumbnail || "https://via.placeholder.com/150x100?text=No+Image";
        }
      }
    }

    return NextResponse.json(
      { ok: true, flightRoute, aircraft },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
