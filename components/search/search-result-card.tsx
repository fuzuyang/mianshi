import { SearchResult } from "@/lib/knowledge";

export function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  return (
    <article className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 font-bold text-amber-700">
        {index + 1}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <strong className="truncate text-sm font-bold text-slate-900">{result.title}</strong>
          <span className="shrink-0 text-xs text-slate-500">{result.score} 分</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">{result.snippet}</p>
      </div>
    </article>
  );
}
