"use client";

import { useEffect, useState } from "react";
import { MARKETING } from "@/lib/marketing-images";
import { SafeImage } from "@/components/ui/SafeImage";

const SLIDES = [
  {
    src: MARKETING.banner.carService,
    seed: "banner-car",
    alt: "Expert car service",
    title: "Expert Car Service",
    sub: "Trusted mechanics at your doorstep",
  },
  {
    src: MARKETING.banner.acRepair,
    seed: "banner-ac",
    alt: "AC service and repair",
    title: "AC Service & Repair",
    sub: "Stay cool — fast, reliable fixes",
  },
  {
    src: MARKETING.banner.carSpa,
    seed: "banner-spa",
    alt: "Car spa and cleaning",
    title: "Car Spa & Cleaning",
    sub: "Premium wash & detailing",
  },
  {
    src: MARKETING.banner.tyres,
    seed: "banner-tyres",
    alt: "Tyres and wheel care",
    title: "Tyres & Wheel Care",
    sub: "Puncture, alignment & more",
  },
];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#eaeaea]">
      <div
        className="gm-banner-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.seed}
            className="gm-banner-slide relative min-h-[200px] w-full sm:min-h-[260px] md:min-h-[320px]"
          >
            <SafeImage
              src={slide.src}
              fallbackSeed={slide.seed}
              alt={slide.alt}
              fill
              className="object-cover transition-transform duration-[5000ms] ease-out hover:scale-105"
              priority={slide.seed === "banner-car"}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-10">
              <p className="text-xl font-extrabold text-white sm:text-2xl md:text-3xl">
                {slide.title}
              </p>
              <p className="mt-1 text-sm text-white/90 sm:text-base">{slide.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-[var(--gm-orange)]" : "w-2.5 bg-white/80 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
