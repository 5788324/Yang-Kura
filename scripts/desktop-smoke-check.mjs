#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const checklistOnly = process.argv.includes('--checklist');
const strictElectron = process.argv.includes('--strict-electron') || process.env.YANG_KURA_STRICT_ELECTRON_SMOKE === '1';
const cwd = process.cwd();
const isWindows = process.platform === 'win32';
const electronBin = path.join(cwd, 'node_modules', '.bin', isWindows ? 'electron.cmd' : 'electron');
const electronPackageDir = path.join(cwd, 'node_modules', 'electron');
const electronPathTxt = path.join(electronPackageDir, 'path.txt');

function exists(relativePath) {
  return fs.existsSync(path.join(cwd, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(cwd, relativePath), 'utf8'));
}

function getElectronResolvedBinaryCandidatePaths() {
  if (!fs.existsSync(electronPathTxt)) return [];
  const relativeBinary = fs.readFileSync(electronPathTxt, 'utf8').trim();
  if (!relativeBinary) return [];
  if (path.isAbsolute(relativeBinary)) return [relativeBinary];

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

function spawnElectronVersion() {
  if (isWindows) {
    return spawnSync('cmd.exe', ['/d', '/c', electronBin, '--version'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      timeout: 15000,
    });
  }

  return spawnSync(electronBin, ['--version'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    timeout: 15000,
  });
}

function checkElectronCli() {
  if (!fs.existsSync(electronBin)) {
    return { ok: false, reason: 'Electron CLI wrapper not found. Run npm run desktop:setup before GUI regression.' };
  }
  if (!fs.existsSync(electronPathTxt)) {
    return { ok: false, reason: 'Electron path.txt not found. Run npm run desktop:setup before GUI regression.' };
  }

  const binaryPath = getElectronResolvedBinaryPath();
  if (!binaryPath) {
    return {
      ok: false,
      reason: `Electron resolved binary is missing. Candidate paths: ${getElectronResolvedBinaryCandidatePaths().join(' | ') || '<none>'}.`,
    };
  }

  const result = spawnElectronVersion();
  if (result.error) return { ok: false, reason: `Electron --version failed: ${result.error.message}` };
  if (result.status !== 0) {
    const detail = `${result.stderr || result.stdout || ''}`.trim();
    return { ok: false, reason: `Electron --version exited ${result.status}${detail ? `: ${detail}` : ''}` };
  }
  return { ok: true, version: `${result.stdout || ''}`.trim(), binaryPath };
}

const pkg = readJson('package.json');
const electronCli = checkElectronCli();
const checks = [
  ['package.json', exists('package.json'), 'current package manifest'],
  ['Kura 2.0 start entry', exists('START_HERE.md'), 'new-conversation entrypoint'],
  ['Kura 2.0 project state', exists('PROJECT_STATE.md'), 'current facts and blockers'],
  ['Kura 2.0 task queue', exists('TASKS.md'), 'single active task queue'],
  ['Kura 2.0 roadmap', exists('PROJECT_ROADMAP.md'), 'R1-R9 development plan'],
  ['Current AI handoff', exists('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md'), 'self-contained handoff'],
  ['Desktop 2.0 audit', exists('docs/DESKTOP2_AUDIT.md'), 'current K2-R1 technical audit'],
  ['Renderer build output', exists('dist/index.html'), 'run npm run build first for desktop preview / packaging'],
  ['Electron main build output', exists('dist-electron/main.js'), 'run npm run build:electron first'],
  ['Electron preload build output', exists('dist-electron/preload.js'), 'run npm run build:electron first'],
  ['Electron CLI wrapper', fs.existsSync(electronBin), 'run npm run desktop:setup before GUI regression'],
  ['Electron binary metadata', fs.existsSync(electronPathTxt), 'desktop:setup must prepare Electron runtime'],
  ['Electron resolved binary', Boolean(electronCli.binaryPath), electronCli.binaryPath || 'resolved binary unavailable before setup'],
  ['Electron launches --version', electronCli.ok, electronCli.ok ? electronCli.version : electronCli.reason],
];

console.log('Yang-Kura Desktop 2.0 smoke status');
console.log(`package: ${pkg.name}@${pkg.version}`);
console.log(`platform: ${process.platform} ${process.arch}`);
console.log(`node: ${process.version}`);
console.log(`strict electron smoke: ${strictElectron ? 'yes' : 'no'}`);
for (const [label, ok, detail] of checks) {
  console.log(`${ok ? 'PASS' : 'WARN'} ${label}${detail ? ` — ${detail}` : ''}`);
}

const currentProjectFailures = checks.filter(([label, ok]) => !ok && !String(label).includes('build output') && !String(label).startsWith('Electron'));
if (currentProjectFailures.length) {
  console.error('\n[Yang-Kura] Current Kura 2.0 project files are incomplete.');
  process.exit(1);
}

const electronFailures = checks.filter(([label, ok]) => !ok && String(label).startsWith('Electron'));
if (strictElectron && electronFailures.length) {
  console.error('\n[Yang-Kura] Strict Electron smoke failed. Run npm run desktop:setup, then retry.');
  process.exit(1);
}

console.log('\nRecommended development validation flow:');
console.log('1. Node 22.x / npm 10.x');
console.log('2. npm ci --ignore-scripts');
console.log('3. npm run lint');
console.log('4. npm run build');
console.log('5. npm run build:electron');
console.log('6. npm run verify:handoff');
console.log('7. npm run verify:stable');
console.log('8. npm run desktop:setup  # only when Electron GUI/runtime validation is needed');
console.log('9. npm run desktop:smoke-check:strict');
console.log('10. npm run dev:electron');

if (checklistOnly) {
  console.log('\nKura Desktop 2.0 manual acceptance checklist:');
  console.log('- Application opens without black screen and the main routes are reachable.');
  console.log('- Current handoff/state/tasks/roadmap are present; no legacy archive is required to run the product.');
  console.log('- Renderer never displays absolutePath or file:// for local media.');
  console.log('- Existing library-index.json can be read without mutating media files.');
  console.log('- Player can play a tokenized local audio item and seek/resume normally.');
  console.log('- LRC/SRT/VTT/ASS subtitle loading still works.');
  console.log('- Importer copy/move operations preserve confirmation, conflict and rollback boundaries.');
  console.log('- No routine maintenance action deletes, renames, moves or overwrites media without explicit user intent.');
  console.log('- For K2-R1 real-library inventory, run audit:k2-r1-library separately against the selected library root.');
}
