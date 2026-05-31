"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CnicInput } from "@/components/CnicInput";
import { BackButton } from "@/components/layout/BackButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PAKISTAN_BIKES, PAKISTAN_CARS } from "@/lib/vehicles-pakistan";
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

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    email: "",
    phone: "",
    city: "",
    bikeModel: PAKISTAN_BIKES[0],
    carModel: PAKISTAN_CARS[0],
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          return;
        }
        throw new Error();
      }
      alert("Registration successful! You can now login.");
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
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--fw-navy)] to-[var(--fw-blue)] text-3xl">
            👤
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[var(--fw-navy)]">
            Customer Registration
          </h1>
          <p className="mt-1 text-sm text-slate-500">Join and book services in minutes</p>
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

        <Field label="Bike Model">
          <select
            className={selectClass}
            value={form.bikeModel}
            onChange={(e) => update("bikeModel", e.target.value)}
          >
            {PAKISTAN_BIKES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Car Model">
          <select
            className={selectClass}
            value={form.carModel}
            onChange={(e) => update("carModel", e.target.value)}
          >
            {PAKISTAN_CARS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Address">
          <textarea
            className={`${inputClass} h-20 py-3`}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Enter your address"
          />
        </Field>

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
            Already registered? Login
          </Link>
        </p>
        </div>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
