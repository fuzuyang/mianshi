import { Loader2, Plus } from "lucide-react";
import { FormEvent } from "react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { SectionHead } from "@/components/ui/section-head";

export function AssetFormPanel({
  formError,
  isAdding,
  onSubmit,
}: {
  formError: string;
  isAdding: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHead title="新增资产" subtitle="补充企业知识材料" />
      <form className="grid gap-3" onSubmit={onSubmit}>
        {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
        <label className="grid gap-1.5">
          <span className="text-sm text-slate-500">标题</span>
          <input
            name="title"
            maxLength={80}
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            autoComplete="off"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm text-slate-500">内容</span>
          <textarea
            name="content"
            rows={5}
            className="min-h-28 resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm text-slate-500">标签</span>
          <input
            name="tags"
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="产品, 流程, 客户案例"
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          disabled={isAdding}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-75"
        >
          {isAdding ? (
            <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
          ) : (
            <Plus size={17} />
          )}
          <span>{isAdding ? "新增中" : "新增资产"}</span>
        </button>
      </form>
    </section>
  );
}
