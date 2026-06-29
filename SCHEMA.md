# SCHEMA.md

## 0. 原则

SQLite 是 `Yang Kura` 的本地真源。  
所有数据库访问必须通过：

```text
core/db/vault.py
```

UI 不允许直接 `sqlite3.connect`。

M1 只实现基础 schema。  
M6 以后再增加元数据和 reconcile 相关表。

## 1. M1 初始表

```text
works
media_files
unknown_folders
scan_runs
settings
```

## 2. works

用途：记录已识别的作品目录。

```sql
CREATE TABLE IF NOT EXISTS works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_code TEXT,
    work_code_raw TEXT,
    work_code_norm TEXT,
    work_type TEXT,
    work_number INTEGER,
    title TEXT,
    folder_path TEXT UNIQUE,
    folder_name TEXT,
    folder_status TEXT DEFAULT 'recognized',
    source_profile TEXT DEFAULT 'local_scan',
    detected_by TEXT,
    confidence REAL DEFAULT 0,
    metadata_status TEXT DEFAULT 'none',
    external_url TEXT,
    warning_flags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

说明：

```text
work_code：RJ/BJ/VJ，可为空
work_code_raw：原始作品号字符串（如 RJ1003555）
work_code_norm：规范化作品号（如 rj1003555）
work_type：作品类型 rj / bj / vj
work_number：作品编号（如 1003555）
folder_path：唯一，一作一目录的主约束
folder_status：recognized / duplicate / mixed，默认 recognized
warning_flags：duplicate_rj / mixed / metadata_missing 等
external_url：M6 预留
```

## 3. media_files

用途：记录作品目录内的媒体文件索引。

```sql
CREATE TABLE IF NOT EXISTS media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER,
    folder_path TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    extension TEXT,
    size INTEGER DEFAULT 0,
    mtime REAL,
    track_index INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(work_id) REFERENCES works(id)
);
```

唯一约束：

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_files_unique_path
ON media_files(folder_path, relative_path);
```

file_type 枚举：

```text
audio
video
image
subtitle
text
archive
other
```

## 4. unknown_folders

用途：记录无法明确识别作品号的目录。

```sql
CREATE TABLE IF NOT EXISTS unknown_folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_path TEXT UNIQUE NOT NULL,
    folder_name TEXT NOT NULL,
    reason TEXT,
    audio_count INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0,
    subtitle_count INTEGER DEFAULT 0,
    text_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    archive_count INTEGER DEFAULT 0,
    other_count INTEGER DEFAULT 0,
    total_files INTEGER DEFAULT 0,
    total_size INTEGER DEFAULT 0,
    candidate_codes TEXT,
    warning_flags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

注意：

```text
duplicate_rj 不应该混入普通 unknown_folders。
duplicate_rj 可暂时通过 works.warning_flags 或后续专表记录。
```

## 5. scan_runs

用途：记录每次扫描运行摘要。

```sql
CREATE TABLE IF NOT EXISTS scan_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    root_path TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    total_dirs INTEGER DEFAULT 0,
    recognized_works INTEGER DEFAULT 0,
    unknown_folders INTEGER DEFAULT 0,
    duplicate_rj_count INTEGER DEFAULT 0,
    mixed_folder_count INTEGER DEFAULT 0,
    media_files INTEGER DEFAULT 0,
    warnings TEXT,
    errors TEXT
);
```

## 6. settings

用途：记录应用设置。

```sql
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL
);
```

建议初始 settings：

```text
library_root = E:\arsm
theme = system / light / dark
external_player_path = nullable
```

M1 不强制写入这些值，但可支持 set/get。

## 7. indexes

```sql
CREATE INDEX IF NOT EXISTS idx_works_work_code ON works(work_code);
CREATE INDEX IF NOT EXISTS idx_works_folder_path ON works(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_files_work_id ON media_files(work_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_files_unique_path ON media_files(folder_path, relative_path);
CREATE INDEX IF NOT EXISTS idx_unknown_folders_folder_path ON unknown_folders(folder_path);
```

## 8. M1.1 schema hardening (2026-06-29)

本轮新增字段和约束：

```text
works:
  + work_code_raw TEXT
  + work_code_norm TEXT
  + work_type TEXT
  + work_number INTEGER
  + folder_status TEXT DEFAULT 'recognized'

media_files:
  + UNIQUE(folder_path, relative_path) via idx_media_files_unique_path

unknown_folders:
  + video_count INTEGER DEFAULT 0
  + archive_count INTEGER DEFAULT 0
  + other_count INTEGER DEFAULT 0
  + total_files INTEGER DEFAULT 0
```

迁移方式：`migrations.py` 通过 `PRAGMA table_info` 检测列是否存在，按需执行 `ALTER TABLE ADD COLUMN`。索引通过 `CREATE ... IF NOT EXISTS` 幂等建。

## 9. M6 后续表预留

M6 元数据增强阶段再增加：

```text
metadata_sources
expected_files
reconcile_runs
```

### metadata_sources

候选字段：

```text
id
work_id
provider
source_url
fetched_at
status
raw_json_path nullable
title
circle
cover_url
description
error
```

### expected_files

候选字段：

```text
id
work_id
source_id
remote_path
file_name
expected_size nullable
file_type
matched_local_file_id nullable
match_status
```

### reconcile_runs

候选字段：

```text
id
work_id
source_id
started_at
finished_at
status
missing_count
update_candidate_count
matched_count
report_path
errors
```

## 10. 写入安全

所有写入必须：

```text
通过 Vault
明确 commit / rollback
必要时备份
记录 WORKLOG
测试 integrity_check
```

M3 以后涉及真实索引写入时必须默认 dry-run。
