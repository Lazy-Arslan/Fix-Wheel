"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
      <div
        className="splash-watermark pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <FixWheelLogo size={320} className="opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <FixWheelLogo size={200} className="splash-logo mb-5" />
        <h1 className="splash-title text-4xl font-bold text-[#003366]">FixWheel</h1>
        <p className="splash-tagline mt-2.5 text-sm font-bold text-[#666666]">
          Digital Vehicle Service Platform
        </p>
      </div>
    </div>
  );
}
