export function TraceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
      <span className="text-sm font-bold text-indigo-700">{label}</span>
      <p className="text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
