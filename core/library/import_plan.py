from dataclasses import dataclass, field


@dataclass
class WorkToUpsert:
    work_code: str
    work_code_raw: str
    work_code_norm: str
    work_type: str
    work_number: int
    folder_path: str
    folder_name: str
    folder_status: str
    source_profile: str = "local_scan"
    detected_by: str = ""
    confidence: float = 0.0
    warning_flags: str = ""


@dataclass
class MediaFileToUpsert:
    folder_path: str
    relative_path: str
    file_name: str
    file_type: str
    extension: str
    size: int
    mtime: float


@dataclass
class UnknownFolderToUpsert:
    folder_path: str
    folder_name: str
    reason: str
    audio_count: int = 0
    image_count: int = 0
    subtitle_count: int = 0
    text_count: int = 0
    video_count: int = 0
    archive_count: int = 0
    other_count: int = 0
    total_files: int = 0
    total_size: int = 0


@dataclass
class ImportPlan:
    works_to_upsert: list = field(default_factory=list)
    media_files_to_upsert: list = field(default_factory=list)
    unknown_folders_to_upsert: list = field(default_factory=list)
    scan_run_summary: dict = field(default_factory=dict)
    warnings: list = field(default_factory=list)
    errors: list = field(default_factory=list)
    dry_run: bool = True
