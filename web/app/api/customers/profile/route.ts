import { NextResponse } from "next/server";
import { getCustomerProfile } from "@/lib/data-store";
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

    const customer = await getCustomerProfile(name, normalizeCnic(cnic));
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: customer.name,
        cnic: customer.cnic,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        bikeModel: customer.bikeModel,
        carModel: customer.carModel,
        address: customer.address,
      },
    });
  } catch (error) {
    console.error("customers/profile:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
