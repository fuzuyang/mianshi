import { NextResponse } from "next/server";
import { createAsset, readAssets } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const assets = await readAssets();
  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { title?: unknown; content?: unknown; tags?: unknown }
    | null;

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const tags =
    Array.isArray(body?.tags) && body.tags.every((tag) => typeof tag === "string")
      ? body.tags.map((tag) => tag.trim()).filter(Boolean)
      : [];

  if (!title || !content) {
    return NextResponse.json({ message: "Title 和 Content 不能为空" }, { status: 400 });
  }

  const result = await createAsset({ title, content, tags });
  return NextResponse.json(result, { status: 201 });
}
