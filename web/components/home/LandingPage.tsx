"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { CityScrollRow } from "@/components/home/CityScrollRow";
import { ReviewsScrollRow, type Review } from "@/components/home/ReviewsScrollRow";
import { GoMechanicHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SafeImage } from "@/components/ui/SafeImage";
import { getSession } from "@/lib/session";
import { MARKETING, REGION_LABEL } from "@/lib/marketing-images";

const SERVICE_CATEGORIES = [
  { title: "Car Services", img: MARKETING.services.car, seed: "svc-car" },
  { title: "AC Service & Repair", img: MARKETING.services.ac, seed: "svc-ac" },
  { title: "Denting & Painting", img: MARKETING.services.dent, seed: "svc-dent" },
  { title: "Car Spa & Cleaning", img: MARKETING.services.spa, seed: "svc-spa" },
  { title: "Tyres & Wheel Care", img: MARKETING.services.tyres, seed: "svc-tyres" },
  { title: "Batteries", img: MARKETING.services.battery, seed: "svc-battery" },
  { title: "Detailing Services", img: MARKETING.services.detail, seed: "svc-detail" },
  { title: "Car Inspections", img: MARKETING.services.inspect, seed: "svc-inspect" },
];

const VEHICLES = [
  { id: "car", label: "Car", img: MARKETING.vehicles.car, seed: "veh-car" },
  { id: "bike", label: "Bike", img: MARKETING.vehicles.bike, seed: "veh-bike" },
  { id: "ebike", label: "E-Bike", img: MARKETING.vehicles.ebike, seed: "veh-ebike" },
  { id: "truck", label: "Truck", img: MARKETING.vehicles.truck, seed: "veh-truck" },
];

const PROMO = [
  { tag: "Popular", title: "Periodic Service", img: MARKETING.promo.periodic, seed: "promo-1" },
  { tag: "Premium", title: "Rubbing & Polishing", img: MARKETING.promo.polish, seed: "promo-2" },
  { tag: "New", title: "Deep All Round Spa", img: MARKETING.promo.spa, seed: "promo-3" },
  { tag: "Offer", title: "Front Bumper Paint", img: MARKETING.promo.paint, seed: "promo-4" },
];

const HOW_IT_WORKS = [
  { title: "Select The Perfect Service", desc: "Pick from our full catalog of car & bike services", img: "/images/fix-wheel.png", local: true },
  { title: "Set Your Location", desc: "Pin where you need service on the live map", img: MARKETING.howItWorks.map, seed: "how-map" },
  { title: "Track Service Real-Time", desc: "Live ETA, price updates & mechanic chat", img: MARKETING.howItWorks.phone, seed: "how-phone" },
  { title: "Confirm Completion", desc: "You and your mechanic both confirm — done!", img: MARKETING.howItWorks.mechanic, seed: "how-mech" },
];

const REVIEWS: Review[] = [
  { name: "Faheem Khan", text: "Smooth brake pad replacement. Mechanic arrived on time. Excellent work!", shop: "FixWheel — Islamabad", source: "google", stars: 5 },
  { name: "Rashid Lone", text: "Suspension serviced perfectly. Professional team and clear pricing.", shop: "FixWheel — Rawalpindi", source: "facebook", stars: 5 },
  { name: "Sajid Wani", text: "Quick engine oil change. Very efficient and completely hassle-free.", shop: "FixWheel — Taxila", source: "google", stars: 5 },
  { name: "Zahid Mir", text: "Clutch issue resolved professionally. Fair price and great experience!", shop: "FixWheel — Lahore", source: "google", stars: 4 },
  { name: "Ayesha Malik", text: "AC gas refill done at home. Saved me a trip to the workshop!", shop: "FixWheel — Karachi", source: "instagram", stars: 5 },
  { name: "Hamza Butt", text: "Tyre puncture fixed within 20 minutes. Highly recommend FixWheel.", shop: "FixWheel — Faisalabad", source: "facebook", stars: 5 },
  { name: "Nadia Hussain", text: "Car spa package was worth every rupee. Looks brand new again.", shop: "FixWheel — Lahore", source: "instagram", stars: 5 },
  { name: "Imran Shah", text: "Battery replaced doorstep. Transparent quote and quick service.", shop: "FixWheel — Peshawar", source: "google", stars: 4 },
];

const FAQS = [
  { q: "Where is the nearest FixWheel mechanic?", a: "Open FixWheel, set your location on the map, and we show verified mechanics within 20 km anywhere in Pakistan. Book instantly with transparent pricing." },
  { q: "What are the charges for a basic service?", a: "Services start from Rs. 100 for puncture care. Prices vary by vehicle and issue — tap Check Prices For Free to see estimates before you book." },
  { q: "How do I book a service?", a: "Register as a customer → choose vehicle & issue → confirm location → book a nearby mechanic. Takes under 2 minutes." },
  { q: "Why choose FixWheel over local garages?", a: "Verified mechanics, live map tracking, upfront price negotiation, and dual confirmation when your issue is resolved." },
  { q: "How can mechanics join FixWheel?", a: "Tap Register → Mechanic, add your shop details and map location. You'll receive bookings on your dashboard instantly." },
];

const PRICES = [
  { service: "Car Inspection / Diagnostics", from: 499, save: "15%" },
  { service: "Puncture Repair", from: 100, save: "20%" },
  { service: "Battery Jump Start", from: 300, save: "25%" },
  { service: "Oil Change", from: 800, save: "10%" },
];

export function LandingPage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const session = getSession();
    if (session?.usertype === "customer") router.replace("/map");
    else if (session?.usertype === "mechanic") router.replace("/mechanic");
  }, [router]);

  const startBooking = () => {
    const session = getSession();
    if (session?.usertype === "customer") router.push("/map");
    else router.push("/login");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <GoMechanicHeader />
      <BannerCarousel />

      {/* Hero */}
      <section className="bg-[var(--gm-bg-soft)] py-10 md:py-12">
        <div className="gm-container">
          <div className="gm-section-card px-6 py-8 text-center md:px-10 md:py-10">
            <h1 className="gm-pop-in text-2xl font-extrabold leading-tight text-[var(--gm-text)] md:text-[2.5rem]">
              Experience the Best Car Services in Pakistan
            </h1>
            <p className="gm-pop-in gm-stagger-1 mx-auto mt-3 max-w-xl text-sm text-[var(--gm-text-muted)] md:text-base">
              Book verified mechanics for car, bike &amp; truck — transparent pricing, live tracking, doorstep service.
            </p>
          </div>
        </div>
      </section>

      {/* Pakistan coverage + cities */}
      <section id="locations" className="overflow-x-hidden border-b border-[var(--gm-border)] bg-white py-10 md:py-12">
        <div className="gm-container mb-2 text-center md:mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-semibold text-[var(--gm-orange)]">
            <Image src="/images/icons/pin.svg" alt="" width={16} height={16} />
            Pakistan · {REGION_LABEL}
          </span>
          <h2 className="gm-section-heading mt-4">Service Coverage Across Pakistan</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--gm-text-muted)]">
            Verified mechanics in major cities — book anywhere nationwide with live map tracking.
          </p>
        </div>
        <CityScrollRow />
      </section>

      {/* Vehicle + CTA */}
      <section className="bg-white py-10 md:py-12">
        <div className="gm-container max-w-4xl">
          <div className="gm-pop-in overflow-hidden rounded-2xl border border-[var(--gm-border)] bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-lg md:p-10">
            <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[var(--gm-text-muted)]">
              Select Your Vehicle
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {VEHICLES.map((v) => {
                const selected = selectedVehicle === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`gm-pop-card flex flex-col overflow-hidden rounded-xl border-2 bg-white transition-all duration-300 ${
                      selected
                        ? "border-[var(--gm-orange)] gm-selected-pop"
                        : "border-[var(--gm-border)] hover:border-orange-200"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full bg-gray-100">
                      <SafeImage
                        src={v.img}
                        fallbackSeed={v.seed}
                        alt={v.label}
                        fill
                        className="object-cover"
                        sizes="(max-width:640px) 50vw, 200px"
                      />
                    </div>
                    <span className={`py-3 text-center text-sm font-bold ${selected ? "text-[var(--gm-orange)]" : "text-[var(--gm-text)]"}`}>
                      {v.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={startBooking}
                className="gm-btn gm-btn-orange gm-pop-card h-14 w-full max-w-lg text-sm font-extrabold uppercase tracking-wider shadow-lg md:text-base"
              >
                Check Prices For Free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section id="services" className="bg-[var(--gm-bg-soft)] py-12 md:py-16">
        <div className="gm-container">
          <div className="gm-section-card px-4 py-8 md:px-8 md:py-10">
            <h2 className="gm-section-heading mb-2 text-center">
              Car Services Available in Pakistan
            </h2>
            <p className="mb-10 text-center text-sm text-[var(--gm-text-muted)]">
              Periodic servicing, repairs, battery, towing, detailing &amp; much more
            </p>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
              {SERVICE_CATEGORIES.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={startBooking}
                  className="gm-service-card gm-pop-card overflow-hidden text-left"
                >
                  <div className="relative aspect-[4/3] w-full bg-gray-200">
                    <SafeImage src={s.img} fallbackSeed={s.seed} alt={s.title} fill className="object-cover" sizes="25vw" />
                  </div>
                  <p className="px-3 py-3.5 text-xs font-bold leading-snug text-[var(--gm-text)] sm:text-sm">
                    {s.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service packages */}
      <section className="border-y border-[var(--gm-border)] bg-white py-10 md:py-12">
        <div className="gm-container">
          <div className="gm-section-card px-4 py-8 md:px-8 md:py-10">
            <h2 className="gm-section-heading mb-2 text-center">Popular Service Packages</h2>
            <p className="mb-8 text-center text-sm text-[var(--gm-text-muted)]">Top picks for your vehicle — tap to book</p>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {PROMO.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={startBooking}
                className="gm-pop-card group overflow-hidden rounded-2xl border border-[var(--gm-border)] bg-white text-left shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <SafeImage
                    src={p.img}
                    fallbackSeed={p.seed}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="25vw"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-[var(--gm-orange)] px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow">
                    {p.tag}
                  </span>
                </div>
                <p className="p-4 text-sm font-bold text-[var(--gm-text)]">{p.title}</p>
              </button>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[var(--gm-bg-soft)] py-12 md:py-16">
        <div className="gm-container">
          <div className="gm-section-card px-4 py-8 md:px-8 md:py-10">
            <h2 className="gm-section-heading mb-3 text-center">How FixWheel Works?</h2>
            <p className="mb-10 text-center text-sm text-[var(--gm-text-muted)]">Four simple steps to get back on the road</p>
            <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="gm-pop-card flex flex-col items-center rounded-2xl border border-[var(--gm-border)] bg-white p-6 text-center shadow-md"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-orange-100 bg-[var(--gm-bg-soft)] shadow-inner">
                  <SafeImage
                    src={step.img}
                    fallbackSeed={step.seed ?? "how"}
                    alt=""
                    fill
                    className={step.local ? "object-contain p-3" : "object-cover"}
                    sizes="96px"
                  />
                </div>
                <span className="mb-2 rounded-full bg-[var(--gm-orange)] px-3 py-1 text-[10px] font-bold text-white">
                  STEP {i + 1}
                </span>
                <h3 className="text-sm font-bold text-[var(--gm-text)]">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--gm-text-muted)]">{step.desc}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rating & happy customers — below How It Works */}
      <section className="border-b border-[var(--gm-border)] bg-white py-8">
        <div className="gm-container flex flex-wrap items-center justify-center gap-10 md:gap-20">
          {[
            { icon: "⭐", v: "4.8/5", l: "Based on 10,000+ Reviews" },
            { icon: "😊", v: "10,000+", l: "Happy Customers" },
          ].map((s) => (
            <div key={s.l} className="gm-pop-card flex items-center gap-4 rounded-2xl border border-[var(--gm-border)] bg-white px-6 py-4 shadow-md">
              <span className="text-3xl">{s.icon}</span>
              <div className="text-left">
                <p className="text-2xl font-extrabold text-[var(--gm-text)]">{s.v}</p>
                <p className="text-xs text-[var(--gm-text-muted)]">{s.l}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white py-10">
        <div className="gm-container">
          <div className="gm-section-card px-4 py-6 md:px-8">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { v: "10,000+", l: "Happy Customers" },
            { v: "5,000+", l: "Vehicles Serviced" },
            { v: "4.8★", l: "Average Rating" },
            { v: "500+", l: "Partner Mechanics" },
          ].map((s) => (
            <div key={s.l} className="gm-pop-card rounded-xl bg-white py-5 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-[var(--gm-orange)]">{s.v}</p>
              <p className="mt-1 text-xs text-[var(--gm-text-muted)]">{s.l}</p>
            </div>
          ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="overflow-hidden bg-[var(--gm-bg-soft)] py-12 md:py-16">
        <div className="gm-container mb-2 text-center md:mb-4">
          <h2 className="gm-section-heading mb-2">What Car Owners Across Pakistan Say</h2>
          <p className="text-sm text-[var(--gm-text-muted)]">
            Real feedback from Google, Facebook &amp; Instagram
          </p>
        </div>
        <ReviewsScrollRow reviews={REVIEWS} />
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-12 md:py-16">
        <div className="gm-container">
          <div className="gm-section-card px-4 py-8 md:px-8 md:py-10">
            <h2 className="gm-section-heading mb-2 text-center">Common Questions</h2>
            <p className="mb-8 text-center text-sm text-[var(--gm-text-muted)]">
              Everything you need to know about FixWheel
            </p>
            <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-xl border bg-white transition-shadow duration-300 ${
                    open ? "border-[var(--gm-orange)] shadow-md" : "border-[var(--gm-border)] shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${open ? "bg-[var(--gm-orange)] text-white" : "bg-[var(--gm-bg-soft)] text-[var(--gm-text-muted)]"}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold text-[var(--gm-text)]">{faq.q}</span>
                    <span className={`text-xl font-light transition-transform duration-300 ${open ? "rotate-180 text-[var(--gm-orange)]" : "text-[var(--gm-text-muted)]"}`}>
                      ▾
                    </span>
                  </button>
                  <div className={`gm-faq-panel ${open ? "open" : ""}`}>
                    <div>
                      <p className="border-t border-[var(--gm-border)] px-5 pb-5 pt-3 text-sm leading-relaxed text-[var(--gm-text-muted)]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </section>

      {/* Price list */}
      <section className="py-12">
        <div className="gm-container max-w-3xl">
          <h2 className="gm-section-heading mb-6 text-center">
            Service Price List — Pakistan
          </h2>
          <div className="gm-pop-card overflow-hidden rounded-2xl border border-[var(--gm-border)] shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-[var(--gm-orange)] text-white">
                <tr>
                  <th className="px-5 py-3.5 text-left font-bold">Service Type</th>
                  <th className="px-5 py-3.5 text-right font-bold">From (Rs.)</th>
                  <th className="hidden px-5 py-3.5 text-right font-bold sm:table-cell">You Save</th>
                </tr>
              </thead>
              <tbody>
                {PRICES.map((row, i) => (
                  <tr
                    key={row.service}
                    className={`border-t border-[var(--gm-border)] transition-colors hover:bg-orange-50 ${i % 2 === 0 ? "bg-white" : "bg-[var(--gm-bg-soft)]"}`}
                  >
                    <td className="px-5 py-3.5 font-medium">{row.service}</td>
                    <td className="px-5 py-3.5 text-right font-extrabold text-[var(--gm-orange)]">{row.from}</td>
                    <td className="hidden px-5 py-3.5 text-right font-semibold text-[var(--gm-green)] sm:table-cell">{row.save}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
