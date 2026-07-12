import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp125-player-acceptance')) throw new Error('verify:stable missing MVP125');
if (!pkg.scripts?.['test:mpv:acceptance']) throw new Error('MVP125 acceptance command missing');

for (const [file, markers] of [
  ['scripts/mpv-windows-acceptance-check.mjs', ['YANG_KURA_MPV_TEST_AUDIO', 'YANG_KURA_MPV_TEST_AUDIO_2', 'waitFor', 'queue switch', 'backend.dispose()', 'path.basename']],
  ['src/services/playerAcceptanceService.ts', ['进度恢复', '队列切歌', '退出残留', 'npm run test:mpv:acceptance']],
  ['src/components/SettingsPage.tsx', ['mvp125-player-acceptance-checklist', 'playerAcceptanceService.checks', 'YANG_KURA_MPV_TEST_AUDIO_2']],
  ['docs/PLAYER_ACCEPTANCE_MVP125.md', ['进度恢复', '队列切歌', '退出残留', '不扫描资源库']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const acceptance = fs.readFileSync('scripts/mpv-windows-acceptance-check.mjs', 'utf8');
if (acceptance.includes('absolutePathReturned: true') || acceptance.includes('file://')) throw new Error('path exposure marker in acceptance tool');
if (acceptance.includes('shell: true') || acceptance.includes('exec(')) throw new Error('unsafe process execution in acceptance tool');

const runtime = spawnSync(process.execPath, ['scripts/test-mpv-stability-runtime.mjs'], { encoding: 'utf8' });
if (runtime.status !== 0) throw new Error(runtime.stderr || runtime.stdout || 'MVP124 runtime regression failed');

console.log('MVP125 player acceptance verification PASS');
