"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useEffect } from "react";
import { seedMainAgent } from "@/lib/seedClient";

const PUBLIC_PATHS = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isPublic) {
      seedMainAgent();
    }
  }, [isPublic]);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
