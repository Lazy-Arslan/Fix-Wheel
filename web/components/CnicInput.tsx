"use client";

import { normalizeCnic } from "@/lib/validation";

interface CnicInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  showHint?: boolean;
}

/** Allows digits only; stores up to 13 digits. */
export function CnicInput({
  value,
  onChange,
  error,
  className = "",
  placeholder = "Enter 13-digit CNIC (numbers only)",
  showHint = true,
}: CnicInputProps) {
  const handleChange = (raw: string) => {
    onChange(normalizeCnic(raw).slice(0, 13));
  };

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        maxLength={13}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        aria-invalid={!!error}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {showHint && !error && value.length > 0 && value.length < 13 && (
        <p className="mt-1 text-xs text-[#999999]">
          {13 - value.length} digit(s) remaining
        </p>
      )}
    </>
  );
}
