#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const required = [
  'src/hooks/useAudioPlayer.ts',
  'src/hooks/usePlayerSessionPersistence.ts',
  'src/player/playerQueueTransitions.ts',
  'scripts/test-u29-electron-e2e.mjs',
  'docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
];
for (const file of required) if (!fs.existsSync(file)) failures.push(`missing U38-A file: ${file}`);

if (failures.length === 0) {
  const hook = read('src/hooks/useAudioPlayer.ts');
  const persistence = read('src/hooks/usePlayerSessionPersistence.ts');
  const transitions = read('src/player/playerQueueTransitions.ts');
  const e2e = read('scripts/test-u29-electron-e2e.mjs');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');

  for (const marker of [
    "from '../player/playerQueueTransitions'",
    "from './usePlayerSessionPersistence'",
    'resolveAdjacentQueueTarget',
    'activateQueueTarget',
    'startTrackQueue',
    'appendTrackToQueue',
    'usePlayerSessionPersistence(playerState)',
  ]) if (!hook.includes(marker)) failures.push(`useAudioPlayer missing boundary marker: ${marker}`);

  for (const forbidden of [
    'playerQueuePersistenceService',
    'playbackHistoryService',
    'lastQueueSaveRef',
    'lastHistorySaveRef',
    "localStorage.setItem('last_played_track_id'",
  ]) if (hook.includes(forbidden)) failures.push(`useAudioPlayer still owns session persistence: ${forbidden}`);

  for (const marker of [
    'restorePlayerSessionState',
    'usePlayerSessionPersistence',
    'playerQueuePersistenceService.getSaveSignature',
    'playbackHistoryService.getResumeProgress',
    'sanitizePersistedPlayerTrack(track)',
    'SAVE_PROGRESS_DELTA_SECONDS',
    'SAVE_INTERVAL_MS',
    'recordTrackStarted',
    'recordTrackCompleted',
  ]) if (!persistence.includes(marker)) failures.push(`session persistence hook missing: ${marker}`);

  for (const marker of [
    'resolveAdjacentQueueTarget',
    'activateQueueTarget',
    'startTrackQueue',
    'appendTrackToQueue',
    "direction === 'next'",
    "state.loopMode === 'shuffle'",
  ]) if (!transitions.includes(marker)) failures.push(`queue transitions missing: ${marker}`);

  for (const marker of [
    'HISTORY_STORAGE_KEY',
    'LEGACY_LAST_TRACK_JSON_KEY',
    '播放历史未保存续播进度',
    '兼容续播快照未经过隐私清洗',
    'sanitizedLegacySnapshot: true',
  ]) if (!e2e.includes(marker)) failures.push(`U29 E2E missing persistence assertion: ${marker}`);

  for (const [label, source, markers] of [
    ['PROJECT_STATE.md', state, ['U38-A：播放器 Queue/History/Persistence 分离完成', 'U38-B：播放器 Controller/Backend 分离完成', '当前任务：U38-C Subtitle loader 与字幕状态']],
    ['CURRENT_PROJECT_HANDOFF.md', handoff, ['U38-A：完成', 'U38-B：完成', '当前任务：U38-C Subtitle loader 与字幕状态']],
    ['WORKLOG.md', worklog, ['### U38-A — 播放器会话边界', 'U29 Electron E2E']],
  ]) for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} missing current U38 fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U38-A player Queue/History/Persistence boundaries PASS');
