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
  /import \{ \n  Play, \n  Pause, \n  SkipBack, \n  SkipForward, \n  Volume2, \n  VolumeX, \n  Repeat, \n  Repeat1, \n  Shuffle, \n  ListMusic, \n  Heart, \n  FolderPlus, \n  Tv, \n  MoreHorizontal\n\} from 'lucide-react';/,
  `import {\n  Volume2,\n  VolumeX,\n  FolderPlus,\n  Tv,\n  MoreHorizontal,\n} from 'lucide-react';`,
  'player icon imports',
);

player = replaceExactlyOnce(
  player,
  /import CoverArtwork from '\.\/CoverArtwork';\n/,
  '',
  'CoverArtwork import',
);

player = replaceExactlyOnce(
  player,
  /\} from '\.\/PlayerTransientPresenters';\n/,
  `} from './PlayerTransientPresenters';\nimport { PlayerTrackSummary, PlayerTransportControls } from './PlayerBarPrimarySections';\n`,
  'primary section import',
);

player = replaceExactlyOnce(
  player,
  /        \{currentTrack \? \(\n          <>\n            \{\/\* Spinning Vinyl Album Art \*\/\}[\s\S]*?          <\/>\n        \) : \(/,
  `        {currentTrack ? (\n          <PlayerTrackSummary\n            track={currentTrack}\n            isPlaying={isPlaying}\n            isLiked={isLiked}\n            playbackError={playerState.playbackError}\n            playbackNotice={playerState.playbackNotice}\n            compactStatus={mvp74PlayerBar.compactStatus}\n            visibleBadges={mvp74PlayerBar.visibleBadges}\n            hiddenMaintenanceNote={mvp74PlayerBar.hiddenMaintenanceNote}\n            completionModeDescription={playerSummary.completionModeDescription}\n            statusBadges={mvp49Player.statusBadges}\n            visualContextLine={mvp50PlayerVisual.contextLine}\n            regressionLine={mvp54PlayerRegression.compactLine}\n            compactLine={mvp59PlayerBeta.compactLine}\n            onOpenLyrics={toggleLyrics}\n            onToggleFavorite={() => {\n              toggleFavorite(currentTrack.id);\n              setToastMessage(isLiked ? '已取消喜欢' : '已添加到喜欢');\n            }}\n          />\n        ) : (`,
  'track summary block',
);

player = replaceExactlyOnce(
  player,
  /      \{\/\* Center: Play controls \(Tighter and perfectly aligned layout matching standard music apps\) \*\/\}[\s\S]*?      <\/div>\n\n      \{\/\* Right side: Volume, folder save, and desktop lyrics \(No "全景声" and no lyrics "词" button\) \*\/\}/,
  `      <PlayerTransportControls\n        hasTrack={Boolean(currentTrack)}\n        loopMode={loopMode}\n        playbackMode={playerState.playbackMode}\n        isPlaying={isPlaying}\n        isQueueOpen={isQueueOpen}\n        queueCount={playerState.queue.length}\n        currentTimeLabel={formatPlayerTime(currentDisplayProgress)}\n        durationLabel={formatPlayerTime(totalDuration)}\n        onToggleLoopMode={toggleLoopMode}\n        onPrevious={onPrev}\n        onTogglePlay={togglePlay}\n        onNext={onNext}\n        onToggleQueue={toggleQueue}\n      />\n\n      {/* Right side: Volume, folder save, and desktop lyrics (No "全景声" and no lyrics "词" button) */}`,
  'transport controls block',
);

player = replaceExactlyOnce(
  player,
  /          title=\{mvp49Player\.completionHint\}\n        >/,
  `          title={mvp49Player.completionHint}\n          aria-label={\`播放完成策略：\${mvp49Player.completionLabel}\`}\n        >`,
  'completion strategy semantics',
);

player = replaceExactlyOnce(
  player,
  /            title="收藏到歌单"\n          >/,
  `            title="收藏到歌单"\n            aria-label="收藏到歌单"\n            aria-haspopup="menu"\n            aria-expanded={showPlaylistDropdown}\n          >`,
  'playlist trigger semantics',
);

player = replaceExactlyOnce(
  player,
  /            title=\{isMuted \? "取消静音" : "静音"\}\n          >/,
  `            title={isMuted ? "取消静音" : "静音"}\n            aria-label={isMuted ? '取消静音' : '静音'}\n            aria-pressed={isMuted}\n          >`,
  'mute button semantics',
);

fs.writeFileSync(playerPath, player, 'utf8');

for (const documentPath of ['PROJECT_STATE.md', 'PROJECT_ROADMAP.md']) {
  let document = fs.readFileSync(documentPath, 'utf8');
  document = document
    .replace('结构与质量增量：U09～U17 已合入', '结构与质量增量：U09～U18 已合入')
    .replace('U09～U17：结构与质量增量已合入', 'U09～U18：结构与质量增量已合入')
    .replace('当前任务：U18 播放器次级展示组件拆分', '当前任务：U19 播放器主展示区拆分')
    .replace('U18：播放器次级展示组件拆分进行中', 'U19：播放器主展示区拆分进行中')
    .replace('### U18（当前）', '### U18（已完成）')
    .replace('### U18：播放器次级展示组件拆分（当前）', '### U18：播放器次级展示组件拆分（已完成）');

  const insertionMarker = documentPath === 'PROJECT_STATE.md'
    ? '- 保持 Seek、可见文案、布局、颜色、动画类和播放器业务行为不变。\n\n## 当前阶段'
    : '- 保持 Seek 提交、文案、颜色、布局、动画和播放链不变。\n\n### 后续质量候选';

  const insertion = documentPath === 'PROJECT_STATE.md'
    ? `- 保持 Seek、可见文案、布局、颜色、动画类和播放器业务行为不变。\n\n### U19（当前）\n\n- 一次抽离音轨摘要、喜欢按钮和中央传输控制两大展示区；\n- 收藏变更、Toast、播放命令、循环切换和队列开关仍由 PlayerBar 编排；\n- 为封面/标题入口、喜欢、播放、队列、歌单和静音补充键盘与 ARIA 语义；\n- 保持播放、Seek、收藏存储、布局、颜色和后端行为不变。\n\n## 当前阶段`
    : `- 保持 Seek 提交、文案、颜色、布局、动画和播放链不变。\n\n### U19：播放器主展示区拆分（当前）\n\n- 抽离当前音轨摘要、状态标记、喜欢按钮和中央传输控制。\n- PlayerBar 继续持有收藏提示、播放命令、循环模式和队列事件。\n- 补齐封面/标题键盘入口及主要图标按钮的可访问名称和按下状态。\n- 不修改播放、Seek、收藏存储、布局、主题和后端。\n\n### 后续质量候选`;

  if (!document.includes(insertionMarker)) {
    throw new Error(`${documentPath}: U19 insertion marker missing`);
  }
  document = document.replace(insertionMarker, insertion);
  fs.writeFileSync(documentPath, document, 'utf8');
}

console.log('Applied U19 player primary section patch.');
