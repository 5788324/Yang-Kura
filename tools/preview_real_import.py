import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.library import build_import_plan, build_import_preview
from core.scanner import scan_library_root

FIXTURE_ROOT = (ROOT / "tests" / "fixtures" / "library_sample").resolve()


def is_real_path(path_str):
    resolved = Path(path_str).resolve()
    try:
        resolved.relative_to(FIXTURE_ROOT)
    except ValueError:
        return True
    return False


def print_summary(preview, scan_result):
    print("=== Yang Kura Import Preview ===")
    print(f"dry_run:                {preview.dry_run}")
    print(f"db_write:               {preview.db_write}")
    print(f"risk_level:             {preview.risk_level}")
    print()
    print(f"works_to_upsert:        {preview.works_to_upsert_count}")
    print(f"media_files_to_upsert:  {preview.media_files_to_upsert_count}")
    print(f"unknown_folders:        {preview.unknown_folders_to_upsert_count}")
    print(f"duplicate_entries:      {preview.duplicate_count}")
    print(f"mixed_entries:          {preview.mixed_count}")
    print(f"warnings:               {preview.warning_count}")
    print(f"errors:                 {preview.error_count}")
    print()
    print(f"estimated_tables:       {preview.estimated_tables_affected}")
    print(f"blockers:               {preview.blockers or 'none'}")
    print(f"requires_backup:        {preview.requires_backup}")
    print(f"requires_confirmation:  {preview.requires_confirmation}")
    print()
    print("--- Confirmation Required ---")
    print("This is preview only.")
    print("No database write was performed.")
    print(
        "Real execute requires separate command, DB backup, " "and explicit confirmation."
    )


def save_preview(preview, scan_result, out_dir, recursive=False):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).isoformat().replace(":", "-")

    data = {
        "dry_run": preview.dry_run,
        "db_write": preview.db_write,
        "risk_level": preview.risk_level,
        "works_to_upsert_count": preview.works_to_upsert_count,
        "media_files_to_upsert_count": preview.media_files_to_upsert_count,
        "unknown_folders_to_upsert_count": preview.unknown_folders_to_upsert_count,
        "duplicate_count": preview.duplicate_count,
        "mixed_count": preview.mixed_count,
        "warning_count": preview.warning_count,
        "error_count": preview.error_count,
        "estimated_tables_affected": preview.estimated_tables_affected,
        "blockers": preview.blockers,
        "requires_backup": preview.requires_backup,
        "requires_confirmation": preview.requires_confirmation,
        "root_path": scan_result.root_path,
        "total_dirs": scan_result.total_dirs,
        "scanner_mode": "read_only",
        "recursive": recursive,
        "confirmation_note": "This is preview only. No database write was performed. "
        "Real execute requires separate command, DB backup, and explicit confirmation.",
    }

    json_path = out_dir / f"import_preview_{ts}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    md_path = out_dir / f"import_preview_{ts}.md"
    lines = [
        "# Yang Kura Import Preview",
        "",
        f"- **dry_run**: {preview.dry_run}",
        f"- **db_write**: {preview.db_write}",
        f"- **risk_level**: {preview.risk_level}",
        "",
        "## Summary",
        "",
        "| field | count |",
        "|---|---|",
        f"| works_to_upsert | {preview.works_to_upsert_count} |",
        f"| media_files_to_upsert | {preview.media_files_to_upsert_count} |",
        f"| unknown_folders | {preview.unknown_folders_to_upsert_count} |",
        f"| duplicate_entries | {preview.duplicate_count} |",
        f"| mixed_entries | {preview.mixed_count} |",
        f"| warnings | {preview.warning_count} |",
        f"| errors | {preview.error_count} |",
        f"| estimated_tables | {', '.join(preview.estimated_tables_affected)} |",
        f"| blockers | {', '.join(preview.blockers) if preview.blockers else 'none'} |",
        f"| requires_backup | {preview.requires_backup} |",
        f"| requires_confirmation | {preview.requires_confirmation} |",
        "",
        "> **This is preview only. No database write was performed.**",
        "> Real execute requires separate command, DB backup, and explicit confirmation.",
    ]
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return json_path, md_path


def main():
    parser = argparse.ArgumentParser(
        description="Yang Kura import preview (no DB write)"
    )
    parser.add_argument("--root", required=True, help="Root path to scan")
    parser.add_argument(
        "--allow-real-root",
        action="store_true",
        help="Required to scan non-fixture paths (e.g. E:\\arsm)",
    )
    parser.add_argument("--recursive", action="store_true")
    parser.add_argument(
        "--output-dir", default=None, help="Output directory for preview reports"
    )
    args = parser.parse_args()

    if is_real_path(args.root) and not args.allow_real_root:
        print("ERROR: scanning non-fixture paths requires --allow-real-root")
        print(f"  root: {args.root}")
        print(f"  fixture: {FIXTURE_ROOT}")
        return 1

    print(f"Scanning: {args.root} (recursive={args.recursive}) ...")
    scan_result = scan_library_root(args.root, recursive=args.recursive)
    plan = build_import_plan(scan_result)
    preview = build_import_preview(plan)

    print_summary(preview, scan_result)

    out_dir = args.output_dir if args.output_dir else str(ROOT / "tmp" / "reports")
    json_path, md_path = save_preview(preview, scan_result, out_dir, recursive=args.recursive)

    print(f"\nJSON preview: {json_path}")
    print(f"Markdown preview: {md_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
