#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const required = [
  'src/hooks/useAudioPlayer.ts',
  'src/hooks/usePlayerBackend.ts',
  'src/hooks/usePlayerSessionPersistence.ts',
  'src/player/playerRuntimePolicy.ts',
  'scripts/test-u29-electron-e2e.mjs',
  'docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/architecture/REFACTOR_BACKLOG.md',
];
for (const file of required) if (!fs.existsSync(file)) failures.push(`missing U38-B file: ${file}`);

if (failures.length === 0) {
  const controller = read('src/hooks/useAudioPlayer.ts');
  const backend = read('src/hooks/usePlayerBackend.ts');
  const persistence = read('src/hooks/usePlayerSessionPersistence.ts');
  const runtimePolicy = read('src/player/playerRuntimePolicy.ts');
  const e2e = read('scripts/test-u29-electron-e2e.mjs');
  const architecture = read('docs/architecture/U38_PLAYER_BACKEND_BOUNDARY.md');
  const state = read('PROJECT_STATE.md');
  const roadmap = read('PROJECT_ROADMAP.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');
  const backlog = read('docs/architecture/REFACTOR_BACKLOG.md');

  for (const marker of [
    "from './usePlayerBackend'",
    'usePlayerBackend({',
    'backend.prepareInitialSeek',
    'backend.restartCurrentTrack',
    'backend.pauseHtmlAudio',
    'handleSeek: backend.seek',
    'usePlayerSessionPersistence(playerState)',
    'window.yangKura.requestReadTrackLyrics',
  ]) if (!controller.includes(marker)) failures.push(`player controller missing boundary marker: ${marker}`);

  for (const forbidden of [
    'new Audio(',
    'requestMpvPlaybackStart',
    'requestMpvPlaybackCommand',
    'requestResolveTrackMediaUrl',
    'onMpvPlaybackEvent',
    'mpvPlaybackPreferenceService',
    'audioRef',
    'forceHtmlFallbackTrackRef',
  ]) if (controller.includes(forbidden)) failures.push(`player controller still owns backend side effect: ${forbidden}`);

  for (const marker of [
    'new Audio()',
    'onMpvPlaybackEvent',
    'requestMpvPlaybackStart',
    'requestMpvPlaybackCommand',
    'requestResolveTrackMediaUrl',
    "event.type === 'fallback-requested'",
    'mpvPlaybackPreferenceService.shouldAttemptMpv',
    'prepareInitialSeek',
    'restartCurrentTrack',
    'pauseHtmlAudio',
    'seek(seconds: number)',
    "playbackMode: 'html-audio'",
    "playbackMode: 'mpv'",
    "playbackMode === 'mock-simulated'",
  ]) if (!backend.includes(marker)) failures.push(`player backend missing contract marker: ${marker}`);

  for (const forbidden of [
    'playerQueuePersistenceService',
    'playbackHistoryService',
    'resolveAdjacentQueueTarget',
    'appendTrackToQueue',
  ]) if (backend.includes(forbidden)) failures.push(`player backend crossed controller/session boundary: ${forbidden}`);

  const controllerLines = controller.split(/\r?\n/).length;
  if (controllerLines > 390) failures.push(`useAudioPlayer controller remains too large after U38-B: ${controllerLines} lines`);
  const backendLines = backend.split(/\r?\n/).length;
  if (backendLines > 620) failures.push(`usePlayerBackend exceeds focused backend boundary: ${backendLines} lines`);

  for (const marker of [
    'export function isTokenizedLocalTrack',
    'export type TokenizedLocalAudioTrack',
    'resolvePlaybackStart',
    'clampPlaybackPosition',
  ]) if (!runtimePolicy.includes(marker)) failures.push(`player runtime policy missing shared marker: ${marker}`);

  for (const marker of [
    'playerQueuePersistenceService.getSaveSignature',
    'playbackHistoryService.getResumeProgress',
    'sanitizePersistedPlayerTrack(track)',
  ]) if (!persistence.includes(marker)) failures.push(`session persistence boundary regressed: ${marker}`);

  for (const marker of [
    "state.mode === 'html-audio' || state.mode === 'mpv'",
    'actual seek advancement',
    '播放完成策略未切换',
    'restart-reauthorize-token-reconcile-real-resume',
    'next track',
    'previous track',
    'U29 Electron player E2E PASS',
  ]) if (!e2e.includes(marker)) failures.push(`U29 E2E missing frozen backend behavior: ${marker}`);

  for (const marker of [
    'Controller 不得直接创建 `Audio`',
    'mpv 启动失败或运行中断后切换 HTMLAudio',
    'U38-C 拆分 Subtitle loader',
  ]) if (!architecture.includes(marker)) failures.push(`U38-B architecture record missing: ${marker}`);

  for (const [label, source, markers] of [
    ['PROJECT_STATE.md', state, ['U38-B：播放器 Controller/Backend 分离完成', '当前任务：U38-C Subtitle loader 与字幕状态']],
    ['PROJECT_ROADMAP.md', roadmap, ['U38-B：播放器 Controller/Backend 分离完成', '当前任务：U38-C Subtitle loader 与字幕状态']],
    ['CURRENT_PROJECT_HANDOFF.md', handoff, ['U38-B：完成', '当前任务：U38-C Subtitle loader 与字幕状态']],
    ['WORKLOG.md', worklog, ['### U38-B — 播放器 Controller 与 Backend 边界', 'PR：#75']],
    ['REFACTOR_BACKLOG.md', backlog, ['PLY-001 Controller/Backend：U38-B 已完成', 'U38-C Subtitle loader']],
  ]) for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} missing current U38-B fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U38-B player Controller/Backend boundary PASS');
