"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { mechanicMarkerAnchor, mechanicMarkerHtml, mechanicMarkerSize } from "@/lib/map-icons";

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#E53935;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const mechanicShopIcon = (() => {
  const size = mechanicMarkerSize(false);
  return L.divIcon({
    className: "",
    html: mechanicMarkerHtml(false),
    iconSize: [size, size],
    iconAnchor: mechanicMarkerAnchor(false),
  });
})();

interface CustomerLocationMapProps {
  customerLat: number;
  customerLng: number;
  mechanicLat?: number;
  mechanicLng?: number;
  height?: string;
}

export function CustomerLocationMap({
  customerLat,
  customerLng,
  mechanicLat = 0,
  mechanicLng = 0,
  height = "220px",
}: CustomerLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (customerLat === 0 && customerLng === 0) return;

    const map = L.map(containerRef.current).setView(
      [customerLat, customerLng],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    L.marker([customerLat, customerLng], { icon: customerIcon })
      .addTo(map)
      .bindTooltip("Customer location", { permanent: false });

    if (mechanicLat !== 0 || mechanicLng !== 0) {
      L.marker([mechanicLat, mechanicLng], { icon: mechanicShopIcon })
        .addTo(map)
        .bindTooltip("Your shop", { permanent: false });

      const bounds = L.latLngBounds(
        [customerLat, customerLng],
        [mechanicLat, mechanicLng]
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [customerLat, customerLng, mechanicLat, mechanicLng]);

  if (customerLat === 0 && customerLng === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-[#E8EEF5] text-sm text-[#666]"
        style={{ height }}
      >
        Customer location not available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-lg border border-[#E0E0E0]"
      style={{ height }}
    />
  );
}
