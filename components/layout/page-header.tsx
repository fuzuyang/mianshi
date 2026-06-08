import { Database, Loader2, RotateCcw } from "lucide-react";

export function PageHeader({
  isResetting,
  onReset,
}: {
  isResetting: boolean;
  onReset: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-teal-700">
          <Database size={20} />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold leading-tight text-stone-950 sm:text-2xl">
            知识资产问答工作台
          </h1>
          <p className="mt-1 text-sm text-stone-500">企业知识资产库</p>
        </div>
      </div>
      <button
        type="button"
        disabled={isResetting}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-70"
        onClick={onReset}
      >
        {isResetting ? (
          <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
        ) : (
          <RotateCcw size={17} />
        )}
        <span>{isResetting ? "重置中" : "重置数据"}</span>
      </button>
    </header>
  );
}
