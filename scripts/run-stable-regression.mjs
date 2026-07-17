#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const stableScripts = [
  'verify:env',
  'lint',
  'build:electron',
  'verify:handoff',
  'test:mpv:settings-runtime',
  'test:mpv:stability-runtime',
  'test:importer:smoke',
  'test:u31:importer-transactions',
  'test:library:performance',
  'test:mvp129-index-maintenance',
  'build',
];

const env = { ...process.env };
if (!/--max-old-space-size=/i.test(env.NODE_OPTIONS ?? '')) {
  env.NODE_OPTIONS = `${env.NODE_OPTIONS ?? ''} --max-old-space-size=8192`.trim();
}

for (const script of stableScripts) {
  console.log(`\n[Yang-Kura stable] npm run ${script}`);
  const args = ['run', script];
  const result = isWindows
    ? spawnSync('cmd.exe', ['/d', '/c', npmCommand, ...args], { stdio: 'inherit', env, shell: false })
    : spawnSync(npmCommand, args, { stdio: 'inherit', env, shell: false });

  if (result.error) {
    console.error(`[Yang-Kura stable] ${script} failed to start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[Yang-Kura stable] ${script} failed with exit ${result.status ?? 'unknown'}.`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nYang-Kura stable regression PASS');
