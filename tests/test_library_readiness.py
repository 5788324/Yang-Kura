import json
import subprocess
import sys
from pathlib import Path

from core.scanner import build_readiness_report, scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"
AUDIT_TOOL = (
    Path(__file__).resolve().parents[1] / "tools" / "audit_library_readiness.py"
)


def _make_edge_case_fixture(tmp_path):
    root = tmp_path / "edge_library"
    root.mkdir()

    rj1 = root / "RJ100001_partial_dl"
    rj1.mkdir()
    (rj1 / "track01.mp3.part").write_text("x" * 100)
    (rj1 / "track02.mp3.crdownload").write_text("y" * 200)
    (rj1 / "cover.jpg").write_text("img")

    rj2 = root / "RJ200002_zero_byte"
    rj2.mkdir()
    (rj2 / "silence.mp3").write_text("")
    (rj2 / "empty.flac").write_text("")
    (rj2 / "cover.png").write_text("img")

    rj3 = root / "RJ300003_no_audio_only_archive"
    rj3.mkdir()
    (rj3 / "data.zip").write_text("archive")
    (rj3 / "notes.txt").write_text("notes")

    rj4 = root / "RJ400004_no_audio_no_archive"
    rj4.mkdir()
    (rj4 / "readme.md").write_text("just docs")
    (rj4 / "pic.jpg").write_text("pic")

    rj5 = root / "RJ500005_nested_media"
    rj5.mkdir()
    (rj5 / "track.mp3").write_text("a")
    sub = rj5 / "bonus"
    sub.mkdir()
    (sub / "extra.mp3").write_text("b")
    (sub / "extra.flac").write_text("c")

    rj6 = root / "RJ600006_suspicious_ext"
    rj6.mkdir()
    (rj6 / "track.mp3").write_text("a")
    (rj6 / "readme.nfo").write_text("info")
    (rj6 / "album.cue").write_text("cue")
    (rj6 / "data.url").write_text("http://...")
    (rj6 / "metadata.json").write_text("{}")

    return root


def test_fixture_generates_readiness_report():
    scan_result = scan_library_root(LIBRARY_SAMPLE)
    report = build_readiness_report(scan_result)
    assert report.root_path
    assert report.total_dirs >= 1
    assert report.works_count >= 1
    assert report.readiness_status in ("ready", "caution", "blocked")


def test_partial_download_marked_blocked(tmp_path):
    root = _make_edge_case_fixture(tmp_path)
    report = build_readiness_report(scan_library_root(root))
    assert report.readiness_status == "blocked"
    assert report.download_temp_file_count >= 2
    assert report.incomplete_file_count >= 2
    assert any("incomplete" in b or "download" in b for b in report.blockers)


def test_zero_byte_media_marked_blocker(tmp_path):
    root = _make_edge_case_fixture(tmp_path)
    report = build_readiness_report(scan_library_root(root))
    assert report.zero_byte_media_count >= 2
    assert any("zero" in b for b in report.blockers)


def test_no_audio_works_identified(tmp_path):
    root = _make_edge_case_fixture(tmp_path)
    report = build_readiness_report(scan_library_root(root))
    assert report.no_audio_work_count >= 2
    assert report.no_audio_blocked_count >= 1
    assert report.no_audio_caution_count >= 1


def test_nested_files_counted(tmp_path):
    root = _make_edge_case_fixture(tmp_path)
    report = build_readiness_report(scan_library_root(root))
    assert report.nested_file_count >= 2


def test_suspicious_extension_counted(tmp_path):
    root = _make_edge_case_fixture(tmp_path)
    report = build_readiness_report(scan_library_root(root))
    assert report.suspicious_extension_count >= 1


def test_cli_rejects_real_root_without_flag():
    result = subprocess.run(
        [
            sys.executable, "-B", str(AUDIT_TOOL),
            "--root", str(Path("E:\\nonexistent_xyz")),
        ],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "requires --allow-real-root" in (result.stdout + result.stderr)


def test_tool_no_execute_or_db():
    source = AUDIT_TOOL.read_text(encoding="utf-8")
    assert "execute_import_plan" not in source
    assert "YangKuraVault" not in source
    assert "sqlite3.connect" not in source
    forbidden = ["os." + "remove", "shutil." + "rmtree", "shutil." + "move"]
    assert not any(token in source for token in forbidden)


def test_fixture_audit_cli_works(tmp_path):
    result = subprocess.run(
        [
            sys.executable, "-B", str(AUDIT_TOOL),
            "--root", str(LIBRARY_SAMPLE),
            "--output-dir", str(tmp_path),
        ],
        capture_output=True, text=True,
    )
    assert result.returncode in (0, 2)


def test_report_json_serializable(tmp_path):
    root = _make_edge_case_fixture(tmp_path)
    report = build_readiness_report(scan_library_root(root))
    data = {
        "root_path": report.root_path,
        "scanned_at": report.scanned_at,
        "readiness_status": report.readiness_status,
        "total_dirs": report.total_dirs,
        "works_count": report.works_count,
        "media_files_count": report.media_files_count,
        "audio_count": report.audio_count,
        "video_count": report.video_count,
        "image_count": report.image_count,
        "subtitle_count": report.subtitle_count,
        "text_count": report.text_count,
        "archive_count": report.archive_count,
        "other_count": report.other_count,
        "incomplete_file_count": report.incomplete_file_count,
        "zero_byte_media_count": report.zero_byte_media_count,
        "no_audio_work_count": report.no_audio_work_count,
        "no_audio_blocked_count": report.no_audio_blocked_count,
        "no_audio_caution_count": report.no_audio_caution_count,
        "nested_file_count": report.nested_file_count,
        "suspicious_extension_count": report.suspicious_extension_count,
        "download_temp_file_count": report.download_temp_file_count,
        "unknown_folders_count": report.unknown_folders_count,
        "duplicate_code_count": report.duplicate_code_count,
        "mixed_folder_count": report.mixed_folder_count,
        "warning_count": report.warning_count,
        "error_count": report.error_count,
        "blockers": report.blockers,
        "warnings": report.warnings,
    }
    json_str = json.dumps(data)
    reloaded = json.loads(json_str)
    assert reloaded["readiness_status"] == report.readiness_status
    assert reloaded["works_count"] == report.works_count


def test_pytest_works_without_arsm():
    assert LIBRARY_SAMPLE.is_dir()


def test_recursive_readiness_reduces_no_audio():
    nonrec = build_readiness_report(scan_library_root(LIBRARY_SAMPLE, recursive=False))
    rec = build_readiness_report(scan_library_root(LIBRARY_SAMPLE, recursive=True))
    assert rec.no_audio_work_count <= nonrec.no_audio_work_count
