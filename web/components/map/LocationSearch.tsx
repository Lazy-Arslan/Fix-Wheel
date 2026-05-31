"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaceSuggestion } from "@/lib/types";

interface LocationSearchProps {
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  onGpsClick?: () => void;
  gpsAvailable?: boolean;
}

export function LocationSearch({
  onPlaceSelect,
  placeholder = "Where do you need service?",
  onGpsClick,
  gpsAvailable = true,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (s: PlaceSuggestion) => {
    setQuery(s.description);
    setOpen(false);
    setFocused(false);
    setSuggestions([]);
    if (s.lat != null && s.lng != null) {
      onPlaceSelect(s.lat, s.lng, s.description);
    }
  };

  return (
    <div ref={wrapperRef} className="map-search-wrap">
      <div className={`map-search-bar ${focused ? "focused" : ""}`}>
        <span className="map-search-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          className="map-search-input"
          autoComplete="off"
          aria-label="Search location"
        />
        {loading && <span className="map-search-spinner" aria-label="Searching" />}
        {onGpsClick && (
          <button
            type="button"
            onClick={onGpsClick}
            disabled={!gpsAvailable}
            className="map-search-gps"
            aria-label="Use my location"
            title="Use GPS"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="map-search-dropdown app-fade-in">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                className="map-search-result"
                onClick={() => selectSuggestion(s)}
              >
                <span className="map-search-result-pin">📍</span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-semibold text-[var(--gm-text)]">
                    {s.mainText}
                  </span>
                  {s.secondaryText && (
                    <span className="block truncate text-xs text-[var(--gm-text-muted)]">
                      {s.secondaryText}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div className="map-search-dropdown map-search-empty app-fade-in">
          No results — try another area or tap the map.
        </div>
      )}
    </div>
  );
}
