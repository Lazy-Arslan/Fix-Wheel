"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MechanicCard } from "@/components/MechanicCard";
import { LocalShopCard } from "@/components/LocalShopCard";
import type { MechanicProfile } from "@/lib/types";
import type { LocalShop } from "@/lib/types";
import {
  CUSTOM_ISSUE,
  DELIVERY_PRICE,
  ISSUE_CHARGES,
  ISSUES_WITH_CUSTOM,
  OFFER_STEP,
  RADIUS_KM,
} from "@/lib/constants";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { getSession } from "@/lib/session";

const VEHICLES = [
  { id: "car", emoji: "🚗", label: "Car" },
  { id: "bike", emoji: "🏍️", label: "Bike" },
  { id: "ebike", emoji: "🛵", label: "E-Bike" },
  { id: "truck", emoji: "🚛", label: "Truck" },
  { id: "rickshaw", emoji: "🛺", label: "Rickshaw" },
];

function ServiceSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userLat = parseFloat(searchParams.get("lat") ?? "0");
  const userLng = parseFloat(searchParams.get("lng") ?? "0");

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
    if (!session?.isLoggedIn) {
      router.replace("/login");
    }
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
    const res = await fetch(
      `/api/osm/nearby-shops?lat=${userLat}&lng=${userLng}`
    );
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

    const res = await fetch(
      `/api/mechanics/nearby?lat=${userLat}&lng=${userLng}&radius=${RADIUS_KM}`
    );
    const data = await res.json();
    const list: MechanicProfile[] = data.mechanics ?? [];
    setMechanics(list);

    if (list.length === 0) {
      await loadLocalShops();
      alert(
        "No registered FixWheel mechanics within 20 km. See suggested local shops below."
      );
    } else {
      setLocalShops([]);
      alert(`${list.length} mechanic(s) found near you!`);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#F5F7FB]">
      <header className="bg-[#0D47A1] px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <FixWheelLogo size={32} />
          <h1 className="text-lg font-bold">FixWheel Services</h1>
        </div>
      </header>

      <div className="p-4">
        <h2 className="mb-3 text-base font-bold text-[#003366]">Select Vehicle</h2>
        <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1">
          {VEHICLES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedVehicle(v.id)}
              className={`flex h-[90px] w-[90px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl p-2 transition-transform hover:scale-[1.02] ${
                selectedVehicle === v.id
                  ? "border-2 border-[#003D82] bg-[#D6E4FF]"
                  : "border border-[#DDDDDD] bg-white"
              }`}
            >
              <span className="text-3xl">{v.emoji}</span>
              <span className="mt-1.5 text-xs font-bold text-[#003366]">
                {v.label}
              </span>
            </button>
          ))}
        </div>

        <h2 className="mb-2 text-base font-bold text-[#003366]">Select Issue</h2>
        <div className="mb-3 flex min-h-[52px] items-center rounded-xl bg-white px-3.5 shadow-sm">
          <span className="mr-2.5 text-lg">🔧</span>
          <select
            value={issue}
            onChange={(e) => updateCharges(e.target.value)}
            className="flex-1 cursor-pointer bg-transparent text-sm outline-none"
          >
            {ISSUES_WITH_CUSTOM.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        {issue === CUSTOM_ISSUE && (
          <div className="mb-5">
            <label className="mb-1 block text-sm font-bold text-[#333]">
              Describe your issue *
            </label>
            <textarea
              value={customIssueText}
              onChange={(e) => setCustomIssueText(e.target.value)}
              placeholder="e.g. AC not cooling, strange noise from engine..."
              className="h-20 w-full rounded-lg border-2 border-[#CCC] px-3 py-2 text-sm outline-none focus:border-[#003D82]"
            />
          </div>
        )}

        <div className="mb-5 rounded-xl bg-white p-[18px] shadow-md">
          <h3 className="mb-3 text-base font-bold text-[#003366]">
            Estimated Charges
          </h3>
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-[#777777]">Service Charges</span>
            <span className="text-[#333333]">Rs. {servicePrice}</span>
          </div>
          <div className="mb-3.5 flex justify-between text-[13px]">
            <span className="text-[#777777]">Delivery Charges</span>
            <span className="text-[#333333]">Rs. {DELIVERY_PRICE}</span>
          </div>
          <div className="mb-3.5 h-px bg-[#EEEEEE]" />
          <p className="mb-2.5 text-[13px] text-[#777777]">Your Offer</p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (offerAmount - OFFER_STEP >= OFFER_STEP) {
                  setOfferAmount(offerAmount - OFFER_STEP);
                } else {
                  alert("Minimum offer is Rs. 50");
                }
              }}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-[#003D82] text-2xl text-white"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#003D82]">
              Rs. {offerAmount}
            </span>
            <button
              type="button"
              onClick={() => setOfferAmount(offerAmount + OFFER_STEP)}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg bg-[#003D82] text-2xl text-white"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#AAAAAA]">
            Adjust your offer. Mechanics will respond to your price.
          </p>
        </div>

        <button
          type="button"
          onClick={findNearbyMechanics}
          className="mb-5 h-[55px] w-full cursor-pointer rounded-lg bg-[#003D82] text-base font-bold text-white hover:bg-[#004a99]"
        >
          FIND NEAREST MECHANICS
        </button>

        {mechanics.length > 0 && (
          <>
            <h2 className="mb-2.5 text-lg font-bold text-[#003366]">
              Nearby Mechanics
            </h2>
            {mechanics.map((m, i) => (
              <MechanicCard
                key={`${m.shopName}-${m.phone}-${i}`}
                mechanic={m}
                onBook={handleBook}
              />
            ))}
          </>
        )}

        {searched && mechanics.length === 0 && (
          <>
            <h2 className="mb-1 text-lg font-bold text-[#003366]">
              Suggested local shops nearby
            </h2>
            <p className="mb-3 text-xs text-[#888]">
              Not on FixWheel yet — local car repair shops from OpenStreetMap (~8 km)
            </p>
            {localShops.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-sm text-[#666] shadow-sm">
                No shops found in OpenStreetMap for this area. Try a different service location.
              </p>
            ) : (
              localShops.map((shop) => (
                <LocalShopCard key={shop.placeId} shop={shop} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FB] p-4">Loading...</div>
      }
    >
      <ServiceSelectionContent />
    </Suspense>
  );
}
