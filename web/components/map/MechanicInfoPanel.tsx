"use client";

import type { MechanicProfile } from "@/lib/types";
import { dialPhone, formatPhoneDisplay, telHref } from "@/lib/phone";

interface MechanicInfoPanelProps {
  mechanic: MechanicProfile | null;
  onClose: () => void;
}

function shopAvatarUrl(shopName: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(shopName)}&size=120&background=003D82&color=fff&bold=true`;
}

export function MechanicInfoPanel({ mechanic, onClose }: MechanicInfoPanelProps) {
  if (!mechanic) return null;

  const canCall = !!telHref(mechanic.phone ?? "");

  const handleCall = () => {
    if (!dialPhone(mechanic.phone ?? "")) {
      alert("Phone number not available for this mechanic.");
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 max-h-[70vh] overflow-y-auto rounded-xl bg-white p-4 shadow-xl transition-all duration-200">
      <div className="mb-3 flex items-start gap-3">
        <img
          src={shopAvatarUrl(mechanic.shopName)}
          alt={mechanic.shopName}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#003D82]">
                {mechanic.shopName}
              </h3>
              <span className="mt-1 inline-block rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-semibold text-[#2E7D32] ring-1 ring-[#A5D6A7]">
                {mechanic.name}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-lg leading-none text-[#999] hover:text-[#333]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#1565C0]">
            {mechanic.distance} · ★ {mechanic.rating}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[#444]">
        <p>
          <span className="font-semibold text-[#003366]">Specialization: </span>
          {mechanic.specialization}
        </p>
        {mechanic.experience && (
          <p>
            <span className="font-semibold text-[#003366]">Experience: </span>
            {mechanic.experience} year(s)
          </p>
        )}
        <p>
          <span className="font-semibold text-[#003366]">City: </span>
          {mechanic.city}
        </p>
        {mechanic.address && (
          <p>
            <span className="font-semibold text-[#003366]">Address: </span>
            {mechanic.address}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleCall}
        disabled={!canCall}
        className="mt-4 w-full cursor-pointer rounded-lg bg-[#003D82] py-3 text-sm font-bold text-white transition-colors hover:bg-[#004a99] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        📞 Call {formatPhoneDisplay(mechanic.phone ?? "") || "mechanic"}
      </button>

      <p className="mt-3 text-center text-[10px] text-[#AAA]">
        Registered FixWheel mechanic · License {mechanic.license || "on file"}
      </p>
    </div>
  );
}
