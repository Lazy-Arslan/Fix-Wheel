"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { MechanicCard } from "@/components/MechanicCard";
import { LocalShopCard } from "@/components/LocalShopCard";
import type { MechanicProfile, LocalShop } from "@/lib/types";
import {
  CUSTOM_ISSUE,
  DELIVERY_PRICE,
  ISSUE_CHARGES,
  ISSUES_WITH_CUSTOM,
  OFFER_STEP,
  RADIUS_KM,
} from "@/lib/constants";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/session";
import { MARKETING, pub } from "@/lib/marketing-images";

const VEHICLES = [
  { id: "car", label: "Car", image: MARKETING.vehicles.car },
  { id: "bike", label: "Bike", image: MARKETING.vehicles.bike },
  { id: "ebike", label: "E-Bike", image: pub("e bike.jfif") },
  { id: "truck", label: "Truck", image: MARKETING.vehicles.truck },
  {
    id: "rickshaw",
    label: "Rickshaw",
    image: MARKETING.fallback("rickshaw", 400, 300),
  },
];

const ISSUE_IMAGES: Record<string, string> = {
  Puncture: MARKETING.services.tyres,
  "Battery Issue": MARKETING.services.battery,
  "Fuel Delivery": MARKETING.services.car,
  "Oil Change": MARKETING.services.car,
  "Engine Repair": MARKETING.services.inspect,
  "Brake Service": MARKETING.services.dent,
  Towing: MARKETING.vehicles.truck,
  [CUSTOM_ISSUE]: MARKETING.services.inspect,
};

const STEPS = [
  { n: 1, title: "Vehicle", hint: "Select your vehicle type" },
  { n: 2, title: "Issue", hint: "What needs fixing?" },
  { n: 3, title: "Offer", hint: "Set your price" },
  { n: 4, title: "Mechanic", hint: "Find & book nearby" },
];

function ServiceSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userLat = parseFloat(searchParams.get("lat") ?? "0");
  const userLng = parseFloat(searchParams.get("lng") ?? "0");

  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [issue, setIssue] = useState(ISSUES_WITH_CUSTOM[0]);
  const [customIssueText, setCustomIssueText] = useState("");
  const [servicePrice, setServicePrice] = useState(ISSUE_CHARGES[ISSUES_WITH_CUSTOM[0]]);
  const [offerAmount, setOfferAmount] = useState(
    ISSUE_CHARGES[ISSUES_WITH_CUSTOM[0]] + DELIVERY_PRICE
  );
  const [mechanics, setMechanics] = useState<MechanicProfile[]>([]);
  const [localShops, setLocalShops] = useState<LocalShop[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session?.isLoggedIn) router.replace("/login");
  }, [router]);

  const updateCharges = (nextIssue: string) => {
    setIssue(nextIssue);
    if (nextIssue === CUSTOM_ISSUE) {
      setServicePrice(100);
      setOfferAmount(100 + DELIVERY_PRICE);
    } else {
      const price = ISSUE_CHARGES[nextIssue] ?? 100;
      setServicePrice(price);
      setOfferAmount(price + DELIVERY_PRICE);
    }
  };

  const loadLocalShops = async () => {
    const res = await fetch(`/api/osm/nearby-shops?lat=${userLat}&lng=${userLng}`);
    const data = await res.json();
    setLocalShops(data.shops ?? []);
  };

  const handleBook = async (mechanic: MechanicProfile) => {
    const session = getSession();
    if (!session?.isLoggedIn) {
      router.replace("/login");
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: session.username,
        customerCnic: session.usercnic,
        mechanicId: mechanic.id,
        vehicle: selectedVehicle,
        issue,
        customIssue: issue === CUSTOM_ISSUE ? customIssueText : "",
        customerLat: userLat,
        customerLng: userLng,
        customerOffer: offerAmount,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Booking failed");
      return;
    }

    sessionStorage.setItem("fixwheel_booking_notice", "1");
    router.replace("/map");
  };

  const findNearbyMechanics = async () => {
    if (userLat === 0 && userLng === 0) {
      alert("Location not available. Go back and confirm location.");
      return;
    }
    if (issue === CUSTOM_ISSUE && !customIssueText.trim()) {
      alert("Please describe your custom issue.");
      return;
    }

    setSearched(true);
    setStep(4);

    const res = await fetch(
      `/api/mechanics/nearby?lat=${userLat}&lng=${userLng}&radius=${RADIUS_KM}`
    );
    const data = await res.json();
    const list: MechanicProfile[] = data.mechanics ?? [];
    setMechanics(list);

    if (list.length === 0) {
      await loadLocalShops();
      alert("No registered FixWheel mechanics within 20 km. See suggested local shops below.");
    } else {
      setLocalShops([]);
      alert(`${list.length} mechanic(s) found near you!`);
    }
  };

  const goNext = () => {
    if (step === 2 && issue === CUSTOM_ISSUE && !customIssueText.trim()) {
      alert("Please describe your custom issue.");
      return;
    }
    if (step < 3) setStep(step + 1);
    else findNearbyMechanics();
  };

  return (
    <AppShell
      role="customer"
      activeNav="services"
      title="Book a service"
      subtitle="Step-by-step booking"
    >
      <div className="app-page service-flow">
        <div className="service-steps-bar app-fade-in">
          {STEPS.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => s.n <= step && setStep(s.n)}
              className={`service-step-dot ${step >= s.n ? "done" : ""} ${step === s.n ? "active" : ""}`}
            >
              <span className="service-step-num">{s.n}</span>
              <span className="service-step-label">{s.title}</span>
            </button>
          ))}
        </div>

        {step === 1 && (
          <section className="service-step-card app-fade-in">
            <div className="service-step-header">
              <span className="service-step-badge">Step 1</span>
              <h2 className="service-step-title">Select vehicle type</h2>
              <p className="service-step-desc">Choose the vehicle that needs service today.</p>
            </div>
            <div className="service-vehicle-grid">
              {VEHICLES.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`service-vehicle-card ${selectedVehicle === v.id ? "selected" : ""}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="service-vehicle-img-wrap">
                    <Image
                      src={v.image}
                      alt={v.label}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={!v.image.startsWith("/")}
                    />
                  </div>
                  <span className="service-vehicle-label">{v.label}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={goNext} className="app-btn app-btn-primary service-next-btn">
              Continue to issue →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="service-step-card app-fade-in">
            <div className="service-step-header">
              <span className="service-step-badge">Step 2</span>
              <h2 className="service-step-title">What is the issue?</h2>
              <p className="service-step-desc">Pick the closest match — you can describe details below.</p>
            </div>
            <div className="service-issue-grid">
              {ISSUES_WITH_CUSTOM.map((item, i) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateCharges(item)}
                  className={`service-issue-card ${issue === item ? "selected" : ""}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="service-issue-img-wrap">
                    <Image
                      src={ISSUE_IMAGES[item] ?? MARKETING.services.car}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                      unoptimized={!(ISSUE_IMAGES[item] ?? "").startsWith("/")}
                    />
                  </div>
                  <span className="service-issue-label">{item}</span>
                  {item !== CUSTOM_ISSUE && (
                    <span className="service-issue-price">from Rs. {ISSUE_CHARGES[item]}</span>
                  )}
                </button>
              ))}
            </div>
            {issue === CUSTOM_ISSUE && (
              <textarea
                value={customIssueText}
                onChange={(e) => setCustomIssueText(e.target.value)}
                placeholder="Describe your issue in detail…"
                className="service-custom-issue"
              />
            )}
            <div className="service-step-actions">
              <button type="button" onClick={() => setStep(1)} className="app-btn app-btn-outline">
                Back
              </button>
              <button type="button" onClick={goNext} className="app-btn app-btn-primary flex-1">
                Continue to offer →
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="service-step-card app-fade-in">
            <div className="service-step-header">
              <span className="service-step-badge">Step 3</span>
              <h2 className="service-step-title">Set your offer</h2>
              <p className="service-step-desc">Mechanics can accept or counter your price.</p>
            </div>
            <div className="service-offer-card">
              <div className="service-offer-row">
                <span>Service charges</span>
                <strong>Rs. {servicePrice}</strong>
              </div>
              <div className="service-offer-row">
                <span>Delivery</span>
                <strong>Rs. {DELIVERY_PRICE}</strong>
              </div>
              <div className="service-offer-divider" />
              <p className="service-offer-label">Your total offer</p>
              <div className="service-offer-controls">
                <button
                  type="button"
                  onClick={() => {
                    if (offerAmount - OFFER_STEP >= OFFER_STEP) setOfferAmount(offerAmount - OFFER_STEP);
                    else alert("Minimum offer is Rs. 50");
                  }}
                  className="service-offer-btn"
                  aria-label="Decrease offer"
                >
                  −
                </button>
                <span className="service-offer-amount">Rs. {offerAmount}</span>
                <button
                  type="button"
                  onClick={() => setOfferAmount(offerAmount + OFFER_STEP)}
                  className="service-offer-btn"
                  aria-label="Increase offer"
                >
                  +
                </button>
              </div>
            </div>
            <div className="service-step-actions">
              <button type="button" onClick={() => setStep(2)} className="app-btn app-btn-outline">
                Back
              </button>
              <button type="button" onClick={goNext} className="app-btn app-btn-primary flex-1">
                Find nearest mechanics
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="service-step-card app-fade-in">
            <div className="service-step-header">
              <span className="service-step-badge">Step 4</span>
              <h2 className="service-step-title">Nearby mechanics</h2>
              <p className="service-step-desc">
                {VEHICLES.find((v) => v.id === selectedVehicle)?.label} · {issue === CUSTOM_ISSUE ? customIssueText : issue} · Rs. {offerAmount}
              </p>
            </div>

            {mechanics.length > 0 ? (
              <div className="space-y-3">
                {mechanics.map((m, i) => (
                  <div key={`${m.shopName}-${m.phone}-${i}`} className="app-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <MechanicCard mechanic={m} onBook={handleBook} />
                  </div>
                ))}
              </div>
            ) : searched ? (
              <div>
                <p className="mb-3 text-sm text-[var(--gm-text-muted)]">
                  No FixWheel mechanics in range — suggested local shops from OpenStreetMap (~8 km)
                </p>
                {localShops.length === 0 ? (
                  <p className="app-card app-card-pad text-sm text-[var(--gm-text-muted)]">
                    No shops found. Try a different service location on the map.
                  </p>
                ) : (
                  localShops.map((shop) => <LocalShopCard key={shop.placeId} shop={shop} />)
                )}
              </div>
            ) : (
              <p className="text-sm text-[var(--gm-text-muted)]">Searching…</p>
            )}

            <button type="button" onClick={() => setStep(3)} className="app-btn app-btn-outline mt-4 w-full">
              ← Adjust offer
            </button>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="app-loading">
          <p className="app-loading-pulse">Loading services…</p>
        </div>
      }
    >
      <ServiceSelectionContent />
    </Suspense>
  );
}
