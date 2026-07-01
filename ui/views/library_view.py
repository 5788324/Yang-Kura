import os
from pathlib import Path

import flet as ft

from core.db import YangKuraVault
from core.library import (
    get_library_summary,
    get_work_detail,
    list_media_files,
    list_works,
)


def _get_db_path():
    env = os.environ.get("YANG_KURA_DB_PATH", "")
    if env:
        return env
    return str(Path(__file__).resolve().parents[2] / "data" / "yang_kura_real.db")


def _format_size(size_bytes):
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"


def _status_badge(status, colors):
    color_map = {
        "recognized": colors["badge_recognized"],
        "duplicate": colors["badge_duplicate"],
        "mixed": colors["badge_mixed"],
    }
    label_map = {
        "recognized": "Recognized",
        "duplicate": "Duplicate",
        "mixed": "Mixed",
    }
    return ft.Container(
        padding=ft.padding.symmetric(horizontal=8, vertical=3),
        border_radius=8,
        bgcolor=color_map.get(status, colors["surface_alt"]),
        content=ft.Text(
            label_map.get(status, status),
            size=11,
            weight=ft.FontWeight.W_600,
            color="#ffffff",
        ),
    )


def _stat_card(icon, label, value, colors, spacing, radius):
    return ft.Container(
        padding=ft.padding.all(spacing["lg"]),
        border_radius=radius["lg"],
        bgcolor=colors["surface"],
        border=ft.border.all(1, colors["border"]),
        content=ft.Row(
            spacing=spacing["md"],
            controls=[
                ft.Icon(name=icon, size=22, color=colors["accent"]),
                ft.Column(
                    spacing=2,
                    controls=[
                        ft.Text(
                            label,
                            size=11,
                            color=colors["text_muted"],
                            weight=ft.FontWeight.W_500,
                        ),
                        ft.Text(
                            str(value),
                            size=22,
                            weight=ft.FontWeight.W_700,
                            color=colors["text"],
                        ),
                    ],
                ),
            ],
        ),
    )


def _drawer_detail(work, media_files, colors, spacing, radius, font_size):
    if not work:
        return ft.Container(
            padding=spacing["xl"],
            content=ft.Text("Select a work to view details", color=colors["text_muted"]),
        )

    type_icons = {
        "audio": ft.icons.MUSIC_NOTE,
        "video": ft.icons.VIDEO_FILE,
        "image": ft.icons.IMAGE,
        "subtitle": ft.icons.SUBTITLES,
        "text": ft.icons.DESCRIPTION,
        "archive": ft.icons.ARCHIVE,
        "other": ft.icons.INSERT_DRIVE_FILE,
    }

    file_rows = []
    for mf in media_files:
        icon = type_icons.get(mf["file_type"], ft.icons.INSERT_DRIVE_FILE)
        file_rows.append(
            ft.Row(
                spacing=spacing["sm"],
                controls=[
                    ft.Icon(name=icon, size=15, color=colors["text_muted"]),
                    ft.Text(
                        mf["relative_path"],
                        size=font_size["xs"],
                        color=colors["text"],
                        expand=True,
                    ),
                    ft.Text(
                        _format_size(mf["size"]),
                        size=font_size["xs"],
                        color=colors["text_dim"],
                    ),
                    ft.Text(
                        mf["extension"],
                        size=font_size["xs"],
                        color=colors["text_muted"],
                    ),
                ],
            )
        )

    return ft.Column(
        spacing=spacing["lg"],
        scroll=ft.ScrollMode.AUTO,
        expand=True,
        controls=[
            ft.Row(
                spacing=spacing["md"],
                controls=[
                    ft.Text(
                        work.get("folder_name", ""),
                        size=font_size["lg"],
                        weight=ft.FontWeight.W_700,
                        color=colors["text"],
                        expand=True,
                    ),
                    _status_badge(work.get("folder_status", ""), colors),
                ],
            ),
            ft.Row(
                spacing=spacing["md"],
                controls=[
                    ft.Text(
                        f"RJ: {work.get('work_code_raw', '-')}",
                        size=font_size["sm"],
                        color=colors["accent"],
                    ),
                    ft.Text(
                        f"{work.get('work_type', '').upper()} #{work.get('work_number', 0)}",
                        size=font_size["sm"],
                        color=colors["text_muted"],
                    ),
                ],
            ),
            ft.Container(height=1, bgcolor=colors["border"]),
            ft.Text(
                f"Media Files ({len(media_files)})",
                size=font_size["sm"],
                weight=ft.FontWeight.W_600,
                color=colors["text"],
            ),
            ft.Container(
                expand=True,
                content=ft.Column(
                    spacing=spacing["xs"],
                    controls=file_rows,
                    scroll=ft.ScrollMode.AUTO,
                ),
            ),
        ],
    )


class LibraryView:
    def __init__(self, page: ft.Page, colors, spacing, radius, font_size):
        self.page = page
        self.colors = colors
        self.spacing = spacing
        self.radius = radius
        self.font_size = font_size

        self.vault = None
        self.db_found = False
        self.db_error = ""

        self.summary_data = {}
        self.works_data = []
        self.current_work_id = None

        self.search_field = ft.TextField(
            hint_text="Search works...",
            border_radius=self.radius["md"],
            bgcolor=self.colors["surface"],
            border_color=self.colors["border"],
            text_size=self.font_size["sm"],
            cursor_color=self.colors["accent"],
            color=self.colors["text"],
            hint_style=ft.TextStyle(color=self.colors["text_dim"]),
            on_submit=lambda e: self._do_search(),
            expand=True,
        )

        self.type_filter = ft.Dropdown(
            hint_text="Type",
            options=[
                ft.dropdown.Option("", "All Types"),
                ft.dropdown.Option("rj", "RJ"),
                ft.dropdown.Option("bj", "BJ"),
                ft.dropdown.Option("vj", "VJ"),
            ],
            border_radius=self.radius["md"],
            bgcolor=self.colors["surface"],
            border_color=self.colors["border"],
            color=self.colors["text"],
            text_size=self.font_size["sm"],
            on_change=lambda e: self._do_search(),
            width=120,
        )

        self.status_filter = ft.Dropdown(
            hint_text="Status",
            options=[
                ft.dropdown.Option("", "All"),
                ft.dropdown.Option("recognized", "Recognized"),
                ft.dropdown.Option("duplicate", "Duplicate"),
                ft.dropdown.Option("mixed", "Mixed"),
            ],
            border_radius=self.radius["md"],
            bgcolor=self.colors["surface"],
            border_color=self.colors["border"],
            color=self.colors["text"],
            text_size=self.font_size["sm"],
            on_change=lambda e: self._do_search(),
            width=130,
        )

        self.work_list = ft.ListView(
            expand=True,
            spacing=self.spacing["sm"],
            padding=ft.padding.only(top=self.spacing["md"]),
        )

        self.detail_panel = ft.Container(
            width=380,
            padding=self.spacing["xl"],
            bgcolor=self.colors["surface"],
            border=ft.border.only(left=ft.BorderSide(1, self.colors["border"])),
            content=ft.Text(
                "Select a work to view details",
                color=self.colors["text_muted"],
                size=self.font_size["sm"],
            ),
        )

        self.init_db()

    def init_db(self):
        db_path = _get_db_path()
        if not Path(db_path).exists():
            self.db_found = False
            self.db_error = f"DB not found: {db_path}"
            return

        try:
            self.vault = YangKuraVault(db_path)
            self.vault.connect()
            self.vault.execute_read("SELECT COUNT(*) AS cnt FROM works;")
            self.db_found = True
            self._do_search()
        except Exception as e:
            self.db_found = False
            self.db_error = f"DB error: {e}"

    def _do_search(self):
        if not self.vault:
            return

        try:
            self.summary_data = get_library_summary(self.vault)
        except Exception:
            self.summary_data = {}

        work_type = self.type_filter.value
        if work_type == "":
            work_type = None
        folder_status = self.status_filter.value
        if folder_status == "":
            folder_status = None

        try:
            self.works_data = list_works(
                self.vault,
                search=self.search_field.value or "",
                work_type=work_type,
                folder_status=folder_status,
                limit=200,
            )
        except Exception:
            self.works_data = []

        self._rebuild()

    def _select_work(self, work_id):
        self.current_work_id = work_id
        self._rebuild()

    def _rebuild(self):
        works = self.works_data
        s = self.summary_data
        c = self.colors
        sp = self.spacing
        r = self.radius
        fs = self.font_size

        stats_row = ft.Row(
            wrap=True,
            spacing=sp["md"],
            run_spacing=sp["sm"],
            controls=[
                _stat_card(ft.icons.LIBRARY_MUSIC, "Works", s.get("works_count", 0), c, sp, r),
                _stat_card(ft.icons.MUSIC_NOTE, "Audio", s.get("audio_count", 0), c, sp, r),
                _stat_card(ft.icons.IMAGE, "Images", s.get("image_count", 0), c, sp, r),
                _stat_card(ft.icons.VIDEO_FILE, "Video", s.get("video_count", 0), c, sp, r),
                _stat_card(ft.icons.SUBTITLES, "Subtitle", s.get("subtitle_count", 0), c, sp, r),
                _stat_card(ft.icons.WARNING_AMBER, "Dup/Mixed",
                           f"{s.get('duplicate_count', 0)}/{s.get('mixed_count', 0)}", c, sp, r),
            ],
        )

        filter_row = ft.Row(
            spacing=sp["sm"],
            controls=[
                self.search_field,
                self.type_filter,
                self.status_filter,
            ],
        )

        work_cards = []
        type_icons_map = {
            "audio": ft.icons.MUSIC_NOTE,
            "video": ft.icons.VIDEO_FILE,
            "image": ft.icons.IMAGE,
            "subtitle": ft.icons.SUBTITLES,
            "text": ft.icons.DESCRIPTION,
            "archive": ft.icons.ARCHIVE,
        }

        for w in works:
            wid = w["id"]
            selected = wid == self.current_work_id
            border_side = ft.BorderSide(
                2, c["accent"] if selected else c["border"]
            )

            work_cards.append(
                ft.Container(
                    padding=sp["lg"],
                    border_radius=r["lg"],
                    bgcolor=c["surface"],
                    border=ft.border.all(1, border_side),
                    ink=True,
                    on_click=lambda e, work_id=wid: self._select_work(work_id),
                    content=ft.Column(
                        spacing=sp["sm"],
                        controls=[
                            ft.Row(
                                spacing=sp["md"],
                                controls=[
                                    ft.Text(
                                        w.get("folder_name", "-"),
                                        size=fs["md"],
                                        weight=ft.FontWeight.W_600,
                                        color=c["text"],
                                        expand=True,
                                        max_lines=1,
                                        overflow=ft.TextOverflow.ELLIPSIS,
                                    ),
                                    _status_badge(w.get("folder_status", ""), c),
                                ],
                            ),
                            ft.Row(
                                spacing=sp["md"],
                                controls=[
                                    ft.Row(
                                        spacing=4,
                                        controls=[
                                            ft.Icon(name=type_icons_map.get("audio", ft.icons.MUSIC_NOTE), size=13, color=c["accent"]),
                                            ft.Text(f"{w.get('work_code_raw', '-')}", size=fs["xs"], color=c["accent"], weight=ft.FontWeight.W_500),
                                        ],
                                    ),
                                    ft.Text(
                                        f"{w.get('work_type', '').upper()} #{w.get('work_number', 0)}",
                                        size=fs["xs"],
                                        color=c["text_muted"],
                                    ),
                                ],
                            ),
                        ],
                    ),
                )
            )

        self.work_list.controls = work_cards

        media_files = []
        if self.current_work_id and self.vault:
            try:
                media_files = list_media_files(self.vault, self.current_work_id)
            except Exception:
                pass

        work_detail = None
        if self.current_work_id and self.vault:
            try:
                work_detail = get_work_detail(self.vault, self.current_work_id)
            except Exception:
                pass

        self.detail_panel.content = _drawer_detail(
            work_detail, media_files, c, sp, r, fs
        )
        self.detail_panel.visible = True

        if works:
            self.content = ft.Column(
                spacing=sp["xl"],
                expand=True,
                scroll=ft.ScrollMode.AUTO,
                controls=[
                    ft.Text("Library", size=fs["xl"], weight=ft.FontWeight.W_700,
                            color=c["text"]),
                    stats_row,
                    filter_row,
                    ft.Container(
                        height=1,
                        bgcolor=c["border"],
                    ),
                    self.work_list,
                ],
            )
        elif not self.db_found:
            self.content = ft.Container(
                expand=True,
                alignment=ft.alignment.center,
                content=ft.Column(
                    alignment=ft.MainAxisAlignment.CENTER,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=sp["lg"],
                    controls=[
                        ft.Icon(name=ft.icons.ERROR_OUTLINE, size=48, color=c["text_dim"]),
                        ft.Text("Database not found", size=fs["xl"], weight=ft.FontWeight.W_700, color=c["text"]),
                        ft.Text(self.db_error, size=fs["sm"], color=c["text_muted"]),
                        ft.Text(
                            "Set YANG_KURA_DB_PATH environment variable or\nplace yang_kura_real.db in data/",
                            size=fs["xs"],
                            color=c["text_dim"],
                            text_align=ft.TextAlign.CENTER,
                        ),
                    ],
                ),
            )
            self.detail_panel.visible = False
        else:
            self.content = ft.Container(
                expand=True,
                alignment=ft.alignment.center,
                content=ft.Column(
                    alignment=ft.MainAxisAlignment.CENTER,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=sp["md"],
                    controls=[
                        ft.Icon(name=ft.icons.LIBRARY_MUSIC, size=48, color=c["text_dim"]),
                        ft.Text("No works found", size=fs["lg"], color=c["text_muted"]),
                    ],
                ),
            )
            self.detail_panel.visible = False

        self.page.update()

    def build(self):
        if not hasattr(self, "content"):
            self.content = ft.Container(
                expand=True,
                alignment=ft.alignment.center,
                content=ft.ProgressRing(color=self.colors["accent"]),
            )
        self.detail_panel.visible = bool(self.db_found and self.works_data)

        return ft.Row(
            expand=True,
            controls=[
                ft.Container(
                    expand=True,
                    padding=ft.padding.all(self.spacing["xl"]),
                    content=self.content,
                ),
                self.detail_panel,
            ],
        )
