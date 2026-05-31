import { NextResponse } from "next/server";
import {
  createBooking,
  getActiveCustomerBooking,
  getBookingHistoryForCustomer,
  getBookingHistoryForMechanic,
  getBookingsForMechanic,
} from "@/lib/booking-store";
import { normalizeCnic, validateCnic, validateName } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerCnic,
      mechanicId,
      vehicle,
      issue,
      customIssue,
      customerLat,
      customerLng,
      customerOffer,
    } = body;

    const nameErr = validateName(customerName ?? "");
    const cnicErr = validateCnic(customerCnic ?? "");
    if (nameErr || cnicErr) {
      return NextResponse.json({ error: nameErr ?? cnicErr }, { status: 400 });
    }

    if (!mechanicId) {
      return NextResponse.json({ error: "Mechanic is required" }, { status: 400 });
    }

    const lat = parseFloat(String(customerLat));
    const lng = parseFloat(String(customerLng));
    if (lat === 0 && lng === 0) {
      return NextResponse.json(
        { error: "Service location is required" },
        { status: 400 }
      );
    }

    const existing = await getActiveCustomerBooking(
      customerName,
      normalizeCnic(customerCnic)
    );
    if (existing) {
      return NextResponse.json(
        { error: "You already have an active booking. Cancel it first to book another." },
        { status: 409 }
      );
    }

    const booking = await createBooking({
      customerName,
      customerCnic,
      mechanicId,
      vehicle: vehicle ?? "car",
      issue: issue ?? "General",
      customIssue,
      customerLat: lat,
      customerLng: lng,
      offerAmount: parseInt(String(customerOffer ?? 0), 10) || 0,
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("bookings POST:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const name = searchParams.get("name") ?? "";
    const cnic = searchParams.get("cnic") ?? "";
    const activeOnly = searchParams.get("active") === "true";
    const history = searchParams.get("history") === "true";

    const nameErr = validateName(name);
    const cnicErr = validateCnic(cnic);
    if (nameErr || cnicErr) {
      return NextResponse.json({ error: nameErr ?? cnicErr }, { status: 400 });
    }

    if (role === "customer") {
      if (history) {
        const bookings = await getBookingHistoryForCustomer(name, cnic);
        return NextResponse.json({ bookings });
      }
      if (activeOnly) {
        const booking = await getActiveCustomerBooking(name, cnic);
        return NextResponse.json({ booking });
      }
    }

    if (role === "mechanic") {
      if (history) {
        const bookings = await getBookingHistoryForMechanic(name, cnic);
        return NextResponse.json({ bookings });
      }
      const bookings = await getBookingsForMechanic(name, cnic);
      return NextResponse.json({ bookings });
    }

    return NextResponse.json({ error: "role must be customer or mechanic" }, { status: 400 });
  } catch (error) {
    console.error("bookings GET:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
