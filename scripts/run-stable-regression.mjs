#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const stableScripts = [
  'verify:env',
  'lint',
  'build:electron',
  'verify:mvp129-stabilization-round4',
  'verify:mvp129-stabilization-round5',
  'verify:handoff',
  'verify:mvp112-ui-audit-bugfix',
  'verify:mvp113-accessibility-label-hotfix',
  'verify:mvp114-local-metadata-overrides',
  'verify:mvp115-music-metadata-management',
  'verify:mvp116-metadata-search-restore-preview',
  'verify:mvp117-single-rj-provider-preview',
  'verify:mvp118-dlsite-single-rj-provider',
  'verify:mvp119-provider-cache-throttle',
  'verify:mvp120-dlsite-total-deadline',
  'verify:mvp121-metadata-source-management',
  'verify:mvp122-mpv-backend-minimal',
  'verify:mvp123-mpv-settings-detection',
  'verify:mvp124-mpv-windows-stability',
  'verify:mvp125-player-acceptance',
  'verify:mvp126-large-library-performance',
  'verify:mvp127-missing-index-management',
  'verify:mvp128-controlled-index-cleanup',
  'verify:mvp129-index-maintenance-closeout',
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

const packagePath = 'package.json';
const currentPackageText = fs.readFileSync(packagePath, 'utf8');
const currentPackage = JSON.parse(currentPackageText);
const historicalCompatibilityVersion = '0.167.0-mvp129';
const historicalVerifierPattern = /^verify:mvp(?:11[2-9]|12\d)/;
const historicalPackageText = `${JSON.stringify({ ...currentPackage, version: historicalCompatibilityVersion }, null, 2)}\n`;

for (const script of stableScripts) {
  console.log(`\n[Yang-Kura stable] npm run ${script}`);
  const args = ['run', script];
  const useHistoricalVersion = historicalVerifierPattern.test(script);
  let result;

  try {
    if (useHistoricalVersion) {
      fs.writeFileSync(packagePath, historicalPackageText, 'utf8');
      console.log(`[Yang-Kura stable] historical verifier compatibility version: ${historicalCompatibilityVersion}`);
    }
    result = isWindows
      ? spawnSync('cmd.exe', ['/d', '/c', npmCommand, ...args], { stdio: 'inherit', env, shell: false })
      : spawnSync(npmCommand, args, { stdio: 'inherit', env, shell: false });
  } finally {
    if (useHistoricalVersion) fs.writeFileSync(packagePath, currentPackageText, 'utf8');
  }

  if (result?.error) {
    console.error(`[Yang-Kura stable] ${script} failed to start: ${result.error.message}`);
    process.exit(1);
  }
  if (result?.status !== 0) {
    console.error(`[Yang-Kura stable] ${script} failed with exit ${result?.status ?? 'unknown'}.`);
    process.exit(result?.status ?? 1);
  }
}

if (fs.readFileSync(packagePath, 'utf8') !== currentPackageText) {
  console.error('[Yang-Kura stable] package.json was not restored after historical verifier compatibility mode.');
  process.exit(1);
}

console.log('\nYang-Kura stable regression PASS');
