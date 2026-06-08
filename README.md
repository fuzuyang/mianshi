# 知识资产问答工作台

基于 **Next.js / React / TypeScript / Tailwind CSS** 实现的知识资产问答工作台。应用支持知识资产列表、新增资产、简单检索、Mock Agent 问答、引用来源和 Agent Trace，并使用 Next.js API Routes + SQLite 提供后端能力。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react
- Next.js API Routes
- SQLite
- better-sqlite3

## 启动方式

```bash
npm install
npm run dev
```

默认访问：

```bash
http://127.0.0.1:3000
```

构建检查：

```bash
npm run typecheck
npm run build
```

## 已实现功能

- 内置 3 条初始知识资产。
- 支持新增知识资产，字段包括 Title、Content、Tags。
- 使用后端 API 和 SQLite 数据库保存数据。
- 支持关键词与简单分词相似度检索，返回 top 3。
- Mock Agent 在后端基于检索结果生成回答。
- 展示引用来源。
- 展示 Agent Trace：Query、Retrieved Assets、Scores、Final Answer。
- 覆盖新增表单错误、检索空状态、回答 loading 状态。
- 使用克制的工作台式 UI，适合 ToB 知识资产场景。

## API 设计

- `GET /api/assets`：返回知识资产列表。
- `POST /api/assets`：新增知识资产。
- `DELETE /api/assets/:id`：删除知识资产。
- `POST /api/search`：按 query 检索 top 3 知识片段。
- `POST /api/ask`：执行检索并返回答案、引用和 Agent Trace。
- `POST /api/reset`：重置为 3 条初始数据。

数据库文件默认生成在：

```bash
data/knowledge.db
```

## 数据结构设计

```ts
type KnowledgeAsset = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

type SearchResult = {
  assetId: string;
  title: string;
  snippet: string;
  score: number;
};
```

`title` 用于列表展示和强匹配，`content` 用于检索与回答，`tags` 用于分类和召回增强，`createdAt` 用于展示、统计和审计扩展。

## 检索实现

当前采用本地关键词检索：

- 对问题做 NFKC 归一化、小写和空白压缩。
- 英文/数字按词切分，中文使用连续片段和 bigram。
- 标题、标签、正文设置不同权重。
- 完整短语命中获得额外加权。
- 返回分数最高的 top 3，并生成 snippet。

这个方案无需第三方服务，适合笔试演示。缺点是语义泛化有限，不能很好处理同义词、隐含意图和复杂长上下文。

## 接入真实向量数据库

如果接入真实向量数据库，我会把检索链路调整为：

1. 文档写入时做 chunking，保存 chunk、assetId、metadata。
2. 使用 embedding 模型生成向量。
3. 写入 pgvector、Milvus、Qdrant 或 Elasticsearch dense_vector。
4. 问答时先向量召回，再做关键词混合召回或 rerank。
5. 保持前端 `SearchResult` 结构稳定，只替换检索 API 的实现。

## 多租户设计

多租户需要在数据、权限和索引层都强制隔离：

- `KnowledgeAsset` 增加 `tenantId`、`createdBy`、`visibility`。
- 所有 API 在服务端基于登录态注入 `tenantId`，不信任客户端传参。
- 向量索引使用 tenant metadata filter，避免跨租户召回。
- 检索、问答、新增、删除都记录审计日志。
- 引用来源和回答需要做权限二次校验。

## ToB 上线最担心的问题

最担心的是权限隔离和答案可信度。真实 ToB 场景中，Agent 不能跨租户或跨角色泄露资料，也不能把低可信内容包装成确定结论。系统需要明确引用、权限校验、审计日志、异常回退和答案置信度边界。

## 技术取舍

本版本使用 Next.js API Routes + SQLite，优先保证全栈链路、可运行、可解释和交互完整。未接入真实 LLM 或向量库，避免在笔试场景中过度工程化；但 API 边界已经预留，后续替换向量检索或更完整的关系模型不会影响前端结构。

## 未完成事项

- 未接入真实 LLM。
- 未接入 Postgres 等生产级数据库。
- 未实现用户体系和权限控制。
- 未实现真实向量召回和 rerank。

## 继续迭代

下一步会补充 API Route、数据库、向量索引、鉴权、多租户隔离、操作审计、评测集和端到端测试。
