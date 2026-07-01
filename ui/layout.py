import flet as ft

from . import theme


def build_nav_rail(colors, spacing, radius, font_size, on_select):
    nav_items = [
        {"icon": ft.icons.LIBRARY_MUSIC, "label": "Library", "key": "library"},
        {"icon": ft.icons.DOWNLOAD, "label": "Downloader", "key": "downloader", "disabled": True},
        {"icon": ft.icons.PLAY_CIRCLE, "label": "Player", "key": "player", "disabled": True},
        {"icon": ft.icons.SETTINGS, "label": "Settings", "key": "settings", "disabled": True},
    ]

    buttons = []
    for item in nav_items:
        disabled = item.get("disabled", False)
        buttons.append(
            ft.TextButton(
                content=ft.Row(
                    spacing=spacing["sm"],
                    controls=[
                        ft.Icon(
                            name=item["icon"],
                            size=18,
                            color=colors["text_dim"] if disabled else colors["text_muted"],
                        ),
                        ft.Text(
                            item["label"],
                            size=font_size["sm"],
                            color=colors["text_dim"] if disabled else colors["text_muted"],
                        ),
                    ],
                ),
                style=ft.ButtonStyle(
                    bgcolor=colors["surface_alt"],
                    color=colors["text_muted"],
                    overlay_color=colors["card_hover"],
                ),
                disabled=disabled,
                on_click=lambda e, k=item["key"]: on_select(k) if not disabled else None,
            )
        )

    return ft.Container(
        width=theme.SIZES["sidebar_width"],
        padding=ft.padding.only(
            top=spacing["xl"],
            bottom=spacing["xl"],
            left=spacing["md"],
            right=spacing["md"],
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
                            width=32,
                            height=32,
                            border_radius=radius["md"],
                            bgcolor=colors["primary"],
                            content=ft.Icon(
                                name=ft.icons.LIBRARY_MUSIC,
                                size=16,
                                color="#ffffff",
                            ),
                            alignment=ft.alignment.center,
                        ),
                        ft.Text(
                            theme.APP_NAME,
                            size=font_size["lg"],
                            weight=ft.FontWeight.W_700,
                            color=colors["text"],
                        ),
                    ],
                ),
                ft.Container(height=1, bgcolor=colors["border"]),
                ft.Column(spacing=spacing["xs"], controls=buttons),
            ],
        ),
    )
