"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { clearSession, getSession } from "@/lib/session";
import type { BookingRecord } from "@/lib/types";

const CustomerLocationMap = dynamic(
  () =>
    import("@/components/map/CustomerLocationMap").then(
      (m) => m.CustomerLocationMap
    ),
  { ssr: false, loading: () => <div className="h-[220px] bg-[#E8EEF5]" /> }
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

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-[#666]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-[#0D47A1] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <FixWheelLogo size={36} />
            <div>
              <h1 className="text-lg font-bold">Mechanic Dashboard</h1>
              <p className="text-xs text-blue-100">
                {profile?.shopName ?? "FixWheel Partner"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-lg border border-white/40 px-3 py-1.5 text-xs font-bold hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-lg p-4">
        {pendingCount > 0 && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] p-3 text-sm font-bold text-[#E65100] shadow-sm">
            🔔 {pendingCount} new booking{pendingCount > 1 ? "s" : ""} — respond
            below
          </div>
        )}

        <div className="mb-4 rounded-xl bg-white p-4 shadow-md">
          <h2 className="mb-3 text-base font-bold text-[#003366]">
            Customer Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-sm text-[#888]">
              No bookings yet. When a customer books you, details appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBooking(b)}
                  className={`w-full cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                    selectedBooking?.id === b.id
                      ? "border-[#003D82] bg-[#E3F2FD]"
                      : "border-[#EEE] bg-[#FAFAFA] hover:bg-[#F0F4FF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#003366]">{b.customerName}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        b.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : b.status === "countered"
                            ? "bg-blue-100 text-blue-700"
                            : b.status === "completion_pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#666]">
                    {VEHICLE_LABELS[b.vehicle] ?? b.vehicle} · {b.issueDisplay}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#003D82]">
                    Rs. {b.currentPrice}
                    {b.etaDisplay && (
                      <span className="ml-2 text-xs font-normal text-[#2E7D32]">
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
          <div className="mb-4 space-y-3 rounded-xl bg-white p-4 shadow-md">
            <h3 className="text-base font-bold text-[#003366]">
              Booking Details
            </h3>
            <Row label="Customer" value={selectedBooking.customerName} />
            <Row
              label="Vehicle"
              value={
                VEHICLE_LABELS[selectedBooking.vehicle] ??
                selectedBooking.vehicle
              }
            />
            <Row label="Issue" value={selectedBooking.issueDisplay} />
            <Row
              label="Customer offer"
              value={`Rs. ${selectedBooking.offerAmount}`}
            />
            {selectedBooking.mechanicCounter != null && (
              <Row
                label="Your counter"
                value={`Rs. ${selectedBooking.mechanicCounter}`}
              />
            )}
            {selectedBooking.agreedPrice != null && (
              <Row
                label="Agreed price"
                value={`Rs. ${selectedBooking.agreedPrice}`}
              />
            )}
            {selectedBooking.etaDisplay && (
              <Row label="Est. arrival" value={selectedBooking.etaDisplay} />
            )}

            <div>
              <p className="mb-2 text-xs font-bold text-[#999]">
                Customer location
              </p>
              <CustomerLocationMap
                customerLat={selectedBooking.customerLat}
                customerLng={selectedBooking.customerLng}
                mechanicLat={profile?.lat}
                mechanicLng={profile?.lng}
                height="240px"
              />
            </div>

            {selectedBooking.status === "pending" && (
              <div className="space-y-3 border-t border-[#EEE] pt-3">
                <p className="text-xs text-[#666]">
                  Accept the customer&apos;s offer or propose a different price.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => bookingAction("accept")}
                    className="flex-1 rounded-lg bg-[#2E7D32] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1B5E20] disabled:opacity-70"
                  >
                    Accept Rs. {selectedBooking.offerAmount}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowPriceInput(true)}
                    className="flex-1 rounded-lg bg-[#0D47A1] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1565C0] disabled:opacity-70"
                  >
                    Change price
                  </button>
                </div>

                {showPriceInput && (
                  <div className="rounded-xl border-2 border-[#0D47A1] bg-[#F5F9FF] p-4">
                    <label className="mb-2 block text-sm font-bold text-[#003366]">
                      Enter your price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="mb-3 w-full rounded-lg border-2 border-[#CCC] px-3 py-2.5 text-base outline-none focus:border-[#0D47A1]"
                      placeholder="e.g. 600"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPriceInput(false)}
                        className="flex-1 rounded-lg border border-[#CCC] py-2.5 text-sm font-bold text-[#666]"
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
                        className="flex-1 rounded-lg bg-[#0D47A1] py-2.5 text-sm font-bold text-white disabled:opacity-70"
                      >
                        OK — Send to customer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedBooking.status === "countered" && (
              <div className="rounded-lg bg-[#E3F2FD] p-3 text-sm text-[#1565C0]">
                Your price Rs. {selectedBooking.mechanicCounter} sent. Waiting
                for customer to accept or counter.
              </div>
            )}

            {(selectedBooking.status === "confirmed" ||
              selectedBooking.status === "completion_pending") &&
              !selectedBooking.mechanicCompleted && (
                <div className="space-y-3 border-t border-[#EEE] pt-3">
                  {selectedBooking.status === "confirmed" && (
                    <div className="rounded-lg bg-[#E8F5E9] p-3 text-sm text-[#2E7D32]">
                      ✓ Confirmed at Rs. {selectedBooking.agreedPrice}. Head to
                      customer — ETA {selectedBooking.etaDisplay}.
                    </div>
                  )}
                  {selectedBooking.customerCompleted && (
                    <p className="text-xs text-[#666]">
                      Customer confirmed issue resolved — mark service complete
                      to close.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={completeService}
                    className="w-full rounded-lg bg-[#2E7D32] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1B5E20] disabled:opacity-70"
                  >
                    ✓ Service completed — notify customer
                  </button>
                </div>
              )}

            {(selectedBooking.status === "confirmed" ||
              selectedBooking.status === "completion_pending") &&
              selectedBooking.mechanicCompleted &&
              !selectedBooking.customerCompleted && (
                <div className="rounded-lg border border-[#A5D6A7] bg-[#F1F8E9] p-3 text-sm text-[#33691E]">
                  Service marked complete. Waiting for customer to confirm the
                  issue is resolved.
                </div>
              )}

            {selectedBooking.status === "completion_pending" &&
              selectedBooking.mechanicCompleted &&
              selectedBooking.customerCompleted && (
                <div className="rounded-lg bg-[#E8F5E9] p-3 text-center text-sm font-bold text-[#2E7D32]">
                  Both confirmed — closing booking…
                </div>
              )}
          </div>
        )}

        {profile && (
          <div className="rounded-xl bg-white p-4 shadow-md">
            <h3 className="text-sm font-bold text-[#003366]">Your shop</h3>
            <p className="mt-1 text-xs text-[#666]">
              {profile.shopName} · {profile.specialization}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#F0F0F0] pb-2">
      <p className="text-xs font-bold text-[#999]">{label}</p>
      <p className="text-sm text-[#333]">{value}</p>
    </div>
  );
}
