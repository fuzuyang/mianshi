export function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold leading-tight text-slate-900">{title}</h2>
        <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
