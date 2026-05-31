"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { clearSession, getSession } from "@/lib/session";

export type AppNavId =
  | "map"
  | "services"
  | "mechanic"
  | "profile"
  | "history"
  | "booking";

type NavItem = {
  id: AppNavId;
  label: string;
  href: string;
  icon: string;
  description?: string;
  roles: ("customer" | "mechanic")[];
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "map",
    label: "Service location",
    href: "/map",
    icon: "📍",
    description: "Pin where you need help",
    roles: ["customer"],
  },
  {
    id: "services",
    label: "Book a service",
    href: "/services",
    icon: "🔧",
    description: "Vehicle & issue",
    roles: ["customer"],
  },
  {
    id: "booking",
    label: "My booking",
    href: "/booking",
    icon: "🛞",
    description: "Status, price & cancel",
    roles: ["customer"],
  },
  {
    id: "mechanic",
    label: "Bookings",
    href: "/mechanic",
    icon: "📋",
    description: "Manage requests",
    roles: ["mechanic"],
  },
  {
    id: "profile",
    label: "Personal information",
    href: "/profile",
    icon: "👤",
    description: "Account & contact details",
    roles: ["customer", "mechanic"],
  },
  {
    id: "history",
    label: "History",
    href: "/history",
    icon: "🕐",
    description: "Past bookings & payments",
    roles: ["customer", "mechanic"],
  },
];

type AppSidebarProps = {
  open: boolean;
  onClose: () => void;
  role: "customer" | "mechanic";
  activeNav?: AppNavId;
};

function resolveServicesHref(): string {
  if (typeof window === "undefined") return "/map";
  const lat = sessionStorage.getItem("fixwheel_last_lat");
  const lng = sessionStorage.getItem("fixwheel_last_lng");
  if (lat && lng) return `/services?lat=${lat}&lng=${lng}`;
  return "/map";
}

export function AppSidebar({ open, onClose, role, activeNav }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = getSession();
  const nav = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const logout = () => {
    clearSession();
    onClose();
    router.replace("/login");
  };

  const hrefFor = (item: NavItem) => {
    if (item.id === "services") return resolveServicesHref();
    return item.href;
  };

  const isActive = (item: NavItem) => {
    if (activeNav) return activeNav === item.id;
    if (item.id === "map") return pathname === "/map";
    if (item.id === "mechanic") return pathname === "/mechanic";
    if (item.id === "services") return pathname.startsWith("/services");
    if (item.id === "profile") return pathname === "/profile";
    if (item.id === "history") return pathname === "/history";
    if (item.id === "booking") return pathname === "/booking";
    return false;
  };

  return (
    <>
      <div
        className={`app-drawer-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`app-drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="Navigation menu"
      >
        <div className="app-drawer-header">
          <FixWheelLogo size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-[var(--gm-text)]">
              {session?.username ?? "FixWheel"}
            </p>
            <p className="text-xs font-semibold capitalize text-[var(--gm-orange)]">
              {role} account
            </p>
          </div>
          <button type="button" className="app-icon-btn" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="app-drawer-nav">
          {nav.map((item, i) => {
            const active = isActive(item);
            return (
              <Link
                key={item.id}
                href={hrefFor(item)}
                onClick={onClose}
                className={`app-nav-item app-fade-in ${active ? "active" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="app-nav-icon">{item.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{item.label}</span>
                  {item.description && (
                    <span className="block text-[11px] font-medium text-[var(--gm-text-muted)]">
                      {item.description}
                    </span>
                  )}
                </span>
                {active && <span className="app-nav-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="app-drawer-footer">
          <button type="button" onClick={logout} className="app-btn app-btn-outline w-full">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
