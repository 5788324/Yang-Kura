import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function transpile(path, jsx = false) {
  const compilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  };
  if (jsx) compilerOptions.jsx = ts.JsxEmit.ReactJSX;

  const source = fs.readFileSync(path, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions,
    fileName: path,
    reportDiagnostics: true,
  });
  const errors = (result.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors.length, 0, `${path} TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);
  return { source, output: result.outputText };
}

const actionModelPath = 'src/player/playerBarActionModel.ts';
const actionModel = transpile(actionModelPath);
const runtimeModule = { exports: {} };
const context = vm.createContext({ module: runtimeModule, exports: runtimeModule.exports, console });
new vm.Script(actionModel.output, { filename: actionModelPath }).runInContext(context);
const decisions = runtimeModule.exports;

const track = { id: 'track-1' };
const systemPlaylist = { id: 'system', name: '系统', isSystem: true, tracks: [] };
const duplicatePlaylist = { id: 'duplicate', name: '重复', tracks: [{ id: 'track-1' }] };
const writablePlaylist = { id: 'custom', name: '睡前收藏', tracks: [] };

const systemDecision = decisions.getPlaylistSelectionDecision(track, systemPlaylist);
assert.equal(systemDecision.shouldAdd, false);
assert.equal(systemDecision.message, '系统示例歌单不可修改，请新建自建歌单');

const duplicateDecision = decisions.getPlaylistSelectionDecision(track, duplicatePlaylist);
assert.equal(duplicateDecision.shouldAdd, false);
assert.equal(duplicateDecision.message, '已存在于该歌单中');

const writableDecision = decisions.getPlaylistSelectionDecision(track, writablePlaylist);
assert.equal(writableDecision.shouldAdd, true);
assert.equal(writableDecision.message, '成功收藏到歌单《睡前收藏》');

assert.equal(decisions.getFavoriteToggleMessage(false), '已添加到喜欢');
assert.equal(decisions.getFavoriteToggleMessage(true), '已取消喜欢');
assert.equal(decisions.getFloatingLyricsToggleMessage(false), '歌词浮窗已开启');
assert.equal(decisions.getFloatingLyricsToggleMessage(true), '歌词浮窗已关闭');
assert.equal(decisions.MORE_PLAYER_ACTIONS_MESSAGE, '更多播放操作将在后续版本开放');

for (const filePath of [
  'src/hooks/usePlayerBarActions.ts',
  'src/hooks/useFloatingLyricText.ts',
  'src/components/PlayerBar.tsx',
]) {
  transpile(filePath, filePath.endsWith('.tsx'));
}

const actionHook = fs.readFileSync('src/hooks/usePlayerBarActions.ts', 'utf8');
for (const marker of [
  'export function usePlayerBarActions',
  'useAutoDismissMessage()',
  'getFavoriteToggleMessage(isLiked)',
  'getPlaylistSelectionDecision(currentTrack, playlist)',
  'if (decision.shouldAdd) onAddToPlaylist(currentTrack, playlist.id)',
  'getFloatingLyricsToggleMessage(isFloatingLyricsVisible)',
  'showMessage(MORE_PLAYER_ACTIONS_MESSAGE)',
  'setIsPlaylistMenuOpen(false)',
  'setIsFloatingLyricsVisible(false)',
]) {
  assert.ok(actionHook.includes(marker), `action hook contract missing: ${marker}`);
}

for (const forbidden of [
  'window.yangKura',
  'localStorage',
  'useAudioPlayer',
  'onSeek(',
  'togglePlay(',
  'parseLyrics(',
  'getActiveLyricText(',
]) {
  assert.ok(!actionHook.includes(forbidden), `action hook crossed behavior boundary: ${forbidden}`);
}

const lyricHook = fs.readFileSync('src/hooks/useFloatingLyricText.ts', 'utf8');
for (const marker of [
  'export function useFloatingLyricText',
  'parseLyrics(currentTrack?.lyrics)',
  'getActiveLyricText(parsedLyrics, progress, fallback)',
  "DEFAULT_FLOATING_LYRIC_FALLBACK = 'Yang-Kura 本地音频播放中'",
]) {
  assert.ok(lyricHook.includes(marker), `floating lyric hook contract missing: ${marker}`);
}

for (const forbidden of [
  'useState(',
  'localStorage',
  'window.yangKura',
  'setTimeout(',
  'togglePlay(',
  'onSeek(',
]) {
  assert.ok(!lyricHook.includes(forbidden), `floating lyric hook crossed behavior boundary: ${forbidden}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  "import { useFloatingLyricText } from '../hooks/useFloatingLyricText';",
  "import { usePlayerBarActions } from '../hooks/usePlayerBarActions';",
  'const hasTrack = currentTrack !== null;',
  'const canToggleCompletion = toggleCompletionMode !== undefined;',
  'usePlayerBarActions({',
  'const activeLyric = useFloatingLyricText(currentTrack, progress);',
  'onToggleFavorite={toggleCurrentFavorite}',
  'onTogglePlaylist={togglePlaylistMenu}',
  'onClosePlaylist={closePlaylistMenu}',
  'onSelectPlaylist={selectPlaylist}',
  'onToggleFloatingLyrics={toggleFloatingLyrics}',
  'onMoreActions={showMoreActions}',
  '<PlayerFloatingLyrics text={activeLyric} onClose={closeFloatingLyrics} />',
  '<PlayerToast message={playerToastMessage} />',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar U22 integration missing: ${marker}`);
}

for (const forbidden of [
  'useState(',
  'useMemo(',
  'setPlayerToastMessage',
  'setIsPlaylistMenuOpen',
  'setIsFloatingLyricsVisible',
  'getPlaylistSelectionDecision(',
  'getFavoriteToggleMessage(',
  'getFloatingLyricsToggleMessage(',
  'parseLyrics(',
  'getActiveLyricText(',
  'Boolean(currentTrack)',
  'Boolean(toggleCompletionMode)',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns U22 state or decisions: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U21（已完成）', 'U22', '播放器事件', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U22 fact: ${marker}`);
}

console.log('U22 player bar actions verifier PASS');
