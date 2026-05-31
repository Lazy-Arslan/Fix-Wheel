import { NextResponse } from "next/server";
import { findUserType } from "@/lib/data-store";
import { validateCnic, validateName, normalizeCnic } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { name, cnic } = await request.json();

    const nameErr = validateName(name ?? "");
    const cnicErr = validateCnic(cnic ?? "");

    if (nameErr || cnicErr) {
      return NextResponse.json(
        { error: nameErr ?? cnicErr },
        { status: 400 }
      );
    }

    const normalizedCnic = normalizeCnic(cnic);
    const userType = await findUserType(name, normalizedCnic);

    if (!userType) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      userType,
      username: name.trim(),
      usercnic: normalizedCnic,
    });
  } catch (error) {
    console.error("login:", error);
    return NextResponse.json(
      { error: "Database unavailable. Check DATABASE_URL." },
      { status: 503 }
    );
  }
}
