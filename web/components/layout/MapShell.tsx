"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar, type AppNavId } from "@/components/layout/AppSidebar";

type MapShellProps = {
  activeNav?: AppNavId;
  /** Floating search + controls over the map */
  mapOverlay?: ReactNode;
  /** Bottom sheet content */
  bottomSheet: ReactNode;
  children: ReactNode;
};

export function MapShell({
  activeNav = "map",
  mapOverlay,
  bottomSheet,
  children,
}: MapShellProps) {
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
    <div className="map-shell">
      <AppSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        role="customer"
        activeNav={activeNav}
      />

      <button
        type="button"
        className="map-fab map-fab-menu"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <span className="map-fab-line" />
        <span className="map-fab-line" />
        <span className="map-fab-line" />
      </button>

      <div className="map-shell-viewport">
        {children}
        {mapOverlay && <div className="map-overlay-layer">{mapOverlay}</div>}
      </div>

      <div className="map-bottom-sheet">{bottomSheet}</div>
    </div>
  );
}
