import { AssetCard } from "@/components/assets/asset-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingRow } from "@/components/ui/loading-row";
import { KnowledgeAsset } from "@/lib/knowledge";

export function AssetList({
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
    return <LoadingRow label="正在加载知识资产" tall />;
  }

  if (assets.length === 0) {
    return <EmptyState>暂无知识资产</EmptyState>;
  }

  return (
    <div className="grid gap-2.5">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selectedAssetId === asset.id}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
