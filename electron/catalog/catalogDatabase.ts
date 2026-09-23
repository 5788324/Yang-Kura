import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { initializeCatalogSchema, KURA_CATALOG_SCHEMA_VERSION } from './catalogSchema.js';
import type {
  CatalogCollectionQuery,
  CatalogCollectionRow,
  CatalogCounts,
  CatalogFacetKind,
  CatalogFacetRow,
  CatalogFolderNodeRow,
  CatalogImportSummary,
  CatalogTrackQuery,
  CatalogTrackRow,
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
        const deleteRoot = database.prepare('DELETE FROM roots WHERE id = ?');
        const deleteRootMeta = database.prepare('DELETE FROM catalog_meta WHERE key LIKE ?');

        for (const root of index.roots) {
          deleteTrackFts.run(root.id);
          deleteCollectionFts.run(root.id);
          deleteRoot.run(root.id);
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

  queryCollections(options: CatalogCollectionQuery = {}): CatalogCollectionRow[] {
    const clauses = ['c.id > ?'];
    const params: Array<string | number> = [options.afterId ?? ''];
    const joins: string[] = [];
    const match = options.search ? toFtsQuery(options.search) : null;

    if (match) {
      joins.push('JOIN collections_fts ON collections_fts.collection_id = c.id');
      clauses.push('collections_fts MATCH ?');
      params.push(match);
    }
    if (options.rootId) {
      clauses.push('c.root_id = ?');
      params.push(options.rootId);
    }
    if (options.collectionType) {
      clauses.push('c.collection_type = ?');
      params.push(options.collectionType);
    }
    if (options.circle) {
      clauses.push('c.circle = ?');
      params.push(options.circle);
    }
    if (options.artist) {
      clauses.push('c.artist = ?');
      params.push(options.artist);
    }
    if (options.cv) {
      clauses.push('EXISTS (SELECT 1 FROM collection_cvs cv WHERE cv.collection_id = c.id AND cv.value = ?)');
      params.push(options.cv);
    }
    if (options.tag) {
      clauses.push('EXISTS (SELECT 1 FROM collection_tags tag WHERE tag.collection_id = c.id AND tag.value = ?)');
      params.push(options.tag);
    }

    const safeLimit = Math.max(1, Math.min(Math.floor(options.limit ?? 100), 500));
    params.push(safeLimit);

    return this.database.prepare(`
      SELECT
        c.id,
        c.root_id AS rootId,
        c.collection_type AS collectionType,
        c.title,
        c.code_norm AS codeNorm,
        c.artist,
        c.circle,
        c.folder_path AS folderPath
      FROM collections c
      ${joins.join('\n')}
      WHERE ${clauses.join(' AND ')}
      ORDER BY c.id
      LIMIT ?
    `).all(...params) as unknown as CatalogCollectionRow[];
  }

  queryTracks(options: CatalogTrackQuery = {}): CatalogTrackRow[] {
    const clauses = ['t.id > ?'];
    const params: Array<string | number> = [options.afterId ?? ''];
    const joins: string[] = ['LEFT JOIN media_sources s ON s.track_id = t.id'];
    const match = options.search ? toFtsQuery(options.search) : null;

    if (match) {
      joins.push('JOIN tracks_fts ON tracks_fts.track_id = t.id');
      clauses.push('tracks_fts MATCH ?');
      params.push(match);
    }
    if (options.rootId) {
      clauses.push('t.root_id = ?');
      params.push(options.rootId);
    }
    if (options.collectionId) {
      clauses.push('t.collection_id = ?');
      params.push(options.collectionId);
    }
    if (options.kind) {
      clauses.push('t.kind = ?');
      params.push(options.kind);
    }
    if (options.artist) {
      clauses.push('t.display_artist = ?');
      params.push(options.artist);
    }
    if (options.tag) {
      clauses.push('EXISTS (SELECT 1 FROM track_tags tag WHERE tag.track_id = t.id AND tag.value = ?)');
      params.push(options.tag);
    }

    const safeLimit = Math.max(1, Math.min(Math.floor(options.limit ?? 200), 500));
    params.push(safeLimit);

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
        s.relative_path AS relativePath
      FROM tracks t
      ${joins.join('\n')}
      WHERE ${clauses.join(' AND ')}
      ORDER BY t.id
      LIMIT ?
    `).all(...params) as unknown as CatalogTrackRow[];
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
    const match = toFtsQuery(query);
    if (!match) return [];
    const safeLimit = Math.max(1, Math.min(Math.floor(limit), 200));
    return this.database.prepare(`
      SELECT
        c.id,
        c.root_id AS rootId,
        c.collection_type AS collectionType,
        c.title,
        c.code_norm AS codeNorm,
        c.artist,
        c.circle,
        c.folder_path AS folderPath
      FROM collections_fts f
      JOIN collections c ON c.id = f.collection_id
      WHERE collections_fts MATCH ?
      ORDER BY bm25(collections_fts), c.id
      LIMIT ?
    `).all(match, safeLimit) as unknown as CatalogCollectionRow[];
  }

  searchTracks(query: string, limit = 50): CatalogTrackRow[] {
    const match = toFtsQuery(query);
    if (!match) return [];
    const safeLimit = Math.max(1, Math.min(Math.floor(limit), 200));
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
        s.relative_path AS relativePath
      FROM tracks_fts f
      JOIN tracks t ON t.id = f.track_id
      LEFT JOIN media_sources s ON s.track_id = t.id
      WHERE tracks_fts MATCH ?
      ORDER BY bm25(tracks_fts), t.id
      LIMIT ?
    `).all(match, safeLimit) as unknown as CatalogTrackRow[];
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
        s.relative_path AS relativePath
      FROM tracks t
      LEFT JOIN media_sources s ON s.track_id = t.id
      WHERE t.collection_id = ?
        AND t.id > ?
      ORDER BY t.id
      LIMIT ?
    `).all(collectionId, afterId, safeLimit) as unknown as CatalogTrackRow[];
  }

  getSchemaVersion(): number {
    return KURA_CATALOG_SCHEMA_VERSION;
  }
}
