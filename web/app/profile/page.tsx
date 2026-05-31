"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/session";

type ProfileData = {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  cnic?: string;
  shopName?: string;
  specialization?: string;
  license?: string;
  experience?: string;
  address?: string;
  bikeModel?: string;
  carModel?: string;
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <div className="app-detail-row">
      <p className="app-detail-label">{label}</p>
      <p className="app-detail-value">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [role, setRole] = useState<"customer" | "mechanic">("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session?.isLoggedIn) {
      router.replace("/login");
      return;
    }

    const userRole = session.usertype === "mechanic" ? "mechanic" : "customer";
    setRole(userRole);

    const url =
      userRole === "mechanic"
        ? `/api/mechanics/profile?name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}`
        : `/api/customers/profile?name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
        else setProfile({ name: session.username, cnic: session.usercnic });
      })
      .catch(() => setProfile({ name: session.username, cnic: session.usercnic }))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="app-loading">
        <p className="app-loading-pulse">Loading profile…</p>
      </div>
    );
  }

  return (
    <AppShell role={role} activeNav="profile" title="Personal information" subtitle="Your account">
      <div className="app-page">
        <div className="app-card app-card-pad app-fade-in">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 text-2xl">
              👤
            </div>
            <div>
              <p className="text-lg font-extrabold text-[var(--gm-text)]">{profile?.name}</p>
              <p className="text-sm capitalize text-[var(--gm-orange)]">{role} account</p>
            </div>
          </div>

          <InfoRow label="Full name" value={profile?.name} />
          <InfoRow label="CNIC" value={profile?.cnic} />
          <InfoRow label="Email" value={profile?.email} />
          <InfoRow label="Phone" value={profile?.phone} />
          <InfoRow label="City" value={profile?.city} />
          <InfoRow label="Address" value={profile?.address} />

          {role === "customer" && (
            <>
              <InfoRow label="Car model" value={profile?.carModel} />
              <InfoRow label="Bike model" value={profile?.bikeModel} />
            </>
          )}

          {role === "mechanic" && (
            <>
              <InfoRow label="Shop name" value={profile?.shopName} />
              <InfoRow label="Specialization" value={profile?.specialization} />
              <InfoRow label="License" value={profile?.license} />
              <InfoRow label="Experience" value={profile?.experience ? `${profile.experience} years` : undefined} />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
