import { TraceRow } from "@/components/trace/trace-row";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHead } from "@/components/ui/section-head";
import { AgentTrace } from "@/lib/knowledge";

export function TracePanel({ trace }: { trace: AgentTrace | null }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHead title="检索过程" subtitle="问题、命中资产、相关分数和最终回答" />
      <TraceView trace={trace} />
    </section>
  );
}

function TraceView({ trace }: { trace: AgentTrace | null }) {
  if (!trace) {
    return <EmptyState>暂无检索过程</EmptyState>;
  }

  const rows = [
    ["问题", trace.query],
    [
      "命中资产",
      trace.results.length ? trace.results.map((result) => result.title).join("、") : "无命中资产",
    ],
    [
      "相关分数",
      trace.results.length
        ? trace.results.map((result) => `${result.title} ${result.score}`).join(" / ")
        : "0",
    ],
    ["最终回答", trace.finalAnswer],
  ];

  return (
    <div className="grid gap-2.5">
      {rows.map(([label, value]) => (
        <TraceRow key={label} label={label} value={value} />
      ))}
    </div>
  );
}
