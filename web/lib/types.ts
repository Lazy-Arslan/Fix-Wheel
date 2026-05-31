export interface MechanicProfile {
  id?: string;
  name: string;
  shopName: string;
  email: string;
  phone: string;
  city: string;
  specialization: string;
  experience: string;
  address: string;
  license: string;
  lat: number;
  lng: number;
  distanceKm: number;
  distance: string;
  rating: number;
  specialty: string;
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
}

export interface LocalShop {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  openNow?: boolean;
  photoUrl?: string;
  distanceKm: number;
  distance: string;
}

export type BookingStatus =
  | "pending"
  | "countered"
  | "confirmed"
  | "completion_pending"
  | "completed"
  | "cancelled";

export interface BookingRecord {
  id: string;
  customerCnic: string;
  customerName: string;
  mechanicId: string;
  mechanicName: string;
  mechanicShop: string;
  mechanicLat: number;
  mechanicLng: number;
  vehicle: string;
  issue: string;
  customIssue: string;
  issueDisplay: string;
  customerLat: number;
  customerLng: number;
  offerAmount: number;
  mechanicCounter: number | null;
  agreedPrice: number | null;
  currentPrice: number;
  status: BookingStatus;
  mechanicCompleted: boolean;
  customerCompleted: boolean;
  etaMinutes: number | null;
  etaDisplay: string | null;
  createdAt: string;
  updatedAt: string;
}
