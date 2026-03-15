import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = process.env.FILES_PROXY_URL;
  const secret = process.env.FILES_PROXY_SECRET;
  if (!url || !secret) return NextResponse.json({ error: "Proxy not configured" }, { status: 503 });
  try {
    const res = await fetch(`${url}/jobs/${id}`, {
      method: "DELETE",
      headers: { "x-files-secret": secret },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 502 });
  }
}
