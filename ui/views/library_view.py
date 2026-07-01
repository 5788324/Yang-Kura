import os
from pathlib import Path

import flet as ft

from core.db import YangKuraVault
from core.library import (
    count_works,
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
            status.capitalize(), size=10, weight=ft.FontWeight.W_600, color="#ffffff",
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
        self.load_error = ""
        self.summary_data = {}
        self.works_data = []
        self.current_work_id = None
        self._search_wt = None
        self._search_fs = None

        self.search_field = ft.TextField(
            hint_text="搜索 RJ号 / 文件夹名...",
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
                ft.dropdown.Option("", "全部类型"),
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
                ft.dropdown.Option("", "全部状态"),
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

        self.works_list = ft.ListView(
            expand=True,
            spacing=6,
            padding=ft.padding.only(right=8),
        )

        self.count_hint = ft.Text(
            "", size=11, color=self.c["text_dim"],
        )

        self.stats_row = ft.Row(
            spacing=self.sp["sm"], wrap=True, run_spacing=self.sp["xs"],
        )

        self.header_badge = ft.Container(
            padding=ft.padding.symmetric(horizontal=12, vertical=4),
            border_radius=self.r["full"],
            border=ft.border.all(1, self.c["accent"]),
            content=ft.Text(
                "E:\\arsm  /  ready", size=self.fs["xs"], color=self.c["accent"],
            ),
        )

        self.error_banner = ft.Container(
            visible=False,
            padding=self.sp["md"],
            border_radius=self.r["md"],
            bgcolor="#3B1A1A",
            border=ft.border.all(1, self.c["danger"]),
        )

        self.detail_content = ft.Column(
            spacing=self.sp["md"],
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
                            ft.Icon(name=ft.icons.ARROW_BACK, size=32, color=self.c["text_dim"]),
                            ft.Text("Select a work", size=self.fs["sm"], color=self.c["text_dim"]),
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

        self.main_panel = ft.Container(expand=True, padding=ft.padding.all(self.sp["xl"]))

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
            self._rebuild_main()
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
            self._rebuild_main()

    def _do_search(self):
        if not self.vault:
            return

        self.load_error = ""
        try:
            self.summary_data = get_library_summary(self.vault)
        except Exception as e:
            self.summary_data = {}
            self.load_error = f"summary load error: {e}"

        wt = self.type_dd.value or None
        fs_st = self.status_dd.value or None
        self._search_wt = wt
        self._search_fs = fs_st
        try:
            self.works_data = list_works(
                self.vault,
                search=self.search_field.value or "",
                work_type=wt,
                folder_status=fs_st,
                limit=120,
            )
        except Exception as e:
            self.works_data = []
            self.load_error = f"works load error: {e}"

        self._rebuild_main()

    def _select_work(self, work_id):
        self.current_work_id = work_id
        self._rebuild_main()
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

        if self.load_error:
            self.error_banner.content = ft.Text(
                self.load_error, size=fs["xs"], color=c["danger"],
            )
            self.error_banner.visible = True
        else:
            self.error_banner.visible = False

        total = self.summary_data.get("works_count", 0)
        if total == 0:
            try:
                total = count_works(
                    self.vault,
                    search=self.search_field.value or "",
                    work_type=self._search_wt,
                    folder_status=self._search_fs,
                )
            except Exception:
                pass
        self.count_hint.value = f"显示 {len(self.works_data)} / {total} 个作品"

        card_controls = []
        for w in self.works_data:
            wid = w["id"]
            selected = wid == self.current_work_id
            border_c = c["accent"] if selected else c["border"]
            border_w = 2 if selected else 1

            card_controls.append(
                ft.Container(
                    border_radius=r["md"],
                    bgcolor=c["surface"],
                    border=ft.border.all(border_w, border_c),
                    padding=ft.padding.symmetric(horizontal=sp["md"], vertical=sp["sm"]),
                    on_click=lambda e, work_id=wid: self._select_work(work_id),
                    content=ft.Column(
                        spacing=2,
                        controls=[
                            ft.Row(
                                spacing=sp["sm"],
                                controls=[
                                    ft.Text(
                                        w["work_code_raw"],
                                        size=fs["sm"],
                                        weight=ft.FontWeight.W_600,
                                        color=c["accent"],
                                    ),
                                    ft.Text(
                                        w["folder_name"],
                                        size=fs["sm"],
                                        color=c["text"],
                                        expand=True,
                                        max_lines=1,
                                        overflow=ft.TextOverflow.ELLIPSIS,
                                    ),
                                    _status_badge(w.get("folder_status", "recognized"), c),
                                ],
                            ),
                            ft.Row(
                                spacing=sp["md"],
                                controls=[
                                    ft.Text(
                                        f"files:{w['media_count']}", size=10, color=c["text_dim"],
                                    ),
                                    ft.Text(
                                        f"audio:{w['audio_count']}", size=10, color=c["text_dim"],
                                    ),
                                    ft.Text(
                                        f"img:{w['image_count']}", size=10, color=c["text_dim"],
                                    ),
                                ],
                            ),
                        ],
                    ),
                )
            )

        self.works_list.controls = card_controls

        header = ft.Column(
            spacing=sp["sm"],
            controls=[
                ft.Row(
                    spacing=sp["md"],
                    controls=[
                        ft.Text("Library", size=fs["xl"], weight=ft.FontWeight.W_700, color=c["text"]),
                        self.header_badge,
                    ],
                ),
                ft.Container(content=self.stats_row),
                ft.Row(
                    spacing=sp["sm"],
                    controls=[self.search_field, self.type_dd, self.status_dd],
                ),
                ft.Container(height=1, bgcolor=c["border"]),
                self.count_hint,
                self.error_banner,
            ],
        )

        if not self.db_found:
            body = ft.Column(
                expand=True,
                spacing=sp["md"],
                controls=[
                    header,
                    ft.Container(
                        expand=True,
                        alignment=ft.alignment.center,
                        content=ft.Column(
                            alignment=ft.MainAxisAlignment.CENTER,
                            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                            spacing=sp["lg"],
                            controls=[
                                ft.Icon(name=ft.icons.ERROR_OUTLINE, size=48, color=c["text_dim"]),
                                ft.Text("Database not found", size=fs["lg"], weight=ft.FontWeight.W_700, color=c["text"]),
                                ft.Text(self.db_error, size=fs["sm"], color=c["text_muted"]),
                                ft.Text(
                                    "Set YANG_KURA_DB_PATH or place yang_kura_real.db in data/",
                                    size=fs["xs"], color=c["text_dim"], text_align=ft.TextAlign.CENTER,
                                ),
                            ],
                        ),
                    ),
                ],
            )
        elif not self.works_data and not self.load_error:
            body = ft.Column(
                expand=True,
                spacing=sp["md"],
                controls=[
                    header,
                    ft.Container(
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
                    ),
                ],
            )
        else:
            body = ft.Column(
                expand=True,
                spacing=sp["md"],
                controls=[
                    header,
                    ft.Container(
                        expand=True,
                        bgcolor=c["bg"],
                        border_radius=r["lg"],
                        content=self.works_list,
                    ),
                ],
            )

        self.main_panel.content = body
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
                            ft.Text("Select a work", size=fs["sm"], color=c["text_dim"]),
                        ],
                    ),
                ),
            ]
            self.page.update()
            return

        work = None
        media_files = []
        detail_error = ""
        try:
            work = get_work_detail(self.vault, self.current_work_id)
        except Exception as e:
            detail_error = f"detail load error: {e}"

        if work:
            try:
                media_files = list_media_files(self.vault, self.current_work_id)
            except Exception as e:
                detail_error = f"media load error: {e}"

        if detail_error and not work:
            self.detail_content.controls = [
                ft.Container(
                    padding=sp["md"],
                    border_radius=sp["md"],
                    bgcolor="#3B1A1A",
                    content=ft.Text(detail_error, size=fs["xs"], color=c["danger"]),
                ),
            ]
            self.page.update()
            return

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

        total_media = len(media_files)
        show_media = media_files[:300]

        type_counts = {}
        for mf in media_files:
            ft_key = mf["file_type"]
            type_counts[ft_key] = type_counts.get(ft_key, 0) + 1

        file_rows = []
        for mf in show_media:
            icon = type_icons.get(mf["file_type"], ft.icons.INSERT_DRIVE_FILE)
            file_rows.append(
                ft.Row(
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
                )
            )

        media_title = f"Media Files ({total_media})"
        if total_media > 300:
            media_title += f" — 显示前 300"

        def _type_pill(ft_key, label, ic):
            cnt = type_counts.get(ft_key, 0)
            return ft.Row(
                spacing=3,
                controls=[
                    ft.Icon(name=ic, size=11, color=c["text_dim"]),
                    ft.Text(f"{label}:{cnt}", size=10, color=c["text_dim"]),
                ],
            )

        type_icons_compact = {
            "audio": ft.icons.MUSIC_NOTE,
            "image": ft.icons.IMAGE,
            "video": ft.icons.VIDEO_FILE,
            "subtitle": ft.icons.SUBTITLES,
            "text": ft.icons.DESCRIPTION,
            "archive": ft.icons.ARCHIVE,
            "other": ft.icons.INSERT_DRIVE_FILE,
        }
        type_pills = [_type_pill(k, k[:4], v) for k, v in type_icons_compact.items()]

        detail_controls = [
            ft.Row(
                spacing=sp["md"],
                controls=[
                    ft.Text(
                        work.get("folder_name", "-"),
                        size=fs["md"],
                        weight=ft.FontWeight.W_700,
                        color=c["text"],
                        expand=True,
                    ),
                    _status_badge(work.get("folder_status", ""), c),
                ],
            ),
            ft.Text(work.get("work_code_raw", "-"), size=fs["sm"], color=c["accent"], weight=ft.FontWeight.W_500),
            ft.Text(work.get("folder_path", "-"), size=10, color=c["text_dim"], max_lines=2, overflow=ft.TextOverflow.ELLIPSIS),
            ft.Container(height=1, bgcolor=c["border"]),
            ft.Text(media_title, size=fs["sm"], weight=ft.FontWeight.W_600, color=c["text"]),
            ft.Row(spacing=sp["md"], wrap=True, run_spacing=2, controls=type_pills),
        ]

        if detail_error:
            detail_controls.append(
                ft.Container(
                    padding=sp["sm"],
                    border_radius=sp["sm"],
                    bgcolor="#3B1A1A",
                    content=ft.Text(detail_error, size=fs["xs"], color=c["warning"]),
                ),
            )

        detail_controls.append(
            ft.Column(
                spacing=2,
                controls=file_rows,
                scroll=ft.ScrollMode.AUTO,
                expand=True,
            ),
        )

        self.detail_content.controls = detail_controls
        self.page.update()

    def build(self):
        return self.body_row
