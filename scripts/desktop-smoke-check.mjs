#!/usr/bin/env node
// Legacy MVP-47 verifier anchors: MVP-47 / 打包版回归验收 / 资源库恢复提示 / Renderer never displays absolutePath or file://
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const checklistOnly = process.argv.includes('--checklist');
const strictElectron = process.argv.includes('--strict-electron') || process.env.YANG_KURA_STRICT_ELECTRON_SMOKE === '1';
const cwd = process.cwd();
const isWindows = process.platform === 'win32';
const electronBin = path.join(
  cwd,
  'node_modules',
  '.bin',
  isWindows ? 'electron.cmd' : 'electron',
);
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

  // MVP-63: Electron may write basename-only metadata such as `electron.exe`
  // while the resolved Windows binary is actually dist/electron.exe. Check
  // dist/<basename> first, then keep package-root fallback for compatibility.
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

  const electronExecutable = electronBin;
  return spawnSync(electronExecutable, ['--version'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    timeout: 15000,
  });
}

function checkElectronCli() {
  if (!fs.existsSync(electronBin)) {
    return {
      ok: false,
      reason: 'Electron CLI wrapper not found. Run npm run desktop:setup before GUI regression.',
    };
  }

  if (!fs.existsSync(electronPathTxt)) {
    return {
      ok: false,
      reason: 'Electron path.txt not found. Run npm run desktop:setup; it runs npm rebuild electron after install.',
    };
  }

  const binaryPath = getElectronResolvedBinaryPath();
  if (!binaryPath || !fs.existsSync(binaryPath)) {
    return {
      ok: false,
      reason: `Electron resolved binary is missing. Candidate paths: ${getElectronResolvedBinaryCandidatePaths().join(' | ') || '<none>'}. Run npm run desktop:setup; it validates path.txt and electron --version.`,
    };
  }

  const result = spawnElectronVersion();

  if (result.error) {
    return {
      ok: false,
      reason: `Electron CLI could not start: ${result.error.message}. On Windows the .cmd wrapper must be launched via cmd.exe /d /c; run npm run desktop:setup, then retry.`,
    };
  }
  if (result.status !== 0) {
    const detail = `${result.stderr || result.stdout || ''}`.trim();
    return {
      ok: false,
      reason: `Electron CLI failed --version with exit ${result.status}${detail ? `: ${detail}` : ''}`,
    };
  }

  return {
    ok: true,
    version: `${result.stdout || ''}`.trim(),
    binaryPath,
  };
}

const pkg = readJson('package.json');
const electronCli = checkElectronCli();
const checks = [
  ['package.json', exists('package.json'), 'required source file'],
  ['dist frontend build', exists('dist/index.html'), 'run npm run build first for desktop preview / packaging'],
  ['dist-electron main build', exists('dist-electron/main.js'), 'run npm run build:electron first'],
  ['dist-electron preload build', exists('dist-electron/preload.js'), 'run npm run build:electron first'],
  ['Electron CLI wrapper exists', fs.existsSync(electronBin), 'run npm run desktop:setup before GUI regression'],
  ['Electron binary metadata path.txt exists', fs.existsSync(electronPathTxt), 'desktop:setup runs npm rebuild electron and resolves basename-only path.txt through dist/<binary>'],
  ['Electron resolved binary exists', Boolean(electronCli.binaryPath && fs.existsSync(electronCli.binaryPath)), electronCli.binaryPath || 'resolved binary unavailable before setup'],
  ['Electron CLI launches --version', electronCli.ok, electronCli.ok ? electronCli.version : electronCli.reason],
  ['MVP129 stable release docs', exists('docs/STABLE_RELEASE_MVP129.md'), 'current release summary'],
  ['MVP129 Windows stabilization docs', exists('docs/STABILIZATION_ROUND4_WINDOWS_RELEASE_FIX.md'), 'Round 4 release fix record'],
  ['MVP129 current state docs', exists('PROJECT_STATE.md') && exists('NEXT_CHAT_HANDOFF.md'), 'active handoff entrypoints'],
  ['MVP130 no-merge boundary', exists('MVP130_EXPERIMENTAL_DO_NOT_MERGE.md'), 'experimental downloader must remain separate'],
  ['Legacy history archive', exists('archive/legacy-mvp-history/README.md'), 'MVP01-MVP111 traceability archive'],
];

console.log('Yang-Kura MVP129 稳定候选启动验收状态');
console.log(`package: ${pkg.name}@${pkg.version}`);
console.log(`platform: ${process.platform} ${process.arch}`);
console.log(`node: ${process.version}`);
console.log(`strict electron smoke: ${strictElectron ? 'yes' : 'no'}`);
for (const [label, ok, detail] of checks) {
  console.log(`${ok ? 'PASS' : 'WARN'} ${label}${detail ? ` — ${detail}` : ''}`);
}

const electronFailures = checks.filter(([label, ok]) => !ok && String(label).startsWith('Electron'));
if (strictElectron && electronFailures.length) {
  console.error('\n[Yang-Kura] Strict Electron smoke failed. Run npm run desktop:setup, then retry npm run desktop:smoke-check:strict. desktop:setup resolves Electron binary metadata and verifies the electron-builder compatibility patch.');
  process.exit(1);
}

console.log('\nRecommended local validation flow / 推荐本机验证流程:');
console.log('1. nvm use 22  # 推荐 Node 22.12+ LTS；正式门禁仍是 node 22.x / npm 10.x');
console.log('2. npm ci --ignore-scripts');
console.log('3. npm run lint');
console.log('4. npm run build:electron');
console.log('5. npm run verify:stable  # 当前稳定回归链；verify:all 是兼容别名');
console.log('6. npm audit --audit-level=high');
console.log('7. npm run desktop:setup  # 安装 / rebuild / 验证 Electron binary，用于真实 GUI 回归（legacy: npm run electron:install）');
console.log('8. npm run desktop:smoke-check:strict');
console.log('9. npm run dev:electron  # alias: npm run desktop:dev');
console.log('10. 如果 3000 端口占用，先关闭占用进程，或设置 YANG_KURA_VITE_DEV_URL=http://127.0.0.1:3001 后重试。');
console.log('11. 选择小样本资源库：Dry-run scan → 写入 / 读取 library-index.json → 播放音频 → 读取字幕 → 外部打开视频 / 图片。');

if (checklistOnly) {
  console.log('\nManual acceptance checklist / 打包版回归验收清单:');
  console.log('- 使用 Node 22 LTS / npm 10.x 环境。');
  console.log('- npm run desktop:setup 后，npm run desktop:smoke-check:strict 必须通过。');
  console.log('- npm run dev:electron 可以启动 Electron 窗口；它等价于 npm run desktop:dev。');
  console.log('- 打开前确认 3000 端口未被占用，或设置 YANG_KURA_VITE_DEV_URL 到空闲端口。');
  console.log('- 打包版启动后窗口不黑屏，首页 / 设置 / 诊断均可进入。');
  console.log('- 设置页可以重新选择同一个资源库，并看到资源库恢复提示。');
  console.log('- Renderer never displays absolutePath or file://.');
  console.log('- 小样本目录 dry-run 可以完成。');
  console.log('- library-index.json 只在确认后写入。');
  console.log('- UI 可以读取真实 index 并显示音声库 / 音乐库记录。');
  console.log('- HTMLAudio 至少能播放一个 mp3 / wav / flac / m4a 文件。');
  console.log('- 存在同名 LRC / SRT / VTT / ASS 时可以读取字幕。');
  console.log('- 视频 / 图片通过系统外部应用打开。');
  console.log('- 不暴露删除 / 移动 / 重命名真实媒体文件的入口。');
}

// Strict mode validates path.txt, resolved Electron executable, and electron --version before GUI regression.
// Windows .cmd wrappers are launched through cmd.exe /d /c to avoid EINVAL.
// This script remains advisory by default so source verification can run without a GUI.
// Use --strict-electron or npm run desktop:smoke-check:strict for real local GUI regression.
