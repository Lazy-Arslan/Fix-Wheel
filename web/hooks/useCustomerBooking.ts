"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import type { BookingRecord } from "@/lib/types";

export function useCustomerBooking(options?: { poll?: boolean }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const loadBooking = useCallback(async () => {
    const session = getSession();
    if (!session?.isLoggedIn) return null;

    const res = await fetch(
      `/api/bookings?role=customer&name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}&active=true`
    );
    const data = await res.json();
    const next: BookingRecord | null = data.booking ?? null;
    if (next?.status === "completed") {
      setBooking(null);
      setShowNotice(false);
      return null;
    }
    setBooking(next);
    if (next?.status === "countered" && next.mechanicCounter) {
      setCounterPrice(String(next.mechanicCounter));
    }
    if (next?.status === "completion_pending" && next.mechanicCompleted) {
      setShowNotice(true);
    }
    return next;
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

    loadBooking().finally(() => setReady(true));

    if (!options?.poll) return;
    const interval = setInterval(loadBooking, 8000);
    return () => clearInterval(interval);
  }, [router, loadBooking, options?.poll]);

  const completeService = async () => {
    if (!booking) return;
    const session = getSession();
    if (!session) return;
    if (!confirm("Confirm that your issue is resolved and the service is complete?")) return;

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

  const bookingAction = async (action: "accept" | "counter", price?: number) => {
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
      if (data.booking.status === "confirmed") setShowNotice(true);
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

  const hasActiveBooking =
    booking &&
    (booking.status === "pending" ||
      booking.status === "countered" ||
      booking.status === "confirmed" ||
      booking.status === "completion_pending");

  return {
    booking,
    hasActiveBooking: !!hasActiveBooking,
    showNotice,
    setShowNotice,
    counterPrice,
    setCounterPrice,
    showCounterInput,
    setShowCounterInput,
    actionLoading,
    ready,
    loadBooking,
    completeService,
    bookingAction,
    cancelBooking,
  };
}
