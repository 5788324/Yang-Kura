import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp123-mpv-settings-detection')) throw new Error('verify:stable missing MVP123');
if (!pkg.scripts?.['test:mpv:windows']) throw new Error('Windows mpv sample tool missing');

for (const [file, markers] of [
  ['electron/mpvSettingsStore.ts', ['class MpvSettingsStore', 'mvp123-mpv-installation-status', "spawn(executable, ['--version']", 'absolutePathReturned: false']],
  ['electron/mpvPlaybackBackend.ts', ['resolveExecutable', 'this.resolveExecutable()']],
  ['electron/main.ts', ['registerMpvSettingsIpc', "registerPlayerHandler('mpvSelectExecutable'", 'mpv-settings.json', 'mpvSettingsStore.initialize()']],
  ['electron/ipc/contracts.ts', ["mpvSelectExecutable: 'yang-kura:player:mpv:select-executable'", "mpvClearExecutable: 'yang-kura:player:mpv:clear-executable'"]],
  ['electron/preload.ts', ['getMpvInstallationStatus', 'selectMpvExecutable', 'clearMpvExecutable', 'canConfigureMpvExecutable: true']],
  ['src/types/electron-api.d.ts', ['YangKuraMpvInstallationStatus', 'selectMpvExecutable', 'canConfigureMpvExecutable: true']],
  ['src/components/SettingsPage.tsx', ['mvp123-mpv-settings-status', '选择 mpv.exe', 'HTMLAudio 回退', 'mvp123-mpv-windows-sample-check']],
  ['scripts/mpv-windows-sample-check.mjs', ['YANG_KURA_MPV_TEST_AUDIO', '--ao=null', '--length=0.5', 'path.basename']],
  ['docs/MPV_SETTINGS_DETECTION_MVP123.md', ['路径只保存在 Electron main', 'HTMLAudio', 'test:mpv:windows']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
if (main.includes('absolutePathReturned: true') || main.includes('fileUrlReturned: true')) throw new Error('path safety regression');
const store = fs.readFileSync('electron/mpvSettingsStore.ts', 'utf8');
if (store.includes('shell: true') || store.includes('exec(')) throw new Error('unsafe mpv detection execution');

const runtime = spawnSync(process.execPath, ['scripts/test-mpv-settings-runtime.mjs'], { encoding: 'utf8' });
if (runtime.status !== 0) throw new Error(runtime.stderr || runtime.stdout || 'mpv settings runtime test failed');

console.log('MVP123 mpv settings and detection verification PASS');
