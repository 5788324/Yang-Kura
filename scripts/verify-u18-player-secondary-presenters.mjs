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

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  'PlayerSeekPreview,',
  'PlayerEmptyState,',
  'PlayerFloatingLyrics,',
  '<PlayerSeekPreview',
  'timeLabel={formatPlayerTime(hoverTime)}',
  '<PlayerEmptyState',
  'regressionLine={mvp54PlayerRegression.compactLine}',
  '<PlayerFloatingLyrics',
  'text={activeLyric}',
  'onClose={() => setDesktopLyricsActive(false)}',
  'aria-label="播放进度"',
  'onToggleDesktopLyrics={handleToggleDesktopLyrics}',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar secondary presenter integration missing: ${marker}`);
}

const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
for (const marker of [
  'aria-label={desktopLyricsActive ? \'关闭歌词浮窗\' : \'开启歌词浮窗\'}',
  'aria-pressed={desktopLyricsActive}',
  '<Tv className="w-4.5 h-4.5" aria-hidden="true" />',
]) {
  assert.ok(auxiliary.includes(marker), `auxiliary lyrics-toggle integration missing: ${marker}`);
}

for (const forbidden of [
  '<Sparkles className="w-4.5 h-4.5 text-sky-400"',
  '<span>跳转预览</span>',
  'fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-950/90',
  'id="mvp59-player-empty-hint" className="text-[10px] text-zinc-500"',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns extracted secondary presentation: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U17', 'U18', '次级展示组件', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U18 fact: ${marker}`);
}

console.log('U18 player secondary presenters verifier PASS');
