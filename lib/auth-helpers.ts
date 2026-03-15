import { auth } from "@/auth";

/**
 * Check if a request is authenticated either via NextAuth session
 * or via the internal API key header.
 */
export async function isAuthenticated(req: Request): Promise<boolean> {
  // Check internal API key
  const internalKey = req.headers.get("x-internal-key");
  if (internalKey && internalKey === process.env.INTERNAL_API_KEY) {
    return true;
  }

  // Check NextAuth session
  const session = await auth();
  return !!session;
}
