import { NextResponse } from "next/server";
import { reverseGeocodeOsm } from "@/lib/osm-places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");
  const address = await reverseGeocodeOsm(lat, lng);
  return NextResponse.json({ address });
}
