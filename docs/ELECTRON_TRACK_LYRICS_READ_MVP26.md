# MVP-26 Electron Track Lyrics / Subtitle Read

## 目标

MVP-26 让真实 `library-index.json` 中的本地音轨可以读取同 root 下的字幕正文，并把 `.lrc / .srt / .vtt / .ass` 转成现有播放器可消费的 LRC 兼容行。

## 新增 IPC

```text
yang-kura:lyrics:read-track-lyrics
```

Renderer 只传：

```text
rootPathToken
trackId
trackRelativePath
subtitleRelativePaths[]
mode = read-track-lyrics
```

Electron main 侧负责：

```text
1. 校验 rootPathToken
2. 校验字幕相对路径不能越界
3. 自动推导同名字幕候选
4. 只读读取字幕文件
5. 转换成 [mm:ss.xx] text 行
6. 返回 normalizedLrcLines
```

## 支持格式

```text
.lrc
.srt
.vtt
.ass
```

## 仍然禁止

```text
不返回 absolutePath
不返回 file://
不写字幕文件
不编辑字幕文件
不删除 / 移动 / 重命名媒体文件
不接 SQLite
不联网抓字幕
```

## 使用路径

```text
真实 index 音轨
→ rootPathToken + sourceRelativePath
→ requestReadTrackLyrics
→ normalizedLrcLines
→ currentTrack.lyrics
→ LyricsPanel 时间轴高亮
```
