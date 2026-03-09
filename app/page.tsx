import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const mainAgent = await prisma.agent.findFirst({ where: { isMain: true } });
  if (mainAgent) {
    redirect(`/agents/${mainAgent.id}`);
  }
  redirect("/agents");
}
