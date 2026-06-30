import json
import subprocess
import sys
from pathlib import Path

from core.library import (
    backup_db_file,
    build_import_plan,
    build_import_preview,
    make_backup_path,
)
from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"
PREVIEW_TOOL = (
    Path(__file__).resolve().parents[1] / "tools" / "preview_real_import.py"
)


def _build_fixture_preview():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    return build_import_preview(plan), plan


def test_fixture_generates_preview():
    preview, plan = _build_fixture_preview()
    assert preview.dry_run is True
    assert preview.db_write is False
    assert preview.works_to_upsert_count == len(plan.works_to_upsert)
    assert preview.media_files_to_upsert_count == len(plan.media_files_to_upsert)


def test_preview_dry_run_true():
    preview, _ = _build_fixture_preview()
    assert preview.dry_run is True


def test_preview_db_write_false():
    preview, _ = _build_fixture_preview()
    assert preview.db_write is False


def test_fixture_with_dup_mixed_unknown_risk_medium():
    preview, _ = _build_fixture_preview()
    assert preview.risk_level == "medium"


def test_preview_detects_high_risk_on_errors():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    plan.errors.append("test forced error")
    preview = build_import_preview(plan)
    assert preview.risk_level == "high"
    assert any("errors" in b for b in preview.blockers)


def test_preview_estimated_tables():
    preview, _ = _build_fixture_preview()
    assert "works" in preview.estimated_tables_affected
    assert "media_files" in preview.estimated_tables_affected
    assert "unknown_folders" in preview.estimated_tables_affected
    assert "scan_runs" in preview.estimated_tables_affected


def test_preview_requires_backup_and_confirmation():
    preview, _ = _build_fixture_preview()
    assert preview.requires_backup is True
    assert preview.requires_confirmation is True


def test_backup_confirm_false_does_not_copy(tmp_path):
    db = tmp_path / "test.db"
    db.write_text("data")
    result = backup_db_file(db, tmp_path / "backups", confirm=False)
    assert result["ok"] is False
    assert result.get("preview") is True
    backups = list(Path(tmp_path / "backups").glob("*")) if (tmp_path / "backups").exists() else []
    assert len(backups) == 0


def test_backup_confirm_true_copies(tmp_path):
    db = tmp_path / "test.db"
    db.write_text("some data")
    result = backup_db_file(db, tmp_path / "backups", confirm=True)
    assert result["ok"] is True
    backups = list(Path(tmp_path / "backups").glob("*.db.backup-*"))
    assert len(backups) >= 1
    assert backups[0].stat().st_size == len("some data")


def test_backup_does_not_delete_old(tmp_path):
    db = tmp_path / "test.db"
    db.write_text("v1")
    r1 = backup_db_file(db, tmp_path / "backups", confirm=True)
    db.write_text("v2")
    r2 = backup_db_file(db, tmp_path / "backups", confirm=True)
    backups = sorted(Path(tmp_path / "backups").glob("*.db.backup-*"))
    assert len(backups) >= 2


def test_backup_nonexistent_db(tmp_path):
    result = backup_db_file(tmp_path / "nosuch.db", tmp_path / "backups", confirm=True)
    assert result["ok"] is False
    assert "does not exist" in result["error"]


def test_make_backup_path_has_timestamp():
    p = make_backup_path("/tmp/test.db", "/tmp/backups")
    name = p.name
    assert name.startswith("test.db.backup-")
    assert len(name) > len("test.db.backup-")


def test_preview_tool_no_execute_import_plan():
    source = PREVIEW_TOOL.read_text(encoding="utf-8")
    assert "execute_import_plan" not in source
    assert "YangKuraVault" not in source
    assert "sqlite3.connect" not in source


def test_preview_tool_prints_confirmation():
    result = subprocess.run(
        [sys.executable, "-B", str(PREVIEW_TOOL), "--root", str(LIBRARY_SAMPLE)],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert "This is preview only." in result.stdout
    assert "No database write was performed." in result.stdout


def test_preview_tool_rejects_real_path():
    result = subprocess.run(
        [
            sys.executable,
            "-B",
            str(PREVIEW_TOOL),
            "--root",
            str(Path("E:\\nonexistent_xyz")),
        ],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "requires --allow-real-root" in result.stdout or "requires --allow-real-root" in result.stderr
