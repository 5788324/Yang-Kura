import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const compiled = path.resolve('dist-electron/mpvPlaybackBackend.js');
if (!fs.existsSync(compiled)) throw new Error('compiled mpv backend missing; run build:electron first');
if (process.platform === 'win32') {
  console.log('MVP124 runtime fixture SKIP on Windows; static verifier and real mpv tool cover Windows.');
  process.exit(0);
}

const fakeMpv = path.resolve('tests/fixtures/mpv/fake-mpv-stability.mjs');
fs.chmodSync(fakeMpv, 0o755);
const { MpvPlaybackBackend } = await import(`${pathToFileURL(compiled).href}?mvp124=${Date.now()}`);
const audioPath = path.resolve('tests/fixtures/library_sample/RJ01234567_雨音耳かき/01_本編.mp3');

const events = [];
const backend = new MpvPlaybackBackend((event) => events.push(event), () => fakeMpv);
const start = await backend.start({
  trackId: 'long-track',
  absolutePath: audioPath,
  startSeconds: 7_200,
  volume: 0.5,
  muted: false,
});
if (!start.ok) throw new Error(`stability fixture start failed: ${start.message}`);
await new Promise((resolve) => setTimeout(resolve, 140));
if (!events.some((event) => event.type === 'duration' && event.durationSeconds === 43_200)) throw new Error('long duration event missing');

const eventCountBeforeRapidSeek = events.length;
await Promise.all([
  backend.command({ command: 'seek', seconds: 3_600 }),
  backend.command({ command: 'seek', seconds: 18_000 }),
  backend.command({ command: 'seek', seconds: 90_000 }),
]);
await new Promise((resolve) => setTimeout(resolve, 150));
const seekEvents = events.slice(eventCountBeforeRapidSeek).filter((event) => event.type === 'time' && event.positionSeconds >= 3_600);
if (seekEvents.length !== 1) throw new Error(`rapid seeks should coalesce to one event, got ${seekEvents.length}`);
if (seekEvents[0].positionSeconds !== 43_200) throw new Error(`long seek should clamp to duration, got ${seekEvents[0].positionSeconds}`);
const activeStatus = backend.getRuntimeStatus();
if (activeStatus.seekStrategy !== 'coalesced-absolute-exact' || activeStatus.pendingSeek) throw new Error('seek stability status invalid');
await backend.dispose();
const disposed = backend.getRuntimeStatus();
if (disposed.running || disposed.connected || disposed.activeTrackId) throw new Error('mpv process was not reclaimed');
if (!['graceful', 'forced'].includes(disposed.shutdownState)) throw new Error('shutdown state not recorded');

process.env.YANG_KURA_FAKE_MPV_EXIT_AFTER_LOAD = '1';
const fallbackEvents = [];
const crashing = new MpvPlaybackBackend((event) => fallbackEvents.push(event), () => fakeMpv);
const crashStart = await crashing.start({ trackId: 'crash-track', absolutePath: audioPath, startSeconds: 120, volume: 0.5, muted: false });
if (!crashStart.ok) throw new Error(`crash fixture failed to start: ${crashStart.message}`);
await new Promise((resolve) => setTimeout(resolve, 260));
const fallback = fallbackEvents.find((event) => event.type === 'fallback-requested');
if (!fallback || fallback.trackId !== 'crash-track') throw new Error('runtime fallback event missing after unexpected exit');
if (fallback.resumeSeconds < 0) throw new Error('fallback resume position invalid');
await crashing.dispose();
delete process.env.YANG_KURA_FAKE_MPV_EXIT_AFTER_LOAD;

console.log('MVP124 mpv stability runtime verification PASS');
