# MVP109：主界面去 AI 工程面板感

## 目标

MVP109 不扩展导入器、播放器、扫描、下载器或数据库能力，只继续处理 UI 表层问题：

```text
用户日常主界面只看操作和结果。
AI 维护、历史 MVP、IPC、verifier、合同、安全边界细节继续保留，但默认折叠到诊断页 / 维护区。
```

## 本轮改动

- 新增 `src/services/uiEngineeringPanelCleanupService.ts`，记录主界面简化原则。
- 导入器顶部不再显示 MVP 阶段标签和基线说明，改为“导入已有音频资源”。
- 导入器新增 `mvp109-importer-daily-surface`，只说明日常导入流程。
- MVP107 / MVP108 的审查说明继续保留，但从可见主页面转为 `sr-only` 兼容记录。
- 导入器历史工程说明仍在折叠的 AI 维护区内。
- 设置页把“AI 维护后置 / 工程信息后置”可见徽章改成更用户化的“维护信息已收起 / 细节已收起”。
- 诊断页异常兜底不再显示 MVP 阶段和 Renderer / absolutePath / file:// 这类工程词。

## 没有改动

```text
不改 copy-only executor
不改 move-only executor
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不改真实扫描 / 播放 / 字幕 / 外部打开链路
不返回 absolutePath
不返回 file://
不安排 Codex
```

## 后续

Codex 导入器实机验收如果失败，下一轮优先修导入器 bug。  
如果验收通过，再进入下一阶段：元数据管理或继续全局 UI 日常化。
