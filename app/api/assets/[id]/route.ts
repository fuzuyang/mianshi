import { NextResponse } from "next/server";
import { deleteAsset } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const assets = await deleteAsset(id);
  return NextResponse.json({ assets });
}
