from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from .result import ScanResult

DOWNLOAD_TEMP_EXTENSIONS = {
    ".part",
    ".crdownload",
    ".aria2",
    ".tmp",
    ".download",
    ".!qb",
    ".torrent",
    ".unfinished",
    ".partial",
}

MEDIA_FILE_TYPES = {"audio", "video", "subtitle", "text", "archive"}

SUSPICIOUS_BASE_EXTENSIONS = {
    ".doc",
    ".part",
    ".url",
    ".html",
    ".ini",
    ".nfo",
    ".json",
    ".cue",
}


@dataclass
class ReadinessReport:
    root_path: str = ""
    scanned_at: str = ""
    total_dirs: int = 0
    works_count: int = 0
    media_files_count: int = 0
    audio_count: int = 0
    video_count: int = 0
    image_count: int = 0
    subtitle_count: int = 0
    text_count: int = 0
    archive_count: int = 0
    other_count: int = 0
    incomplete_file_count: int = 0
    zero_byte_media_count: int = 0
    no_audio_work_count: int = 0
    no_audio_blocked_count: int = 0
    no_audio_caution_count: int = 0
    nested_file_count: int = 0
    suspicious_extension_count: int = 0
    download_temp_file_count: int = 0
    unknown_folders_count: int = 0
    duplicate_code_count: int = 0
    mixed_folder_count: int = 0
    warning_count: int = 0
    error_count: int = 0
    readiness_status: str = "ready"
    blockers: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    examples: dict = field(default_factory=lambda: {
        "incomplete_files": [],
        "zero_byte_media": [],
        "no_audio_works": [],
        "nested_files": [],
        "suspicious_extensions": {},
    })

    @property
    def is_ready(self):
        return self.readiness_status == "ready"


def build_readiness_report(scan_result: ScanResult) -> ReadinessReport:
    report = ReadinessReport(
        root_path=scan_result.root_path,
        scanned_at=datetime.now(timezone.utc).isoformat(),
        total_dirs=scan_result.total_dirs,
        works_count=len(scan_result.works),
        media_files_count=scan_result.media_files_count,
        unknown_folders_count=len(scan_result.unknown_folders),
        duplicate_code_count=scan_result.duplicate_code_count,
        mixed_folder_count=scan_result.mixed_folder_count,
        warning_count=len(scan_result.warnings),
        error_count=len(scan_result.errors),
    )

    for w in scan_result.works:
        has_audio = False
        has_archive = False
        file_types = {}
        for mf in w.media_files:
            ft = mf.file_type
            file_types[ft] = file_types.get(ft, 0) + 1
            ext = mf.extension

            if ft == "audio":
                has_audio = True
            if ft == "archive":
                has_archive = True

            if ext in DOWNLOAD_TEMP_EXTENSIONS:
                report.incomplete_file_count += 1
                report.download_temp_file_count += 1
                if len(report.examples["incomplete_files"]) < 30:
                    report.examples["incomplete_files"].append({
                        "work": w.folder_name,
                        "file": mf.file_name,
                        "ext": ext,
                    })

            if ft in MEDIA_FILE_TYPES and mf.size == 0:
                report.zero_byte_media_count += 1
                if len(report.examples["zero_byte_media"]) < 30:
                    report.examples["zero_byte_media"].append({
                        "work": w.folder_name,
                        "file": mf.file_name,
                        "type": ft,
                    })

            if ext in SUSPICIOUS_BASE_EXTENSIONS:
                report.suspicious_extension_count += 1
                ext_examples = report.examples["suspicious_extensions"]
                if ext not in ext_examples:
                    ext_examples[ext] = []
                if len(ext_examples[ext]) < 5:
                    ext_examples[ext].append({
                        "work": w.folder_name,
                        "file": mf.file_name,
                    })

        report.audio_count += file_types.get("audio", 0)
        report.video_count += file_types.get("video", 0)
        report.image_count += file_types.get("image", 0)
        report.subtitle_count += file_types.get("subtitle", 0)
        report.text_count += file_types.get("text", 0)
        report.archive_count += file_types.get("archive", 0)
        report.other_count += file_types.get("other", 0)

        if not has_audio and w.folder_status in ("recognized", "duplicate"):
            report.no_audio_work_count += 1
            if has_archive:
                report.no_audio_caution_count += 1
            else:
                report.no_audio_blocked_count += 1
            if len(report.examples["no_audio_works"]) < 30:
                report.examples["no_audio_works"].append({
                    "work": w.folder_name,
                    "has_archive": has_archive,
                    "types": file_types,
                })

        folder_path = Path(w.folder_path)
        try:
            for child in folder_path.iterdir():
                if child.is_dir():
                    for nested in child.iterdir():
                        if nested.is_file():
                            report.nested_file_count += 1
                            if len(report.examples["nested_files"]) < 30:
                                report.examples["nested_files"].append({
                                    "work": w.folder_name,
                                    "subdir": child.name,
                                    "file": nested.name,
                                })
        except OSError:
            pass

    blockers = []
    awarnings = []
    if report.incomplete_file_count > 0:
        blockers.append(
            f"found {report.incomplete_file_count} incomplete/download files"
        )
    if report.zero_byte_media_count > 0:
        blockers.append(
            f"found {report.zero_byte_media_count} zero-byte media files"
        )
    if report.error_count > 0:
        blockers.append(f"scan produced {report.error_count} errors")
    if report.no_audio_blocked_count > 0:
        blockers.append(
            f"{report.no_audio_blocked_count} works have no audio and no archive"
        )

    if report.no_audio_caution_count > 0:
        awarnings.append(
            f"{report.no_audio_caution_count} works have no audio but have archive"
        )
    if report.nested_file_count > 0:
        awarnings.append(
            f"found {report.nested_file_count} files in nested subdirectories"
        )
    if report.unknown_folders_count > 0:
        awarnings.append(
            f"found {report.unknown_folders_count} unknown folders"
        )
    if report.duplicate_code_count > 0:
        awarnings.append(
            f"found {report.duplicate_code_count} duplicate code groups"
        )
    if report.mixed_folder_count > 0:
        awarnings.append(
            f"found {report.mixed_folder_count} mixed folders"
        )
    if report.suspicious_extension_count > 0:
        awarnings.append(
            f"found {report.suspicious_extension_count} files with suspicious extensions"
        )

    if blockers:
        report.readiness_status = "blocked"
    elif awarnings or report.no_audio_caution_count > 0 or report.nested_file_count > 0:
        report.readiness_status = "caution"
    else:
        report.readiness_status = "ready"

    report.blockers = blockers
    report.warnings = awarnings

    return report
