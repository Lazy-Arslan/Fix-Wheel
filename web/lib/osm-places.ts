import type { LocalShop, PlaceSuggestion } from "@/lib/types";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const USER_AGENT = "FixWheelApp/1.0 (vehicle service platform)";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 2) return [];

  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", query.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "pk");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as Array<{
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    name?: string;
    address?: Record<string, string>;
  }>;

  return data.map((item) => {
    const addr = item.address;
    const secondary = addr
      ? [addr.city, addr.state, addr.country].filter(Boolean).join(", ")
      : "";
    return {
      placeId: String(item.place_id),
      description: item.display_name,
      mainText: item.name ?? item.display_name.split(",")[0],
      secondaryText: secondary || item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
  });
}

export async function reverseGeocodeOsm(
  lat: number,
  lng: number
): Promise<string> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export async function fetchNearbyLocalShopsOsm(
  lat: number,
  lng: number,
  radiusMeters: number
): Promise<LocalShop[]> {
  const radius = Math.min(radiusMeters, 10000);
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="car_repair"](around:${radius},${lat},${lng});
      node["amenity"="car_repair"](around:${radius},${lat},${lng});
      way["shop"="car_repair"](around:${radius},${lat},${lng});
      way["amenity"="car_repair"](around:${radius},${lat},${lng});
    );
    out center 12;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as {
    elements?: Array<{
      id: number;
      type: string;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: { name?: string; phone?: string; "addr:street"?: string; "addr:city"?: string };
    }>;
  };

  const shops: LocalShop[] = [];
  const seen = new Set<string>();

  for (const el of data.elements ?? []) {
    const pLat = el.lat ?? el.center?.lat;
    const pLng = el.lon ?? el.center?.lon;
    if (pLat == null || pLng == null) continue;

    const name = el.tags?.name ?? "Auto repair shop";
    const key = `${name}-${pLat.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const distKm = haversineKm(lat, lng, pLat, pLng);
    const street = el.tags?.["addr:street"] ?? "";
    const city = el.tags?.["addr:city"] ?? "";
    const address = [street, city].filter(Boolean).join(", ") || "Address not listed";

    shops.push({
      placeId: `osm-${el.type}-${el.id}`,
      name,
      address,
      lat: pLat,
      lng: pLng,
      phone: el.tags?.phone,
      distanceKm: distKm,
      distance: `${distKm.toFixed(1)} km away`,
    });
  }

  shops.sort((a, b) => a.distanceKm - b.distanceKm);
  return shops.slice(0, 8);
}
