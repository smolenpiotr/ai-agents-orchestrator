import { NextResponse } from "next/server";

export async function GET() {
  const proxyUrl = process.env.FILES_PROXY_URL;
  const proxySecret = process.env.FILES_PROXY_SECRET;

  if (proxyUrl && proxySecret) {
    try {
      const res = await fetch(`${proxyUrl}/skills`, {
        headers: { "x-files-secret": proxySecret },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const skills = await res.json();
        return NextResponse.json(skills);
      }
    } catch {
      // fall through to empty
    }
  }

  return NextResponse.json([]);
}
