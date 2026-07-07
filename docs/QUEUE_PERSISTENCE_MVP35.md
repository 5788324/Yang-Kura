# MVP-35 Queue Persistence

## Goal

Make the player feel persistent across restarts while keeping Yang-Kura's local-file boundary intact.

## Storage key

```text
yang_kura_player_queue_v1
```

## Persisted fields

- queue tracks, sanitized before storage
- current track id
- current queue index
- current progress
- volume
- muted state
- loop mode
- playback completion mode
- updated timestamp

## Sanitization rules

Stored tracks remove runtime-only fields:

- `mediaUrl`
- loaded local lyrics payload unless it is mock text
- transient lyrics errors

The persisted queue does not store renderer-resolved media links, direct file URLs, or absolute local paths.

## Restore behavior

On startup, Yang-Kura restores the queue and selected item, but does not auto-play. Local tokenized audio remains idle until the user presses play. This avoids automatic local-file resolution during app startup and keeps packaged startup predictable.

## User-facing behavior

The queue drawer explains that the queue is saved locally and that media links / real file paths are not saved.

## Verification

```bash
npm run verify:mvp35-queue-persistence
npm run verify:all
```
