# U39-B 设置与 AI 维护入口边界

## 目标

日常设置继续承担主题、播放和资源库配置；诊断、性能与历史工程工具通过独立 AI 维护入口按需打开。完整历史诊断按需加载，不占用日常设置运行时。

本轮只建立可见入口和双向导航，不删除现有资源库检修、索引清理或备份恢复能力，也不重写 `SettingsPage.tsx` 与 `DiagnosticsPage.tsx`。

## 用户路径

```text
设置
→ AI 维护入口卡片
→ 维护概览（真实 Index 状态）
→ 可选性能诊断
→ 可选完整历史诊断
→ 返回设置
```

## 运行时边界

- `SettingsMaintenanceEntry.tsx`：只负责入口说明和导航动作；
- `AppRouter.tsx`：连接 `settings` 与隐藏的 `diagnostics` 路由；
- `DiagnosticsPageShell.tsx`：维护概览、返回设置、性能面板和完整诊断二次加载；
- `DiagnosticsPage.tsx`：继续保持 lazy import，只有用户明确打开完整诊断时才加载；
- `src/app/navigation.ts`：`diagnostics` 保持 `daily: false`、`visibleInSidebar: false`。

## 行为冻结

本轮不修改：

- Scanner、Index 读写、清理、备份或恢复实现；
- Electron IPC；
- 播放器、字幕、Queue、History 或续播；
- 资源库数据结构；
- 安装器与发布流程。

## 后续

后续触碰资源库维护功能时，再把 `SettingsPage.tsx` 内的维护状态和工具逐块迁移到独立维护 Feature。迁移完成前不得隐藏或删除现有真实维护能力。

## 验证

- `scripts/verify-u39b-maintenance-entry.mjs`；
- TypeScript；
- Renderer/Electron build；
- U30 主题与无障碍矩阵；
- `UI Fast Validation`。
