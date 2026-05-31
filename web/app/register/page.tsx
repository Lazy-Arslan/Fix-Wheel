"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SafeImage } from "@/components/ui/SafeImage";
import { MARKETING, REGION_LABEL } from "@/lib/marketing-images";

export default function RegisterMainPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gm-bg-soft)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero strip */}
        <div className="border-b border-[var(--gm-border)] bg-white py-10 text-center">
          <FixWheelLogo size={64} className="mx-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--gm-text)] md:text-3xl">
            Join FixWheel
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--gm-text-muted)]">
            Create your account and start booking or offering services {REGION_LABEL.toLowerCase()}.
          </p>
        </div>

        <div className="gm-container py-10 md:py-14">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Customer card */}
            <button
              type="button"
              onClick={() => router.push("/register/customer")}
              className="gm-pop-card group overflow-hidden rounded-2xl border-2 border-[var(--gm-border)] bg-white text-left shadow-lg transition-all hover:border-[var(--gm-orange)]"
            >
              <div className="relative h-48 w-full overflow-hidden md:h-56">
                <SafeImage
                  src={MARKETING.register.customer}
                  fallbackSeed="reg-customer"
                  alt="Customer"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="rounded-full bg-[var(--gm-orange)] px-3 py-1 text-[10px] font-bold uppercase text-white">
                    Customer
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-white">Book Vehicle Services</h2>
                </div>
              </div>
              <div className="p-6">
                <ul className="mb-5 space-y-2 text-sm text-[var(--gm-text-muted)]">
                  <li className="flex items-center gap-2"><span className="text-[var(--gm-orange)]">✓</span> Find mechanics near you</li>
                  <li className="flex items-center gap-2"><span className="text-[var(--gm-orange)]">✓</span> Live map &amp; ETA tracking</li>
                  <li className="flex items-center gap-2"><span className="text-[var(--gm-orange)]">✓</span> Fair price negotiation</li>
                </ul>
                <span className="gm-btn gm-btn-orange inline-flex h-12 w-full text-sm font-bold">
                  Register as Customer →
                </span>
              </div>
            </button>

            {/* Mechanic card */}
            <button
              type="button"
              onClick={() => router.push("/register/mechanic")}
              className="gm-pop-card group overflow-hidden rounded-2xl border-2 border-[var(--gm-border)] bg-white text-left shadow-lg transition-all hover:border-[var(--gm-orange)]"
            >
              <div className="relative h-48 w-full overflow-hidden md:h-56">
                <SafeImage
                  src={MARKETING.register.mechanic}
                  fallbackSeed="reg-mechanic"
                  alt="Mechanic"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="rounded-full bg-[#1565c0] px-3 py-1 text-[10px] font-bold uppercase text-white">
                    Mechanic
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-white">Grow Your Workshop</h2>
                </div>
              </div>
              <div className="p-6">
                <ul className="mb-5 space-y-2 text-sm text-[var(--gm-text-muted)]">
                  <li className="flex items-center gap-2"><span className="text-[#1565c0]">✓</span> Receive booking requests</li>
                  <li className="flex items-center gap-2"><span className="text-[#1565c0]">✓</span> Manage jobs on dashboard</li>
                  <li className="flex items-center gap-2"><span className="text-[#1565c0]">✓</span> Set your shop on the map</li>
                </ul>
                <span className="gm-btn inline-flex h-12 w-full bg-[#1565c0] text-sm font-bold text-white shadow-md">
                  Register as Mechanic →
                </span>
              </div>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-[var(--gm-text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[var(--gm-orange)] hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
