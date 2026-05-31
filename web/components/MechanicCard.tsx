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
    <span className="text-[#FFB400] text-lg leading-none" aria-label={`${rating} stars`}>
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
    <div className="mb-2.5 rounded-lg bg-white p-4 shadow-md border border-[#E8E8E8]">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-[#003D82]">{mechanic.shopName}</h3>
          <p className="mt-1 text-xs text-[#666666]">{mechanic.specialty}</p>
        </div>
        <span className="text-sm font-bold text-[#1565C0]">{mechanic.distance}</span>
      </div>

      <div className="mb-3 flex items-center">
        <Stars rating={mechanic.rating} />
        <span className="ml-2 text-xs text-[#999999]">(156 reviews)</span>
      </div>

      <div className="mb-3 h-px bg-[#EFEFEF]" />

      <div className="mb-3 flex justify-center text-center">
        <div className="flex-1">
          <p className="text-base font-bold text-[#4CAF50]">✓</p>
          <p className="text-[10px] text-[#666666]">Verified</p>
        </div>
        <div className="flex-1">
          <p className="text-base">⚡</p>
          <p className="text-[10px] text-[#666666]">Quick</p>
        </div>
        <div className="flex-1">
          <p className="text-base">💰</p>
          <p className="text-[10px] text-[#666666]">Fair Price</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBook}
        disabled={loading}
        className="h-[45px] w-full rounded-lg bg-[#003D82] text-sm font-bold text-white disabled:opacity-70"
      >
        {loading ? "BOOKING..." : "BOOK NOW"}
      </button>
    </div>
  );
}
