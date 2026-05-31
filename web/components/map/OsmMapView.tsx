"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MechanicProfile } from "@/lib/types";
import { MAP_HIGHLIGHT_RADIUS_KM } from "@/lib/constants";
import {
  mechanicMarkerAnchor,
  mechanicMarkerHtml,
  mechanicMarkerSize,
} from "@/lib/map-icons";
import type { MapFocusMode } from "@/components/map/MapLayerToggle";

const serviceIconYou = L.divIcon({
  className: "",
  html: `<div class="customer-pin-you" style="width:32px;height:32px;background:#007BFF;border:4px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(0,123,255,.35),0 2px 10px rgba(0,0,0,.35)"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const serviceIconDefault = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#007BFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const gpsIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#9E9E9E;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function makeMechanicIcon(booked: boolean, dimmed: boolean) {
  const size = mechanicMarkerSize(booked);
  return L.divIcon({
    className: dimmed ? "mechanic-marker-dimmed" : "",
    html: mechanicMarkerHtml(booked, dimmed),
    iconSize: [size, size],
    iconAnchor: mechanicMarkerAnchor(booked),
  });
}

export interface BookedMechanicPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface OsmMapViewProps {
  serviceLocation: { lat: number; lng: number } | null;
  gpsLocation?: { lat: number; lng: number } | null;
  mechanics: MechanicProfile[];
  highlightRadiusKm?: number;
  bookedMechanicId?: string | null;
  bookedMechanic?: BookedMechanicPin | null;
  focusMode?: MapFocusMode;
  onServiceLocationChange: (lat: number, lng: number) => void;
  onMechanicSelect: (mechanic: MechanicProfile) => void;
}

const CIRCLE_STYLES: Record<
  MapFocusMode,
  { color: string; fillColor: string; fillOpacity: number; weight: number }
> = {
  you: {
    color: "#007BFF",
    fillColor: "#007BFF",
    fillOpacity: 0.18,
    weight: 3,
  },
  mechanics: {
    color: "#FFC107",
    fillColor: "#FFD54F",
    fillOpacity: 0.14,
    weight: 2,
  },
  booked: {
    color: "#2E7D32",
    fillColor: "#66BB6A",
    fillOpacity: 0.12,
    weight: 2,
  },
};

export function OsmMapView({
  serviceLocation,
  gpsLocation,
  mechanics,
  highlightRadiusKm = MAP_HIGHLIGHT_RADIUS_KM,
  bookedMechanicId = null,
  bookedMechanic = null,
  focusMode = "you",
  onServiceLocationChange,
  onMechanicSelect,
}: OsmMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const serviceMarkerRef = useRef<L.Marker | null>(null);
  const gpsMarkerRef = useRef<L.Marker | null>(null);
  const mechanicMarkersRef = useRef<L.Marker[]>([]);
  const onSelectRef = useRef(onMechanicSelect);
  const onLocationRef = useRef(onServiceLocationChange);
  onSelectRef.current = onMechanicSelect;
  onLocationRef.current = onServiceLocationChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      [33.6844, 73.0479],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e) => {
      onLocationRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      circleRef.current = null;
      serviceMarkerRef.current = null;
      gpsMarkerRef.current = null;
      mechanicMarkersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !serviceLocation) return;

    const pos: L.LatLngExpression = [serviceLocation.lat, serviceLocation.lng];
    const circleStyle = CIRCLE_STYLES[focusMode];

    if (circleRef.current) {
      circleRef.current.setLatLng(pos);
      circleRef.current.setRadius(highlightRadiusKm * 1000);
      circleRef.current.setStyle(circleStyle);
    } else {
      circleRef.current = L.circle(pos, {
        radius: highlightRadiusKm * 1000,
        ...circleStyle,
        opacity: 0.55,
      }).addTo(map);
    }

    const icon = focusMode === "you" ? serviceIconYou : serviceIconDefault;

    if (serviceMarkerRef.current) {
      serviceMarkerRef.current.setLatLng(pos);
      serviceMarkerRef.current.setIcon(icon);
      serviceMarkerRef.current.setZIndexOffset(focusMode === "you" ? 1500 : 1000);
    } else {
      serviceMarkerRef.current = L.marker(pos, {
        icon,
        draggable: true,
        zIndexOffset: focusMode === "you" ? 1500 : 1000,
      })
        .addTo(map)
        .bindTooltip("Your service location", { permanent: false });

      serviceMarkerRef.current.on("dragend", () => {
        const ll = serviceMarkerRef.current?.getLatLng();
        if (ll) onLocationRef.current(ll.lat, ll.lng);
      });
    }

  }, [serviceLocation, highlightRadiusKm, focusMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (gpsMarkerRef.current) {
      map.removeLayer(gpsMarkerRef.current);
      gpsMarkerRef.current = null;
    }

    if (gpsLocation) {
      const same =
        serviceLocation &&
        Math.abs(gpsLocation.lat - serviceLocation.lat) < 0.0001 &&
        Math.abs(gpsLocation.lng - serviceLocation.lng) < 0.0001;

      if (!same) {
        gpsMarkerRef.current = L.marker([gpsLocation.lat, gpsLocation.lng], {
          icon: gpsIcon,
          zIndexOffset: 500,
        })
          .addTo(map)
          .bindTooltip("Your current GPS", { permanent: false });
      }
    }
  }, [gpsLocation, serviceLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    mechanicMarkersRef.current.forEach((m) => map.removeLayer(m));
    mechanicMarkersRef.current = [];

    const bookedId = bookedMechanicId ?? bookedMechanic?.id ?? null;
    const inList = bookedId ? mechanics.some((m) => m.id === bookedId) : false;

    const list: MechanicProfile[] = [...mechanics];
    if (bookedMechanic && bookedId && !inList && bookedMechanic.lat !== 0) {
      list.push({
        id: bookedMechanic.id,
        name: bookedMechanic.name,
        shopName: bookedMechanic.name,
        email: "",
        phone: "",
        city: "",
        license: "",
        specialization: "",
        experience: "",
        address: "",
        lat: bookedMechanic.lat,
        lng: bookedMechanic.lng,
        distanceKm: 0,
        distance: "",
        rating: 0,
        specialty: "",
      });
    }

    list.forEach((mechanic) => {
      const isBooked = !!(bookedId && mechanic.id === bookedId);
      const dimmed =
        focusMode === "booked" ? !isBooked : focusMode === "you";

      const marker = L.marker([mechanic.lat, mechanic.lng], {
        icon: makeMechanicIcon(isBooked, dimmed),
        zIndexOffset: isBooked ? 2500 : dimmed ? 100 : 500,
      }).addTo(map);

      if (isBooked && focusMode === "booked") {
        marker.bindTooltip(mechanic.name, {
          permanent: true,
          direction: "top",
          offset: [0, -mechanicMarkerSize(true) - 4],
          className: "booked-mechanic-tag",
        });
      } else if (!dimmed && focusMode === "mechanics") {
        marker.bindTooltip(mechanic.shopName, { permanent: false });
      }

      marker.on("click", () => onSelectRef.current(mechanic));
      mechanicMarkersRef.current.push(marker);
    });
  }, [mechanics, bookedMechanicId, bookedMechanic, focusMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (focusMode === "you" && serviceLocation) {
      map.flyTo([serviceLocation.lat, serviceLocation.lng], 15, {
        animate: true,
        duration: 0.7,
      });
      return;
    }

    if (focusMode === "mechanics") {
      const points: L.LatLngExpression[] = [];
      if (serviceLocation) {
        points.push([serviceLocation.lat, serviceLocation.lng]);
      }
      mechanics.forEach((m) => {
        if (m.lat !== 0 || m.lng !== 0) points.push([m.lat, m.lng]);
      });
      if (points.length > 0) {
        map.flyToBounds(L.latLngBounds(points).pad(0.18), {
          animate: true,
          duration: 0.8,
          maxZoom: 15,
        });
      }
      return;
    }

    if (focusMode === "booked" && bookedMechanic) {
      const points: L.LatLngExpression[] = [
        [bookedMechanic.lat, bookedMechanic.lng],
      ];
      if (serviceLocation) {
        points.push([serviceLocation.lat, serviceLocation.lng]);
      }
      map.flyToBounds(L.latLngBounds(points).pad(0.25), {
        animate: true,
        duration: 0.8,
        maxZoom: 16,
      });
    }
  }, [focusMode, serviceLocation, mechanics, bookedMechanic]);

  return <div ref={containerRef} className="h-full w-full z-0" />;
}
