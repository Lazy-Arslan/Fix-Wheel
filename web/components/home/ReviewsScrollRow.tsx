"use client";

import Image from "next/image";
import { CenterFocusCarousel } from "@/components/ui/CenterFocusCarousel";

type ReviewSource = "google" | "facebook" | "instagram";

export type Review = {
  name: string;
  text: string;
  shop: string;
  source: ReviewSource;
  stars: number;
};

const SOURCE_ICON: Record<ReviewSource, string> = {
  google: "/images/icons/google.svg",
  facebook: "/images/icons/facebook.svg",
  instagram: "/images/icons/instagram.svg",
};

const SOURCE_LABEL: Record<ReviewSource, string> = {
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
};

function ReviewCard({ review, isActive }: { review: Review; isActive: boolean }) {
  return (
    <article
      className={`flex min-h-[220px] flex-col rounded-2xl border bg-white p-6 md:min-h-[240px] md:p-7 ${
        isActive ? "border-[var(--gm-orange)]" : "border-[var(--gm-border)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--gm-orange)] md:text-base">
          {"★".repeat(review.stars)}
        </p>
        <div className="flex items-center gap-1.5 rounded-full bg-[var(--gm-bg-soft)] px-2.5 py-1">
          <Image
            src={SOURCE_ICON[review.source]}
            alt={SOURCE_LABEL[review.source]}
            width={18}
            height={18}
            className="shrink-0"
          />
          <span className="text-[10px] font-bold text-[var(--gm-text-muted)]">
            {SOURCE_LABEL[review.source]}
          </span>
        </div>
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--gm-text-muted)] md:text-base">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-5 border-t border-[var(--gm-border)] pt-4">
        <p className="font-bold text-[var(--gm-text)]">{review.name}</p>
        <p className="mt-0.5 text-xs text-[var(--gm-text-muted)]">{review.shop}</p>
      </div>
    </article>
  );
}

export function ReviewsScrollRow({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-center gap-4 md:mb-4 md:gap-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gm-text-muted)]">
          Reviews from
        </p>
        {(["google", "facebook", "instagram"] as ReviewSource[]).map((s) => (
          <div
            key={s}
            className="flex items-center gap-2 rounded-full border border-[var(--gm-border)] bg-white px-3 py-1.5 shadow-sm"
          >
            <Image src={SOURCE_ICON[s]} alt={SOURCE_LABEL[s]} width={20} height={20} />
            <span className="text-xs font-bold text-[var(--gm-text)]">{SOURCE_LABEL[s]}</span>
          </div>
        ))}
      </div>

      <CenterFocusCarousel
        items={reviews}
        intervalMs={5000}
        cardWidthSm={0.86}
        cardWidthLg={400}
        getKey={(r) => `${r.name}-${r.shop}`}
        renderItem={(review, isActive) => (
          <ReviewCard review={review} isActive={isActive} />
        )}
      />
    </div>
  );
}
