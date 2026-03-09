import { NextResponse } from "next/server";
import { getOpenclawClient } from "@/lib/openclaw";
import { z } from "zod";

const chatSchema = z.object({
  agentId: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, messages } = chatSchema.parse(body);

    const client = await getOpenclawClient();
    const result = await client.chat({ agentId, messages });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/openclaw/chat]", error);
    return NextResponse.json(
      { error: "Failed to reach openclaw.ai" },
      { status: 503 }
    );
  }
}
