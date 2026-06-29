from core.db.vault import YangKuraVault


def test_settings_get_set(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        assert vault.get_setting("theme", "system") == "system"
        vault.set_setting("theme", "light")
        assert vault.get_setting("theme") == "light"
        vault.set_setting("theme", "dark")
        assert vault.get_setting("theme") == "dark"
    finally:
        vault.close()


def test_execute_write_rolls_back_on_error(tmp_path):
    vault = YangKuraVault(tmp_path / "test.db")
    try:
        vault.init_db()
        try:
            with vault.transaction() as connection:
                connection.execute(
                    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?);",
                    ("library_root", "E:\\arsm", "now"),
                )
                connection.execute("INSERT INTO missing_table VALUES (1);")
        except Exception:
            pass

        assert vault.get_setting("library_root") is None
    finally:
        vault.close()
