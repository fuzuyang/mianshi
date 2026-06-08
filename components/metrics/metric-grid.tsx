import { MetricCard } from "@/components/metrics/metric-card";

export function MetricGrid({
  assetCount,
  tagCount,
  todayCount,
  lastSearchQuery,
}: {
  assetCount: number;
  tagCount: number;
  todayCount: number;
  lastSearchQuery: string;
}) {
  return (
    <section className="mb-5 grid gap-3 md:grid-cols-4">
      <MetricCard label="资产总数" value={assetCount} tone="teal" />
      <MetricCard label="标签" value={tagCount} tone="green" />
      <MetricCard label="今日新增" value={todayCount} tone="amber" />
      <MetricCard label="最近检索" value={lastSearchQuery || "无"} tone="indigo" />
    </section>
  );
}
