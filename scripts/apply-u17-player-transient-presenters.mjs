import fs from 'node:fs';

function replaceExactlyOnce(source, search, replacement, label) {
  const count = source.split(search).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return source.replace(search, replacement);
}

const playerPath = 'src/components/PlayerBar.tsx';
let player = fs.readFileSync(playerPath, 'utf8');

player = replaceExactlyOnce(
  player,
  "import { useAutoDismissMessage, useDelayedVisibility } from '../hooks/usePlayerTransientUi';\n",
  "import { useAutoDismissMessage, useDelayedVisibility } from '../hooks/usePlayerTransientUi';\nimport { PlayerPlaylistMenu, PlayerToast, PlayerVolumePopover } from './PlayerTransientPresenters';\n",
  'presenter import',
);

player = replaceExactlyOnce(
  player,
  `  const handleVolumeSlide = (e: React.ChangeEvent<HTMLInputElement>) => {\n    onVolumeChange(parseFloat(e.target.value));\n  };\n`,
  `  const handleVolumeSlide = (e: React.ChangeEvent<HTMLInputElement>) => {\n    onVolumeChange(parseFloat(e.target.value));\n  };\n\n  const handlePlaylistSelect = (playlist: Playlist) => {\n    if (!currentTrack) return;\n\n    const exists = playlist.tracks.some((track) => track.id === currentTrack.id);\n    const isReadOnly = Boolean(playlist.isSystem);\n\n    if (isReadOnly) {\n      setToastMessage('系统示例歌单不可修改，请新建自建歌单');\n    } else if (!exists) {\n      onAddToPlaylist(currentTrack, playlist.id);\n      setToastMessage(\`成功收藏到歌单《\${playlist.name}》\`);\n    } else {\n      setToastMessage('已存在于该歌单中');\n    }\n\n    setShowPlaylistDropdown(false);\n  };\n`,
  'playlist selection handler',
);

player = replaceExactlyOnce(
  player,
  `          {/* Playlist picker popup dropdown */}\n          {showPlaylistDropdown && currentTrack && (\n            <div className="absolute bottom-12 right-0 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-left animate-fade-in max-h-56 overflow-y-auto">\n              <p className="text-[10px] font-bold text-zinc-400 px-2 py-1 border-b border-zinc-800/60 mb-1 flex items-center justify-between">\n                <span>请选择收藏的歌单</span>\n                <X className="w-3 h-3 hover:text-white cursor-pointer" onClick={() => setShowPlaylistDropdown(false)} />\n              </p>\n              {playlists.length === 0 ? (\n                <p className="text-[9px] text-zinc-500 p-2 text-center">暂无自定义歌单</p>\n              ) : (\n                <div className="space-y-0.5">\n                  {playlists.map(p => {\n                    const exists = p.tracks.some(t => t.id === currentTrack.id);\n                    const isReadOnly = Boolean(p.isSystem);\n                    return (\n                      <button\n                        key={p.id}\n                        disabled={isReadOnly}\n                        onClick={() => {\n                          if (isReadOnly) {\n                            setToastMessage('系统示例歌单不可修改，请新建自建歌单');\n                          } else if (!exists) {\n                            onAddToPlaylist(currentTrack, p.id);\n                            setToastMessage(\`成功收藏到歌单《\${p.name}》\`);\n                          } else {\n                            setToastMessage(\`已存在于该歌单中\`);\n                          }\n                          setShowPlaylistDropdown(false);\n                        }}\n                        className={\`w-full text-left text-[11px] rounded px-2 py-1.5 transition-colors flex items-center justify-between truncate \${isReadOnly ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-300 hover:text-sky-400 hover:bg-zinc-900/60'}\`}\n                      >\n                        <span className="truncate flex-1 pr-1">{p.name}</span>\n                        {isReadOnly ? (\n                          <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1 rounded flex-shrink-0 font-bold">只读</span>\n                        ) : exists && (\n                          <span className="text-[8px] bg-sky-500/15 text-sky-400 px-1 rounded flex-shrink-0 font-bold">已收藏</span>\n                        )}\n                      </button>\n                    );\n                  })}\n                </div>\n              )}\n            </div>\n          )}\n`,
  `          {/* Playlist picker popup dropdown */}\n          {showPlaylistDropdown && currentTrack && (\n            <PlayerPlaylistMenu\n              currentTrack={currentTrack}\n              playlists={playlists}\n              onClose={() => setShowPlaylistDropdown(false)}\n              onSelectPlaylist={handlePlaylistSelect}\n            />\n          )}\n`,
  'playlist menu JSX',
);

player = replaceExactlyOnce(
  player,
  `          {/* Hover Popover Slider widget with invisible physical overlay bridge */}\n          {showVolumeSlider && (\n            <div \n              className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-xl shadow-2xl flex flex-col items-center space-y-2.5 z-50 w-9 h-32 animate-fade-in"\n              style={{ contentVisibility: 'auto' }}\n            >\n              {/* Invisible bridge to prevent mouse leaving container when moving cursor upward */}\n              <div className="absolute -bottom-4 left-0 right-0 h-4 bg-transparent cursor-pointer" />\n\n              <span className="text-[8px] font-mono font-extrabold text-zinc-400 leading-none">\n                {Math.round(visibleVolumePercent)}%\n              </span>\n              <div className="relative w-1.5 h-16 bg-zinc-900 rounded-full flex flex-col justify-end overflow-hidden cursor-pointer">\n                <input\n                  type="range"\n                  min="0"\n                  max="1"\n                  step="0.01"\n                  value={visibleVolume}\n                  onChange={handleVolumeSlide}\n                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer origin-bottom"\n                  style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}\n                />\n                <div \n                  className="w-full bg-sky-400 rounded-full transition-all"\n                  style={{ height: \`\${visibleVolumePercent}%\` }}\n                />\n              </div>\n            </div>\n          )}\n`,
  `          {/* Hover Popover Slider widget with invisible physical overlay bridge */}\n          {showVolumeSlider && (\n            <PlayerVolumePopover\n              visibleVolume={visibleVolume}\n              visibleVolumePercent={visibleVolumePercent}\n              onChange={handleVolumeSlide}\n            />\n          )}\n`,
  'volume popover JSX',
);

player = replaceExactlyOnce(
  player,
  `      {/* Elegant Action Success Float Toast */}\n      {toastMessage && (\n        <div className="fixed bottom-24 right-6 z-50 bg-sky-500 text-white px-4 py-2.5 rounded-xl shadow-2xl text-[11px] font-bold flex items-center space-x-1.5 animate-fade-in border border-sky-400/20">\n          <span>{toastMessage}</span>\n        </div>\n      )}\n`,
  `      {/* Elegant Action Success Float Toast */}\n      {toastMessage && <PlayerToast message={toastMessage} />}\n`,
  'player Toast JSX',
);

for (const forbidden of [
  'playlists.map(p =>',
  "style={{ contentVisibility: 'auto' }}",
  'fixed bottom-24 right-6 z-50 bg-sky-500 text-white',
  '<span>请选择收藏的歌单</span>',
]) {
  if (player.includes(forbidden)) throw new Error(`extracted presentation remains in PlayerBar: ${forbidden}`);
}

fs.writeFileSync(playerPath, player, 'utf8');

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');
state = replaceExactlyOnce(
  state,
  '结构与质量增量：U09～U15 已合入\n当前任务：U16 播放器临时 UI 生命周期抽离',
  '结构与质量增量：U09～U16 已合入\n当前任务：U17 播放器临时展示组件拆分',
  'state summary',
);
state = replaceExactlyOnce(
  state,
  `### U16（当前）\n\n- 抽离音量悬停延迟关闭和 Toast 自动消失的临时 UI 生命周期；\n- 通过可注入 scheduler 的 resettable timer 执行真实定时器行为测试；\n- Hook 卸载或状态变化时取消未完成定时器，避免组件残留回调；\n- 保持所有现有文案、延迟时间、事件入口和播放器行为不变。\n`,
  `### U16（已完成）\n\n- 抽离音量悬停延迟关闭和 Toast 自动消失的临时 UI 生命周期；\n- 通过可注入 scheduler 的 resettable timer 执行真实定时器行为测试；\n- Hook 卸载或状态变化时取消未完成定时器，避免组件残留回调；\n- 保持所有现有文案、延迟时间、事件入口和播放器行为不变。\n\n### U17（当前）\n\n- 把歌单下拉框、音量浮层和 Toast 抽成纯展示组件；\n- 歌单写入、状态判断、文案选择和临时 UI Hook 继续由 PlayerBar 编排；\n- 补齐歌单关闭按钮、音量范围和 Toast 的基础无障碍语义；\n- 保持布局、颜色、交互结果、延迟时间和播放器业务行为不变。\n`,
  'state U16/U17 sections',
);
fs.writeFileSync(statePath, state, 'utf8');

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');
roadmap = replaceExactlyOnce(
  roadmap,
  'U09～U15：结构与质量增量已合入\nU16：播放器临时 UI 生命周期抽离进行中',
  'U09～U16：结构与质量增量已合入\nU17：播放器临时展示组件拆分进行中',
  'roadmap summary',
);
roadmap = replaceExactlyOnce(
  roadmap,
  `### U16：播放器临时 UI 生命周期抽离（当前）\n\n- 使用 \`useDelayedVisibility\` 管理音量浮层的 800 ms 延迟关闭。\n- 使用 \`useAutoDismissMessage\` 管理 Toast 的 2500 ms 自动消失。\n- 使用可注入 scheduler 的 resettable timer 验证重排、取消和清理行为。\n- 保持所有调用点、文案、延迟时间和播放器交互不变。\n`,
  `### U16：播放器临时 UI 生命周期抽离（已完成）\n\n- 使用 \`useDelayedVisibility\` 管理音量浮层的 800 ms 延迟关闭。\n- 使用 \`useAutoDismissMessage\` 管理 Toast 的 2500 ms 自动消失。\n- 使用可注入 scheduler 的 resettable timer 验证重排、取消和清理行为。\n- 保持所有调用点、文案、延迟时间和播放器交互不变。\n\n### U17：播放器临时展示组件拆分（当前）\n\n- 新增纯展示的歌单菜单、音量浮层和 Toast 组件。\n- PlayerBar 继续持有歌单业务决定、事件连接和临时状态 Hook。\n- 为关闭按钮、音量范围和 Toast 增加基础语义，不改变可见设计。\n- 删除 PlayerBar 中三段自包含 JSX，保持全部播放器业务行为不变。\n`,
  'roadmap U16/U17 sections',
);
fs.writeFileSync(roadmapPath, roadmap, 'utf8');

console.log('Applied U17 player transient presenter patch.');
