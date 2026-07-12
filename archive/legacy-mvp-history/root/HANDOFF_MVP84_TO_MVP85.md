# HANDOFF MVP-84 → MVP-85

## 当前版本

`0.123.0-mvp85`

## 本轮主题

MVP-85：ImportTask / DownloadTask / DownloadManifest / MetadataSource 数据模型合同。

## 已完成

- 新增 `src/services/importDownloadModelContractService.ts`。
- 诊断页新增 `mvp85-import-download-models` 区块。
- 新增 `docs/IMPORT_DOWNLOAD_MODEL_CONTRACT_MVP85.md`。
- 新增 `docs/CODEX_PUSH_READY_MVP85.md`。
- 新增 `scripts/verify-mvp85-import-download-models.mjs`。
- 更新 package 版本和 `verify:all`。

## 安全边界

本轮没有接真实导入器、下载器、SQLite、mpv，也没有复制 / 移动 / 删除 / 重命名真实文件。

## 下一轮建议

MVP-86：导入器 UI 壳，只展示导入任务预览，不执行文件操作。
