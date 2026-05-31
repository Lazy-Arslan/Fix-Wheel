import { prisma } from "@/lib/db";
import { estimateEtaMinutes, formatEta } from "@/lib/booking-utils";
import { normalizeCnic } from "@/lib/validation";
import type { BookingRecord, BookingStatus } from "@/lib/types";

const ACTIVE_STATUSES = [
  "pending",
  "countered",
  "confirmed",
  "completion_pending",
  "active",
];

/** Legacy rows use "active"; UI treats them as pending. */
function isPendingLike(status: string): boolean {
  return status === "pending" || status === "active";
}

type BookingWithMechanic = {
  id: string;
  customerCnic: string;
  customerName: string;
  mechanicId: string;
  vehicle: string;
  issue: string;
  customIssue: string;
  customerLat: number;
  customerLng: number;
  customerOffer: number;
  mechanicCounter: number | null;
  agreedPrice: number | null;
  status: string;
  mechanicCompleted: boolean;
  customerCompleted: boolean;
  etaMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
  mechanic: {
    name: string;
    shopName: string;
    lat: number;
    lng: number;
  };
};

function issueDisplay(issue: string, customIssue: string): string {
  if (customIssue.trim()) return customIssue.trim();
  return issue;
}

function currentPrice(b: BookingWithMechanic): number {
  if (b.status === "confirmed" && b.agreedPrice != null) return b.agreedPrice;
  if (b.status === "countered" && b.mechanicCounter != null) {
    return b.mechanicCounter;
  }
  return b.customerOffer;
}

function toBookingRecord(b: BookingWithMechanic): BookingRecord {
  const eta =
    b.etaMinutes ??
    estimateEtaMinutes(
      b.mechanic.lat,
      b.mechanic.lng,
      b.customerLat,
      b.customerLng
    );

  return {
    id: b.id,
    customerCnic: b.customerCnic,
    customerName: b.customerName,
    mechanicId: b.mechanicId,
    mechanicName: b.mechanic.name,
    mechanicShop: b.mechanic.shopName,
    mechanicLat: b.mechanic.lat,
    mechanicLng: b.mechanic.lng,
    vehicle: b.vehicle,
    issue: b.issue,
    customIssue: b.customIssue,
    issueDisplay: issueDisplay(b.issue, b.customIssue),
    customerLat: b.customerLat,
    customerLng: b.customerLng,
    offerAmount: b.customerOffer,
    mechanicCounter: b.mechanicCounter,
    agreedPrice: b.agreedPrice,
    currentPrice: currentPrice(b),
    status: b.status === "active" ? "pending" : (b.status as BookingStatus),
    mechanicCompleted: b.mechanicCompleted ?? false,
    customerCompleted: b.customerCompleted ?? false,
    etaMinutes: eta,
    etaDisplay: formatEta(eta),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

const bookingInclude = {
  mechanic: {
    select: { name: true, shopName: true, lat: true, lng: true },
  },
} as const;

export async function createBooking(data: {
  customerName: string;
  customerCnic: string;
  mechanicId: string;
  vehicle: string;
  issue: string;
  customIssue?: string;
  customerLat: number;
  customerLng: number;
  offerAmount: number;
}): Promise<BookingRecord> {
  const mechanic = await prisma.mechanic.findUnique({
    where: { id: data.mechanicId },
  });
  if (!mechanic) throw new Error("Mechanic not found");

  const etaMinutes = estimateEtaMinutes(
    mechanic.lat,
    mechanic.lng,
    data.customerLat,
    data.customerLng
  );

  const booking = await prisma.booking.create({
    data: {
      customerCnic: normalizeCnic(data.customerCnic),
      customerName: data.customerName.trim(),
      mechanicId: data.mechanicId,
      vehicle: data.vehicle,
      issue: data.issue,
      customIssue: data.customIssue?.trim() ?? "",
      customerLat: data.customerLat,
      customerLng: data.customerLng,
      customerOffer: data.offerAmount,
      status: "pending",
      etaMinutes,
    },
    include: bookingInclude,
  });

  return toBookingRecord(booking);
}

export async function getBookingsForCustomer(
  name: string,
  cnic: string
): Promise<BookingRecord[]> {
  const normalizedCnic = normalizeCnic(cnic);
  const bookings = await prisma.booking.findMany({
    where: {
      customerCnic: normalizedCnic,
      status: { in: ACTIVE_STATUSES },
    },
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
  });

  return bookings
    .filter(
      (b) => b.customerName.trim().toLowerCase() === name.trim().toLowerCase()
    )
    .map(toBookingRecord);
}

export async function getBookingsForMechanic(
  name: string,
  cnic: string
): Promise<BookingRecord[]> {
  const normalizedCnic = normalizeCnic(cnic);
  const mechanic = await prisma.mechanic.findFirst({
    where: {
      cnic: normalizedCnic,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
  if (!mechanic) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      mechanicId: mechanic.id,
      status: { in: ACTIVE_STATUSES },
    },
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
  });

  return bookings.map(toBookingRecord);
}

const HISTORY_STATUSES = ["completed", "cancelled"];

export async function getBookingHistoryForCustomer(
  name: string,
  cnic: string
): Promise<BookingRecord[]> {
  const normalizedCnic = normalizeCnic(cnic);
  const bookings = await prisma.booking.findMany({
    where: {
      customerCnic: normalizedCnic,
      status: { in: HISTORY_STATUSES },
    },
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return bookings
    .filter(
      (b) => b.customerName.trim().toLowerCase() === name.trim().toLowerCase()
    )
    .map(toBookingRecord);
}

export async function getBookingHistoryForMechanic(
  name: string,
  cnic: string
): Promise<BookingRecord[]> {
  const normalizedCnic = normalizeCnic(cnic);
  const mechanic = await prisma.mechanic.findFirst({
    where: {
      cnic: normalizedCnic,
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
  if (!mechanic) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      mechanicId: mechanic.id,
      status: { in: HISTORY_STATUSES },
    },
    include: bookingInclude,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return bookings.map(toBookingRecord);
}

export async function getActiveCustomerBooking(
  name: string,
  cnic: string
): Promise<BookingRecord | null> {
  const bookings = await getBookingsForCustomer(name, cnic);
  return bookings[0] ?? null;
}

export async function cancelBooking(
  id: string,
  customerCnic: string,
  customerName: string
): Promise<void> {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found");
  if (booking.customerCnic !== normalizeCnic(customerCnic)) {
    throw new Error("Not authorized");
  }
  if (
    booking.customerName.trim().toLowerCase() !==
    customerName.trim().toLowerCase()
  ) {
    throw new Error("Not authorized");
  }
  await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });
}

export async function updateBooking(
  id: string,
  action: "accept" | "counter",
  actor: "customer" | "mechanic",
  actorCnic: string,
  actorName: string,
  counterPrice?: number
): Promise<BookingRecord> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { mechanic: true },
  });
  if (!booking) throw new Error("Booking not found");

  const normalizedActorCnic = normalizeCnic(actorCnic);

  if (actor === "customer") {
    if (booking.customerCnic !== normalizedActorCnic) {
      throw new Error("Not authorized");
    }
    if (
      booking.customerName.trim().toLowerCase() !== actorName.trim().toLowerCase()
    ) {
      throw new Error("Not authorized");
    }
  } else {
    if (booking.mechanic.cnic !== normalizedActorCnic) {
      throw new Error("Not authorized");
    }
    if (
      booking.mechanic.name.trim().toLowerCase() !==
      actorName.trim().toLowerCase()
    ) {
      throw new Error("Not authorized");
    }
  }

  if (
    booking.status === "confirmed" ||
    booking.status === "completion_pending" ||
    booking.status === "completed" ||
    booking.status === "cancelled"
  ) {
    throw new Error("Booking is already closed");
  }

  let updateData: {
    status: string;
    agreedPrice?: number;
    mechanicCounter?: number | null;
    customerOffer?: number;
    etaMinutes?: number;
  };

  if (action === "accept") {
    if (actor === "mechanic" && !isPendingLike(booking.status)) {
      throw new Error("Can only accept a pending offer");
    }
    if (actor === "customer" && booking.status !== "countered") {
      throw new Error("Can only accept after mechanic changes price");
    }

    const agreedPrice =
      actor === "mechanic"
        ? booking.customerOffer
        : (booking.mechanicCounter ?? booking.customerOffer);

    const etaMinutes = estimateEtaMinutes(
      booking.mechanic.lat,
      booking.mechanic.lng,
      booking.customerLat,
      booking.customerLng
    );

    updateData = { status: "confirmed", agreedPrice, etaMinutes };
  } else {
    if (counterPrice == null || counterPrice < 50) {
      throw new Error("Price must be at least Rs. 50");
    }
    if (actor === "mechanic") {
      if (!isPendingLike(booking.status)) {
        throw new Error("Can only change price on pending bookings");
      }
      updateData = { status: "countered", mechanicCounter: counterPrice };
    } else {
      if (booking.status !== "countered") {
        throw new Error("Can only counter after mechanic changes price");
      }
      updateData = {
        status: "pending",
        customerOffer: counterPrice,
        mechanicCounter: null,
      };
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: bookingInclude,
  });

  return toBookingRecord(updated);
}

export async function completeBooking(
  id: string,
  actor: "customer" | "mechanic",
  actorCnic: string,
  actorName: string
): Promise<BookingRecord> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { mechanic: true },
  });
  if (!booking) throw new Error("Booking not found");

  const normalizedActorCnic = normalizeCnic(actorCnic);

  if (actor === "customer") {
    if (booking.customerCnic !== normalizedActorCnic) {
      throw new Error("Not authorized");
    }
    if (
      booking.customerName.trim().toLowerCase() !== actorName.trim().toLowerCase()
    ) {
      throw new Error("Not authorized");
    }
  } else {
    if (booking.mechanic.cnic !== normalizedActorCnic) {
      throw new Error("Not authorized");
    }
    if (
      booking.mechanic.name.trim().toLowerCase() !==
      actorName.trim().toLowerCase()
    ) {
      throw new Error("Not authorized");
    }
  }

  if (booking.status === "completed" || booking.status === "cancelled") {
    throw new Error("Booking is already closed");
  }

  const canMarkComplete =
    booking.status === "confirmed" ||
    booking.status === "completion_pending" ||
    (booking.status === "active" && booking.agreedPrice != null);

  if (!canMarkComplete) {
    throw new Error(
      "Service must be confirmed before marking complete. Finish price agreement first."
    );
  }

  let mechanicCompleted = booking.mechanicCompleted ?? false;
  let customerCompleted = booking.customerCompleted ?? false;

  if (actor === "mechanic") {
    if (mechanicCompleted) {
      throw new Error("You already marked this service as completed");
    }
    mechanicCompleted = true;
  } else {
    if (customerCompleted) {
      throw new Error("You already confirmed the issue is resolved");
    }
    customerCompleted = true;
  }

  const bothDone = mechanicCompleted && customerCompleted;
  const status = bothDone ? "completed" : "completion_pending";

  const updated = await prisma.booking.update({
    where: { id },
    data: { mechanicCompleted, customerCompleted, status },
    include: bookingInclude,
  });

  return toBookingRecord(updated);
}
