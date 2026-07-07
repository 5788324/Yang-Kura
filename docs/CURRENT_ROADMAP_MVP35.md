# CURRENT ROADMAP — MVP-35

Version: `0.73.0-mvp35`

## Scope

MVP-35 adds player queue persistence without changing the local-file safety model.

Implemented:

- Persist current playback queue in browser/local packaged storage.
- Persist current queue index and current track id.
- Persist queue progress, loop mode, volume/mute state, and playback completion strategy.
- Restore queue summary on next app launch in an idle state.
- Preserve full queue when clicking a track inside the queue drawer.
- Keep track persistence sanitized: no per-track media URL, no resolved media URL, no absolute path exposure.

## Still out of scope

- SQLite.
- Downloader.
- ASMR.one / DLsite metadata scraping.
- mpv backend.
- File delete / move / rename.
- Full queue editing UI beyond the existing drawer.

## Next planned stage

MVP-36 should continue the planned sequence with real playlist persistence.
