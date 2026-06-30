import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.library import build_import_plan
from core.scanner import scan_library_root

FIXTURE_ROOT = (ROOT / "tests" / "fixtures" / "library_sample").resolve()


def is_real_path(path_str):
    resolved = Path(path_str).resolve()
    try:
        resolved.relative_to(FIXTURE_ROOT)
    except ValueError:
        return True
    return False


def build_report(scan_result, plan, scanned_at):
    file_type_counts = {}
    extension_dist = {}
    for w in scan_result.works:
        for mf in w.media_files:
            ft = mf.file_type
            file_type_counts[ft] = file_type_counts.get(ft, 0) + 1
            ext = mf.extension
            extension_dist[ext] = extension_dist.get(ext, 0) + 1
    for uf in scan_result.unknown_folders:
        for attr, ftype in [
            ("audio_count", "audio"),
            ("image_count", "image"),
            ("subtitle_count", "subtitle"),
            ("text_count", "text"),
            ("video_count", "video"),
            ("archive_count", "archive"),
            ("other_count", "other"),
        ]:
            count = getattr(uf, attr, 0)
            if count:
                file_type_counts[ftype] = file_type_counts.get(ftype, 0) + count

    recognized_count = sum(
        1 for w in scan_result.works if w.folder_status == "recognized"
    )

    dup_norms = {}
    for w in scan_result.works:
        if w.folder_status == "duplicate":
            dup_norms.setdefault(w.work_code_norm, []).append(w.folder_name)

    duplicate_examples = [
        {"norm": norm, "folders": folders}
        for norm, folders in dup_norms.items()
    ]

    mixed_examples = [
        {
            "folder": w.folder_name,
            "codes": w.work_code_norm,
            "files": len(w.media_files),
        }
        for w in scan_result.works
        if w.folder_status == "mixed"
    ]

    unknown_examples = [
        {"folder": u.folder_name, "files": u.total_files}
        for u in scan_result.unknown_folders
    ]

    return {
        "root_path": scan_result.root_path,
        "scanned_at": scanned_at,
        "total_dirs": scan_result.total_dirs,
        "works_count": len(plan.works_to_upsert),
        "recognized_count": recognized_count,
        "duplicate_code_count": scan_result.duplicate_code_count,
        "mixed_folder_count": scan_result.mixed_folder_count,
        "unknown_folders_count": len(plan.unknown_folders_to_upsert),
        "media_files_count": len(plan.media_files_to_upsert),
        "file_type_counts": file_type_counts,
        "extension_distribution": extension_dist,
        "warning_count": len(scan_result.warnings),
        "error_count": len(scan_result.errors),
        "top_warnings": scan_result.warnings[:30],
        "unknown_folder_examples": unknown_examples[:30],
        "duplicate_examples": duplicate_examples[:30],
        "mixed_examples": mixed_examples[:30],
        "scanner_mode": "read_only",
        "db_write": False,
    }


def print_summary(report):
    print("=== Yang Kura Scan Report (Read-Only) ===")
    print(f"root:            {report['root_path']}")
    print(f"scanned_at:      {report['scanned_at']}")
    print(f"scanner_mode:    {report['scanner_mode']}")
    print(f"db_write:        {report['db_write']}")
    print()
    print(f"total_dirs:        {report['total_dirs']}")
    print(f"works:             {report['works_count']}")
    print(f"  recognized:      {report['recognized_count']}")
    print(f"  duplicate groups:{report['duplicate_code_count']}")
    print(f"  mixed:           {report['mixed_folder_count']}")
    print(f"unknown folders:   {report['unknown_folders_count']}")
    print(f"media files:       {report['media_files_count']}")
    print(f"warnings:          {report['warning_count']}")
    print(f"errors:            {report['error_count']}")
    print()
    if report["file_type_counts"]:
        print("--- File Type Counts ---")
        for ft, count in sorted(report["file_type_counts"].items()):
            print(f"  {ft:12s}: {count}")
        print()
    if report["extension_distribution"]:
        print("--- Extension Distribution ---")
        for ext, count in sorted(report["extension_distribution"].items()):
            print(f"  {ext:8s}: {count}")
        print()


def save_json(report, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)


def save_md(report, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Yang Kura Scan Report",
        "",
        f"- **root**: `{report['root_path']}`",
        f"- **scanned_at**: {report['scanned_at']}",
        f"- **scanner_mode**: {report['scanner_mode']}",
        f"- **db_write**: {report['db_write']}",
        "",
        "## Summary",
        "",
        "| field | count |",
        "|---|---|",
        f"| total_dirs | {report['total_dirs']} |",
        f"| works | {report['works_count']} |",
        f"| recognized | {report['recognized_count']} |",
        f"| duplicate (code groups) | {report['duplicate_code_count']} |",
        f"| mixed | {report['mixed_folder_count']} |",
        f"| unknown_folders | {report['unknown_folders_count']} |",
        f"| media_files | {report['media_files_count']} |",
        f"| warnings | {report['warning_count']} |",
        f"| errors | {report['error_count']} |",
        "",
    ]

    if report["file_type_counts"]:
        lines.append("## File Type Counts")
        lines.append("")
        for ft, count in sorted(report["file_type_counts"].items()):
            lines.append(f"- {ft}: {count}")
        lines.append("")

    if report["extension_distribution"]:
        lines.append("## Extension Distribution")
        lines.append("")
        for ext, count in sorted(report["extension_distribution"].items()):
            lines.append(f"- {ext}: {count}")
        lines.append("")

    if report["top_warnings"]:
        lines.append("## Warnings")
        lines.append("")
        for w in report["top_warnings"]:
            lines.append(f"- {w}")
        lines.append("")

    if report["duplicate_examples"]:
        lines.append("## Duplicates")
        lines.append("")
        for d in report["duplicate_examples"]:
            folders = ", ".join(d["folders"])
            lines.append(f"- `{d['norm']}` → {folders}")
        lines.append("")

    if report["mixed_examples"]:
        lines.append("## Mixed Folders")
        lines.append("")
        for m in report["mixed_examples"]:
            lines.append(f"- {m['folder']} ({m['files']} files) → {m['codes']}")
        lines.append("")

    if report["unknown_folder_examples"]:
        lines.append("## Unknown Folders")
        lines.append("")
        for u in report["unknown_folder_examples"]:
            lines.append(f"- {u['folder']} ({u['files']} files)")
        lines.append("")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description="Yang Kura read-only scan report")
    parser.add_argument("--root", required=True, help="Root path to scan")
    parser.add_argument(
        "--allow-real-root",
        action="store_true",
        help="Required to scan non-fixture paths (e.g. E:\\arsm)",
    )
    parser.add_argument(
        "--output-dir", default=None, help="Output directory for JSON/MD reports"
    )
    parser.add_argument(
        "--format", choices=["json", "md", "both"], default="both"
    )
    args = parser.parse_args()

    if is_real_path(args.root) and not args.allow_real_root:
        print("ERROR: scanning non-fixture paths requires --allow-real-root")
        print(f"  root: {args.root}")
        print(f"  fixture: {FIXTURE_ROOT}")
        return 1

    print(f"Scanning: {args.root} ...")
    scan_result = scan_library_root(args.root)
    plan = build_import_plan(scan_result)
    scanned_at = datetime.now(timezone.utc).isoformat()

    report = build_report(scan_result, plan, scanned_at)
    print_summary(report)

    out_dir = Path(args.output_dir) if args.output_dir else (ROOT / "tmp" / "reports")
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = scanned_at.replace(":", "-")
    json_path = out_dir / f"scan_report_{ts}.json"
    md_path = out_dir / f"scan_report_{ts}.md"

    if args.format in ("json", "both"):
        save_json(report, json_path)
        print(f"JSON report: {json_path}")

    if args.format in ("md", "both"):
        save_md(report, md_path)
        print(f"Markdown report: {md_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
