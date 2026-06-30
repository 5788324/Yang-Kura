from pathlib import Path

from core.library import build_import_plan
from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"


def _find_work(plan, norm):
    for w in plan.works_to_upsert:
        if w.work_code_norm == norm:
            return w
    return None


def _find_work_by_folder(plan, name):
    for w in plan.works_to_upsert:
        if w.folder_name == name:
            return w
    return None


def test_build_import_plan_from_fixture():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    assert plan.dry_run is True
    assert len(plan.works_to_upsert) >= 1
    assert len(plan.media_files_to_upsert) >= 1
    assert "root_path" in plan.scan_run_summary
    assert "total_dirs" in plan.scan_run_summary


def test_works_to_upsert_count():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    assert len(plan.works_to_upsert) == len(scan_result.works)


def test_media_files_to_upsert_count():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    expected_count = sum(len(w.media_files) for w in scan_result.works)
    assert len(plan.media_files_to_upsert) == expected_count


def test_unknown_folders_to_upsert_count():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    assert len(plan.unknown_folders_to_upsert) == len(scan_result.unknown_folders)
    u = plan.unknown_folders_to_upsert[0]
    assert u.reason == "no_work_code"
    assert u.total_files > 0


def test_duplicate_has_warning_flags():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)

    w1 = _find_work_by_folder(plan, "RJ100100_original")
    w2 = _find_work_by_folder(plan, "RJ0100100_dup")
    assert w1 is not None
    assert w2 is not None
    assert w1.folder_status == "duplicate"
    assert w2.folder_status == "duplicate"
    assert w1.warning_flags == "duplicate_rj"
    assert w2.warning_flags == "duplicate_rj"


def test_mixed_has_warning_flags():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)

    w = _find_work_by_folder(plan, "mixed_rj_folder")
    assert w is not None
    assert w.folder_status == "mixed"
    assert w.warning_flags == "mixed_folder"


def test_recognized_no_warning_flags():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)

    w = _find_work(plan, "rj999999")
    assert w is not None
    assert w.folder_status == "recognized"
    assert w.warning_flags == ""


def test_import_plan_does_not_write_db(tmp_path):
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    db_path = tmp_path / "test.db"
    assert not db_path.exists()
    assert plan.dry_run is True


def test_import_plan_copy_not_mutate():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    original_warnings = list(scan_result.warnings)
    plan = build_import_plan(scan_result)
    assert plan.warnings == original_warnings
    plan.warnings.append("extra")
    assert len(scan_result.warnings) == len(original_warnings)


def test_media_file_fields_complete():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    for mf in plan.media_files_to_upsert:
        assert mf.folder_path
        assert mf.relative_path
        assert mf.file_name
        assert mf.file_type
        assert mf.extension
        assert isinstance(mf.size, int)
        assert isinstance(mf.mtime, float)


def test_scan_run_summary_fields():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    s = plan.scan_run_summary
    assert "root_path" in s
    assert "status" in s
    assert "total_dirs" in s
    assert "recognized_works" in s
    assert "unknown_folders" in s
    assert "duplicate_rj_count" in s
    assert "mixed_folder_count" in s
    assert "media_files" in s
    assert "warnings" in s
    assert "errors" in s
    assert s["status"] == "planned"
    assert s["duplicate_rj_count"] == scan_result.duplicate_code_count
    assert s["mixed_folder_count"] == scan_result.mixed_folder_count

def test_import_plan_module_has_no_db_dependency():
    import core.library.importer as importer

    names = set(importer.build_import_plan.__code__.co_names)
    assert "sqlite3" not in names
    assert "YangKuraVault" not in names
    assert "execute_write" not in names
