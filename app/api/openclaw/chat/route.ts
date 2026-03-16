import { NextResponse } from "next/server";
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
    const { messages } = chatSchema.parse(body);

    const proxyUrl = process.env.FILES_PROXY_URL;
    const proxySecret = process.env.FILES_PROXY_SECRET;

    if (!proxyUrl || !proxySecret) {
      return NextResponse.json({ error: "Proxy not configured" }, { status: 503 });
    }

    // Get last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      return NextResponse.json({ error: "No user message" }, { status: 400 });
    }

    // Send via sessions_send through files-proxy
    const res = await fetch(`${proxyUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-files-secret": proxySecret,
      },
      body: JSON.stringify({ message: lastUserMsg.content }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[chat proxy error]", err);
      return NextResponse.json({ error: "Proxy error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("[POST /api/openclaw/chat]", error);
    return NextResponse.json({ error: "Failed to reach openclaw" }, { status: 503 });
  }
}
