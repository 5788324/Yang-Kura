# HANDOFF MVP86 TO MVP87

当前版本：`0.125.0-mvp87`。

## 本轮主题

MVP-87：RJ 专辑导入只读识别。

## 新增

- `src/services/rjImportReadOnlyDetectionService.ts`
- `docs/CURRENT_ROADMAP_MVP87.md`
- `docs/RJ_IMPORT_READONLY_DETECTION_MVP87.md`
- `scripts/verify-mvp87-rj-import-readonly-detection.mjs`

## 修改

- `src/components/ImporterPage.tsx`
- `src/components/DiagnosticsPage.tsx`
- `src/services/index.ts`
- `package.json` / `package-lock.json`
- 项目状态与交接文档

## 仍然禁止

不读真实目录、不复制、不移动、不删除、不重命名、不写 index、不接 SQLite、不接下载 Provider。

## 下一轮

MVP-88：音乐专辑 / 单曲只读识别。
