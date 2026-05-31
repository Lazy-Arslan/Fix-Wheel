"use client";

import { useEffect, useState } from "react";
import { formatEta } from "@/lib/booking-utils";
import type { BookingRecord } from "@/lib/types";

interface BookingNoticeProps {
  booking: BookingRecord | null;
  show: boolean;
  onDismiss: () => void;
  onCancel: () => void;
}

export function BookingNotice({
  booking,
  show,
  onDismiss,
  onCancel,
}: BookingNoticeProps) {
  const [visible, setVisible] = useState(show);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setFading(false);
    }
  }, [show, booking?.id, booking?.status]);

  if (!visible || !booking) return null;

  const etaText =
    booking.etaDisplay ??
    (booking.etaMinutes ? formatEta(booking.etaMinutes) : null);

  const isConfirmed = booking.status === "confirmed";
  const isCountered = booking.status === "countered";
  const isCompletionPending = booking.status === "completion_pending";

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 320);
  };

  return (
    <div
      className={`z-30 mx-3 mt-3 overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ${
        fading ? "translate-y-[-8px] opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={{
        background: isCompletionPending
          ? "linear-gradient(135deg, #33691E 0%, #558B2F 50%, #7CB342 100%)"
          : isConfirmed
            ? "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)"
            : isCountered
              ? "linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FFB300 100%)"
              : "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)",
      }}
    >
      <div className="flex items-start gap-3 p-4 text-white">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm">
          👨‍🔧
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            {isCompletionPending
              ? booking.mechanicCompleted
                ? "Confirm service complete"
                : "Completion in progress"
              : isConfirmed
                ? "Booking confirmed"
                : isCountered
                  ? "New price from mechanic"
                  : "Mechanic booked"}
          </p>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/30">
            {booking.mechanicName}
          </span>
          <p className="mt-1 truncate text-sm font-medium text-white/90">
            {booking.mechanicShop}
          </p>
          <p className="mt-1 text-xs text-white/85">
            {booking.issueDisplay} · Rs. {booking.currentPrice}
          </p>
        </div>
        {etaText && (
          <div className="shrink-0 rounded-xl bg-white/95 px-3 py-2 text-center shadow-md">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#666]">
              ETA
            </p>
            <p className="text-lg font-black leading-tight text-[#0D47A1]">
              {etaText.replace("~", "")}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-white/20 bg-black/10 px-4 py-3">
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-1 cursor-pointer rounded-lg bg-white/20 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-lg bg-[#C62828] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#B71C1C]"
        >
          Cancel booking
        </button>
      </div>
    </div>
  );
}
