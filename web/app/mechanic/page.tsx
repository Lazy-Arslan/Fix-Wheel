"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/session";
import type { BookingRecord } from "@/lib/types";

const CustomerLocationMap = dynamic(
  () =>
    import("@/components/map/CustomerLocationMap").then(
      (m) => m.CustomerLocationMap
    ),
  { ssr: false, loading: () => <div className="h-[220px] rounded-xl bg-[#E8EEF5]" /> }
);

interface MechanicProfileData {
  name: string;
  shopName: string;
  email: string;
  phone: string;
  city: string;
  license: string;
  specialization: string;
  experience: string;
  address: string;
  lat: number;
  lng: number;
}

const VEHICLE_LABELS: Record<string, string> = {
  car: "🚗 Car",
  bike: "🏍️ Bike",
  ebike: "🛵 E-Bike",
  truck: "🚛 Truck",
  rickshaw: "🛺 Rickshaw",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting your response",
  countered: "Waiting for customer",
  confirmed: "In progress",
  completion_pending: "Awaiting confirmation",
};

const STATUS_CHIP: Record<string, string> = {
  pending: "app-chip-orange",
  countered: "app-chip-blue",
  confirmed: "app-chip-green",
  completion_pending: "app-chip-amber",
};

export default function MechanicHomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MechanicProfileData | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    const session = getSession();
    if (!session) return;

    const res = await fetch(
      `/api/bookings?role=mechanic&name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}`
    );
    const data = await res.json();
    const list: BookingRecord[] = data.bookings ?? [];
    setBookings(list);
    setSelectedBooking((prev) => {
      if (prev) return list.find((b) => b.id === prev.id) ?? list[0] ?? null;
      return list.find((b) => b.status === "pending") ?? list[0] ?? null;
    });
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session?.isLoggedIn || session.usertype !== "mechanic") {
      router.replace("/login");
      return;
    }

    fetch(
      `/api/mechanics/profile?name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .finally(() => setLoading(false));

    loadBookings();
    const interval = setInterval(loadBookings, 8000);
    return () => clearInterval(interval);
  }, [router, loadBookings]);

  useEffect(() => {
    if (selectedBooking?.status === "pending") {
      setNewPrice(String(selectedBooking.offerAmount + 50));
    }
    setShowPriceInput(false);
  }, [selectedBooking?.id, selectedBooking?.status]);

  const completeService = async () => {
    if (!selectedBooking) return;
    const session = getSession();
    if (!session) return;
    if (
      !confirm(
        "Mark this service as completed? The customer will be asked to confirm the issue is resolved."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          actor: "mechanic",
          actorName: session.username,
          actorCnic: session.usercnic,
        }),
      });
      let data: { error?: string; booking?: BookingRecord } = {};
      try {
        data = await res.json();
      } catch {
        alert("Server error. Please try again.");
        return;
      }
      if (!res.ok) {
        alert(data.error ?? "Action failed");
        return;
      }
      if (data.booking?.status === "completed") {
        alert("Issue solved. Booking closed.");
        setSelectedBooking(null);
      } else if (data.booking) {
        setSelectedBooking(data.booking);
      }
      await loadBookings();
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
    if (!selectedBooking) return;
    const session = getSession();
    if (!session) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          actor: "mechanic",
          actorName: session.username,
          actorCnic: session.usercnic,
          counterPrice: price,
        }),
      });
      let data: { error?: string; booking?: BookingRecord } = {};
      try {
        data = await res.json();
      } catch {
        alert("Server error. Please try again.");
        return;
      }
      if (!res.ok) {
        alert(data.error ?? "Action failed");
        return;
      }
      setShowPriceInput(false);
      await loadBookings();
      if (data.booking) setSelectedBooking(data.booking);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <div className="app-loading">
        <p className="app-loading-pulse">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <AppShell
      role="mechanic"
      activeNav="mechanic"
      title="Mechanic Dashboard"
      subtitle={profile?.shopName ?? "FixWheel Partner"}
    >
      <div className="app-page">
        {pendingCount > 0 && (
          <div className="app-alert app-alert-warn mb-4">
            🔔 {pendingCount} new booking{pendingCount > 1 ? "s" : ""} — respond
            below
          </div>
        )}

        <div className="app-card app-card-pad mb-4 app-fade-in">
          <h2 className="app-section-title">Customer Bookings</h2>

          {bookings.length === 0 ? (
            <p className="text-sm text-[var(--gm-text-muted)]">
              No bookings yet. When a customer books you, details appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBooking(b)}
                  className={`app-list-item app-fade-in ${
                    selectedBooking?.id === b.id ? "selected" : ""
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[var(--gm-text)]">{b.customerName}</p>
                    <span
                      className={`app-chip ${STATUS_CHIP[b.status] ?? "app-chip-blue"}`}
                    >
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--gm-text-muted)]">
                    {VEHICLE_LABELS[b.vehicle] ?? b.vehicle} · {b.issueDisplay}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-[var(--gm-orange)]">
                    Rs. {b.currentPrice}
                    {b.etaDisplay && (
                      <span className="ml-2 text-xs font-semibold text-[var(--gm-green)]">
                        · ETA {b.etaDisplay}
                      </span>
                    )}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedBooking && (
          <div className="app-card app-card-pad mb-4 app-fade-in">
            <h3 className="app-section-title">Booking Details</h3>
            <DetailRow label="Customer" value={selectedBooking.customerName} />
            <DetailRow
              label="Vehicle"
              value={
                VEHICLE_LABELS[selectedBooking.vehicle] ?? selectedBooking.vehicle
              }
            />
            <DetailRow label="Issue" value={selectedBooking.issueDisplay} />
            <DetailRow
              label="Customer offer"
              value={`Rs. ${selectedBooking.offerAmount}`}
            />
            {selectedBooking.mechanicCounter != null && (
              <DetailRow
                label="Your counter"
                value={`Rs. ${selectedBooking.mechanicCounter}`}
              />
            )}
            {selectedBooking.agreedPrice != null && (
              <DetailRow
                label="Agreed price"
                value={`Rs. ${selectedBooking.agreedPrice}`}
              />
            )}
            {selectedBooking.etaDisplay && (
              <DetailRow label="Est. arrival" value={selectedBooking.etaDisplay} />
            )}

            <div className="mt-4">
              <p className="app-detail-label mb-2">Customer location</p>
              <CustomerLocationMap
                customerLat={selectedBooking.customerLat}
                customerLng={selectedBooking.customerLng}
                mechanicLat={profile?.lat}
                mechanicLng={profile?.lng}
                height="240px"
              />
            </div>

            {selectedBooking.status === "pending" && (
              <div className="mt-4 space-y-3 border-t border-[var(--gm-border)] pt-4">
                <p className="text-xs text-[var(--gm-text-muted)]">
                  Accept the customer&apos;s offer or propose a different price.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => bookingAction("accept")}
                    className="app-btn app-btn-success flex-1 text-sm"
                  >
                    Accept Rs. {selectedBooking.offerAmount}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowPriceInput(true)}
                    className="app-btn app-btn-blue flex-1 text-sm"
                  >
                    Change price
                  </button>
                </div>

                {showPriceInput && (
                  <div className="app-card app-card-pad border-blue-200 bg-[#F5F9FF]">
                    <label className="mb-2 block text-sm font-bold text-[var(--gm-text)]">
                      Enter your price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="mb-3 w-full rounded-xl border border-[var(--gm-border)] px-3 py-2.5 text-base outline-none focus:border-[#1565c0] focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. 600"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPriceInput(false)}
                        className="app-btn app-btn-outline flex-1 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          const p = parseInt(newPrice, 10);
                          if (isNaN(p) || p < 50) {
                            alert("Enter at least Rs. 50");
                            return;
                          }
                          bookingAction("counter", p);
                        }}
                        className="app-btn app-btn-blue flex-1 text-sm"
                      >
                        Send to customer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedBooking.status === "countered" && (
              <div className="app-alert app-alert-info mt-4">
                Your price Rs. {selectedBooking.mechanicCounter} sent. Waiting
                for customer to accept or counter.
              </div>
            )}

            {(selectedBooking.status === "confirmed" ||
              selectedBooking.status === "completion_pending") &&
              !selectedBooking.mechanicCompleted && (
                <div className="mt-4 space-y-3 border-t border-[var(--gm-border)] pt-4">
                  {selectedBooking.status === "confirmed" && (
                    <div className="app-alert app-alert-success">
                      ✓ Confirmed at Rs. {selectedBooking.agreedPrice}. Head to
                      customer — ETA {selectedBooking.etaDisplay}.
                    </div>
                  )}
                  {selectedBooking.customerCompleted && (
                    <p className="text-xs text-[var(--gm-text-muted)]">
                      Customer confirmed issue resolved — mark service complete
                      to close.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={completeService}
                    className="app-btn app-btn-success w-full text-sm"
                  >
                    ✓ Service completed — notify customer
                  </button>
                </div>
              )}

            {(selectedBooking.status === "confirmed" ||
              selectedBooking.status === "completion_pending") &&
              selectedBooking.mechanicCompleted &&
              !selectedBooking.customerCompleted && (
                <div className="app-alert app-alert-success mt-4">
                  Service marked complete. Waiting for customer to confirm the
                  issue is resolved.
                </div>
              )}

            {selectedBooking.status === "completion_pending" &&
              selectedBooking.mechanicCompleted &&
              selectedBooking.customerCompleted && (
                <div className="app-alert app-alert-success mt-4 text-center font-bold">
                  Both confirmed — closing booking…
                </div>
              )}
          </div>
        )}

        {profile && (
          <div className="app-card app-card-pad app-fade-in">
            <h3 className="text-sm font-bold text-[var(--gm-text)]">Your shop</h3>
            <p className="mt-1 text-sm text-[var(--gm-text-muted)]">
              {profile.shopName} · {profile.specialization}
            </p>
            <p className="mt-1 text-xs text-[var(--gm-text-muted)]">
              {profile.city} · {profile.phone}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-detail-row">
      <p className="app-detail-label">{label}</p>
      <p className="app-detail-value">{value}</p>
    </div>
  );
}
