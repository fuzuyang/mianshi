"use client";

import {
  Database,
  Link2,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AgentAnswer, AgentTrace, KnowledgeAsset, SearchResult } from "@/lib/knowledge";

type MetricTone = "teal" | "green" | "amber" | "indigo";

type AssetsResponse = {
  assets: KnowledgeAsset[];
};

type SearchResponse = {
  query: string;
  results: SearchResult[];
};

type AskResponse = SearchResponse & {
  answer: AgentAnswer;
  trace: AgentTrace;
};

const metricToneClass: Record<MetricTone, string> = {
  teal: "from-white to-teal-50",
  green: "from-white to-lime-50",
  amber: "from-white to-amber-50",
  indigo: "from-white to-indigo-50",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "请求失败");
  }

  return data as T;
}

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

function Metric({ label, value, tone }: { label: string; value: string | number; tone: MetricTone }) {
  return (
    <div
      className={`min-h-20 rounded-lg border border-stone-200 bg-linear-to-b p-4 shadow-sm ${metricToneClass[tone]}`}
    >
      <span className="block text-sm text-stone-500">{label}</span>
      <strong className="mt-2 block truncate text-2xl font-bold leading-tight text-stone-900">
        {value}
      </strong>
    </div>
  );
}

function EmptyState({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div
      className={`flex items-center rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 text-sm text-stone-500 ${
        compact ? "min-h-12" : "min-h-18"
      }`}
    >
      {children}
    </div>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-11 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm text-red-700">
      {children}
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold leading-tight text-stone-900">{title}</h2>
        <p className="mt-1 truncate text-sm text-stone-500">{subtitle}</p>
      </div>
    </div>
  );
}

function AssetList({
  assets,
  selectedAssetId,
  isLoading,
  onSelect,
  onDelete,
}: {
  assets: KnowledgeAsset[];
  selectedAssetId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-28 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 text-sm text-stone-500">
        <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
        <span>从 API 加载知识资产</span>
      </div>
    );
  }

  if (assets.length === 0) {
    return <EmptyState>暂无知识资产</EmptyState>;
  }

  return (
    <div className="grid gap-2.5">
      {assets.map((asset) => {
        const isSelected = selectedAssetId === asset.id;

        return (
          <article
            key={asset.id}
            className={`grid grid-cols-[minmax(0,1fr)_2.25rem] gap-2 rounded-lg border p-2.5 transition ${
              isSelected
                ? "border-teal-300 bg-white"
                : "border-transparent bg-stone-50 hover:border-stone-200"
            }`}
          >
            <button
              type="button"
              className="grid min-w-0 gap-2 text-left"
              onClick={() => onSelect(asset.id)}
            >
              <span className="flex min-w-0 items-center justify-between gap-3">
                <strong className="truncate text-sm font-bold text-stone-900">{asset.title}</strong>
                <small className="shrink-0 text-xs text-stone-500">{formatDate(asset.createdAt)}</small>
              </span>
              <span className="line-clamp-2 text-sm leading-6 text-stone-600">{asset.content}</span>
              <span className="flex flex-wrap gap-1.5">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="max-w-full truncate rounded-full border border-teal-100 bg-teal-50 px-2 py-1 text-xs text-teal-700"
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
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(asset.id)}
            >
              <Trash2 size={17} />
            </button>
          </article>
        );
      })}
    </div>
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
    return (
      <div className="flex min-h-18 items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 text-sm text-stone-500">
        <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
        <span>调用检索 API</span>
      </div>
    );
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
        <article
          key={`${result.assetId}-${index}`}
          className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 font-bold text-amber-700">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <strong className="truncate text-sm font-bold text-stone-900">{result.title}</strong>
              <span className="shrink-0 text-xs text-stone-500">{result.score} 分</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-stone-600">{result.snippet}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function References({ references }: { references: SearchResult[] }) {
  if (references.length === 0) {
    return <EmptyState compact>暂无引用</EmptyState>;
  }

  return (
    <div className="grid gap-2.5">
      {references.map((reference, index) => (
        <div
          key={`${reference.assetId}-${index}`}
          className="grid grid-cols-[1.625rem_minmax(0,1fr)] gap-2.5 rounded-lg border border-stone-200 bg-stone-50 p-3"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lime-50 text-lime-700">
            <Link2 size={15} />
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-sm font-bold text-stone-900">
              引用 {index + 1}：{reference.title}
            </strong>
            <p className="mt-1 text-sm leading-6 text-stone-600">{reference.snippet}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TraceView({ trace }: { trace: AgentTrace | null }) {
  if (!trace) {
    return <EmptyState>暂无 Trace</EmptyState>;
  }

  const rows = [
    ["Query", trace.query],
    [
      "Retrieved Assets",
      trace.results.length ? trace.results.map((result) => result.title).join("、") : "无命中资产",
    ],
    [
      "Scores",
      trace.results.length
        ? trace.results.map((result) => `${result.title} ${result.score}`).join(" / ")
        : "0",
    ],
    ["Final Answer", trace.finalAnswer],
  ];

  return (
    <div className="grid gap-2.5">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
        >
          <span className="text-sm font-bold text-indigo-700">{label}</span>
          <p className="text-sm leading-6 text-stone-700">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [searchResultsState, setSearchResultsState] = useState<SearchResult[]>([]);
  const [askQuery, setAskQuery] = useState("AIOS 支持哪些能力？");
  const [answer, setAnswer] = useState<AgentAnswer | null>(null);
  const [trace, setTrace] = useState<AgentTrace | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [formError, setFormError] = useState("");
  const [systemError, setSystemError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadAssets() {
      try {
        const data = await requestJson<AssetsResponse>("/api/assets");
        if (!isCurrent) return;
        setAssets(data.assets);
        setSelectedAssetId(data.assets[0]?.id ?? null);
        setSystemError("");
      } catch (error) {
        if (!isCurrent) return;
        setSystemError(error instanceof Error ? error.message : "资产加载失败");
      } finally {
        if (isCurrent) setIsLoadingAssets(false);
      }
    }

    loadAssets();

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? assets[0] ?? null,
    [assets, selectedAssetId],
  );

  const tagCount = useMemo(() => new Set(assets.flatMap((asset) => asset.tags)).size, [assets]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return assets.filter((asset) => asset.createdAt === today).length;
  }, [assets]);

  async function runSearch(query: string) {
    const data = await requestJson<SearchResponse>("/api/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    setLastSearchQuery(data.query);
    setSearchResultsState(data.results);
    return data;
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    setIsSearching(true);
    setSystemError("");

    try {
      await runSearch(query);
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : "检索失败");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const tags = String(formData.get("tags") ?? "")
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!title || !content) {
      setFormError("Title 和 Content 不能为空");
      return;
    }

    setIsAdding(true);
    setFormError("");
    setSystemError("");

    try {
      const data = await requestJson<AssetsResponse & { asset: KnowledgeAsset }>("/api/assets", {
        method: "POST",
        body: JSON.stringify({ title, content, tags }),
      });
      setAssets(data.assets);
      setSelectedAssetId(data.asset.id);
      form.reset();

      if (lastSearchQuery) {
        await runSearch(lastSearchQuery);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "新增资产失败");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteAsset(assetId: string) {
    setSystemError("");

    try {
      const data = await requestJson<AssetsResponse>(`/api/assets/${assetId}`, {
        method: "DELETE",
      });
      setAssets(data.assets);
      setSelectedAssetId((current) => {
        if (current !== assetId) return current;
        return data.assets[0]?.id ?? null;
      });

      if (lastSearchQuery) {
        await runSearch(lastSearchQuery);
      }
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : "删除资产失败");
    }
  }

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = askQuery.trim();
    if (!question) return;

    setIsAnswering(true);
    setAnswer(null);
    setSystemError("");

    try {
      const data = await requestJson<AskResponse>("/api/ask", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setSearchQuery(data.query);
      setLastSearchQuery(data.query);
      setSearchResultsState(data.results);
      setAnswer(data.answer);
      setTrace(data.trace);
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : "Agent 问答失败");
    } finally {
      setIsAnswering(false);
    }
  }

  async function handleReset() {
    setIsResetting(true);
    setSystemError("");

    try {
      const data = await requestJson<AssetsResponse>("/api/reset", { method: "POST" });
      setAssets(data.assets);
      setSelectedAssetId(data.assets[0]?.id ?? null);
      setSearchQuery("");
      setLastSearchQuery("");
      setSearchResultsState([]);
      setAskQuery("AIOS 支持哪些能力？");
      setAnswer(null);
      setTrace(null);
      setFormError("");
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : "重置失败");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="mx-auto w-[min(1440px,calc(100%-2rem))] py-5 sm:py-6">
      <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-teal-700">
            <Database size={20} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold leading-tight text-stone-950 sm:text-2xl">
              知识资产问答工作台
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Next.js API Routes / React / TypeScript / Tailwind CSS
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={isResetting}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-50 disabled:opacity-70"
          onClick={handleReset}
        >
          {isResetting ? (
            <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
          ) : (
            <RotateCcw size={17} />
          )}
          <span>{isResetting ? "重置中" : "重置数据"}</span>
        </button>
      </header>

      {systemError ? <div className="mb-4"><ErrorBanner>{systemError}</ErrorBanner></div> : null}

      <section className="mb-5 grid gap-3 md:grid-cols-4">
        <Metric label="知识资产" value={assets.length} tone="teal" />
        <Metric label="标签" value={tagCount} tone="green" />
        <Metric label="今日新增" value={todayCount} tone="amber" />
        <Metric label="上次检索" value={lastSearchQuery || "无"} tone="indigo" />
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(320px,0.92fr)_minmax(380px,1.08fr)]">
        <section className="grid gap-5">
          <form
            className="sticky top-3 z-10 grid grid-cols-[1.375rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg border border-stone-200 bg-white/95 p-2.5 shadow-lg shadow-stone-900/5 max-sm:static max-sm:grid-cols-[1.375rem_minmax(0,1fr)]"
            onSubmit={handleSearch}
          >
            <Search size={18} className="text-stone-500" />
            <label className="sr-only" htmlFor="search-input">
              检索
            </label>
            <input
              id="search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              placeholder="检索资产、标签或内容"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:opacity-75 max-sm:col-span-2"
            >
              {isSearching ? (
                <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
              ) : (
                <Search size={17} />
              )}
              <span>{isSearching ? "检索中" : "检索"}</span>
            </button>
          </form>

          <section className="rounded-lg border border-stone-200 bg-white/90 p-4 shadow-lg shadow-stone-900/5 sm:p-5">
            <SectionHead title="知识资产" subtitle={selectedAsset?.title ?? "暂无资产"} />
            <AssetList
              assets={assets}
              selectedAssetId={selectedAsset?.id ?? null}
              isLoading={isLoadingAssets}
              onSelect={setSelectedAssetId}
              onDelete={handleDeleteAsset}
            />
          </section>

          <section className="rounded-lg border border-stone-200 bg-white/90 p-4 shadow-lg shadow-stone-900/5 sm:p-5">
            <SectionHead title="新增资产" subtitle="POST /api/assets" />
            <form className="grid gap-3" onSubmit={handleAddAsset}>
              {formError ? <ErrorBanner>{formError}</ErrorBanner> : null}
              <label className="grid gap-1.5">
                <span className="text-sm text-stone-500">Title</span>
                <input
                  name="title"
                  maxLength={80}
                  className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  autoComplete="off"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-stone-500">Content</span>
                <textarea
                  name="content"
                  rows={5}
                  className="min-h-28 resize-y rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm text-stone-500">Tags</span>
                <input
                  name="tags"
                  className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  placeholder="AIOS, 检索, Agent"
                  autoComplete="off"
                />
              </label>
              <button
                type="submit"
                disabled={isAdding}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:opacity-75"
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
        </section>

        <section className="grid gap-5">
          <section className="rounded-lg border border-teal-200 bg-white/90 p-4 shadow-lg shadow-stone-900/5 sm:p-5">
            <SectionHead title="Agent 问答" subtitle="POST /api/ask" />
            <form className="grid gap-3" onSubmit={handleAsk}>
              <label className="sr-only" htmlFor="ask-input">
                问题
              </label>
              <textarea
                id="ask-input"
                value={askQuery}
                onChange={(event) => setAskQuery(event.target.value)}
                rows={4}
                className="min-h-28 resize-y rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={isAnswering}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-800 disabled:opacity-75"
              >
                {isAnswering ? (
                  <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
                ) : (
                  <SendHorizontal size={17} />
                )}
                <span>{isAnswering ? "生成中" : "提问"}</span>
              </button>
            </form>

            <div className="mt-4 min-h-30 rounded-lg border border-stone-200 bg-white p-4">
              {isAnswering ? (
                <div className="flex min-h-20 items-center gap-2.5 text-sm text-stone-500">
                  <Loader2 size={17} className="animate-[trace-spin_1s_linear_infinite]" />
                  <span>后端检索知识资产并生成回答</span>
                </div>
              ) : answer ? (
                <p className="text-sm leading-7 text-stone-700">{answer.text}</p>
              ) : (
                <EmptyState compact>暂无回答</EmptyState>
              )}
            </div>

            <div className="mt-3">
              <References references={answer?.references ?? []} />
            </div>
          </section>

          <section className="rounded-lg border border-stone-200 bg-white/90 p-4 shadow-lg shadow-stone-900/5 sm:p-5">
            <SectionHead title="检索结果" subtitle="POST /api/search · Top 3" />
            <SearchResults
              query={lastSearchQuery}
              results={searchResultsState}
              isLoading={isSearching || isAnswering}
            />
          </section>

          <section className="rounded-lg border border-stone-200 bg-white/90 p-4 shadow-lg shadow-stone-900/5 sm:p-5">
            <SectionHead
              title="Agent Trace / 检索过程"
              subtitle="Query / Retrieved Assets / Scores / Final Answer"
            />
            <TraceView trace={trace} />
          </section>
        </section>
      </div>
    </main>
  );
}
