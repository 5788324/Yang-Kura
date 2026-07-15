#!/usr/bin/env node
import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value, 'utf8'); }
function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing U32 patch anchor: ${label}`);
  return source.replace(before, after);
}

// Application shell
{
  const path = 'src/App.tsx';
  let source = read(path);
  source = replaceOnce(
    source,
    'className={`h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}',
    'className={`u32-release-ui h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}',
    'App release UI root',
  );
  source = replaceOnce(
    source,
    '<div className="flex items-center space-x-2 font-mono">\n          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>\n          <span className="font-semibold text-[11px]">Yang-Kura 本地音频媒体库</span>\n        </div>',
    '<div className="flex min-w-0 items-center gap-2">\n          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-color"></span>\n          <span className="truncate font-semibold text-[11px] text-text-primary">Yang-Kura</span>\n        </div>',
    'App header brand',
  );
  source = replaceOnce(
    source,
    '<div className="flex items-center space-x-2 font-sans">\n          <span className="text-[10px] text-text-muted bg-border-color/40 px-2 py-0.5 rounded">\n            本地媒体库\n          </span>',
    '<div className="flex min-w-0 items-center gap-2 font-sans">',
    'App header duplicate badge',
  );
  source = replaceOnce(
    source,
    'className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin px-4 md:px-6 xl:px-10 py-4 md:py-6 pb-24 bg-bg-primary"',
    'className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin px-4 md:px-6 xl:px-8 py-4 md:py-5 pb-24 bg-bg-primary"',
    'App main spacing',
  );
  write(path, source);
}

// Dashboard
{
  const path = 'src/components/Dashboard.tsx';
  let source = read(path);
  source = replaceOnce(source, '<div className="space-y-8 animate-fade-in">', '<div className="space-y-6 animate-fade-in">', 'Dashboard vertical rhythm');
  source = replaceOnce(
    source,
    'className="relative overflow-hidden rounded-3xl border border-border-color bg-gradient-to-br from-indigo-950/75 via-purple-950/35 to-card-bg p-5 md:p-7 shadow-xl"',
    'className="relative overflow-hidden rounded-2xl border border-border-color/70 bg-gradient-to-br from-indigo-950/65 via-purple-950/25 to-card-bg p-4 md:p-5 shadow-lg"',
    'Dashboard hero surface',
  );
  source = replaceOnce(
    source,
    'className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-center"',
    'className="relative z-10 grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4 items-center"',
    'Dashboard hero grid',
  );
  source = replaceOnce(source, 'className="text-2xl md:text-4xl font-extrabold tracking-tight text-text-primary"', 'className="text-xl md:text-2xl font-extrabold tracking-tight text-text-primary"', 'Dashboard hero title');
  source = replaceOnce(source, 'className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-color hover:bg-brand-color-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-brand-color/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"', 'className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-color px-4 text-xs font-semibold text-white shadow-sm shadow-brand-color/20 hover:bg-brand-color-hover disabled:cursor-not-allowed disabled:opacity-50"', 'Dashboard primary button');
  source = source.replaceAll('className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-text-primary hover:text-white text-xs font-semibold transition-all cursor-pointer"', 'className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-text-secondary hover:bg-white/10 hover:text-white"');
  source = replaceOnce(source, 'className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 p-4 md:p-5 shadow-2xl"', 'className="rounded-2xl border border-white/10 bg-black/20 p-3.5 backdrop-blur-md shadow-lg"', 'Dashboard continue card');
  source = replaceOnce(source, 'className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-800 shadow-xl"', 'className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800 shadow-lg"', 'Dashboard cover size');
  write(path, source);
}

// ASMR library
{
  const path = 'src/components/AsmrLibrary.tsx';
  let source = read(path);
  source = replaceOnce(source, '<div className="space-y-6 animate-fade-in">', '<div className="space-y-5 animate-fade-in">', 'ASMR rhythm');
  source = replaceOnce(
    source,
    '<div className="bg-card-bg/20 border border-border-color/50 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">',
    '<div id="u32-asmr-toolbar" className="rounded-2xl border border-border-color/60 bg-card-bg/25 p-3 flex flex-col gap-3">',
    'ASMR toolbar',
  );
  source = replaceOnce(source, 'className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-4xl"', 'className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1"', 'ASMR search row');
  source = source.replaceAll('className="bg-zinc-900 hover:bg-zinc-800 text-text-primary hover:text-brand-color border border-border-color hover:border-brand-color rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"', 'className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-color bg-card-bg px-3 text-xs font-semibold text-text-secondary hover:border-brand-color/50 hover:text-text-primary"');
  source = replaceOnce(source, 'className="flex flex-wrap items-center gap-3"', 'className="flex flex-wrap items-center gap-2"', 'ASMR sort row');
  write(path, source);
}

// Music library
{
  const path = 'src/components/MusicLibrary.tsx';
  let source = read(path);
  source = replaceOnce(source, '<div className="space-y-6 animate-fade-in">', '<div className="space-y-5 animate-fade-in">', 'Music rhythm');
  source = replaceOnce(source, 'className="flex bg-card-bg/50 border border-border-color p-1 rounded-xl text-xs font-semibold self-start"', 'className="flex flex-wrap gap-1 rounded-xl border border-border-color/70 bg-card-bg/40 p-1 text-xs font-semibold self-start"', 'Music tabs');
  source = source.replaceAll('className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${activeSubView ===', 'className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 transition-colors ${activeSubView ===');
  write(path, source);
}

// Playlists
{
  const path = 'src/components/PlaylistPage.tsx';
  let source = read(path);
  source = replaceOnce(source, '<div className="space-y-6 animate-fade-in">\n      {/* List View Header */}', '<div className="space-y-5 animate-fade-in">\n      {/* List View Header */}', 'Playlist rhythm');
  source = replaceOnce(source, '<span>本地播放歌单</span>', '<span>歌单</span>', 'Playlist title');
  source = replaceOnce(source, '自建歌单会保存在本机，可混合 音声音轨和普通音乐；不会保存真实文件路径或媒体链接。', `共 ${'${filteredPlaylists.length}'} 个歌单、${'${playlistSummary.trackCount}'} 首音轨；自建歌单保存在本机。`, 'Playlist subtitle');
  source = replaceOnce(source, 'className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-xs font-semibold shadow-lg shadow-brand-color/20 transition-all cursor-pointer"', 'className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-color px-4 text-xs font-semibold text-white shadow-sm shadow-brand-color/20 hover:bg-brand-color-hover"', 'Playlist create button');
  source = replaceOnce(source, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"', 'className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"', 'Playlist card grid');
  write(path, source);
}

// Importer
{
  const path = 'src/components/ImporterPage.tsx';
  let source = read(path);
  source = replaceOnce(source, 'className="space-y-6 pb-24 animate-fade-in"', 'className="space-y-5 pb-24 animate-fade-in"', 'Importer rhythm');
  source = replaceOnce(source, 'className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-violet-500/10 p-6 shadow-sm overflow-hidden relative"', 'className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-violet-500/10 p-5 shadow-sm overflow-hidden relative"', 'Importer hero');
  source = replaceOnce(source, 'className="mt-4 text-2xl font-black text-text-primary tracking-tight"', 'className="mt-3 text-xl font-black text-text-primary tracking-tight"', 'Importer title');
  source = replaceOnce(source, 'className="mt-3 text-sm leading-relaxed text-text-secondary"', 'className="mt-2 max-w-3xl text-xs leading-relaxed text-text-secondary"', 'Importer description');
  source = replaceOnce(source, 'className="grid grid-cols-1 lg:grid-cols-3 gap-4"', 'className="grid grid-cols-1 lg:grid-cols-3 gap-3"', 'Importer source grid');
  write(path, source);
}

// Settings
{
  const path = 'src/components/SettingsPage.tsx';
  let source = read(path);
  source = replaceOnce(source, '<div className="space-y-6 animate-fade-in max-w-5xl pb-12">', '<div className="mx-auto max-w-6xl space-y-5 pb-12 animate-fade-in">', 'Settings shell');
  source = replaceOnce(source, '<div className="border-b border-border-color pb-4">', '<div className="border-b border-border-color/70 pb-3">', 'Settings header');
  source = replaceOnce(source, '<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">', '<div className="space-y-4">', 'Settings layout');
  source = replaceOnce(source, '<div className="md:col-span-3 space-y-1.5">', '<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">', 'Settings tabs grid');
  source = replaceOnce(source, 'className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left border ${', 'className={`h-11 w-full flex items-center justify-center gap-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left border ${', 'Settings tab button');
  source = replaceOnce(source, '<div className="min-w-0">\n                  <span className="block truncate">{tab.label}</span>\n                  <span className="block text-[9px] text-text-muted truncate mt-0.5 font-normal">\n                    {tab.desc}\n                  </span>\n                </div>', '<span className="truncate">{tab.label}</span>\n                <span className="sr-only">{tab.desc}</span>', 'Settings tab labels');
  source = replaceOnce(source, '<div className="md:col-span-9">', '<div className="min-w-0">', 'Settings content');
  source = replaceOnce(source, 'className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4"', 'className="rounded-2xl border border-border-color/70 bg-card-bg/35 p-4 space-y-4"', 'Settings theme panel');
  write(path, source);
}

// Global U32 release-candidate visual contract
{
  const path = 'src/index.css';
  let source = read(path);
  const marker = '/* U32 release-candidate UI cleanup */';
  if (!source.includes(marker)) {
    source += `\n\n${marker}\n.u32-release-ui main > .animate-fade-in {\n  width: 100%;\n  max-width: 1440px;\n  margin-inline: auto;\n}\n\n/* Historical engineering summaries stay in the DOM for compatibility, but no longer occupy daily UI. */\n.u32-release-ui #mvp45-home-quick-entry,\n.u32-release-ui #mvp40-playlist-overview,\n.u32-release-ui #mvp53-playlist-visual-unity,\n.u32-release-ui #mvp86-importer-task-summary,\n.u32-release-ui #mvp112-importer-primary-flow {\n  display: none !important;\n}\n\n.u32-release-ui #mvp46-asmr-browse-summary,\n.u32-release-ui #mvp40-music-library-overview {\n  padding: 0.75rem;\n  border-radius: 0.875rem;\n  background: color-mix(in srgb, var(--card-bg) 28%, transparent);\n}\n\n.u32-release-ui #mvp46-asmr-browse-summary > .grid,\n.u32-release-ui #mvp46-asmr-browse-summary > #mvp52-asmr-beta-regression,\n.u32-release-ui #mvp46-asmr-browse-summary > #mvp53-asmr-visual-unity,\n.u32-release-ui #mvp40-music-library-overview > .grid,\n.u32-release-ui #mvp40-music-library-overview > #mvp52-music-beta-regression,\n.u32-release-ui #mvp40-music-library-overview > #mvp53-music-visual-unity {\n  display: none !important;\n}\n\n.u32-release-ui #mvp126-asmr-render-window,\n.u32-release-ui #mvp126-music-render-window {\n  min-height: 1.75rem;\n  border: 0;\n  background: transparent;\n  padding: 0 0.25rem;\n}\n\n.u32-release-ui #u32-asmr-toolbar select,\n.u32-release-ui #u32-asmr-toolbar input {\n  min-height: 2.25rem;\n}\n\n.u32-release-ui main button:not(:disabled) {\n  cursor: pointer;\n}\n\n@media (max-width: 1120px) {\n  .u32-release-ui #windows-app-bar { padding-inline: 0.75rem; }\n  .u32-release-ui main { padding-inline: 1rem; }\n}\n`;
  }
  write(path, source);
}

console.log('U32 UI cleanup patch applied');
