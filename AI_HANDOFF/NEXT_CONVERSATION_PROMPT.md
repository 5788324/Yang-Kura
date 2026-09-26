# 新对话启动提示词

更新日期：2026-09-26

请接手 `5788324/Yang-Kura`。**不要依赖旧聊天记忆，也不要沿旧 U42/MVP/K2-R1 主线继续。**

按顺序读取：

1. `START_HERE.md`
2. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
3. `AI_HANDOFF/K2_R5_UI_MULTI_MODEL_HANDOFF.md`
4. `PROJECT_STATE.md`
5. `TASKS.md`
6. `PROJECT_ROADMAP.md`
7. 只有需要历史原因时才读 `AI_HANDOFF/WORKLOG.md`

当前事实：

- GitHub `main` 实时 HEAD 是唯一代码真源，不在文档中硬编码当前 SHA。
- K2-R2 SQLite Catalog foundation 已完成。
- K2-R3 Incremental Scanner / Artwork backend 已完成；真实 8TB 门禁后置。
- K2-R4 Query / Pagination / Virtualization / Catalog IPC 已完成并通过 Windows CI。
- 当前 ACTIVE：**K2-R5 Desktop 2.0 reference-driven UI/UX**。
- AI 从零设计路线已降级；Desktop 主要参考 YesPlayMusic / SPlayer / Feishin / fooyin，并遵守许可证边界。
- 第一版 reference-derived Music/Album/Player 功能回归 PASS，但实际截图视觉 NO-GO。
- 当前正在验证 v2：**Mist Ivory 浅色优先、窄/扁平 Sidebar、更大专辑封面、Metadata 工具退到 Advanced、TopBar/Player 降噪**。
- 自动截图门禁应输出 1440×900 / 1024×720 Music/Album PNG；视觉通过前禁止批量扩散到 ASMR。
- 音乐与 RJ/ASMR 同为一级核心。
- Android 正式开发、OpenList、Downloader、转录、云同步继续冻结。

CI 规则：

- Branch Validation 中多命令必须 fail-fast。
- `test:u30:ui-matrix` 失败必须让 workflow 失败。
- `verify:handoff` 失败必须让 workflow 失败。
- Screenshot artifact 缺失必须让上传步骤失败。
- 不得用“后续命令成功”覆盖前序失败。

接手后第一句应确认：

> 已读取当前交接；K2-R2～R4 已完成，当前继续 K2-R5 reference-driven UI v2，并以真实 Electron 截图作为视觉门禁。
