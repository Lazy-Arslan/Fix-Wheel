"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/session";
import type { BookingRecord } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function HistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
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

    fetch(
      `/api/bookings?role=${userRole}&name=${encodeURIComponent(session.username)}&cnic=${encodeURIComponent(session.usercnic)}&history=true`
    )
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="app-loading">
        <p className="app-loading-pulse">Loading history…</p>
      </div>
    );
  }

  return (
    <AppShell role={role} activeNav="history" title="History" subtitle="Past bookings & payments">
      <div className="app-page">
        {bookings.length === 0 ? (
          <div className="app-card app-card-pad text-center text-sm text-[var(--gm-text-muted)]">
            No completed or cancelled bookings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => (
              <div
                key={b.id}
                className="app-card app-card-pad app-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[var(--gm-text)]">
                      {role === "customer" ? b.mechanicName : b.customerName}
                    </p>
                    <p className="text-sm text-[var(--gm-text-muted)]">{b.issueDisplay}</p>
                  </div>
                  <span
                    className={`app-chip ${
                      b.status === "completed" ? "app-chip-green" : "app-chip-orange"
                    }`}
                  >
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 border-t border-[var(--gm-border)] pt-3 text-sm">
                  <span>
                    <span className="text-[var(--gm-text-muted)]">Paid: </span>
                    <strong className="text-[var(--gm-orange)]">
                      Rs. {b.agreedPrice ?? b.currentPrice}
                    </strong>
                  </span>
                  {b.mechanicShop && (
                    <span className="text-[var(--gm-text-muted)]">{b.mechanicShop}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
