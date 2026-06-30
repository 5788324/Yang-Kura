from dataclasses import dataclass, field

from .import_plan import ImportPlan


@dataclass
class ImportPreview:
    dry_run: bool = True
    db_write: bool = False
    works_to_upsert_count: int = 0
    media_files_to_upsert_count: int = 0
    unknown_folders_to_upsert_count: int = 0
    duplicate_count: int = 0
    mixed_count: int = 0
    warning_count: int = 0
    error_count: int = 0
    estimated_tables_affected: list = field(
        default_factory=lambda: [
            "works",
            "media_files",
            "unknown_folders",
            "scan_runs",
        ]
    )
    risk_level: str = "low"
    blockers: list = field(default_factory=list)
    requires_backup: bool = True
    requires_confirmation: bool = True


def build_import_preview(plan: ImportPlan) -> ImportPreview:
    preview = ImportPreview(
        dry_run=plan.dry_run,
        db_write=False,
        works_to_upsert_count=len(plan.works_to_upsert),
        media_files_to_upsert_count=len(plan.media_files_to_upsert),
        unknown_folders_to_upsert_count=len(plan.unknown_folders_to_upsert),
    )

    for w in plan.works_to_upsert:
        if w.folder_status == "duplicate":
            preview.duplicate_count += 1
        elif w.folder_status == "mixed":
            preview.mixed_count += 1

    preview.warning_count = len(plan.warnings)
    preview.error_count = len(plan.errors)

    blockers = []
    if plan.errors:
        blockers.append("plan has errors")
    if not plan.dry_run:
        blockers.append("plan.dry_run is not True")
    preview.blockers = blockers

    if blockers:
        preview.risk_level = "high"
    elif (
        preview.unknown_folders_to_upsert_count > 0
        or preview.duplicate_count > 0
        or preview.mixed_count > 0
    ):
        preview.risk_level = "medium"
    else:
        preview.risk_level = "low"

    return preview
