/** CNIC: exactly 13 digits (stored without dashes). */
export function normalizeCnic(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateCnic(value: string): string | null {
  const digits = normalizeCnic(value);
  if (!digits) return "CNIC is required";
  if (digits.length !== 13) {
    return "CNIC must be exactly 13 digits";
  }
  return null;
}

export function validateName(value: string): string | null {
  if (!value.trim()) return "Name is required";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Enter a valid email address";
  }
  return null;
}

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Phone number is required";
  if (digits.length < 10 || digits.length > 11) {
    return "Enter a valid Pakistani phone number (10–11 digits)";
  }
  return null;
}
