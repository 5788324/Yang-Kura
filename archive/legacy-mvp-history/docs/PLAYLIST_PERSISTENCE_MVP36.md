# MVP-36 Playlist Persistence

## Goal

Make playlists survive app restarts while preserving Yang-Kura's local-file boundary.

## Storage key

```text
yang_kura_user_playlists_v1
```

## What is persisted

Only user-editable playlists are persisted:

- playlist id
- name
- description
- cover URL
- creator
- track list
- track count
- created / updated timestamps

Read-only demo/system playlists remain bundled in the app and are merged with persisted user playlists on startup.

## Track sanitization

Persisted playlist tracks are sanitized before storage. The service does not store:

- `mediaUrl`
- renderer-resolved media URLs
- direct `file://` URLs
- absolute local paths
- transient lyrics errors

Local token references such as `rootPathToken` and `sourceRelativePath` may remain because they are the existing renderer-safe model used by the current Local JSON Index flow.

## User-facing behavior

- The playlist page now has a Chinese “新建歌单” flow.
- User playlists can be deleted.
- Tracks can be removed from user playlists without touching disk files.
- System/demo playlists are marked as read-only and cannot be modified from the player bar dropdown.

## Migration

MVP-36 can migrate older non-system entries from the historical `sqlite_playlists` localStorage key into the new user playlist storage key. The legacy key name remains historical and does not indicate SQLite is active.

## Verification

```bash
npm run verify:mvp36-playlist-persistence
npm run verify:all
```
