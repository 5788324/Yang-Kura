import subprocess
import sys
from pathlib import Path

from core.db import YangKuraVault
from core.library import (
    build_confirmation_phrase,
    build_import_plan,
    build_import_preview,
    can_execute_real_import,
    validate_confirmation,
)
from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"
EXECUTE_TOOL = (
    Path(__file__).resolve().parents[1] / "tools" / "execute_real_import.py"
)


def _make_clean_fixture(tmp_path):
    root = tmp_path / "clean_library"
    root.mkdir()
    for name in ("RJ100001_work_a", "RJ200002_work_b", "VJ300003_work_c"):
        d = root / name
        d.mkdir()
        (d / "track.mp3").write_text("")
    return root


def test_preview_mode_does_not_write_db():
    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(LIBRARY_SAMPLE),
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "This is preview only." in result.stdout
    assert "dry_run" in result.stdout
    assert "Expected confirmation phrase" in result.stdout


def test_rejects_real_root_without_flag():
    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(Path("E:\\nonexistent_xyz")),
        ],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "requires --allow-real-root" in result.stdout or "requires --allow-real-root" in result.stderr


def test_execute_without_db_path_fails():
    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(LIBRARY_SAMPLE),
            "--execute",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "--db-path" in (result.stdout + result.stderr)


def test_execute_without_confirm_backup_fails(tmp_path):
    clean = _make_clean_fixture(tmp_path)
    db = tmp_path / "test.db"
    db.write_text("")
    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(clean),
            "--db-path", str(db),
            "--backup-dir", str(tmp_path / "backups"),
            "--execute",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "--confirm-backup" in (result.stdout + result.stderr)


def test_wrong_confirm_phrase_rejects(tmp_path):
    clean = _make_clean_fixture(tmp_path)
    db = tmp_path / "test.db"
    db.write_text("")
    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(clean),
            "--db-path", str(db),
            "--backup-dir", str(tmp_path / "backups"),
            "--execute",
            "--confirm-backup",
            "--confirm-phrase", "wrong phrase",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "--confirm-phrase does not match" in (result.stdout + result.stderr)


def test_fixture_db_execute_succeeds(tmp_path):
    clean = _make_clean_fixture(tmp_path)
    db = tmp_path / "test.db"
    db.write_text("")
    backup_dir = tmp_path / "backups"
    scan_result = scan_library_root(clean)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    assert preview.risk_level == "low"

    phrase = build_confirmation_phrase(
        str(clean), str(db),
        preview.works_to_upsert_count, preview.media_files_to_upsert_count,
    )

    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(clean),
            "--db-path", str(db),
            "--backup-dir", str(backup_dir),
            "--execute",
            "--confirm-backup",
            "--confirm-phrase", phrase,
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "Current Execute Counts" in result.stdout
    assert "Expected confirmation phrase" in result.stdout
    assert "Execute Summary" in result.stdout


def test_execute_creates_backup(tmp_path):
    clean = _make_clean_fixture(tmp_path)
    db = tmp_path / "test.db"
    db.write_text("")
    backup_dir = tmp_path / "backups"
    scan_result = scan_library_root(clean)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    phrase = build_confirmation_phrase(
        str(clean), str(db),
        preview.works_to_upsert_count, preview.media_files_to_upsert_count,
    )

    subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(clean),
            "--db-path", str(db),
            "--backup-dir", str(backup_dir),
            "--execute",
            "--confirm-backup",
            "--confirm-phrase", phrase,
        ],
        capture_output=True, text=True,
    )
    backups = list(backup_dir.glob("*.db.backup-*"))
    assert len(backups) >= 1


def test_execute_integrity_ok(tmp_path):
    clean = _make_clean_fixture(tmp_path)
    db = tmp_path / "test.db"
    db.write_text("")
    backup_dir = tmp_path / "backups"
    scan_result = scan_library_root(clean)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    phrase = build_confirmation_phrase(
        str(clean), str(db),
        preview.works_to_upsert_count, preview.media_files_to_upsert_count,
    )

    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(clean),
            "--db-path", str(db),
            "--backup-dir", str(backup_dir),
            "--execute",
            "--confirm-backup",
            "--confirm-phrase", phrase,
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "integrity_check:         ok" in result.stdout


def test_execute_counts_correct(tmp_path):
    clean = _make_clean_fixture(tmp_path)
    db = tmp_path / "test.db"
    db.write_text("")
    backup_dir = tmp_path / "backups"
    scan_result = scan_library_root(clean)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    phrase = build_confirmation_phrase(
        str(clean), str(db),
        preview.works_to_upsert_count, preview.media_files_to_upsert_count,
    )

    result = subprocess.run(
        [
            sys.executable, "-B", str(EXECUTE_TOOL),
            "--root", str(clean),
            "--db-path", str(db),
            "--backup-dir", str(backup_dir),
            "--execute",
            "--confirm-backup",
            "--confirm-phrase", phrase,
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 0

    vault = YangKuraVault(db)
    try:
        vault.connect()
        works = len(vault.execute_read("SELECT id FROM works;"))
        media = len(vault.execute_read("SELECT id FROM media_files;"))
        unknown = len(vault.execute_read("SELECT id FROM unknown_folders;"))
        runs = len(vault.execute_read("SELECT id FROM scan_runs;"))

        assert works == preview.works_to_upsert_count
        assert media == preview.media_files_to_upsert_count
        assert unknown == preview.unknown_folders_to_upsert_count
        assert runs == 1
    finally:
        vault.close()


def test_confirm_phrase_validation():
    phrase = build_confirmation_phrase("/root", "/db", 10, 20)
    assert validate_confirmation(phrase, phrase) is True
    assert validate_confirmation("wrong", phrase) is False
    assert validate_confirmation(None, phrase) is False


def test_can_execute_rejects_high_risk():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    preview.risk_level = "high"
    ok, reason = can_execute_real_import(preview, {"ok": True}, True)
    assert ok is False
    assert "risk_level" in reason


def test_can_execute_rejects_failed_backup():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    preview.risk_level = "low"
    ok, reason = can_execute_real_import(preview, {"ok": False, "error": "test"}, True)
    assert ok is False
    assert "backup" in reason


def test_can_execute_rejects_no_confirmation():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    preview.risk_level = "low"
    ok, reason = can_execute_real_import(preview, {"ok": True}, False)
    assert ok is False


def test_execute_tool_no_destructive_ops():
    source = EXECUTE_TOOL.read_text(encoding="utf-8")
    forbidden = [
        "os." + "remove",
        "os." + "rmdir",
        "shutil." + "rmtree",
        "shutil." + "move",
        "un" + "link(",
        "re" + "name(",
    ]
    assert not any(token in source for token in forbidden)


def test_pytest_works_without_arsm():
    assert LIBRARY_SAMPLE.is_dir()
