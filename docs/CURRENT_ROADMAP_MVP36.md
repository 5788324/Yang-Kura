# CURRENT ROADMAP — MVP-36

Version: `0.74.0-mvp36`

## Scope

MVP-36 adds real local playlist persistence for the existing ASMR + music playlist UI.

Implemented:

- Persist user-created and user-modified playlists in browser / packaged local storage.
- Use stable storage key `yang_kura_user_playlists_v1`.
- Separate read-only system/demo playlists from user-editable playlists.
- Add a simple Chinese create-playlist flow in the Playlist page.
- Allow deleting user playlists and removing tracks from user playlists.
- Keep playlist tracks sanitized before storage.
- Continue supporting mixed ASMR tracks and normal music tracks in the same playlist.

## Still out of scope

- SQLite.
- Downloader.
- ASMR.one / DLsite metadata scraping.
- mpv backend.
- Real file delete / move / rename.
- Cloud sync or account sync.

## Next planned stage

MVP-37 should continue the planned sequence with local cover reading / cover fallback cleanup, or a focused packaged validation pass before larger UI polish.
