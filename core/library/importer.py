from core.scanner.result import ScanResult

from .import_plan import (
    ImportPlan,
    MediaFileToUpsert,
    UnknownFolderToUpsert,
    WorkToUpsert,
)


def build_import_plan(scan_result: ScanResult) -> ImportPlan:
    plan = ImportPlan(dry_run=True)

    plan.warnings = list(scan_result.warnings)
    plan.errors = list(scan_result.errors)

    for work in scan_result.works:
        warning_flags = ""
        if work.folder_status == "duplicate":
            warning_flags = "duplicate_rj"
        elif work.folder_status == "mixed":
            warning_flags = "mixed_folder"

        work_to_upsert = WorkToUpsert(
            work_code=work.work_code_norm,
            work_code_raw=work.work_code_raw,
            work_code_norm=work.work_code_norm,
            work_type=work.work_type,
            work_number=work.work_number,
            folder_path=work.folder_path,
            folder_name=work.folder_name,
            folder_status=work.folder_status,
            detected_by=work.detected_by,
            confidence=work.confidence,
            warning_flags=warning_flags,
        )
        plan.works_to_upsert.append(work_to_upsert)

        for mf in work.media_files:
            plan.media_files_to_upsert.append(
                MediaFileToUpsert(
                    folder_path=mf.folder_path,
                    relative_path=mf.relative_path,
                    file_name=mf.file_name,
                    file_type=mf.file_type,
                    extension=mf.extension,
                    size=mf.size,
                    mtime=mf.mtime,
                )
            )

    for uf in scan_result.unknown_folders:
        plan.unknown_folders_to_upsert.append(
            UnknownFolderToUpsert(
                folder_path=uf.folder_path,
                folder_name=uf.folder_name,
                reason=uf.reason,
                audio_count=uf.audio_count,
                image_count=uf.image_count,
                subtitle_count=uf.subtitle_count,
                text_count=uf.text_count,
                video_count=uf.video_count,
                archive_count=uf.archive_count,
                other_count=uf.other_count,
                total_files=uf.total_files,
                total_size=uf.total_size,
            )
        )

    plan.scan_run_summary = {
        "root_path": scan_result.root_path,
        "status": "planned",
        "total_dirs": scan_result.total_dirs,
        "recognized_works": sum(
            1 for w in scan_result.works if w.folder_status == "recognized"
        ),
        "unknown_folders": len(scan_result.unknown_folders),
        "duplicate_rj_count": scan_result.duplicate_code_count,
        "mixed_folder_count": scan_result.mixed_folder_count,
        "media_files": scan_result.media_files_count,
        "warnings": "\n".join(scan_result.warnings),
        "errors": "\n".join(scan_result.errors),
    }

    return plan
