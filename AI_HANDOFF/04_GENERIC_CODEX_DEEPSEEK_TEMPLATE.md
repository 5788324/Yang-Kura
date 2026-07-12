# 通用任务模板

> 新任务复制本文件后改名，不要直接覆盖模板。

## 角色

你是 Codex / DeepSeek。只执行本文件定义的任务，不自由扩展。

## 固定基线

- 版本：`0.167.0-mvp129`
- branch：`main`
- 稳定提交：`316d8127d6d423a1d9e6930b8b804a3bac11140e`
- MVP130：禁止合入

## 任务目标

在这里写唯一目标。

## 允许修改

列出文件或目录白名单。

## 禁止事项

- 不开发下载器，除非用户明确恢复该方向。
- 不引入 SQLite，除非任务明确批准。
- 不删除、覆盖、移动真实媒体文件。
- 不暴露 absolutePath / `file://`。
- 不执行 `npm audit fix`。
- 不升级 Electron。
- 不做未授权的大重构。

## 验证命令

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run build:electron
npm run verify:stable
npm run build
npm audit --audit-level=high
```

## 报告

必须列出：版本、HEAD、改动文件、测试结果、安全边界、是否提交/推送、最终结论。
