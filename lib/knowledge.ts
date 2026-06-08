export type KnowledgeAsset = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export type SearchResult = {
  assetId: string;
  title: string;
  snippet: string;
  score: number;
};

export type AgentTrace = {
  query: string;
  results: SearchResult[];
  finalAnswer: string;
};

export type AgentAnswer = {
  text: string;
  references: SearchResult[];
};

export const STORAGE_KEY = "knowledge-workbench-assets-v2";

export const initialAssets: KnowledgeAsset[] = [
  {
    id: "asset-aios",
    title: "AIOS 平台介绍",
    content:
      "AIOS 是一个面向企业的智能体操作平台，支持知识库、工具调用、工作流编排和多智能体协作。",
    tags: ["AIOS", "智能体", "企业平台"],
    createdAt: "2026-06-08",
  },
  {
    id: "asset-knowledge-base",
    title: "数字资产知识库",
    content:
      "数字资产知识库用于沉淀企业文档、业务流程、销售资料、客户案例和产品说明，并支持智能检索和问答。",
    tags: ["知识库", "数字资产", "检索"],
    createdAt: "2026-06-08",
  },
  {
    id: "asset-agent-workflow",
    title: "Agent 工作流",
    content:
      "Agent 可以通过任务拆解、工具调用、上下文记忆和结果校验完成复杂任务，但需要可观测性和权限控制来保证可靠性。",
    tags: ["Agent", "工作流", "可观测性"],
    createdAt: "2026-06-08",
  },
];

export function normalizeText(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

export function tokenize(value: string) {
  const normalized = normalizeText(value);
  const terms = new Set<string>();
  const alphaTerms = normalized.match(/[a-z0-9]+/g) ?? [];
  const cjkTerms = normalized.match(/[\u4e00-\u9fa5]+/g) ?? [];

  alphaTerms.forEach((term) => {
    if (term.length > 1) terms.add(term);
  });

  cjkTerms.forEach((chunk) => {
    if (chunk.length <= 2) {
      terms.add(chunk);
      return;
    }

    terms.add(chunk);
    for (let index = 0; index < chunk.length - 1; index += 1) {
      terms.add(chunk.slice(index, index + 2));
    }
  });

  return Array.from(terms);
}

function expandDomainTerms(query: string, terms: string[]) {
  const normalized = normalizeText(query);
  const expanded = new Set(terms);

  const add = (...items: string[]) => {
    items.forEach((item) => expanded.add(item));
  };

  if (normalized.includes("aios")) {
    add("知识库", "工具调用", "工作流", "多智能体", "agent", "智能体");
  }

  if (normalized.includes("能力") || normalized.includes("支持")) {
    add("知识库", "工具调用", "工作流", "协作", "任务拆解", "结果校验", "可观测性");
  }

  if (normalized.includes("agent") || normalized.includes("智能体")) {
    add("任务拆解", "工具调用", "上下文记忆", "结果校验", "可观测性", "权限控制");
  }

  if (normalized.includes("知识") || normalized.includes("资产")) {
    add("企业文档", "业务流程", "销售资料", "客户案例", "产品说明", "智能检索", "问答");
  }

  return Array.from(expanded);
}

function countIncludes(source: string, term: string) {
  if (!source || !term) return 0;
  return source.split(term).length - 1;
}

export function scoreAsset(asset: KnowledgeAsset, query: string) {
  const normalizedQuery = normalizeText(query);
  const title = normalizeText(asset.title);
  const content = normalizeText(asset.content);
  const tags = normalizeText(asset.tags.join(" "));
  const baseTerms = tokenize(query);
  const expandedTerms = expandDomainTerms(query, baseTerms).filter((term) => !baseTerms.includes(term));

  if (!normalizedQuery || baseTerms.length === 0) return 0;

  let score = 0;
  if (title.includes(normalizedQuery)) score += 34;
  if (tags.includes(normalizedQuery)) score += 26;
  if (content.includes(normalizedQuery)) score += 18;

  if (normalizedQuery.includes("aios") && title.includes("aios")) score += 32;
  if (normalizedQuery.includes("agent") && title.includes("agent")) score += 28;
  if (normalizedQuery.includes("知识") && title.includes("知识")) score += 24;

  baseTerms.forEach((term) => {
    score += countIncludes(title, term) * 12;
    score += countIncludes(tags, term) * 9;
    score += Math.min(countIncludes(content, term), 4) * 5;
  });

  expandedTerms.forEach((term) => {
    score += countIncludes(title, term) * 4;
    score += countIncludes(tags, term) * 3;
    score += Math.min(countIncludes(content, term), 3) * 2;
  });

  const lengthPenalty = Math.max(Math.min(asset.content.length / 220, 1.8), 1);
  return Math.round(Math.min(score / lengthPenalty, 100));
}

export function createSnippet(content: string, query: string) {
  const terms = tokenize(query);
  const sentences = content
    .split(/(?<=[。！？；;.!?])\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  const matchedSentence =
    sentences.find((sentence) => {
      const target = normalizeText(sentence);
      return terms.some((term) => target.includes(term));
    }) ?? content;

  return matchedSentence.length > 96 ? `${matchedSentence.slice(0, 96)}...` : matchedSentence;
}

export function searchAssets(assets: KnowledgeAsset[], query: string, limit = 3): SearchResult[] {
  const ranked = assets
    .map((asset) => ({
      assetId: asset.id,
      title: asset.title,
      snippet: createSnippet(asset.content, query),
      score: scoreAsset(asset, query),
    }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const positiveResults = ranked.filter((result) => result.score > 0);
  if (positiveResults.length === 0) return [];

  return positiveResults.slice(0, limit);
}

export function makeAnswer(
  assets: KnowledgeAsset[],
  question: string,
  results: SearchResult[],
): AgentAnswer {
  if (results.length === 0) {
    return {
      text: "未检索到足够相关的知识资产。建议先补充对应资产，或换一个更具体的问题。",
      references: [],
    };
  }

  const facts = results
    .map((result) => {
      const asset = assets.find((item) => item.id === result.assetId);
      return asset ? createSnippet(asset.content, question).replace(/\.$/, "") : "";
    })
    .filter(Boolean);

  const referenceText = results
    .map((result, index) => `引用 ${index + 1}：${result.title}`)
    .join("；");

  return {
    text: `基于检索到的 ${results.length} 条知识资产，可以判断：${facts.join(" ")} ${referenceText}。`,
    references: results,
  };
}
