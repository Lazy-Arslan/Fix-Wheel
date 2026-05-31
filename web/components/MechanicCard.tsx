"use client";

import { useState } from "react";
import type { MechanicProfile } from "@/lib/types";

interface MechanicCardProps {
  mechanic: MechanicProfile;
  onBook: (mechanic: MechanicProfile) => Promise<void>;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-lg leading-none text-[#FFB400]" aria-label={`${rating} stars`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export function MechanicCard({ mechanic, onBook }: MechanicCardProps) {
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!mechanic.id) {
      alert("Cannot book this mechanic. Please refresh and try again.");
      return;
    }
    setLoading(true);
    try {
      await onBook(mechanic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fw-card mb-3 p-5">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--fw-navy)]">{mechanic.shopName}</h3>
          <p className="mt-1 text-xs text-slate-500">{mechanic.specialty}</p>
        </div>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-sm font-bold text-[var(--fw-orange)]">
          {mechanic.distance}
        </span>
      </div>

      <div className="mb-3 flex items-center">
        <Stars rating={mechanic.rating} />
        <span className="ml-2 text-xs text-slate-400">(156 reviews)</span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-green-50 py-2">
          <p className="text-sm font-bold text-green-600">✓</p>
          <p className="text-[10px] text-slate-500">Verified</p>
        </div>
        <div className="rounded-lg bg-blue-50 py-2">
          <p className="text-sm">⚡</p>
          <p className="text-[10px] text-slate-500">Quick</p>
        </div>
        <div className="rounded-lg bg-orange-50 py-2">
          <p className="text-sm">💰</p>
          <p className="text-[10px] text-slate-500">Fair Price</p>
        </div>
      </div>

        <button
          type="button"
          onClick={handleBook}
          disabled={loading}
          className="gm-btn gm-btn-orange h-11 w-full text-sm"
        >
        {loading ? "BOOKING…" : "BOOK NOW"}
      </button>
    </div>
  );
}
