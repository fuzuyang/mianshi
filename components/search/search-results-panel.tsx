import { SearchResultCard } from "@/components/search/search-result-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/loading-row";
import { SectionHead } from "@/components/ui/section-head";
import { SearchResult } from "@/lib/knowledge";

export function SearchResultsPanel({
  query,
  results,
  isLoading,
}: {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHead title="相关片段" subtitle="按相关度排序" />
      <SearchResults query={query} results={results} isLoading={isLoading} />
    </section>
  );
}

function SearchResults({
  query,
  results,
  isLoading,
}: {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingRow label="正在检索" />;
  }

  if (!query) {
    return <EmptyState>暂无检索</EmptyState>;
  }

  if (results.length === 0) {
    return <EmptyState>未命中知识资产</EmptyState>;
  }

  return (
    <div className="grid gap-2.5">
      {results.map((result, index) => (
        <SearchResultCard key={`${result.assetId}-${index}`} result={result} index={index} />
      ))}
    </div>
  );
}
