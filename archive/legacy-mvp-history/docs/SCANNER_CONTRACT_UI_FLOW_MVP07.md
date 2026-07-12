# MVP-07 Scanner Contract UI Flow

本阶段目标：把 MVP-06 的 planned real scanner contract 映射到设置页用户操作流，但仍不实现真实扫描。

## 当前状态

- SettingsPage 只保存 Demo 路径文本。
- 不校验路径是否存在。
- 不递归读取目录。
- 不写 `library-index.json`。
- 不接 Electron IPC。
- 不接 SQLite。

## UI Flow

### 阶段 1：保存 Demo 路径

当前已经允许用户在设置页输入 ASMR / music 路径文本。

允许：

- 保存路径字符串到前端 settings 状态。
- 展示 ASMR / music root 的计划配置。
- 提示当前不会访问真实磁盘。

禁止：

- 不校验目录是否存在。
- 不扫描目录。
- 不解析音频、视频、图片、字幕文件。

### 阶段 2：未来 dry-run scan preview

未来 Electron 阶段才允许做 dry-run。

要求：

- 用户手动选择目录。
- `previewOnly=true`。
- 只返回内存 `LocalJsonIndex draft` 和 `ScannerReport`。
- 显示 diagnostics / duplicates / nextActions。

禁止：

- 不写 `library-index.json`。
- 不生成 `file://` 播放 URL。
- 不调用 HTMLAudio / mpv / VLC / PotPlayer。

### 阶段 3：未来 write-index 二次确认

只有 dry-run 报告通过后，用户才可以二次确认写入 `library-index.json`。

当前完全禁用。

## 默认安全限制

| 参数 | 默认策略 | 原因 |
|---|---|---|
| mode | dry-run first | 第一轮真实能力必须只读预览 |
| maxEntries | 建议默认 5000 | 阻止误扫超大目录或全盘 |
| maxDepth | 建议默认 8 | 覆盖 RJ / 多 disc / 特典目录，同时避免无限递归 |
| includeHidden | false | 隐藏目录和系统缓存默认不进入媒体库 |
| followSymlinks | false | 避免符号链接循环扫描或跨盘扫描 |

## 扫描前安全 Checklist

- 资源库路径必须由用户手动选择或输入。
- 真实扫描必须先 dry-run，不能直接 write-index。
- UI 必须显示 `maxEntries / maxDepth / followSymlinks=false`。
- 扫描器不删除、不移动、不重命名、不修复真实文件。
- Electron IPC 未接入前，不访问真实目录。
- 写 `library-index.json` 必须单独二次确认。

## 下一步

MVP-08 建议做 virtual path parser 单元用例，继续不读真实盘、不写 `library-index.json`。
