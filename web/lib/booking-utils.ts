/** Average city driving speed for ETA estimate (km/h) */
const AVG_SPEED_KMH = 30;
const ETA_BUFFER_MIN = 5;

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateEtaMinutes(
  mechanicLat: number,
  mechanicLng: number,
  customerLat: number,
  customerLng: number
): number {
  if (
    (mechanicLat === 0 && mechanicLng === 0) ||
    (customerLat === 0 && customerLng === 0)
  ) {
    return 30;
  }
  const distKm = haversineKm(mechanicLat, mechanicLng, customerLat, customerLng);
  const travelMin = (distKm / AVG_SPEED_KMH) * 60;
  return Math.max(5, Math.round(travelMin + ETA_BUFFER_MIN));
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}
