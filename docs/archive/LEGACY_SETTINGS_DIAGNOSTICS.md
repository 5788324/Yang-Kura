# 旧设置与诊断页面

`SettingsPage.tsx` 和 `DiagnosticsPage.tsx` 仅保留历史兼容，不再由 `AppRouter` 或 `DiagnosticsPageShell` 加载。任何新功能不得写入这两个文件；日常设置和维护分别由 `SettingsPageDaily.tsx`、`DiagnosticsPageShell.tsx` 承载。
