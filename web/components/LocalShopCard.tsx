"use client";

import type { LocalShop } from "@/lib/types";

interface LocalShopCardProps {
  shop: LocalShop;
}

export function LocalShopCard({ shop }: LocalShopCardProps) {
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${shop.lat}&mlon=${shop.lng}#map=17/${shop.lat}/${shop.lng}`;

  return (
    <div className="mb-2.5 flex gap-3 rounded-lg border border-[#E8E8E8] bg-white p-3 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD] text-2xl">
        🏪
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#003D82]">{shop.name}</h3>
          <span className="shrink-0 text-xs font-bold text-[#1565C0]">
            {shop.distance}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-[#666]">{shop.address}</p>
        {shop.phone && (
          <a
            href={`tel:${shop.phone.replace(/\D/g, "")}`}
            className="mt-1 inline-block text-xs font-bold text-[#003D82] hover:underline"
          >
            📞 {shop.phone}
          </a>
        )}
        {shop.rating != null && (
          <p className="mt-1 text-xs text-[#888]">★ {shop.rating}</p>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block cursor-pointer text-xs font-bold text-[#003D82] hover:underline"
        >
          View on OpenStreetMap →
        </a>
      </div>
    </div>
  );
}
