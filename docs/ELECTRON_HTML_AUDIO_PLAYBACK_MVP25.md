# MVP-25：HTMLAudio 本地音频播放 MVP

## 目标

MVP-25 把真实 `library-index.json` 中的音轨接到浏览器原生 `HTMLAudio`。

流程：

```text
LocalJsonIndex track
→ rootPathToken + source.relativePath
→ Renderer requestResolveTrackMediaUrl()
→ Electron main 校验 token / relativePath / 扩展名 / 文件存在
→ 返回 yang-kura-media:// 受控媒体 URL
→ HTMLAudio 播放
```

## 新增能力

- `yang-kura:media:resolve-track-url` IPC。
- `yang-kura-media://` Electron 自定义协议。
- `useAudioPlayer` 创建真实 `Audio()` 元素。
- index 映射层把 `rootPathToken` 和 `relativePath` 写入 `AudioTrack`。
- 播放器底栏显示：解析中 / HTMLAudio 本地播放 / 播放失败。

## 支持格式

第一版只承诺常见音频：

```text
mp3 / wav / flac / m4a / aac / ogg / opus
```

`.ape` 等冷门格式仍可被扫描进 index，但不承诺 HTMLAudio 播放。后续如需要可用 mpv 作为可控后端。

## 路径边界

Renderer 仍然不能拿到：

```text
absolutePath
file://
```

Renderer 只持有：

```text
rootPathToken
relativePath
yang-kura-media://...
```

Electron main 内部验证：

- `rootPathToken` 必须存在于 main 侧 token map。
- `relativePath` 不能是绝对路径。
- `relativePath` 不能包含 `..` 越界。
- 解析后的真实路径必须仍在用户选择的根目录内。
- 文件必须是普通文件。
- 扩展名必须在 HTMLAudio MVP 支持列表内。

## 仍不做

```text
不接 SQLite
不读 LRC 正文
不做下载器
不删除 / 移动 / 重命名文件
不做视频内置播放
不做 PotPlayer/mpv 深度控制
不做 Windows 打包
```

## 下一轮建议

MVP-26：LRC / 字幕正文读取。

建议合并做：

```text
同名 .lrc / .srt / .vtt 识别
read-track-lyrics IPC
歌词模式按时间高亮
缺字幕状态
播放页中文提示
```
