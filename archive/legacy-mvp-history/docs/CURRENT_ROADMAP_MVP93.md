# MVP-93 当前路线：copy-only main-side stub

version: `0.131.0-mvp93`

## 本轮目标

MVP-93 只把 copy-only 导入的 Electron main / preload / type stub 接入项目，继续阻断真实执行。

```text
MVP-93 = copy-only main-side stub + blocked result + UI/Diagnostics 展示
```

## 已完成

- 新增 `copyOnlyMainSideStubService`。
- `electron/main.ts` 增加 copy-only stub IPC handler 名称。
- `electron/preload.ts` 增加 `requestImportCopyOnly*` stub 方法。
- `src/types/electron-api.d.ts` 增加 copy-only stub 类型。
- 导入器页面和诊断页展示 blocked result。
- 新增专项 verifier：`verify:mvp93-copy-only-main-side-stub`。

## 本轮不做

- 不执行真实 copy。
- 不创建目录。
- 不读取真实导入源文件内容。
- 不移动、删除、重命名、覆盖文件。
- 不写 OperationLog 文件。
- 不写 `library-index.json`。
- 不接 SQLite / 下载 Provider / mpv。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。

## 下一步

MVP-94 如果要进入真实 copy 前置验证，应暂停开发并让 Codex 在本机做关键验收。
