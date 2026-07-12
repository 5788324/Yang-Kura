# Codex Validation — MVP-96 OperationLog

目标版本：`0.134.0-mvp96`

## 任务

请验证 MVP96 copy-only OperationLog 最小落盘。

## 必须确认

1. copy-only executor 仍可复制新文件。
2. 已存在目标仍 skip，不覆盖。
3. 源文件仍保留。
4. 执行后追加写入 `import-operation-log.jsonl`。
5. 日志新增行包含 copied / skipped / failure 统计。
6. 日志不包含 `absolutePath` 字段。
7. 日志不包含 `file://`。
8. 日志不包含 Windows 盘符路径，例如 `G:\`、`C:\`。
9. 不生成或修改 `library-index.json`。
10. 不 move / delete / rename。

## 推荐命令

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run build:electron
npm run verify:mvp96-copy-only-operation-log
npm run verify:mvp95-copy-only-executor
npm run verify:all
npm run build
npm audit --audit-level=high
```

## 判定

满足以上全部条件才 PASS。否则 BLOCKED。
