from pathlib import Path

from .parser import classify_file, parse_work_codes
from .result import MediaFileEntry, ScanResult, UnknownFolderEntry, WorkEntry


def _scan_files(dir_path):
    files = []
    try:
        for entry in dir_path.iterdir():
            if entry.is_file():
                suffix = entry.suffix.lower()
                file_type = classify_file(suffix)
                try:
                    stat = entry.stat()
                    size = stat.st_size
                    mtime = stat.st_mtime
                except OSError:
                    size = 0
                    mtime = 0
                files.append(
                    MediaFileEntry(
                        folder_path=str(dir_path),
                        relative_path=entry.name,
                        file_name=entry.name,
                        file_type=file_type,
                        extension=suffix,
                        size=size,
                        mtime=mtime,
                    )
                )
    except OSError:
        pass
    return files


def _scan_files_recursive(dir_path):
    files = []
    work_dir = Path(dir_path).resolve()
    try:
        for entry in sorted(work_dir.rglob("*"), key=lambda p: str(p).lower()):
            if entry.is_file():
                suffix = entry.suffix.lower()
                file_type = classify_file(suffix)
                try:
                    stat = entry.stat()
                    size = stat.st_size
                    mtime = stat.st_mtime
                except OSError:
                    size = 0
                    mtime = 0
                rel = str(entry.relative_to(work_dir))
                files.append(
                    MediaFileEntry(
                        folder_path=str(work_dir),
                        relative_path=rel,
                        file_name=entry.name,
                        file_type=file_type,
                        extension=suffix,
                        size=size,
                        mtime=mtime,
                    )
                )
    except OSError:
        pass
    return files


def _build_unknown(dir_path, folder_name, reason, media_files):
    counts = {}
    total_size = 0
    for mf in media_files:
        counts[mf.file_type] = counts.get(mf.file_type, 0) + 1
        total_size += mf.size

    return UnknownFolderEntry(
        folder_path=str(dir_path),
        folder_name=folder_name,
        reason=reason,
        audio_count=counts.get("audio", 0),
        image_count=counts.get("image", 0),
        subtitle_count=counts.get("subtitle", 0),
        text_count=counts.get("text", 0),
        video_count=counts.get("video", 0),
        archive_count=counts.get("archive", 0),
        other_count=counts.get("other", 0),
        total_files=len(media_files),
        total_size=total_size,
    )


def scan_library_root(root_path, recursive=False):
    root = Path(root_path).resolve()
    result = ScanResult(root_path=str(root), total_dirs=0)

    try:
        entries = sorted(
            [e for e in root.iterdir() if e.is_dir()],
            key=lambda e: e.name.lower(),
        )
    except OSError:
        result.errors.append(f"cannot read root_path: {root}")
        return result

    result.total_dirs = len(entries)

    code_to_entries = {}
    mixed_entries = []
    unknown_entries = []
    skipped_empty = 0

    for dir_path in entries:
        folder_name = dir_path.name
        codes = parse_work_codes(folder_name)
        if recursive:
            media_files = _scan_files_recursive(dir_path)
        else:
            media_files = _scan_files(dir_path)

        file_code_norms = set()
        for mf in media_files:
            for fc in parse_work_codes(mf.file_name):
                file_code_norms.add(fc["norm"])

        code_norms_from_folder = {c["norm"] for c in codes}
        all_code_norms = code_norms_from_folder | file_code_norms

        if not all_code_norms:
            if media_files:
                unknown_entries.append(
                    _build_unknown(dir_path, folder_name, "no_work_code", media_files)
                )
            else:
                skipped_empty += 1
            continue

        if len(all_code_norms) > 1:
            sorted_codes = sorted(all_code_norms)
            entry = WorkEntry(
                work_code_raw=",".join(sorted_codes),
                work_code_norm=",".join(sorted_codes),
                work_type="mixed",
                work_number=0,
                folder_path=str(dir_path),
                folder_name=folder_name,
                folder_status="mixed",
                media_files=media_files,
                confidence=0.5,
                detected_by="folder_name",
            )
            mixed_entries.append(entry)
            result.mixed_folder_count += 1
            result.warnings.append(
                f"mixed_rj_folder: {folder_name} -> {sorted_codes}"
            )
            continue

        primary_code_norm = next(iter(all_code_norms))
        matched_code = None
        for c in codes:
            if c["norm"] == primary_code_norm:
                matched_code = c
                break
        if matched_code is None:
            for mf in media_files:
                for fc in parse_work_codes(mf.file_name):
                    if fc["norm"] == primary_code_norm:
                        matched_code = fc
                        break
                if matched_code:
                    break

        if matched_code is None:
            primary_type = primary_code_norm[:2]
            primary_number = int(primary_code_norm[2:])
            matched_code = {
                "raw": primary_code_norm.upper(),
                "norm": primary_code_norm,
                "type": primary_type,
                "number": primary_number,
            }

        entry = WorkEntry(
            work_code_raw=matched_code["raw"],
            work_code_norm=matched_code["norm"],
            work_type=matched_code["type"],
            work_number=matched_code["number"],
            folder_path=str(dir_path),
            folder_name=folder_name,
            folder_status="recognized",
            media_files=media_files,
            detected_by="folder_name" if codes else "file_name",
        )
        code_to_entries.setdefault(primary_code_norm, []).append(entry)

    duplicate_codes = {
        norm: entries_list
        for norm, entries_list in code_to_entries.items()
        if len(entries_list) > 1
    }
    for norm, entries_list in duplicate_codes.items():
        result.duplicate_code_count += 1
        result.warnings.append(
            f"duplicate_rj: {norm} found in {len(entries_list)} folders: "
            + ", ".join(e.folder_name for e in entries_list)
        )
        for entry in entries_list:
            entry.folder_status = "duplicate"

    result.works = mixed_entries + [
        entry
        for entries_list in code_to_entries.values()
        for entry in entries_list
    ]
    result.unknown_folders = unknown_entries

    if skipped_empty > 0:
        result.warnings.append(f"skipped {skipped_empty} empty directories")

    return result
