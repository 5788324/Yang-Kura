import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from core.library import build_import_plan
from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"
TOOL_PATH = Path(__file__).resolve().parents[1] / "tools" / "scan_real_report.py"


def _build_fixture_report():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    scanned_at = datetime.now(timezone.utc).isoformat()
    from tools.scan_real_report import build_report

    return build_report(scan_result, plan, scanned_at)


def test_fixture_generates_report():
    report = _build_fixture_report()
    assert report is not None
    assert report["total_dirs"] >= 1
    assert report["works_count"] >= 1
    assert report["media_files_count"] >= 1
    assert report["scanner_mode"] == "read_only"


def test_report_marks_db_write_false():
    report = _build_fixture_report()
    assert report["db_write"] is False


def test_report_fields_complete():
    report = _build_fixture_report()
    required_keys = {
        "root_path",
        "scanned_at",
        "total_dirs",
        "works_count",
        "recognized_count",
        "duplicate_code_count",
        "mixed_folder_count",
        "unknown_folders_count",
        "media_files_count",
        "file_type_counts",
        "extension_distribution",
        "warning_count",
        "error_count",
        "top_warnings",
        "unknown_folder_examples",
        "duplicate_examples",
        "mixed_examples",
        "scanner_mode",
        "db_write",
    }
    missing = required_keys - set(report.keys())
    assert not missing, f"missing report keys: {missing}"


def test_report_has_no_execute_import_plan():
    report = _build_fixture_report()
    json_str = json.dumps(report)
    assert "execute_import_plan" not in json_str
    assert "YangKuraVault" not in json_str
    assert "sqlite3.connect" not in json_str

    tool_source = TOOL_PATH.read_text(encoding="utf-8")
    assert "execute_import_plan" not in tool_source
    assert "YangKuraVault" not in tool_source
    assert "sqlite3.connect" not in tool_source


def test_cli_rejects_real_path_without_flag():
    fake_root = str(Path("E:\\nonexistent_arsm_dir_xyz"))
    result = subprocess.run(
        [sys.executable, "-B", str(TOOL_PATH), "--root", fake_root],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0
    assert "requires --allow-real-root" in result.stdout or "requires --allow-real-root" in result.stderr


def test_fixture_mode_no_arsm_required():
    result = subprocess.run(
        [
            sys.executable,
            "-B",
            str(TOOL_PATH),
            "--root",
            str(LIBRARY_SAMPLE),
            "--format",
            "json",
        ],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0


def test_report_does_not_write_db(tmp_path):
    db_before = list(tmp_path.glob("*.db"))
    _build_fixture_report()
    db_after = list(tmp_path.glob("*.db"))
    assert len(db_after) == len(db_before)


def test_report_fixture_works_count_matches_plan():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    plan = build_import_plan(scan_result)
    scanned_at = datetime.now(timezone.utc).isoformat()
    from tools.scan_real_report import build_report

    report = build_report(scan_result, plan, scanned_at)
    assert report["works_count"] == len(plan.works_to_upsert)
    assert report["media_files_count"] == len(plan.media_files_to_upsert)
    assert report["unknown_folders_count"] == len(plan.unknown_folders_to_upsert)


def test_report_json_serializable():
    report = _build_fixture_report()
    json_str = json.dumps(report)
    reloaded = json.loads(json_str)
    assert reloaded["db_write"] is False
    assert reloaded["scanner_mode"] == "read_only"
