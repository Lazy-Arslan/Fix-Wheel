"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { CenterFocusCarousel } from "@/components/ui/CenterFocusCarousel";
import { MARKETING, PAKISTAN_CITIES } from "@/lib/marketing-images";

export function CityScrollRow() {
  return (
    <CenterFocusCarousel
      items={PAKISTAN_CITIES}
      intervalMs={4500}
      getKey={(city) => city.name}
      renderItem={(city, isActive) => (
        <div
          className={`overflow-hidden rounded-2xl border bg-white ${
            isActive ? "border-[var(--gm-orange)]" : "border-[var(--gm-border)]"
          }`}
        >
          <div className="relative aspect-[16/10] w-full bg-gray-100">
            <SafeImage
              src={MARKETING.cities[city.img]}
              fallbackSeed={`city-${city.img}`}
              alt={`${city.name} — ${city.landmark}`}
              fill
              className="object-cover"
              sizes="(max-width:768px) 84vw, 380px"
            />
            <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              {city.landmark}
            </span>
          </div>
          <div className="p-5 md:p-6">
            <h3 className="text-base font-bold text-[var(--gm-text)] md:text-lg">{city.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--gm-text-muted)]">{city.detail}</p>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--gm-border)] pt-4 text-xs font-semibold md:text-sm">
              <span className="text-[var(--gm-orange)]">{city.mechanics} mechanics</span>
              <span className="text-[var(--gm-text-muted)]">{city.response}</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
