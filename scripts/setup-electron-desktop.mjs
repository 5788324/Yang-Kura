#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const electronCommand = path.join(cwd, 'node_modules', '.bin', isWindows ? 'electron.cmd' : 'electron');
const electronPackageDir = path.join(cwd, 'node_modules', 'electron');
const electronPathTxt = path.join(electronPackageDir, 'path.txt');

function runCommand(label, command, args) {
  console.log(`\n[Yang-Kura] ${label}`);
  const result = isWindows && command.toLowerCase().endsWith('.cmd')
    ? spawnSync('cmd.exe', ['/d', '/c', command, ...args], {
        cwd,
        stdio: 'inherit',
        shell: false,
        env: process.env,
      })
    : spawnSync(command, args, {
        cwd,
        stdio: 'inherit',
        shell: false,
        env: process.env,
      });

  if (result.error) {
    console.error(`[Yang-Kura] ${label} failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[Yang-Kura] ${label} failed with exit ${result.status ?? 'unknown'}.`);
    process.exit(result.status ?? 1);
  }
}

function getElectronResolvedBinaryCandidatePaths() {
  if (!fs.existsSync(electronPathTxt)) return [];
  const relativeBinary = fs.readFileSync(electronPathTxt, 'utf8').trim();
  if (!relativeBinary) return [];
  if (path.isAbsolute(relativeBinary)) return [relativeBinary];

  // MVP-63: Electron on Windows can write `electron.exe` to path.txt while
  // the real binary lives under node_modules/electron/dist/electron.exe.
  // Prefer dist/<basename> for basename-only metadata, then keep the legacy
  // package-root fallback for older Electron metadata shapes.
  const normalized = relativeBinary.replace(/\\/g, '/');
  const hasDirectorySegment = normalized.includes('/');
  const basename = path.basename(relativeBinary);
  const candidates = hasDirectorySegment
    ? [path.join(electronPackageDir, relativeBinary)]
    : [
        path.join(electronPackageDir, 'dist', basename),
        path.join(electronPackageDir, relativeBinary),
      ];

  return [...new Set(candidates)];
}

function getElectronResolvedBinaryPath() {
  return getElectronResolvedBinaryCandidatePaths().find((candidate) => fs.existsSync(candidate)) ?? null;
}

function runElectronVersion() {
  if (!fs.existsSync(electronCommand)) {
    console.error('[Yang-Kura] Electron CLI wrapper is still missing after setup.');
    process.exit(1);
  }
  const binaryPath = getElectronResolvedBinaryPath();
  if (!binaryPath || !fs.existsSync(binaryPath)) {
    console.error('[Yang-Kura] Electron binary metadata is incomplete after setup.');
    console.error('[Yang-Kura] Expected node_modules/electron/path.txt and the resolved Electron executable.');
    console.error(`[Yang-Kura] Candidate paths: ${getElectronResolvedBinaryCandidatePaths().join(' | ') || '<none>'}`);
    process.exit(1);
  }

  const result = isWindows
    ? spawnSync('cmd.exe', ['/d', '/c', electronCommand, '--version'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      })
    : spawnSync(electronCommand, ['--version'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      });

  if (result.error) {
    console.error(`[Yang-Kura] Electron --version failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    const detail = `${result.stderr || result.stdout || ''}`.trim();
    console.error(`[Yang-Kura] Electron --version exited ${result.status}${detail ? `: ${detail}` : ''}`);
    process.exit(result.status ?? 1);
  }

  console.log(`[Yang-Kura] Electron ready: ${`${result.stdout || ''}`.trim()}`);
  console.log(`[Yang-Kura] Resolved binary: ${binaryPath}`);
}

console.log('[Yang-Kura] Desktop setup starts.');
console.log('[Yang-Kura] This script intentionally runs npm install + npm rebuild electron because npm ci --ignore-scripts can leave Electron incomplete on Windows.');
console.log('[Yang-Kura] Final validation runs electron --version.');
runCommand('Installing / refreshing Electron dependency', npmCommand, ['install', 'electron@^39.8.10', '--save-dev']);
runCommand('Rebuilding Electron binary metadata', npmCommand, ['rebuild', 'electron']);
runCommand('Patching electron-builder blockmap compatibility', process.execPath, [path.join(cwd, 'scripts', 'patch-electron-builder-mvp29.mjs')]);
runElectronVersion();
console.log('\n[Yang-Kura] Desktop setup completed. You can now run: npm run desktop:smoke-check:strict');
