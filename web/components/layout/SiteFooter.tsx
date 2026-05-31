import Link from "next/link";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { REGION_LABEL, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/marketing-images";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t-4 border-[var(--gm-orange)] bg-[#141414] pt-2.5 text-white">
      <div className="gm-container px-4 py-14 md:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <FixWheelLogo size={44} />
              <span className="text-xl font-extrabold">FixWheel</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Pakistan&apos;s digital vehicle service platform. Verified mechanics,
              transparent pricing, live tracking — {REGION_LABEL.toLowerCase()}.
            </p>
          </div>

          <div>
            <h4 className="mb-4 pt-3 text-xs font-bold uppercase tracking-widest text-white/90">
              Our Services
            </h4>
            <ul className="space-y-2.5 text-sm text-white/55">
              <li>Scheduled Services</li>
              <li>AC &amp; Electrical</li>
              <li>Cleaning &amp; Detailing</li>
              <li>Batteries &amp; Tyres</li>
              <li>Custom Repair</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 pt-3 text-xs font-bold uppercase tracking-widest text-white/90">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#services" className="text-white/55 transition hover:text-[var(--gm-orange)]">Services</Link></li>
              <li><Link href="/#how-it-works" className="text-white/55 transition hover:text-[var(--gm-orange)]">How It Works</Link></li>
              <li><Link href="/#faq" className="text-white/55 transition hover:text-[var(--gm-orange)]">FAQs</Link></li>
              <li><Link href="/login" className="text-white/55 transition hover:text-[var(--gm-orange)]">Login</Link></li>
              <li><Link href="/register" className="text-white/55 transition hover:text-[var(--gm-orange)]">Register</Link></li>
              <li><Link href="/register/mechanic" className="text-white/55 transition hover:text-[var(--gm-orange)]">Join as Mechanic</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 pt-3 text-xs font-bold uppercase tracking-widest text-white/90">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>Monday – Sunday</li>
              <li>24/7 (PKT)</li>
              <li>
                <a href="mailto:support@fixwheel.app" className="font-semibold text-[var(--gm-orange)] hover:underline">
                  support@fixwheel.app
                </a>
              </li>
              <li>
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-bold text-white hover:text-[var(--gm-orange)]">
                  {SUPPORT_PHONE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} FixWheel. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Serving vehicle owners {REGION_LABEL}
          </p>
        </div>
      </div>
    </footer>
  );
}
