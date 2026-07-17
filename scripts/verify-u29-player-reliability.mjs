#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const helperSource = fs.readFileSync('src/player/playerRuntimePolicy.ts', 'utf8');
const controllerSource = fs.readFileSync('src/hooks/useAudioPlayer.ts', 'utf8');
const backendSource = fs.readFileSync('src/hooks/usePlayerBackend.ts', 'utf8');
const appSource = fs.readFileSync('src/App.tsx', 'utf8');
const queueDrawerSource = fs.readFileSync('src/app/QueueDrawer.tsx', 'utf8');
const playerBarSource = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const lyricsPanelSource = fs.readFileSync('src/components/LyricsPanel.tsx', 'utf8');
const queueSource = fs.readFileSync('src/services/playerQueuePersistenceService.ts', 'utf8');
const historySource = fs.readFileSync('src/services/playbackHistoryService.ts', 'utf8');
const playlistSource = fs.readFileSync('src/services/playlistPersistenceService.ts', 'utf8');
const homeSource = fs.readFileSync('src/services/homeRecentListeningService.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

for (const [label, ok] of [
  ['restored progress seeds backend pending playback start', controllerSource.includes('initialPendingSeek: restoredQueueState?.currentTrack') && controllerSource.includes('progress: restoredQueueState.progress')],
  ['HTMLAudio uses resolved playback start', backendSource.includes('const initialSeek = resolvePlaybackStart(') && backendSource.includes('audioRef.current.currentTime = initialSeek')],
  ['mpv uses resolved playback start', backendSource.includes('startSeconds: resolvePlaybackStart(')],
  ['play toggle blocks stale current-window token', controllerSource.includes('isLocalTrackAwaitingAuthorization(previous.currentTrack)') && controllerSource.includes('需要重新授权资源库并读取 Index')],
  ['seek clamps to duration', backendSource.includes('clampPlaybackPosition(seconds, current.currentTrack?.duration)')],
  ['queue reconciles after fresh Index', controllerSource.includes('handleReconcileQueueWithLibrary') && appSource.includes('handleReconcileQueueWithLibrary(currentLibraryTracks)')],
  ['playlist tracks reconcile after fresh Index', appSource.includes('reconcileTracksWithLibrary(playlist.tracks, currentLibraryTracks)')],
  ['persistent queue strips current-window token', queueSource.includes('sanitizePersistedPlayerTrack(track)')],
  ['playback history strips current-window token', historySource.includes('sanitizePersistedPlayerTrack(track)')],
  ['playlists strip current-window token', playlistSource.includes('sanitizePersistedPlayerTrack(track)')],
  ['history completion uses duration-relative policy', historySource.includes('isPlaybackComplete(progress, duration)') && !historySource.includes('END_GUARD_SECONDS')],
  ['stored history completion is migrated on load', historySource.includes('completed: isPlaybackComplete(progress, duration)')],
  ['home distinguishes playing paused and unauthorized', homeSource.includes('input.playerState.isPlaying') && homeSource.includes('currentTrackNeedsAuthorization') && homeSource.includes('当前已暂停') && homeSource.includes('需要重新授权资源库并读取 Index 后，才能从当前进度继续。')],
  ['PlayerBar exposes stable non-path runtime state', playerBarSource.includes('data-u29-playback-mode') && playerBarSource.includes('data-u29-source-ready') && !playerBarSource.includes('data-u29-root-path-token')],
  ['queue drawer has stable item selectors', queueDrawerSource.includes('id="u29-queue-drawer"') && queueDrawerSource.includes('data-queue-track-id={track.id}') && appSource.includes('<QueueDrawer')],
  ['lyrics panel exposes stable status only', lyricsPanelSource.includes('data-u29-lyrics-status') && lyricsPanelSource.includes('data-u29-lyrics-path')],
  ['backend owns mpv and HTMLAudio coordination', backendSource.includes('requestMpvPlaybackStart') && backendSource.includes('requestResolveTrackMediaUrl') && backendSource.includes('new Audio()')],
  ['controller does not own backend side effects', !controllerSource.includes('requestMpvPlaybackStart') && !controllerSource.includes('requestResolveTrackMediaUrl') && !controllerSource.includes('new Audio(')],
  ['U29 Electron E2E command exists', pkg.scripts?.['test:u29:electron-e2e'] === 'node scripts/test-u29-electron-e2e.mjs'],
]) {
  assert.equal(ok, true, label);
  console.log(`PASS\t${label}`);
}

const transpiled = ts.transpileModule(helperSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
  },
}).outputText;
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yang-kura-u29-policy-'));
const tempModule = path.join(tempDir, 'playerRuntimePolicy.cjs');
fs.writeFileSync(tempModule, transpiled, 'utf8');
const require = createRequire(import.meta.url);
const policy = require(tempModule);

assert.equal(policy.clampPlaybackPosition(-5, 10), 0);
assert.equal(policy.clampPlaybackPosition(15, 10), 10);
assert.equal(policy.clampPlaybackPosition(6, 10), 6);
assert.equal(policy.resolvePlaybackStart({ id: 't1', duration: 20 }, { trackId: 't1', progress: 7 }, 2), 7);
assert.equal(policy.resolvePlaybackStart({ id: 't1', duration: 20 }, { trackId: 'other', progress: 7 }, 4), 4);
assert.equal(policy.resolvePlaybackStart({ id: 't1', duration: 5 }, null, 9), 5);
assert.equal(policy.isPlaybackComplete(6, 12), false);
assert.equal(policy.isPlaybackComplete(11.5, 12), true);
assert.equal(policy.isPlaybackComplete(190, 200), true);
assert.equal(policy.isPlaybackComplete(180, 200), false);

const persisted = policy.sanitizePersistedPlayerTrack({
  id: 't1', title: 'Track', artist: 'Artist', album: 'Album', duration: 20,
  coverUrl: 'yang-kura-media://cover/yk-root-secret/cover.jpg', type: 'asmr',
  rootPathToken: 'yk-root-secret', sourceRelativePath: 'track.wav', mediaUrl: 'yang-kura-media://track/secret/track.wav',
  playbackSourceKind: 'tokenized-local-file', lyrics: ['[00:00.00]line'], lyricsSourceKind: 'local-file', lyricsLoadStatus: 'loaded',
});
assert.equal(persisted.rootPathToken, undefined);
assert.equal(persisted.mediaUrl, undefined);
assert.equal(persisted.coverUrl, '');
assert.equal(persisted.lyrics, undefined);
assert.equal(persisted.lyricsLoadStatus, 'idle');

const staleTrack = {
  id: 't1', title: 'Old', artist: 'Artist', album: 'Album', duration: 20, coverUrl: '', type: 'asmr',
  sourceRelativePath: 'track.wav', playbackSourceKind: 'tokenized-local-file',
};
const freshTrack = { ...staleTrack, title: 'Fresh', rootPathToken: 'yk-root-current' };
const reconciled = policy.reconcilePlayerStateWithLibrary({
  currentTrack: staleTrack, isPlaying: false, progress: 6, volume: 0.75, queue: [staleTrack], currentIndex: 0,
  isMuted: false, loopMode: 'all', playCompletionMode: 'continue-queue', playbackMode: 'idle', playbackError: 'old', playbackNotice: null, resolvedMediaUrl: null,
}, [freshTrack]);
assert.equal(reconciled.currentTrack.rootPathToken, 'yk-root-current');
assert.equal(reconciled.currentTrack.title, 'Fresh');
assert.equal(reconciled.progress, 6);
assert.equal(reconciled.queue[0], freshTrack);
assert.equal(reconciled.playbackError, null);

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('U29 player reliability verifier PASS');
