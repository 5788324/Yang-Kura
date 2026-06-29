from .schema import INDEX_STATEMENTS, SCHEMA_STATEMENTS


def _column_exists(connection, table, column):
    rows = connection.execute(f"PRAGMA table_info({table});").fetchall()
    return any(row[1] == column for row in rows)


def _add_column_if_not_exists(connection, table, column, col_def):
    if not _column_exists(connection, table, column):
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_def};")


def run_migrations(connection):
    _add_column_if_not_exists(connection, "works", "work_code_raw", "TEXT")
    _add_column_if_not_exists(connection, "works", "work_code_norm", "TEXT")
    _add_column_if_not_exists(connection, "works", "work_type", "TEXT")
    _add_column_if_not_exists(connection, "works", "work_number", "INTEGER")
    _add_column_if_not_exists(
        connection, "works", "folder_status", "TEXT DEFAULT 'recognized'"
    )

    _add_column_if_not_exists(connection, "unknown_folders", "video_count", "INTEGER DEFAULT 0")
    _add_column_if_not_exists(connection, "unknown_folders", "archive_count", "INTEGER DEFAULT 0")
    _add_column_if_not_exists(connection, "unknown_folders", "other_count", "INTEGER DEFAULT 0")
    _add_column_if_not_exists(connection, "unknown_folders", "total_files", "INTEGER DEFAULT 0")


def _drop_non_unique_media_file_path_index(connection):
    rows = connection.execute("PRAGMA index_list('media_files');").fetchall()
    for row in rows:
        index_name = row[1]
        is_unique = bool(row[2])
        if index_name == "idx_media_files_unique_path" and not is_unique:
            connection.execute("DROP INDEX idx_media_files_unique_path;")

def initialize_schema(connection):
    connection.execute("PRAGMA foreign_keys = ON;")
    for statement in SCHEMA_STATEMENTS:
        connection.execute(statement)
    run_migrations(connection)
    _drop_non_unique_media_file_path_index(connection)
    for statement in INDEX_STATEMENTS:
        connection.execute(statement)
