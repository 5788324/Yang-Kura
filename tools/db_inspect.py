from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.db import YangKuraVault


def names(rows):
    return [row["name"] for row in rows]


def main():
    db_path = ROOT / "yang_kura.db"
    vault = YangKuraVault(db_path)
    try:
        vault.init_db()
        tables = vault.execute_read(
            """
            SELECT name FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name;
            """
        )
        indexes = vault.execute_read(
            """
            SELECT name FROM sqlite_master
            WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
            ORDER BY name;
            """
        )
        print(f"DB path: {db_path}")
        print("tables:")
        for table_name in names(tables):
            print(f"- {table_name}")
        print("indexes:")
        for index_name in names(indexes):
            print(f"- {index_name}")
        print(f"integrity_check: {vault.integrity_check()}")
        return 0
    finally:
        vault.close()


if __name__ == "__main__":
    raise SystemExit(main())
