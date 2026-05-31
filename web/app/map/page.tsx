"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BookingNotice } from "@/components/booking/BookingNotice";
import { CustomerActiveBooking } from "@/components/booking/CustomerActiveBooking";
import { LocationSearch } from "@/components/map/LocationSearch";
import { MechanicInfoPanel } from "@/components/map/MechanicInfoPanel";
import {
  MapLayerToggle,
  type MapFocusMode,
} from "@/components/map/MapLayerToggle";
import { useCustomerBooking } from "@/hooks/useCustomerBooking";
import type { MechanicProfile } from "@/lib/types";
import { MAP_HIGHLIGHT_RADIUS_KM } from "@/lib/constants";

const OsmMapView = dynamic(
  () => import("@/components/map/OsmMapView").then((m) => m.OsmMapView),
  { ssr: false, loading: () => <div className="app-map-loading" /> }
);

export default function MapPage() {
  const router = useRouter();
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [serviceLocation, setServiceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationText, setLocationText] = useState("Search or tap map to set where you need service");
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<MechanicProfile | null>(null);
  const [mapFocus, setMapFocus] = useState<MapFocusMode>("you");

  const {
    booking,
    hasActiveBooking,
    showNotice,
    setShowNotice,
    counterPrice,
    setCounterPrice,
    showCounterInput,
    setShowCounterInput,
    actionLoading,
    completeService,
    bookingAction,
    cancelBooking,
  } = useCustomerBooking({ poll: true });

  const updateAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/osm/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      setLocationText(data.address ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch {
      setLocationText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const loadMechanics = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `/api/mechanics/map?lat=${lat}&lng=${lng}&radius=${MAP_HIGHLIGHT_RADIUS_KM}`
      );
      const data = await res.json();
      setMechanics(data.mechanics ?? []);
    } catch {
      setMechanics([]);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGpsLocation(loc);
        setServiceLocation((prev) => {
          if (!prev) {
            updateAddress(loc.lat, loc.lng);
            return loc;
          }
          return prev;
        });
      },
      () => setLocationText("GPS unavailable — search for your home or tap the map")
    );
  }, []);

  useEffect(() => {
    if (!booking) return;
    const loc = { lat: booking.customerLat, lng: booking.customerLng };
    setServiceLocation(loc);
    updateAddress(loc.lat, loc.lng);
    loadMechanics(loc.lat, loc.lng);
    setMapFocus("booked");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  const setServiceAt = useCallback(
    async (lat: number, lng: number, address?: string) => {
      if (hasActiveBooking) return;
      setServiceLocation({ lat, lng });
      setSelectedMechanic(null);
      if (address) setLocationText(address);
      else await updateAddress(lat, lng);
      sessionStorage.setItem("fixwheel_last_lat", String(lat));
      sessionStorage.setItem("fixwheel_last_lng", String(lng));
      await loadMechanics(lat, lng);
    },
    [loadMechanics, hasActiveBooking]
  );

  useEffect(() => {
    if (serviceLocation && !hasActiveBooking) {
      loadMechanics(serviceLocation.lat, serviceLocation.lng);
    }
  }, [serviceLocation, loadMechanics, hasActiveBooking]);

  const confirmLocation = () => {
    if (hasActiveBooking) return;
    if (!serviceLocation) {
      alert("Please select where you need service (search or tap the map)");
      return;
    }
    sessionStorage.setItem("fixwheel_last_lat", String(serviceLocation.lat));
    sessionStorage.setItem("fixwheel_last_lng", String(serviceLocation.lng));
    router.push(`/services?lat=${serviceLocation.lat}&lng=${serviceLocation.lng}`);
  };

  const useGps = () => {
    if (!gpsLocation) {
      alert("GPS not available.");
      return;
    }
    setServiceAt(gpsLocation.lat, gpsLocation.lng);
  };

  return (
    <AppShell
      role="customer"
      activeNav="map"
      title="Where do you need service?"
      subtitle="Pin location on the map"
      fullHeight
      headerExtra={
        !hasActiveBooking ? (
          <div className="app-map-search-row">
            <LocationSearch
              onPlaceSelect={(lat, lng, address) => setServiceAt(lat, lng, address)}
              onGpsClick={useGps}
              gpsAvailable={!!gpsLocation}
            />
          </div>
        ) : undefined
      }
    >
      {showNotice && hasActiveBooking && booking && (
        <div className="app-map-notice">
          <BookingNotice
            booking={booking}
            show={showNotice}
            onDismiss={() => setShowNotice(false)}
            onCancel={cancelBooking}
          />
        </div>
      )}

      <div className="app-map-viewport">
        <OsmMapView
          serviceLocation={
            hasActiveBooking && booking
              ? { lat: booking.customerLat, lng: booking.customerLng }
              : serviceLocation
          }
          gpsLocation={gpsLocation}
          mechanics={mechanics}
          highlightRadiusKm={MAP_HIGHLIGHT_RADIUS_KM}
          bookedMechanicId={hasActiveBooking && booking ? booking.mechanicId : null}
          bookedMechanic={
            hasActiveBooking && booking
              ? {
                  id: booking.mechanicId,
                  name: booking.mechanicName,
                  lat: booking.mechanicLat,
                  lng: booking.mechanicLng,
                }
              : null
          }
          focusMode={mapFocus}
          onServiceLocationChange={(lat, lng) => setServiceAt(lat, lng)}
          onMechanicSelect={(m) => {
            setSelectedMechanic(m);
            setMapFocus("mechanics");
          }}
        />

        <div className="app-map-layer-toggle">
          <MapLayerToggle
            value={mapFocus}
            onChange={setMapFocus}
            hasBooking={hasActiveBooking}
            onBookedUnavailable={() => alert("Book a mechanic first to use this view.")}
          />
        </div>

        <MechanicInfoPanel
          mechanic={selectedMechanic}
          onClose={() => setSelectedMechanic(null)}
        />
      </div>

      <div className="app-sheet">
        <div className="map-sheet-location">
          <span className="map-sheet-pin" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--gm-orange)">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="map-sheet-label">Service location</p>
            <p className="map-sheet-address">{locationText}</p>
          </div>
        </div>

        {hasActiveBooking && booking ? (
          <CustomerActiveBooking
            booking={booking}
            counterPrice={counterPrice}
            showCounterInput={showCounterInput}
            actionLoading={actionLoading}
            showNoticeToggle
            showDetailsLink
            onCounterPriceChange={setCounterPrice}
            onToggleCounterInput={() => setShowCounterInput((v) => !v)}
            onAccept={() => bookingAction("accept")}
            onCounter={(p) => bookingAction("counter", p)}
            onComplete={completeService}
            onCancel={cancelBooking}
            onShowNotice={() => setShowNotice(true)}
          />
        ) : (
          <>
            <div className="mb-3 flex items-center">
              <span className="app-chip app-chip-green">
                {mechanics.length > 0
                  ? `${mechanics.length} mechanic(s) nearby`
                  : "Pin location to see nearby mechanics"}
              </span>
            </div>
            <button
              type="button"
              onClick={confirmLocation}
              className="app-btn app-btn-primary map-confirm-btn"
            >
              Confirm location & book
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
