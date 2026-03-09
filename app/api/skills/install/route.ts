import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

const installSchema = z.object({
  slug: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, "Invalid skill slug"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug } = installSchema.parse(body);

    const { stdout, stderr } = await execAsync(`clawhub install ${slug}`, {
      timeout: 30000,
      env: { ...process.env, PATH: process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin" },
    });

    return NextResponse.json({
      success: true,
      output: stdout,
      warnings: stderr || undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const execError = error as { stdout?: string; stderr?: string; message?: string };
    console.error("[POST /api/skills/install]", error);
    return NextResponse.json(
      {
        error: execError.stderr || execError.message || "Installation failed",
        output: execError.stdout,
      },
      { status: 500 }
    );
  }
}
