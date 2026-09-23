#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { DatabaseSync } from 'node:sqlite';

const ROWS = Number(process.env.YANG_KURA_SQLITE_POC_ROWS ?? 25000);
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-sqlite-poc-'));
const databasePath = path.join(tempRoot, 'catalog-poc.sqlite');

let database;
try {
  database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA user_version = 1;

    CREATE TABLE media_tracks (
      id INTEGER PRIMARY KEY,
      stable_id TEXT NOT NULL UNIQUE,
      library_kind TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      duration_seconds REAL NOT NULL DEFAULT 0,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      modified_ms INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX media_tracks_library_kind
      ON media_tracks(library_kind, id);

    CREATE VIRTUAL TABLE media_tracks_fts USING fts5(
      stable_id UNINDEXED,
      title,
      artist,
      album,
      relative_path,
      tokenize = 'unicode61'
    );
  `);

  const insertTrack = database.prepare(`
    INSERT INTO media_tracks (
      stable_id, library_kind, title, artist, album, relative_path,
      duration_seconds, size_bytes, modified_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSearch = database.prepare(`
    INSERT INTO media_tracks_fts (
      stable_id, title, artist, album, relative_path
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insertStarted = performance.now();
  database.exec('BEGIN IMMEDIATE');
  try {
    for (let index = 0; index < ROWS; index += 1) {
      const stableId = `track-${index}`;
      const libraryKind = index % 3 === 0 ? 'asmr' : 'music';
      const title = index % 997 === 0 ? `耳语 睡前 Track ${index}` : `Track ${index}`;
      const artist = `Artist ${index % 400}`;
      const album = `Album ${Math.floor(index / 12)}`;
      const relativePath = `${libraryKind}/${album}/${String(index).padStart(6, '0')}.flac`;
      insertTrack.run(
        stableId,
        libraryKind,
        title,
        artist,
        album,
        relativePath,
        120 + (index % 1800),
        4_000_000 + index,
        1_700_000_000_000 + index,
      );
      insertSearch.run(stableId, title, artist, album, relativePath);
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
  const insertMs = performance.now() - insertStarted;

  const queryStarted = performance.now();
  const searchRows = database.prepare(`
    SELECT stable_id, title
    FROM media_tracks_fts
    WHERE media_tracks_fts MATCH ?
    LIMIT 50
  `).all('睡前');
  const pageRows = database.prepare(`
    SELECT stable_id, title
    FROM media_tracks
    WHERE library_kind = ?
      AND id > ?
    ORDER BY id
    LIMIT 100
  `).all('music', 1000);
  const queryMs = performance.now() - queryStarted;

  const journalMode = database.prepare('PRAGMA journal_mode').get();
  const userVersion = database.prepare('PRAGMA user_version').get();
  const total = database.prepare('SELECT COUNT(*) AS count FROM media_tracks').get();

  if (Number(total?.count) !== ROWS) throw new Error(`row count mismatch: ${total?.count} !== ${ROWS}`);
  if (searchRows.length === 0) throw new Error('FTS5 MATCH returned no rows');
  if (pageRows.length !== 100) throw new Error(`cursor page returned ${pageRows.length} rows`);
  if (String(journalMode?.journal_mode ?? '').toLowerCase() !== 'wal') {
    throw new Error(`WAL unavailable: ${JSON.stringify(journalMode)}`);
  }
  if (Number(userVersion?.user_version) !== 1) {
    throw new Error(`PRAGMA user_version mismatch: ${JSON.stringify(userVersion)}`);
  }

  console.log(JSON.stringify({
    ok: true,
    runtime: process.versions.electron ? 'electron-node' : 'node',
    node: process.versions.node,
    electron: process.versions.electron ?? null,
    sqlite: process.versions.sqlite ?? null,
    rows: ROWS,
    insertMs: Math.round(insertMs),
    queryMs: Number(queryMs.toFixed(3)),
    ftsMatches: searchRows.length,
    pageRows: pageRows.length,
    journalMode: journalMode?.journal_mode,
    userVersion: userVersion?.user_version,
  }, null, 2));
} finally {
  try { database?.close(); } catch {}
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
