# MVP-21/22：Dry-run 报告与 library-index.json 写入预览

## 当前结论

MVP-21/22 合并推进：

```text
真实 dry-run 扫描结果
→ Settings 保存最近一次报告
→ Diagnostics 正式展示报告
→ Electron main 生成 library-index.json 写入预览
→ 仍不真正写入文件
```

本轮目标是加快从“能扫到目录”到“能准备写 index”的闭环，但不直接跨到真实写入。

## 已启用能力

1. `SettingsPage` 在 dry-run 成功后保存最近一次报告到：
   - `localStorage.yang_kura_last_dry_run_result`
2. `electron/main.ts` 注册：
   - `yang-kura:index:write-preview-request`
3. `electron/preload.ts` 暴露：
   - `window.yangKura.requestWriteIndexPreview()`
4. `DiagnosticsPage` 展示：
   - 最近一次 dry-run 报告
   - 最近一次 index 写入预览
5. `src/types/electron-api.d.ts` 增加：
   - `YangKuraWriteIndexPreviewRequest`
   - `YangKuraWriteIndexPreviewResult`

## write-index preview 的输入

```ts
{
  rootPathToken: string;
  mode: 'preview-only';
  dryRunScannedAt?: string;
  maxPreviewEntries?: number;
}
```

请求只能使用已经由 MVP-19 目录选择器生成的 `rootPathToken`。

## write-index preview 的输出

输出包含：

```text
summary
previewIndex
message
safetyNotes
```

其中 `previewIndex` 是一个接近未来 `library-index.json` 的对象：

```text
schemaVersion
generatedAt
sourceKind
roots
collections
tracks
covers
subtitles
warnings
```

## 路径规则

`previewIndex.roots[].rootPath` 只允许写：

```text
rootPathToken:<token>
```

不允许写：

```text
真实 absolutePath
file:// URL
```

每个 track / cover / subtitle 只使用：

```text
relativePath
extension
sizeBytes
mtimeMs
```

## 仍不做

```text
不真正写 library-index.json
不接 SQLite
不删除文件
不移动文件
不重命名文件
不联网抓元数据
不返回 absolutePath 给 Renderer
不返回 file:// 给 Renderer
```

## 下一步

MVP-23：用户确认后真正写入 `library-index.json`。

建议 MVP-23 仍保持最小范围：

```text
1. 继续使用 rootPathToken。
2. 选择 index 输出位置。
3. 写入前创建 preview / backup。
4. 写入 library-index.json。
5. 写入后读取校验 schemaVersion / roots / collections / tracks。
```
