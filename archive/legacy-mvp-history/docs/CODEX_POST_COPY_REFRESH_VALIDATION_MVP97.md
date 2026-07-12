# CODEX Validation MVP-97

Goal: validate `0.135.0-mvp97` post-copy refresh preview. Do not implement MVP98.

## Required checks

1. Replace main with `yang-kura-mvp97-post-copy-refresh-preview-source.zip`.
2. Confirm version is `0.135.0-mvp97`.
3. Confirm the new IPC exists:

```text
yang-kura:import:post-copy:refresh-preview
```

4. Confirm it only performs read-only target checks and does not write:

```text
library-index.json
SQLite
OperationLog
copy/move/delete/rename
```

5. Confirm renderer output contains no:

```text
absolutePath
file://
Windows drive path
```

## Commands

Use stable main repo npm cache:

```powershell
$repoRoot = "G:\Codex\Yang Kura"
$env:NPM_CONFIG_CACHE = "$repoRoot\.npm-cache"
$env:npm_config_cache = "$repoRoot\.npm-cache"

npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$repoRoot\.npm-cache"
npm run lint
npm run build:electron
npm run verify:mvp97-post-copy-refresh-preview
npm run verify:mvp96-copy-only-operation-log
npm run verify:mvp95-copy-only-executor
npm run verify:all
npm run build
npm audit --audit-level=high
```

If `npm run build` hits Windows `esbuild spawn EPERM`, rerun elevated and report it as a local environment issue.

## PASS criteria

- All commands pass.
- `library-index.json` is not created or modified.
- No SQLite write.
- No absolutePath / file:// in renderer-facing result.
- Git does not commit `node_modules`, `dist`, `.npm-cache`, `tmp`, zip, db, log, or `library-index.json`.
