"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CnicInput } from "@/components/CnicInput";
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
      <label className="mb-0 block text-sm font-bold text-[#333333]">
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "mt-1 h-[50px] w-full rounded-lg border-2 border-[#CCCCCC] bg-white px-3 text-[15px] outline-none focus:border-[#003D82]";

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
    <div className="min-h-screen overflow-y-auto bg-[#f5f5f5]">
      <div className="mx-auto max-w-lg p-5">
        <div className="mb-8 flex flex-col items-center">
          <span className="text-6xl" role="img" aria-label="Customer">
            👤
          </span>
          <h1 className="mt-2.5 text-2xl font-bold text-[#003366]">
            Customer Registration
          </h1>
        </div>

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
          className="mb-5 h-[50px] w-full cursor-pointer rounded-[10px] bg-[#003366] text-base font-bold text-white transition-all hover:bg-[#004080] hover:shadow-md active:scale-[0.99] disabled:opacity-70"
        >
          REGISTER
        </button>

        <p className="text-center text-sm">
          <Link href="/login" className="cursor-pointer text-[#003D82] hover:underline">
            Already registered? Login
          </Link>
        </p>
      </div>
    </div>
  );
}
