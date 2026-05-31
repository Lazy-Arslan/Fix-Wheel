import { NextResponse } from "next/server";
import { getMechanicProfile } from "@/lib/data-store";
import { normalizeCnic, validateCnic, validateName } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") ?? "";
    const cnic = searchParams.get("cnic") ?? "";

    const nameErr = validateName(name);
    const cnicErr = validateCnic(cnic);
    if (nameErr || cnicErr) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const mechanic = await getMechanicProfile(name, normalizeCnic(cnic));
    if (!mechanic) {
      return NextResponse.json({ error: "Mechanic not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: mechanic.name,
        shopName: mechanic.shopName,
        email: mechanic.email,
        phone: mechanic.phone,
        city: mechanic.city,
        license: mechanic.license,
        specialization: mechanic.specialization,
        experience: mechanic.experience,
        address: mechanic.address,
        lat: mechanic.lat,
        lng: mechanic.lng,
      },
    });
  } catch (error) {
    console.error("mechanics/profile:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
