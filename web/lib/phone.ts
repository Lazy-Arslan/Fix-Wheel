/** Digits only (local Pakistani formats). */
export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** `tel:` link for mobile dialers (+92 for local 03xx numbers). */
export function telHref(phone: string): string | null {
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 10) return null;

  if (digits.length === 11 && digits.startsWith("0")) {
    return `tel:+92${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `tel:+92${digits}`;
  }
  if (digits.startsWith("92")) {
    return `tel:+${digits}`;
  }
  return `tel:+${digits}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return phone.trim() || digits;
}

export function dialPhone(phone: string): boolean {
  const href = telHref(phone);
  if (!href) return false;
  window.location.href = href;
  return true;
}
