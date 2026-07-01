import argparse
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.db import YangKuraVault
from core.library import (
    backup_db_file,
    build_import_plan,
    build_import_preview,
    execute_import_plan,
)
from core.library.confirm import (
    build_confirmation_phrase,
    can_execute_real_import,
    validate_confirmation,
)
from core.scanner import scan_library_root

FIXTURE_ROOT = (ROOT / "tests" / "fixtures" / "library_sample").resolve()


def is_real_path(path_str):
    resolved = Path(path_str).resolve()
    candidates = [
        FIXTURE_ROOT,
        Path(tempfile.gettempdir()).resolve(),
    ]
    for c in candidates:
        try:
            resolved.relative_to(c)
            return False
        except ValueError:
            pass
    return True


def is_tmp_or_fixture_db(db_path):
    resolved = Path(db_path).resolve()
    candidates = [
        Path(tempfile.gettempdir()).resolve(),
        ROOT / "tmp",
    ]
    for c in candidates:
        try:
            resolved.relative_to(c)
            return True
        except ValueError:
            pass
    return False


def print_preview(preview, scan_result, confirm_phrase):
    print("=== Yang Kura Import Preview ===")
    print(f"dry_run:                {preview.dry_run}")
    print(f"db_write:               {preview.db_write}")
    print(f"risk_level:             {preview.risk_level}")
    print(f"blockers:               {preview.blockers or 'none'}")
    print()
    print(f"works_to_upsert:        {preview.works_to_upsert_count}")
    print(f"media_files_to_upsert:  {preview.media_files_to_upsert_count}")
    print(f"unknown_folders:        {preview.unknown_folders_to_upsert_count}")
    print(f"duplicate_entries:      {preview.duplicate_count}")
    print(f"mixed_entries:          {preview.mixed_count}")
    print(f"warnings:               {preview.warning_count}")
    print(f"errors:                 {preview.error_count}")
    print(f"requires_backup:        {preview.requires_backup}")
    print(f"requires_confirmation:  {preview.requires_confirmation}")
    print()
    print("--- Confirmation ---")
    print(f"Expected confirmation phrase:")
    print(f"  {confirm_phrase}")
    print()
    print("This is preview only. No database write was performed.")
    print("Use --execute with --confirm-backup and --confirm-phrase to proceed.")


def main():
    parser = argparse.ArgumentParser(description="Yang Kura real DB import")
    parser.add_argument("--root", required=True, help="Root path to scan")
    parser.add_argument("--db-path", default=None, help="Target SQLite DB path")
    parser.add_argument("--backup-dir", default=None, help="Backup directory")
    parser.add_argument("--allow-real-root", action="store_true")
    parser.add_argument("--allow-real-db", action="store_true")
    parser.add_argument("--confirm-backup", action="store_true")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--confirm-phrase", default=None)
    parser.add_argument("--recursive", action="store_true")

    args = parser.parse_args()

    if is_real_path(args.root) and not args.allow_real_root:
        print("ERROR: requires --allow-real-root for non-fixture path")
        print(f"  root: {args.root}")
        return 1

    print(f"Scanning: {args.root} (recursive={args.recursive}) ...")
    scan_result = scan_library_root(args.root, recursive=args.recursive)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)

    confirm_phrase = build_confirmation_phrase(
        args.root,
        args.db_path or "(not specified)",
        preview.works_to_upsert_count,
        preview.media_files_to_upsert_count,
    )

    if not args.execute:
        print_preview(preview, scan_result, confirm_phrase)
        return 0

    if not args.db_path:
        print("ERROR: --execute requires --db-path")
        return 1

    if not is_tmp_or_fixture_db(args.db_path) and not args.allow_real_db:
        print("ERROR: --execute requires --allow-real-db for non-tmp DB path")
        print(f"  db-path: {args.db_path}")
        return 1

    if not args.confirm_backup:
        print("ERROR: --execute requires --confirm-backup")
        return 1

    if not validate_confirmation(args.confirm_phrase, confirm_phrase):
        print("ERROR: --confirm-phrase does not match expected phrase")
        print(f"  expected: {confirm_phrase}")
        print(f"  got:      {args.confirm_phrase}")
        return 1

    if not args.backup_dir:
        print("ERROR: --execute requires --backup-dir")
        return 1

    if preview.risk_level != "low":
        print(f"ERROR: risk_level={preview.risk_level}, must be low to execute")
        return 1

    if preview.blockers:
        print(f"ERROR: blockers not empty: {preview.blockers}")
        return 1

    print("Re-scanning before execute ...")
    scan_result = scan_library_root(args.root, recursive=args.recursive)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)
    confirm_phrase = build_confirmation_phrase(
        args.root,
        args.db_path,
        preview.works_to_upsert_count,
        preview.media_files_to_upsert_count,
    )

    print("=== Current Execute Counts ===")
    print(f"works_to_upsert:        {preview.works_to_upsert_count}")
    print(f"media_files_to_upsert:  {preview.media_files_to_upsert_count}")
    print(f"unknown_folders:        {preview.unknown_folders_to_upsert_count}")
    print(f"risk_level:             {preview.risk_level}")
    print(f"blockers:               {preview.blockers or 'none'}")
    print("Expected confirmation phrase:")
    print(f"  {confirm_phrase}")

    if preview.risk_level != "low":
        print(f"ERROR: risk_level={preview.risk_level}, must be low to execute")
        return 1

    if preview.blockers:
        print(f"ERROR: blockers not empty: {preview.blockers}")
        return 1

    if not validate_confirmation(args.confirm_phrase, confirm_phrase):
        print("ERROR: --confirm-phrase does not match current re-scan result")
        print(f"  expected: {confirm_phrase}")
        print(f"  got:      {args.confirm_phrase}")
        return 1

    print(f"Backing up DB: {args.db_path} -> {args.backup_dir}")
    backup_result = backup_db_file(args.db_path, args.backup_dir, confirm=args.confirm_backup)
    if not backup_result["ok"]:
        print(f"ERROR: backup failed: {backup_result}")
        return 1
    print(f"Backup created: {backup_result['target']} ({backup_result['size']} bytes)")

    confirmation_ok = validate_confirmation(args.confirm_phrase, confirm_phrase)
    can_exec, reason = can_execute_real_import(preview, backup_result, confirmation_ok)
    if not can_exec:
        print(f"ERROR: cannot execute: {reason}")
        return 1

    vault = YangKuraVault(args.db_path)
    try:
        vault.init_db()
        exec_result = execute_import_plan(vault, plan)
        integrity = vault.integrity_check()

        print()
        print("=== Execute Summary ===")
        print(f"works upserted:          {exec_result.works_upserted}")
        print(f"media_files upserted:    {exec_result.media_files_upserted}")
        print(f"unknown_folders upserted:{exec_result.unknown_folders_upserted}")
        print(f"scan_run inserted:       {exec_result.scan_run_inserted}")
        print(f"execute errors:          {len(exec_result.errors)}")
        print(f"integrity_check:         {integrity}")
        if exec_result.errors:
            for e in exec_result.errors:
                print(f"  ! {e}")
        return 0 if integrity == "ok" else 1
    finally:
        vault.close()


if __name__ == "__main__":
    raise SystemExit(main())
