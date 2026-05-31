"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { MARKETING } from "@/lib/marketing-images";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSeed?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackSeed = "fallback",
  className,
  ...props
}: SafeImageProps) {
  const [current, setCurrent] = useState(src);

  const needsUnoptimized =
    current.includes("gstatic.com") ||
    current.includes("okcarhub.com") ||
    current.includes("shinearmor.com") ||
    current.includes("zameen.com") ||
    current.includes("uor.edu.pk") ||
    current.includes("wikimedia.org") ||
    current.includes("yadea.com.pk");

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      className={className}
      unoptimized={needsUnoptimized}
      onError={() => {
        if (!current.includes("photo-1486262715619")) {
          const w = typeof props.width === "number" ? props.width : 600;
          setCurrent(MARKETING.automotiveFallback(w));
        }
      }}
    />
  );
}
