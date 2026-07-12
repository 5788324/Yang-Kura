# MVP129 索引维护阶段收口

## 备份列表

Electron main 只扫描用户已授权资源库根目录，匹配安全文件名：

`library-index.backup*.json`

每个备份只向 Renderer 返回：相对文件名、修改时间、大小、SHA-256、结构校验状态和索引摘要。不会返回绝对路径或备份正文。

## 手动恢复

固定确认文本：

`CONFIRM_RESTORE_LIBRARY_INDEX_BACKUP`

恢复步骤：

1. 验证备份文件名白名单；
2. 重新读取备份并核对 SHA-256；
3. 校验 JSON、index schema 和路径安全；
4. 把当前 `library-index.json` 独占写入 `library-index.backup.before-mvp129-restore-*.json`；
5. 写入所选备份；
6. 读回并再次校验 SHA-256/schema；
7. 刷新 Renderer 中的资源库数据；
8. 记录维护历史。

失败时优先恢复操作前 index。媒体文件始终不参与恢复。

## 过期备份

MVP129 只生成候选预览：

- 用户设置过期天数；
- 始终保留最新 5 个；
- 返回候选数量和大小；
- `deletePerformed=false`；
- 没有删除按钮或删除 IPC。

## 维护历史

历史保存在 Electron `userData/index-maintenance-history.jsonl`，记录索引清理与备份恢复的结果。内部只保存资源库路径哈希，返回 Renderer 时不包含哈希或绝对路径。

## 临时库验收

```bash
npm run test:mvp129-index-maintenance
```

脚本只在系统临时目录创建测试 index、备份和一个媒体占位文件，验证列表、保留预览、恢复、恢复前备份、历史脱敏以及媒体文件未被修改。
