import { NextResponse } from "next/server";
import { saveCustomer } from "@/lib/data-store";
import {
  validateCnic,
  validateEmail,
  validateName,
  validatePhone,
  normalizeCnic,
} from "@/lib/validation";
import { Prisma } from "@prisma/client";

const SKIP_BIKE = new Set(["Select bike model", "None", ""]);
const SKIP_CAR = new Set(["Select car model", "None", ""]);

export async function POST(request: Request) {
  const body = await request.json();
  const { name, cnic, email, phone, city, bikeModel, carModel, address } =
    body;

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

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    await saveCustomer({
      name,
      cnic: normalizeCnic(cnic),
      email,
      phone,
      city,
      bikeModel: SKIP_BIKE.has(bikeModel) ? "" : bikeModel,
      carModel: SKIP_CAR.has(carModel) ? "" : carModel,
      address: address ?? "",
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
    console.error("saveCustomer:", error);
    return NextResponse.json(
      { error: "Failed to save customer" },
      { status: 500 }
    );
  }
}
