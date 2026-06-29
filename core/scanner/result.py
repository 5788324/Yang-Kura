from dataclasses import dataclass, field


@dataclass
class MediaFileEntry:
    folder_path: str
    relative_path: str
    file_name: str
    file_type: str
    extension: str
    size: int
    mtime: float


@dataclass
class WorkEntry:
    work_code_raw: str
    work_code_norm: str
    work_type: str
    work_number: int
    folder_path: str
    folder_name: str
    folder_status: str
    media_files: list = field(default_factory=list)
    confidence: float = 1.0
    detected_by: str = "folder_name"


@dataclass
class UnknownFolderEntry:
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
    candidate_codes: list = field(default_factory=list)


@dataclass
class ScanResult:
    root_path: str
    total_dirs: int
    works: list = field(default_factory=list)
    unknown_folders: list = field(default_factory=list)
    duplicate_code_count: int = 0
    mixed_folder_count: int = 0
    warnings: list = field(default_factory=list)
    errors: list = field(default_factory=list)

    @property
    def media_files_count(self):
        return sum(len(w.media_files) for w in self.works)
