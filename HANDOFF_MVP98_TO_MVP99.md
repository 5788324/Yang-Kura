# HANDOFF_MVP98_TO_MVP99

## 当前版本

`0.137.0-mvp99`

## 本轮完成

MVP99：`library-index patch write readiness`。

本轮把 MVP98 的 `indexPatchPreview` 推进到写入准备门禁：确认 patch 来源、确认文本、备份策略、MVP100 写入条件。

## 新增文件

```text
src/services/libraryIndexPatchWriteReadinessService.ts
docs/CURRENT_ROADMAP_MVP99.md
docs/LIBRARY_INDEX_PATCH_WRITE_READINESS_MVP99.md
scripts/verify-mvp99-library-index-patch-write-readiness.mjs
HANDOFF_MVP98_TO_MVP99.md
PACKAGE_MANIFEST_MVP99_HANDOFF.txt
```

## 修改文件

```text
package.json
package-lock.json
electron/main.ts
electron/preload.ts
src/types/electron-api.d.ts
src/services/index.ts
src/components/ImporterPage.tsx
src/components/DiagnosticsPage.tsx
README.md
PROJECT_STATE.md
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
```

## 安全边界

MVP99 仍不写 `library-index.json`，不接 SQLite，不执行 copy/move/delete/rename，不返回 absolutePath/file://。

## 下一轮

MVP100：真实写入 `library-index.json` patch with backup。
