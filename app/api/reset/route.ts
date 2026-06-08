import { NextResponse } from "next/server";
import { resetAssets } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const assets = await resetAssets();
  return NextResponse.json({ assets });
}
