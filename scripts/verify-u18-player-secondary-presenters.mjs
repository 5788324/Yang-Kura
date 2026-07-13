import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const presenterPath = 'src/components/PlayerTransientPresenters.tsx';
const presenterSource = fs.readFileSync(presenterPath, 'utf8');
const transpiled = ts.transpileModule(presenterSource, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: presenterPath,
  reportDiagnostics: true,
});

const errors = (transpiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, `presenter TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

for (const marker of [
  'export function PlayerSeekPreview',
  'export function PlayerEmptyState',
  'export function PlayerFloatingLyrics',
  'aria-hidden="true"',
  'role="status"',
  'aria-live="polite"',
  'aria-atomic="true"',
  'aria-label="关闭歌词浮窗"',
  'mvp59-player-empty-hint',
  'mvp50-player-empty-hint',
  'mvp54-player-empty-regression-hint',
  '跳转预览',
  '歌词浮窗同步',
]) {
  assert.ok(presenterSource.includes(marker), `secondary presenter contract missing: ${marker}`);
}

for (const forbidden of [
  'useState(',
  'useEffect(',
  'useMemo(',
  'localStorage',
  'window.yangKura',
  'setTimeout(',
  'togglePlay',
  'onSeek',
  'parseLyrics',
  'getActiveLyricText',
]) {
  assert.ok(!presenterSource.includes(forbidden), `secondary presenter crossed behavior boundary: ${forbidden}`);
}

const progressTrack = fs.readFileSync('src/components/PlayerProgressTrack.tsx', 'utf8');
for (const marker of [
  "import { PlayerSeekPreview } from './PlayerTransientPresenters';",
  '<PlayerSeekPreview percent={hoverPercent} timeLabel={hoverTimeLabel} />',
  'aria-label="播放进度"',
]) {
  assert.ok(progressTrack.includes(marker), `progress-track presenter integration missing: ${marker}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  'PlayerEmptyState,',
  'PlayerFloatingLyrics,',
  "import { PlayerProgressTrack } from './PlayerProgressTrack';",
  "import { useFloatingLyricText } from '../hooks/useFloatingLyricText';",
  '<PlayerProgressTrack',
  'hoverTimeLabel={hoverTime !== null ? formatPlayerTime(hoverTime) : null}',
  '<PlayerEmptyState',
  'regressionLine={mvp54PlayerRegression.compactLine}',
  '<PlayerFloatingLyrics text={activeLyric} onClose={closeFloatingLyrics} />',
  'onToggleFloatingLyrics={toggleFloatingLyrics}',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar secondary presenter integration missing: ${marker}`);
}

const lyricHook = fs.readFileSync('src/hooks/useFloatingLyricText.ts', 'utf8');
for (const marker of [
  'parseLyrics(currentTrack?.lyrics)',
  'getActiveLyricText(parsedLyrics, progress, fallback)',
]) {
  assert.ok(lyricHook.includes(marker), `floating lyric derivation missing: ${marker}`);
}

const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
for (const marker of [
  "aria-label={isFloatingLyricsVisible ? '关闭歌词浮窗' : '开启歌词浮窗'}",
  'aria-pressed={isFloatingLyricsVisible}',
  '<Tv className="w-4.5 h-4.5" aria-hidden="true" />',
]) {
  assert.ok(auxiliary.includes(marker), `auxiliary lyrics-toggle integration missing: ${marker}`);
}

for (const forbidden of [
  '<Sparkles className="w-4.5 h-4.5 text-sky-400"',
  '<span>跳转预览</span>',
  'fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-950/90',
  'id="mvp59-player-empty-hint" className="text-[10px] text-zinc-500"',
  'id="mvp75-playerbar-progress-stability"',
  'type="range"',
  'parseLyrics(',
  'getActiveLyricText(',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns extracted secondary presentation or lyric derivation: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U17', 'U18', '次级展示组件', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U18 fact: ${marker}`);
}

console.log('U18 player secondary presenters verifier PASS');
