import type { NextAuthConfig } from "next-auth";

// Minimal config for edge middleware (no Node-only modules)
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers added in auth.ts (Node environment only)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public routes
      if (pathname === "/login" || pathname === "/register") {
        return true;
      }

      // API auth routes are always allowed
      if (pathname.startsWith("/api/auth")) {
        return true;
      }

      // Allow internal API calls with x-internal-key header
      if (pathname.startsWith("/api/")) {
        const internalKey = request.headers.get("x-internal-key");
        if (internalKey && internalKey === process.env.INTERNAL_API_KEY) {
          return true;
        }
      }

      return isLoggedIn;
    },
  },
};
