"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { setSession } from "@/lib/session";
import { validateCnic, validateName } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [nameError, setNameError] = useState("");
  const [cnicError, setCnicError] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateAndLogin = async () => {
    setNameError("");
    setCnicError("");
    const nameErr = validateName(name);
    const cnicErr = validateCnic(cnic);
    if (nameErr) setNameError(nameErr);
    if (cnicErr) setCnicError(cnicErr);
    if (nameErr || cnicErr) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cnic }),
      });
      if (res.status === 404) {
        setShowDialog(true);
        return;
      }
      if (res.status === 400) {
        const data = await res.json();
        alert(data.error ?? "Invalid login details");
        return;
      }
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setSession({
        username: data.username,
        usercnic: data.usercnic,
        usertype: data.userType,
      });
      router.replace(data.userType === "mechanic" ? "/mechanic" : "/map");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gm-bg-soft)]">
      <SiteHeader />

      <main className="flex flex-1 flex-col lg:flex-row">
        <div className="relative hidden min-h-[320px] flex-1 lg:block">
          <Image
            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=80"
            alt="Car service"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-10 left-10 max-w-sm text-white">
            <FixWheelLogo size={64} />
            <p className="mt-4 text-2xl font-extrabold">Login to FixWheel</p>
            <p className="mt-2 text-sm text-white/80">
              Book trusted mechanics. Track service live. Pay fair prices.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center lg:hidden">
              <FixWheelLogo size={56} className="mx-auto" />
              <h1 className="mt-3 text-xl font-extrabold text-[var(--gm-text)]">Login</h1>
            </div>

            <div className="rounded-xl border border-[var(--gm-border)] bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 hidden text-lg font-bold text-[var(--gm-text)] lg:block">Sign in</h2>
              <p className="mb-6 text-sm text-[var(--gm-text-muted)]">Use your registered name and CNIC</p>

              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--gm-text-muted)]">
                Full Name
              </label>
              <div className="fw-input-wrap mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              {nameError && <p className="-mt-3 mb-3 text-sm text-red-500">{nameError}</p>}

              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[var(--gm-text-muted)]">
                CNIC Number
              </label>
              <div className="fw-input-wrap mb-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={13}
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="13-digit CNIC"
                />
              </div>
              {cnicError && <p className="mb-4 text-sm text-red-500">{cnicError}</p>}
              {!cnicError && <div className="mb-4" />}

              <button
                type="button"
                onClick={validateAndLogin}
                disabled={loading}
                className="gm-btn gm-btn-orange h-12 w-full text-sm uppercase tracking-wide"
              >
                {loading ? "Signing in…" : "Login"}
              </button>

              <p className="mt-6 text-center text-sm text-[var(--gm-text-muted)]">
                New user?{" "}
                <Link href="/register" className="font-bold text-[var(--gm-orange)] hover:underline">
                  Register now
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-bold text-[var(--gm-text)]">Account not found</h3>
            <p className="mt-2 text-sm text-[var(--gm-text-muted)]">
              Please register first to continue.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDialog(false)} className="gm-btn gm-btn-outline h-10 px-4 text-sm">
                Try again
              </button>
              <button type="button" onClick={() => router.push("/register")} className="gm-btn gm-btn-orange h-10 px-4 text-sm">
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
