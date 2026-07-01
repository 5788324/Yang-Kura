from core.db import YangKuraVault
from core.library import (
    get_library_summary,
    get_work_detail,
    list_media_files,
    list_works,
)


def _populate(vault):
    vault.init_db()
    vault.execute_write(
        "INSERT INTO works (id, work_code_raw, work_code_norm, work_type, "
        "work_number, folder_path, folder_name, folder_status, "
        "created_at, updated_at) VALUES (1, 'RJ000001', 'rj1', 'rj', 1, "
        "'/test/rj1', 'RJ000001_test', 'recognized', 'now', 'now');"
    )
    vault.execute_write(
        "INSERT INTO works (id, work_code_raw, work_code_norm, work_type, "
        "work_number, folder_path, folder_name, folder_status, "
        "created_at, updated_at) VALUES (2, 'BJ000002', 'bj2', 'bj', 2, "
        "'/test/bj2', 'BJ000002_test', 'duplicate', 'now', 'now');"
    )
    vault.execute_write(
        "INSERT INTO media_files (work_id, folder_path, relative_path, "
        "file_name, file_type, extension, size, mtime, created_at, updated_at) "
        "VALUES (1, '/test/rj1', 'track.mp3', 'track.mp3', 'audio', '.mp3', "
        "100, 0, 'now', 'now');"
    )
    vault.execute_write(
        "INSERT INTO media_files (work_id, folder_path, relative_path, "
        "file_name, file_type, extension, size, mtime, created_at, updated_at) "
        "VALUES (1, '/test/rj1', 'cover.jpg', 'cover.jpg', 'image', '.jpg', "
        "200, 0, 'now', 'now');"
    )
    vault.execute_write(
        "INSERT INTO media_files (work_id, folder_path, relative_path, "
        "file_name, file_type, extension, size, mtime, created_at, updated_at) "
        "VALUES (2, '/test/bj2', 'voice.flac', 'voice.flac', 'audio', '.flac', "
        "300, 0, 'now', 'now');"
    )


def test_summary_counts(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        s = get_library_summary(vault)
        assert s["works_count"] == 2
        assert s["audio_count"] == 2
        assert s["image_count"] == 1
        assert s["duplicate_count"] == 1
    finally:
        vault.close()


def test_list_works_aggregated(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        works = list_works(vault)
        assert len(works) >= 1
        rj1 = [w for w in works if w["work_code_norm"] == "rj1"][0]
        assert rj1["media_count"] == 2
        assert rj1["audio_count"] == 1
        assert rj1["image_count"] == 1
    finally:
        vault.close()


def test_list_works_cover_path(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        works = list_works(vault)
        rj1 = [w for w in works if w["work_code_norm"] == "rj1"][0]
        assert "cover_relative_path" in rj1
        assert "cover_path" in rj1
        assert rj1["cover_path"] is not None
    finally:
        vault.close()


def test_list_media_files_valid_work(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        files = list_media_files(vault, 1)
        assert len(files) == 2
        types = {f["file_type"] for f in files}
        assert "audio" in types
        assert "image" in types
    finally:
        vault.close()


def test_list_media_files_nonexistent_work(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        files = list_media_files(vault, 999)
        assert len(files) == 0
    finally:
        vault.close()


def test_get_work_detail_valid(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        w = get_work_detail(vault, 1)
        assert w is not None
        assert w["work_code_norm"] == "rj1"
    finally:
        vault.close()


def test_get_work_detail_nonexistent(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        _populate(vault)
        w = get_work_detail(vault, 999)
        assert w is None
    finally:
        vault.close()
