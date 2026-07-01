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


def _format_count(n):
    if n >= 10000:
        return f"{n / 1000:.0f}k"
    return str(n)


def _status_badge(status, c):
    color_map = {
        "recognized": c["badge_recognized"],
        "duplicate": c["badge_duplicate"],
        "mixed": c["badge_mixed"],
    }
    return ft.Container(
        padding=ft.padding.symmetric(horizontal=8, vertical=2),
        border_radius=8,
        bgcolor=color_map.get(status, c["surface_alt"]),
        content=ft.Text(
            status.capitalize(),
            size=10,
            weight=ft.FontWeight.W_600,
            color="#ffffff",
        ),
    )


def _compact_stat(label, value, color_value, c, sp):
    return ft.Row(
        spacing=6,
        controls=[
            ft.Text(label, size=11, color=c["text_dim"]),
            ft.Text(str(value), size=14, weight=ft.FontWeight.W_700, color=color_value),
        ],
    )


def _cover_placeholder(name, size, c, r):
    hue = abs(hash(name)) % 360
    return ft.Container(
        width=size,
        height=size,
        border_radius=r["md"],
        gradient=ft.LinearGradient(
            begin=ft.alignment.top_left,
            end=ft.alignment.bottom_right,
            colors=[f"hsl({hue},30%,18%)", f"hsl({(hue+40)%360},25%,12%)"],
        ),
        alignment=ft.alignment.center,
        content=ft.Text(
            name[:3].upper() if name else "RJ",
            size=18,
            weight=ft.FontWeight.W_700,
            color=c["text_dim"],
        ),
    )


class LibraryView:
    def __init__(self, page: ft.Page, colors, spacing, radius, font_size):
        self.page = page
        self.c = colors
        self.sp = spacing
        self.r = radius
        self.fs = font_size

        self.vault = None
        self.db_found = False
        self.db_error = ""
        self.summary_data = {}
        self.works_data = []
        self.current_work_id = None

        self.search_field = ft.TextField(
            hint_text="Search...",
            border_radius=self.r["md"],
            bgcolor=self.c["surface"],
            border_color=self.c["border"],
            text_size=self.fs["sm"],
            cursor_color=self.c["accent"],
            color=self.c["text"],
            hint_style=ft.TextStyle(color=self.c["text_dim"]),
            prefix_icon=ft.icons.SEARCH,
            on_submit=lambda e: self._do_search(),
            expand=True,
        )
        self.type_dd = ft.Dropdown(
            options=[
                ft.dropdown.Option("", "All Types"),
                ft.dropdown.Option("rj", "RJ"),
                ft.dropdown.Option("bj", "BJ"),
                ft.dropdown.Option("vj", "VJ"),
            ],
            border_radius=self.r["md"],
            bgcolor=self.c["surface"],
            border_color=self.c["border"],
            color=self.c["text"],
            text_size=self.fs["sm"],
            on_change=lambda e: self._do_search(),
            width=110,
            value="",
        )
        self.status_dd = ft.Dropdown(
            options=[
                ft.dropdown.Option("", "All"),
                ft.dropdown.Option("recognized", "Recognized"),
                ft.dropdown.Option("duplicate", "Duplicate"),
                ft.dropdown.Option("mixed", "Mixed"),
            ],
            border_radius=self.r["md"],
            bgcolor=self.c["surface"],
            border_color=self.c["border"],
            color=self.c["text"],
            text_size=self.fs["sm"],
            on_change=lambda e: self._do_search(),
            width=120,
            value="",
        )

        self.works_column = ft.Column(
            spacing=self.sp["sm"],
            scroll=ft.ScrollMode.AUTO,
            expand=True,
        )

        self.detail_content = ft.Column(
            spacing=self.sp["lg"],
            scroll=ft.ScrollMode.AUTO,
            expand=True,
            controls=[
                ft.Container(
                    alignment=ft.alignment.center,
                    padding=ft.padding.only(top=80),
                    content=ft.Column(
                        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                        spacing=self.sp["md"],
                        controls=[
                            ft.Icon(
                                name=ft.icons.ARROW_BACK,
                                size=32,
                                color=self.c["text_dim"],
                            ),
                            ft.Text(
                                "Select a work to view details",
                                size=self.fs["sm"],
                                color=self.c["text_dim"],
                                text_align=ft.TextAlign.CENTER,
                            ),
                        ],
                    ),
                ),
            ],
        )

        self.detail_panel = ft.Container(
            width=420,
            padding=self.sp["xl"],
            bgcolor=self.c["surface"],
            border=ft.border.only(left=ft.BorderSide(1, self.c["border"])),
            content=self.detail_content,
        )

        self.header_badge = ft.Container(
            padding=ft.padding.symmetric(horizontal=12, vertical=4),
            border_radius=self.r["full"],
            border=ft.border.all(1, self.c["accent"]),
            content=ft.Text(
                "E:\\arsm  /  ready",
                size=self.fs["xs"],
                color=self.c["accent"],
            ),
        )

        self.stats_row = ft.Row(
            spacing=self.sp["sm"],
            wrap=True,
            run_spacing=self.sp["xs"],
        )

        self.main_panel = ft.Container(
            expand=True,
            padding=ft.padding.all(self.sp["xl"]),
            content=ft.Column(
                expand=True,
                spacing=self.sp["md"],
            ),
        )

        self.body_row = ft.Row(
            expand=True,
            controls=[self.main_panel, self.detail_panel],
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
        wt = self.type_dd.value or None
        fs = self.status_dd.value or None
        try:
            self.works_data = list_works(
                self.vault,
                search=self.search_field.value or "",
                work_type=wt,
                folder_status=fs,
                limit=120,
            )
        except Exception:
            self.works_data = []
        self._rebuild_main()

    def _select_work(self, work_id):
        self.current_work_id = work_id
        self._rebuild_detail()

    def _rebuild_main(self):
        c = self.c
        sp = self.sp
        r = self.r
        fs = self.fs
        s = self.summary_data

        self.stats_row.controls = [
            _compact_stat("Works", s.get("works_count", 0), c["accent"], c, sp),
            _compact_stat("Audio", _format_count(s.get("audio_count", 0)), c["primary"], c, sp),
            _compact_stat("Img", _format_count(s.get("image_count", 0)), c["text"], c, sp),
            _compact_stat("Video", s.get("video_count", 0), c["text"], c, sp),
            _compact_stat("Sub", s.get("subtitle_count", 0), c["text"], c, sp),
            _compact_stat("Text", s.get("text_count", 0), c["text"], c, sp),
        ]

        cards = []
        for w in self.works_data:
            wid = w["id"]
            selected = wid == self.current_work_id
            border_c = c["accent"] if selected else c["border"]
            border_w = 2 if selected else 1

            cover = _cover_placeholder(
                w.get("folder_name", "RJ"), 56, c, r
            )

            cards.append(
                ft.Container(
                    border_radius=r["lg"],
                    bgcolor=c["surface"],
                    border=ft.border.all(border_w, border_c),
                    padding=sp["md"],
                    ink=True,
                    on_click=lambda e, work_id=wid: self._select_work(work_id),
                    content=ft.Row(
                        spacing=sp["md"],
                        controls=[
                            cover,
                            ft.Column(
                                spacing=4,
                                expand=True,
                                controls=[
                                    ft.Row(
                                        spacing=sp["sm"],
                                        controls=[
                                            ft.Text(
                                                w.get("folder_name", "-"),
                                                size=fs["sm"],
                                                weight=ft.FontWeight.W_600,
                                                color=c["text"],
                                                expand=True,
                                                max_lines=1,
                                                overflow=ft.TextOverflow.ELLIPSIS,
                                            ),
                                            _status_badge(
                                                w.get("folder_status", "recognized"), c
                                            ),
                                        ],
                                    ),
                                    ft.Text(
                                        w.get("work_code_raw", "-"),
                                        size=fs["xs"],
                                        color=c["accent"],
                                        weight=ft.FontWeight.W_500,
                                    ),
                                    ft.Row(
                                        spacing=sp["md"],
                                        controls=[
                                            ft.Text(
                                                f"files {w['media_count']}",
                                                size=10,
                                                color=c["text_dim"],
                                            ),
                                            ft.Text(
                                                f"audio {w['audio_count']}",
                                                size=10,
                                                color=c["text_dim"],
                                            ),
                                            ft.Text(
                                                f"img {w['image_count']}",
                                                size=10,
                                                color=c["text_dim"],
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                        ],
                    ),
                )
            )

        self.works_column.controls = cards

        header_col = ft.Column(
            spacing=sp["sm"],
            controls=[
                ft.Row(
                    spacing=sp["md"],
                    controls=[
                        ft.Text("Library", size=fs["xl"], weight=ft.FontWeight.W_700,
                                color=c["text"]),
                        self.header_badge,
                    ],
                ),
                ft.Container(content=self.stats_row),
                ft.Row(
                    spacing=sp["sm"],
                    controls=[self.search_field, self.type_dd, self.status_dd],
                ),
                ft.Container(height=1, bgcolor=c["border"]),
            ],
        )

        if self.works_data:
            col = ft.Column(
                expand=True,
                spacing=sp["md"],
                controls=[
                    header_col,
                    self.works_column,
                ],
            )
        elif not self.db_found:
            col = ft.Column(
                expand=True,
                spacing=sp["md"],
                controls=[
                    header_col,
                    ft.Container(
                        expand=True,
                        alignment=ft.alignment.center,
                        content=ft.Column(
                            alignment=ft.MainAxisAlignment.CENTER,
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=sp["lg"],
                            controls=[
                                ft.Icon(name=ft.icons.ERROR_OUTLINE, size=48,
                                        color=c["text_dim"]),
                                ft.Text("Database not found", size=fs["lg"],
                                        weight=ft.FontWeight.W_700, color=c["text"]),
                                ft.Text(self.db_error, size=fs["sm"],
                                        color=c["text_muted"]),
                                ft.Text(
                                    "Set YANG_KURA_DB_PATH or\nplace yang_kura_real.db in data/",
                                    size=fs["xs"], color=c["text_dim"],
                                    text_align=ft.TextAlign.CENTER,
                                ),
                            ],
                        ),
                    ),
                ],
            )
        else:
            col = ft.Column(
                expand=True,
                spacing=sp["md"],
                controls=[
                    header_col,
                    ft.Container(
                        expand=True,
                        alignment=ft.alignment.center,
                        content=ft.Column(
                            alignment=ft.MainAxisAlignment.CENTER,
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=sp["md"],
                            controls=[
                                ft.Icon(name=ft.icons.LIBRARY_MUSIC, size=48,
                                        color=c["text_dim"]),
                                ft.Text("No works found", size=fs["lg"],
                                        color=c["text_muted"]),
                            ],
                        ),
                    ),
                ],
            )

        self.main_panel.content = col
        self.page.update()

    def _rebuild_detail(self):
        c = self.c
        sp = self.sp
        fs = self.fs

        if not self.current_work_id or not self.vault:
            self.detail_content.controls = [
                ft.Container(
                    alignment=ft.alignment.center,
                    padding=ft.padding.only(top=80),
                    content=ft.Column(
                        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                        spacing=sp["md"],
                        controls=[
                            ft.Icon(name=ft.icons.ARROW_BACK, size=32, color=c["text_dim"]),
                            ft.Text("Select a work to view details",
                                    size=fs["sm"], color=c["text_dim"],
                                    text_align=ft.TextAlign.CENTER),
                        ],
                    ),
                ),
            ]
            self.page.update()
            return

        try:
            work = get_work_detail(self.vault, self.current_work_id)
            media_files = list_media_files(self.vault, self.current_work_id)
        except Exception:
            work = None
            media_files = []

        if not work:
            self.detail_content.controls = [
                ft.Text("Work not found", size=fs["sm"], color=c["text_muted"]),
            ]
            self.page.update()
            return

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
                ft.Container(
                    padding=ft.padding.symmetric(vertical=3),
                    content=ft.Row(
                        spacing=sp["sm"],
                        controls=[
                            ft.Icon(name=icon, size=14, color=c["text_dim"]),
                            ft.Text(
                                mf["relative_path"],
                                size=fs["xs"],
                                color=c["text"],
                                expand=True,
                                max_lines=1,
                                overflow=ft.TextOverflow.ELLIPSIS,
                            ),
                            ft.Text(
                                _format_size(mf["size"]),
                                size=10,
                                color=c["text_dim"],
                            ),
                        ],
                    ),
                )
            )

        folder_status = work.get("folder_status", "")
        detail_controls = [
            ft.Row(
                spacing=sp["md"],
                controls=[
                    ft.Text(
                        work.get("folder_name", "-"),
                        size=fs["lg"],
                        weight=ft.FontWeight.W_700,
                        color=c["text"],
                        expand=True,
                    ),
                    _status_badge(folder_status, c),
                ],
            ),
            ft.Text(
                work.get("work_code_raw", "-"),
                size=fs["sm"],
                color=c["accent"],
                weight=ft.FontWeight.W_500,
            ),
            ft.Container(height=1, bgcolor=c["border"]),
            ft.Text(
                f"Media Files ({len(media_files)})",
                size=fs["sm"],
                weight=ft.FontWeight.W_600,
                color=c["text"],
            ),
            ft.Column(
                spacing=2,
                controls=file_rows,
                scroll=ft.ScrollMode.AUTO,
                expand=True,
            ),
        ]

        self.detail_content.controls = detail_controls
        self.page.update()

    def build(self):
        return self.body_row
