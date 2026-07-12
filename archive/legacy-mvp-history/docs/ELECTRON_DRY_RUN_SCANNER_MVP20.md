# MVP-20 Electron 小样本只读 Dry-run 扫描

## 当前结论

MVP-20 开始从“只选择目录”进入“读取目录预览”。这是个人项目，进度优先于过度保守：

```text
用户主动选择目录
→ Electron main 保存 absolutePath 到 rootPathToken map
→ Renderer 使用 rootPathToken 请求 dry-run
→ Electron main 只读遍历目录
→ Renderer 收到相对路径预览和统计
```

## 已启用

- `yang-kura:scanner:dry-run:request`
- 只允许使用 MVP-19 生成的 `rootPathToken`
- 读取目录项、文件大小、mtime
- 识别 audio / video / cover / image / subtitle / text / archive / other
- 返回 `relativePath`，不返回 `absolutePath`
- 返回 summary / discoveredEntries / warnings / blockedReasons
- Settings 页提供“预览音声库扫描 / 预览音乐库扫描”按钮
- Diagnostics 页新增 MVP-20 合同区块

## 仍然不做

```text
不写 library-index.json
不接 SQLite
不返回 absolutePath
不返回 file://
不删除文件
不移动文件
不重命名文件
不联网抓元数据
不接真实播放器
```

## 扫描限制

| 项 | 当前值 |
|---|---|
| 默认最大条目 | 10000 |
| 硬上限 | 50000 |
| 默认最大深度 | 12 |
| 硬上限 | 24 |
| follow symlink | false |
| write index | false |

## 结果保证

- `indexWriteAllowed=false`
- `summary.canWriteIndex=false`
- `absolutePathsReturned=false`
- `fileUrlReturned=false`
- `discoveredEntries[].relativePath` 只能是相对路径
- `discoveredEntries[].absolutePath` 不存在
- `discoveredEntries[].fileUrl` 不存在

## 下一步

加快后续任务安排：

```text
MVP-21：dry-run report 接 Diagnostics 正式预览
MVP-22：write-index preview，用户二次确认
MVP-23：写入 library-index.json
MVP-24：UI 读取真实 library-index.json
MVP-25：HTMLAudio 本地播放
MVP-26：LRC / SRT / VTT 读取
MVP-27：视频 / 图片外部打开
MVP-28：Windows 打包
```
