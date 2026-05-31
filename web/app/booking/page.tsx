"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerActiveBooking } from "@/components/booking/CustomerActiveBooking";
import { useCustomerBooking } from "@/hooks/useCustomerBooking";

export default function BookingPage() {
  const {
    booking,
    hasActiveBooking,
    ready,
    counterPrice,
    setCounterPrice,
    showCounterInput,
    setShowCounterInput,
    actionLoading,
    completeService,
    bookingAction,
    cancelBooking,
  } = useCustomerBooking({ poll: true });

  if (!ready) {
    return (
      <div className="app-loading">
        <p className="app-loading-pulse">Loading booking…</p>
      </div>
    );
  }

  return (
    <AppShell
      role="customer"
      activeNav="booking"
      title="My booking"
      subtitle="Status, price updates & cancel"
    >
      <div className="app-page">
        {!hasActiveBooking || !booking ? (
          <div className="app-card app-card-pad text-center app-fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gm-bg-soft)] text-3xl">
              🛞
            </div>
            <p className="mb-2 text-base font-bold text-[var(--gm-text)]">No active booking</p>
            <p className="mb-5 text-sm text-[var(--gm-text-muted)]">
              Pin your location on the map and book a mechanic to track status here.
            </p>
            <Link href="/map" className="app-btn app-btn-primary inline-flex px-8">
              Go to map
            </Link>
            <Link
              href="/history"
              className="mt-3 block text-sm font-semibold text-[var(--gm-orange)] hover:underline"
            >
              View booking history
            </Link>
          </div>
        ) : (
          <div className="app-fade-in">
            <CustomerActiveBooking
              booking={booking}
              counterPrice={counterPrice}
              showCounterInput={showCounterInput}
              actionLoading={actionLoading}
              onCounterPriceChange={setCounterPrice}
              onToggleCounterInput={() => setShowCounterInput((v) => !v)}
              onAccept={() => bookingAction("accept")}
              onCounter={(p) => bookingAction("counter", p)}
              onComplete={completeService}
              onCancel={cancelBooking}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
