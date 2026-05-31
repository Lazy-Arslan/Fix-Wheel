import { NextResponse } from "next/server";
import { getMechanicsNearby } from "@/lib/data-store";
import { RADIUS_KM } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "0");
    const lng = parseFloat(searchParams.get("lng") ?? "0");
    const radius = parseFloat(searchParams.get("radius") ?? String(RADIUS_KM));

    if (lat === 0 && lng === 0) {
      return NextResponse.json(
        { error: "Location not available" },
        { status: 400 }
      );
    }

    const mechanics = await getMechanicsNearby(lat, lng, radius);
    return NextResponse.json({ mechanics });
  } catch (error) {
    console.error("mechanics/nearby:", error);
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }
}
