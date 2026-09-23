import type { DatabaseSync } from 'node:sqlite';

export const KURA_CATALOG_SCHEMA_VERSION = 1;

const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS catalog_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS roots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  library_type TEXT NOT NULL,
  scan_profile TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  root_path_ref TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  collection_type TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_title TEXT,
  code_raw TEXT,
  code_norm TEXT,
  artist TEXT,
  circle TEXT,
  album TEXT,
  folder_path TEXT,
  status TEXT NOT NULL,
  total_duration_seconds REAL,
  added_at TEXT,
  updated_at TEXT
) STRICT;

CREATE INDEX IF NOT EXISTS collections_root_type
  ON collections(root_id, collection_type, id);
CREATE INDEX IF NOT EXISTS collections_code_norm
  ON collections(code_norm) WHERE code_norm IS NOT NULL;
CREATE INDEX IF NOT EXISTS collections_circle
  ON collections(circle) WHERE circle IS NOT NULL;

CREATE TABLE IF NOT EXISTS collection_cvs (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY(collection_id, position)
) STRICT;

CREATE INDEX IF NOT EXISTS collection_cvs_value
  ON collection_cvs(value, collection_id);

CREATE TABLE IF NOT EXISTS collection_tags (
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  PRIMARY KEY(collection_id, value)
) STRICT;

CREATE INDEX IF NOT EXISTS collection_tags_value
  ON collection_tags(value, collection_id);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  display_artist TEXT,
  display_album TEXT,
  rj_id TEXT,
  track_no INTEGER,
  disc_no INTEGER,
  duration_seconds REAL,
  added_at TEXT
) STRICT;

CREATE INDEX IF NOT EXISTS tracks_collection
  ON tracks(collection_id, track_no, id);
CREATE INDEX IF NOT EXISTS tracks_root_kind
  ON tracks(root_id, kind, id);
CREATE INDEX IF NOT EXISTS tracks_rj
  ON tracks(rj_id) WHERE rj_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS track_tags (
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  PRIMARY KEY(track_id, value)
) STRICT;

CREATE INDEX IF NOT EXISTS track_tags_value
  ON track_tags(value, track_id);

CREATE TABLE IF NOT EXISTS media_sources (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  source_kind TEXT NOT NULL,
  relative_path TEXT,
  extension TEXT,
  size_bytes INTEGER,
  mtime_ms REAL,
  availability TEXT NOT NULL DEFAULT 'available',
  fingerprint TEXT
) STRICT;

CREATE INDEX IF NOT EXISTS media_sources_track
  ON media_sources(track_id, id);
CREATE INDEX IF NOT EXISTS media_sources_root_path
  ON media_sources(root_id, relative_path) WHERE relative_path IS NOT NULL;

CREATE TABLE IF NOT EXISTS subtitles (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  source_kind TEXT NOT NULL,
  language TEXT,
  format TEXT,
  relative_path TEXT,
  line_count INTEGER
) STRICT;

CREATE INDEX IF NOT EXISTS subtitles_track
  ON subtitles(track_id, id);
CREATE INDEX IF NOT EXISTS subtitles_path
  ON subtitles(relative_path) WHERE relative_path IS NOT NULL;

CREATE TABLE IF NOT EXISTS artwork (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  track_id TEXT REFERENCES tracks(id) ON DELETE CASCADE,
  source_kind TEXT NOT NULL,
  relative_path TEXT,
  url TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0, 1))
) STRICT;

CREATE INDEX IF NOT EXISTS artwork_collection
  ON artwork(collection_id, is_primary DESC, id);

CREATE TABLE IF NOT EXISTS folder_nodes (
  id TEXT PRIMARY KEY,
  root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES folder_nodes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  depth INTEGER NOT NULL,
  UNIQUE(root_id, relative_path)
) STRICT;

CREATE INDEX IF NOT EXISTS folder_nodes_parent
  ON folder_nodes(root_id, parent_id, id);
CREATE INDEX IF NOT EXISTS folder_nodes_collection
  ON folder_nodes(collection_id, depth, id) WHERE collection_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  root_id TEXT NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  folder_node_id TEXT REFERENCES folder_nodes(id) ON DELETE SET NULL,
  attachment_kind TEXT NOT NULL,
  title TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  relative_path TEXT,
  extension TEXT,
  size_bytes INTEGER,
  mtime_ms REAL
) STRICT;

CREATE INDEX IF NOT EXISTS attachments_collection
  ON attachments(collection_id, attachment_kind, id);

CREATE TABLE IF NOT EXISTS scan_runs (
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

CREATE TABLE IF NOT EXISTS scan_entries (
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

CREATE INDEX IF NOT EXISTS scan_entries_state
  ON scan_entries(root_id, state, relative_path);

CREATE VIRTUAL TABLE IF NOT EXISTS collections_fts USING fts5(
  collection_id UNINDEXED,
  title,
  sort_title,
  code,
  artist,
  circle,
  cvs,
  tags,
  folder_path,
  tokenize='unicode61'
);

CREATE VIRTUAL TABLE IF NOT EXISTS tracks_fts USING fts5(
  track_id UNINDEXED,
  title,
  artist,
  album,
  rj_id,
  relative_path,
  tags,
  tokenize='unicode61'
);
`;

function readUserVersion(database: DatabaseSync): number {
  const row = database.prepare('PRAGMA user_version').get() as { user_version?: number } | undefined;
  return Number(row?.user_version ?? 0);
}

export function initializeCatalogSchema(database: DatabaseSync): number {
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA synchronous = NORMAL;');

  const version = readUserVersion(database);
  if (version > KURA_CATALOG_SCHEMA_VERSION) {
    throw new Error(`Catalog schema ${version} is newer than supported ${KURA_CATALOG_SCHEMA_VERSION}.`);
  }

  if (version === 0) {
    database.exec('BEGIN IMMEDIATE;');
    try {
      database.exec(SCHEMA_V1);
      database.exec(`PRAGMA user_version = ${KURA_CATALOG_SCHEMA_VERSION};`);
      database.exec('COMMIT;');
    } catch (error) {
      database.exec('ROLLBACK;');
      throw error;
    }
  }

  return readUserVersion(database);
}
