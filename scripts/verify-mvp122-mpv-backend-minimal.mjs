import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp122-mpv-backend-minimal')) throw new Error('verify:stable missing MVP122');

for (const [file, markers] of [
  ['electron/mpvPlaybackBackend.ts', ['class MpvPlaybackBackend', '--input-ipc-server=', "command: 'seek'", "backend: 'html-audio-fallback'", 'YANG_KURA_MPV_PATH']],
  ['electron/main.ts', ['registerMpvPlaybackIpc', 'resolveSafeMpvAudioPath', 'yang-kura:player:mpv:start', 'canUseMpvPlayback: true']],
  ['electron/preload.ts', ['requestMpvPlaybackStart', 'requestMpvPlaybackCommand', 'onMpvPlaybackEvent']],
  ['src/types/electron-api.d.ts', ['YangKuraMpvPlaybackStartRequest', 'YangKuraMpvPlaybackEvent', 'getMpvPlaybackStatus']],
  ['src/hooks/useAudioPlayer.ts', ["playbackMode: 'mpv'", 'requestMpvPlaybackStart', 'HTMLAudio', 'onMpvPlaybackEvent']],
  ['docs/MPV_BACKEND_MINIMAL_MVP122.md', ['mpv 子进程', 'HTMLAudio fallback', 'rootPathToken']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const mainText = fs.readFileSync('electron/main.ts', 'utf8');
if (mainText.includes('absolutePathReturned: true') || mainText.includes('fileUrlReturned: true')) throw new Error('renderer path safety regression');
const backendText = fs.readFileSync('electron/mpvPlaybackBackend.ts', 'utf8');
if (!backendText.includes("spawn(executable, args")) throw new Error('mpv must use argument-array spawn');
if (backendText.includes('exec(') || backendText.includes('shell: true')) throw new Error('unsafe shell execution detected');

if (process.platform !== 'win32') {
  const compiled = path.resolve('dist-electron/mpvPlaybackBackend.js');
  if (!fs.existsSync(compiled)) throw new Error('compiled mpv backend missing; run build:electron first');
  const fakeMpv = path.resolve('tests/fixtures/mpv/fake-mpv.mjs');
  fs.chmodSync(fakeMpv, 0o755);
  process.env.YANG_KURA_MPV_PATH = fakeMpv;
  const { MpvPlaybackBackend } = await import(`${pathToFileURL(compiled).href}?mvp122=${Date.now()}`);
  const events = [];
  const backend = new MpvPlaybackBackend((event) => events.push(event));
  const start = await backend.start({
    trackId: 'fixture-track',
    absolutePath: path.resolve('tests/fixtures/library_sample/RJ01234567_雨音耳かき/01_本編.mp3'),
    startSeconds: 7,
    volume: 0.5,
    muted: false,
  });
  if (!start.ok || start.backend !== 'mpv') throw new Error(`fake mpv start failed: ${start.message}`);
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (!events.some((event) => event.type === 'ready')) throw new Error('mpv ready event missing');
  if (!events.some((event) => event.type === 'duration' && event.durationSeconds === 123.5)) throw new Error('mpv duration event missing');
  const seek = await backend.command({ command: 'seek', seconds: 33 });
  const pause = await backend.command({ command: 'pause' });
  if (!seek.ok || !pause.ok) throw new Error('mpv command failed');
  await new Promise((resolve) => setTimeout(resolve, 120));
  if (!events.some((event) => event.type === 'time' && event.positionSeconds === 33)) throw new Error('mpv seek event missing');
  if (!events.some((event) => event.type === 'pause-state' && event.paused === true)) throw new Error('mpv pause event missing');
  await backend.dispose();

  process.env.YANG_KURA_MPV_PATH = path.resolve('tests/fixtures/mpv/missing-mpv-executable');
  const unavailable = new MpvPlaybackBackend(() => undefined);
  const fallback = await unavailable.start({ trackId: 'fallback-track', absolutePath: '/tmp/fallback.mp3', startSeconds: 0, volume: 0.75, muted: false });
  if (fallback.ok || fallback.backend !== 'html-audio-fallback') throw new Error('missing mpv must select HTMLAudio fallback');
  await unavailable.dispose();
}

console.log('MVP122 mpv backend minimal verification PASS');
