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


_status_zh = {"recognized": "已识别", "duplicate": "重复", "mixed": "混合"}


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
            _status_zh.get(status, status),
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


_type_meta = {
    "audio":    ("音频",   ft.icons.MUSIC_NOTE),
    "image":    ("图片",   ft.icons.IMAGE),
    "video":    ("视频",   ft.icons.VIDEO_FILE),
    "subtitle": ("字幕",   ft.icons.SUBTITLES),
    "text":     ("文本",   ft.icons.DESCRIPTION),
    "archive":  ("压缩包", ft.icons.ARCHIVE),
    "other":    ("其他",   ft.icons.INSERT_DRIVE_FILE),
}


def _type_pill(ft_key, count, c):
    if count <= 0:
        return None
    label, icon = _type_meta.get(ft_key, (ft_key, ft.icons.INSERT_DRIVE_FILE))
    return ft.Container(
        padding=ft.padding.symmetric(horizontal=10, vertical=3),
        border_radius=12,
        bgcolor="#1E2330",
        border=ft.border.all(1, c["border"]),
        content=ft.Row(
            spacing=4,
            controls=[
                ft.Icon(name=icon, size=11, color=c["accent"]),
                ft.Text(f"{label} {count}", size=10, color=c["text_muted"]),
            ],
        ),
    )


def _group_media(media_files):
    groups = {}
    for mf in media_files:
        rp = mf["relative_path"].replace("\\", "/")
        if "/" in rp:
            grp = rp.split("/", 1)[0]
        else:
            grp = "根目录"
        groups.setdefault(grp, []).append(mf)
    order = []
    if "根目录" in groups:
        order.append("根目录")
    order += sorted(k for k in groups if k != "根目录")
    return [(k, groups[k]) for k in order]


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
                ft.dropdown.Option("all", "全部类型"),
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
            value="all",
        )
        self.status_dd = ft.Dropdown(
            options=[
                ft.dropdown.Option("all", "全部状态"),
                ft.dropdown.Option("recognized", "已识别"),
                ft.dropdown.Option("duplicate", "重复"),
                ft.dropdown.Option("mixed", "混合"),
            ],
            border_radius=self.r["md"],
            bgcolor=self.c["surface"],
            border_color=self.c["border"],
            color=self.c["text"],
            text_size=self.fs["sm"],
            on_change=lambda e: self._do_search(),
            width=120,
            value="all",
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
                "E:\\arsm  /  已就绪", size=self.fs["xs"], color=self.c["accent"],
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
                            ft.Text("请选择一个作品", size=self.fs["sm"], color=self.c["text_dim"]),
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
            self.db_error = f"数据库未找到: {db_path}"
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
            self.db_error = f"数据库错误: {e}"
            self._rebuild_main()

    def _do_search(self):
        if not self.vault:
            return

        self.load_error = ""
        try:
            self.summary_data = get_library_summary(self.vault)
        except Exception as e:
            self.summary_data = {}
            self.load_error = f"统计加载失败: {e}"

        wt = self.type_dd.value
        if wt == "all":
            wt = None
        fs_st = self.status_dd.value
        if fs_st == "all":
            fs_st = None
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
            self.load_error = f"作品加载失败: {e}"

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
            _compact_stat("作品", s.get("works_count", 0), c["accent"], c, sp),
            _compact_stat("音频", _format_count(s.get("audio_count", 0)), c["primary"], c, sp),
            _compact_stat("图片", _format_count(s.get("image_count", 0)), c["text"], c, sp),
            _compact_stat("视频", s.get("video_count", 0), c["text"], c, sp),
            _compact_stat("字幕", s.get("subtitle_count", 0), c["text"], c, sp),
            _compact_stat("文本", s.get("text_count", 0), c["text"], c, sp),
        ]

        if self.load_error:
            self.error_banner.content = ft.Text(self.load_error, size=fs["xs"], color=c["danger"])
            self.error_banner.visible = True
        else:
            self.error_banner.visible = False

        total = self.summary_data.get("works_count", 0)
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
                                    ft.Text(w["work_code_raw"], size=fs["sm"], weight=ft.FontWeight.W_600, color=c["accent"]),
                                    ft.Text(w["folder_name"], size=fs["sm"], color=c["text"], expand=True, max_lines=1, overflow=ft.TextOverflow.ELLIPSIS),
                                    _status_badge(w.get("folder_status", "recognized"), c),
                                ],
                            ),
                            ft.Row(
                                spacing=sp["md"],
                                controls=[
                                    ft.Text(f"文件:{w['media_count']}", size=10, color=c["text_dim"]),
                                    ft.Text(f"音频:{w['audio_count']}", size=10, color=c["text_dim"]),
                                    ft.Text(f"图片:{w['image_count']}", size=10, color=c["text_dim"]),
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
                        ft.Text("音声资源库", size=fs["xl"], weight=ft.FontWeight.W_700, color=c["text"]),
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
            body = ft.Column(expand=True, spacing=sp["md"], controls=[
                header,
                ft.Container(expand=True, alignment=ft.alignment.center, content=ft.Column(
                    alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=sp["lg"],
                    controls=[
                        ft.Icon(name=ft.icons.ERROR_OUTLINE, size=48, color=c["text_dim"]),
                        ft.Text("数据库未找到", size=fs["lg"], weight=ft.FontWeight.W_700, color=c["text"]),
                        ft.Text(self.db_error, size=fs["sm"], color=c["text_muted"]),
                        ft.Text(
                            "请设置 YANG_KURA_DB_PATH 或将 yang_kura_real.db 放入 data/",
                            size=fs["xs"], color=c["text_dim"], text_align=ft.TextAlign.CENTER,
                        ),
                    ],
                )),
            ])
        elif not self.works_data and not self.load_error:
            body = ft.Column(expand=True, spacing=sp["md"], controls=[
                header,
                ft.Container(expand=True, alignment=ft.alignment.center, content=ft.Column(
                    alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=sp["md"],
                    controls=[
                        ft.Icon(name=ft.icons.LIBRARY_MUSIC, size=48, color=c["text_dim"]),
                        ft.Text("没有找到作品", size=fs["lg"], color=c["text_muted"]),
                    ],
                )),
            ])
        else:
            body = ft.Column(expand=True, spacing=sp["md"], controls=[
                header,
                ft.Container(expand=True, bgcolor=c["bg"], border_radius=r["lg"], content=self.works_list),
            ])

        self.main_panel.content = body
        self.page.update()

    def _rebuild_detail(self):
        c = self.c
        sp = self.sp
        fs = self.fs

        if not self.current_work_id or not self.vault:
            self.detail_content.controls = [
                ft.Container(
                    alignment=ft.alignment.center, padding=ft.padding.only(top=80),
                    content=ft.Column(
                        horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=sp["md"],
                        controls=[
                            ft.Icon(name=ft.icons.ARROW_BACK, size=32, color=c["text_dim"]),
                            ft.Text("请选择一个作品", size=fs["sm"], color=c["text_dim"]),
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
            detail_error = f"详情加载失败: {e}"

        if work:
            try:
                media_files = list_media_files(self.vault, self.current_work_id)
            except Exception as e:
                detail_error = f"媒体文件加载失败: {e}"

        if detail_error and not work:
            self.detail_content.controls = [
                ft.Container(padding=sp["md"], border_radius=sp["md"], bgcolor="#3B1A1A",
                             content=ft.Text(detail_error, size=fs["xs"], color=c["danger"])),
            ]
            self.page.update()
            return

        if not work:
            self.detail_content.controls = [
                ft.Text("作品未找到", size=fs["sm"], color=c["text_muted"]),
            ]
            self.page.update()
            return

        total_media = len(media_files)
        type_counts = {}
        for mf in media_files:
            ft_key = mf["file_type"]
            type_counts[ft_key] = type_counts.get(ft_key, 0) + 1

        pills = []
        for key in ("audio", "image", "video", "subtitle", "text", "archive", "other"):
            p = _type_pill(key, type_counts.get(key, 0), c)
            if p:
                pills.append(p)

        folder_path = work.get("folder_status", "-")
        fp = work.get("folder_path", "-")
        folder_name = work.get("folder_name", "-")
        work_code = work.get("work_code_raw", "-")
        folder_status = work.get("folder_status", "")

        info_card = ft.Container(
            border_radius=sp["md"],
            bgcolor=c["surface_alt"],
            padding=ft.padding.all(sp["md"]),
            content=ft.Column(
                spacing=sp["sm"],
                controls=[
                    ft.Row(
                        spacing=sp["sm"],
                        controls=[
                            ft.Text(folder_name, size=fs["md"], weight=ft.FontWeight.W_700, color=c["text"], expand=True),
                            _status_badge(folder_status, c),
                        ],
                    ),
                    ft.Text(work_code, size=fs["sm"], color=c["accent"], weight=ft.FontWeight.W_500),
                    ft.Row(
                        spacing=sp["sm"],
                        controls=[
                            ft.Text(fp, size=10, color=c["text_dim"], expand=True, max_lines=2, overflow=ft.TextOverflow.ELLIPSIS),
                            ft.IconButton(icon=ft.icons.COPY, icon_size=14, tooltip="复制路径",
                                          on_click=lambda e, p=fp: self._copy_path(p)),
                        ],
                    ),
                ],
            ),
        )

        stat_card = None
        if pills:
            stat_card = ft.Container(
                border_radius=sp["md"],
                bgcolor=c["surface_alt"],
                padding=ft.padding.all(sp["md"]),
                content=ft.Row(spacing=sp["sm"], wrap=True, run_spacing=4, controls=pills),
            )

        media_limit = 300
        show_media = media_files[:media_limit]
        grouped = _group_media(show_media)
        tree_rows = []
        for grp_name, entries in grouped:
            grp_audio = sum(1 for m in entries if m["file_type"] == "audio")
            grp_file = len(entries)
            tree_rows.append(
                ft.Container(
                    padding=ft.padding.only(top=4, bottom=2),
                    border=ft.border.only(bottom=ft.BorderSide(1, c["border"])),
                    content=ft.Row(
                        spacing=4,
                        controls=[
                            ft.Icon(name=ft.icons.FOLDER, size=13, color=c["primary"]),
                            ft.Text(grp_name, size=fs["xs"], weight=ft.FontWeight.W_600, color=c["text"]),
                            ft.Text(f"音频 {grp_audio} / 文件 {grp_file}", size=9, color=c["text_dim"]),
                        ],
                    ),
                )
            )
            for mf in entries:
                _, icon = _type_meta.get(mf["file_type"], ("?", ft.icons.INSERT_DRIVE_FILE))
                tree_rows.append(
                    ft.Row(
                        spacing=sp["sm"],
                        controls=[
                            ft.Icon(name=icon, size=13, color=c["text_dim"]),
                            ft.Text(mf["relative_path"], size=fs["xs"], color=c["text"], expand=True, max_lines=1, overflow=ft.TextOverflow.ELLIPSIS),
                            ft.Text(_format_size(mf["size"]), size=9, color=c["text_dim"]),
                        ],
                    )
                )

        media_title = f"媒体文件（{total_media}）"
        if total_media > media_limit:
            media_title += f" — 仅显示前 {media_limit}"

        tree_col = ft.Column(spacing=1, controls=tree_rows)

        footer_text = f"已显示全部 {total_media} 个文件"
        if total_media > media_limit:
            footer_text = f"仅显示前 {media_limit} / 共 {total_media} 个文件"

        tree_card = ft.Container(
            border_radius=sp["md"],
            bgcolor=c["surface_alt"],
            padding=ft.padding.all(sp["md"]),
            content=ft.Column(
                spacing=sp["sm"],
                controls=[
                    ft.Text(media_title, size=fs["sm"], weight=ft.FontWeight.W_600, color=c["text"]),
                    tree_col,
                    ft.Text(footer_text, size=10, color=c["text_dim"]),
                ],
            ),
        )

        detail_controls = [info_card]
        if stat_card:
            detail_controls.append(stat_card)
        if detail_error:
            detail_controls.append(
                ft.Container(padding=sp["sm"], border_radius=sp["sm"], bgcolor="#3B1A1A",
                             content=ft.Text(detail_error, size=fs["xs"], color=c["warning"])),
            )
        detail_controls.append(tree_card)

        self.detail_content.controls = detail_controls
        self.page.update()

    def _copy_path(self, path_str):
        self.page.set_clipboard(path_str)
        self.page.show_snack_bar(ft.SnackBar(content=ft.Text("已复制路径"), duration=1500))

    def build(self):
        return self.body_row
