#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { initializeCatalogSchema } from '../dist-electron/catalog/catalogSchema.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-k2-r3-migration-'));
const dbPath = path.join(tempRoot, 'catalog.sqlite');

try {
  const database = new DatabaseSync(dbPath);
  try {
    database.exec(`
      CREATE TABLE roots (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        library_type TEXT NOT NULL,
        scan_profile TEXT NOT NULL,
        source_kind TEXT NOT NULL,
        root_path_ref TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE scan_runs (
        id TEXT PRIMARY KEY,
        root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL,
        files_seen INTEGER NOT NULL DEFAULT 0,
        directories_seen INTEGER NOT NULL DEFAULT 0,
        changed_entries INTEGER NOT NULL DEFAULT 0,
        error_count INTEGER NOT NULL DEFAULT 0
      ) STRICT;
      CREATE TABLE scan_entries (
        root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
        relative_path TEXT NOT NULL,
        entry_kind TEXT NOT NULL,
        size_bytes INTEGER,
        mtime_ms REAL,
        fingerprint TEXT,
        last_seen_scan_id TEXT,
        state TEXT NOT NULL DEFAULT 'present',
        PRIMARY KEY(root_id, relative_path)
      ) STRICT;
      PRAGMA user_version = 1;
    `);

    const version = initializeCatalogSchema(database);
    if (version !== 2) throw new Error(`expected schema 2, got ${version}`);

    const columns = database.prepare('PRAGMA table_info(scan_runs)').all().map((row) => row.name);
    for (const required of ['checkpoint_relative_path', 'resume_count', 'cancelled_at', 'error_message']) {
      if (!columns.includes(required)) throw new Error(`missing migrated scan_runs column: ${required}`);
    }
    const table = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='artwork_cache'").get();
    if (!table) throw new Error('artwork_cache table missing after v1 -> v2 migration');
  } finally {
    database.close();
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('K2-R3 schema migration PASS');
