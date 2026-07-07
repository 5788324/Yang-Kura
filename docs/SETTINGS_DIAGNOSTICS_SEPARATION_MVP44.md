# MVP-44 — 设置页 / 诊断页分层收口

## Goal

MVP-44 makes the app easier to use by clarifying the difference between:

1. **日常设置页** — normal user path for importing and restoring the media library.
2. **高级资源库工具** — folded workflow for scan preview and index write/read details.
3. **诊断页** — detailed technical and validation information for development, troubleshooting and packaged regression checks.

## Added

- `src/services/settingsDiagnosticsSeparationService.ts`
- `docs/CURRENT_ROADMAP_MVP44.md`
- `docs/SETTINGS_DIAGNOSTICS_SEPARATION_MVP44.md`
- `scripts/verify-mvp44-settings-diagnostics-separation.mjs`

## UI changes

### Settings

Settings now includes `mvp44-settings-daily-flow` with three primary user actions:

- 选择资源库目录
- 读取现有记录
- 一键扫描并应用

It also includes `mvp44-settings-diagnostics-separation`, explaining where daily settings, advanced library tools and diagnostic details belong.

### Diagnostics

Diagnostics now includes `mvp44-diagnostics-separation`, making it explicit that the page is a diagnostics center rather than a daily playback/import surface.

Tab copy is also more user-facing:

- 多路径监控 → 资源库扫描
- 重命名计划 → 命名检查
- 死链检测 → 文件状态
- 重复与去重 → 重复资源

## Safety

MVP-44 does not add backend capability. It does not introduce:

- SQLite
- downloader
- metadata scraping
- mpv
- file deletion / move / rename
- raw absolute paths
- file:// exposure

All changes are UI copy, guidance, service-model and verifier level.
