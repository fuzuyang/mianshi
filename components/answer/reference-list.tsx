import { Link2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchResult } from "@/lib/knowledge";

export function ReferenceList({ references }: { references: SearchResult[] }) {
  if (references.length === 0) {
    return <EmptyState compact>暂无引用</EmptyState>;
  }

  return (
    <div className="grid gap-2.5">
      {references.map((reference, index) => (
        <div
          key={`${reference.assetId}-${index}`}
          className="grid grid-cols-[1.625rem_minmax(0,1fr)] gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime-50 text-lime-700">
            <Link2 size={15} />
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-sm font-bold text-slate-900">
              引用 {index + 1}：{reference.title}
            </strong>
            <p className="mt-1 text-sm leading-6 text-slate-600">{reference.snippet}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
