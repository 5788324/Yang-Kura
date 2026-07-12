# MVP-37 Local Cover Artwork

MVP-37 adds local cover artwork display for resources loaded from `library-index.json`.

## Cover source priority

1. Existing mock or remote cover URL when the source is demo data.
2. `collection.cover.relativePath` from the real Local JSON Index.
3. Generated local SVG fallback cover.

## Tokenized cover URL

Local cover files are not exposed as absolute paths or `file://` URLs.

Renderer receives only:

```text
rootPathToken + relative cover path
```

The UI maps this into:

```text
yang-kura-media://cover/<rootPathToken>/<relativePath>
```

Electron main resolves that URL internally inside the selected root and streams the file through the existing controlled protocol.

## Safety rules

- Renderer still never receives `absolutePath`.
- Renderer still never receives `file://`.
- Cover resolver accepts image extensions only.
- Relative paths are normalized and rejected if they contain drive letters, root slashes, `..`, `.` segments, null bytes, or `file://`.
- Failed or expired tokenized cover URLs fall back to generated SVG cover art.
- No media files are deleted, moved, renamed, or rewritten.

## UI surfaces updated

- 首页 / 最近播放.
- 音声库封面墙与列表.
- 音声详情页.
- 音乐库歌曲 / 专辑 / 艺术家视图.
- 歌单详情与歌单卡片.
- 底部播放器栏.
- 播放器详情页 / 歌词页.

## Postponed

Embedded cover extraction from ID3/FLAC tags is postponed. MVP-37 only uses index cover candidates and generated fallback covers.
