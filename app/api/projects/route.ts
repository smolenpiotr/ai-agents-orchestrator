import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "internal";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-internal-key") === INTERNAL_KEY;
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DONE", "IDEA"]).optional(),
  url: z.string().url().optional().or(z.literal("")),
  color: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const project = await prisma.project.create({ data });
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
