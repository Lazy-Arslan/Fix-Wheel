"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { BookingNotice } from "@/components/booking/BookingNotice";
import { LocationSearch } from "@/components/map/LocationSearch";
import { MechanicInfoPanel } from "@/components/map/MechanicInfoPanel";
import {
  MapLayerToggle,
  type MapFocusMode,
} from "@/components/map/MapLayerToggle";
import { getSession } from "@/lib/session";
import type { BookingRecord } from "@/lib/types";
import type { MechanicProfile } from "@/lib/types";
import { MAP_HIGHLIGHT_RADIUS_KM } from "@/lib/constants";
import { formatEta } from "@/lib/booking-utils";

const OsmMapView = dynamic(
  () => import("@/components/map/OsmMapView").then((m) => m.OsmMapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-[#E8EEF5]" /> }
);

export default function MapPage() {
  const router = useRouter();
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [serviceLocation, setServiceLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationText, setLocationText] = useState(
    "Search or tap map to set where you need service"
  );
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [selectedMechanic, setSelectedMechanic] =
    useState<MechanicProfile | null>(null);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [mapFocus, setMapFocus] = useState<MapFocusMode>("you");

  const loadBooking = useCallback(async () => {
    const session = getSession();
    if (!session?.isLoggedIn) return;

    const res = await fetch(
      `/api/bookings?role=customer&name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}&active=true`
    );
    const data = await res.json();
    const next: BookingRecord | null = data.booking ?? null;
    if (next?.status === "completed") {
      setBooking(null);
      setShowNotice(false);
      return;
    }
    setBooking(next);
    if (next?.status === "countered" && next.mechanicCounter) {
      setCounterPrice(String(next.mechanicCounter));
    }
    if (next?.status === "completion_pending" && next.mechanicCompleted) {
      setShowNotice(true);
    }
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session?.isLoggedIn || session.usertype !== "customer") {
      router.replace("/login");
      return;
    }

    if (sessionStorage.getItem("fixwheel_booking_notice")) {
      setShowNotice(true);
      sessionStorage.removeItem("fixwheel_booking_notice");
    }

    loadBooking();
    const interval = setInterval(loadBooking, 8000);

    if (!navigator.geolocation) return () => clearInterval(interval);

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
      () =>
        setLocationText("GPS unavailable — search for your home or tap the map")
    );

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, loadBooking]);

  useEffect(() => {
    if (!booking) return;
    const loc = { lat: booking.customerLat, lng: booking.customerLng };
    setServiceLocation(loc);
    updateAddress(loc.lat, loc.lng);
    loadMechanics(loc.lat, loc.lng);
    setMapFocus("booked");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  const updateAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `/api/osm/reverse-geocode?lat=${lat}&lng=${lng}`
      );
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

  const setServiceAt = useCallback(
    async (lat: number, lng: number, address?: string) => {
      if (booking) return;
      setServiceLocation({ lat, lng });
      setSelectedMechanic(null);
      if (address) setLocationText(address);
      else await updateAddress(lat, lng);
      await loadMechanics(lat, lng);
    },
    [loadMechanics, booking]
  );

  useEffect(() => {
    if (serviceLocation && !booking) {
      loadMechanics(serviceLocation.lat, serviceLocation.lng);
    }
  }, [serviceLocation, loadMechanics, booking]);

  const completeService = async () => {
    if (!booking) return;
    const session = getSession();
    if (!session) return;
    if (
      !confirm(
        "Confirm that your issue is resolved and the service is complete?"
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          actor: "customer",
          actorName: session.username,
          actorCnic: session.usercnic,
        }),
      });
      let data: { error?: string; booking?: BookingRecord } = {};
      try {
        data = await res.json();
      } catch {
        alert("Server error. Restart dev server after npm run db:push.");
        return;
      }
      if (!res.ok) {
        alert(data.error ?? "Could not confirm");
        return;
      }
      if (data.booking?.status === "completed") {
        alert("Issue solved. Booking closed — you can book again anytime.");
        setBooking(null);
        setShowNotice(false);
      } else if (data.booking) {
        setBooking(data.booking);
      }
      await loadBooking();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const bookingAction = async (
    action: "accept" | "counter",
    price?: number
  ) => {
    if (!booking) return;
    const session = getSession();
    if (!session) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          actor: "customer",
          actorName: session.username,
          actorCnic: session.usercnic,
          counterPrice: price,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Action failed");
        return;
      }
      setBooking(data.booking);
      setShowCounterInput(false);
      if (data.booking.status === "confirmed") {
        setShowNotice(true);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!booking) return;
    const session = getSession();
    if (!session) return;
    if (!confirm("Cancel this booking?")) return;

    await fetch(`/api/bookings/${booking.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: session.username,
        customerCnic: session.usercnic,
      }),
    });
    setBooking(null);
    setShowNotice(false);
  };

  const confirmLocation = () => {
    if (booking) return;
    if (!serviceLocation) {
      alert("Please select where you need service (search or tap the map)");
      return;
    }
    router.push(
      `/services?lat=${serviceLocation.lat}&lng=${serviceLocation.lng}`
    );
  };

  const etaText =
    booking?.etaDisplay ??
    (booking?.etaMinutes ? formatEta(booking.etaMinutes) : null);
  const hasActiveBooking =
    booking &&
    (booking.status === "pending" ||
      booking.status === "countered" ||
      booking.status === "confirmed" ||
      booking.status === "completion_pending");

  return (
    <div className="relative flex h-screen flex-col bg-[#F5F7FB]">
      {showNotice && hasActiveBooking && (
        <div className="absolute left-0 right-0 top-0 z-30">
          <BookingNotice
            booking={booking}
            show={showNotice}
            onDismiss={() => setShowNotice(false)}
            onCancel={cancelBooking}
          />
        </div>
      )}

      <div className="bg-white px-3.5 py-3 shadow-md z-10">
        <div className="mb-2.5 flex items-center">
          <FixWheelLogo size={32} className="mr-2.5" />
          <div>
            <h1 className="text-base font-bold text-[#003366]">
              Where do you need service?
            </h1>
          </div>
        </div>
        {!hasActiveBooking && (
          <>
            <LocationSearch
              onPlaceSelect={(lat, lng, address) =>
                setServiceAt(lat, lng, address)
              }
            />
            <button
              type="button"
              onClick={() => {
                if (!gpsLocation) {
                  alert("GPS not available.");
                  return;
                }
                setServiceAt(gpsLocation.lat, gpsLocation.lng);
              }}
              className="mt-2 w-full cursor-pointer rounded-lg border border-[#003D82] bg-white py-2 text-xs font-bold text-[#003D82] hover:bg-[#E3F2FD]"
            >
              📍 Use my current GPS location
            </button>
          </>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <OsmMapView
          serviceLocation={
            hasActiveBooking
              ? { lat: booking!.customerLat, lng: booking!.customerLng }
              : serviceLocation
          }
          gpsLocation={gpsLocation}
          mechanics={mechanics}
          highlightRadiusKm={MAP_HIGHLIGHT_RADIUS_KM}
          bookedMechanicId={hasActiveBooking ? booking!.mechanicId : null}
          bookedMechanic={
            hasActiveBooking
              ? {
                  id: booking!.mechanicId,
                  name: booking!.mechanicName,
                  lat: booking!.mechanicLat,
                  lng: booking!.mechanicLng,
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
        <MechanicInfoPanel
          mechanic={selectedMechanic}
          onClose={() => setSelectedMechanic(null)}
        />
      </div>

      <MapLayerToggle
        value={mapFocus}
        onChange={setMapFocus}
        hasBooking={!!hasActiveBooking}
        onBookedUnavailable={() =>
          alert("Book a mechanic first to use this view.")
        }
      />

      <div className="bg-white px-4 pb-4 pt-3.5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mb-3 flex min-h-14 items-center rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] px-3.5 py-2">
          <span className="mr-2.5 text-lg">📍</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-[#999999]">Service location</p>
            <p className="text-[13px] font-bold leading-snug text-[#003D82]">
              {locationText}
            </p>
          </div>
        </div>

        {hasActiveBooking ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-[#E0E0E0] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#E8F5E9] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D32] ring-1 ring-[#A5D6A7]">
                      {booking!.mechanicName}
                    </span>
                    <span className="text-xs text-[#666]">
                      {booking!.mechanicShop}
                    </span>
                  </div>
                  <p className="text-xs text-[#666]">{booking!.issueDisplay}</p>
                </div>
                {etaText && (
                  <div className="rounded-lg bg-[#0D47A1] px-3 py-1.5 text-center">
                    <p className="text-[9px] font-bold text-blue-200">ETA</p>
                    <p className="text-sm font-black text-white">{etaText}</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-[#333]">
                Rs. {booking!.currentPrice}
                {booking!.status === "pending" && (
                  <span className="ml-2 text-xs text-[#888]">
                    — waiting for mechanic
                  </span>
                )}
              </p>
            </div>

            {booking!.status === "countered" && (
              <div className="rounded-xl border border-[#FFB74D] bg-[#FFF8E1] p-4">
                <p className="mb-3 text-sm font-bold text-[#E65100]">
                  Mechanic offered Rs. {booking!.mechanicCounter}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => bookingAction("accept")}
                    className="flex-1 rounded-lg bg-[#2E7D32] py-2.5 text-sm font-bold text-white disabled:opacity-70"
                  >
                    Accept Rs. {booking!.mechanicCounter}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowCounterInput((v) => !v)}
                    className="flex-1 rounded-lg bg-[#0D47A1] py-2.5 text-sm font-bold text-white disabled:opacity-70"
                  >
                    Counter price
                  </button>
                </div>
                {showCounterInput && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      placeholder="Your price (Rs.)"
                      className="flex-1 rounded-lg border-2 border-[#CCC] px-3 py-2 text-sm outline-none focus:border-[#0D47A1]"
                    />
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        const p = parseInt(counterPrice, 10);
                        if (isNaN(p) || p < 50) {
                          alert("Enter at least Rs. 50");
                          return;
                        }
                        bookingAction("counter", p);
                      }}
                      className="rounded-lg bg-[#0D47A1] px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            )}

            {booking!.status === "confirmed" && (
              <div className="space-y-2">
                <div className="rounded-xl bg-[#E8F5E9] p-3 text-center text-sm font-bold text-[#2E7D32]">
                  ✓ Booking confirmed at Rs. {booking!.agreedPrice}
                </div>
                {booking!.mechanicCompleted && (
                  <p className="text-center text-xs text-[#666]">
                    Mechanic marked service complete — please confirm below.
                  </p>
                )}
              </div>
            )}

            {(booking!.status === "confirmed" ||
              booking!.status === "completion_pending") && (
              <div className="rounded-xl border border-[#81C784] bg-[#F1F8E9] p-4">
                {booking!.mechanicCompleted && !booking!.customerCompleted && (
                  <p className="mb-3 text-sm text-[#33691E]">
                    Your mechanic says the service is finished. Confirm that your
                    issue is resolved.
                  </p>
                )}
                {!booking!.mechanicCompleted && booking!.customerCompleted && (
                  <p className="mb-3 text-sm text-[#33691E]">
                    You confirmed resolution — waiting for the mechanic to mark
                    service complete.
                  </p>
                )}
                {booking!.mechanicCompleted && booking!.customerCompleted && (
                  <p className="mb-3 text-sm font-bold text-[#2E7D32]">
                    Both confirmed — closing booking…
                  </p>
                )}
                {!booking!.customerCompleted && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={completeService}
                    className="w-full rounded-lg bg-[#2E7D32] py-3 text-sm font-bold text-white hover:bg-[#1B5E20] disabled:opacity-70"
                  >
                    ✓ Issue resolved — confirm completion
                  </button>
                )}
                {booking!.customerCompleted && !booking!.mechanicCompleted && (
                  <p className="text-center text-xs font-semibold text-[#558B2F]">
                    Waiting for mechanic…
                  </p>
                )}
              </div>
            )}

            {!showNotice && (
              <button
                type="button"
                onClick={() => setShowNotice(true)}
                className="w-full rounded-lg border border-[#0D47A1] py-2 text-xs font-bold text-[#0D47A1]"
              >
                Show booking notification
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center">
              <span className="mr-1.5 text-xs">🟢</span>
              <span className="text-xs font-bold text-[#2E7D32]">
                {mechanics.length > 0
                  ? `${mechanics.length} mechanic(s) nearby`
                  : "No mechanics nearby — try services page"}
              </span>
            </div>
            <button
              type="button"
              onClick={confirmLocation}
              className="h-[52px] w-full cursor-pointer rounded-lg bg-[#003D82] text-[15px] font-bold text-white hover:bg-[#004a99]"
            >
              CONFIRM LOCATION
            </button>
          </>
        )}
      </div>
    </div>
  );
}
