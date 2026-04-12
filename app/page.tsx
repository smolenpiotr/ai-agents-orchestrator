import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Brain,
  Bot,
  Check,
  CircleDot,
  KanbanSquare,
  LineChart,
  Sparkles,
  ShieldCheck,
  Users,
} from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Hybrid org chart",
    body: "People and agents live in one org model, with real ownership and reporting lines.",
  },
  {
    icon: Bot,
    title: "Prime Agents",
    body: "Give every teammate a primary agent, then add specialist sub-agents when the work needs depth.",
  },
  {
    icon: Brain,
    title: "Company Brain",
    body: "Shared context, strategy, decisions, tools, and repo sync in one inspectable system.",
  },
  {
    icon: KanbanSquare,
    title: "Execution layer",
    body: "Run tasks, heartbeats, and workflows through one visible operating surface.",
  },
  {
    icon: ShieldCheck,
    title: "Governance + budgets",
    body: "Approvals, permissions, spending limits, and oversight stay inside the system.",
  },
  {
    icon: LineChart,
    title: "Audit + observability",
    body: "Every action is attributable, traceable, and usable for actual management.",
  },
];

const useCases = [
  {
    title: "Startup team",
    body: "Each employee gets a Prime Agent. The CEO sees execution across the company.",
  },
  {
    title: "Agency or services firm",
    body: "Agents support delivery, content, reporting, and ops without hiding the work.",
  },
  {
    title: "Product + engineering",
    body: "Coding, QA, PM, and ops agents work inside one coordinated workflow layer.",
  },
  {
    title: "Ops-heavy team",
    body: "Recurring work runs on heartbeats and structured workflows instead of prompt chaos.",
  },
];

const faq = [
  ["Is Workbeat a chatbot?", "No. It is an operating layer for hybrid human + AI organisations."],
  ["Is this for fully autonomous companies?", "No. Humans stay accountable. Agents execute inside visible boundaries."],
  ["Can I use my existing runtimes?", "Yes. The product is built to work with real tools, not force a single runtime."],
  ["How is this different from Asana + AI?", "Workbeat models the organisation, memory, budgets, and agent execution together."],
];

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">{children}</p>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-15rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-[-10rem] top-[12rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <img src="/brands/workbeat/logo.svg" alt="Workbeat" className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Workbeat</p>
            <p className="text-xs text-white/50">Hybrid human + AI organisations</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#product">Product</a>
          <a href="#how">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#why">Why Workbeat</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white">
            Login
          </Link>
          <Link
            href="#waitlist"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Join waitlist <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div className="max-w-3xl">
          <SectionLabel>Deploy agents into real teams</SectionLabel>
          <h1 className="mt-4 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            The operating layer for hybrid human + AI organisations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
            Workbeat gives modern teams a secure way to deploy AI agents inside real organisations — with shared context, visible execution, budgets, governance, and control.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              id="waitlist"
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Join waitlist <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Login
            </Link>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
            {[
              "One organisation, not a pile of bots",
              "Prime Agents for every employee",
              "Company Brain, Kanban, governance, audit",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <Check className="h-4 w-4 text-emerald-300" /> {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden p-5 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Workbeat command surface</p>
                <p className="text-lg font-medium">Execution stays visible</p>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                Live
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Company Brain</p>
                <p className="mt-3 text-sm text-white/80">
                  Mission, strategy, decisions, and tools synced into one living memory.
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Governance</p>
                <p className="mt-3 text-sm text-white/80">
                  Budgets, permissions, and approvals enforced before agents move.
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Prime Agents</p>
                <p className="mt-3 text-sm text-white/80">
                  Every teammate gets a primary agent with optional specialists behind it.
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Audit trail</p>
                <p className="mt-3 text-sm text-white/80">
                  Tool calls, tasks, and work state remain attributable.
                </p>
              </Card>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0b1223] p-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                Paperclip runs companies of agents. Workbeat helps real companies deploy agents into actual teams.
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionLabel>What Workbeat is</SectionLabel>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              A system for companies where humans decide and agents execute.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
              No autonomy theater. No hidden workflows. Workbeat keeps work inside a visible operating model so teams can actually ship with AI.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((p) => (
              <Card key={p.title} className="p-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-emerald-300">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-medium">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{p.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionLabel>How it works</SectionLabel>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          {[
            ["1. Model the organisation", "Invite people, assign roles, create Prime Agents."],
            ["2. Build shared context", "Mission, strategy, decisions, tools, and repo sync."],
            ["3. Run execution", "Tasks, Kanban, heartbeats, and workflow coordination."],
            ["4. Govern and scale", "Budgets, approvals, visibility, and audit logs."],
          ].map(([title, body]) => (
            <Card key={title} className="p-5">
              <CircleDot className="h-5 w-5 text-emerald-300" />
              <h3 className="mt-4 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionLabel>Why now</SectionLabel>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-xl font-medium">Without Workbeat</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>• Bots scattered across tabs and tools</li>
              <li>• No shared memory</li>
              <li>• No clear ownership</li>
              <li>• No budget control</li>
              <li>• No audit trail</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-medium">With Workbeat</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>• Agents anchored to real people and roles</li>
              <li>• Company Brain gives shared context</li>
              <li>• Work runs through one execution layer</li>
              <li>• Budgets and approvals are enforced</li>
              <li>• Every action is visible and attributable</li>
            </ul>
          </Card>
        </div>
      </section>

      <section id="use-cases" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionLabel>Use cases</SectionLabel>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((item) => (
            <Card key={item.title} className="p-5">
              <h3 className="text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionLabel>Why Workbeat vs Paperclip</SectionLabel>
        <Card className="mt-4 overflow-hidden">
          <div className="grid gap-px bg-white/10 md:grid-cols-2">
            <div className="bg-[#070b16] p-6">
              <h3 className="text-xl font-medium">Paperclip</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">Helps run companies of agents.</p>
            </div>
            <div className="bg-[#070b16] p-6">
              <h3 className="text-xl font-medium">Workbeat</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">Helps real companies deploy agents into actual teams.</p>
            </div>
          </div>
        </Card>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <p className="text-sm text-white/70">
              Built on proven open foundations: a private fork of Paperclip and the companies.sh standard.
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-white/70">
              We kept the orchestration primitives that scale, and changed the product model to fit real organisations where humans and AI agents work side by side.
            </p>
          </Card>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionLabel>FAQ</SectionLabel>
        <div className="mt-4 grid gap-4">
          {faq.map(([q, a]) => (
            <Card key={q} className="p-5">
              <h3 className="font-medium">{q}</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">{a}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-8">
        <Card className="flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Put AI agents to work inside your company — not outside it.
            </p>
            <p className="mt-3 text-white/68">
              For teams piloting hybrid human + AI operations. Early design partners and operator-led teams welcome.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black"
            >
              Join waitlist <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              Login
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
