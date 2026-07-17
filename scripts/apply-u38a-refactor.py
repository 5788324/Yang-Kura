from pathlib import Path
import json


def read(path: str) -> str:
    return Path(path).read_text(encoding='utf-8')


def write(path: str, content: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(content, encoding='utf-8')


def replace_once(path: str, old: str, new: str) -> None:
    source = read(path)
    if old not in source:
        raise SystemExit(f'marker not found in {path}: {old[:140]!r}')
    write(path, source.replace(old, new, 1))


def replace_section(source: str, start: str, end: str, replacement: str, label: str) -> str:
    start_index = source.find(start)
    if start_index < 0:
        raise SystemExit(f'{label} start marker missing')
    end_index = source.find(end, start_index)
    if end_index < 0:
        raise SystemExit(f'{label} end marker missing')
    return source[:start_index] + replacement + source[end_index:]


write('src/player/playerQueueTransitions.ts', """import type { AudioTrack, PlayerState } from '../types';

export type PlayerQueueDirection = 'next' | 'previous';
export type QueuePlaybackMode = NonNullable<PlayerState['playbackMode']>;

export interface PlayerQueueTarget {
  index: number;
  track: AudioTrack;
}

export function resolveAdjacentQueueTarget(
  state: PlayerState,
  direction: PlayerQueueDirection,
  random: () => number = Math.random,
): PlayerQueueTarget | null {
  if (state.queue.length === 0) return null;

  let index: number;
  if (state.loopMode === 'shuffle') {
    const normalizedRandom = Math.max(0, Math.min(0.999999999, random()));
    index = Math.floor(normalizedRandom * state.queue.length);
  } else if (direction === 'next') {
    index = state.currentIndex + 1;
    if (index >= state.queue.length) index = 0;
  } else {
    index = state.currentIndex - 1;
    if (index < 0) index = state.queue.length - 1;
  }

  const track = state.queue[index];
  return track ? { index, track } : null;
}

export function activateQueueTarget(
  state: PlayerState,
  target: PlayerQueueTarget,
  resumeProgress: number,
  playbackMode: QueuePlaybackMode,
): PlayerState {
  return {
    ...state,
    currentIndex: target.index,
    currentTrack: target.track,
    progress: resumeProgress,
    isPlaying: true,
    playbackMode,
    playbackError: null,
    playbackNotice: null,
    resolvedMediaUrl: null,
  };
}

export function startTrackQueue(
  state: PlayerState,
  track: AudioTrack,
  customQueue: AudioTrack[] | undefined,
  resumeProgress: number,
  playbackMode: QueuePlaybackMode,
): PlayerState {
  const queue = customQueue && customQueue.length > 0 ? customQueue : [track];
  const matchedIndex = queue.findIndex((candidate) => candidate.id === track.id);
  return {
    ...state,
    currentTrack: track,
    isPlaying: true,
    progress: resumeProgress,
    queue,
    currentIndex: matchedIndex >= 0 ? matchedIndex : 0,
    playbackMode,
    playbackError: null,
    playbackNotice: null,
    resolvedMediaUrl: null,
  };
}

export function appendTrackToQueue(state: PlayerState, track: AudioTrack): PlayerState {
  const queue = state.queue.some((candidate) => candidate.id === track.id)
    ? state.queue
    : [...state.queue, track];
  return {
    ...state,
    queue,
    currentIndex: state.currentIndex === -1 ? 0 : state.currentIndex,
    currentTrack: state.currentTrack ?? track,
  };
}
""")

write('src/hooks/usePlayerSessionPersistence.ts', """import { useCallback, useEffect, useRef } from 'react';
import type { AudioTrack, PlayerState } from '../types';
import { sanitizePersistedPlayerTrack } from '../player/playerRuntimePolicy';
import { playbackHistoryService } from '../services/playbackHistoryService';
import { playerQueuePersistenceService } from '../services/playerQueuePersistenceService';

const LEGACY_LAST_TRACK_ID_KEY = 'last_played_track_id';
const LEGACY_LAST_PROGRESS_KEY = 'last_played_progress';
const LEGACY_LAST_TRACK_JSON_KEY = 'last_played_track_json';
const SAVE_PROGRESS_DELTA_SECONDS = 5;
const SAVE_INTERVAL_MS = 5000;

interface QueueSaveCheckpoint {
  signature: string;
  progress: number;
  savedAt: number;
}

interface HistorySaveCheckpoint {
  trackId: string;
  progress: number;
  savedAt: number;
}

export function restorePlayerSessionState() {
  return playerQueuePersistenceService.getInitialPlayerState();
}

export function usePlayerSessionPersistence(playerState: PlayerState) {
  const lastQueueSaveRef = useRef<QueueSaveCheckpoint | null>(null);
  const lastHistorySaveRef = useRef<HistorySaveCheckpoint | null>(null);

  const getResumeProgress = useCallback((track: AudioTrack): number => (
    playbackHistoryService.getResumeProgress(track.id, track.duration)
  ), []);

  const recordTrackStarted = useCallback((track: AudioTrack, progress: number): void => {
    if (track.rjId) {
      try {
        localStorage.setItem(`asmr_last_played_${track.rjId}`, Date.now().toString());
      } catch {
        // Compatibility metadata must never interrupt playback.
      }
    }
    playbackHistoryService.saveProgress(track, progress, track.duration);
  }, []);

  const recordTrackCompleted = useCallback((track: AudioTrack, progress: number, duration?: number): void => {
    playbackHistoryService.saveProgress(track, progress, duration);
  }, []);

  useEffect(() => {
    const track = playerState.currentTrack;
    if (!track || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(LEGACY_LAST_TRACK_ID_KEY, track.id);
      localStorage.setItem(LEGACY_LAST_PROGRESS_KEY, playerState.progress.toString());
      localStorage.setItem(LEGACY_LAST_TRACK_JSON_KEY, JSON.stringify(sanitizePersistedPlayerTrack(track)));
    } catch {
      // Legacy resume compatibility must never interrupt playback.
    }
  }, [playerState.currentTrack?.id, playerState.progress]);

  useEffect(() => {
    const now = Date.now();
    if (playerState.queue.length === 0) {
      if (lastQueueSaveRef.current) {
        playerQueuePersistenceService.clear();
        lastQueueSaveRef.current = null;
      }
      return;
    }

    const signature = playerQueuePersistenceService.getSaveSignature(playerState);
    const progress = Math.max(0, playerState.progress || 0);
    const lastSaved = lastQueueSaveRef.current;
    const shouldSave =
      !lastSaved ||
      lastSaved.signature !== signature ||
      Math.abs(progress - lastSaved.progress) >= SAVE_PROGRESS_DELTA_SECONDS ||
      now - lastSaved.savedAt >= SAVE_INTERVAL_MS ||
      !playerState.isPlaying;

    if (!shouldSave) return;
    playerQueuePersistenceService.saveFromPlayerState(playerState);
    lastQueueSaveRef.current = { signature, progress, savedAt: now };
  }, [
    playerState.queue,
    playerState.currentTrack?.id,
    playerState.currentIndex,
    playerState.progress,
    playerState.volume,
    playerState.isMuted,
    playerState.loopMode,
    playerState.playCompletionMode,
    playerState.isPlaying,
  ]);

  useEffect(() => {
    const track = playerState.currentTrack;
    if (!track) return;
    const now = Date.now();
    const progress = Math.max(0, playerState.progress || 0);
    const lastSaved = lastHistorySaveRef.current;
    const shouldSave =
      !lastSaved ||
      lastSaved.trackId !== track.id ||
      Math.abs(progress - lastSaved.progress) >= SAVE_PROGRESS_DELTA_SECONDS ||
      now - lastSaved.savedAt >= SAVE_INTERVAL_MS ||
      !playerState.isPlaying;

    if (!shouldSave) return;
    playbackHistoryService.saveProgress(track, progress, track.duration);
    lastHistorySaveRef.current = { trackId: track.id, progress, savedAt: now };
  }, [playerState.currentTrack?.id, playerState.progress, playerState.isPlaying, playerState.currentTrack?.duration]);

  return {
    getResumeProgress,
    recordTrackCompleted,
    recordTrackStarted,
  };
}
""")

hook_path = 'src/hooks/useAudioPlayer.ts'
source = read(hook_path)
old_imports = "import { playerQueuePersistenceService } from '../services/playerQueuePersistenceService';\nimport { playbackHistoryService } from '../services/playbackHistoryService';\n"
new_imports = "import {\n  activateQueueTarget,\n  appendTrackToQueue,\n  resolveAdjacentQueueTarget,\n  startTrackQueue,\n} from '../player/playerQueueTransitions';\nimport { restorePlayerSessionState, usePlayerSessionPersistence } from './usePlayerSessionPersistence';\n"
if old_imports not in source:
    raise SystemExit('player persistence imports marker missing')
source = source.replace(old_imports, new_imports, 1)
source = source.replace(
    '  const restoredQueueState = playerQueuePersistenceService.getInitialPlayerState();',
    '  const restoredQueueState = restorePlayerSessionState();',
    1,
)
refs = "  const lastHistorySaveRef = useRef<{ trackId: string; progress: number; savedAt: number } | null>(null);\n  const lastQueueSaveRef = useRef<{ signature: string; progress: number; savedAt: number } | null>(null);\n"
if refs not in source:
    raise SystemExit('player persistence refs marker missing')
source = source.replace(refs, '', 1)
state_marker = '  const stateRef = useRef(playerState);\n  stateRef.current = playerState;\n'
if state_marker not in source:
    raise SystemExit('state ref marker missing')
source = source.replace(
    state_marker,
    state_marker + "\n  const {\n    getResumeProgress,\n    recordTrackCompleted,\n    recordTrackStarted,\n  } = usePlayerSessionPersistence(playerState);\n",
    1,
)

next_handler = """  const handleNextTrack = useCallback(() => {
    setPlayerState((previous) => {
      const target = resolveAdjacentQueueTarget(previous, 'next');
      if (!target) return previous;
      const resumeProgress = getResumeProgress(target.track);
      pendingInitialSeekRef.current = { trackId: target.track.id, progress: resumeProgress };
      return activateQueueTarget(
        previous,
        target,
        resumeProgress,
        isTokenizedLocalTrack(target.track) ? 'resolving-local-media' : 'mock-simulated',
      );
    });
  }, [getResumeProgress]);
"""
source = replace_section(
    source,
    '  const handleNextTrack = useCallback(() => {',
    '\n\n  useEffect(() => {\n    handleNextTrackRef.current = handleNextTrack;',
    next_handler,
    'next handler',
)

completion_old = """      if (current.currentTrack) {
        playbackHistoryService.saveProgress(
          current.currentTrack,
          current.currentTrack.duration || current.progress,
          current.currentTrack.duration,
        );
      }
"""
completion_new = """      if (current.currentTrack) {
        recordTrackCompleted(
          current.currentTrack,
          current.currentTrack.duration || current.progress,
          current.currentTrack.duration,
        );
      }
"""
if completion_old not in source:
    raise SystemExit('completion history marker missing')
source = source.replace(completion_old, completion_new, 1)

previous_handler = """  const handlePrevTrack = useCallback(() => {
    setPlayerState((previous) => {
      const target = resolveAdjacentQueueTarget(previous, 'previous');
      if (!target) return previous;
      const resumeProgress = getResumeProgress(target.track);
      pendingInitialSeekRef.current = { trackId: target.track.id, progress: resumeProgress };
      return activateQueueTarget(
        previous,
        target,
        resumeProgress,
        isTokenizedLocalTrack(target.track) ? 'resolving-local-media' : 'mock-simulated',
      );
    });
  }, [getResumeProgress]);
"""
source = replace_section(
    source,
    '  const handlePrevTrack = useCallback(() => {',
    '\n\n  const handlePlayTrack = useCallback',
    previous_handler,
    'previous handler',
)

play_handler = """  const handlePlayTrack = useCallback((track: AudioTrack, customQueue?: AudioTrack[]) => {
    const resumeProgress = getResumeProgress(track);
    pendingInitialSeekRef.current = { trackId: track.id, progress: resumeProgress };
    recordTrackStarted(track, resumeProgress);
    setPlayerState((previous) => startTrackQueue(
      previous,
      track,
      customQueue,
      resumeProgress,
      isTokenizedLocalTrack(track) ? 'resolving-local-media' : 'mock-simulated',
    ));
  }, [getResumeProgress, recordTrackStarted]);
"""
source = replace_section(
    source,
    '  const handlePlayTrack = useCallback',
    '\n\n  const handleAddToQueue = useCallback',
    play_handler,
    'play handler',
)

add_handler = """  const handleAddToQueue = useCallback((track: AudioTrack) => {
    setPlayerState((previous) => appendTrackToQueue(previous, track));
  }, []);
"""
source = replace_section(
    source,
    '  const handleAddToQueue = useCallback',
    '\n\n  const handleTogglePlay = useCallback',
    add_handler,
    'add queue handler',
)

legacy_start = "  useEffect(() => {\n    if (playerState.currentTrack) {\n      localStorage.setItem('last_played_track_id'"
source = replace_section(
    source,
    legacy_start,
    '\n\n  const handleReconcileQueueWithLibrary',
    '',
    'legacy and queue persistence effects',
)
history_start = "  useEffect(() => {\n    const track = playerState.currentTrack;\n    if (!track) return;\n    const now = Date.now();\n    const lastSaved = lastHistorySaveRef.current;"
source = replace_section(
    source,
    history_start,
    '\n\n  return {',
    '',
    'history persistence effect',
)
write(hook_path, source)

test_path = 'scripts/test-u29-electron-e2e.mjs'
test_source = read(test_path)
queue_key = "const QUEUE_STORAGE_KEY = 'yang_kura_player_queue_v1';\n"
if queue_key not in test_source:
    raise SystemExit('U29 queue key marker missing')
test_source = test_source.replace(
    queue_key,
    queue_key + "const HISTORY_STORAGE_KEY = 'yang_kura_playback_history_v1';\nconst LEGACY_LAST_TRACK_JSON_KEY = 'last_played_track_json';\n",
    1,
)
assertion_old = """  assert.ok(persisted.progress >= 5.5, '队列未保存续播进度');
  assert.ok(persisted.queue.every((track) => !track.rootPathToken && !track.mediaUrl && !String(track.coverUrl ?? '').startsWith('yang-kura-media://')), '持久化队列泄露当前窗口 token 或媒体 URL');
  await screenshot(runtime.cdp, '01-first-run-player-subtitles');
"""
assertion_new = """  assert.ok(persisted.progress >= 5.5, '队列未保存续播进度');
  assert.ok(persisted.queue.every((track) => !track.rootPathToken && !track.mediaUrl && !String(track.coverUrl ?? '').startsWith('yang-kura-media://')), '持久化队列泄露当前窗口 token 或媒体 URL');
  const history = await runtime.cdp.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(HISTORY_STORAGE_KEY)})??'[]')`);
  const currentHistory = history.find((entry) => entry.trackId === tracks[0].id);
  assert.ok(currentHistory?.progress >= 5.5, '播放历史未保存续播进度');
  assert.ok(!currentHistory.track.rootPathToken && !currentHistory.track.mediaUrl && !String(currentHistory.track.coverUrl ?? '').startsWith('yang-kura-media://'), '播放历史泄露当前窗口 token 或媒体 URL');
  const legacyTrack = await runtime.cdp.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(LEGACY_LAST_TRACK_JSON_KEY)})??'null')`);
  assert.ok(legacyTrack && !legacyTrack.rootPathToken && !legacyTrack.mediaUrl && !String(legacyTrack.coverUrl ?? '').startsWith('yang-kura-media://'), '兼容续播快照未经过隐私清洗');
  await screenshot(runtime.cdp, '01-first-run-player-subtitles');
"""
if assertion_old not in test_source:
    raise SystemExit('U29 persistence assertion marker missing')
test_source = test_source.replace(assertion_old, assertion_new, 1)
scenario_old = "report.scenarios.push({ name: 'play-seek-queue-subtitle-formats', status: 'PASS', resumeProgress: persisted.progress });"
scenario_new = "report.scenarios.push({ name: 'play-seek-queue-subtitle-formats', status: 'PASS', resumeProgress: persisted.progress, historyProgress: currentHistory.progress, sanitizedLegacySnapshot: true });"
if scenario_old not in test_source:
    raise SystemExit('U29 scenario marker missing')
test_source = test_source.replace(scenario_old, scenario_new, 1)
write(test_path, test_source)

write('scripts/verify-u38a-player-session-boundaries.mjs', """#!/usr/bin/env node
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

  const hookLines = hook.split(/\r?\n/).length;
  if (hookLines > 700) failures.push(`useAudioPlayer remains too large after U38-A: ${hookLines} lines`);

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
    ['PROJECT_STATE.md', state, ['U38-A：播放器 Queue/History/Persistence 分离完成', '当前任务：U38-B 播放器 Controller 与 Backend 边界']],
    ['CURRENT_PROJECT_HANDOFF.md', handoff, ['U38-A：完成', '当前任务：U38-B 播放器 Controller 与 Backend 边界']],
    ['WORKLOG.md', worklog, ['### U38-A — 播放器会话边界', 'U29 Electron E2E']],
  ]) for (const marker of markers) if (!source.includes(marker)) failures.push(`${label} missing current U38-A fact: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U38-A player Queue/History/Persistence boundaries PASS');
""")

package_path = Path('package.json')
package = json.loads(read('package.json'))
package['scripts']['verify:u38a-player-session-boundaries'] = 'node scripts/verify-u38a-player-session-boundaries.mjs'
write('package.json', json.dumps(package, ensure_ascii=False, indent=2) + '\n')

replace_once('scripts/run-stable-regression.mjs', "  'verify:handoff',\n", "  'verify:handoff',\n  'verify:u38a-player-session-boundaries',\n")
replace_once('.github/workflows/branch-validation.yml', "Where-Object { $_.Name -match '^verify-u(?:2[89]|3[0-7])' }", "Where-Object { $_.Name -match '^verify-u(?:2[89]|3[0-8])' }")

write('docs/architecture/U38_PLAYER_SESSION_BOUNDARIES.md', """# U38-A 播放器会话边界

## 目标

在不改变 mpv、HTMLAudio fallback、续播、字幕、队列和完成策略行为的前提下，将 `useAudioPlayer.ts` 中的 Queue、History 与 Persistence 职责拆出。

## 完成内容

- `playerQueueTransitions.ts`：负责上一首、下一首、随机、开始新队列和去重加入队列的纯状态转换。
- `usePlayerSessionPersistence.ts`：负责队列快照、播放历史、续播点、旧 `last_played_*` 兼容键和节流写入。
- `useAudioPlayer.ts`：继续协调播放后端与 UI 状态，但不直接依赖 Queue/History 持久化服务。
- 旧兼容续播快照改用 `sanitizePersistedPlayerTrack`，不持久化窗口级 `rootPathToken`、`mediaUrl` 或 tokenized cover URL。
- U29 Electron E2E 增加队列、历史和旧兼容快照的数据安全断言。

## 行为冻结

- 上一首、下一首和 shuffle 的索引规则保持不变。
- 新播放队列、重复加入队列和空队列首项行为保持不变。
- 续播阈值、完成判定、5 秒进度差和 5 秒写入间隔保持不变。
- 重启后必须重新授权资源库并读取 Index，持久化层不得保存窗口级 token。
- mpv、HTMLAudio fallback、字幕读取和完成策略不在本轮重写。

## 验收

- TypeScript 与生产构建通过。
- U29 Electron E2E 验证播放、Seek、队列、四种字幕、重启、重新授权、续播、上一首和下一首。
- U29 同时验证 Queue、History 和旧兼容快照均不泄露 token 或媒体 URL。
- `verify:u38a-player-session-boundaries` 验证职责边界和文档事实。

## 下一步

U38-B 拆分 Player Controller 与 mpv / HTMLAudio Backend 协调；不得改变现有 fallback 与真实播放行为。
""")

replace_once('PROJECT_STATE.md', 'U37-D：音乐库与详情 UI 完成\n', 'U37-D：音乐库与详情 UI 完成\nU38-A：播放器 Queue/History/Persistence 分离完成\n')
replace_once('PROJECT_STATE.md', '当前任务：长期日用维护与 Issue #66 技术债治理', '当前任务：U38-B 播放器 Controller 与 Backend 边界')
replace_once('PROJECT_ROADMAP.md', 'U37-D：完成\n', 'U37-D：完成\nU38-A：播放器 Queue/History/Persistence 分离完成\n')
replace_once('PROJECT_ROADMAP.md', '当前任务：长期日用维护与 Issue #66 技术债治理', '当前任务：U38-B 播放器 Controller 与 Backend 边界')
replace_once('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U37-D：完成\n', 'U37-D：完成\nU38-A：完成\n')
replace_once('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：长期日用维护与 Issue #66 技术债治理', '当前任务：U38-B 播放器 Controller 与 Backend 边界')

worklog = read('AI_HANDOFF/WORKLOG.md').rstrip() + """

### U38-A — 播放器会话边界

- 新增 `playerQueueTransitions.ts`，将上一首、下一首、shuffle、新队列和去重入队改为纯状态转换。
- 新增 `usePlayerSessionPersistence.ts`，统一队列快照、播放历史、续播点、旧兼容键和节流写入。
- `useAudioPlayer.ts` 不再直接依赖 `playerQueuePersistenceService` 或 `playbackHistoryService`。
- 旧 `last_played_track_json` 使用隐私清洗后的音轨快照。
- U29 Electron E2E 增加 Queue、History 和兼容快照的数据安全断言。
- 当前任务：U38-B 播放器 Controller 与 Backend 边界。
""" + '\n'
write('AI_HANDOFF/WORKLOG.md', worklog)

readme = read('README.md')
readme_insert = """## U38 渐进式播放器治理

- U38-A 已完成 Queue、History 与 Persistence 分离。
- `useAudioPlayer.ts` 不再直接写队列快照、播放历史或旧兼容续播键。
- 下一步为 U38-B Controller 与 mpv / HTMLAudio Backend 边界，现有播放行为继续冻结。

"""
if '## 开发原则\n' not in readme:
    raise SystemExit('README development marker missing')
write('README.md', readme.replace('## 开发原则\n', readme_insert + '## 开发原则\n', 1))

backlog = read('docs/architecture/REFACTOR_BACKLOG.md')
if '## U38 维护进度' not in backlog:
    backlog = backlog.rstrip() + """

## U38 维护进度

- PLY-002 Queue/History/Persistence：U38-A 已完成。
- ARC-006 中央 Hook 拆分：完成会话持久化切片，Controller、Backend 与 Subtitle 仍按 U38-B/U38-C 继续。
""" + '\n'
write('docs/architecture/REFACTOR_BACKLOG.md', backlog)

print('U38-A transformation applied')
