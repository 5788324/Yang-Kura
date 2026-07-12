import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function waitFor(predicate, timeoutMs, label) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const value = predicate();
      if (value) return resolve(value);
      if (Date.now() - startedAt >= timeoutMs) return reject(new Error(`${label} timeout`));
      setTimeout(tick, 50);
    };
    tick();
  });
}

function requireAudio(input, label) {
  if (!input) return null;
  if (!fs.existsSync(input) || !fs.statSync(input).isFile()) {
    throw new Error(`${label} ${path.basename(input)} does not exist`);
  }
  return input;
}

const force = process.env.YANG_KURA_MPV_TEST_FORCE === '1';
if (process.platform !== 'win32' && !force) {
  console.log('MVP125 player acceptance SKIP: current platform is not Windows.');
  process.exit(0);
}

const firstAudio = requireAudio(process.env.YANG_KURA_MPV_TEST_AUDIO, 'sample');
if (!firstAudio) {
  console.log('MVP125 player acceptance SKIP: set YANG_KURA_MPV_TEST_AUDIO to one small audio file.');
  console.log('Optional: set YANG_KURA_MPV_TEST_AUDIO_2 to verify queue switching.');
  process.exit(0);
}
const secondAudio = requireAudio(process.env.YANG_KURA_MPV_TEST_AUDIO_2, 'second sample');
const executable = process.env.YANG_KURA_MPV_PATH || 'mpv.exe';
const executableLabel = path.basename(executable) || 'mpv.exe';
const compiled = path.resolve('dist-electron/mpvPlaybackBackend.js');
if (!fs.existsSync(compiled)) throw new Error('compiled mpv backend missing; run build:electron first');

const { MpvPlaybackBackend } = await import(`${pathToFileURL(compiled).href}?mvp125=${Date.now()}`);
const events = [];
const backend = new MpvPlaybackBackend((event) => events.push(event), () => executable);
const startedAt = Date.now();

try {
  const first = await backend.start({
    trackId: 'mvp125-track-1',
    absolutePath: firstAudio,
    startSeconds: Math.max(0, Number(process.env.YANG_KURA_MPV_TEST_RESUME_SECONDS) || 0),
    volume: 0.25,
    muted: false,
  });
  if (!first.ok) throw new Error(first.message);
  await waitFor(() => events.find((event) => event.type === 'ready' && event.trackId === 'mvp125-track-1'), 8_000, 'first ready');
  await waitFor(() => events.find((event) => event.type === 'time' && event.trackId === 'mvp125-track-1'), 8_000, 'first progress');

  await backend.command({ command: 'pause' });
  await waitFor(() => events.find((event) => event.type === 'pause-state' && event.trackId === 'mvp125-track-1' && event.paused), 4_000, 'pause state');
  await backend.command({ command: 'seek', seconds: 1 });
  await new Promise((resolve) => setTimeout(resolve, 150));
  await backend.command({ command: 'resume' });
  await waitFor(() => events.find((event) => event.type === 'pause-state' && event.trackId === 'mvp125-track-1' && !event.paused), 4_000, 'resume state');

  if (secondAudio) {
    const second = await backend.start({
      trackId: 'mvp125-track-2',
      absolutePath: secondAudio,
      startSeconds: 0,
      volume: 0.25,
      muted: false,
    });
    if (!second.ok) throw new Error(second.message);
    await waitFor(() => events.find((event) => event.type === 'ready' && event.trackId === 'mvp125-track-2'), 8_000, 'second ready');
    if (backend.getRuntimeStatus().activeTrackId !== 'mvp125-track-2') throw new Error('queue switch did not update active track');
  }

  await backend.dispose();
  const disposed = backend.getRuntimeStatus();
  if (disposed.running || disposed.connected || disposed.activeTrackId) {
    throw new Error('mpv process or IPC remained active after disposal');
  }

  console.log(`MVP125 mpv executable PASS: ${executableLabel}`);
  console.log(`MVP125 progress/pause/seek PASS: ${path.basename(firstAudio)}`);
  console.log(secondAudio ? `MVP125 queue switch PASS: ${path.basename(secondAudio)}` : 'MVP125 queue switch SKIP: no second sample provided.');
  console.log(`MVP125 process cleanup PASS: ${disposed.shutdownState}`);
  console.log(`MVP125 player acceptance PASS: ${Date.now() - startedAt}ms`);
} catch (error) {
  await backend.dispose().catch(() => undefined);
  console.error(`MVP125 player acceptance FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
