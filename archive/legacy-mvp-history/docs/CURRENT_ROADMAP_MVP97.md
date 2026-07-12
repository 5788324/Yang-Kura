# CURRENT ROADMAP MVP-97

Version: `0.135.0-mvp97`
Baseline: `0.134.0-mvp96`

## Theme

MVP-97: post-copy refresh preview / scanner gate.

## Scope

- Consume MVP96 copy-only OperationLog result shape.
- Add `yang-kura:import:post-copy:refresh-preview` IPC contract.
- Validate `targetRootPathToken + targetRelativePaths` in Electron main.
- Read-only `fs.stat` target files.
- Classify copied targets into audio / cover / subtitle / text / archive / other candidates.
- Generate `mvp97-post-copy-refresh-plan-v1` preview.

## Explicitly out of scope

- 不写 `library-index.json`.
- 不接 SQLite.
- 不触发全量扫描.
- 不执行 copy / move / delete / rename.
- 不写 OperationLog.
- Renderer 不接收 absolutePath / file://.
