from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
import sqlite3

from .migrations import initialize_schema


class YangKuraVault:
    def __init__(self, db_path):
        self.db_path = Path(db_path)
        self._connection = None

    def connect(self):
        if self._connection is None:
            if self.db_path.parent != Path("."):
                self.db_path.parent.mkdir(parents=True, exist_ok=True)
            self._connection = sqlite3.connect(self.db_path)
            self._connection.row_factory = sqlite3.Row
            self._connection.execute("PRAGMA foreign_keys = ON;")
        return self._connection

    def close(self):
        if self._connection is not None:
            self._connection.close()
            self._connection = None

    def init_db(self):
        connection = self.connect()
        with self.transaction():
            initialize_schema(connection)

    def integrity_check(self):
        row = self.execute_read("PRAGMA integrity_check;")[0]
        result = row[0]
        return "ok" if result == "ok" else f"error: {result}"

    def execute_read(self, sql, params=None):
        cursor = self.connect().execute(sql, params or ())
        return cursor.fetchall()

    def execute_write(self, sql, params=None):
        connection = self.connect()
        try:
            cursor = connection.execute(sql, params or ())
            connection.commit()
            return cursor.rowcount
        except Exception:
            connection.rollback()
            raise

    def execute_many(self, sql, seq_of_params):
        connection = self.connect()
        try:
            cursor = connection.executemany(sql, seq_of_params)
            connection.commit()
            return cursor.rowcount
        except Exception:
            connection.rollback()
            raise

    @contextmanager
    def transaction(self):
        connection = self.connect()
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise

    def get_setting(self, key, default=None):
        rows = self.execute_read("SELECT value FROM settings WHERE key = ?;", (key,))
        if not rows:
            return default
        return rows[0]["value"]

    def set_setting(self, key, value):
        updated_at = datetime.now(timezone.utc).isoformat()
        self.execute_write(
            """
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                updated_at = excluded.updated_at;
            """,
            (key, value, updated_at),
        )
