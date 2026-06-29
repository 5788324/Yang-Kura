import sqlite3

import pytest

from core.db.schema import EXPECTED_INDEXES, EXPECTED_TABLES
from core.db.vault import YangKuraVault


def test_init_db_is_idempotent(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        vault.init_db()
        assert vault.integrity_check() == "ok"
    finally:
        vault.close()


def test_expected_tables_exist(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        rows = vault.execute_read(
            """
            SELECT name FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
            """
        )
        assert EXPECTED_TABLES.issubset({row["name"] for row in rows})
    finally:
        vault.close()


def test_expected_indexes_exist(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        rows = vault.execute_read(
            """
            SELECT name FROM sqlite_master
            WHERE type = 'index' AND name NOT LIKE 'sqlite_%';
            """
        )
        assert EXPECTED_INDEXES.issubset({row["name"] for row in rows})
    finally:
        vault.close()


def test_works_has_hardened_fields(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        rows = vault.execute_read("PRAGMA table_info('works');")
        columns = {row["name"] for row in rows}
        assert "work_code_raw" in columns
        assert "work_code_norm" in columns
        assert "work_type" in columns
        assert "work_number" in columns
        assert "folder_status" in columns
    finally:
        vault.close()


def test_works_folder_status_default(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        vault.execute_write(
            "INSERT INTO works (work_code, folder_path, created_at, updated_at) VALUES (?, ?, ?, ?);",
            ("RJ123456", "/test/rj123456", "2026-06-29T00:00:00Z", "2026-06-29T00:00:00Z"),
        )
        rows = vault.execute_read("SELECT folder_status FROM works WHERE work_code = 'RJ123456';")
        assert rows[0]["folder_status"] == "recognized"
    finally:
        vault.close()


def test_media_files_unique_constraint(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        vault.execute_write(
            "INSERT INTO works (work_code, folder_path, created_at, updated_at) VALUES (?, ?, ?, ?);",
            ("RJ123456", "/test/rj123456", "2026-06-29T00:00:00Z", "2026-06-29T00:00:00Z"),
        )
        work_id = vault.execute_read(
            "SELECT id FROM works WHERE work_code = 'RJ123456';"
        )[0]["id"]

        vault.execute_write(
            "INSERT INTO media_files (work_id, folder_path, relative_path, file_name, file_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);",
            (work_id, "/test", "track01.mp3", "track01.mp3", "audio", "2026-06-29T00:00:00Z", "2026-06-29T00:00:00Z"),
        )

        with pytest.raises(sqlite3.IntegrityError):
            vault.execute_write(
                "INSERT INTO media_files (work_id, folder_path, relative_path, file_name, file_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);",
                (work_id, "/test", "track01.mp3", "track01_alt.mp3", "audio", "2026-06-29T00:00:00Z", "2026-06-29T00:00:00Z"),
            )
    finally:
        vault.close()


def test_unknown_folders_has_stat_fields(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        rows = vault.execute_read("PRAGMA table_info('unknown_folders');")
        columns = {row["name"] for row in rows}
        assert "video_count" in columns
        assert "archive_count" in columns
        assert "other_count" in columns
        assert "total_files" in columns
    finally:
        vault.close()


def test_non_unique_media_file_path_index_is_replaced(tmp_path):
    db_path = tmp_path / "test.db"
    connection = sqlite3.connect(db_path)
    try:
        connection.execute(
            """
            CREATE TABLE media_files (
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
                updated_at TEXT NOT NULL
            );
            """
        )
        connection.execute(
            "CREATE INDEX idx_media_files_unique_path ON media_files(folder_path, relative_path);"
        )
        connection.commit()
    finally:
        connection.close()

    vault = YangKuraVault(db_path)
    try:
        vault.init_db()
        rows = vault.execute_read("PRAGMA index_list('media_files');")
        target = [row for row in rows if row["name"] == "idx_media_files_unique_path"]
        assert target
        assert target[0]["unique"] == 1
    finally:
        vault.close()
