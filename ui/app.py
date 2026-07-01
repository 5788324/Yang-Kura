import flet as ft

from . import theme
from .layout import build_nav_rail
from .views import LibraryView


class AppShell:
    def __init__(self, page: ft.Page):
        self.page = page
        self.colors = theme.DARK_THEME
        self.spacing = theme.SPACING
        self.radius = theme.RADIUS
        self.font_size = theme.FONT_SIZE
        self.sizes = theme.SIZES

        page.title = theme.APP_NAME
        page.bgcolor = self.colors["bg"]
        page.padding = 0
        page.window_width = self.sizes["window_width"]
        page.window_height = self.sizes["window_height"]
        page.window_min_width = 900
        page.window_min_height = 600

        self.library_view = LibraryView(
            page, self.colors, self.spacing, self.radius, self.font_size
        )

        self.body = ft.Container(
            expand=True,
            content=ft.Text("加载中...", color=self.colors["text_muted"]),
        )

        self.nav = build_nav_rail(
            self.colors, self.spacing, self.radius, self.font_size, self._on_nav
        )

        row = ft.Row(
            expand=True,
            controls=[self.nav, self.body],
        )
        page.add(row)
        self._on_nav("library")

    def _on_nav(self, key):
        if key == "library":
            self.body.content = self.library_view.build()
        self.page.update()


def app(page: ft.Page) -> None:
    AppShell(page)


def main() -> None:
    ft.app(target=app)
