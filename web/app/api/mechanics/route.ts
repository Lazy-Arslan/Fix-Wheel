import { NextResponse } from "next/server";
import { saveMechanic } from "@/lib/data-store";
import {
  validateCnic,
  validateEmail,
  validateName,
  validatePhone,
  normalizeCnic,
} from "@/lib/validation";
import { SPECIALIZATIONS } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    name,
    cnic,
    email,
    phone,
    city,
    shopName,
    license,
    specialization,
    experience,
    address,
    lat,
    lng,
  } = body;

  const errors: Record<string, string> = {};
  const nameErr = validateName(name ?? "");
  const cnicErr = validateCnic(cnic ?? "");
  const emailErr = validateEmail(email ?? "");
  const phoneErr = validatePhone(phone ?? "");
  if (nameErr) errors.name = nameErr;
  if (cnicErr) errors.cnic = cnicErr;
  if (emailErr) errors.email = emailErr;
  if (phoneErr) errors.phone = phoneErr;
  if (!city?.trim()) errors.city = "City is required";
  if (!shopName?.trim()) errors.shopName = "Shop name is required";
  if (!license?.trim()) errors.license = "License number is required";
  if (
    !specialization?.trim() ||
    specialization === SPECIALIZATIONS[0]
  ) {
    errors.specialization = "Please select a specialization";
  }

  const latNum = parseFloat(String(lat ?? 0));
  const lngNum = parseFloat(String(lng ?? 0));
  if (latNum === 0 && lngNum === 0) {
    errors.location =
      "Shop location is required. Search or pick a point on the map.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    await saveMechanic({
      name,
      cnic: normalizeCnic(cnic),
      email,
      phone,
      city,
      shopName,
      license,
      specialization,
      experience: experience ?? "",
      address: address ?? "",
      lat: latNum,
      lng: lngNum,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This CNIC is already registered" },
        { status: 409 }
      );
    }
    console.error("saveMechanic:", error);
    return NextResponse.json(
      { error: "Failed to save mechanic" },
      { status: 500 }
    );
  }
}
