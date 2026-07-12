# CURRENT ROADMAP MVP-88

版本：`0.126.0-mvp88`

## 本轮主题

MVP-88：音乐专辑 / 单曲只读识别。

## 基线

`0.125.0-mvp87`：RJ 专辑导入只读识别。

## 本轮目标

在导入器 UI 壳和 RJ 只读识别之后，补齐普通音乐导入预览的最小识别能力：

```text
sourceRootToken + sourceDisplayName + relativePaths
→ classifyMusicImportRelativePath
→ inferArtistAlbumFromFolder
→ music-album / music-singles / mixed
→ ImportTask preview
```

## 本轮不做

```text
不打开真实目录
不读取真实文件系统
不读取 ID3 / FLAC tag
不读取 embedded cover
不转换 / 不解密网易云或 QQ 等受保护格式
不复制 / 不移动 / 不删除 / 不重命名文件
不写 library-index.json
不接 SQLite
不接下载 Provider
不接 mpv
不暴露 absolutePath / file://
```

## 下一轮建议

MVP-89：冲突检测：同 RJ、同文件、同专辑、hash 策略。
