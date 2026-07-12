# MVP-32 Library Session

MVP-32 adds a small localStorage-backed session summary under:

```text
yang_kura_library_session_v1
```

The stored summary is intentionally user-facing metadata only:

- selected library display name
- library type
- last index read/write time
- root/collection/track/warning counts
- index relative name
- sha256 / byte counts when available

It does **not** persist:

- absolute paths
- `file://` URLs
- temporary `yang-kura-media://` URLs
- media file contents

## Why this exists

Electron root tokens live in main-process memory. After restarting the packaged app, the renderer can still remember that a library existed, but it must ask the user to select the folder again before reading the existing index.

MVP-32 therefore improves the wording:

```text
上次已读取「目录名」：N 个集合，M 条音轨。重启后请先重新选择该目录，再点“读取现有 index”。
```

This keeps the app practical without pretending that permissions survive across restarts.
