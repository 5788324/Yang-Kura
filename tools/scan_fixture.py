from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.scanner import scan_library_root


def main():
    fixture_path = ROOT / "tests" / "fixtures" / "library_sample"
    if not fixture_path.is_dir():
        print(f"ERROR: fixture path not found: {fixture_path}")
        return 1

    result = scan_library_root(fixture_path)

    print(f"root: {result.root_path}")
    print(f"total_dirs: {result.total_dirs}")
    print(f"recognized works: {len(result.works)}")
    print(f"unknown_folders: {len(result.unknown_folders)}")
    print(f"duplicate_code_count: {result.duplicate_code_count}")
    print(f"mixed_folder_count: {result.mixed_folder_count}")
    print(f"total_media_files: {result.media_files_count}")
    print(f"warnings: {len(result.warnings)}")
    print(f"errors: {len(result.errors)}")
    print()

    if result.works:
        print("=== Works ===")
        for w in result.works:
            print(
                f"  [{w.folder_status}] {w.work_code_norm} "
                f"({w.work_code_raw}) type={w.work_type} number={w.work_number}"
            )
            print(f"    folder: {w.folder_name}")
            print(f"    files: {len(w.media_files)}")
            type_counts = {}
            for mf in w.media_files:
                type_counts[mf.file_type] = type_counts.get(mf.file_type, 0) + 1
            print(f"    types: {type_counts}")
            print()

    if result.unknown_folders:
        print("=== Unknown Folders ===")
        for u in result.unknown_folders:
            print(f"  {u.folder_name}: reason={u.reason} files={u.total_files}")
            print()

    if result.warnings:
        print("=== Warnings ===")
        for w in result.warnings:
            print(f"  - {w}")
        print()

    if result.errors:
        print("=== Errors ===")
        for e in result.errors:
            print(f"  ! {e}")
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
