import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/osm-places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input") ?? "";
  const suggestions = await searchPlaces(input);
  return NextResponse.json({ suggestions });
}
