import { AssetList } from "@/components/assets/asset-list";
import { SectionHead } from "@/components/ui/section-head";
import { KnowledgeAsset } from "@/lib/knowledge";

export function AssetPanel({
  assets,
  selectedAsset,
  isLoading,
  onSelect,
  onDelete,
}: {
  assets: KnowledgeAsset[];
  selectedAsset: KnowledgeAsset | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHead title="资产库" subtitle={selectedAsset?.title ?? "暂无资产"} />
      <AssetList
        assets={assets}
        selectedAssetId={selectedAsset?.id ?? null}
        isLoading={isLoading}
        onSelect={onSelect}
        onDelete={onDelete}
      />
    </section>
  );
}
