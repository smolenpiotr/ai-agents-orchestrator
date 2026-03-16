import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const spendSchema = z.object({
  amount: z.number().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { amount } = spendSchema.parse(body);

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        spentThisMonthUsd: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({ spentThisMonthUsd: agent.spentThisMonthUsd });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/agents/:id/spend]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
