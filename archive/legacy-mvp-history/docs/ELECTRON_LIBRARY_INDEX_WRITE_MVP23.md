# MVP-23 Confirmed library-index.json 写入

## 目标

在 MVP-21/22 已生成写入预览的基础上，MVP-23 增加用户确认后的真实写入：

```text
yang-kura:index:write-confirmed-request
```

## 输入要求

Renderer 只能传：

```ts
{
  rootPathToken: string;
  mode: 'confirmed-write';
  dryRunScannedAt?: string;
  createBackup?: boolean;
  maxWriteEntries?: number;
}
```

Renderer 不能传真实路径，也不能传 `file://`。

## 写入位置

Electron main 使用 `rootPathToken` 找到 main 侧保存的真实目录，并写入：

```text
<user-selected-root>/library-index.json
```

如果目标文件已存在，默认先写入：

```text
<user-selected-root>/library-index.backup-<timestamp>.json
```

Renderer 只收到相对文件名：

```text
library-index.json
library-index.backup-*.json
```

## 读回校验

写入后立即读回并校验：

- `schemaVersion === 1`
- `roots` 是数组
- `collections` 是数组
- `tracks` 是数组
- 内容中不出现 `file://`

返回统计：

```text
rootCount
collectionCount
trackCount
coverCount
subtitleCount
warningCount
bytesWritten
sha256
```

## 仍不做

- 不删除文件。
- 不移动文件。
- 不重命名文件。
- 不写 SQLite。
- 不接真实播放器。
- 不读 LRC 正文。
- 不联网抓元数据。
- 不返回 absolutePath / file:// 给 Renderer。
