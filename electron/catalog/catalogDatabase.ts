import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { initializeCatalogSchema, KURA_CATALOG_SCHEMA_VERSION } from './catalogSchema.js';
import type {
  CatalogCollectionPageQuery,
  CatalogCollectionQuery,
  CatalogCollectionRow,
  CatalogKeysetCursor,
  CatalogPage,
  CatalogCounts,
  CatalogFacetKind,
  CatalogFacetRow,
  CatalogFolderNodeRow,
  CatalogImportSummary,
  CatalogScannerRoot,
  CatalogScanBatchResult,
  CatalogScanEntry,
  CatalogScanEntryRow,
  CatalogScanRunRecord,
  CatalogTrackPageQuery,
  CatalogTrackQuery,
  CatalogTrackRow,
  ArtworkCacheRecord,
  LegacyCatalogCollection,
  LegacyCatalogCover,
  LegacyCatalogSubtitle,
  LegacyCatalogTrack,
  LegacyLocalJsonIndex,
} from './catalogTypes.js';

function safeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function safeRelativePath(value: unknown): string | null {
  const text = safeText(value);
  if (!text) return null;
  const normalized = text.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || path.isAbsolute(normalized) || /^[a-zA-Z]:\//.test(normalized) || normalized.startsWith('file://')) {
    return null;
  }
  return normalized;
}

function safeRootPathRef(value: unknown): string | null {
  const text = safeText(value);
  if (!text?.startsWith('rootPathToken:')) return null;
  return text;
}

function makeFolderNodeId(rootId: string, relativePath: string): string {
  return `folder-${crypto.createHash('sha1').update(`${rootId}:\0${relativePath}`).digest('hex').slice(0, 24)}`;
}

function folderPathsFromRelativePath(relativePath: string | null): string[] {
  if (!relativePath) return [];
  const segments = relativePath.split('/').filter(Boolean);
  if (segments.length <= 1) return [];
  const result: string[] = [];
  for (let index = 1; index < segments.length; index += 1) {
    result.push(segments.slice(0, index).join('/'));
  }
  return result;
}

function folderPathsFromFolderPath(folderPath: string | null): string[] {
  if (!folderPath) return [];
  const segments = folderPath.replace(/\\/g, '/').split('/').filter(Boolean);
  const result: string[] = [];
  for (let index = 1; index <= segments.length; index += 1) {
    result.push(segments.slice(0, index).join('/'));
  }
  return result;
}

function toFtsQuery(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  return `"${text.replace(/"/g, '""')}"`;
}

type SearchPlan =
  | { kind: 'none'; value: null }
  | { kind: 'unicode'; value: string }
  | { kind: 'trigram'; value: string }
  | { kind: 'like'; value: string };

const CJK_PATTERN = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/u;

function planSearch(value: string | undefined): SearchPlan {
  const text = value?.trim().normalize('NFKC') ?? '';
  if (!text) return { kind: 'none', value: null };
  if (CJK_PATTERN.test(text)) {
    return Array.from(text).length >= 3
      ? { kind: 'trigram', value: toFtsQuery(text) ?? text }
      : { kind: 'like', value: `%${text}%` };
  }
  return { kind: 'unicode', value: toFtsQuery(text) ?? text };
}

function collectionSearchText(collection: LegacyCatalogCollection, folderPath: string | null): string {
  return [
    collection.id,
    collection.title,
    collection.sortTitle ?? '',
    collection.codeNorm ?? collection.codeRaw ?? '',
    collection.artist ?? '',
    collection.circle ?? '',
    ...(collection.cvs ?? []),
    ...(collection.tags ?? []),
    folderPath ?? '',
  ].join('\u0001');
}

function trackSearchText(track: LegacyCatalogTrack, relativePath: string | null): string {
  return [
    track.id,
    track.title,
    track.displayArtist ?? '',
    track.displayAlbum ?? '',
    track.rjId ?? '',
    relativePath ?? '',
    ...(track.tags ?? []),
  ].join('\u0001');
}

function validateLegacyIndex(index: LegacyLocalJsonIndex): void {
  if (!index || typeof index !== 'object') throw new Error('Legacy index is required.');
  if (index.schemaVersion !== 1) throw new Error(`Unsupported legacy index schema: ${index.schemaVersion}`);
  for (const key of ['roots', 'collections', 'tracks', 'covers', 'subtitles'] as const) {
    if (!Array.isArray(index[key])) throw new Error(`Legacy index field ${key} must be an array.`);
  }
}

interface FolderNodeDraft {
  id: string;
  rootId: string;
  collectionId: string | null;
  parentId: string | null;
  name: string;
  relativePath: string;
  depth: number;
}

function collectFolderNodes(index: LegacyLocalJsonIndex): FolderNodeDraft[] {
  const byKey = new Map<string, FolderNodeDraft>();
  const collectionById = new Map(index.collections.map((collection) => [collection.id, collection]));
  const trackById = new Map(index.tracks.map((track) => [track.id, track]));

  const addPath = (rootId: string, collectionId: string | null, relativePath: string) => {
    const segments = relativePath.split('/').filter(Boolean);
    for (let depth = 1; depth <= segments.length; depth += 1) {
      const currentPath = segments.slice(0, depth).join('/');
      const parentPath = depth > 1 ? segments.slice(0, depth - 1).join('/') : null;
      const key = `${rootId}\0${currentPath}`;
      const existing = byKey.get(key);
      if (existing) {
        if (existing.collectionId && collectionId && existing.collectionId !== collectionId) {
          existing.collectionId = null;
        }
        continue;
      }
      byKey.set(key, {
        id: makeFolderNodeId(rootId, currentPath),
        rootId,
        collectionId,
        parentId: parentPath ? makeFolderNodeId(rootId, parentPath) : null,
        name: segments[depth - 1] ?? currentPath,
        relativePath: currentPath,
        depth,
      });
    }
  };

  for (const collection of index.collections) {
    const folderPath = safeRelativePath(collection.folderPath);
    for (const candidate of folderPathsFromFolderPath(folderPath)) addPath(collection.rootId, collection.id, candidate);
  }

  for (const track of index.tracks) {
    const relativePath = safeRelativePath(track.source?.relativePath);
    for (const candidate of folderPathsFromRelativePath(relativePath)) addPath(track.rootId, track.collectionId, candidate);

    for (const subtitle of track.subtitles ?? []) {
      const subtitlePath = safeRelativePath(subtitle.relativePath);
      for (const candidate of folderPathsFromRelativePath(subtitlePath)) addPath(track.rootId, track.collectionId, candidate);
    }
  }

  for (const subtitle of index.subtitles) {
    const track = trackById.get(subtitle.trackId);
    if (!track) continue;
    const subtitlePath = safeRelativePath(subtitle.relativePath);
    for (const candidate of folderPathsFromRelativePath(subtitlePath)) addPath(track.rootId, track.collectionId, candidate);
  }

  for (const cover of index.covers) {
    const collection = collectionById.get(cover.collectionId);
    if (!collection) continue;
    const coverPath = safeRelativePath(cover.relativePath);
    for (const candidate of folderPathsFromRelativePath(coverPath)) addPath(collection.rootId, collection.id, candidate);
  }

  return [...byKey.values()].sort((left, right) => left.depth - right.depth || left.relativePath.localeCompare(right.relativePath));
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of items) if (item?.id) byId.set(item.id, item);
  return [...byId.values()];
}

function mergeLegacySubtitles(index: LegacyLocalJsonIndex): LegacyCatalogSubtitle[] {
  return uniqueById([
    ...index.subtitles,
    ...index.tracks.flatMap((track) => track.subtitles ?? []),
  ]);
}

function mergeLegacyArtwork(index: LegacyLocalJsonIndex): Array<LegacyCatalogCover & { trackId?: string }> {
  const items: Array<LegacyCatalogCover & { trackId?: string }> = [
    ...index.covers,
    ...index.collections.flatMap((collection) => collection.cover ? [collection.cover] : []),
    ...index.tracks.flatMap((track) => track.cover ? [{ ...track.cover, trackId: track.id }] : []),
  ];
  return uniqueById(items);
}

function joined(values: string[] | undefined): string {
  return (values ?? []).filter(Boolean).join(' ');
}

export class KuraCatalogDatabase {
  private readonly database: DatabaseSync;
  readonly schemaVersion: number;

  constructor(databasePath: string) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.schemaVersion = initializeCatalogSchema(this.database);
  }

  close(): void {
    this.database.close();
  }

  replaceFromLegacyIndex(index: LegacyLocalJsonIndex): CatalogImportSummary {
    return this.importLegacyIndex(index, true);
  }

  upsertFromLegacyIndex(index: LegacyLocalJsonIndex): CatalogImportSummary {
    return this.importLegacyIndex(index, false);
  }

  private importLegacyIndex(index: LegacyLocalJsonIndex, replaceAll: boolean): CatalogImportSummary {
    validateLegacyIndex(index);
    const database = this.database;
    const importedAt = new Date().toISOString();

    const insertRoot = database.prepare(`
      INSERT INTO roots (
        id, name, library_type, scan_profile, source_kind, root_path_ref, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        library_type = excluded.library_type,
        scan_profile = excluded.scan_profile,
        source_kind = excluded.source_kind,
        root_path_ref = COALESCE(excluded.root_path_ref, roots.root_path_ref),
        updated_at = excluded.updated_at
    `);
    const insertCollection = database.prepare(`
      INSERT INTO collections (
        id, root_id, collection_type, title, sort_title, code_raw, code_norm, artist, circle,
        album, folder_path, status, total_duration_seconds, added_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertCv = database.prepare('INSERT INTO collection_cvs (collection_id, position, value) VALUES (?, ?, ?)');
    const insertCollectionTag = database.prepare('INSERT INTO collection_tags (collection_id, value) VALUES (?, ?)');
    const insertTrack = database.prepare(`
      INSERT INTO tracks (
        id, root_id, collection_id, kind, title, display_artist, display_album, rj_id,
        track_no, disc_no, duration_seconds, added_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertTrackTag = database.prepare('INSERT INTO track_tags (track_id, value) VALUES (?, ?)');
    const insertSource = database.prepare(`
      INSERT INTO media_sources (
        id, track_id, root_id, source_kind, relative_path, extension, size_bytes, mtime_ms, availability, fingerprint
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', NULL)
    `);
    const insertSubtitle = database.prepare(`
      INSERT INTO subtitles (
        id, track_id, source_kind, language, format, relative_path, line_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertArtwork = database.prepare(`
      INSERT INTO artwork (
        id, collection_id, track_id, source_kind, relative_path, url, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertTrackTrigram = database.prepare(
      'INSERT INTO tracks_fts_trigram (track_id, search_text) VALUES (?, ?)',
    );
    const insertFolder = database.prepare(`
      INSERT INTO folder_nodes (
        id, root_id, collection_id, parent_id, name, relative_path, depth
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertCollectionFts = database.prepare(`
      INSERT INTO collections_fts (
        collection_id, title, sort_title, code, artist, circle, cvs, tags, folder_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertCollectionTrigram = database.prepare(
      'INSERT INTO collections_fts_trigram (collection_id, search_text) VALUES (?, ?)',
    );
    const insertTrackFts = database.prepare(`
      INSERT INTO tracks_fts (
        track_id, title, artist, album, rj_id, relative_path, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    database.exec('BEGIN IMMEDIATE;');
    try {
      if (replaceAll) {
        database.exec(`
          DELETE FROM collections_fts;
          DELETE FROM tracks_fts;
          DELETE FROM collections_fts_trigram;
          DELETE FROM tracks_fts_trigram;
          DELETE FROM attachments;
          DELETE FROM scan_entries;
          DELETE FROM scan_runs;
          DELETE FROM artwork;
          DELETE FROM subtitles;
          DELETE FROM media_sources;
          DELETE FROM track_tags;
          DELETE FROM tracks;
          DELETE FROM folder_nodes;
          DELETE FROM collection_tags;
          DELETE FROM collection_cvs;
          DELETE FROM collections;
          DELETE FROM roots;
          DELETE FROM catalog_meta;
        `);
      } else {
        const deleteTrackFts = database.prepare(
          'DELETE FROM tracks_fts WHERE track_id IN (SELECT id FROM tracks WHERE root_id = ?)',
        );
        const deleteCollectionFts = database.prepare(
          'DELETE FROM collections_fts WHERE collection_id IN (SELECT id FROM collections WHERE root_id = ?)',
        );
        const deleteTrackTrigram = database.prepare(
          'DELETE FROM tracks_fts_trigram WHERE track_id IN (SELECT id FROM tracks WHERE root_id = ?)',
        );
        const deleteCollectionTrigram = database.prepare(
          'DELETE FROM collections_fts_trigram WHERE collection_id IN (SELECT id FROM collections WHERE root_id = ?)',
        );
        const deleteFolderNodes = database.prepare('DELETE FROM folder_nodes WHERE root_id = ?');
        const deleteCollections = database.prepare('DELETE FROM collections WHERE root_id = ?');
        const deleteRootMeta = database.prepare('DELETE FROM catalog_meta WHERE key LIKE ?');

        for (const root of index.roots) {
          deleteTrackFts.run(root.id);
          deleteCollectionFts.run(root.id);
          deleteTrackTrigram.run(root.id);
          deleteCollectionTrigram.run(root.id);
          deleteFolderNodes.run(root.id);
          deleteCollections.run(root.id);
          deleteRootMeta.run(`root:${root.id}:%`);
        }
      }

      for (const root of index.roots) {
        insertRoot.run(
          root.id,
          root.name,
          root.libraryType,
          root.scanProfile,
          root.sourceKind,
          safeRootPathRef(root.rootPath),
          root.createdAt,
          root.updatedAt,
        );
      }

      for (const collection of index.collections) {
        const folderPath = safeRelativePath(collection.folderPath);
        insertCollection.run(
          collection.id,
          collection.rootId,
          collection.collectionType,
          collection.title,
          collection.sortTitle ?? null,
          collection.codeRaw ?? null,
          collection.codeNorm ?? null,
          collection.artist ?? null,
          collection.circle ?? null,
          collection.album ?? null,
          folderPath,
          collection.status,
          collection.totalDurationSeconds ?? null,
          collection.addedAt ?? null,
          collection.updatedAt ?? null,
        );

        (collection.cvs ?? []).forEach((value, position) => insertCv.run(collection.id, position, value));
        for (const value of collection.tags ?? []) insertCollectionTag.run(collection.id, value);

        insertCollectionFts.run(
          collection.id,
          collection.title,
          collection.sortTitle ?? '',
          collection.codeNorm ?? collection.codeRaw ?? '',
          collection.artist ?? '',
          collection.circle ?? '',
          joined(collection.cvs),
          joined(collection.tags),
          folderPath ?? '',
        );
        insertCollectionTrigram.run(collection.id, collectionSearchText(collection, folderPath));
      }

      for (const track of index.tracks) {
        const relativePath = safeRelativePath(track.source?.relativePath);
        insertTrack.run(
          track.id,
          track.rootId,
          track.collectionId,
          track.kind,
          track.title,
          track.displayArtist ?? null,
          track.displayAlbum ?? null,
          track.rjId ?? null,
          track.trackNo ?? null,
          track.discNo ?? null,
          track.durationSeconds ?? null,
          track.addedAt ?? null,
        );

        for (const value of track.tags ?? []) insertTrackTag.run(track.id, value);

        insertSource.run(
          track.source?.id || `source-${track.id}`,
          track.id,
          track.rootId,
          track.source?.sourceKind ?? 'missing',
          relativePath,
          safeText(track.source?.extension),
          track.source?.sizeBytes ?? null,
          track.source?.mtimeMs ?? null,
        );

        insertTrackFts.run(
          track.id,
          track.title,
          track.displayArtist ?? '',
          track.displayAlbum ?? '',
          track.rjId ?? '',
          relativePath ?? '',
          joined(track.tags),
        );
        insertTrackTrigram.run(track.id, trackSearchText(track, relativePath));
      }

      for (const subtitle of mergeLegacySubtitles(index)) {
        insertSubtitle.run(
          subtitle.id,
          subtitle.trackId,
          subtitle.sourceKind,
          subtitle.language ?? null,
          subtitle.format ?? null,
          safeRelativePath(subtitle.relativePath),
          subtitle.lineCount ?? null,
        );
      }

      for (const cover of mergeLegacyArtwork(index)) {
        insertArtwork.run(
          cover.id,
          cover.collectionId,
          cover.trackId ?? null,
          cover.sourceKind,
          safeRelativePath(cover.relativePath),
          cover.sourceKind === 'mock-url' ? safeText(cover.url) : null,
          cover.isPrimary ? 1 : 0,
        );
      }

      for (const folder of collectFolderNodes(index)) {
        insertFolder.run(
          folder.id,
          folder.rootId,
          folder.collectionId,
          folder.parentId,
          folder.name,
          folder.relativePath,
          folder.depth,
        );
      }

      const upsertMeta = database.prepare(
        'INSERT INTO catalog_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      );
      for (const root of index.roots) {
        upsertMeta.run(`root:${root.id}:source_generated_at`, index.generatedAt);
        upsertMeta.run(`root:${root.id}:source_kind`, index.sourceKind);
        upsertMeta.run(`root:${root.id}:imported_at`, importedAt);
      }
      upsertMeta.run('last_imported_at', importedAt);
      database.exec('COMMIT;');
      database.exec('PRAGMA optimize;');
    } catch (error) {
      database.exec('ROLLBACK;');
      throw error;
    }

    return {
      schemaVersion: this.schemaVersion,
      importedAt,
      sourceGeneratedAt: index.generatedAt,
      sourceKind: index.sourceKind,
      ...this.getCounts(),
    };
  }

  getCounts(): CatalogCounts {
    const count = (table: string): number => {
      const row = this.database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count?: number | bigint } | undefined;
      return Number(row?.count ?? 0);
    };

    return {
      roots: count('roots'),
      collections: count('collections'),
      tracks: count('tracks'),
      mediaSources: count('media_sources'),
      subtitles: count('subtitles'),
      artwork: count('artwork'),
      folderNodes: count('folder_nodes'),
    };
  }

  ensureScannerRoot(root: CatalogScannerRoot): void {
    const now = new Date().toISOString();
    this.database.prepare(`
      INSERT INTO roots (
        id, name, library_type, scan_profile, source_kind, root_path_ref, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'electron-scan', ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        library_type = excluded.library_type,
        scan_profile = excluded.scan_profile,
        source_kind = excluded.source_kind,
        root_path_ref = excluded.root_path_ref,
        updated_at = excluded.updated_at
    `).run(
      root.id,
      root.name,
      root.libraryType,
      root.scanProfile,
      `rootPathToken:${root.rootPathToken}`,
      now,
      now,
    );
  }

  beginScanRun(rootId: string, runId: string, startedAt = new Date().toISOString()): CatalogScanRunRecord {
    this.database.prepare(`
      INSERT INTO scan_runs (
        id, root_id, started_at, status, files_seen, directories_seen,
        changed_entries, error_count, checkpoint_relative_path, resume_count
      ) VALUES (?, ?, ?, 'running', 0, 0, 0, 0, NULL, 0)
    `).run(runId, rootId, startedAt);
    return this.getScanRun(runId);
  }

  resumeScanRun(runId: string): CatalogScanRunRecord {
    const existing = this.getScanRun(runId);
    if (existing.status === 'completed') throw new Error('Completed scan runs cannot be resumed.');
    this.database.prepare(`
      UPDATE scan_runs
      SET status = 'running',
          completed_at = NULL,
          cancelled_at = NULL,
          error_message = NULL,
          resume_count = resume_count + 1
      WHERE id = ?
    `).run(runId);
    return this.getScanRun(runId);
  }

  applyScanBatch(rootId: string, runId: string, entries: CatalogScanEntry[]): CatalogScanBatchResult {
    if (!entries.length) {
      return {
        processed: 0,
        changed: 0,
        unchanged: 0,
        changedRelativePaths: [],
        checkpointRelativePath: null,
      };
    }

    const run = this.getScanRun(runId);
    if (run.rootId !== rootId) throw new Error('Scan run/root mismatch.');
    if (run.status !== 'running') throw new Error(`Scan run is not active: ${run.status}`);

    const normalizedEntries = entries.map((entry) => {
      const relativePath = safeRelativePath(entry.relativePath);
      if (!relativePath) throw new Error(`Unsafe scan relative path: ${entry.relativePath}`);
      return { ...entry, relativePath };
    });
    const placeholders = normalizedEntries.map(() => '?').join(',');
    const existingRows = this.database.prepare(`
      SELECT
        relative_path AS relativePath,
        entry_kind AS entryKind,
        size_bytes AS sizeBytes,
        mtime_ms AS mtimeMs,
        fingerprint,
        state
      FROM scan_entries
      WHERE root_id = ? AND relative_path IN (${placeholders})
    `).all(rootId, ...normalizedEntries.map((entry) => entry.relativePath)) as unknown as Array<{
      relativePath: string;
      entryKind: string;
      sizeBytes: number | null;
      mtimeMs: number | null;
      fingerprint: string | null;
      state: string;
    }>;
    const existingByPath = new Map(existingRows.map((row) => [row.relativePath, row]));
    const changedRelativePaths: string[] = [];

    const upsert = this.database.prepare(`
      INSERT INTO scan_entries (
        root_id, relative_path, entry_kind, size_bytes, mtime_ms,
        fingerprint, last_seen_scan_id, state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'present')
      ON CONFLICT(root_id, relative_path) DO UPDATE SET
        entry_kind = excluded.entry_kind,
        size_bytes = excluded.size_bytes,
        mtime_ms = excluded.mtime_ms,
        fingerprint = excluded.fingerprint,
        last_seen_scan_id = excluded.last_seen_scan_id,
        state = 'present'
    `);

    let fileCount = 0;
    let directoryCount = 0;
    this.database.exec('BEGIN IMMEDIATE;');
    try {
      for (const entry of normalizedEntries) {
        const previous = existingByPath.get(entry.relativePath);
        const changed = !previous
          || previous.entryKind !== entry.entryKind
          || previous.sizeBytes !== (entry.sizeBytes ?? null)
          || previous.mtimeMs !== (entry.mtimeMs ?? null)
          || previous.fingerprint !== (entry.fingerprint ?? null)
          || previous.state !== 'present';
        if (changed) changedRelativePaths.push(entry.relativePath);

        if (entry.entryKind === 'directory') directoryCount += 1;
        else if (entry.entryKind !== 'symlink') fileCount += 1;

        upsert.run(
          rootId,
          entry.relativePath,
          entry.entryKind,
          entry.sizeBytes ?? null,
          entry.mtimeMs ?? null,
          entry.fingerprint ?? null,
          runId,
        );
      }

      const checkpoint = normalizedEntries[normalizedEntries.length - 1]?.relativePath ?? null;
      this.database.prepare(`
        UPDATE scan_runs
        SET files_seen = files_seen + ?,
            directories_seen = directories_seen + ?,
            changed_entries = changed_entries + ?,
            checkpoint_relative_path = ?
        WHERE id = ?
      `).run(fileCount, directoryCount, changedRelativePaths.length, checkpoint, runId);
      this.database.exec('COMMIT;');

      return {
        processed: normalizedEntries.length,
        changed: changedRelativePaths.length,
        unchanged: normalizedEntries.length - changedRelativePaths.length,
        changedRelativePaths,
        checkpointRelativePath: checkpoint,
      };
    } catch (error) {
      this.database.exec('ROLLBACK;');
      throw error;
    }
  }

  addScanErrors(runId: string, count: number): void {
    const safeCount = Math.max(0, Math.trunc(count));
    if (!safeCount) return;
    this.database.prepare('UPDATE scan_runs SET error_count = error_count + ? WHERE id = ?').run(safeCount, runId);
  }

  cancelScanRun(runId: string): CatalogScanRunRecord {
    const now = new Date().toISOString();
    this.database.prepare(`
      UPDATE scan_runs
      SET status = 'cancelled', cancelled_at = ?, completed_at = NULL
      WHERE id = ?
    `).run(now, runId);
    return this.getScanRun(runId);
  }

  failScanRun(runId: string, errorMessage: string): CatalogScanRunRecord {
    const now = new Date().toISOString();
    this.database.prepare(`
      UPDATE scan_runs
      SET status = 'failed', completed_at = ?, error_message = ?
      WHERE id = ?
    `).run(now, errorMessage.slice(0, 500), runId);
    return this.getScanRun(runId);
  }

  completeScanRun(runId: string): CatalogScanRunRecord & { missingEntries: number } {
    const run = this.getScanRun(runId);
    if (run.status !== 'running') throw new Error(`Scan run is not active: ${run.status}`);
    const now = new Date().toISOString();

    this.database.exec('BEGIN IMMEDIATE;');
    try {
      const missing = this.database.prepare(`
        UPDATE scan_entries
        SET state = 'missing'
        WHERE root_id = ?
          AND state = 'present'
          AND (last_seen_scan_id IS NULL OR last_seen_scan_id <> ?)
      `).run(run.rootId, runId).changes;

      this.database.prepare(`
        UPDATE scan_runs
        SET status = 'completed',
            completed_at = ?,
            changed_entries = changed_entries + ?
        WHERE id = ?
      `).run(now, Number(missing), runId);
      this.database.exec('COMMIT;');
      return { ...this.getScanRun(runId), missingEntries: Number(missing) };
    } catch (error) {
      this.database.exec('ROLLBACK;');
      throw error;
    }
  }

  getScanRun(runId: string): CatalogScanRunRecord {
    const row = this.database.prepare(`
      SELECT
        id,
        root_id AS rootId,
        started_at AS startedAt,
        completed_at AS completedAt,
        status,
        files_seen AS filesSeen,
        directories_seen AS directoriesSeen,
        changed_entries AS changedEntries,
        error_count AS errorCount,
        checkpoint_relative_path AS checkpointRelativePath,
        resume_count AS resumeCount,
        cancelled_at AS cancelledAt,
        error_message AS errorMessage
      FROM scan_runs
      WHERE id = ?
    `).get(runId) as unknown as CatalogScanRunRecord | undefined;
    if (!row) throw new Error(`Unknown scan run: ${runId}`);
    return row;
  }

  listScanEntries(rootId: string, state?: 'present' | 'missing', limit = 10000): CatalogScanEntryRow[] {
    const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 100000));
    const rows = state
      ? this.database.prepare(`
          SELECT
            root_id AS rootId,
            relative_path AS relativePath,
            entry_kind AS entryKind,
            size_bytes AS sizeBytes,
            mtime_ms AS mtimeMs,
            fingerprint,
            last_seen_scan_id AS lastSeenScanId,
            state
          FROM scan_entries
          WHERE root_id = ? AND state = ?
          ORDER BY relative_path
          LIMIT ?
        `).all(rootId, state, safeLimit)
      : this.database.prepare(`
          SELECT
            root_id AS rootId,
            relative_path AS relativePath,
            entry_kind AS entryKind,
            size_bytes AS sizeBytes,
            mtime_ms AS mtimeMs,
            fingerprint,
            last_seen_scan_id AS lastSeenScanId,
            state
          FROM scan_entries
          WHERE root_id = ?
          ORDER BY relative_path
          LIMIT ?
        `).all(rootId, safeLimit);
    return rows as unknown as CatalogScanEntryRow[];
  }

  getArtworkCacheRecord(rootId: string, sourceRelativePath: string): ArtworkCacheRecord | null {
    const relativePath = safeRelativePath(sourceRelativePath);
    if (!relativePath) return null;
    const row = this.database.prepare(`
      SELECT
        root_id AS rootId,
        source_relative_path AS sourceRelativePath,
        source_size_bytes AS sourceSizeBytes,
        source_mtime_ms AS sourceMtimeMs,
        cache_key AS cacheKey,
        cache_relative_path AS cacheRelativePath,
        width,
        height,
        byte_size AS byteSize,
        state,
        error_code AS errorCode,
        updated_at AS updatedAt
      FROM artwork_cache
      WHERE root_id = ? AND source_relative_path = ?
    `).get(rootId, relativePath) as unknown as ArtworkCacheRecord | undefined;
    return row ?? null;
  }

  upsertArtworkCacheRecord(record: ArtworkCacheRecord): void {
    const sourceRelativePath = safeRelativePath(record.sourceRelativePath);
    if (!sourceRelativePath) throw new Error('Unsafe artwork source relative path.');
    const cacheRelativePath = record.cacheRelativePath ? safeRelativePath(record.cacheRelativePath) : null;
    if (record.cacheRelativePath && !cacheRelativePath) throw new Error('Unsafe artwork cache relative path.');

    this.database.prepare(`
      INSERT INTO artwork_cache (
        root_id, source_relative_path, source_size_bytes, source_mtime_ms,
        cache_key, cache_relative_path, width, height, byte_size,
        state, error_code, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(root_id, source_relative_path) DO UPDATE SET
        source_size_bytes = excluded.source_size_bytes,
        source_mtime_ms = excluded.source_mtime_ms,
        cache_key = excluded.cache_key,
        cache_relative_path = excluded.cache_relative_path,
        width = excluded.width,
        height = excluded.height,
        byte_size = excluded.byte_size,
        state = excluded.state,
        error_code = excluded.error_code,
        updated_at = excluded.updated_at
    `).run(
      record.rootId,
      sourceRelativePath,
      record.sourceSizeBytes,
      record.sourceMtimeMs,
      record.cacheKey,
      cacheRelativePath,
      record.width,
      record.height,
      record.byteSize,
      record.state,
      record.errorCode,
      record.updatedAt,
    );
  }

  queryCollections(options: CatalogCollectionQuery = {}): CatalogCollectionRow[] {
    return this.pageCollections({
      ...options,
      sort: 'id-asc',
      cursor: options.afterId ? { sortValue: options.afterId, id: options.afterId } : null,
    }).items;
  }

  queryTracks(options: CatalogTrackQuery = {}): CatalogTrackRow[] {
    return this.pageTracks({
      ...options,
      sort: 'id-asc',
      cursor: options.afterId ? { sortValue: options.afterId, id: options.afterId } : null,
    }).items;
  }

  pageCollections(options: CatalogCollectionPageQuery = {}): CatalogPage<CatalogCollectionRow> {
    const joins: string[] = [];
    const clauses: string[] = [];
    const params: Array<string | number> = [];
    const search = planSearch(options.search);

    if (search.kind === 'unicode') {
      joins.push('JOIN collections_fts ftu ON ftu.collection_id = c.id');
      clauses.push('collections_fts MATCH ?');
      params.push(search.value);
    } else if (search.kind === 'trigram') {
      joins.push('JOIN collections_fts_trigram ftt ON ftt.collection_id = c.id');
      clauses.push('collections_fts_trigram MATCH ?');
      params.push(search.value);
    } else if (search.kind === 'like') {
      clauses.push(`(
        c.title LIKE ?
        OR COALESCE(c.sort_title, '') LIKE ?
        OR COALESCE(c.code_norm, '') LIKE ?
        OR COALESCE(c.code_raw, '') LIKE ?
        OR COALESCE(c.artist, '') LIKE ?
        OR COALESCE(c.circle, '') LIKE ?
        OR COALESCE(c.folder_path, '') LIKE ?
        OR EXISTS (SELECT 1 FROM collection_cvs scv WHERE scv.collection_id = c.id AND scv.value LIKE ?)
        OR EXISTS (SELECT 1 FROM collection_tags stg WHERE stg.collection_id = c.id AND stg.value LIKE ?)
      )`);
      for (let i = 0; i < 9; i += 1) params.push(search.value);
    }

    if (options.rootId) { clauses.push('c.root_id = ?'); params.push(options.rootId); }
    if (options.collectionType) { clauses.push('c.collection_type = ?'); params.push(options.collectionType); }
    if (options.circle) { clauses.push('c.circle = ?'); params.push(options.circle); }
    if (options.artist) { clauses.push('c.artist = ?'); params.push(options.artist); }
    if (options.cv) {
      clauses.push('EXISTS (SELECT 1 FROM collection_cvs cv WHERE cv.collection_id = c.id AND cv.value = ?)');
      params.push(options.cv);
    }
    if (options.tag) {
      clauses.push('EXISTS (SELECT 1 FROM collection_tags tag WHERE tag.collection_id = c.id AND tag.value = ?)');
      params.push(options.tag);
    }

    const sort = options.sort ?? 'id-asc';
    const spec = sort === 'title-asc'
      ? { expression: "COALESCE(NULLIF(c.sort_title, ''), c.title)", direction: 'ASC', idDirection: 'ASC' }
      : sort === 'added-desc'
        ? { expression: "COALESCE(c.added_at, '')", direction: 'DESC', idDirection: 'DESC' }
        : sort === 'duration-desc'
          ? { expression: 'COALESCE(c.total_duration_seconds, 0)', direction: 'DESC', idDirection: 'DESC' }
          : { expression: 'c.id', direction: 'ASC', idDirection: 'ASC' };

    if (options.cursor) {
      const op = spec.direction === 'ASC' ? '>' : '<';
      const idOp = spec.idDirection === 'ASC' ? '>' : '<';
      clauses.push(`(${spec.expression} ${op} ? OR (${spec.expression} = ? AND c.id ${idOp} ?))`);
      params.push(options.cursor.sortValue, options.cursor.sortValue, options.cursor.id);
    }

    const limit = Math.max(1, Math.min(Math.trunc(options.limit ?? 100), 500));
    params.push(limit + 1);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = this.database.prepare(`
      SELECT
        c.id,
        c.root_id AS rootId,
        c.collection_type AS collectionType,
        c.title,
        c.code_norm AS codeNorm,
        c.artist,
        c.circle,
        c.folder_path AS folderPath,
        ${spec.expression} AS __sortValue
      FROM collections c
      ${joins.join('\n')}
      ${where}
      ORDER BY ${spec.expression} ${spec.direction}, c.id ${spec.idDirection}
      LIMIT ?
    `).all(...params) as unknown as Array<CatalogCollectionRow & { __sortValue: string | number }>;

    const hasMore = rows.length > limit;
    const visible = rows.slice(0, limit);
    const last = visible.at(-1);
    return {
      items: visible.map(({ __sortValue: _value, ...row }) => row),
      hasMore,
      nextCursor: hasMore && last
        ? { sortValue: last.__sortValue, id: last.id } satisfies CatalogKeysetCursor
        : null,
    };
  }

  pageTracks(options: CatalogTrackPageQuery = {}): CatalogPage<CatalogTrackRow> {
    const joins: string[] = [];
    const clauses: string[] = [];
    const params: Array<string | number> = [];
    const search = planSearch(options.search);

    if (search.kind === 'unicode') {
      joins.push('JOIN tracks_fts ftu ON ftu.track_id = t.id');
      clauses.push('tracks_fts MATCH ?');
      params.push(search.value);
    } else if (search.kind === 'trigram') {
      joins.push('JOIN tracks_fts_trigram ftt ON ftt.track_id = t.id');
      clauses.push('tracks_fts_trigram MATCH ?');
      params.push(search.value);
    } else if (search.kind === 'like') {
      clauses.push(`(
        t.title LIKE ?
        OR COALESCE(t.display_artist, '') LIKE ?
        OR COALESCE(t.display_album, '') LIKE ?
        OR COALESCE(t.rj_id, '') LIKE ?
        OR EXISTS (SELECT 1 FROM media_sources src WHERE src.track_id = t.id AND COALESCE(src.relative_path, '') LIKE ?)
        OR EXISTS (SELECT 1 FROM track_tags tag WHERE tag.track_id = t.id AND tag.value LIKE ?)
      )`);
      for (let i = 0; i < 6; i += 1) params.push(search.value);
    }

    if (options.rootId) { clauses.push('t.root_id = ?'); params.push(options.rootId); }
    if (options.collectionId) { clauses.push('t.collection_id = ?'); params.push(options.collectionId); }
    if (options.kind) { clauses.push('t.kind = ?'); params.push(options.kind); }
    if (options.artist) { clauses.push('t.display_artist = ?'); params.push(options.artist); }
    if (options.tag) {
      clauses.push('EXISTS (SELECT 1 FROM track_tags tag_filter WHERE tag_filter.track_id = t.id AND tag_filter.value = ?)');
      params.push(options.tag);
    }

    const sort = options.sort ?? 'id-asc';
    const spec = sort === 'title-asc'
      ? { expression: 't.title', direction: 'ASC', idDirection: 'ASC' }
      : sort === 'album-asc'
        ? { expression: "COALESCE(t.display_album, '')", direction: 'ASC', idDirection: 'ASC' }
        : sort === 'added-desc'
          ? { expression: "COALESCE(t.added_at, '')", direction: 'DESC', idDirection: 'DESC' }
          : sort === 'duration-desc'
            ? { expression: 'COALESCE(t.duration_seconds, 0)', direction: 'DESC', idDirection: 'DESC' }
            : { expression: 't.id', direction: 'ASC', idDirection: 'ASC' };

    if (options.cursor) {
      const op = spec.direction === 'ASC' ? '>' : '<';
      const idOp = spec.idDirection === 'ASC' ? '>' : '<';
      clauses.push(`(${spec.expression} ${op} ? OR (${spec.expression} = ? AND t.id ${idOp} ?))`);
      params.push(options.cursor.sortValue, options.cursor.sortValue, options.cursor.id);
    }

    const limit = Math.max(1, Math.min(Math.trunc(options.limit ?? 200), 500));
    params.push(limit + 1);
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = this.database.prepare(`
      SELECT
        t.id,
        t.root_id AS rootId,
        t.collection_id AS collectionId,
        t.kind,
        t.title,
        t.display_artist AS artist,
        t.display_album AS album,
        t.rj_id AS rjId,
        (
          SELECT s.relative_path
          FROM media_sources s
          WHERE s.track_id = t.id
          ORDER BY CASE WHEN s.availability = 'available' THEN 0 ELSE 1 END, s.id
          LIMIT 1
        ) AS relativePath,
        ${spec.expression} AS __sortValue
      FROM tracks t
      ${joins.join('\n')}
      ${where}
      ORDER BY ${spec.expression} ${spec.direction}, t.id ${spec.idDirection}
      LIMIT ?
    `).all(...params) as unknown as Array<CatalogTrackRow & { __sortValue: string | number }>;

    const hasMore = rows.length > limit;
    const visible = rows.slice(0, limit);
    const last = visible.at(-1);
    return {
      items: visible.map(({ __sortValue: _value, ...row }) => row),
      hasMore,
      nextCursor: hasMore && last
        ? { sortValue: last.__sortValue, id: last.id } satisfies CatalogKeysetCursor
        : null,
    };
  }

  listFolderChildren(rootId: string, parentRelativePath: string | null = null, limit = 500): CatalogFolderNodeRow[] {
    const safeLimit = Math.max(1, Math.min(Math.floor(limit), 1000));
    if (parentRelativePath) {
      const normalized = safeRelativePath(parentRelativePath);
      if (!normalized) return [];
      const parent = this.database.prepare(
        'SELECT id FROM folder_nodes WHERE root_id = ? AND relative_path = ?',
      ).get(rootId, normalized) as { id?: string } | undefined;
      if (!parent?.id) return [];
      return this.database.prepare(`
        SELECT
          id,
          root_id AS rootId,
          collection_id AS collectionId,
          parent_id AS parentId,
          name,
          relative_path AS relativePath,
          depth
        FROM folder_nodes
        WHERE root_id = ? AND parent_id = ?
        ORDER BY name COLLATE NOCASE, id
        LIMIT ?
      `).all(rootId, parent.id, safeLimit) as unknown as CatalogFolderNodeRow[];
    }

    return this.database.prepare(`
      SELECT
        id,
        root_id AS rootId,
        collection_id AS collectionId,
        parent_id AS parentId,
        name,
        relative_path AS relativePath,
        depth
      FROM folder_nodes
      WHERE root_id = ? AND parent_id IS NULL
      ORDER BY name COLLATE NOCASE, id
      LIMIT ?
    `).all(rootId, safeLimit) as unknown as CatalogFolderNodeRow[];
  }

  listCollectionFacets(
    facet: CatalogFacetKind,
    options: { rootId?: string; collectionType?: string; limit?: number } = {},
  ): CatalogFacetRow[] {
    const safeLimit = Math.max(1, Math.min(Math.floor(options.limit ?? 200), 1000));
    const filters: string[] = [];
    const params: Array<string | number> = [];
    if (options.rootId) {
      filters.push('c.root_id = ?');
      params.push(options.rootId);
    }
    if (options.collectionType) {
      filters.push('c.collection_type = ?');
      params.push(options.collectionType);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    if (facet === 'cv' || facet === 'tag') {
      const table = facet === 'cv' ? 'collection_cvs' : 'collection_tags';
      const alias = facet === 'cv' ? 'cv' : 'tag';
      params.push(safeLimit);
      return this.database.prepare(`
        SELECT ${alias}.value AS value, COUNT(DISTINCT c.id) AS count
        FROM ${table} ${alias}
        JOIN collections c ON c.id = ${alias}.collection_id
        ${where}
        GROUP BY ${alias}.value
        ORDER BY count DESC, value COLLATE NOCASE
        LIMIT ?
      `).all(...params) as unknown as CatalogFacetRow[];
    }

    const column = facet === 'circle' ? 'c.circle' : 'c.artist';
    const columnFilter = `${column} IS NOT NULL AND TRIM(${column}) <> ''`;
    const combinedWhere = filters.length
      ? `WHERE ${filters.join(' AND ')} AND ${columnFilter}`
      : `WHERE ${columnFilter}`;
    params.push(safeLimit);
    return this.database.prepare(`
      SELECT ${column} AS value, COUNT(*) AS count
      FROM collections c
      ${combinedWhere}
      GROUP BY ${column}
      ORDER BY count DESC, value COLLATE NOCASE
      LIMIT ?
    `).all(...params) as unknown as CatalogFacetRow[];
  }

  searchCollections(query: string, limit = 50): CatalogCollectionRow[] {
    return this.pageCollections({ search: query, limit, sort: 'id-asc' }).items;
  }

  searchTracks(query: string, limit = 50): CatalogTrackRow[] {
    return this.pageTracks({ search: query, limit, sort: 'id-asc' }).items;
  }

  listTracksByCollection(collectionId: string, afterId = '', limit = 200): CatalogTrackRow[] {
    const safeLimit = Math.max(1, Math.min(Math.floor(limit), 500));
    return this.database.prepare(`
      SELECT
        t.id,
        t.root_id AS rootId,
        t.collection_id AS collectionId,
        t.kind,
        t.title,
        t.display_artist AS artist,
        t.display_album AS album,
        t.rj_id AS rjId,
        (
          SELECT s.relative_path
          FROM media_sources s
          WHERE s.track_id = t.id
          ORDER BY CASE WHEN s.availability = 'available' THEN 0 ELSE 1 END, s.id
          LIMIT 1
        ) AS relativePath
      FROM tracks t
      WHERE t.collection_id = ?
        AND t.id > ?
      ORDER BY t.id
      LIMIT ?
    `).all(collectionId, afterId, safeLimit) as unknown as CatalogTrackRow[];
  }

  hasRoot(rootId: string): boolean {
    return Boolean(
      this.database.prepare('SELECT 1 AS present FROM roots WHERE id = ? LIMIT 1').get(rootId),
    );
  }

  resolveRootIdByToken(rootPathToken: string): string | null {
    const row = this.database.prepare(`
      SELECT id
      FROM roots
      WHERE root_path_ref = ?
      ORDER BY updated_at DESC, id
      LIMIT 1
    `).get(`rootPathToken:${rootPathToken}`) as { id?: string } | undefined;
    return typeof row?.id === 'string' && row.id ? row.id : null;
  }

  getRootCounts(rootId: string): Pick<CatalogCounts, 'collections' | 'tracks' | 'mediaSources' | 'subtitles' | 'artwork' | 'folderNodes'> {
    const count = (table: string): number => {
      const row = this.database.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE root_id = ?`).get(rootId)
        as { count?: number | bigint } | undefined;
      return Number(row?.count ?? 0);
    };

    const relatedCount = (sql: string): number => {
      const row = this.database.prepare(sql).get(rootId)
        as { count?: number | bigint } | undefined;
      return Number(row?.count ?? 0);
    };

    return {
      collections: count('collections'),
      tracks: count('tracks'),
      mediaSources: count('media_sources'),
      subtitles: relatedCount(`
        SELECT COUNT(*) AS count
        FROM subtitles s
        JOIN tracks t ON t.id = s.track_id
        WHERE t.root_id = ?
      `),
      artwork: relatedCount(`
        SELECT COUNT(*) AS count
        FROM artwork a
        JOIN collections c ON c.id = a.collection_id
        WHERE c.root_id = ?
      `),
      folderNodes: count('folder_nodes'),
    };
  }

  getSchemaVersion(): number {
    return KURA_CATALOG_SCHEMA_VERSION;
  }
}
