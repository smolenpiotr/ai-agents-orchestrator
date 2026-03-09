import { NextResponse } from "next/server";
import { getOpenclawClient } from "@/lib/openclaw";

export async function GET() {
  try {
    const client = await getOpenclawClient();
    const alive = await client.ping();
    return NextResponse.json({ connected: alive });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
