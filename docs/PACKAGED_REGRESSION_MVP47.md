# MVP-47 — 打包版回归验收与小问题清理

## Goal

MVP-47 keeps progress stable before Beta closeout. It does not add backend features. It prepares a current packaged-app regression checklist and cleans old diagnostics copy that could mislead future AI or the user.

## Added

- `src/services/packagedRegressionValidationService.ts`
- `docs/CURRENT_ROADMAP_MVP47.md`
- `docs/PACKAGED_REGRESSION_MVP47.md`
- `scripts/verify-mvp47-packaged-regression.mjs`

## UI changes

Diagnostics adds:

- `mvp47-packaged-regression`
- 打包版启动检查
- 资源库恢复提示
- 索引闭环
- 播放闭环
- 字幕读取
- 外部打开
- 安全边界

This section is diagnostic only. It does not start packaging, read real directories, write indexes, or mutate media files.

## Cleanup

Diagnostics copy now avoids old misleading language such as:

- real DLsite / ASMR.one download or proxy claims
- writing to SQLite
- physical rename / physical delete claims
- absolute Windows sample paths in demo rows
- hardware decoder / WASAPI / network-node claims

The remaining technical information stays in Diagnostics rather than the primary media surfaces.

## Safety

MVP-47 does not introduce:

- SQLite
- downloader
- ASMR.one / DLsite metadata scraping
- mpv
- file deletion / move / rename
- raw absolute paths
- file:// exposure

No real media files are deleted, moved, renamed, copied, or rewritten.

## Explicit scope wording

- 不接 SQLite。
- 不删除 / 移动 / 重命名用户真实媒体文件。
- Renderer 不接收 absolutePath。
- Renderer 不接收 file://。
