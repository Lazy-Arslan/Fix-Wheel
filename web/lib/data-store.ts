import { prisma } from "@/lib/db";
import { normalizeCnic } from "@/lib/validation";
import type { MechanicProfile } from "@/lib/types";

function haversineKm(
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

function toMechanicProfile(
  m: {
    id: string;
    name: string;
    shopName: string;
    email: string;
    phone: string;
    city: string;
    license: string;
    specialization: string;
    experience: string;
    address: string;
    lat: number;
    lng: number;
  },
  userLat: number,
  userLng: number
): MechanicProfile {
  const distKm = haversineKm(userLat, userLng, m.lat, m.lng);
  return {
    id: m.id,
    name: m.name,
    shopName: m.shopName,
    email: m.email,
    phone: m.phone,
    city: m.city,
    license: m.license,
    specialization: m.specialization,
    experience: m.experience,
    address: m.address,
    lat: m.lat,
    lng: m.lng,
    distanceKm: distKm,
    distance: `${distKm.toFixed(1)} km away`,
    rating: 4.5,
    specialty: `🟢 Available • ${m.specialization}`,
  };
}

export async function saveCustomer(data: {
  name: string;
  cnic: string;
  email: string;
  phone: string;
  city: string;
  bikeModel: string;
  carModel: string;
  address: string;
}) {
  const cnic = normalizeCnic(data.cnic);
  await prisma.customer.create({
    data: {
      name: data.name.trim(),
      cnic,
      email: data.email.trim(),
      phone: data.phone.trim(),
      city: data.city.trim(),
      bikeModel: data.bikeModel.trim(),
      carModel: data.carModel.trim(),
      address: data.address.trim(),
    },
  });
}

export async function getCustomerProfile(name: string, cnic: string) {
  const normalized = normalizeCnic(cnic);
  return prisma.customer.findFirst({
    where: {
      cnic: normalized,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
}

export async function saveMechanic(data: {
  name: string;
  cnic: string;
  email: string;
  phone: string;
  city: string;
  shopName: string;
  license: string;
  specialization: string;
  experience: string;
  address: string;
  lat: number;
  lng: number;
}) {
  const cnic = normalizeCnic(data.cnic);
  await prisma.mechanic.create({
    data: {
      name: data.name.trim(),
      cnic,
      email: data.email.trim(),
      phone: data.phone.trim(),
      city: data.city.trim(),
      shopName: data.shopName.trim(),
      license: data.license.trim(),
      specialization: data.specialization.trim(),
      experience: data.experience.trim(),
      address: data.address.trim(),
      lat: data.lat,
      lng: data.lng,
    },
  });
}

export async function findUserType(
  name: string,
  cnic: string
): Promise<"customer" | "mechanic" | null> {
  const normalizedCnic = normalizeCnic(cnic);

  const customer = await prisma.customer.findFirst({
    where: {
      cnic: normalizedCnic,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
  if (customer) return "customer";

  const mechanic = await prisma.mechanic.findFirst({
    where: {
      cnic: normalizedCnic,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
  if (mechanic) return "mechanic";

  return null;
}

export async function getMechanicProfile(name: string, cnic: string) {
  const normalizedCnic = normalizeCnic(cnic);
  return prisma.mechanic.findFirst({
    where: {
      cnic: normalizedCnic,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
}

export async function getMechanicsNearby(
  userLat: number,
  userLng: number,
  radiusKm: number
): Promise<MechanicProfile[]> {
  const mechanics = await prisma.mechanic.findMany();
  const result: MechanicProfile[] = [];

  for (const m of mechanics) {
    if (m.lat === 0 && m.lng === 0) continue;
    const profile = toMechanicProfile(m, userLat, userLng);
    if (profile.distanceKm <= radiusKm) {
      result.push(profile);
    }
  }

  result.sort((a, b) => a.distanceKm - b.distanceKm);
  return result;
}

export async function getAllMechanicsForMap(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Promise<MechanicProfile[]> {
  return getMechanicsNearby(centerLat, centerLng, radiusKm);
}

/** Re-export for components that used MechanicNearby shape */
export type { MechanicProfile as MechanicNearby };
