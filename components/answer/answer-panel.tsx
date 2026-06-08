import { Loader2, SendHorizontal } from "lucide-react";
import { FormEvent } from "react";
import { ReferenceList } from "@/components/answer/reference-list";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHead } from "@/components/ui/section-head";
import { AgentAnswer } from "@/lib/knowledge";

export function AnswerPanel({
  askQuery,
  answer,
  isAnswering,
  onQueryChange,
  onSubmit,
}: {
  askQuery: string;
  answer: AgentAnswer | null;
  isAnswering: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHead title="问答" subtitle="当前资产库" />
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="ask-input">
          问题
        </label>
        <textarea
          id="ask-input"
          value={askQuery}
          onChange={(event) => onQueryChange(event.target.value)}
          rows={4}
          className="min-h-28 resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
        <button
          type="submit"
          disabled={isAnswering}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-75"
        >
          {isAnswering ? (
            <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
          ) : (
            <SendHorizontal size={17} />
          )}
          <span>{isAnswering ? "生成中" : "提问"}</span>
        </button>
      </form>

      <div className="mt-4 min-h-30 rounded-lg border border-slate-200 bg-white p-4">
        {isAnswering ? (
          <div className="flex min-h-20 items-center gap-2.5 text-sm text-slate-500">
            <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
            <span>正在检索并生成回答</span>
          </div>
        ) : answer ? (
          <p className="text-sm leading-7 text-slate-700">{answer.text}</p>
        ) : (
          <EmptyState compact>暂无回答</EmptyState>
        )}
      </div>

      <div className="mt-3">
        <ReferenceList references={answer?.references ?? []} />
      </div>
    </section>
  );
}
