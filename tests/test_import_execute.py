from pathlib import Path

from core.db import YangKuraVault
from core.library import build_import_plan, execute_import_plan
from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"


def _execute_full(vault):
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    return execute_import_plan(vault, plan), plan


def test_fixture_import_writes_to_test_db(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        result, plan = _execute_full(vault)

        assert result.works_upserted > 0
        assert result.media_files_upserted > 0
        assert result.unknown_folders_upserted > 0
        assert result.scan_run_inserted is True
        assert len(result.errors) == 0

        works = vault.execute_read("SELECT id FROM works;")
        assert len(works) == len(plan.works_to_upsert)

        media_files = vault.execute_read("SELECT id FROM media_files;")
        assert len(media_files) == len(plan.media_files_to_upsert)

        unknown = vault.execute_read("SELECT id FROM unknown_folders;")
        assert len(unknown) == len(plan.unknown_folders_to_upsert)

        scan_runs = vault.execute_read("SELECT id FROM scan_runs;")
        assert len(scan_runs) == 1

        integrity = vault.integrity_check()
        assert integrity == "ok"
    finally:
        vault.close()


def test_works_warning_flags_preserved(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        _execute_full(vault)

        dup_rows = vault.execute_read(
            "SELECT folder_status, warning_flags FROM works WHERE folder_status = 'duplicate';"
        )
        assert len(dup_rows) > 0
        for row in dup_rows:
            assert row["warning_flags"] == "duplicate_rj"

        mixed_rows = vault.execute_read(
            "SELECT folder_status, warning_flags FROM works WHERE folder_status = 'mixed';"
        )
        assert len(mixed_rows) > 0
        for row in mixed_rows:
            assert row["warning_flags"] == "mixed_folder"
    finally:
        vault.close()


def test_media_files_have_work_id(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        _execute_full(vault)

        total = vault.execute_read("SELECT COUNT(*) AS cnt FROM media_files;")[0][
            "cnt"
        ]
        with_work = vault.execute_read(
            "SELECT COUNT(*) AS cnt FROM media_files WHERE work_id IS NOT NULL;"
        )[0]["cnt"]
        assert total > 0
        assert with_work == total

        null_work = vault.execute_read(
            "SELECT id FROM media_files WHERE work_id IS NULL;"
        )
        assert len(null_work) == 0
    finally:
        vault.close()


def test_scan_run_inserted(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        _execute_full(vault)

        runs = vault.execute_read("SELECT * FROM scan_runs;")
        assert len(runs) == 1
        run = runs[0]
        assert run["root_path"] == str(LIBRARY_SAMPLE.resolve())
        assert run["status"] == "executed"
        assert run["started_at"] is not None
        assert run["finished_at"] is not None
    finally:
        vault.close()


def test_double_execute_is_idempotent(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()

        _execute_full(vault)
        works1 = len(vault.execute_read("SELECT id FROM works;"))
        media1 = len(vault.execute_read("SELECT id FROM media_files;"))
        unknown1 = len(vault.execute_read("SELECT id FROM unknown_folders;"))
        runs1 = len(vault.execute_read("SELECT id FROM scan_runs;"))

        _execute_full(vault)
        works2 = len(vault.execute_read("SELECT id FROM works;"))
        media2 = len(vault.execute_read("SELECT id FROM media_files;"))
        unknown2 = len(vault.execute_read("SELECT id FROM unknown_folders;"))
        runs2 = len(vault.execute_read("SELECT id FROM scan_runs;"))

        assert works2 == works1
        assert media2 == media1
        assert unknown2 == unknown1
        assert runs2 == runs1 + 1
    finally:
        vault.close()


def test_execute_does_not_create_real_db(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        scan_result = scan_library_root(LIBRARY_SAMPLE)
        plan = build_import_plan(scan_result)
        execute_import_plan(vault, plan)

        db_path = tmp_path / "test.db"
        assert db_path.exists()

        other_db = tmp_path / "other.db"
        assert not other_db.exists()
    finally:
        vault.close()


def test_works_fields_populated(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        _execute_full(vault)

        works = vault.execute_read("SELECT * FROM works;")
        for w in works:
            assert w["work_code_raw"]
            assert w["work_code_norm"]
            assert w["work_type"]
            assert w["folder_path"]
            assert w["folder_name"]
            assert w["folder_status"]
            assert w["metadata_status"] == "none"
            assert w["created_at"]
            assert w["updated_at"]
    finally:
        vault.close()


def test_unknown_folders_fields_populated(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        _execute_full(vault)

        unknown = vault.execute_read("SELECT * FROM unknown_folders;")
        assert len(unknown) > 0
        for u in unknown:
            assert u["folder_path"]
            assert u["folder_name"]
            assert u["reason"]
            assert u["total_files"] > 0
            assert u["created_at"]
            assert u["updated_at"]
    finally:
        vault.close()


def test_external_url_is_none(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        _execute_full(vault)

        works = vault.execute_read(
            "SELECT id FROM works WHERE external_url IS NOT NULL;"
        )
        assert len(works) == 0
    finally:
        vault.close()
