"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { clearSession, getSession, type Session } from "@/lib/session";

const NAV = [
  { href: "/#services", label: "Services" },
  { href: "/#locations", label: "Locations" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQs" },
  { href: "/#contact", label: "Contact Us" },
];

export function GoMechanicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const logout = () => {
    clearSession();
    setSession(null);
    router.replace("/login");
  };

  const dash =
    session?.usertype === "mechanic"
      ? "/mechanic"
      : session?.usertype === "customer"
        ? "/map"
        : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--gm-border)] bg-white shadow-sm">
      <div className="flex h-[60px] w-full items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 transition hover:opacity-90">
          <FixWheelLogo size={38} />
          <span className="hidden text-lg font-extrabold text-[var(--gm-text)] sm:block">
            FixWheel
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 xl:gap-10 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[var(--gm-text-muted)] transition hover:text-[var(--gm-orange)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                {dash && (
                  <Link
                    href={dash}
                    className="text-xs font-semibold text-[var(--gm-text-muted)] hover:text-[var(--gm-orange)]"
                  >
                    Dashboard
                  </Link>
                )}
                <button type="button" onClick={logout} className="gm-btn gm-btn-outline h-9 px-3 text-xs">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[var(--gm-text-muted)] hover:text-[var(--gm-orange)]"
                >
                  Login
                </Link>
                <Link href="/register" className="gm-btn gm-btn-orange h-9 px-4 text-xs">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--gm-border)] lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--gm-border)] bg-white px-4 py-4 lg:hidden">
          <div className="mb-3 flex flex-wrap gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-[var(--gm-border)] px-3 py-1.5 text-xs font-semibold text-[var(--gm-text)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {session ? (
            <button type="button" onClick={logout} className="gm-btn gm-btn-outline h-10 w-full text-sm">
              Logout
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className="gm-btn gm-btn-outline h-10 text-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="gm-btn gm-btn-orange h-10 text-sm" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  const dash =
    session?.usertype === "mechanic"
      ? "/mechanic"
      : session?.usertype === "customer"
        ? "/map"
        : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--gm-border)] bg-white shadow-sm">
      <div className="flex h-14 w-full items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <FixWheelLogo size={32} />
          <span className="font-extrabold text-[var(--gm-text)]">FixWheel</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/#faq" className="hidden text-xs font-semibold text-[var(--gm-text-muted)] hover:text-[var(--gm-orange)] sm:block">
            FAQs
          </Link>
          <Link href="/#contact" className="hidden text-xs font-semibold text-[var(--gm-text-muted)] hover:text-[var(--gm-orange)] sm:block">
            Contact
          </Link>
          {dash && (
            <Link href={dash} className="text-xs font-semibold text-[var(--gm-text-muted)] hover:text-[var(--gm-orange)]">
              Dashboard
            </Link>
          )}
          {session ? (
            <button type="button" onClick={logout} className="gm-btn gm-btn-outline h-9 px-3 text-xs">
              Logout
            </button>
          ) : (
            <Link href="/login" className="gm-btn gm-btn-orange h-9 px-4 text-xs">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const s = getSession();
    if (s) setUsername(s.username);
  }, []);

  const logout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div className="border-b border-[var(--gm-border)] bg-white">
      <div className="gm-container flex items-center justify-between py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/">
            <FixWheelLogo size={34} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-[var(--gm-text)]">{title}</h1>
            {subtitle && <p className="truncate text-xs text-[var(--gm-text-muted)]">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {username && (
            <span className="hidden max-w-[90px] truncate text-xs text-[var(--gm-text-muted)] sm:block">
              {username}
            </span>
          )}
          <button type="button" onClick={logout} className="gm-btn gm-btn-outline h-8 px-3 text-[11px]">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
