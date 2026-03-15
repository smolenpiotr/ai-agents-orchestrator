import { NextResponse } from "next/server";

const ALLOWED_FILES = ["SOUL", "MEMORY", "HEARTBEAT"];

function getProxyConfig() {
  const url = process.env.FILES_PROXY_URL;
  const secret = process.env.FILES_PROXY_SECRET;
  return { url, secret };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name || !ALLOWED_FILES.includes(name)) {
    return NextResponse.json({ error: "Invalid file name. Use SOUL, MEMORY, or HEARTBEAT." }, { status: 400 });
  }

  const { url, secret } = getProxyConfig();

  if (!url || !secret) {
    return NextResponse.json({ error: "Files proxy not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(`${url}/files?name=${name}`, {
      headers: { "x-files-secret": secret },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/files] proxy error:", error);
    return NextResponse.json({ error: "Failed to reach files proxy" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, content } = body;

    if (!name || !ALLOWED_FILES.includes(name)) {
      return NextResponse.json({ error: "Invalid file name. Use SOUL, MEMORY, or HEARTBEAT." }, { status: 400 });
    }

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    const { url, secret } = getProxyConfig();

    if (!url || !secret) {
      return NextResponse.json({ error: "Files proxy not configured" }, { status: 503 });
    }

    const res = await fetch(`${url}/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-files-secret": secret,
      },
      body: JSON.stringify({ name, content }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[POST /api/files] proxy error:", error);
    return NextResponse.json({ error: "Failed to reach files proxy" }, { status: 502 });
  }
}
