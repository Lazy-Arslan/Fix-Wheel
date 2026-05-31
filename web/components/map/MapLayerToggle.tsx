"use client";

export type MapFocusMode = "you" | "mechanics" | "booked";

interface MapLayerToggleProps {
  value: MapFocusMode;
  onChange: (mode: MapFocusMode) => void;
  hasBooking: boolean;
  onBookedUnavailable?: () => void;
}

const MODES: {
  id: MapFocusMode;
  label: string;
  dot: string;
  active: string;
  idle: string;
}[] = [
  {
    id: "you",
    label: "You",
    dot: "bg-[#007BFF]",
    active:
      "bg-[#E3F2FD] text-[#0D47A1] ring-2 ring-[#64B5F6] shadow-md scale-[1.03]",
    idle: "bg-white/95 text-[#1565C0] hover:bg-[#E3F2FD]/80",
  },
  {
    id: "mechanics",
    label: "Mechanics",
    dot: "bg-[#FFC107]",
    active:
      "bg-[#FFF8E1] text-[#F57F17] ring-2 ring-[#FFD54F] shadow-md scale-[1.03]",
    idle: "bg-white/95 text-[#F9A825] hover:bg-[#FFF8E1]/80",
  },
  {
    id: "booked",
    label: "Booked",
    dot: "bg-[#2E7D32]",
    active:
      "bg-[#E8F5E9] text-[#1B5E20] ring-2 ring-[#81C784] shadow-md scale-[1.03]",
    idle: "bg-white/95 text-[#388E3C] hover:bg-[#E8F5E9]/80",
  },
];

export function MapLayerToggle({
  value,
  onChange,
  hasBooking,
  onBookedUnavailable,
}: MapLayerToggleProps) {
  return (
    <div className="flex justify-center gap-2 px-4 py-2.5">
      {MODES.map((mode) => {
        const isActive = value === mode.id;
        const isBooked = mode.id === "booked";
        const disabled = isBooked && !hasBooking;

        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) {
                onBookedUnavailable?.();
                return;
              }
              onChange(mode.id);
            }}
            className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all duration-200 ease-out ${
              isActive ? mode.active : mode.idle
            } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow-sm ${mode.dot} ${
                isActive ? "animate-pulse" : ""
              }`}
            />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
