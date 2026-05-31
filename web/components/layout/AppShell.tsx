"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FixWheelLogo } from "@/components/FixWheelLogo";
import { AppSidebar, type AppNavId } from "@/components/layout/AppSidebar";

type AppShellProps = {
  role: "customer" | "mechanic";
  title: string;
  subtitle?: string;
  activeNav?: AppNavId;
  /** Full viewport height layout (map screen) */
  fullHeight?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
};

export function AppShell({
  role,
  title,
  subtitle,
  activeNav,
  fullHeight = false,
  headerExtra,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className={`app-shell ${fullHeight ? "app-shell-full" : ""}`}>
      <AppSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        role={role}
        activeNav={activeNav}
      />

      <header className="app-topbar">
        <button
          type="button"
          className="app-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="app-menu-line" />
          <span className="app-menu-line" />
          <span className="app-menu-line" />
        </button>
        <div className="min-w-0 flex-1 px-2">
          <h1 className="truncate text-sm font-extrabold text-[var(--gm-text)] md:text-base">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[11px] font-medium text-[var(--gm-text-muted)] md:text-xs">
              {subtitle}
            </p>
          )}
        </div>
        <FixWheelLogo size={32} className="shrink-0 opacity-90" />
      </header>

      {headerExtra && <div className="app-topbar-extra">{headerExtra}</div>}

      <main className={`app-main ${fullHeight ? "app-main-full" : ""}`}>{children}</main>
    </div>
  );
}
