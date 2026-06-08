"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AnswerPanel,
  AssetFormPanel,
  AssetPanel,
  ErrorBanner,
  MetricGrid,
  PageHeader,
  SearchBar,
  SearchResultsPanel,
  TracePanel,
} from "@/components";
import { AgentAnswer, AgentTrace, KnowledgeAsset, SearchResult } from "@/lib/knowledge";

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

export default function Home() {
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
    setSearchResults(data.results);
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
      setFormError("标题和内容不能为空");
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
      setSearchResults(data.results);
      setAnswer(data.answer);
      setTrace(data.trace);
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : "问答失败");
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
      setSearchResults([]);
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
      <PageHeader isResetting={isResetting} onReset={handleReset} />

      {systemError ? (
        <div className="mb-4">
          <ErrorBanner>{systemError}</ErrorBanner>
        </div>
      ) : null}

      <MetricGrid
        assetCount={assets.length}
        tagCount={tagCount}
        todayCount={todayCount}
        lastSearchQuery={lastSearchQuery}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(320px,0.92fr)_minmax(380px,1.08fr)]">
        <section className="grid gap-5">
          <SearchBar
            value={searchQuery}
            isSearching={isSearching}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
          />
          <AssetPanel
            assets={assets}
            selectedAsset={selectedAsset}
            isLoading={isLoadingAssets}
            onSelect={setSelectedAssetId}
            onDelete={handleDeleteAsset}
          />
          <AssetFormPanel formError={formError} isAdding={isAdding} onSubmit={handleAddAsset} />
        </section>

        <section className="grid gap-5">
          <AnswerPanel
            askQuery={askQuery}
            answer={answer}
            isAnswering={isAnswering}
            onQueryChange={setAskQuery}
            onSubmit={handleAsk}
          />
          <SearchResultsPanel
            query={lastSearchQuery}
            results={searchResults}
            isLoading={isSearching || isAnswering}
          />
          <TracePanel trace={trace} />
        </section>
      </div>
    </main>
  );
}
