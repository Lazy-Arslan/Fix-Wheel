"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";
import { CnicInput } from "@/components/CnicInput";
import { BackButton } from "@/components/layout/BackButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ShopLocationPicker } from "@/components/map/ShopLocationPicker";
import type { ShopLocationValue } from "@/components/map/ShopLocationPicker";
import { SPECIALIZATIONS } from "@/lib/constants";
import {
  validateCnic,
  validateEmail,
  validateName,
  validatePhone,
} from "@/lib/validation";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-bold text-[var(--fw-navy)]">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "mt-1 h-[50px] w-full rounded-lg border border-[var(--fw-border)] bg-[#f8fafc] px-3 text-[15px] outline-none transition focus:border-[var(--fw-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--fw-blue)]/10";

const selectClass = inputClass + " cursor-pointer";

export default function MechanicRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    email: "",
    phone: "",
    city: "",
    shopName: "",
    license: "",
    specialization: SPECIALIZATIONS[0],
    experience: "",
    address: "",
  });
  const [shopLocation, setShopLocation] = useState<ShopLocationValue>({
    lat: 0,
    lng: 0,
    address: "",
    confirmed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.isLoggedIn && session.usertype === "mechanic") {
      router.replace("/mechanic");
    }
  }, [router]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateForm = () => {
    const next: Record<string, string> = {};
    const nameErr = validateName(form.name);
    const cnicErr = validateCnic(form.cnic);
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    if (nameErr) next.name = nameErr;
    if (cnicErr) next.cnic = cnicErr;
    if (emailErr) next.email = emailErr;
    if (phoneErr) next.phone = phoneErr;
    if (!form.city.trim()) next.city = "City is required";
    if (!form.shopName.trim()) next.shopName = "Shop name is required";
    if (!form.license.trim()) next.license = "License number is required";
    if (
      !form.specialization ||
      form.specialization === SPECIALIZATIONS[0]
    ) {
      next.specialization = "Please select a specialization";
    }
    if (
      !shopLocation.confirmed ||
      shopLocation.lat === 0 ||
      shopLocation.lng === 0
    ) {
      next.location =
        "Search or tap the map to set your shop location, then confirm.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/mechanics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lat: shopLocation.lat,
          lng: shopLocation.lng,
          address: shopLocation.address || form.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          return;
        }
        throw new Error();
      }
      alert("Registration successful! Your shop is now listed.");
      router.push("/login");
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--fw-bg)]">
      <SiteHeader />
      <main className="flex-1 py-8">
      <div className="fw-container mx-auto max-w-lg">
        <div className="mb-4">
          <BackButton label="Back" fallbackHref="/register" />
        </div>
        <div className="mb-8 flex flex-col items-center animate-fade-up">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--fw-orange)] to-[#ff8533] text-3xl">
            🔧
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--fw-navy)]">
            Mechanic Registration
          </h1>
          <p className="mt-1 text-sm text-slate-500">List your shop and receive bookings</p>
        </div>

        <div className="fw-card p-6 md:p-8">

        <Field label="Full Name" required>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </Field>

        <Field label="CNIC Number" required>
          <CnicInput
            value={form.cnic}
            onChange={(v) => update("cnic", v)}
            error={errors.cnic}
            className={inputClass}
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </Field>

        <Field label="Phone Number" required>
          <input
            className={inputClass}
            inputMode="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="03001234567"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </Field>

        <Field label="City" required>
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Enter your city"
          />
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </Field>

        <Field label="Shop Name" required>
          <input
            className={inputClass}
            value={form.shopName}
            onChange={(e) => update("shopName", e.target.value)}
            placeholder="Enter your shop name"
          />
          {errors.shopName && (
            <p className="mt-1 text-sm text-red-500">{errors.shopName}</p>
          )}
        </Field>

        <Field label="License Number" required>
          <input
            className={inputClass}
            value={form.license}
            onChange={(e) => update("license", e.target.value)}
            placeholder="Enter your license number"
          />
          {errors.license && (
            <p className="mt-1 text-sm text-red-500">{errors.license}</p>
          )}
        </Field>

        <Field label="Specialization" required>
          <select
            className={selectClass}
            value={form.specialization}
            onChange={(e) => update("specialization", e.target.value)}
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.specialization && (
            <p className="mt-1 text-sm text-red-500">{errors.specialization}</p>
          )}
        </Field>

        <Field label="Years of Experience">
          <input
            className={inputClass}
            inputMode="numeric"
            value={form.experience}
            onChange={(e) => update("experience", e.target.value.replace(/\D/g, ""))}
            placeholder="Enter years of experience"
          />
        </Field>

        <Field label="Shop Address">
          <textarea
            className={`${inputClass} h-20 py-3`}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Street / building details (optional if set on map)"
          />
        </Field>

        <ShopLocationPicker
          value={shopLocation}
          onChange={(loc) => {
            setShopLocation(loc);
            if (errors.location) {
              setErrors((e) => {
                const next = { ...e };
                delete next.location;
                return next;
              });
            }
            if (loc.confirmed && loc.address && !form.address.trim()) {
              update("address", loc.address);
            }
          }}
          error={errors.location}
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="fw-btn fw-btn-primary mb-5 h-12 w-full text-sm"
        >
          {loading ? "Registering…" : "REGISTER"}
        </button>

        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="font-bold text-[var(--fw-blue)] hover:underline">
            Back to Login
          </Link>
        </p>
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
