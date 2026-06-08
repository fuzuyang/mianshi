import { AssetList } from "@/components/assets/asset-list";
import { SectionHead } from "@/components/ui/section-head";
import { KnowledgeAsset } from "@/lib/knowledge";

export function AssetPanel({
  assets,
  selectedAsset,
  isLoading,
  activeQuery = "",
  onSelect,
  onDelete,
}: {
  assets: KnowledgeAsset[];
  selectedAsset: KnowledgeAsset | null;
  isLoading: boolean;
  activeQuery?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const subtitle = activeQuery
    ? assets.length > 0
      ? `检索命中 ${assets.length} 条`
      : `未命中：${activeQuery}`
    : selectedAsset?.title ?? "暂无资产";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHead title="资产库" subtitle={subtitle} />
      <AssetList
        assets={assets}
        selectedAssetId={selectedAsset?.id ?? null}
        isLoading={isLoading}
        emptyLabel={activeQuery ? "未命中知识资产" : "暂无知识资产"}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    </section>
  );
}
