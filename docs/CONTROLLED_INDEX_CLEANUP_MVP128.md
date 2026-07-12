# MVP128 受控索引清理

## 用户流程

```text
只读健康检查
→ 生成从索引移除预览
→ 输入 CONFIRM_REMOVE_MISSING_INDEX_RECORDS
→ Electron main 复核源 SHA-256
→ 创建 library-index 备份
→ 仅写入索引清理
→ 读回校验
→ UI 重新读取 index
```

## 可执行操作

- `remove-track`：从 `tracks` 删除失效曲目，并从集合 `trackIds` 解除引用。
- `detach-cover`：解除集合或音轨的失效封面引用，并清理全局 cover 记录。
- `detach-subtitle`：解除音轨的失效字幕引用，并清理全局 subtitle 记录。
- `remove-stale-track-reference`：从集合移除不存在的 trackId。

移除曲目时会级联清理该曲目自身的封面和字幕索引记录，但不会删除真实文件。

## 写入安全门槛

- 固定确认文本：`CONFIRM_REMOVE_MISSING_INDEX_RECORDS`
- `createBackup=true`
- 缓存预览必须存在且预览时间一致。
- 请求 SHA、缓存 SHA、当前文件 SHA 必须完全一致。
- 备份使用 `flag: wx`，不覆盖同名备份。
- 写入后必须重新解析、校验结构并核对 SHA。
- 失败时尝试恢复原 index；备份始终保留。

## 明确禁止

- 不执行 `fs.rm` / `fs.unlink`。
- 不删除、移动、重命名或覆盖媒体文件。
- 不清理真实空目录。
- 不接 SQLite。
- 不向 Renderer 返回绝对路径或 file URL。
