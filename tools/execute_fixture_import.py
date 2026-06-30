from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.db import YangKuraVault
from core.library import build_import_plan, execute_import_plan
from core.scanner import scan_library_root


def main():
    fixture_path = ROOT / "tests" / "fixtures" / "library_sample"
    if not fixture_path.is_dir():
        print(f"ERROR: fixture path not found: {fixture_path}")
        return 1

    tmp_dir = ROOT / "tmp"
    tmp_dir.mkdir(exist_ok=True)
    db_path = tmp_dir / "fixture_import_test.db"

    vault = YangKuraVault(db_path)
    try:
        vault.init_db()

        scan_result = scan_library_root(fixture_path)
        plan = build_import_plan(scan_result)
        execute_result = execute_import_plan(vault, plan)

        integrity = vault.integrity_check()

        works_count = len(
            vault.execute_read("SELECT id FROM works;")
        )
        media_files_count = len(
            vault.execute_read("SELECT id FROM media_files;")
        )
        unknown_folders_count = len(
            vault.execute_read("SELECT id FROM unknown_folders;")
        )
        scan_runs_count = len(
            vault.execute_read("SELECT id FROM scan_runs;")
        )

        print(f"DB path: {db_path}")
        print(f"integrity_check: {integrity}")
        print()
        print("--- Execute Result ---")
        print(f"  works_upserted:           {execute_result.works_upserted}")
        print(
            f"  media_files_upserted:     {execute_result.media_files_upserted}"
        )
        print(
            f"  unknown_folders_upserted: {execute_result.unknown_folders_upserted}"
        )
        print(f"  scan_run_inserted:        {execute_result.scan_run_inserted}")
        print(f"  errors:                   {len(execute_result.errors)}")
        print()
        print("--- DB Counts ---")
        print(f"  works:           {works_count}")
        print(f"  media_files:     {media_files_count}")
        print(f"  unknown_folders: {unknown_folders_count}")
        print(f"  scan_runs:       {scan_runs_count}")
        print()

        media_with_work = len(
            vault.execute_read(
                "SELECT id FROM media_files WHERE work_id IS NOT NULL;"
            )
        )
        print(f"  media_files with work_id: {media_with_work}")

        if execute_result.errors:
            print()
            print("--- Execute Errors ---")
            for e in execute_result.errors:
                print(f"  ! {e}")

        return 0
    finally:
        vault.close()


if __name__ == "__main__":
    raise SystemExit(main())
