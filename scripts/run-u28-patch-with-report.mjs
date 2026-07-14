#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const artifactDir = path.join(process.cwd(), 'artifacts', 'u28-electron-e2e');
fs.mkdirSync(artifactDir, { recursive: true });
const lines = [];

function run(label, script) {
  lines.push(`## ${label}`);
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
  });
  lines.push(result.stdout || '');
  lines.push(result.stderr || '');
  lines.push(`exit=${result.status ?? 'unknown'}`);
  if (result.error) lines.push(`spawnError=${result.error.stack || result.error.message}`);
  fs.writeFileSync(path.join(artifactDir, 'patch-diagnostics.log'), `${lines.join('\n')}\n`, 'utf8');
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('prepare branch validation anchor', 'scripts/prepare-u28-branch-validation-anchor.mjs');
run('normalize patch target line endings', 'scripts/normalize-u28-patch-targets.mjs');
run('apply U28 full-chain patch', 'scripts/apply-u28-full-chain-fix.mjs');
run('add stable Settings navigation marker', 'scripts/patch-u28-settings-selector.mjs');
run('patch Electron CDP shutdown', 'scripts/patch-u28-cdp-close.mjs');
run('add routed page waits', 'scripts/patch-u28-navigation-waits.mjs');
console.log('U28 patch preparation completed.');
