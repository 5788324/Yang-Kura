import fs from 'node:fs';

function replaceExactlyOnce(source, pattern, replacement, label) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...source.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${matches.length}`);
  }
  return source.replace(pattern, replacement);
}

const playerPath = 'src/components/PlayerBar.tsx';
let player = fs.readFileSync(playerPath, 'utf8');

player = replaceExactlyOnce(
  player,
  /import React, \{ useState, useMemo \} from 'react';/,
  `import { useMemo, useState } from 'react';\nimport type { ChangeEvent } from 'react';`,
  'React import',
);

player = replaceExactlyOnce(
  player,
  /import \{\n  clampPlayerValue,\n  formatPlayerTime,\n  getPlayerProgressMetrics,\n  getPlayerVolumeMetrics,\n  getSafeTrackDuration,\n  seekFromPointerPosition,\n\} from '\.\.\/player\/playerBarMath';/,
  `import { formatPlayerTime, getPlayerVolumeMetrics } from '../player/playerBarMath';`,
  'player math import',
);

player = replaceExactlyOnce(
  player,
  /import \{ useAutoDismissMessage, useDelayedVisibility \} from '\.\.\/hooks\/usePlayerTransientUi';/,
  `import { usePlayerSeekInteraction } from '../hooks/usePlayerSeekInteraction';\nimport { useAutoDismissMessage, useDelayedVisibility } from '../hooks/usePlayerTransientUi';`,
  'player hook imports',
);

player = replaceExactlyOnce(
  player,
  /import \{\n  PlayerEmptyState,\n  PlayerFloatingLyrics,\n  PlayerSeekPreview,\n  PlayerToast,\n\} from '\.\/PlayerTransientPresenters';/,
  `import {\n  PlayerEmptyState,\n  PlayerFloatingLyrics,\n  PlayerToast,\n} from './PlayerTransientPresenters';\nimport { PlayerProgressTrack } from './PlayerProgressTrack';`,
  'presenter imports',
);

player = replaceExactlyOnce(
  player,
  /  \/\/ Local state controls[\s\S]*?  const handleVolumeSlide = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{/,
  `  // Local state controls\n  const {\n    isVisible: isVolumePopoverVisible,\n    show: handleVolumeMouseEnter,\n    scheduleHide: handleVolumeMouseLeave,\n  } = useDelayedVisibility();\n  const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false);\n  const [isFloatingLyricsVisible, setIsFloatingLyricsVisible] = useState(false);\n  const { message: playerToastMessage, showMessage: setPlayerToastMessage } = useAutoDismissMessage();\n\n  const {\n    duration: totalDuration,\n    displayProgress: currentDisplayProgress,\n    progressPercent,\n    hoverPercent,\n    hoverTime,\n    isDragging: isProgressDragging,\n    progressTrackRef,\n    onTrackClick: handleProgressTrackClick,\n    onTrackMouseMove: handleProgressTrackMouseMove,\n    onTrackMouseLeave: handleProgressTrackMouseLeave,\n    onRangeStart: beginProgressDrag,\n    onRangeChange: updateProgressDrag,\n    onRangeCommit: commitProgressDrag,\n  } = usePlayerSeekInteraction({ currentTrack, progress, onSeek });\n\n  const handleVolumeSlide = (e: ChangeEvent<HTMLInputElement>) => {`,
  'local state and seek interaction',
);

player = player
  .replaceAll('setToastMessage', 'setPlayerToastMessage')
  .replaceAll('showPlaylistDropdown', 'isPlaylistMenuOpen')
  .replaceAll('setShowPlaylistDropdown', 'setIsPlaylistMenuOpen')
  .replaceAll('desktopLyricsActive', 'isFloatingLyricsVisible')
  .replaceAll('setDesktopLyricsActive', 'setIsFloatingLyricsVisible')
  .replaceAll('handleToggleDesktopLyrics', 'handleToggleFloatingLyrics')
  .replaceAll('showVolumeSlider', 'isVolumePopoverVisible')
  .replaceAll('toastMessage', 'playerToastMessage');

player = replaceExactlyOnce(
  player,
  /  const totalDuration = getSafeTrackDuration\(currentTrack\);\n  const \{ currentDisplayProgress, progressPercent \} = getPlayerProgressMetrics\(progress, dragValue, totalDuration\);\n  const \{ visibleVolume, visibleVolumePercent \} = getPlayerVolumeMetrics\(volume, isMuted\);/,
  `  const { visibleVolume, visibleVolumePercent } = getPlayerVolumeMetrics(volume, isMuted);`,
  'derived progress values',
);

player = replaceExactlyOnce(
  player,
  /      \{\/\* 1\. Thin Progress Bar Line at the top of Player bar \*\/\}[\s\S]*?      <\/div>\n\n      \{\/\* Left side:/,
  `      <PlayerProgressTrack\n        hasTrack={Boolean(currentTrack)}\n        duration={totalDuration}\n        displayProgress={currentDisplayProgress}\n        progressPercent={progressPercent}\n        isDragging={isProgressDragging}\n        hoverPercent={hoverPercent}\n        hoverTimeLabel={hoverTime !== null ? formatPlayerTime(hoverTime) : null}\n        progressTrackRef={progressTrackRef}\n        onTrackMouseMove={handleProgressTrackMouseMove}\n        onTrackMouseLeave={handleProgressTrackMouseLeave}\n        onTrackClick={handleProgressTrackClick}\n        onRangeStart={beginProgressDrag}\n        onRangeChange={updateProgressDrag}\n        onRangeCommit={commitProgressDrag}\n      />\n\n      {/* Left side:`,
  'progress track JSX',
);

player = player
  .replaceAll('isPlaylistMenuOpen={isPlaylistMenuOpen}', 'isPlaylistMenuOpen={isPlaylistMenuOpen}')
  .replaceAll('onToggleDesktopLyrics={handleToggleFloatingLyrics}', 'onToggleFloatingLyrics={handleToggleFloatingLyrics}')
  .replaceAll('isFloatingLyricsVisible={isFloatingLyricsVisible}', 'isFloatingLyricsVisible={isFloatingLyricsVisible}')
  .replaceAll('isVolumePopoverVisible={isVolumePopoverVisible}', 'isVolumePopoverVisible={isVolumePopoverVisible}');

for (const forbidden of [
  'pendingSeekValueRef',
  'progressBarRef',
  'const [hoverTime, setHoverTime]',
  'const [hoverPercent, setHoverPercent]',
  'const [dragValue, setDragValue]',
  'id="mvp75-playerbar-progress-stability"',
  'type="range"',
  'showPlaylistDropdown',
  'desktopLyricsActive',
  'showVolumeSlider',
  'toastMessage',
]) {
  if (player.includes(forbidden)) throw new Error(`stale PlayerBar implementation remains: ${forbidden}`);
}

for (const required of [
  "import { usePlayerSeekInteraction } from '../hooks/usePlayerSeekInteraction';",
  "import { PlayerProgressTrack } from './PlayerProgressTrack';",
  'usePlayerSeekInteraction({ currentTrack, progress, onSeek })',
  '<PlayerProgressTrack',
  'onRangeCommit={commitProgressDrag}',
  'isPlaylistMenuOpen={isPlaylistMenuOpen}',
  'isFloatingLyricsVisible={isFloatingLyricsVisible}',
  'isVolumePopoverVisible={isVolumePopoverVisible}',
  'playerToastMessage && <PlayerToast message={playerToastMessage} />',
]) {
  if (!player.includes(required)) throw new Error(`required PlayerBar integration missing: ${required}`);
}

fs.writeFileSync(playerPath, player, 'utf8');

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');
state = replaceExactlyOnce(
  state,
  /结构与质量增量：U09～U19 已合入\n当前任务：U20 播放器辅助控制区拆分/,
  `结构与质量增量：U09～U20 已合入\n当前任务：U21 播放器进度轨道与交互抽离`,
  'PROJECT_STATE header',
);
state = replaceExactlyOnce(state, /### U20（当前）/, '### U20（已完成）', 'PROJECT_STATE U20 status');
state = replaceExactlyOnce(
  state,
  /\n## 当前阶段/,
  `\n### U21（当前）\n\n- 抽离进度轨道 JSX 与 Hover/拖拽 Seek 交互生命周期；\n- 点击仍立即 Seek，拖拽仍只在鼠标或触摸结束时提交一次；\n- 复用 U15 纯计算，不复制时长、坐标或夹取逻辑；\n- 收口播放器局部可见状态命名，不修改播放结果。\n\n## 当前阶段`,
  'PROJECT_STATE U21 section',
);
fs.writeFileSync(statePath, state, 'utf8');

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');
roadmap = replaceExactlyOnce(
  roadmap,
  /U09～U19：结构与质量增量已合入\nU20：播放器辅助控制区拆分进行中/,
  `U09～U20：结构与质量增量已合入\nU21：播放器进度轨道与交互抽离进行中`,
  'PROJECT_ROADMAP header',
);
roadmap = replaceExactlyOnce(
  roadmap,
  /### U20：播放器辅助控制区拆分（当前）/,
  '### U20：播放器辅助控制区拆分（已完成）',
  'PROJECT_ROADMAP U20 status',
);
roadmap = replaceExactlyOnce(
  roadmap,
  /\n### 后续质量候选/,
  `\n### U21：播放器进度轨道与交互抽离（当前）\n\n- 新增进度轨道纯展示组件和 Seek 交互 Hook；\n- 保持点击立即提交、拖拽结束单次提交及 Hover 清理顺序；\n- 继续复用 U15 的时长、坐标、夹取和百分比计算；\n- 清理 PlayerBar 的进度状态与模糊可见性命名。\n\n### 后续质量候选`,
  'PROJECT_ROADMAP U21 section',
);
fs.writeFileSync(roadmapPath, roadmap, 'utf8');

console.log('Applied U21 player progress interaction patch.');
