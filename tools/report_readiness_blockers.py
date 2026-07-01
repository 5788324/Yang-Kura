import argparse
import json
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.scanner import scan_library_root
from core.scanner.readiness import (
    DOWNLOAD_TEMP_EXTENSIONS,
    MEDIA_FILE_TYPES,
    SUSPICIOUS_BASE_EXTENSIONS,
    ReadinessReport,
    build_readiness_report,
)

FIXTURE_ROOT = (ROOT / "tests" / "fixtures" / "library_sample").resolve()


def is_real_path(path_str):
    resolved = Path(path_str).resolve()
    candidates = [
        FIXTURE_ROOT,
        Path(tempfile.gettempdir()).resolve(),
        ROOT / "tmp",
    ]
    for c in candidates:
        try:
            resolved.relative_to(c)
            return False
        except ValueError:
            pass
    return True


def build_blocker_detail(scan_result):
    incomplete_files = []
    zero_byte_media_files = []
    no_audio_works = []
    suspicious_extensions = []
    nested_file_summary = {"total": 0, "works_with_nested": 0}

    for w in scan_result.works:
        has_audio = False
        has_archive = False
        file_types = {}
        work_nested_count = 0

        for mf in w.media_files:
            ft = mf.file_type
            file_types[ft] = file_types.get(ft, 0) + 1
            if ft == "audio":
                has_audio = True
            if ft == "archive":
                has_archive = True

            if mf.extension in DOWNLOAD_TEMP_EXTENSIONS and len(incomplete_files) < 100:
                incomplete_files.append({
                    "work_code_norm": w.work_code_norm,
                    "folder_path": w.folder_path,
                    "folder_name": w.folder_name,
                    "relative_path": mf.relative_path,
                    "file_name": mf.file_name,
                    "extension": mf.extension,
                    "size": mf.size,
                })

            if ft in MEDIA_FILE_TYPES and mf.size == 0 and len(zero_byte_media_files) < 100:
                zero_byte_media_files.append({
                    "work_code_norm": w.work_code_norm,
                    "folder_path": w.folder_path,
                    "folder_name": w.folder_name,
                    "relative_path": mf.relative_path,
                    "file_name": mf.file_name,
                    "extension": mf.extension,
                    "size": 0,
                    "file_type": ft,
                })

            if mf.extension in SUSPICIOUS_BASE_EXTENSIONS and len(suspicious_extensions) < 100:
                suspicious_extensions.append({
                    "work_code_norm": w.work_code_norm,
                    "folder_path": w.folder_path,
                    "folder_name": w.folder_name,
                    "relative_path": mf.relative_path,
                    "file_name": mf.file_name,
                    "extension": mf.extension,
                    "size": mf.size,
                })

        folder_path = Path(w.folder_path)
        try:
            for child in folder_path.iterdir():
                if child.is_dir():
                    for nested in child.iterdir():
                        if nested.is_file():
                            work_nested_count += 1
        except OSError:
            pass

        nested_file_summary["total"] += work_nested_count
        if work_nested_count > 0:
            nested_file_summary["works_with_nested"] += 1

        if not has_audio and w.folder_status in ("recognized", "duplicate"):
            examples = []
            for mf in w.media_files[:10]:
                examples.append({
                    "relative_path": mf.relative_path,
                    "file_type": mf.file_type,
                    "extension": mf.extension,
                    "size": mf.size,
                })
            if len(no_audio_works) < 100:
                no_audio_works.append({
                    "work_code_norm": w.work_code_norm,
                    "folder_path": w.folder_path,
                    "folder_name": w.folder_name,
                    "media_count": len(w.media_files),
                    "file_type_counts": file_types,
                    "has_archive": has_archive,
                    "nested_file_count": work_nested_count,
                    "examples": examples,
                })

    return {
        "incomplete_files": incomplete_files,
        "zero_byte_media_files": zero_byte_media_files,
        "no_audio_works": no_audio_works,
        "suspicious_extensions": suspicious_extensions,
        "nested_file_summary": nested_file_summary,
    }


def build_action_recommendations(detail, report):
    recs = []
    if detail["incomplete_files"]:
        recs.append(
            "Remove or complete download of {} incomplete/download file(s):\n{}".format(
                len(detail["incomplete_files"]),
                "\n".join(
                    "  - {} ({})".format(f["relative_path"], f["extension"])
                    for f in detail["incomplete_files"]
                ),
            )
        )
    if detail["zero_byte_media_files"]:
        recs.append(
            "Replace or remove {} zero-byte media file(s):\n{}".format(
                len(detail["zero_byte_media_files"]),
                "\n".join(
                    "  - {}/{} [{}]".format(
                        z["folder_name"], z["relative_path"], z["file_type"]
                    )
                    for z in detail["zero_byte_media_files"]
                ),
            )
        )
    if detail["no_audio_works"]:
        recs.append(
            "{} works have no audio. Verify if audio exists outside scanned tree "
            "or needs download.".format(len(detail["no_audio_works"]))
        )
    if detail["suspicious_extensions"]:
        recs.append(
            "{} files with suspicious extensions found. Review manually.".format(
                len(detail["suspicious_extensions"])
            )
        )
    return recs


def print_console(detail, report):
    print("=== Yang Kura Readiness Blocker Detail ===")
    print(f"root:              {report.root_path}")
    print(f"readiness:         {report.readiness_status}")
    print()
    print("incomplete/download: {}".format(len(detail["incomplete_files"])))
    for f in detail["incomplete_files"]:
        print("  [{ext}] {work}/{path} ({size}B)".format(
            ext=f["extension"], work=f["folder_name"],
            path=f["relative_path"], size=f["size"],
        ))
    print()
    print("zero-byte media:    {}".format(len(detail["zero_byte_media_files"])))
    for z in detail["zero_byte_media_files"]:
        print("  [{ft}] {work}/{path}".format(
            ft=z["file_type"], work=z["folder_name"], path=z["relative_path"],
        ))
    print()
    print("no-audio works:     {}".format(len(detail["no_audio_works"])))
    for n in detail["no_audio_works"]:
        archive_mark = " [has archive]" if n["has_archive"] else ""
        print("  {code} ({work}){archive}".format(
            code=n["work_code_norm"], work=n["folder_name"], archive=archive_mark,
        ))
    print()
    if detail["suspicious_extensions"]:
        print("suspicious ext:     {}".format(len(detail["suspicious_extensions"])))
    print()
    recs = build_action_recommendations(detail, report)
    if recs:
        print("--- Action Recommendations ---")
        for i, r in enumerate(recs, 1):
            print("  {}. {}".format(i, r.split("\n")[0]))


def save_blocker_report(detail, report, out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).isoformat().replace(":", "-")

    recs = build_action_recommendations(detail, report)

    data = {
        "root_path": report.root_path,
        "scanned_at": report.scanned_at,
        "readiness_status": report.readiness_status,
        "summary": {
            "incomplete_files": len(detail["incomplete_files"]),
            "zero_byte_media": len(detail["zero_byte_media_files"]),
            "no_audio_works": len(detail["no_audio_works"]),
            "suspicious_extensions": len(detail["suspicious_extensions"]),
        },
        "incomplete_files": detail["incomplete_files"],
        "zero_byte_media_files": detail["zero_byte_media_files"],
        "no_audio_works": detail["no_audio_works"],
        "suspicious_extensions": detail["suspicious_extensions"],
        "nested_file_summary": detail["nested_file_summary"],
        "action_recommendations": recs,
    }

    json_path = out_dir / f"blocker_detail_{ts}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    lines = [
        "# Yang Kura Blocker Detail Report",
        "",
        f"- **root**: `{report.root_path}`",
        f"- **scanned_at**: {report.scanned_at}",
        f"- **readiness_status**: **{report.readiness_status}**",
        "",
    ]

    if detail["incomplete_files"]:
        lines += [
            "## Incomplete / Download Files ({})".format(
                len(detail["incomplete_files"])
            ),
            "",
            "| ext | work | relative_path | size |",
            "|---|---|---|---|",
        ]
        for f in detail["incomplete_files"]:
            lines.append(
                "| {} | {} | {} | {} |".format(
                    f["extension"], f["folder_name"],
                    f["relative_path"], f["size"],
                )
            )
        lines.append("")

    if detail["zero_byte_media_files"]:
        lines += [
            "## Zero-Byte Media Files ({})".format(
                len(detail["zero_byte_media_files"])
            ),
            "",
            "| type | work | relative_path |",
            "|---|---|---|",
        ]
        for z in detail["zero_byte_media_files"]:
            lines.append(
                "| {} | {} | {} |".format(
                    z["file_type"], z["folder_name"], z["relative_path"],
                )
            )
        lines.append("")

    if detail["no_audio_works"]:
        lines += [
            "## No-Audio Works ({})".format(len(detail["no_audio_works"])),
            "",
            "| code | folder | media | has_archive | nested |",
            "|---|---|---|---|---|",
        ]
        for n in detail["no_audio_works"]:
            lines.append(
                "| {} | {} | {} | {} | {} |".format(
                    n["work_code_norm"],
                    n["folder_name"],
                    n["media_count"],
                    n["has_archive"],
                    n["nested_file_count"],
                )
            )
        lines.append("")

    if detail["suspicious_extensions"]:
        lines += [
            "## Suspicious Extensions ({})".format(
                len(detail["suspicious_extensions"])
            ),
            "",
            "| ext | work | file | size |",
            "|---|---|---|---|",
        ]
        for s in detail["suspicious_extensions"]:
            lines.append(
                "| {} | {} | {} | {} |".format(
                    s["extension"], s["folder_name"], s["relative_path"], s["size"],
                )
            )
        lines.append("")

    if recs:
        lines += [
            "## Action Recommendations",
            "",
        ]
        for i, r in enumerate(recs, 1):
            lines.append("{}. {}".format(i, r))
        lines.append("")

    md_path = out_dir / f"blocker_detail_{ts}.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return json_path, md_path


def main():
    parser = argparse.ArgumentParser(description="Yang Kura readiness blocker detail")
    parser.add_argument("--root", required=True, help="Root path to audit")
    parser.add_argument("--allow-real-root", action="store_true")
    parser.add_argument("--recursive", action="store_true", default=True)
    parser.add_argument("--no-recursive", dest="recursive", action="store_false")
    parser.add_argument("--output-dir", default=None)
    args = parser.parse_args()

    if is_real_path(args.root) and not args.allow_real_root:
        print("ERROR: requires --allow-real-root for non-fixture path")
        print(f"  root: {args.root}")
        return 1

    print(f"Auditing: {args.root} (recursive={args.recursive}) ...")
    scan_result = scan_library_root(args.root, recursive=args.recursive)
    report = build_readiness_report(scan_result)
    detail = build_blocker_detail(scan_result)

    print_console(detail, report)

    out_dir = args.output_dir if args.output_dir else str(ROOT / "tmp" / "reports")
    json_path, md_path = save_blocker_report(detail, report, out_dir)

    print(f"\nJSON report: {json_path}")
    print(f"Markdown report: {md_path}")

    if report.readiness_status == "blocked":
        return 2
    elif report.readiness_status == "caution":
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
