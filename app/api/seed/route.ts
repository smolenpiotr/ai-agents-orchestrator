import { NextResponse } from "next/server";
import { seedMainAgent } from "@/lib/seed";

export async function GET() {
  const agentId = await seedMainAgent();
  return NextResponse.json({ agentId });
}
