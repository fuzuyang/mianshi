import { Trash2 } from "lucide-react";
import { KnowledgeAsset } from "@/lib/knowledge";

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function AssetCard({
  asset,
  isSelected,
  onSelect,
  onDelete,
}: {
  asset: KnowledgeAsset;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      className={`grid grid-cols-[minmax(0,1fr)_2.25rem] gap-2 rounded-lg border p-2.5 transition ${
        isSelected ? "border-teal-300 bg-white" : "border-transparent bg-slate-50 hover:border-slate-200"
      }`}
    >
      <button type="button" className="grid min-w-0 gap-2 text-left" onClick={() => onSelect(asset.id)}>
        <span className="flex min-w-0 items-center justify-between gap-3">
          <strong className="truncate text-sm font-bold text-slate-900">{asset.title}</strong>
          <small className="shrink-0 text-xs text-slate-500">{formatDate(asset.createdAt)}</small>
        </span>
        <span className="line-clamp-2 text-sm leading-6 text-slate-600">{asset.content}</span>
        <span className="flex flex-wrap gap-1.5">
          {asset.tags.map((tag) => (
            <span
              key={tag}
              className="max-w-full truncate rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </span>
      </button>
      <button
        type="button"
        aria-label={`删除 ${asset.title}`}
        title="删除"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-700"
        onClick={() => onDelete(asset.id)}
      >
        <Trash2 size={17} />
      </button>
    </article>
  );
}
