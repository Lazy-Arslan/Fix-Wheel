import { NextResponse } from "next/server";
import { getAllMechanicsForMap } from "@/lib/data-store";
import { MAP_HIGHLIGHT_RADIUS_KM, RADIUS_KM } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "0");
    const lng = parseFloat(searchParams.get("lng") ?? "0");
    const radius = parseFloat(
      searchParams.get("radius") ??
        String(Math.max(RADIUS_KM, MAP_HIGHLIGHT_RADIUS_KM))
    );

    if (lat === 0 && lng === 0) {
      return NextResponse.json(
        { error: "Location not available" },
        { status: 400 }
      );
    }

    const mechanics = await getAllMechanicsForMap(lat, lng, radius);
    return NextResponse.json({ mechanics });
  } catch (error) {
    console.error("mechanics/map:", error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}
