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
  /  MoreHorizontal, \n  X,\n  Sparkles\n/,
  '  MoreHorizontal\n',
  'unused presenter icon imports',
);

player = replaceExactlyOnce(
  player,
  /import \{ PlayerPlaylistMenu, PlayerToast, PlayerVolumePopover \} from '\.\/PlayerTransientPresenters';/,
  `import {\n  PlayerEmptyState,\n  PlayerFloatingLyrics,\n  PlayerPlaylistMenu,\n  PlayerSeekPreview,\n  PlayerToast,\n  PlayerVolumePopover,\n} from './PlayerTransientPresenters';`,
  'presenter import',
);

player = replaceExactlyOnce(
  player,
  /        \{\/\* Hover seek-preview tooltip \*\/\}\n        \{hoverPercent !== null && hoverTime !== null && currentTrack && \([\s\S]*?        \)\}\n\n        \{\/\* Invisible precise seeker range overlay \*\/\}/,
  `        {/* Hover seek-preview tooltip */}\n        {hoverPercent !== null && hoverTime !== null && currentTrack && (\n          <PlayerSeekPreview\n            percent={hoverPercent}\n            timeLabel={formatPlayerTime(hoverTime)}\n          />\n        )}\n\n        {/* Invisible precise seeker range overlay */}`,
  'seek preview block',
);

player = replaceExactlyOnce(
  player,
  /            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"\n          \/>/,
  `            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"\n            aria-label="播放进度"\n          />`,
  'progress range accessible name',
);

player = replaceExactlyOnce(
  player,
  /        \) : \(\n          <div className="flex items-center space-x-3 text-zinc-500">[\s\S]*?          <\/div>\n        \)\}/,
  `        ) : (\n          <PlayerEmptyState\n            title={mvp59PlayerBeta.emptyTitle}\n            hint={mvp59PlayerBeta.emptyHint}\n            regressionLine={mvp54PlayerRegression.compactLine}\n          />\n        )}`,
  'empty player block',
);

player = replaceExactlyOnce(
  player,
  /          title="歌词浮窗开关"\n        >/,
  `          title="歌词浮窗开关"\n          aria-label={desktopLyricsActive ? '关闭歌词浮窗' : '开启歌词浮窗'}\n          aria-pressed={desktopLyricsActive}\n        >`,
  'floating lyrics toggle semantics',
);

player = replaceExactlyOnce(
  player,
  /      \{\/\* 10\. Floating lyrics overlay \*\/\}\n      \{desktopLyricsActive && currentTrack && \([\s\S]*?      \)\}\n\n      \{\/\* Elegant Action Success Float Toast \*\/\}/,
  `      {/* 10. Floating lyrics overlay */}\n      {desktopLyricsActive && currentTrack && (\n        <PlayerFloatingLyrics\n          text={activeLyric}\n          onClose={() => setDesktopLyricsActive(false)}\n        />\n      )}\n\n      {/* Elegant Action Success Float Toast */}`,
  'floating lyrics overlay block',
);

for (const forbidden of [
  '<Sparkles className="w-4.5 h-4.5 text-sky-400"',
  'fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-950/90',
  '<span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-sans font-bold">跳转预览</span>',
]) {
  if (player.includes(forbidden)) throw new Error(`PlayerBar still owns U18 presentation: ${forbidden}`);
}

fs.writeFileSync(playerPath, player, 'utf8');

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');
state = state
  .replace('结构与质量增量：U09～U16 已合入\n当前任务：U17 播放器临时展示组件拆分', '结构与质量增量：U09～U17 已合入\n当前任务：U18 播放器次级展示组件拆分')
  .replace('### U17（当前）', '### U17（已完成）')
  .replace(
    '- 保持布局、颜色、交互结果、延迟时间和播放器业务行为不变。\n\n## 当前阶段',
    `- 保持布局、颜色、交互结果、延迟时间和播放器业务行为不变。\n\n### U18（当前）\n\n- 一次抽离进度预览、空播放器状态和歌词浮窗三个低风险展示块；\n- Hover 计算、歌词解析、当前行选择和开关状态继续由 PlayerBar 编排；\n- 为播放进度、歌词开关和歌词浮窗补齐基础语义；\n- 保持 Seek、可见文案、布局、颜色、动画类和播放器业务行为不变。\n\n## 当前阶段`,
  );
if (!state.includes('当前任务：U18 播放器次级展示组件拆分')) throw new Error('PROJECT_STATE U18 update failed');
fs.writeFileSync(statePath, state, 'utf8');

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');
roadmap = roadmap
  .replace('U09～U16：结构与质量增量已合入\nU17：播放器临时展示组件拆分进行中', 'U09～U17：结构与质量增量已合入\nU18：播放器次级展示组件拆分进行中')
  .replace('### U17：播放器临时展示组件拆分（当前）', '### U17：播放器临时展示组件拆分（已完成）')
  .replace(
    '- 删除 PlayerBar 中三段自包含 JSX，保持全部播放器业务行为不变。\n\n### 后续质量候选',
    `- 删除 PlayerBar 中三段自包含 JSX，保持全部播放器业务行为不变。\n\n### U18：播放器次级展示组件拆分（当前）\n\n- 一次抽离进度预览、空播放器状态和歌词浮窗三个展示块。\n- PlayerBar 继续持有 Hover 数值、歌词时间线、开关状态和事件编排。\n- 为播放进度 range、歌词开关和歌词浮窗补充语义。\n- 保持 Seek 提交、文案、颜色、布局、动画和播放链不变。\n\n### 后续质量候选`,
  );
if (!roadmap.includes('U18：播放器次级展示组件拆分进行中')) throw new Error('PROJECT_ROADMAP U18 update failed');
fs.writeFileSync(roadmapPath, roadmap, 'utf8');

console.log('Applied U18 player secondary presenter patch.');
