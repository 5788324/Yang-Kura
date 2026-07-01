def get_library_summary(vault):
    works_count = len(vault.execute_read("SELECT id FROM works;"))
    audio = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'audio';
        """
    )[0]["cnt"]
    image = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'image';
        """
    )[0]["cnt"]
    video = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'video';
        """
    )[0]["cnt"]
    subtitle = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'subtitle';
        """
    )[0]["cnt"]
    text_f = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'text';
        """
    )[0]["cnt"]
    archive = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'archive';
        """
    )[0]["cnt"]
    other = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM media_files
        WHERE file_type = 'other';
        """
    )[0]["cnt"]
    duplicate = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM works
        WHERE folder_status = 'duplicate';
        """
    )[0]["cnt"]
    mixed = vault.execute_read(
        """
        SELECT COUNT(*) AS cnt FROM works
        WHERE folder_status = 'mixed';
        """
    )[0]["cnt"]
    scan = vault.execute_read(
        "SELECT COUNT(*) AS cnt FROM scan_runs;"
    )[0]["cnt"]

    return {
        "works_count": works_count,
        "duplicate_count": duplicate,
        "mixed_count": mixed,
        "audio_count": audio,
        "image_count": image,
        "video_count": video,
        "subtitle_count": subtitle,
        "text_count": text_f,
        "archive_count": archive,
        "other_count": other,
        "scan_runs": scan,
    }


def list_works(vault, search="", work_type=None, folder_status=None,
               limit=100, offset=0):
    conditions = []
    params = []

    if search:
        conditions.append(
            "(work_code_norm LIKE ? OR work_code_raw LIKE ? "
            "OR folder_name LIKE ? OR title LIKE ?)"
        )
        like = f"%{search}%"
        params.extend([like, like, like, like])

    if work_type:
        conditions.append("work_type = ?")
        params.append(work_type)

    if folder_status:
        conditions.append("folder_status = ?")
        params.append(folder_status)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    sql = (
        "SELECT id, work_code_raw, work_code_norm, work_type, work_number, "
        "title, folder_path, folder_name, folder_status, "
        "source_profile, detected_by, confidence, metadata_status, "
        "warning_flags, created_at, updated_at "
        f"FROM works {where} "
        "ORDER BY work_number DESC, folder_name ASC "
        "LIMIT ? OFFSET ?"
    )
    params.extend([limit, offset])

    rows = vault.execute_read(sql, params)
    return [dict(row) for row in rows]


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
