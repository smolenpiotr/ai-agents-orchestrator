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

      return isLoggedIn;
    },
  },
};
