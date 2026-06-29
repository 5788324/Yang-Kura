from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.db import YangKuraVault


def main():
    db_path = ROOT / "yang_kura.db"
    vault = YangKuraVault(db_path)
    try:
        vault.init_db()
        result = vault.integrity_check()
        print(f"DB path: {db_path}")
        print(f"integrity_check: {result}")
        return 0 if result == "ok" else 1
    finally:
        vault.close()


if __name__ == "__main__":
    raise SystemExit(main())
