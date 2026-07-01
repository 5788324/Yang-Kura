from pathlib import Path

from core.db.vault import YangKuraVault
from core.scanner import scan_library_root

LIBRARY_SAMPLE = Path(__file__).resolve().parent / "fixtures" / "library_sample"


def _by_norm(result, norm):
    for w in result.works:
        if w.work_code_norm == norm:
            return w
    return None


def _by_folder_name(result, name):
    for w in result.works:
        if w.folder_name == name:
            return w
    return None


def _unknown_by_name(result, name):
    for u in result.unknown_folders:
        if u.folder_name == name:
            return u
    return None


def test_scan_fixture_no_error():
    result = scan_library_root(LIBRARY_SAMPLE)
    assert result.root_path == str(LIBRARY_SAMPLE.resolve())
    assert result.total_dirs > 0
    assert not result.errors


def test_normal_rj_recognized():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_folder_name(result, "RJ323125 [ASMR][cv_voice]")
    assert w is not None
    assert w.work_code_raw == "RJ323125"
    assert w.work_code_norm == "rj323125"
    assert w.work_type == "rj"
    assert w.work_number == 323125
    assert w.folder_status == "duplicate"
    assert "RJ323125" in w.folder_name


def test_lowercase_rj_recognized():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_norm(result, "rj100355")
    assert w is not None
    assert w.work_type == "rj"
    assert w.work_number == 100355
    assert w.folder_name == "rj100355"


def test_vj_recognized():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_norm(result, "vj8888")
    assert w is not None
    assert w.work_type == "vj"
    assert w.work_number == 8888


def test_bj_recognized():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_norm(result, "bj12345")
    assert w is not None
    assert w.work_type == "bj"
    assert w.work_number == 12345


def test_rj_leading_zeros_normalized():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_norm(result, "rj100100")
    assert w is not None
    assert w.work_number == 100100


def test_unknown_folder_identified():
    result = scan_library_root(LIBRARY_SAMPLE)
    u = _unknown_by_name(result, "no_rj_audio_folder")
    assert u is not None
    assert u.reason == "no_work_code"
    assert u.total_files > 0
    assert u.audio_count > 0


def test_mixed_folder_identified():
    result = scan_library_root(LIBRARY_SAMPLE)
    assert result.mixed_folder_count >= 1
    w = _by_folder_name(result, "mixed_rj_folder")
    assert w is not None
    assert w.folder_status == "mixed"
    assert "rj111111" in w.work_code_norm
    assert "rj222222" in w.work_code_norm


def test_duplicate_rj_identified():
    result = scan_library_root(LIBRARY_SAMPLE)
    assert result.duplicate_code_count >= 1

    w1 = _by_folder_name(result, "RJ100100_original")
    w2 = _by_folder_name(result, "RJ0100100_dup")
    assert w1 is not None
    assert w2 is not None
    assert w1.folder_status == "duplicate"
    assert w2.folder_status == "duplicate"


def test_file_type_classification():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_norm(result, "rj999999")
    assert w is not None

    file_types = {mf.file_type for mf in w.media_files}
    assert "audio" in file_types
    assert "video" in file_types
    assert "image" in file_types
    assert "subtitle" in file_types
    assert "text" in file_types
    assert "archive" in file_types
    assert "other" in file_types

    by_type = {}
    for mf in w.media_files:
        by_type.setdefault(mf.file_type, []).append(mf.file_name)

    assert len(by_type["audio"]) >= 1
    assert len(by_type["video"]) >= 1
    assert len(by_type["image"]) >= 2
    assert len(by_type["subtitle"]) >= 2
    assert len(by_type["text"]) >= 1
    assert len(by_type["archive"]) >= 2
    assert len(by_type["other"]) >= 1


def test_scanner_does_not_write_db(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        works_before = len(vault.execute_read("SELECT id FROM works;"))

        scan_library_root(LIBRARY_SAMPLE)

        works_after = len(vault.execute_read("SELECT id FROM works;"))
        assert works_after == works_before
    finally:
        vault.close()


def test_scanner_works_without_real_arsm():
    result = scan_library_root(LIBRARY_SAMPLE)
    assert result.total_dirs >= 1
    assert len(result.works) >= 1


def test_japanese_folder_recognized():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_norm(result, "rj123456")
    assert w is not None
    assert w.work_type == "rj"
    assert w.work_number == 123456
    assert "日本語" in w.folder_name or w.folder_name.startswith(
        "日本語"
    )


def test_empty_folder_skipped():
    result = scan_library_root(LIBRARY_SAMPLE)
    w = _by_folder_name(result, "empty_folder")
    assert w is None
    u = _unknown_by_name(result, "empty_folder")
    assert u is None

def _by_folder_entries(result, name):
    return [w for w in result.works if w.folder_name == name]


def test_zero_padded_rj_preserves_raw_and_duplicates():
    result = scan_library_root(LIBRARY_SAMPLE)
    entries = _by_folder_entries(result, "RJ00323125_zero_padded")
    assert len(entries) == 1
    w = entries[0]
    assert w.work_code_raw == "RJ00323125"
    assert w.work_code_norm == "rj323125"
    assert w.work_type == "rj"
    assert w.work_number == 323125
    assert w.folder_status == "duplicate"

    original = _by_folder_name(result, "RJ323125 [ASMR][cv_voice]")
    assert original is not None
    assert original.work_code_norm == "rj323125"
    assert original.folder_status == "duplicate"


def test_recursive_false_keeps_old_behavior():
    result = scan_library_root(LIBRARY_SAMPLE)
    result_rec = scan_library_root(LIBRARY_SAMPLE, recursive=False)
    assert result.total_dirs == result_rec.total_dirs
    assert result.media_files_count == result_rec.media_files_count


def test_recursive_finds_nested_media():
    result = scan_library_root(LIBRARY_SAMPLE, recursive=True)
    w = _by_norm(result, "rj777777")
    assert w is not None
    assert len(w.media_files) >= 3
    rel_paths = {mf.relative_path for mf in w.media_files}
    assert any("/" in r or "\\" in r for r in rel_paths)
    assert any("CD1" in r for r in rel_paths)
    assert any("track01.wav" in r for r in rel_paths)


def test_recursive_folder_path_is_work_dir():
    result = scan_library_root(LIBRARY_SAMPLE, recursive=True)
    w = _by_norm(result, "rj777777")
    assert w is not None
    work_path = w.folder_path
    for mf in w.media_files:
        assert mf.folder_path == work_path


def test_recursive_relative_path_contains_subdirs():
    result = scan_library_root(LIBRARY_SAMPLE, recursive=True)
    w = _by_norm(result, "rj777777")
    subdir_files = [
        mf for mf in w.media_files
        if "CD1" in mf.relative_path or "CD2" in mf.relative_path or "scans" in mf.relative_path
    ]
    assert len(subdir_files) >= 2
    assert any(mf.relative_path.endswith("track01.wav") for mf in subdir_files)


def test_recursive_subdirs_not_independent_works():
    result = scan_library_root(LIBRARY_SAMPLE, recursive=True)
    w = _by_folder_name(result, "CD1")
    assert w is None
    w = _by_folder_name(result, "CD2")
    assert w is None
    w = _by_folder_name(result, "scans")
    assert w is None
