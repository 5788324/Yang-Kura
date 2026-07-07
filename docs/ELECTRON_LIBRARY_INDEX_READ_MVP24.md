# MVP-24：读取真实 library-index.json 并映射到 UI

## 目标

MVP-24 把 MVP-23 写出的 `library-index.json` 读回到 Renderer，并映射到现有页面模型：

```text
library-index.json
→ LocalJsonIndex
→ RJWork / MusicAlbum / AudioTrack
→ 音声库 / 音乐库 / 首页
```

## 新增 IPC

```text
yang-kura:index:read-current-request
```

Renderer 只能传：

```text
rootPathToken
mode: read-current-index
```

Electron main 使用 root token map 在 main 侧定位真实目录，并读取：

```text
library-index.json
```

## 返回给 Renderer 的内容

允许返回：

```text
schemaVersion
roots
collections
tracks
covers
subtitles
warnings
indexRelativePath
bytesRead
sha256
summary
```

仍不返回：

```text
absolutePath
file://
```

如果 index 内容包含 `file://`，MVP-24 会拒绝返回给 Renderer。

## UI 映射规则

`src/services/libraryIndexAdapter.ts` 新增：

```text
fromLocalJsonIndexToAppData(index)
```

映射规则：

```text
rj_work collection → RJWork
music_album / music_folder collection → MusicAlbum
LibraryTrack → AudioTrack
track.source.relativePath → fileTreePath
local-file cover → 暂用安全占位封面
```

当前仍不做真实封面文件读取，因为这需要后续受控 file serving / image URL 策略。

## SettingsPage

新增：

```text
读取并应用 index
```

成功后写入：

```text
localStorage.yang_kura_last_read_library_index_result
```

并发送事件：

```text
yang-kura-library-index-loaded
```

## App.tsx

App 启动或收到 `yang-kura-library-index-loaded` 后，会读取最新 index 结果并刷新：

```text
rjWorks
musicAlbums
```

没有真实 index 时继续使用 mock 数据。

## DiagnosticsPage

新增显示：

```text
library-index.json 读取与页面应用结果
```

用于确认 collection / track / bytes / sha256。

## 仍不做

```text
不读取真实音频正文
不读取 LRC 正文
不生成 file://
不接 SQLite
不删除 / 移动 / 重命名媒体文件
不联网抓元数据
不做播放器真实播放
```

## 下一步

MVP-25 建议接入 HTMLAudio 本地播放链路：

```text
读取 index 数据
→ 选择 AudioTrack
→ 通过 rootPathToken + relativePath 请求安全播放 URL 或受控读取策略
→ HTMLAudio 播放
```
