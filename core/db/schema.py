SCHEMA_STATEMENTS = [
    """
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
    """,
    """
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
    """,
    """
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
    """,
    """
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
    """,
    """
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT NOT NULL
    );
    """,
]

INDEX_STATEMENTS = [
    "CREATE INDEX IF NOT EXISTS idx_works_work_code ON works(work_code);",
    "CREATE INDEX IF NOT EXISTS idx_works_folder_path ON works(folder_path);",
    "CREATE INDEX IF NOT EXISTS idx_media_files_work_id ON media_files(work_id);",
    "CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_media_files_unique_path ON media_files(folder_path, relative_path);",
    "CREATE INDEX IF NOT EXISTS idx_unknown_folders_folder_path ON unknown_folders(folder_path);",
]

EXPECTED_TABLES = {
    "works",
    "media_files",
    "unknown_folders",
    "scan_runs",
    "settings",
}

EXPECTED_INDEXES = {
    "idx_works_work_code",
    "idx_works_folder_path",
    "idx_media_files_work_id",
    "idx_media_files_file_type",
    "idx_media_files_unique_path",
    "idx_unknown_folders_folder_path",
}
