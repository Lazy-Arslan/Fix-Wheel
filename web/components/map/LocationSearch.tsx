"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaceSuggestion } from "@/lib/types";

interface LocationSearchProps {
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
}

export function LocationSearch({
  onPlaceSelect,
  placeholder = "Search home, area, or landmark…",
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/osm/search?input=${encodeURIComponent(input)}`
      );
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (s: PlaceSuggestion) => {
    setQuery(s.description);
    setOpen(false);
    setSuggestions([]);
    if (s.lat != null && s.lng != null) {
      onPlaceSelect(s.lat, s.lng, s.description);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex h-12 items-center rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] px-3">
        <span className="mr-1.5 text-base">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none"
          autoComplete="off"
        />
        {loading && <span className="text-xs text-[#999]">…</span>}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-[#E0E0E0] bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                className="w-full cursor-pointer border-b border-[#F0F0F0] px-3 py-2.5 text-left last:border-0 hover:bg-[#E3F2FD]"
                onClick={() => selectSuggestion(s)}
              >
                <p className="text-sm font-medium text-[#222]">{s.mainText}</p>
                {s.secondaryText && (
                  <p className="truncate text-xs text-[#888]">{s.secondaryText}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-white p-3 text-xs text-[#888] shadow-lg">
          No results. Try another spelling or tap the map to set location.
        </div>
      )}
    </div>
  );
}
