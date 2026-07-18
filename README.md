# Yang-Kura

> 当前版本：`0.169.0-beta.2`  
> 代码事实来源：GitHub `main`  
> 当前阶段：U40-D 真实资源库稳定性修复完成；按需日常维护

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；索引采用 Local JSON Index。

## 当前能力

- 本地目录选择、扫描、Index 写入、读取、备份、恢复和维护。
- 首页、音声库、RJ 详情、音乐库、专辑/艺术家/文件夹详情。
- 搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和完成策略。
- LRC、SRT、VTT、ASS 与双语字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- 本地元数据覆盖、DLsite 单 RJ Provider、portable 与 NSIS。

## 发布状态

- Beta 2：`v0.169.0-beta.2`，Release ID `355486824`。
- portable、NSIS setup 和 `SHA256SUMS.txt` 已完成远端文件名、大小、SHA-256 与 digest 校验。
- U40-D 不修改发布版本，也不创建新 Release。

## U40-D 真实资源库稳定性

- Index 读取使用单一共享会话：`reading / loaded / failed / timed-out / interrupted`。
- 15 秒未完成时明确提示超时并恢复重试；后台迟到结果只在仍属于当前操作时收敛。
- 设置、顶栏、首页、音声库和音乐库显示同一次读取状态。
- 自动验收 profile 与日常 profile 隔离；旧 U28/U29 等测试队列、历史、歌单和缓存不会污染日常使用。
- 真实库加载后，队列与历史中不存在于当前资源库的旧音轨会被移除。
- 旧版超大一级目录集合按 RJ 或实际作品/专辑目录重新分组，空集合不进入日常页面。
- 生产设置使用 `SettingsPageDaily.tsx`；旧工程设置和旧完整诊断页退出运行时。
- 历史相对导入循环已清零，Issue #66 已完成收口。

## 验证

U40-D 同一候选提交通过：

- TypeScript、Renderer build、Electron build；
- U28 资源库与重启；
- U29 播放器与字幕；
- U30 主题、DPI、键盘与减少动画；
- U31 导入事务；
- U32 日常页面视觉审查；
- U40-B 全产品用户旅程；
- stable regression；
- Architecture Guardrails、UI Fast Validation、U40-C、Branch Validation。

真实媒体库实机验收由 Codex 按 `docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md` 执行：

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

真实库默认只读；导入、写入和回滚仅在临时副本验证。

## 当前主线

```text
真实使用 Bug
→ 字幕与播放实际体验
→ 日常 UI / 性能
→ 用户明确提出的小型功能
```

不再保留开放的结构治理轮次，也不为了目录整齐进行推倒重写。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号和插件市场，除非用户明确重新解冻。

## 文档入口

- `PROJECT_STATE.md`
- `PROJECT_ROADMAP.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- `AI_HANDOFF/WORKLOG.md`
- `docs/U40D_DEFECT_CLOSEOUT.md`
- `docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`
- `docs/U40B_FULL_PRODUCT_ACCEPTANCE.md`
- `docs/U39_FINAL_ACCEPTANCE.md`

<!-- 历史验证锚点：U39-G：同一候选提交重跑；不再预排 U39 轮次。 -->
