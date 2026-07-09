# MVP-98：library-index patch preview

版本：`0.136.0-mvp98`

## 目标

MVP-98 接在 MVP-97 后面，把 copy 后的刷新候选转换为 library-index patch 预览。

```text
MVP96 OperationLog
→ MVP97 post-copy refresh plan
→ MVP98 indexPatchPreview
```

MVP-98 只回答一个问题：

```text
如果下一步写入 library-index.json，会新增 / 更新哪些 collections、tracks、covers、subtitles？
```

## 请求合同

```ts
{
  operationPlanId: string;
  targetRootPathToken: string;
  mode: 'library-index-patch-preview';
  sourceRefreshPlanVersion?: 'mvp97-post-copy-refresh-plan-v1';
  refreshCandidates: Array<{
    targetRelativePath: string;
    entryKind: 'audio' | 'video' | 'cover' | 'image' | 'subtitle' | 'text' | 'archive' | 'other';
    plannedAction: 'include-track' | 'attach-cover' | 'attach-subtitle' | 'warn-only';
    sizeBytes?: number;
    warningCodes?: string[];
  }>;
}
```

## 返回合同

```text
status = mvp98-library-index-patch-preview-ready
patchPreviewVersion = mvp98-library-index-patch-preview-v1
previewOnly = true
indexPatchWriteAllowed = false
libraryIndexWritten = false
scannerRunTriggered = false
sqliteWritten = false
absolutePathReturned = false
fileUrlReturned = false
```

核心输出：

```text
indexPatchPreview.collections
indexPatchPreview.tracks
indexPatchPreview.covers
indexPatchPreview.subtitles
indexPatchPreview.patchOperations
indexPatchPreview.warnings
```

## 个人项目规划说明

Yang-Kura 是个人本地工具，不分享、不商业化、不作为开源发布目标。

因此安全边界按以下方式执行：

```text
必须保留：预览、确认、备份、日志、不乱删、不覆盖、不泄露 absolutePath/file://。
可以简化：企业级权限、多用户隔离、云端审计、公网安全、过度合同拆分。
```

## 禁止事项

```text
不写 library-index.json
不接 SQLite
不触发全量扫描
不写 import-operation-log.jsonl
不执行 copy / move / delete / rename
不接下载器
不接元数据抓取
不返回 absolutePath
不返回 file://
```

## 下一步

```text
MVP99：confirmed index patch write readiness
MVP100：backup + write library-index.json patch
MVP101：import UI refresh after patch
```
