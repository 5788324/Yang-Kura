import fs from 'node:fs';

const replaceExactlyOnce = (source, pattern, replacement, label) => {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...source.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${matches.length}`);
  }
  return source.replace(pattern, replacement);
};

const playerPath = 'src/components/PlayerBar.tsx';
let player = fs.readFileSync(playerPath, 'utf8');

player = replaceExactlyOnce(
  player,
  /import React, \{ useState, useMemo \} from 'react';\nimport \{\n  Volume2,\n  VolumeX,\n  FolderPlus,\n  Tv,\n  MoreHorizontal,\n\} from 'lucide-react';/,
  "import React, { useState, useMemo } from 'react';",
  'remove auxiliary icon imports',
);

player = replaceExactlyOnce(
  player,
  /import \{ PlayerTrackSummary, PlayerTransportControls \} from '\.\/PlayerBarPrimarySections';/,
  `import { PlayerTrackSummary, PlayerTransportControls } from './PlayerBarPrimarySections';\nimport { PlayerAuxiliaryControls, PlayerCompatibilityMarkers } from './PlayerBarAuxiliaryControls';`,
  'add auxiliary component imports',
);

player = replaceExactlyOnce(
  player,
  /  const handlePlaylistSelect = \(playlist: Playlist\) => \{[\s\S]*?    setShowPlaylistDropdown\(false\);\n  \};\n\n  const totalDuration/,
  `  const handlePlaylistSelect = (playlist: Playlist) => {\n    if (!currentTrack) return;\n\n    const exists = playlist.tracks.some((track) => track.id === currentTrack.id);\n    const isReadOnly = Boolean(playlist.isSystem);\n\n    if (isReadOnly) {\n      setToastMessage('系统示例歌单不可修改，请新建自建歌单');\n    } else if (!exists) {\n      onAddToPlaylist(currentTrack, playlist.id);\n      setToastMessage(\`成功收藏到歌单《\${playlist.name}》\`);\n    } else {\n      setToastMessage('已存在于该歌单中');\n    }\n\n    setShowPlaylistDropdown(false);\n  };\n\n  const handleTogglePlaylist = () => {\n    if (currentTrack) setShowPlaylistDropdown((visible) => !visible);\n  };\n\n  const handleToggleDesktopLyrics = () => {\n    if (!currentTrack) return;\n    setDesktopLyricsActive(!desktopLyricsActive);\n    setToastMessage(desktopLyricsActive ? '歌词浮窗已关闭' : '歌词浮窗已开启');\n  };\n\n  const handleMoreActions = () => {\n    setToastMessage('更多播放操作将在后续版本开放');\n  };\n\n  const totalDuration`,
  'add auxiliary event handlers',
);

player = replaceExactlyOnce(
  player,
  /      \{\/\* Right side:[\s\S]*?      <div id="mvp79-player-ui-bugfix" hidden aria-hidden="true">\{mvp79PlayerUi\.hiddenMaintenanceNote\}<\/div>/,
  `      <PlayerAuxiliaryControls\n        hasTrack={Boolean(currentTrack)}\n        completionLabel={mvp49Player.completionLabel}\n        completionHint={mvp49Player.completionHint}\n        canToggleCompletion={Boolean(toggleCompletionMode)}\n        onToggleCompletion={() => toggleCompletionMode?.()}\n        currentTrack={currentTrack}\n        playlists={playlists}\n        showPlaylistDropdown={showPlaylistDropdown}\n        onTogglePlaylist={handleTogglePlaylist}\n        onClosePlaylist={() => setShowPlaylistDropdown(false)}\n        onSelectPlaylist={handlePlaylistSelect}\n        desktopLyricsActive={desktopLyricsActive}\n        onToggleDesktopLyrics={handleToggleDesktopLyrics}\n        isMuted={isMuted}\n        showVolumeSlider={showVolumeSlider}\n        visibleVolume={visibleVolume}\n        visibleVolumePercent={visibleVolumePercent}\n        onToggleMute={toggleMute}\n        onVolumeMouseEnter={handleVolumeMouseEnter}\n        onVolumeMouseLeave={handleVolumeMouseLeave}\n        onVolumeChange={handleVolumeSlide}\n        onMoreActions={handleMoreActions}\n      />\n\n      <PlayerCompatibilityMarkers\n        betaChips={mvp59PlayerBeta.chips}\n        hiddenMaintenanceNote={mvp79PlayerUi.hiddenMaintenanceNote}\n      />`,
  'replace auxiliary presentation region',
);

for (const marker of [
  "import { PlayerAuxiliaryControls, PlayerCompatibilityMarkers } from './PlayerBarAuxiliaryControls';",
  '<PlayerAuxiliaryControls',
  '<PlayerCompatibilityMarkers',
  'const handleTogglePlaylist = () => {',
  'const handleToggleDesktopLyrics = () => {',
  'const handleMoreActions = () => {',
]) {
  if (!player.includes(marker)) throw new Error(`patched PlayerBar missing marker: ${marker}`);
}
for (const forbidden of [
  "from 'lucide-react'",
  '<FolderPlus ',
  '<Tv ',
  '<Volume2 ',
  '<VolumeX ',
  '<MoreHorizontal ',
  'id="mvp59-player-beta-chips"',
  'id="mvp79-player-ui-bugfix"',
]) {
  if (player.includes(forbidden)) throw new Error(`PlayerBar still owns auxiliary presentation: ${forbidden}`);
}
fs.writeFileSync(playerPath, player, 'utf8');

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');
state = replaceExactlyOnce(
  state,
  /结构与质量增量：U09～U18 已合入\n当前任务：U19 播放器主展示区拆分/,
  '结构与质量增量：U09～U19 已合入\n当前任务：U20 播放器辅助控制区拆分',
  'update state summary',
);
state = replaceExactlyOnce(
  state,
  /### U19（当前）\n\n- 一次抽离音轨摘要、喜欢按钮和中央传输控制两大展示区；\n- 收藏变更、Toast、播放命令、循环切换和队列开关仍由 PlayerBar 编排；\n- 为封面\/标题入口、喜欢、播放、队列、歌单和静音补充键盘与 ARIA 语义；\n- 保持播放、Seek、收藏存储、布局、颜色和后端行为不变。/,
  `### U19（已完成）\n\n- 一次抽离音轨摘要、喜欢按钮和中央传输控制两大展示区；\n- 收藏变更、Toast、播放命令、循环切换和队列开关仍由 PlayerBar 编排；\n- 为封面/标题入口、喜欢、播放、队列、歌单和静音补充键盘与 ARIA 语义；\n- 保持播放、Seek、收藏存储、布局、颜色和后端行为不变。\n\n### U20（当前）\n\n- 抽离完成策略、歌单、歌词浮窗、音量和更多操作的辅助控制区；\n- 收口重复图标按钮样式并统一装饰图标的 aria-hidden；\n- 集中保留 MVP59/MVP79 历史兼容标记，避免继续散落在 PlayerBar；\n- 所有状态、Toast、歌单写入和播放器回调继续由 PlayerBar 编排。`,
  'append U20 state section',
);
fs.writeFileSync(statePath, state, 'utf8');

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');
roadmap = replaceExactlyOnce(
  roadmap,
  /U09～U18：结构与质量增量已合入\nU19：播放器主展示区拆分进行中/,
  'U09～U19：结构与质量增量已合入\nU20：播放器辅助控制区拆分进行中',
  'update roadmap summary',
);
roadmap = replaceExactlyOnce(
  roadmap,
  /### U19：播放器主展示区拆分（当前）\n\n- 抽离当前音轨摘要、状态标记、喜欢按钮和中央传输控制。\n- PlayerBar 继续持有收藏提示、播放命令、循环模式和队列事件。\n- 补齐封面\/标题键盘入口及主要图标按钮的可访问名称和按下状态。\n- 不修改播放、Seek、收藏存储、布局、主题和后端。/,
  `### U19：播放器主展示区拆分（已完成）\n\n- 抽离当前音轨摘要、状态标记、喜欢按钮和中央传输控制。\n- PlayerBar 继续持有收藏提示、播放命令、循环模式和队列事件。\n- 补齐封面/标题键盘入口及主要图标按钮的可访问名称和按下状态。\n- 不修改播放、Seek、收藏存储、布局、主题和后端。\n\n### U20：播放器辅助控制区拆分（当前）\n\n- 抽离完成策略、歌单、歌词浮窗、音量和更多操作展示。\n- PlayerBar 继续持有歌单判断、Toast、浮窗状态、静音和完成策略回调。\n- 重复图标按钮样式改为局部常量，装饰图标统一 aria-hidden。\n- MVP59/MVP79 隐藏兼容标记集中管理，不删除历史合同。`,
  'append U20 roadmap section',
);
fs.writeFileSync(roadmapPath, roadmap, 'utf8');

console.log('Applied U20 player auxiliary controls patch.');
