#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const projectRoot = process.cwd();
const verifierSource = path.join(projectRoot, 'scripts', 'verify-u39f-architecture-guardrails.mjs');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u39f-guardrails-'));

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: tempRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function write(relativePath, content) {
  const absolutePath = path.join(tempRoot, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf8');
}

try {
  assert.equal(fs.existsSync(verifierSource), true, 'guardrail verifier exists');
  fs.mkdirSync(path.join(tempRoot, 'scripts'), { recursive: true });
  fs.copyFileSync(verifierSource, path.join(tempRoot, 'scripts', 'verify-u39f-architecture-guardrails.mjs'));

  run('git', ['init', '--initial-branch=main']);
  run('git', ['config', 'user.name', 'U39-F Test']);
  run('git', ['config', 'user.email', 'u39f@example.invalid']);

  write('src/a.ts', "export const a = 'base';\n");
  write('src/b.ts', "import { a } from './a';\nexport const b = a;\n");
  write('electron/main.ts', "export const mainReady = true;\n");
  run('git', ['add', '.']);
  run('git', ['commit', '-m', 'base']);
  const baseSha = run('git', ['rev-parse', 'HEAD']);

  write('src/a.ts', "import { b } from './b';\nimport { ipcRenderer } from 'electron';\nexport const a: any = ipcRenderer ? b : b;\n");
  write('electron/main.ts', "import '../src/components/Fake';\nexport const mainReady = true;\n");
  write('src/components/Fake.ts', "export const fake = true;\n");
  run('git', ['add', '.']);
  run('git', ['commit', '-m', 'inject violations']);

  const result = spawnSync(process.execPath, ['scripts/verify-u39f-architecture-guardrails.mjs'], {
    cwd: tempRoot,
    encoding: 'utf8',
    env: { ...process.env, BASE_SHA: baseSha },
  });

  assert.equal(result.status, 1, `guardrail verifier must reject violations\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  const reportPath = path.join(tempRoot, 'artifacts', 'u39f-architecture-guardrails', 'report.json');
  assert.equal(fs.existsSync(reportPath), true, 'failure report is written');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  assert.equal(report.status, 'fail');
  const rules = new Set(report.violations.map((violation) => violation.rule));
  for (const expected of [
    'no-new-explicit-any',
    'no-renderer-naked-ipc',
    'no-new-cross-layer-import',
    'no-new-relative-import-cycle',
  ]) {
    assert.equal(rules.has(expected), true, `negative test reports ${expected}`);
  }
  assert.equal(report.baselineCycleCount, 0);
  assert.equal(report.newCycles.length, 1);
  console.log('U39-F architecture guardrail negative integration test PASS');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
