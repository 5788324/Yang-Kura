import json
import subprocess
import sys
from pathlib import Path

from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"
BLOCKER_TOOL = (
    Path(__file__).resolve().parents[1] / "tools" / "report_readiness_blockers.py"
)


def _make_edge_fixture(tmp_path):
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

    rj3 = root / "RJ300003_no_audio_no_archive"
    rj3.mkdir()
    (rj3 / "readme.md").write_text("just docs")
    (rj3 / "pic.jpg").write_text("pic")

    rj4 = root / "RJ400004_suspicious_ext"
    rj4.mkdir()
    (rj4 / "track.mp3").write_text("a")
    (rj4 / "readme.nfo").write_text("info")
    (rj4 / "album.cue").write_text("cue")

    return root


def test_fixture_generates_blocker_report():
    result = subprocess.run(
        [
            sys.executable, "-B", str(BLOCKER_TOOL),
            "--root", str(LIBRARY_SAMPLE), "--recursive",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode in (0, 1, 2)
    assert "readiness" in result.stdout.lower() or "Readiness" in result.stdout


def test_incomplete_files_in_report(tmp_path):
    root = _make_edge_fixture(tmp_path)
    result = subprocess.run(
        [
            sys.executable, "-B", str(BLOCKER_TOOL),
            "--root", str(root), "--recursive",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 2
    assert "incomplete" in result.stdout.lower()
    assert ".part" in result.stdout.lower() or ".crdownload" in result.stdout.lower()


def test_zero_byte_media_in_report(tmp_path):
    root = _make_edge_fixture(tmp_path)
    result = subprocess.run(
        [
            sys.executable, "-B", str(BLOCKER_TOOL),
            "--root", str(root), "--recursive",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 2
    assert "zero-byte" in result.stdout.lower()


def test_no_audio_works_in_report(tmp_path):
    root = _make_edge_fixture(tmp_path)
    result = subprocess.run(
        [
            sys.executable, "-B", str(BLOCKER_TOOL),
            "--root", str(root), "--recursive",
        ],
        capture_output=True, text=True,
    )
    assert result.returncode == 2
    assert "no-audio" in result.stdout.lower()


def test_cli_rejects_real_root_without_flag():
    result = subprocess.run(
        [
            sys.executable, "-B", str(BLOCKER_TOOL),
            "--root", str(Path("E:\\nonexistent_xyz")),
        ],
        capture_output=True, text=True,
    )
    assert result.returncode != 0
    assert "requires --allow-real-root" in (result.stdout + result.stderr)


def test_tool_no_execute_or_db():
    source = BLOCKER_TOOL.read_text(encoding="utf-8")
    assert "execute_import_plan" not in source
    assert "YangKuraVault" not in source
    assert "sqlite3.connect" not in source
    forbidden = [
        "os." + "remove",
        "os." + "rmdir",
        "shutil." + "move",
        "shutil." + "rmtree",
        "unlink" + "(",
        "rename" + "(",
    ]
    for token in forbidden:
        assert token not in source, f"found forbidden token: {token}"


def test_fixture_report_json_serializable(tmp_path):
    root = _make_edge_fixture(tmp_path)
    result = subprocess.run(
        [
            sys.executable, "-B", str(BLOCKER_TOOL),
            "--root", str(root), "--recursive",
            "--output-dir", str(tmp_path / "out"),
        ],
        capture_output=True, text=True,
    )
    reports = list((tmp_path / "out").glob("blocker_detail_*.json"))
    assert len(reports) >= 1
    data = json.loads(reports[0].read_text(encoding="utf-8"))
    assert "incomplete_files" in data
    assert "zero_byte_media_files" in data
    assert "no_audio_works" in data
    assert "action_recommendations" in data


def test_pytest_works_without_arsm():
    assert LIBRARY_SAMPLE.is_dir()
