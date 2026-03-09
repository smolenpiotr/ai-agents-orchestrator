import { NextResponse } from "next/server";
import { getOpenclawClient } from "@/lib/openclaw";

export async function GET() {
  try {
    const client = await getOpenclawClient();
    const agents = await client.listAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error("[GET /api/openclaw/agents]", error);
    return NextResponse.json(
      { error: "Failed to reach openclaw.ai", agents: [] },
      { status: 503 }
    );
  }
}
