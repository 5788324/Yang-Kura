# HANDOFF MVP96 TO MVP97

MVP96 baseline: `0.134.0-mvp96`.
MVP97 target: `0.135.0-mvp97`.

MVP97 adds post-copy refresh preview. It converts copied target relative paths into read-only refresh candidates and a future index refresh plan.

Still blocked:

- library-index.json write
- SQLite
- full scanner run
- copy/move/delete/rename
- absolutePath / file:// renderer exposure
