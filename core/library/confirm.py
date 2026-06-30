def build_confirmation_phrase(root_path, db_path, works_count, media_count):
    return (
        f"I confirm: write {works_count} works + {media_count} media from "
        f"'{root_path}' to '{db_path}'"
    )


def validate_confirmation(input_text, expected_phrase):
    if input_text is None:
        return False
    return input_text.strip() == expected_phrase.strip()


def can_execute_real_import(preview, backup_result, confirmation_ok):
    if preview.db_write is not False:
        return False, "db_write must be False in preview"
    if preview.blockers:
        return False, f"blockers not empty: {preview.blockers}"
    if preview.risk_level != "low":
        return False, f"risk_level must be low, got {preview.risk_level}"
    if not backup_result.get("ok"):
        return False, f"backup failed: {backup_result.get('error', 'unknown')}"
    if not confirmation_ok:
        return False, "confirmation not given or invalid"
    return True, "ready"
