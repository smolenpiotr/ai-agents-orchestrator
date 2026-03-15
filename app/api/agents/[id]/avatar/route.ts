import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const resized = await sharp(buffer)
      .resize(256, 256, { fit: "cover", position: "center" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64 = resized.toString("base64");
    const avatarUrl = `data:image/jpeg;base64,${base64}`;

    const agent = await prisma.agent.update({
      where: { id },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl: agent.avatarUrl });
  } catch (error) {
    console.error("[POST /api/agents/:id/avatar]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
