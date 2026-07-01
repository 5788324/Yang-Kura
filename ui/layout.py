import flet as ft

from . import theme


def build_nav_rail(colors, spacing, radius, font_size, on_select):
    nav_items = [
        {"icon": ft.icons.LIBRARY_MUSIC, "label": "音声资源库", "key": "library"},
        {"icon": ft.icons.EXPLORE, "label": "资源探索", "key": "explore", "disabled": True},
        {"icon": ft.icons.PLAYLIST_PLAY, "label": "我的歌单", "key": "playlist", "disabled": True},
        {"icon": ft.icons.BUG_REPORT, "label": "异常状态诊断", "key": "diagnostics", "disabled": True},
        {"icon": ft.icons.SETTINGS, "label": "配置与设置", "key": "settings", "disabled": True},
    ]

    buttons = []
    for item in nav_items:
        disabled = item.get("disabled", False)
        label_color = colors["text_dim"] if disabled else colors["text_muted"]
        badge = None
        if disabled:
            badge = ft.Container(
                padding=ft.padding.symmetric(horizontal=6, vertical=1),
                border_radius=8,
                bgcolor=colors["surface_alt"],
                content=ft.Text("Soon", size=9, color=colors["text_dim"]),
            )

        btn_content = ft.Row(
            spacing=spacing["sm"],
            controls=[
                ft.Icon(name=item["icon"], size=18, color=label_color),
                ft.Text(item["label"], size=font_size["sm"], color=label_color, expand=True),
            ],
        )
        if badge:
            btn_content.controls.append(badge)

        buttons.append(
            ft.Container(
                padding=ft.padding.symmetric(horizontal=spacing["md"], vertical=spacing["sm"]),
                border_radius=radius["md"],
                bgcolor=colors["surface_alt"] if not disabled and item["key"] == "library"
                         else None,
                ink=True,
                on_click=None if disabled else lambda e, k=item["key"]: on_select(k),
                content=btn_content,
            )
        )

    return ft.Container(
        width=theme.SIZES["sidebar_width"],
        padding=ft.padding.only(
            top=spacing["xl"], bottom=spacing["xl"],
            left=spacing["md"], right=spacing["md"],
        ),
        bgcolor=colors["surface"],
        border=ft.border.only(right=ft.BorderSide(1, colors["border"])),
        content=ft.Column(
            spacing=spacing["lg"],
            controls=[
                ft.Row(
                    spacing=spacing["sm"],
                    controls=[
                        ft.Container(
                            width=32, height=32,
                            border_radius=radius["md"],
                            gradient=ft.LinearGradient(
                                begin=ft.alignment.top_left,
                                end=ft.alignment.bottom_right,
                                colors=[colors["primary"], colors["accent"]],
                            ),
                            content=ft.Icon(
                                name=ft.icons.LIBRARY_MUSIC, size=16, color="#ffffff",
                            ),
                            alignment=ft.alignment.center,
                        ),
                        ft.Text(
                            theme.APP_NAME, size=font_size["lg"],
                            weight=ft.FontWeight.W_700, color=colors["text"],
                        ),
                    ],
                ),
                ft.Container(height=1, bgcolor=colors["border"]),
                ft.Column(spacing=spacing["xs"], controls=buttons),
            ],
        ),
    )
