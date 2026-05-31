"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: L.LatLngExpression = [33.6844, 73.0479];
const DEFAULT_ZOOM = 6;

const shopPinIcon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:36px;background:#2E7D32;border:3px solid white;border-radius:50% 50% 50% 4px;box-shadow:0 2px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:18px;transform:rotate(-45deg)"><span style="transform:rotate(45deg)">🔧</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface PickLocationMapProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (lat: number, lng: number) => void;
}

export function PickLocationMap({
  position,
  onPositionChange,
}: PickLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPositionChange);
  onPickRef.current = onPositionChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      DEFAULT_CENTER,
      DEFAULT_ZOOM
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e) => {
      onPickRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!position) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const pos: L.LatLngExpression = [position.lat, position.lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
    } else {
      markerRef.current = L.marker(pos, {
        icon: shopPinIcon,
        draggable: true,
        zIndexOffset: 1000,
      }).addTo(map);

      markerRef.current.on("dragend", () => {
        const ll = markerRef.current?.getLatLng();
        if (ll) onPickRef.current(ll.lat, ll.lng);
      });
    }

    map.flyTo(pos, Math.max(map.getZoom(), 14), { animate: true, duration: 0.6 });
  }, [position?.lat, position?.lng]);

  return (
    <div
      ref={containerRef}
      className="h-[240px] w-full overflow-hidden rounded-lg border-2 border-[#BBDEFB] bg-[#E8EEF5]"
    />
  );
}
