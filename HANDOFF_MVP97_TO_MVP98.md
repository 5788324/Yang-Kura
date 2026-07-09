# Handoff：MVP-97 → MVP-98

## 当前版本

```text
0.136.0-mvp98
```

## 本轮完成

MVP-98 完成了 `library-index patch preview`：

```text
MVP97 refreshCandidates
→ indexPatchPreview
→ collections / tracks / covers / subtitles / patchOperations 预览
```

新增：

```text
src/services/libraryIndexPatchPreviewService.ts
scripts/verify-mvp98-library-index-patch-preview.mjs
docs/CURRENT_ROADMAP_MVP98.md
docs/LIBRARY_INDEX_PATCH_PREVIEW_MVP98.md
HANDOFF_MVP97_TO_MVP98.md
PACKAGE_MANIFEST_MVP98_HANDOFF.txt
```

修改：

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

## 重要规划变更

已写入项目规划：

```text
Yang-Kura 是个人本地项目。
不分享、不商业化、不作为开源发布目标。
安全边界不再按企业级/公网/多人协作级别设计。
后续以“预览、确认、备份、日志、不乱删、不覆盖、不泄露真实路径”为核心边界，减少过度防线，提升进度。
```

## 本轮仍未做

```text
不写 library-index.json
不接 SQLite
不触发全量扫描
不写 OperationLog
不执行 copy / move / delete / rename
不接下载器 / 元数据 / mpv
不返回 absolutePath / file://
```

## 下一轮建议

```text
MVP99：confirmed index patch write readiness
```

建议直接进入写入准备，不再增加过多纯文档 MVP：

```text
1. 明确 backup 文件命名
2. 明确 patch 写入前二次确认
3. 明确只 patch copy-only 新增项
4. 明确失败时保留原 library-index.json
5. 准备 MVP100 真实写入
```


## 验证结果

已运行：

```bash
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache /mnt/data/.npm-cache
npm run lint
npm run build:electron
npm run verify:mvp98-library-index-patch-preview
npm run build
npm audit --audit-level=high
```

结果：PASS。`npm audit --audit-level=high` 无 high 级漏洞；仍有 Electron moderate 提示，不阻塞当前个人本地项目。

`npm run verify:all` 在本环境因命令链过长超时，但已跑到 MVP87 PASS；MVP88～MVP98 已分段补跑 PASS。
