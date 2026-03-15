import { NextResponse } from "next/server";

function getProxy() {
  return {
    url: process.env.FILES_PROXY_URL,
    secret: process.env.FILES_PROXY_SECRET,
  };
}

export async function GET() {
  const { url, secret } = getProxy();
  if (!url || !secret) {
    return NextResponse.json({ source: "none", jobs: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const res = await fetch(`${url}/jobs`, {
      headers: { "x-files-secret": secret },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ source: "cli", jobs: data.jobs ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ source: "none", jobs: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
