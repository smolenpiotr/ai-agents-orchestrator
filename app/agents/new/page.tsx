import { AgentForm } from "@/components/agents/AgentForm";

export default function NewAgentPage() {
  return (
    <div className="p-3 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Create Agent</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add a new AI agent connected to your openclaw.ai instance
        </p>
      </div>
      <AgentForm />
    </div>
  );
}
