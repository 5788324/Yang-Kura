# CODEX PUSH README — MVP-85

Version: 0.123.0-mvp85

This is the complete clean source package for Codex/local Git push.

Use this as the source of truth, not the current GitHub main.

Recommended commands after copying into a fresh clone:

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp85-import-download-models
npm run verify:all
npm run build
npm audit --audit-level=high
```

Then commit:

```bash
git status
git add .
git commit -m "chore: add mvp85 import download model contracts"
git push -u origin mvp85-import-download-models
```

Do not commit node_modules, dist, dist-electron, logs, or temporary files.
