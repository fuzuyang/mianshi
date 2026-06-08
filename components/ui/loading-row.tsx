import { Loader2 } from "lucide-react";

export function LoadingRow({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 ${
        tall ? "min-h-28" : "min-h-18"
      }`}
    >
      <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
      <span>{label}</span>
    </div>
  );
}
