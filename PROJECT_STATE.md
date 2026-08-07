# PROJECT_STATE

## 当前状态

```text
公开版本：1.0.0-rc.1
公开标签：v1.0.0-rc.1（GitHub Release + Prerelease）
main：72066aa78b2eaa32f0750b115770d6847e5d46c9
本地候选版本：1.0.0-rc.1
历史候选：U41-D + Git Fast Lane v2.3 + U41-E
当前候选：U42 日常界面精简（daily UI simplification）
远端候选分支：product/u42-daily-ui-simplification
Draft PR：#94
合并：否
版本/Tag/Release：未修改
1.0.0：仍为 RC，未进入正式发布
（历史遗留标记：远端候选分支/PR：不存在可靠证据 —— 指 U41-E 时期，U42 分支已推送）
```

## 累积候选内容

### U19（已完成）· 播放器主控

- PlayerBar 主控区抽取为 `PlayerBarPrimarySections`，进度条、播放/上一首/下一首、音量统一。
- `playerBarPresentationModel` 作为只读呈现模型，组件不持有本地播放状态。

### U20（已完成）· 播放器辅助控制区

- 收藏、歌单、歌词浮窗、音量、静音、播放完成策略集中在 `PlayerAuxiliaryControls`。
- `PlayerCompatibilityMarkers` 输出 `mvp59-player-beta-chips` / `mvp79-player-ui-bugfix` 兼容标记。
- 占位“更多播放操作”按钮在 U42 中移除（见下）。

### U21（已完成）· 播放器事件与可靠性

- 播放器事件链与可靠性契约 `verify-u29-player-reliability` 通过。

### U22（已完成）· 播放器动作与歌单决策

- `usePlayerBarActions` 负责收藏切换、歌单选择、歌词浮窗开关。
- `playerBarActionModel` 提供 `getPlaylistSelectionDecision` / `getFavoriteToggleMessage` / `getFloatingLyricsToggleMessage` 决策与文案。
- 该线里程碑代号：MVP130（播放器辅助契约面收敛）。

### U28–U31 / U37–U40 / U41-A/B/C/D/E

- U28 真实 Index 诊断、U29 播放可靠性、U30 响应式主题矩阵、U31 Importer 事务、U32 视觉审计。
- U37 音声库、U38 播放体验、U39 设置分层、U40 日常界面统一。
- U41-A 产品 UI 精简；U41-B 真实 Importer（copy/move、预检、Index patch、OperationLog、回滚）；U41-C Electron 39 运行时 hardening；U41-D Downloader 遗留清除；U41-E 1.0 RC 最终验收。

### U42 · 日常界面精简（当前候选）

1. PlayerBar 占位 More 按钮已删除（保留收藏/歌单/歌词浮窗/音量/静音/完成策略/兼容标记）；
2. 音声库批量操作改为“批量管理”选择模式（默认隐藏，进入后显示全选/目标歌单/已选数量/退出）；
3. 音乐库批量操作同为选择模式（批量加入队列）；
4. RJ 音轨低频操作移入“更多”菜单：复制文件相对路径、在文件管理器中定位、用系统默认应用打开（Escape / 外部点击关闭）；
5. 音乐元数据面板分层：备份与恢复折叠进“高级：备份与恢复”；
6. 设置页 MPV 手动配置折叠进“高级播放组件设置”；
7. Importer 默认“复制到资源库”，“移动到资源库”放入“高级导入选项”，收起时安全切回复制；
8. “AI 维护”改名为“诊断与修复”，入口折叠为低权重“高级”；
9. 工程文案替换：冲突预检→检查文件冲突、Index 备份/更新→创建资源库备份/更新资源库记录、OperationLog→操作记录、fallback→自动切换播放方式、复制相对记录→复制文件相对路径；
10. 主题文案纠偏：`acrylic-mist` 为“云雾深色”（深色雾面），`ocean-drops` 明确浅色。

## 已通过

```text
npm ci --ignore-scripts --no-audit --no-fund   PASS
npm audit --audit-level=moderate                PASS / 0 vulnerabilities
npm run lint                                    PASS
npm run build                                   PASS
npm run build:electron                          PASS
npm run verify:u20-player-auxiliary-controls    PASS
npm run verify:u22-player-bar-actions           PASS
npm run verify:u39b-maintenance-entry           PASS
npm run verify:u41e-rc-final-acceptance         PASS
npm run verify:u42-daily-ui-simplification      PASS
npm run test:u42:daily-ui                       PASS（59 项检查，Electron Windows）
```

`npm run verify:stable`：PASS，包含环境、TypeScript、Renderer/Electron build、handoff、U41-B/C/D/E、U42、mpv、Importer、50,000 音轨和 Index maintenance。

## 尚未执行（U42 待办）

```text
截图证据（修复前后对照 13 项，仓库外）：NOT COMPLETE
Windows 实机验收（Codex 真实显示器 / 声卡）：NOT RUN
```

## 下一步

1. 补齐 U42 修复前后截图证据（PNG + MANIFEST + SHA256SUMS）；
2. 单一逻辑提交 `ui: simplify daily controls and advanced actions`；
3. 推送 `product/u42-daily-ui-simplification` 并开 Draft PR（不合并）；
4. CI 全绿且 Codex 实机 PASS 后再评估 1.0.0 正式发布。
