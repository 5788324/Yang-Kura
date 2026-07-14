#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const write = (file, content) => fs.writeFileSync(file, content, 'utf8');
function replaceOnce(file, before, after, label) {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`${label}: anchor not found in ${file}`);
  if (source.indexOf(before) !== source.lastIndexOf(before)) throw new Error(`${label}: anchor not unique in ${file}`);
  write(file, source.replace(before, after));
}

replaceOnce(
  'src/player/playerRuntimePolicy.ts',
  `export function isLocalTrackAwaitingAuthorization(track: AudioTrack | null | undefined): boolean {\n`,
  `export function getPlaybackEndGuard(duration: number): number {\n  if (!Number.isFinite(duration) || duration <= 0) return 0;\n  return Math.min(10, duration * 0.05);\n}\n\nexport function isPlaybackComplete(progress: number, duration: number): boolean {\n  if (!Number.isFinite(duration) || duration <= 0) return false;\n  const normalized = clampPlaybackPosition(progress, duration);\n  return normalized >= duration - getPlaybackEndGuard(duration);\n}\n\nexport function isLocalTrackAwaitingAuthorization(track: AudioTrack | null | undefined): boolean {\n`,
  'completion policy helpers',
);

replaceOnce(
  'src/services/playbackHistoryService.ts',
  `import { sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';\n`,
  `import { isPlaybackComplete, sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';\n`,
  'history completion policy import',
);

replaceOnce(
  'src/services/playbackHistoryService.ts',
  `    return parsed.filter((entry) => entry && typeof entry.trackId === 'string' && entry.track);\n`,
  `    return parsed\n      .filter((entry) => entry && typeof entry.trackId === 'string' && entry.track)\n      .map((entry) => {\n        const duration = safeNumber(entry.duration) || safeNumber(entry.track.duration);\n        const progress = clampProgress(entry.progress, duration);\n        const percent = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;\n        return { ...entry, progress, duration, percent, completed: isPlaybackComplete(progress, duration), track: sanitizeTrack(entry.track) };\n      });\n`,
  'history stale completion migration',
);

replaceOnce(
  'src/services/playbackHistoryService.ts',
  `    if (!entry || entry.completed) return 0;\n    const duration = safeNumber(durationHint) || entry.duration;\n    const progress = clampProgress(entry.progress, duration);\n    if (progress < MIN_RESUME_SECONDS) return 0;\n    if (duration > 0 && progress >= Math.max(0, duration - END_GUARD_SECONDS)) return 0;\n`,
  `    if (!entry) return 0;\n    const duration = safeNumber(durationHint) || entry.duration;\n    const progress = clampProgress(entry.progress, duration);\n    if (progress < MIN_RESUME_SECONDS) return 0;\n    if (isPlaybackComplete(progress, duration)) return 0;\n`,
  'history resume completion policy',
);

replaceOnce(
  'src/services/playbackHistoryService.ts',
  `    const completed = duration > 0 && (percent >= 95 || progress >= Math.max(0, duration - END_GUARD_SECONDS));\n`,
  `    const completed = isPlaybackComplete(progress, duration);\n`,
  'history save completion policy',
);

replaceOnce(
  'src/services/homeRecentListeningService.ts',
  `import { playbackHistoryService, type PlaybackHistoryEntry } from './playbackHistoryService';\n`,
  `import { playbackHistoryService, type PlaybackHistoryEntry } from './playbackHistoryService';\nimport { isLocalTrackAwaitingAuthorization } from '../player/playerRuntimePolicy';\n`,
  'home authorization policy import',
);

replaceOnce(
  'src/services/homeRecentListeningService.ts',
  `    const continueEntry = continueTrack ? entryMap.get(continueTrack.id) : undefined;\n`,
  `    const continueEntry = continueTrack ? entryMap.get(continueTrack.id) : undefined;\n    const currentTrackNeedsAuthorization = isLocalTrackAwaitingAuthorization(currentTrack);\n`,
  'home current authorization state',
);

replaceOnce(
  'src/services/homeRecentListeningService.ts',
  `        helper: currentTrack ? '当前正在播放，可继续控制队列。' : continueTrack ? '从最近播放或历史进度恢复。' : '先去音声库或音乐库选择一首音频。',\n`,
  `        helper: currentTrack\n          ? input.playerState.isPlaying\n            ? '当前正在播放，可继续控制队列。'\n            : currentTrackNeedsAuthorization\n              ? '需要重新授权资源库并读取 Index 后，才能从当前进度继续。'\n              : '当前已暂停，可从当前进度继续。'\n          : continueTrack\n            ? '从最近播放或历史进度恢复。'\n            : '先去音声库或音乐库选择一首音频。',\n`,
  'home truthful playback helper',
);

replaceOnce(
  'scripts/test-u29-electron-e2e.mjs',
  `const QUEUE_STORAGE_KEY = 'yang_kura_player_queue_v1';\n`,
  `const QUEUE_STORAGE_KEY = 'yang_kura_player_queue_v1';\nconst HISTORY_STORAGE_KEY = 'yang_kura_playback_history_v1';\n`,
  'E2E history key',
);

replaceOnce(
  'scripts/test-u29-electron-e2e.mjs',
  `  assert.ok(persisted.queue.every((track) => !track.rootPathToken && !track.mediaUrl && !String(track.coverUrl ?? '').startsWith('yang-kura-media://')), '持久化队列泄露当前窗口 token 或媒体 URL');\n`,
  `  assert.ok(persisted.queue.every((track) => !track.rootPathToken && !track.mediaUrl && !String(track.coverUrl ?? '').startsWith('yang-kura-media://')), '持久化队列泄露当前窗口 token 或媒体 URL');\n  const history = await runtime.cdp.evaluate(\`JSON.parse(localStorage.getItem(\${JSON.stringify(HISTORY_STORAGE_KEY)})??'[]')\`);\n  const resumeEntry = history.find((entry) => entry.trackId === tracks[0].id);\n  assert.ok(resumeEntry, '未保存续播历史');\n  assert.equal(resumeEntry.completed, false, '中途进度不得标记为已听完');\n  assert.ok(resumeEntry.percent > 45 && resumeEntry.percent < 80, '历史百分比与实际进度不一致');\n`,
  'E2E truthful completion assertion',
);

replaceOnce(
  'scripts/test-u29-electron-e2e.mjs',
  `  await waitForBodyText(runtime.cdp, '需要重新授权资源库并读取 Index');\n  const blocked = await playerState(runtime.cdp);\n`,
  `  await waitForBodyText(runtime.cdp, '需要重新授权资源库并读取 Index');\n  const blockedBody = await runtime.cdp.evaluate('document.body?.innerText ?? ""');\n  assert.ok(blockedBody.includes('需要重新授权资源库并读取 Index 后，才能从当前进度继续。'), '首页未显示真实的重新授权状态');\n  assert.ok(!blockedBody.includes('当前正在播放，可继续控制队列。'), '未授权状态不得显示当前正在播放');\n  assert.ok(!blockedBody.includes('已听完'), '中途续播点不得显示已听完');\n  const blocked = await playerState(runtime.cdp);\n`,
  'E2E home truthfulness assertion',
);

replaceOnce(
  'scripts/verify-u29-player-reliability.mjs',
  `const playlistSource = fs.readFileSync('src/services/playlistPersistenceService.ts', 'utf8');\n`,
  `const playlistSource = fs.readFileSync('src/services/playlistPersistenceService.ts', 'utf8');\nconst homeSource = fs.readFileSync('src/services/homeRecentListeningService.ts', 'utf8');\nconst historyServiceSource = fs.readFileSync('src/services/playbackHistoryService.ts', 'utf8');\n`,
  'verifier truthfulness sources',
);

replaceOnce(
  'scripts/verify-u29-player-reliability.mjs',
  `  ['U29 Electron E2E command exists', pkg.scripts?.['test:u29:electron-e2e'] === 'node scripts/test-u29-electron-e2e.mjs'],\n`,
  `  ['history completion uses duration-relative policy', historyServiceSource.includes('isPlaybackComplete(progress, duration)') && !historyServiceSource.includes('duration - END_GUARD_SECONDS')],\n  ['home distinguishes playing paused and unauthorized', homeSource.includes('input.playerState.isPlaying') && homeSource.includes('currentTrackNeedsAuthorization') && homeSource.includes('当前已暂停')],\n  ['U29 Electron E2E command exists', pkg.scripts?.['test:u29:electron-e2e'] === 'node scripts/test-u29-electron-e2e.mjs'],\n`,
  'verifier truthfulness markers',
);

replaceOnce(
  'scripts/verify-u29-player-reliability.mjs',
  `assert.equal(policy.resolvePlaybackStart({ id: 't1', duration: 5 }, null, 9), 5);\n`,
  `assert.equal(policy.resolvePlaybackStart({ id: 't1', duration: 5 }, null, 9), 5);\nassert.equal(policy.isPlaybackComplete(6, 12), false);\nassert.equal(policy.isPlaybackComplete(11.5, 12), true);\nassert.equal(policy.isPlaybackComplete(190, 200), true);\nassert.equal(policy.isPlaybackComplete(180, 200), false);\n`,
  'verifier completion policy runtime',
);

console.log('U29 state truthfulness patch applied.');
