import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { seedMainAgent } from "@/lib/seed";

export const metadata: Metadata = {
  title: "AI Agents Orchestrator",
  description: "Manage your openclaw.ai agents with visual Kanban boards",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Seed the main agent on every request (no-op if already exists)
  await seedMainAgent();

  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-background">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
