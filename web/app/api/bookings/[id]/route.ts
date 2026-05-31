import { NextResponse } from "next/server";
import {
  cancelBooking,
  completeBooking,
  updateBooking,
} from "@/lib/booking-store";
import { validateCnic, validateName } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, actor, actorName, actorCnic, counterPrice } = body;

    const nameErr = validateName(actorName ?? "");
    const cnicErr = validateCnic(actorCnic ?? "");
    if (nameErr || cnicErr) {
      return NextResponse.json({ error: nameErr ?? cnicErr }, { status: 400 });
    }

    if (!["accept", "counter", "complete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!["customer", "mechanic"].includes(actor)) {
      return NextResponse.json({ error: "Invalid actor" }, { status: 400 });
    }

    const booking =
      action === "complete"
        ? await completeBooking(id, actor, actorCnic, actorName)
        : await updateBooking(
            id,
            action,
            actor,
            actorCnic,
            actorName,
            counterPrice != null
              ? parseInt(String(counterPrice), 10)
              : undefined
          );

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("bookings/[id] PATCH:", error);
    const prismaCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (prismaCode === "P2022") {
      return NextResponse.json(
        {
          error:
            "Database is missing completion columns. Run: npm run db:push (in the web folder), then restart the dev server.",
        },
        { status: 503 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to update booking";
    const status = message.includes("Not authorized")
      ? 403
      : prismaCode.startsWith("P")
        ? 503
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerName, customerCnic } = body;

    const nameErr = validateName(customerName ?? "");
    const cnicErr = validateCnic(customerCnic ?? "");
    if (nameErr || cnicErr) {
      return NextResponse.json({ error: nameErr ?? cnicErr }, { status: 400 });
    }

    await cancelBooking(id, customerCnic, customerName);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("bookings/[id] DELETE:", error);
    const message =
      error instanceof Error ? error.message : "Failed to cancel booking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
