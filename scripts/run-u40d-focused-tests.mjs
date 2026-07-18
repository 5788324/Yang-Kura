#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const scripts = [
  'scripts/test-u40d-library-normalization.mjs',
  'scripts/test-u40d-library-read-state.mjs',
  'scripts/test-u40d-profile-cleanup.mjs',
  'scripts/test-u40d-daily-language.mjs',
  'scripts/verify-u40d-real-library-stability.mjs',
];
for (const script of scripts) {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('[u40d-focused] all focused regressions PASS');
