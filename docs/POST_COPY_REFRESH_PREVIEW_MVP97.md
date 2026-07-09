# MVP-97 Post-copy Refresh Preview

Version: `0.135.0-mvp97`

MVP-97 adds a read-only bridge between the copy-only importer and the future index refresh flow.

## New IPC

```text
channel: yang-kura:import:post-copy:refresh-preview
mode: post-copy-refresh-preview
refreshPlanVersion: mvp97-post-copy-refresh-plan-v1
```

## Inputs

Renderer may provide only:

```text
operationPlanId
targetRootPathToken
sourceOperationLogVersion
targetRelativePaths
```

No absolute path or `file://` is accepted.

## Main-side checks

- Validate `targetRootPathToken`.
- Reject unsafe relative paths.
- Resolve targets under token root only.
- Read-only `fs.stat` target files.
- Classify candidates by existing scanner classification rules.

## Output

The returned refresh plan contains:

```text
candidateCount
audioCount
coverCount
subtitleCount
warningCount
collectionCandidateRelativePaths
refreshCandidates
blockedTargets
```

All results use token + relative path only.

## Safety

- 不写 library-index.json.
- 不接 SQLite.
- 不触发 scanner run.
- 不写 OperationLog.
- 不 copy / move / delete / rename.
- Renderer 不接收 absolutePath.
- Renderer 不接收 file://.
