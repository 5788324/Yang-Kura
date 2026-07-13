import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const sectionPath = 'src/components/PlayerBarPrimarySections.tsx';
const sectionSource = fs.readFileSync(sectionPath, 'utf8');
const transpiled = ts.transpileModule(sectionSource, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: sectionPath,
  reportDiagnostics: true,
});

const errors = (transpiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, `primary section TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

for (const marker of [
  'export function PlayerTrackSummary',
  'export function PlayerTransportControls',
  'aria-label={`打开《${track.title}》全屏歌词`}',
  'aria-pressed={isLiked}',
  'role="group"',
  'aria-label="播放控制"',
  'aria-label={`切换播放模式，当前为${loopLabel}`}',
  'aria-label={playLabel}',
  'aria-pressed={isPlaying}',
  'aria-pressed={isQueueOpen}',
  'mvp74-playerbar-daily-control-strip',
  'mvp49-player-status-strip',
  'mvp50-player-visual-strip',
  'mvp54-player-regression-strip',
  'mvp59-player-compact-strip',
]) {
  assert.ok(sectionSource.includes(marker), `primary section contract missing: ${marker}`);
}

for (const forbidden of [
  'useState(',
  'useEffect(',
  'useMemo(',
  'localStorage',
  'window.yangKura',
  'setTimeout(',
  'useAudioPlayer',
  'onAddToPlaylist',
  'toggleFavorite(',
  'togglePlay(',
]) {
  assert.ok(!sectionSource.includes(forbidden), `primary section crossed behavior boundary: ${forbidden}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  "import { PlayerTrackSummary, PlayerTransportControls } from './PlayerBarPrimarySections';",
  '<PlayerTrackSummary',
  'onToggleFavorite={() => {',
  "setToastMessage(isLiked ? '已取消喜欢' : '已添加到喜欢')",
  '<PlayerTransportControls',
  'onToggleLoopMode={toggleLoopMode}',
  'onPrevious={onPrev}',
  'onTogglePlay={togglePlay}',
  'onNext={onNext}',
  'onToggleQueue={toggleQueue}',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar primary section integration missing: ${marker}`);
}

for (const forbidden of [
  '<SkipBack className=',
  '<SkipForward className=',
  '<Heart ',
  '<CoverArtwork',
  'role="group"\n        aria-label="播放控制"',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns extracted primary presentation: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U18（已完成）', 'U19', '主展示区', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U19 fact: ${marker}`);
}

console.log('U19 player primary sections verifier PASS');
