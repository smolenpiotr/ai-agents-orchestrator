import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Only allow registration if no users exist
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({ error: "Registration is closed. Please sign in." }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name: name || null, passwordHash },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    // Unique constraint = email already exists
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
