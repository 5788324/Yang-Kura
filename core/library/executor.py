from dataclasses import dataclass, field
from datetime import datetime, timezone

from .import_plan import ImportPlan


@dataclass
class ExecuteResult:
    works_upserted: int = 0
    media_files_upserted: int = 0
    unknown_folders_upserted: int = 0
    scan_run_inserted: bool = False
    errors: list = field(default_factory=list)


def execute_import_plan(vault, plan: ImportPlan) -> ExecuteResult:
    result = ExecuteResult()

    with vault.transaction() as conn:
        now = datetime.now(timezone.utc).isoformat()

        for w in plan.works_to_upsert:
            conn.execute(
                """
                INSERT INTO works (
                    work_code, work_code_raw, work_code_norm, work_type, work_number,
                    title, folder_path, folder_name, folder_status,
                    source_profile, detected_by, confidence, metadata_status,
                    warning_flags, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'none', ?, ?, ?)
                ON CONFLICT(folder_path) DO UPDATE SET
                    work_code = excluded.work_code,
                    work_code_raw = excluded.work_code_raw,
                    work_code_norm = excluded.work_code_norm,
                    work_type = excluded.work_type,
                    work_number = excluded.work_number,
                    title = excluded.title,
                    folder_name = excluded.folder_name,
                    folder_status = excluded.folder_status,
                    source_profile = excluded.source_profile,
                    detected_by = excluded.detected_by,
                    confidence = excluded.confidence,
                    warning_flags = excluded.warning_flags,
                    updated_at = excluded.updated_at;
                """,
                (
                    w.work_code,
                    w.work_code_raw,
                    w.work_code_norm,
                    w.work_type,
                    w.work_number,
                    w.folder_name,
                    w.folder_path,
                    w.folder_name,
                    w.folder_status,
                    w.source_profile,
                    w.detected_by,
                    w.confidence,
                    w.warning_flags,
                    now,
                    now,
                ),
            )
            result.works_upserted += 1

        work_id_map = {}
        for w in plan.works_to_upsert:
            rows = conn.execute(
                "SELECT id FROM works WHERE folder_path = ?;", (w.folder_path,)
            ).fetchall()
            if rows:
                work_id_map[w.folder_path] = rows[0][0]

        for mf in plan.media_files_to_upsert:
            work_id = work_id_map.get(mf.folder_path)
            if work_id is None:
                result.errors.append(
                    f"no work found for folder_path: {mf.folder_path}"
                )
                continue
            conn.execute(
                """
                INSERT INTO media_files (
                    work_id, folder_path, relative_path, file_name, file_type,
                    extension, size, mtime, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(folder_path, relative_path) DO UPDATE SET
                    work_id = excluded.work_id,
                    file_name = excluded.file_name,
                    file_type = excluded.file_type,
                    extension = excluded.extension,
                    size = excluded.size,
                    mtime = excluded.mtime,
                    updated_at = excluded.updated_at;
                """,
                (
                    work_id,
                    mf.folder_path,
                    mf.relative_path,
                    mf.file_name,
                    mf.file_type,
                    mf.extension,
                    mf.size,
                    mf.mtime,
                    now,
                    now,
                ),
            )
            result.media_files_upserted += 1

        for uf in plan.unknown_folders_to_upsert:
            conn.execute(
                """
                INSERT INTO unknown_folders (
                    folder_path, folder_name, reason,
                    audio_count, image_count, subtitle_count, text_count,
                    video_count, archive_count, other_count,
                    total_files, total_size,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(folder_path) DO UPDATE SET
                    folder_name = excluded.folder_name,
                    reason = excluded.reason,
                    audio_count = excluded.audio_count,
                    image_count = excluded.image_count,
                    subtitle_count = excluded.subtitle_count,
                    text_count = excluded.text_count,
                    video_count = excluded.video_count,
                    archive_count = excluded.archive_count,
                    other_count = excluded.other_count,
                    total_files = excluded.total_files,
                    total_size = excluded.total_size,
                    updated_at = excluded.updated_at;
                """,
                (
                    uf.folder_path,
                    uf.folder_name,
                    uf.reason,
                    uf.audio_count,
                    uf.image_count,
                    uf.subtitle_count,
                    uf.text_count,
                    uf.video_count,
                    uf.archive_count,
                    uf.other_count,
                    uf.total_files,
                    uf.total_size,
                    now,
                    now,
                ),
            )
            result.unknown_folders_upserted += 1

        summary = plan.scan_run_summary
        conn.execute(
            """
            INSERT INTO scan_runs (
                root_path, started_at, finished_at, status,
                total_dirs, recognized_works, unknown_folders,
                duplicate_rj_count, mixed_folder_count, media_files,
                warnings, errors
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                summary.get("root_path", ""),
                now,
                now,
                "executed",
                summary.get("total_dirs", 0),
                summary.get("recognized_works", 0),
                summary.get("unknown_folders", 0),
                summary.get("duplicate_rj_count", 0),
                summary.get("mixed_folder_count", 0),
                summary.get("media_files", 0),
                summary.get("warnings", ""),
                summary.get("errors", ""),
            ),
        )
        result.scan_run_inserted = True

    return result
