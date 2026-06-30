from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.library import build_import_plan
from core.scanner import scan_library_root


def main():
    fixture_path = ROOT / "tests" / "fixtures" / "library_sample"
    if not fixture_path.is_dir():
        print(f"ERROR: fixture path not found: {fixture_path}")
        return 1

    scan_result = scan_library_root(fixture_path)
    plan = build_import_plan(scan_result)

    print("=== Dry-Run Import Plan ===")
    print(f"dry_run: {plan.dry_run}")
    print(f"scan root: {scan_result.root_path}")
    print()

    summary = plan.scan_run_summary
    print("--- Scan Run Summary ---")
    print(f"  total_dirs:        {summary.get('total_dirs', 0)}")
    print(f"  recognized_works:  {summary.get('recognized_works', 0)}")
    print(f"  duplicate_rj_count:   {summary.get('duplicate_rj_count', 0)}")
    print(f"  mixed_folder_count:       {summary.get('mixed_folder_count', 0)}")
    print(f"  unknown_folders:   {summary.get('unknown_folders', 0)}")
    print(f"  media_files:       {summary.get('media_files', 0)}")
    print()

    print("--- Upsert Counts ---")
    print(f"  works_to_upsert:           {len(plan.works_to_upsert)}")
    print(f"  media_files_to_upsert:     {len(plan.media_files_to_upsert)}")
    print(f"  unknown_folders_to_upsert: {len(plan.unknown_folders_to_upsert)}")
    print()

    if plan.warnings:
        print("--- Warnings ---")
        for w in plan.warnings:
            print(f"  - {w}")
        print()

    if plan.errors:
        print("--- Errors ---")
        for e in plan.errors:
            print(f"  ! {e}")
        print()

    print("--- Works to Upsert ---")
    for w in plan.works_to_upsert:
        flags = f" [{w.warning_flags}]" if w.warning_flags else ""
        print(
            f"  {w.folder_status:12s} {w.work_code_norm:20s} "
            f"({w.work_code_raw}){flags}"
        )
        print(f"    folder: {w.folder_name}")
        print(
            f"    detected_by={w.detected_by} confidence={w.confidence}"
        )
        print()

    if plan.unknown_folders_to_upsert:
        print("--- Unknown Folders to Upsert ---")
        for u in plan.unknown_folders_to_upsert:
            print(f"  {u.folder_name}: reason={u.reason} total_files={u.total_files}")
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
