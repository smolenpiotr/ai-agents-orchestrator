import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AgentForm } from "@/components/agents/AgentForm";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Edit Agent</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Update {agent.name}</p>
      </div>
      <AgentForm agent={agent} />
    </div>
  );
}
