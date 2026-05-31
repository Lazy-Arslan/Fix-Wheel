"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { LocationSearch } from "@/components/map/LocationSearch";

const PickLocationMap = dynamic(
  () =>
    import("@/components/map/PickLocationMap").then((m) => m.PickLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[240px] items-center justify-center rounded-lg bg-[#E8EEF5] text-sm text-[#666]">
        Loading map…
      </div>
    ),
  }
);

export interface ShopLocationValue {
  lat: number;
  lng: number;
  address: string;
  confirmed: boolean;
}

interface ShopLocationPickerProps {
  value: ShopLocationValue;
  onChange: (value: ShopLocationValue) => void;
  error?: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `/api/osm/reverse-geocode?lat=${lat}&lng=${lng}`
    );
    const data = await res.json();
    return data.address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function ShopLocationPicker({
  value,
  onChange,
  error,
}: ShopLocationPickerProps) {
  const [resolving, setResolving] = useState(false);

  const setDraft = useCallback(
    async (lat: number, lng: number, address?: string) => {
      setResolving(true);
      try {
        const resolved =
          address ?? (await reverseGeocode(lat, lng));
        onChange({ lat, lng, address: resolved, confirmed: false });
      } finally {
        setResolving(false);
      }
    },
    [onChange]
  );

  const position =
    value.lat !== 0 || value.lng !== 0
      ? { lat: value.lat, lng: value.lng }
      : null;

  const confirmLocation = () => {
    if (!position) return;
    onChange({ ...value, confirmed: true });
  };

  const resetLocation = () => {
    onChange({ lat: 0, lng: 0, address: "", confirmed: false });
  };

  return (
    <div className="mb-4 rounded-xl border-2 border-[#BBDEFB] bg-[#F5F9FF] p-4">
      <label className="mb-1 block text-sm font-bold text-[#003366]">
        Shop location *
      </label>
      <p className="mb-3 text-xs text-[#666]">
        Search for your city or area (e.g. Taxila), or tap the map to place your
        shop pin, then confirm.
      </p>

      <LocationSearch
        placeholder="Search city, area, or landmark in Pakistan…"
        onPlaceSelect={(lat, lng, address) => setDraft(lat, lng, address)}
      />

      <p className="mt-2 text-[11px] text-[#888]">
        No match? Tap the map below to set your shop exactly.
      </p>

      <div className="mt-3">
        <PickLocationMap
          position={position}
          onPositionChange={(lat, lng) => setDraft(lat, lng)}
        />
      </div>

      {position && (
        <div
          className={`mt-3 rounded-lg px-3 py-2.5 text-sm ${
            value.confirmed
              ? "bg-[#E8F5E9] text-[#1B5E20] ring-1 ring-[#A5D6A7]"
              : "bg-white text-[#444] ring-1 ring-[#E0E0E0]"
          }`}
        >
          {resolving ? (
            <span className="text-[#666]">Resolving address…</span>
          ) : (
            <>
              {value.confirmed && (
                <span className="mr-1.5 font-bold text-[#2E7D32]">✓</span>
              )}
              <span className="font-medium">
                {value.confirmed ? "Confirmed: " : "Selected: "}
              </span>
              {value.address}
            </>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {!value.confirmed ? (
          <button
            type="button"
            disabled={!position || resolving}
            onClick={confirmLocation}
            className="flex-1 cursor-pointer rounded-lg bg-[#2E7D32] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm shop location
          </button>
        ) : (
          <button
            type="button"
            onClick={resetLocation}
            className="flex-1 cursor-pointer rounded-lg border-2 border-[#003D82] py-2.5 text-sm font-bold text-[#003D82] hover:bg-[#E3F2FD]"
          >
            Change location
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
