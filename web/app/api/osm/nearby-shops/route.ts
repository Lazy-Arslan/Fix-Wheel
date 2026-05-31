import { NextResponse } from "next/server";
import { fetchNearbyLocalShopsOsm } from "@/lib/osm-places";
import { MAP_HIGHLIGHT_RADIUS_KM } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");

  if (lat === 0 && lng === 0) {
    return NextResponse.json({ error: "Location required" }, { status: 400 });
  }

  const shops = await fetchNearbyLocalShopsOsm(
    lat,
    lng,
    MAP_HIGHLIGHT_RADIUS_KM * 1000
  );

  return NextResponse.json({ shops });
}
