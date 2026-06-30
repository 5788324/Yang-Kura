import shutil
from datetime import datetime, timezone
from pathlib import Path


def make_backup_path(db_path, backup_dir):
    db = Path(db_path)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%fZ")
    name = db.name
    backup_name = f"{name}.backup-{ts}"
    return Path(backup_dir) / backup_name


def backup_db_file(db_path, backup_dir, confirm=False):
    db = Path(db_path)

    if not db.exists():
        return {"ok": False, "error": f"db_path does not exist: {db_path}"}

    backup_path = make_backup_path(db_path, backup_dir)

    if not confirm:
        return {
            "ok": False,
            "preview": True,
            "source": str(db),
            "target": str(backup_path),
            "message": "confirm=False, backup not executed",
        }

    Path(backup_dir).mkdir(parents=True, exist_ok=True)
    shutil.copy2(db, backup_path)

    return {
        "ok": True,
        "source": str(db),
        "target": str(backup_path),
        "size": backup_path.stat().st_size,
    }
