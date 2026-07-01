import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.scanner import build_readiness_report, scan_library_root

FIXTURE_ROOT = (ROOT / "tests" / "fixtures" / "library_sample").resolve()


def is_real_path(path_str):
    resolved = Path(path_str).resolve()
    try:
        resolved.relative_to(FIXTURE_ROOT)
    except ValueError:
        return True
    return False


def print_summary(report):
    print("=== Yang Kura Library Readiness Audit ===")
    print(f"root:              {report.root_path}")
    print(f"scanned_at:        {report.scanned_at}")
    print(f"readiness_status:  {report.readiness_status}")
    print()
    print(f"total_dirs:        {report.total_dirs}")
    print(f"works:             {report.works_count}")
    print(f"media_files:       {report.media_files_count}")
    print(f"  audio:           {report.audio_count}")
    print(f"  video:           {report.video_count}")
    print(f"  image:           {report.image_count}")
    print(f"  subtitle:        {report.subtitle_count}")
    print(f"  text:            {report.text_count}")
    print(f"  archive:         {report.archive_count}")
    print(f"  other:           {report.other_count}")
    print()
    print(f"incomplete(dl):    {report.incomplete_file_count}")
    print(f"zero_byte_media:   {report.zero_byte_media_count}")
    print(f"no_audio_works:    {report.no_audio_work_count}")
    print(f"  blocked:         {report.no_audio_blocked_count}")
    print(f"  caution:         {report.no_audio_caution_count}")
    print(f"nested_files:      {report.nested_file_count}")
    print(f"suspicious_ext:    {report.suspicious_extension_count}")
    print(f"unknown_folders:   {report.unknown_folders_count}")
    print(f"duplicate_groups:  {report.duplicate_code_count}")
    print(f"mixed_folders:     {report.mixed_folder_count}")
    print(f"warnings/errors:   {report.warning_count}/{report.error_count}")
    print()

    if report.blockers:
        print("--- Blockers ---")
        for b in report.blockers:
            print(f"  [BLOCKED] {b}")
        print()

    if report.warnings:
        print("--- Warnings ---")
        for w in report.warnings:
            print(f"  [WARNING] {w}")
        print()


def save_reports(report, out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = report.scanned_at.replace(":", "-")

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
        "examples": {
            "incomplete_files": report.examples["incomplete_files"][:30],
            "zero_byte_media": report.examples["zero_byte_media"][:30],
            "no_audio_works": report.examples["no_audio_works"][:30],
            "nested_files": report.examples["nested_files"][:30],
            "suspicious_extensions": {
                k: v[:5]
                for k, v in report.examples["suspicious_extensions"].items()
            },
        },
    }

    json_path = out_dir / f"readiness_audit_{ts}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    md_path = out_dir / f"readiness_audit_{ts}.md"
    lines = [
        "# Yang Kura Library Readiness Audit",
        "",
        f"- **root**: `{report.root_path}`",
        f"- **scanned_at**: {report.scanned_at}",
        f"- **readiness_status**: **{report.readiness_status}**",
        "",
        "## Summary",
        "",
        "| field | count |",
        "|---|---|",
        f"| total_dirs | {report.total_dirs} |",
        f"| works | {report.works_count} |",
        f"| media_files | {report.media_files_count} |",
        f"| audio | {report.audio_count} |",
        f"| video | {report.video_count} |",
        f"| image | {report.image_count} |",
        f"| subtitle | {report.subtitle_count} |",
        f"| text | {report.text_count} |",
        f"| archive | {report.archive_count} |",
        f"| other | {report.other_count} |",
        f"| incomplete (dl) | {report.incomplete_file_count} |",
        f"| zero-byte media | {report.zero_byte_media_count} |",
        f"| no-audio works | {report.no_audio_work_count} |",
        f"| no-audio blocked | {report.no_audio_blocked_count} |",
        f"| no-audio caution | {report.no_audio_caution_count} |",
        f"| nested files | {report.nested_file_count} |",
        f"| suspicious ext | {report.suspicious_extension_count} |",
        f"| unknown folders | {report.unknown_folders_count} |",
        f"| duplicate groups | {report.duplicate_code_count} |",
        f"| mixed folders | {report.mixed_folder_count} |",
        "",
    ]

    if report.blockers:
        lines.append("## Blockers")
        lines.append("")
        for b in report.blockers:
            lines.append(f"- **BLOCKED**: {b}")
        lines.append("")
    if report.warnings:
        lines.append("## Warnings")
        lines.append("")
        for w in report.warnings:
            lines.append(f"- {w}")
        lines.append("")

    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return json_path, md_path


def main():
    parser = argparse.ArgumentParser(description="Yang Kura library readiness audit")
    parser.add_argument("--root", required=True, help="Root path to audit")
    parser.add_argument("--allow-real-root", action="store_true")
    parser.add_argument("--recursive", action="store_true")
    parser.add_argument("--output-dir", default=None)
    args = parser.parse_args()

    if is_real_path(args.root) and not args.allow_real_root:
        print("ERROR: requires --allow-real-root for non-fixture path")
        print(f"  root: {args.root}")
        return 1

    print(f"Auditing: {args.root} (recursive={args.recursive}) ...")
    scan_result = scan_library_root(args.root, recursive=args.recursive)
    report = build_readiness_report(scan_result)

    print_summary(report)

    out_dir = args.output_dir if args.output_dir else str(ROOT / "tmp" / "reports")
    json_path, md_path = save_reports(report, out_dir)

    print(f"JSON report: {json_path}")
    print(f"Markdown report: {md_path}")

    if report.readiness_status == "blocked":
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
