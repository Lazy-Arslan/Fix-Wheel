"use client";

import Link from "next/link";
import type { BookingRecord } from "@/lib/types";
import { formatEta } from "@/lib/booking-utils";

const STATUS_UI: Record<string, { label: string; chip: string }> = {
  pending: { label: "Waiting for mechanic", chip: "app-chip-orange" },
  countered: { label: "Price counter received", chip: "app-chip-amber" },
  confirmed: { label: "Confirmed — mechanic en route", chip: "app-chip-green" },
  completion_pending: { label: "Awaiting completion", chip: "app-chip-blue" },
};

type Props = {
  booking: BookingRecord;
  counterPrice: string;
  showCounterInput: boolean;
  actionLoading: boolean;
  showNoticeToggle?: boolean;
  showDetailsLink?: boolean;
  onCounterPriceChange: (v: string) => void;
  onToggleCounterInput: () => void;
  onAccept: () => void;
  onCounter: (price: number) => void;
  onComplete: () => void;
  onCancel: () => void;
  onShowNotice?: () => void;
};

export function CustomerActiveBooking({
  booking,
  counterPrice,
  showCounterInput,
  actionLoading,
  showNoticeToggle,
  showDetailsLink = false,
  onCounterPriceChange,
  onToggleCounterInput,
  onAccept,
  onCounter,
  onComplete,
  onCancel,
  onShowNotice,
}: Props) {
  const etaText =
    booking.etaDisplay ??
    (booking.etaMinutes ? formatEta(booking.etaMinutes) : null);
  const status = STATUS_UI[booking.status] ?? {
    label: booking.status,
    chip: "app-chip-blue",
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`app-chip ${status.chip}`}>{status.label}</span>
        {etaText && (
          <span className="rounded-xl bg-[var(--gm-text)] px-3 py-1.5 text-xs font-bold text-white">
            ETA {etaText}
          </span>
        )}
      </div>

      <div className="app-card app-card-pad">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-extrabold text-[var(--gm-text)]">
              {booking.mechanicName}
            </p>
            <p className="text-sm text-[var(--gm-text-muted)]">{booking.mechanicShop}</p>
            <p className="mt-2 text-sm">{booking.issueDisplay}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--gm-text-muted)]">
              Current price
            </p>
            <p className="text-xl font-extrabold text-[var(--gm-orange)]">
              Rs. {booking.currentPrice}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--gm-border)] pt-4 text-xs">
          <div>
            <p className="font-bold text-[var(--gm-text-muted)]">Your offer</p>
            <p className="font-semibold">Rs. {booking.offerAmount}</p>
          </div>
          {booking.mechanicCounter != null && (
            <div>
              <p className="font-bold text-[var(--gm-text-muted)]">Mechanic counter</p>
              <p className="font-semibold">Rs. {booking.mechanicCounter}</p>
            </div>
          )}
          {booking.agreedPrice != null && (
            <div className="col-span-2">
              <p className="font-bold text-[var(--gm-text-muted)]">Agreed price</p>
              <p className="font-semibold text-[var(--gm-green)]">Rs. {booking.agreedPrice}</p>
            </div>
          )}
        </div>
      </div>

      {booking.status === "countered" && (
        <div className="app-card app-card-pad border-amber-200 bg-[#FFFBF0]">
          <p className="mb-3 text-sm font-bold text-[#E65100]">
            Mechanic offered Rs. {booking.mechanicCounter}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={onAccept}
              className="app-btn app-btn-success flex-1 text-sm"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={onToggleCounterInput}
              className="app-btn app-btn-blue flex-1 text-sm"
            >
              Counter
            </button>
          </div>
          {showCounterInput && (
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => onCounterPriceChange(e.target.value)}
                placeholder="Your price (Rs.)"
                className="flex-1 rounded-xl border border-[var(--gm-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gm-orange)]"
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
                  onCounter(p);
                }}
                className="app-btn app-btn-blue px-4 text-sm"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}

      {(booking.status === "confirmed" || booking.status === "completion_pending") && (
        <div className="app-card app-card-pad border-green-100 bg-[#F6FBF6]">
          {booking.status === "confirmed" && booking.agreedPrice != null && (
            <p className="mb-3 text-sm font-semibold text-[var(--gm-green)]">
              ✓ Confirmed at Rs. {booking.agreedPrice}
            </p>
          )}
          {booking.mechanicCompleted && !booking.customerCompleted && (
            <p className="mb-3 text-sm text-[var(--gm-text-muted)]">
              Mechanic marked service complete — please confirm below.
            </p>
          )}
          {!booking.customerCompleted && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={onComplete}
              className="app-btn app-btn-success w-full text-sm"
            >
              ✓ Issue resolved — confirm completion
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="app-btn app-btn-outline flex-1 text-sm text-red-600"
        >
          Cancel booking
        </button>
        {showNoticeToggle && onShowNotice && (
          <button type="button" onClick={onShowNotice} className="app-btn app-btn-outline flex-1 text-sm">
            Show alert
          </button>
        )}
      </div>

      {showDetailsLink && (
        <Link href="/booking" className="block text-center text-xs font-semibold text-[var(--gm-orange)] hover:underline">
          Open full booking details →
        </Link>
      )}
    </div>
  );
}
