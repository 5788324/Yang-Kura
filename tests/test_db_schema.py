from core.db.schema import EXPECTED_INDEXES, EXPECTED_TABLES
from core.db.vault import YangKuraVault


def test_init_db_is_idempotent(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        vault.init_db()
        assert vault.integrity_check() == "ok"
    finally:
        vault.close()


def test_expected_tables_exist(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        rows = vault.execute_read(
            """
            SELECT name FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
            """
        )
        assert EXPECTED_TABLES.issubset({row["name"] for row in rows})
    finally:
        vault.close()


def test_expected_indexes_exist(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        rows = vault.execute_read(
            """
            SELECT name FROM sqlite_master
            WHERE type = 'index' AND name NOT LIKE 'sqlite_%';
            """
        )
        assert EXPECTED_INDEXES.issubset({row["name"] for row in rows})
    finally:
        vault.close()
