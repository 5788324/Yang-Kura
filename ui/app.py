import flet as ft

from . import theme


def build_stage_shell(page: ft.Page) -> ft.Control:
    colors = theme.LIGHT_THEME
    spacing = theme.SPACING
    radius = theme.RADIUS
    font_size = theme.FONT_SIZE
    sizes = theme.SIZES

    page.title = theme.APP_NAME
    page.bgcolor = colors["bg"]
    page.padding = 0
    page.window_width = sizes["window_width"]
    page.window_height = sizes["window_height"]
    page.window_min_width = 760
    page.window_min_height = 520

    return ft.Container(
        expand=True,
        bgcolor=colors["bg"],
        padding=spacing["xl"],
        content=ft.Row(
            expand=True,
            spacing=spacing["xl"],
            controls=[
                ft.Container(
                    width=sizes["sidebar_width"],
                    border_radius=radius["lg"],
                    bgcolor=colors["surface_alt"],
                    padding=spacing["lg"],
                    content=ft.Column(
                        spacing=spacing["md"],
                        controls=[
                            ft.Text(
                                theme.APP_NAME,
                                size=font_size["lg"],
                                weight=ft.FontWeight.W_700,
                                color=colors["primary"],
                            ),
                            ft.Container(height=1, bgcolor=colors["border"]),
                            ft.Text(
                                "Foundation",
                                size=font_size["sm"],
                                color=colors["text_muted"],
                            ),
                            ft.Text(
                                "Vault",
                                size=font_size["sm"],
                                color=colors["text_muted"],
                            ),
                            ft.Text(
                                "Theme",
                                size=font_size["sm"],
                                color=colors["text_muted"],
                            ),
                        ],
                    ),
                ),
                ft.Container(
                    expand=True,
                    alignment=ft.alignment.center,
                    border=ft.border.all(1, colors["border"]),
                    border_radius=radius["xl"],
                    bgcolor=colors["surface"],
                    shadow=ft.BoxShadow(
                        spread_radius=0,
                        blur_radius=28,
                        color=colors["shadow"],
                        offset=ft.Offset(0, 12),
                    ),
                    padding=spacing["xxl"],
                    content=ft.Column(
                        width=sizes["hero_width"],
                        horizontal_alignment=ft.CrossAxisAlignment.START,
                        alignment=ft.MainAxisAlignment.CENTER,
                        spacing=spacing["lg"],
                        controls=[
                            ft.Container(
                                padding=ft.padding.symmetric(
                                    horizontal=spacing["md"],
                                    vertical=spacing["sm"],
                                ),
                                border_radius=radius["md"],
                                bgcolor=colors["surface_alt"],
                                content=ft.Text(
                                    f"Current stage: {theme.CURRENT_STAGE}",
                                    size=font_size["sm"],
                                    weight=ft.FontWeight.W_600,
                                    color=colors["primary"],
                                ),
                            ),
                            ft.Text(
                                theme.APP_NAME,
                                size=font_size["title"],
                                weight=ft.FontWeight.W_700,
                                color=colors["text"],
                            ),
                            ft.Text(
                                theme.APP_SUBTITLE,
                                size=font_size["lg"],
                                color=colors["text_muted"],
                            ),
                            ft.Container(
                                height=1,
                                width=160,
                                bgcolor=colors["primary_soft"],
                            ),
                            ft.Text(
                                "Project skeleton, theme system, SQLite schema, and Vault are being prepared.",
                                size=font_size["md"],
                                color=colors["text_muted"],
                            ),
                        ],
                    ),
                ),
            ],
        ),
    )


def app(page: ft.Page) -> None:
    page.add(build_stage_shell(page))


def main() -> None:
    ft.app(target=app)
