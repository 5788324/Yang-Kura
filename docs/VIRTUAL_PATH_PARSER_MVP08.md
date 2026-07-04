# MVP-08 Virtual Path Parser

本轮新增 `virtualLibraryPathParser`，用于把 fixture / virtual path 字符串解析成未来真实 scanner 可以复用的结构化信息。

## 当前范围

输入只允许来自受控字符串：

```text
RJ01234567_雨音耳かき/01_本編.mp3
Aimer - Walpurgis/01 Walpurgis.flac
RJ04444444_多Disc特典/Disc 2/01_特典.wav
RJ05555555_CG差分合集/cg/01.png
```

当前不做真实文件系统访问。

## 输出能力

解析结果包括：

```text
normalizedPath
segments
collectionFolder
parentPath
fileName
baseName
extension
collectionType
mediaKind
rjIdNorm
discNo
trackNo
specialRole
subtitleLanguage
subtitleFormat
subtitleTargetStem
warnings
```

## 能识别的路径语义

| 类型 | 识别内容 |
|---|---|
| RJ | `RJ01234567` / `RJ12345678` |
| music album | `Artist - Album` |
| music folder | 普通文件夹 |
| disc | `Disc 1` / `Disc 2` / `CD1` |
| 特典 | `特典` / `bonus` / `extra` |
| CG | `cg/` / `CG差分` / `gallery` |
| cover | `cover.jpg` / `folder.png` / `front.webp` / `jacket.jpg` |
| subtitle | `.lrc` / `.srt` / `.vtt` / `.ass` / `.txt` |
| language | `.zh.lrc` / `.ja.lrc` / `.bilingual.lrc` |

## 安全边界

MVP-08 仍然禁止：

```text
不读真实盘
不扫描 E:\arsm
不写 library-index.json
不接 Electron
不接 SQLite
不读取音频
不读取字幕文件
不删除 / 移动 / 重命名文件
```

## 后续用途

MVP-09 可以把 `fixtureLibraryScanner` 的内部路径解析逐步切换到 `virtualLibraryPathParser`，减少重复逻辑。真实 scanner 在 P4 之前仍不能使用真实目录输入。
