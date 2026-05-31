"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
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

      if (data.userType === "mechanic") {
        router.replace("/mechanic");
      } else {
        router.replace("/map");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{
        background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
      }}
    >
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-12">
        <div className="mb-8 flex flex-col items-center pt-8">
          <FixWheelLogo size={110} />
          <h1 className="mt-3 text-[32px] font-bold tracking-wide text-[#003D82]">
            FixWheel
          </h1>
          <p className="mt-1.5 text-[13px] text-[#667799]">
            Digital Vehicle Service Platform
          </p>
        </div>

        <div className="w-full rounded-2xl bg-white p-7 shadow-lg">
          <h2 className="text-[22px] font-bold text-[#003D82]">Welcome to FixWheel</h2>
          <p className="mb-6 mt-1 text-[13px] text-[#999999]">Sign in to continue</p>

          <label className="mb-1.5 block text-[13px] font-bold text-[#003D82]">
            Full Name
          </label>
          <div className="mb-4 flex h-[52px] items-center rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] px-3.5">
            <span className="mr-2.5 text-lg">👤</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="flex-1 bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#BBBBBB]"
            />
          </div>
          {nameError && <p className="-mt-3 mb-3 text-sm text-red-500">{nameError}</p>}

          <label className="mb-1.5 block text-[13px] font-bold text-[#003D82]">
            CNIC Number
          </label>
          <div className="mb-2 flex h-[52px] items-center rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] px-3.5">
            <span className="mr-2.5 text-lg">🪪</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={13}
              value={cnic}
              onChange={(e) =>
                setCnic(e.target.value.replace(/\D/g, "").slice(0, 13))
              }
              placeholder="13-digit CNIC"
              className="flex-1 bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#BBBBBB]"
            />
          </div>
          {cnicError && <p className="mb-4 text-sm text-red-500">{cnicError}</p>}
          {!cnicError && cnic.length > 0 && cnic.length < 13 && (
            <p className="mb-4 text-xs text-[#999999]">
              {13 - cnic.length} digit(s) remaining
            </p>
          )}
          {!cnicError && (cnic.length === 0 || cnic.length === 13) && (
            <div className="mb-5" />
          )}

          <button
            type="button"
            onClick={validateAndLogin}
            disabled={loading}
            className="mb-5 h-[52px] w-full cursor-pointer rounded-lg bg-[#003D82] text-base font-bold tracking-widest text-white transition-colors hover:bg-[#004a99] disabled:opacity-70"
          >
            LOGIN
          </button>

          <div className="mb-5 flex items-center">
            <div className="h-px flex-1 bg-[#E0E0E0]" />
            <span className="px-2 text-xs text-[#AAAAAA]">OR</span>
            <div className="h-px flex-1 bg-[#E0E0E0]" />
          </div>

          <p className="text-center text-sm text-[#666666]">
            New User?{" "}
            <Link href="/register" className="cursor-pointer font-bold text-[#003D82] hover:underline">
              Register Now
            </Link>
          </p>
        </div>

        <div className="h-8" />
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#003D82]">Account Not Found</h3>
            <p className="mt-2 text-sm text-[#666666]">
              No account found with this Name and CNIC.
              <br />
              <br />
              Please register first to continue.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-[#666666]"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="cursor-pointer rounded-lg bg-[#003D82] px-4 py-2 text-sm font-bold text-white hover:bg-[#004a99]"
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
