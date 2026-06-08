import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { KnowledgeAsset, initialAssets } from "@/lib/knowledge";

type AssetRow = {
  id: string;
  title: string;
  content: string;
  tags_json: string;
  created_at: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "knowledge.db");

let db: Database.Database | null = null;

function rowToAsset(row: AssetRow): KnowledgeAsset {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: JSON.parse(row.tags_json) as string[],
    createdAt: row.created_at,
  };
}

function getDb() {
  if (db) return db;

  mkdirSync(dataDirectory, { recursive: true });
  db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_assets_title ON assets(title);
  `);

  seedIfEmpty(db);
  return db;
}

function insertAssetStatement(database: Database.Database) {
  return database.prepare(`
    INSERT INTO assets (id, title, content, tags_json, created_at)
    VALUES (@id, @title, @content, @tagsJson, @createdAt)
  `);
}

function insertAsset(database: Database.Database, asset: KnowledgeAsset) {
  insertAssetStatement(database).run({
    id: asset.id,
    title: asset.title,
    content: asset.content,
    tagsJson: JSON.stringify(asset.tags),
    createdAt: asset.createdAt,
  });
}

function seedIfEmpty(database: Database.Database) {
  const count = database
    .prepare("SELECT COUNT(*) as count FROM assets")
    .get() as { count: number };
  if (count.count > 0) return;

  const seed = database.transaction(() => {
    initialAssets.forEach((asset) => insertAsset(database, asset));
  });
  seed();
}

export async function readAssets(): Promise<KnowledgeAsset[]> {
  const rows = getDb()
    .prepare(
      `
      SELECT id, title, content, tags_json, created_at
      FROM assets
      ORDER BY created_at DESC, rowid DESC
    `,
    )
    .all() as AssetRow[];

  return rows.map(rowToAsset);
}

export async function createAsset(input: {
  title: string;
  content: string;
  tags: string[];
}) {
  const database = getDb();
  const asset: KnowledgeAsset = {
    id: randomUUID(),
    title: input.title,
    content: input.content,
    tags: input.tags.length ? input.tags : ["未分类"],
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const insert = database.transaction(() => {
    insertAsset(database, asset);
  });
  insert();
  database.exec("PRAGMA wal_checkpoint(TRUNCATE);");

  return { asset, assets: await readAssets() };
}

export async function deleteAsset(assetId: string) {
  const database = getDb();
  const remove = database.transaction(() => {
    database.prepare("DELETE FROM assets WHERE id = ?").run(assetId);
  });
  remove();
  database.exec("PRAGMA wal_checkpoint(TRUNCATE);");
  return readAssets();
}

export async function resetAssets() {
  const database = getDb();
  const reset = database.transaction(() => {
    database.prepare("DELETE FROM assets").run();
    initialAssets.forEach((asset) => insertAsset(database, asset));
  });

  reset();
  return readAssets();
}
