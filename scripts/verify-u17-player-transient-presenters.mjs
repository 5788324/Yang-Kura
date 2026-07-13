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
  'export function PlayerPlaylistMenu',
  'export function PlayerVolumePopover',
  'export function PlayerToast',
  'role="menu"',
  'aria-label="关闭歌单选择"',
  'aria-label="播放音量"',
  'role="status"',
  'aria-live="polite"',
  '暂无自定义歌单',
  '已收藏',
  '只读',
]) {
  assert.ok(presenterSource.includes(marker), `presenter contract missing: ${marker}`);
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
  'onAddToPlaylist',
]) {
  assert.ok(!presenterSource.includes(forbidden), `presenter crossed behavior boundary: ${forbidden}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  "from './PlayerTransientPresenters'",
  '<PlayerToast message={playerToastMessage} />',
  'onSelectPlaylist={selectPlaylist}',
  'onVolumeChange={handleVolumeSlide}',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar presenter integration missing: ${marker}`);
}

const actionHook = fs.readFileSync('src/hooks/usePlayerBarActions.ts', 'utf8');
for (const marker of [
  'getPlaylistSelectionDecision(currentTrack, playlist)',
  'if (decision.shouldAdd) onAddToPlaylist(currentTrack, playlist.id)',
  'showMessage(decision.message)',
  'setIsPlaylistMenuOpen(false)',
]) {
  assert.ok(actionHook.includes(marker), `playlist action integration missing: ${marker}`);
}

const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
for (const marker of [
  "from './PlayerTransientPresenters'",
  '<PlayerPlaylistMenu',
  'onSelectPlaylist={onSelectPlaylist}',
  '<PlayerVolumePopover',
  'onChange={onVolumeChange}',
]) {
  assert.ok(auxiliary.includes(marker), `auxiliary presenter integration missing: ${marker}`);
}

for (const forbidden of [
  'playlists.map(p =>',
  "style={{ contentVisibility: 'auto' }}",
  'fixed bottom-24 right-6 z-50 bg-sky-500 text-white',
  '<span>请选择收藏的歌单</span>',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns extracted presentation: ${forbidden}`);
  assert.ok(!auxiliary.includes(forbidden), `auxiliary wrapper duplicated transient presentation: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U16', 'U17', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U17 fact: ${marker}`);
}

console.log('U17 player transient presenters verifier PASS');
