import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp124-mpv-windows-stability')) throw new Error('verify:stable missing MVP124');
if (!pkg.scripts?.['test:mpv:stability-runtime']) throw new Error('mpv stability runtime test missing');

for (const [file, markers] of [
  ['electron/mpvPlaybackBackend.ts', ['SEEK_COALESCE_MS', "'absolute+exact'", 'fallback-requested', 'waitForChildExit', "this.shutdownState = 'forced'", 'shell: false']],
  ['electron/main.ts', ['getMpvRuntimeDetails', 'allowQuitAfterMpvCleanup', 'event.preventDefault()', 'mpvPlaybackBackend.dispose()']],
  ['src/services/mpvPlaybackPreferenceService.ts', ['prefer-mpv', 'html-audio-only', 'yang-kura-mpv-playback-preference-changed']],
  ['src/hooks/useAudioPlayer.ts', ['mpvPlaybackPreferenceService.shouldAttemptMpv', 'forceHtmlFallbackTrackRef', "event.type === 'fallback-requested'", 'playbackNotice']],
  ['src/components/SettingsPage.tsx', ['mvp124-mpv-backend-preference', '仅使用 HTMLAudio', 'mvp124-mpv-stability-diagnostics']],
  ['src/components/PlayerBar.tsx', ['playerState.playbackNotice']],
  ['src/components/PlayerBarPrimarySections.tsx', ['播放提示：', 'playbackNotice']],
  ['src/types/electron-api.d.ts', ['coalesced-absolute-exact', 'fallback-requested', 'lastExitReason', 'shutdownState']],
  ['tests/fixtures/mpv/fake-mpv-stability.mjs', ['43_200', 'YANG_KURA_FAKE_MPV_EXIT_AFTER_LOAD', "command[0] === 'quit'"]],
  ['docs/MPV_WINDOWS_STABILITY_MVP124.md', ['长音频 seek', '进程退出回收', 'HTMLAudio', '后端偏好']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const backend = fs.readFileSync('electron/mpvPlaybackBackend.ts', 'utf8');
if (backend.includes("['seek', seconds, 'absolute', 'exact']")) throw new Error('legacy invalid multi-flag seek command remains');
if (backend.includes('shell: true') || backend.includes('exec(')) throw new Error('unsafe process execution regression');
const main = fs.readFileSync('electron/main.ts', 'utf8');
if (main.includes('absolutePathReturned: true') || main.includes('fileUrlReturned: true')) throw new Error('renderer path safety regression');

const runtime = spawnSync(process.execPath, ['scripts/test-mpv-stability-runtime.mjs'], { encoding: 'utf8' });
if (runtime.status !== 0) throw new Error(runtime.stderr || runtime.stdout || 'mpv stability runtime test failed');

console.log('MVP124 mpv Windows stability verification PASS');
