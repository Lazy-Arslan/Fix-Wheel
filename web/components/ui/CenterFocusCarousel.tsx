"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

const TRANSITION_MS = 750;
const TRANSITION = `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
const SLOT_TRANSITION = `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${TRANSITION_MS}ms ease, box-shadow ${TRANSITION_MS}ms ease`;

type CenterFocusCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, isActive: boolean) => ReactNode;
  getKey: (item: T, index: number) => string;
  intervalMs?: number;
  /** Viewport width fraction for card on mobile (e.g. 0.84 = 84vw max) */
  cardWidthSm?: number;
  /** Max card width in px on desktop */
  cardWidthLg?: number;
};

export function CenterFocusCarousel<T>({
  items,
  renderItem,
  getKey,
  intervalMs = 4500,
  cardWidthSm = 0.84,
  cardWidthLg = 380,
}: CenterFocusCarouselProps<T>) {
  const n = items.length;

  /** Triple buffer so the track loops seamlessly */
  const extended = useMemo(
    () => (n > 0 ? [...items, ...items, ...items] : []),
    [items, n]
  );

  const [index, setIndex] = useState(n);
  const [noTransition, setNoTransition] = useState(false);
  const [vw, setVw] = useState(0);
  const [ready, setReady] = useState(false);

  const logicalActive = n > 0 ? index % n : 0;

  useEffect(() => {
    const update = () => setVw(document.documentElement.clientWidth);
    update();
    setReady(true);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /** Reset to middle copy when items change */
  useEffect(() => {
    setIndex(n);
    setNoTransition(true);
    requestAnimationFrame(() => setNoTransition(false));
  }, [n, items]);

  const snapIfNeeded = useCallback(
    (current: number) => {
      if (n <= 1) return;
      if (current >= 2 * n) {
        setNoTransition(true);
        setIndex(current - n);
      } else if (current < n) {
        setNoTransition(true);
        setIndex(current + n);
      }
    },
    [n]
  );

  useEffect(() => {
    if (noTransition) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setNoTransition(false))
      );
    }
  }, [noTransition]);

  useEffect(() => {
    if (n <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, n]);

  useEffect(() => {
    if (n <= 1 || noTransition) return;
    const t = setTimeout(() => snapIfNeeded(index), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [index, n, snapIfNeeded, noTransition]);

  const goToLogical = (j: number) => {
    if (n <= 1 || j === logicalActive) return;
    const delta = (j - logicalActive + n) % n;
    setIndex((i) => i + delta);
  };

  if (n === 0) return null;

  if (!ready || vw === 0) {
    return (
      <div className="gm-focus-carousel h-[280px] py-6 md:h-[320px] md:py-8" />
    );
  }

  const isMobile = vw < 768;
  const cardWidth = isMobile
    ? Math.min(vw * cardWidthSm, 340)
    : Math.min(vw * 0.34, cardWidthLg);
  const gap = isMobile ? 12 : 20;
  const slotWidth = cardWidth + gap;
  const translateX = vw / 2 - index * slotWidth - cardWidth / 2;

  return (
    <div className="gm-focus-carousel py-6 md:py-8">
      <div
        className="flex will-change-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: noTransition ? "none" : TRANSITION,
        }}
      >
        {extended.map((item, i) => {
          const dist = Math.abs(i - index);
          const isActive = i === index;
          const scale = isActive ? 1 : dist === 1 ? 0.86 : 0.74;
          const opacity = isActive ? 1 : dist === 1 ? 0.5 : 0.28;
          const logical = i % n;

          return (
            <div
              key={`slot-${i}-${getKey(item, logical)}`}
              className="flex shrink-0 items-center justify-center"
              style={{ width: slotWidth }}
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="gm-focus-slot block w-full border-0 bg-transparent p-0 text-left outline-none"
                style={{
                  width: cardWidth,
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex: isActive ? 20 : Math.max(1, 10 - dist),
                  transition: noTransition ? "none" : SLOT_TRANSITION,
                  boxShadow: isActive
                    ? "0 20px 50px rgba(0,0,0,0.14)"
                    : "0 4px 16px rgba(0,0,0,0.06)",
                }}
                aria-current={isActive ? "true" : undefined}
              >
                {renderItem(item, isActive)}
              </button>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={`dot-${getKey(item, i)}`}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goToLogical(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === logicalActive
                  ? "w-7 bg-[var(--gm-orange)]"
                  : "w-2 bg-[var(--gm-border)] hover:bg-orange-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
