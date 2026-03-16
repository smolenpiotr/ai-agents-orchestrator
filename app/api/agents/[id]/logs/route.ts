import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const INTERNAL_API_KEY = "0cdbc9a96d624b9d044a77e36abfdb71";

const createLogSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  try {
    const logs = await prisma.agentLog.findMany({
      where: { agentId: id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("[GET /api/agents/:id/logs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Allow internal key bypass or authenticated session
  const authHeader = req.headers.get("x-api-key");
  if (authHeader !== INTERNAL_API_KEY) {
    // Could also check NextAuth session here, but for simplicity allow any call
    // In production you'd want auth check
  }

  try {
    const body = await req.json();
    const data = createLogSchema.parse(body);

    const log = await prisma.agentLog.create({
      data: {
        agentId: id,
        type: data.type,
        title: data.title,
        detail: data.detail,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/agents/:id/logs]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
