import { NextResponse } from "next/server";
import { makeAnswer, searchAssets } from "@/lib/knowledge";
import { readAssets } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";

  if (!question) {
    return NextResponse.json({ message: "问题不能为空" }, { status: 400 });
  }

  const assets = await readAssets();
  const results = searchAssets(assets, question);
  const answer = makeAnswer(assets, question, results);

  return NextResponse.json({
    query: question,
    results,
    answer,
    trace: {
      query: question,
      results,
      finalAnswer: answer.text,
    },
  });
}
