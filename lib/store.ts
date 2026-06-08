import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { KnowledgeAsset, initialAssets } from "@/lib/knowledge";

const dataDirectory = path.join(process.cwd(), "data");
const assetFile = path.join(dataDirectory, "assets.json");

let writeQueue = Promise.resolve();

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(assetFile);
  } catch {
    await fs.writeFile(assetFile, JSON.stringify(initialAssets, null, 2), "utf8");
  }
}

export async function readAssets(): Promise<KnowledgeAsset[]> {
  await ensureStore();

  try {
    const content = await fs.readFile(assetFile, "utf8");
    const parsed = JSON.parse(content) as KnowledgeAsset[];
    if (!Array.isArray(parsed)) {
      throw new Error("Asset store is not an array");
    }
    return parsed;
  } catch {
    await writeAssets(initialAssets);
    return initialAssets;
  }
}

export async function writeAssets(assets: KnowledgeAsset[]) {
  writeQueue = writeQueue.then(async () => {
    await ensureStore();
    await fs.writeFile(assetFile, JSON.stringify(assets, null, 2), "utf8");
  });

  await writeQueue;
}

export async function createAsset(input: {
  title: string;
  content: string;
  tags: string[];
}) {
  const asset: KnowledgeAsset = {
    id: randomUUID(),
    title: input.title,
    content: input.content,
    tags: input.tags.length ? input.tags : ["未分类"],
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const assets = await readAssets();
  const nextAssets = [asset, ...assets];
  await writeAssets(nextAssets);

  return { asset, assets: nextAssets };
}

export async function deleteAsset(assetId: string) {
  const assets = await readAssets();
  const nextAssets = assets.filter((asset) => asset.id !== assetId);
  await writeAssets(nextAssets);
  return nextAssets;
}

export async function resetAssets() {
  const assets = [...initialAssets];
  await writeAssets(assets);
  return assets;
}
