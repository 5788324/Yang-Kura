# MVP129 Stable Release

## Git

```text
version：0.167.0-mvp129
branch：main
commit：316d8127d6d423a1d9e6930b8b804a3bac11140e
origin/main：316d8127d6d423a1d9e6930b8b804a3bac11140e
Round 6：PASS
```

## Release gate

- Current stable regression: PASS.
- Windows mpv fixture: PASS.
- Portable build and launch: PASS.
- NSIS build, install, launch and uninstall: PASS.
- Residual Yang Kura / Electron processes: 0.
- High/critical audit findings: 0.
- One Electron moderate is retained as a known non-blocking item.

## Cleanup and handoff

- Legacy MVP01–MVP111 snapshot material is archived.
- Active verifier surface is MVP112–MVP129 plus runtime tests.
- `verify:all` aliases `verify:stable`.
- Unused dependencies were removed.
- Full Codex/DeepSeek prompts live in `AI_HANDOFF/`.
- MVP130 remains an isolated experiment and is not in stable main.
