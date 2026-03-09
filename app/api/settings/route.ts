import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/settings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { key, value } = updateSchema.parse(body);

    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(setting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[PUT /api/settings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
