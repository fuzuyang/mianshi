type MetricTone = "teal" | "green" | "amber" | "indigo";

const metricToneClass: Record<MetricTone, string> = {
  teal: "border-l-teal-600",
  green: "border-l-emerald-600",
  amber: "border-l-amber-600",
  indigo: "border-l-indigo-600",
};

export function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: MetricTone;
}) {
  return (
    <div
      className={`min-h-20 rounded-lg border border-l-4 border-slate-200 bg-white p-4 shadow-sm ${metricToneClass[tone]}`}
    >
      <span className="block text-sm text-slate-500">{label}</span>
      <strong className="mt-2 block truncate text-2xl font-bold leading-tight text-slate-900">
        {value}
      </strong>
    </div>
  );
}
