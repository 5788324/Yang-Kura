def get_library_summary(vault):
    works_count = vault.execute_read(
        "SELECT COUNT(*) AS cnt FROM works;"
    )[0]["cnt"]
    counts = {}
    for ft in ("audio", "image", "video", "subtitle", "text", "archive", "other"):
        counts[ft] = vault.execute_read(
            "SELECT COUNT(*) AS cnt FROM media_files WHERE file_type = ?;",
            (ft,),
        )[0]["cnt"]
    duplicate = vault.execute_read(
        "SELECT COUNT(*) AS cnt FROM works WHERE folder_status = 'duplicate';"
    )[0]["cnt"]
    mixed = vault.execute_read(
        "SELECT COUNT(*) AS cnt FROM works WHERE folder_status = 'mixed';"
    )[0]["cnt"]
    scan = vault.execute_read(
        "SELECT COUNT(*) AS cnt FROM scan_runs;"
    )[0]["cnt"]

    return {
        "works_count": works_count,
        "duplicate_count": duplicate,
        "mixed_count": mixed,
        "audio_count": counts["audio"],
        "image_count": counts["image"],
        "video_count": counts["video"],
        "subtitle_count": counts["subtitle"],
        "text_count": counts["text"],
        "archive_count": counts["archive"],
        "other_count": counts["other"],
        "scan_runs": scan,
    }


def list_works(vault, search="", work_type=None, folder_status=None,
               limit=120, offset=0):
    conditions = []
    params = []

    if search:
        conditions.append(
            "(w.work_code_norm LIKE ? OR w.work_code_raw LIKE ? "
            "OR w.folder_name LIKE ? OR w.title LIKE ?)"
        )
        like = f"%{search}%"
        params.extend([like, like, like, like])

    if work_type:
        conditions.append("w.work_type = ?")
        params.append(work_type)

    if folder_status:
        conditions.append("w.folder_status = ?")
        params.append(folder_status)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    COVER_ORDER = (
        "(CASE WHEN file_name LIKE '%cover%' THEN 0 "
        "WHEN file_name LIKE '%jacket%' THEN 1 "
        "WHEN file_name LIKE '%main%' THEN 2 "
        "WHEN file_name LIKE '%thumb%' THEN 3 "
        "ELSE 4 END)"
    )

    sql = (
        "SELECT w.id, w.work_code_raw, w.work_code_norm, w.work_type, w.work_number, "
        "w.title, w.folder_path, w.folder_name, w.folder_status, "
        "w.source_profile, w.detected_by, w.confidence, w.metadata_status, "
        "w.warning_flags, w.created_at, w.updated_at, "
        "COALESCE(mf_counts.media_count, 0) AS media_count, "
        "COALESCE(mf_counts.audio_count, 0) AS audio_count, "
        "COALESCE(mf_counts.image_count, 0) AS image_count, "
        "COALESCE(mf_counts.video_count, 0) AS video_count, "
        "COALESCE(mf_counts.subtitle_count, 0) AS subtitle_count, "
        "COALESCE(mf_counts.text_count, 0) AS text_count, "
        "COALESCE(mf_counts.archive_count, 0) AS archive_count, "
        "COALESCE(mf_counts.other_count, 0) AS other_count, "
        "cover_img.relative_path AS cover_relative_path "
        f"FROM works w "
        "LEFT JOIN ("
        "  SELECT work_id, "
        "    COUNT(*) AS media_count, "
        "    SUM(CASE WHEN file_type = 'audio' THEN 1 ELSE 0 END) AS audio_count, "
        "    SUM(CASE WHEN file_type = 'image' THEN 1 ELSE 0 END) AS image_count, "
        "    SUM(CASE WHEN file_type = 'video' THEN 1 ELSE 0 END) AS video_count, "
        "    SUM(CASE WHEN file_type = 'subtitle' THEN 1 ELSE 0 END) AS subtitle_count, "
        "    SUM(CASE WHEN file_type = 'text' THEN 1 ELSE 0 END) AS text_count, "
        "    SUM(CASE WHEN file_type = 'archive' THEN 1 ELSE 0 END) AS archive_count, "
        "    SUM(CASE WHEN file_type = 'other' THEN 1 ELSE 0 END) AS other_count "
        "  FROM media_files GROUP BY work_id"
        ") mf_counts ON w.id = mf_counts.work_id "
        "LEFT JOIN ("
        "  SELECT work_id, relative_path, "
        "    ROW_NUMBER() OVER (PARTITION BY work_id ORDER BY "
        + COVER_ORDER + ", file_name) AS rn "
        "  FROM media_files WHERE file_type = 'image'"
        ") cover_img ON w.id = cover_img.work_id AND cover_img.rn = 1 "
        f"{where} "
        "ORDER BY w.work_number DESC, w.folder_name ASC "
        "LIMIT ? OFFSET ?"
    )
    params.extend([limit, offset])

    rows = vault.execute_read(sql, params)
    results = []
    for row in rows:
        d = dict(row)
        if d.get("cover_relative_path") and d.get("folder_path"):
            d["cover_path"] = d["folder_path"] + "/" + d["cover_relative_path"]
        else:
            d["cover_path"] = None
        results.append(d)
    return results


def get_work_detail(vault, work_id):
    rows = vault.execute_read(
        "SELECT * FROM works WHERE id = ?;", (work_id,)
    )
    if not rows:
        return None
    return dict(rows[0])


def list_media_files(vault, work_id):
    rows = vault.execute_read(
        """
        SELECT id, folder_path, relative_path, file_name,
               file_type, extension, size, mtime, track_index
        FROM media_files
        WHERE work_id = ?
        ORDER BY file_type, relative_path;
        """,
        (work_id,),
    )
    return [dict(row) for row in rows]
