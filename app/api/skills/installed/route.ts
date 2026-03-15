import { NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import os from "os";

interface InstalledSkill {
  slug: string;
  name: string;
  description: string;
}

const SKILLS_PATHS = [
  join(os.homedir(), ".openclaw", "skills"),
  "/opt/homebrew/lib/node_modules/openclaw/skills",
  "/usr/local/lib/node_modules/openclaw/skills",
];

export async function GET() {
  try {
    let entries: string[] = [];
    let skillsDir = "";

    for (const dir of SKILLS_PATHS) {
      try {
        entries = await readdir(dir);
        skillsDir = dir;
        break;
      } catch {
        // try next path
      }
    }

    if (!skillsDir) {
      return NextResponse.json([]);
    }

    const skills: InstalledSkill[] = [];

    for (const entry of entries) {
      const skillMdPath = join(skillsDir, entry, "SKILL.md");
      try {
        const content = await readFile(skillMdPath, "utf-8");
        const { data } = matter(content);
        skills.push({
          slug: entry,
          name: String(data.name ?? entry),
          description: String(data.description ?? ""),
        });
      } catch {
        // Skip entries without SKILL.md
      }
    }

    return NextResponse.json(skills);
  } catch (error) {
    console.error("[GET /api/skills/installed]", error);
    return NextResponse.json({ error: "Failed to read installed skills" }, { status: 500 });
  }
}
