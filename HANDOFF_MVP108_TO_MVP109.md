# HANDOFF MVP108 → MVP109

## 版本

```text
from: 0.146.0-mvp108
to:   0.147.0-mvp109
```

## 本轮目的

用户反馈 UI 仍有明显“AI 工程面板感”。MVP109 在 Codex 导入器验收并行期间继续做 UI 表层收口。

## 改动范围

- 导入器主页面改成更日常的“导入已有音频资源”。
- 新增日常导入说明区 `mvp109-importer-daily-surface`。
- MVP107 / MVP108 的导入器工程说明改为隐藏记录。
- 历史维护信息继续保留在折叠维护区。
- 设置页可见徽章改成更用户化表达。
- 诊断异常兜底去除可见 MVP / Renderer / absolutePath / file:// 术语。

## 禁止事项

```text
不改真实导入执行链路
不新增文件操作
不接下载器 / SQLite / 元数据 / mpv
不删除历史 handoff / manifest
不安排 Codex
```

## 验证

```bash
npm run lint
npm run build:electron
npm run verify:mvp107-importer-daily-ui-cleanup
npm run verify:mvp108-importer-final-regression-checklist
npm run verify:mvp109-ui-engineering-panel-cleanup
npm run build
npm audit --audit-level=high
```
