"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type BackButtonProps = {
  label?: string;
  className?: string;
  fallbackHref?: string;
};

/** Browser back; falls through to home if no history */
export function BackButton({
  label = "Back",
  className = "",
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={`gm-btn gm-btn-outline group h-9 gap-1.5 px-3 text-xs transition-all hover:border-[var(--gm-orange)] hover:text-[var(--gm-orange)] ${className}`}
    >
      <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5">
        ←
      </span>
      {label}
    </button>
  );
}

export function BackHomeLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-[var(--gm-text-muted)] transition-all duration-300 hover:border-[var(--gm-border)] hover:bg-white hover:text-[var(--gm-orange)] hover:shadow-sm ${className}`}
    >
      <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
        Back to home
      </span>
    </Link>
  );
}
