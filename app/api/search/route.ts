import { NextResponse } from "next/server";
import { searchAssets } from "@/lib/knowledge";
import { readAssets } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ query, results: [] });
  }

  const assets = await readAssets();
  const results = searchAssets(assets, query);
  return NextResponse.json({ query, results });
}
