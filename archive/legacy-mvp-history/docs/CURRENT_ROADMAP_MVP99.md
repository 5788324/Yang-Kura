# CURRENT_ROADMAP_MVP99

当前版本：`0.137.0-mvp99`。

## 当前阶段

Yang-Kura 已进入 Beta 0.1 后的导入器 copy-only 链路收口阶段。MVP95 已实现 copy-only executor，MVP96 已实现最小 OperationLog，MVP97 已实现 post-copy refresh preview，MVP98 已实现 library-index patch preview。

MVP99 的目标是：在真实写入前做最后一个必要门禁，确认 `indexPatchPreview` 可以进入 MVP100 写入流程。

## MVP99 完成

- 新增 `libraryIndexPatchWriteReadinessService`。
- 新增 IPC 合同：`yang-kura:import:library-index-patch:write-readiness`。
- 新增 preload 方法：`requestImportLibraryIndexPatchWriteReadiness`。
- 新增 renderer 类型：`YangKuraImportLibraryIndexPatchWriteReadinessRequest` / `YangKuraLibraryIndexPatchWriteReadinessResult`。
- ImporterPage / DiagnosticsPage 增加 MVP99 展示区块。
- 新增 verifier：`verify:mvp99-library-index-patch-write-readiness`。

## 仍然不做

- 不写 `library-index.json`。
- 不接 SQLite。
- 不触发全量扫描。
- 不执行 copy/move/delete/rename。
- 不暴露 absolutePath。
- 不暴露 file://。

## 个人项目边界

Yang-Kura 是个人本地项目，不分享、不商业化、不作为开源发布目标。后续安全边界按“可预览、可确认、可备份、可追踪、失败不覆盖”处理，不再堆企业级/公网/多人协作级别的过重流程。

## 下一步

MVP100：真实 `library-index.json` patch 写入。

要求：

1. 写入前读取现有 `library-index.json`。
2. 解析失败则停止，不覆盖。
3. 写入前创建不覆盖旧文件的备份。
4. 只合并 copy-only 新增项产生的 patch。
5. 不删除既有 collections/tracks/covers/subtitles。
6. 返回 sanitized summary，不返回 absolutePath/file://。
