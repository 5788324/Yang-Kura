#!/usr/bin/env node
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { syncBuiltinESMExports } from 'node:module';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'beta3-rj-detail-playback-entry');
const artifactPath = path.join(artifactDir, 'diagnostic-probe.json');
fs.mkdirSync(artifactDir, { recursive: true });

const probe = {
  schemaVersion: 1,
  startedAt: new Date().toISOString(),
  head: process.env.GITHUB_SHA ?? null,
  installResults: [],
  snapshots: [],
  latestSnapshot: null,
  rendererConsole: [],
  rendererExceptions: [],
  electronStdout: [],
  electronStderr: [],
  probeErrors: [],
};

let lastSnapshotSignature = '';
let flushed = false;

function cap(list, max = 500) {
  if (list.length > max) list.splice(0, list.length - max);
}

function flush() {
  try {
    probe.finishedAt = new Date().toISOString();
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(artifactPath, `${JSON.stringify(probe, null, 2)}\n`, 'utf8');
    flushed = true;
  } catch (error) {
    if (!flushed) process.stderr.write(`[beta3-probe] write failed: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

function collectStream(stream, target) {
  if (!stream) return;
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (!line) continue;
      target.push({ at: new Date().toISOString(), line });
      cap(target);
    }
  });
}

const originalSpawn = childProcess.spawn;
childProcess.spawn = function patchedSpawn(...args) {
  const child = originalSpawn.apply(this, args);
  const executable = String(args[0] ?? '').toLowerCase();
  if (executable.includes('electron')) {
    collectStream(child.stdout, probe.electronStdout);
    collectStream(child.stderr, probe.electronStderr);
    child.once('exit', (code, signal) => {
      probe.electronExit = { at: new Date().toISOString(), code, signal };
      flush();
    });
  }
  return child;
};
syncBuiltinESMExports();

const INSTALL_EXPRESSION = String.raw`(() => {
  if (window.__YANG_KURA_BETA3_PROBE__) return { alreadyInstalled: true };
  const events = [];
  const attachedMedia = new WeakSet();
  const maxEvents = 500;
  const stamp = () => new Date().toISOString();
  const push = (kind, detail = {}) => {
    events.push({ at: stamp(), kind, detail });
    if (events.length > maxEvents) events.splice(0, events.length - maxEvents);
  };
  const basename = (value) => {
    if (!value) return '';
    try {
      const parsed = new URL(value);
      return parsed.protocol + '//' + (parsed.pathname.split('/').at(-1) || '');
    } catch {
      return String(value).split(/[\\/]/).at(-1) || '';
    }
  };
  const mediaState = (media) => ({
    trackId: media.dataset?.yangKuraTrackId ?? '',
    src: basename(media.src),
    currentSrc: basename(media.currentSrc),
    readyState: media.readyState,
    networkState: media.networkState,
    duration: Number.isFinite(media.duration) ? media.duration : null,
    currentTime: Number.isFinite(media.currentTime) ? media.currentTime : null,
    paused: media.paused,
    ended: media.ended,
    error: media.error ? { code: media.error.code, message: media.error.message || '' } : null,
  });
  const attachMedia = (media) => {
    if (!(media instanceof HTMLMediaElement) || attachedMedia.has(media)) return;
    attachedMedia.add(media);
    for (const type of [
      'loadstart', 'emptied', 'loadedmetadata', 'durationchange', 'loadeddata',
      'canplay', 'play', 'playing', 'pause', 'stalled', 'suspend', 'abort',
      'error', 'ended',
    ]) {
      media.addEventListener(type, () => push('media-event', { type, ...mediaState(media) }));
    }
    media.addEventListener('timeupdate', () => {
      const latest = events.at(-1);
      const detail = mediaState(media);
      if (latest?.kind === 'media-timeupdate' && latest.detail.trackId === detail.trackId) {
        latest.at = stamp();
        latest.detail = detail;
      } else {
        push('media-timeupdate', detail);
      }
    });
    push('media-attached', mediaState(media));
  };

  const originalLoad = HTMLMediaElement.prototype.load;
  HTMLMediaElement.prototype.load = function (...args) {
    attachMedia(this);
    push('media-load-call', mediaState(this));
    return originalLoad.apply(this, args);
  };
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    attachMedia(this);
    push('media-play-call', mediaState(this));
    try {
      const result = originalPlay.apply(this, args);
      Promise.resolve(result).then(
        () => push('media-play-result', { ok: true, ...mediaState(this) }),
        (error) => push('media-play-result', {
          ok: false,
          message: error instanceof Error ? error.message : String(error),
          ...mediaState(this),
        }),
      );
      return result;
    } catch (error) {
      push('media-play-result', {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
        ...mediaState(this),
      });
      throw error;
    }
  };
  const originalPause = HTMLMediaElement.prototype.pause;
  HTMLMediaElement.prototype.pause = function (...args) {
    attachMedia(this);
    push('media-pause-call', mediaState(this));
    return originalPause.apply(this, args);
  };

  const api = window.yangKura;
  const requestSummary = (payload) => payload && typeof payload === 'object' ? {
    mode: payload.mode ?? null,
    trackId: payload.trackId ?? null,
    relativePath: payload.relativePath ? String(payload.relativePath).split(/[\\/]/).at(-1) : null,
    command: payload.command ?? null,
    startSeconds: payload.startSeconds ?? null,
  } : payload;
  const resultSummary = (result) => result && typeof result === 'object' ? {
    ok: result.ok ?? null,
    message: result.message ?? null,
    extension: result.extension ?? null,
    mediaUrl: basename(result.mediaUrl),
  } : result;
  const wrap = (name) => {
    const original = api?.[name];
    if (typeof original !== 'function') return;
    try {
      api[name] = async (...args) => {
        push('ipc-request', { name, payload: requestSummary(args[0]) });
        try {
          const result = await original.apply(api, args);
          push('ipc-result', { name, result: resultSummary(result) });
          return result;
        } catch (error) {
          push('ipc-result', { name, error: error instanceof Error ? error.message : String(error) });
          throw error;
        }
      };
    } catch (error) {
      push('probe-warning', { name, message: error instanceof Error ? error.message : String(error) });
    }
  };
  wrap('requestResolveTrackMediaUrl');
  wrap('requestMpvPlaybackStart');
  wrap('requestMpvPlaybackCommand');

  if (typeof api?.onMpvPlaybackEvent === 'function') {
    try {
      api.onMpvPlaybackEvent((event) => push('mpv-event', event));
    } catch (error) {
      push('probe-warning', { name: 'onMpvPlaybackEvent', message: error instanceof Error ? error.message : String(error) });
    }
  }

  window.__YANG_KURA_BETA3_PROBE__ = { installedAt: stamp(), events };
  push('probe-installed', {
    hasYangKura: Boolean(api),
    apiMethods: api ? Object.keys(api).filter((key) => typeof api[key] === 'function').sort() : [],
  });
  return { installed: true, hasYangKura: Boolean(api) };
})()`;

const SNAPSHOT_EXRESSION = String.raw`(() => {
  const bar = document.querySelector('#app-player-bar');
  const state = {
    capturedAt: new Date().toISOString(),
    location: location.href,
    probePresent: Boolean(window.__YANG_KURA_BETA3_PROBE__),
    player: {
      mode: bar?.dataset.u29PlaybackMode ?? '',
      trackId: bar?.dataset.u29TrackId ?? '',
      progress: Number(bar?.dataset.u29Progress ?? 0),
      duration: Number(bar?.dataset.u29Duration ?? 0),
      queueCount: Number(bar?.dataset.u29QueueCount ?? 0),
      currentIndex: Number(bar?.dataset.u29CurrentIndex ?? -1),
      sourceReady: bar?.dataset.u29SourceReady === 'true',
      lyricsStatus: bar?.dataset.u29LyricsStatus ?? '',
      visibleText: bar?.innerText ?? '',
    },
    events: window.__YANG_KURA_BETA3_PROBE__?.events ?? [],
    bodyTextTail: (document.body?.innerText ?? '').slice(-3000),
  };
  return state;
})()`;

const NativeWebSocket = globalThis.WebSocket;
if (typeof NativeWebSocket === 'function') {
  let nextProbeId = 900_000_000;
  globalThis.WebSocket = class DiagnosticWebSocket extends NativeWebSocket {
    constructor(url, protocols) {
      super(url, protocols);
      this.__beta3Pending = new Map();
      this.__beta3Timer = null;
      this.addEventListener('open', () => {
        const sendEval = (expression, kind) => {
          const id = nextProbeId++;
          this.__beta3Pending.set(id, kind);
          try {
            this.send(JSON.stringify({
              id,
              method: 'Runtime.evaluate',
              params: { expression, awaitPromise: true, returnByValue: true },
            }));
          } catch (error) {
            probe.probeErrors.push({ at: new Date().toISOString(), message: error instanceof Error ? error.message : String(error) });
            cap(probe.probeErrors);
          }
        };
        sendEval(INSTALL_EXPRESSION, 'install');
        this.__beta3Timer = setInterval(() => sendEval(SNAPSHOT_EXPRESSION, 'snapshot'), 250);
        this.__beta3Timer.unref?.();
      });
      this.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(String(event.data));
          if (payload.method === 'Runtime.exceptionThrown') {
            const detail = payload.params?.exceptionDetails;
            probe.rendererExceptions.push({
              at: new Date().toISOString(),
              text: detail?.text ?? 'Runtime exception',
              description: detail?.exception?.description ?? null,
              url: detail?.url ?? null,
              lineNumber: detail?.lineNumber ?? null,
            });
            cap(probe.rendererExceptions);
          }
          if (payload.method === 'Runtime.consoleAPICalled') {
            probe.rendererConsole.push({
              at: new Date().toISOString(),
              type: payload.params?.type ?? 'unknown',
              text: (payload.params?.args ?? []).map((item) => item.value ?? item.description ?? '').join(' '),
            });
            cap(probe.rendererConsole);
          }
          const kind = this.__beta3Pending.get(payload.id);
          if (!kind) return;
          this.__beta3Pending.delete(payload.id);
          const value = payload.result?.result?.value ?? null;
          if (kind === 'install') {
            probe.installResults.push({ at: new Date().toISOString(), value, error: payload.error ?? null });
            cap(probe.installResults, 20);
          } else if (kind === 'snapshot' && value) {
            probe.latestSnapshot = value;
            const signature = JSON.stringify([
              value.player?.trackId,
              value.player?.mode,
              value.player?.duration,
              Math.floor(Number(value.player?.progress ?? 0)),
              value.player?.currentIndex,
              value.events?.length,
            ]);
            if (signature !== lastSnapshotSignature) {
              lastSnapshotSignature = signature;
              probe.snapshots.push(value);
              cap(probe.snapshots, 120);
            }
            if (!value.probePresent) {
              const id = nextProbeId++;
              this.__beta3Pending.set(id, 'install');
              this.send(JSON.stringify({
                id,
                method: 'Runtime.evaluate',
                params: { expression: INSTALL_EXPRESSION, awaitPromise: true, returnByValue: true },
              }));
            }
          }
        } catch (error) {
          probe.probeErrors.push({ at: new Date().toISOString(), message: error instanceof Error ? error.message : String(error) });
          cap(probe.probeErrors);
        }
      });
      this.addEventListener('close', () => {
        if (this.__beta3Timer) clearInterval(this.__beta3Timer);
        flush();
      });
    }
  };
}

const flushTimer = setInterval(flush, 1000);
flushTimer.unref?.();
process.once('beforeExit', flush);
process.once('exit', flush);
process.once('SIGINT', () => { flush(); process.exit(130); });
process.once('SIGTERM', () => { flush(); process.exit(143); });
