import { ReactNode } from "react";

export function EmptyState({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 ${
        compact ? "min-h-12" : "min-h-18"
      }`}
    >
      {children}
    </div>
  );
}
