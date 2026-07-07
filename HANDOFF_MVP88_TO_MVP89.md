# HANDOFF MVP88 TO MVP89

MVP-89

## 本轮版本

`0.127.0-mvp89`

## 基线

`0.126.0-mvp88`

## 完成内容

MVP89 新增导入冲突检测 / hash 策略预览。

新增：

- `src/services/importConflictDetectionPreviewService.ts`
- `docs/CURRENT_ROADMAP_MVP89.md`
- `docs/IMPORT_CONFLICT_DETECTION_MVP89.md`
- `scripts/verify-mvp89-import-conflict-detection.mjs`

修改：

- `src/components/ImporterPage.tsx`
- `src/components/DiagnosticsPage.tsx`
- `src/services/index.ts`
- `package.json`
- `package-lock.json`
- 项目状态与交接文档

## 安全边界

本轮没有：

- 真实文件读取
- 真实 hash 计算
- copy / move / delete / rename
- `library-index.json` 写入
- SQLite
- 下载 Provider
- mpv
- `absolutePath` / `file://` 暴露

## 下一轮

MVP90：目标路径规划预览。


补充 verifier marker：不复制文件 / 不移动文件 / 不计算真实 hash。
