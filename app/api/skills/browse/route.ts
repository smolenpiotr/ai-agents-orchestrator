import { NextResponse } from "next/server";
import { fetchClawHubSkills } from "@/lib/clawhub";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;

  try {
    const result = await fetchClawHubSkills(q, cursor);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/skills/browse]", error);
    return NextResponse.json(
      { error: "Failed to fetch skills from clawhub.ai", skills: [], nextCursor: null },
      { status: 503 }
    );
  }
}
