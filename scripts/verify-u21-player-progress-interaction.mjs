import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

for (const filePath of [
  'src/hooks/usePlayerSeekInteraction.ts',
  'src/components/PlayerProgressTrack.tsx',
]) {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: filePath,
    reportDiagnostics: true,
  });

  const errors = (transpiled.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors.length, 0, `${filePath} TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);
}

const hook = fs.readFileSync('src/hooks/usePlayerSeekInteraction.ts', 'utf8');
for (const marker of [
  'export function usePlayerSeekInteraction',
  'getSafeTrackDuration(currentTrack)',
  'getPlayerProgressMetrics(progress, dragPreviewSeconds, duration)',
  'event.stopPropagation()',
  'seekFromPointerPosition(event.clientX, rect.left, rect.width, duration)',
  'setHoverPreview({ percent, time: percent * duration })',
  'pendingSeekSecondsRef.current = displayProgress',
  'setDragPreviewSeconds(displayProgress)',
  'pendingSeekSecondsRef.current = nextValue',
  'setDragPreviewSeconds(nextValue)',
  'onSeek(clampPlayerValue(finalSeek, 0, duration))',
  'pendingSeekSecondsRef.current = null',
  'setDragPreviewSeconds(null)',
]) {
  assert.ok(hook.includes(marker), `seek interaction contract missing: ${marker}`);
}

for (const forbidden of [
  'localStorage',
  'window.yangKura',
  'useAudioPlayer',
  'togglePlay',
  'setTimeout(',
  'PlayerSeekPreview',
]) {
  assert.ok(!hook.includes(forbidden), `seek hook crossed behavior boundary: ${forbidden}`);
}

const progressTrack = fs.readFileSync('src/components/PlayerProgressTrack.tsx', 'utf8');
for (const marker of [
  'export function PlayerProgressTrack',
  'id="mvp75-playerbar-progress-stability"',
  '<PlayerSeekPreview percent={hoverPercent} timeLabel={hoverTimeLabel} />',
  "transitionProperty: isDragging ? 'none' : undefined",
  'onMouseDown={onRangeStart}',
  'onTouchStart={onRangeStart}',
  'onMouseUp={onRangeCommit}',
  'onTouchEnd={onRangeCommit}',
  'aria-label="播放进度"',
]) {
  assert.ok(progressTrack.includes(marker), `progress presenter contract missing: ${marker}`);
}

for (const forbidden of [
  'useState(',
  'useEffect(',
  'useMemo(',
  'localStorage',
  'window.yangKura',
  'onSeek(',
  'seekFromPointerPosition',
]) {
  assert.ok(!progressTrack.includes(forbidden), `progress presenter crossed behavior boundary: ${forbidden}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  "import { usePlayerSeekInteraction } from '../hooks/usePlayerSeekInteraction';",
  "import { PlayerProgressTrack } from './PlayerProgressTrack';",
  'isVisible: isVolumePopoverVisible',
  'usePlayerSeekInteraction({ currentTrack, progress, onSeek })',
  '<PlayerProgressTrack',
  'onRangeCommit={commitProgressDrag}',
  'isPlaylistMenuOpen={isPlaylistMenuOpen}',
  'isFloatingLyricsVisible={isFloatingLyricsVisible}',
  'isVolumePopoverVisible={isVolumePopoverVisible}',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar U21 integration missing: ${marker}`);
}

const actionHook = fs.readFileSync('src/hooks/usePlayerBarActions.ts', 'utf8');
for (const marker of [
  'const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false);',
  'const [isFloatingLyricsVisible, setIsFloatingLyricsVisible] = useState(false);',
  'const { message: playerToastMessage, showMessage } = useAutoDismissMessage();',
]) {
  assert.ok(actionHook.includes(marker), `U21 visibility state moved without contract: ${marker}`);
}

for (const forbidden of [
  'pendingSeekValueRef',
  'progressBarRef',
  'const [hoverTime, setHoverTime]',
  'const [hoverPercent, setHoverPercent]',
  'const [dragValue, setDragValue]',
  'id="mvp75-playerbar-progress-stability"',
  'type="range"',
  'showPlaylistDropdown',
  'desktopLyricsActive',
  'showVolumeSlider',
  'toastMessage',
  'useState(',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns U21 state or presentation: ${forbidden}`);
}

const auxiliary = fs.readFileSync('src/components/PlayerBarAuxiliaryControls.tsx', 'utf8');
for (const marker of [
  'isPlaylistMenuOpen: boolean;',
  'isFloatingLyricsVisible: boolean;',
  'isVolumePopoverVisible: boolean;',
  'aria-expanded={isPlaylistMenuOpen}',
  'aria-pressed={isFloatingLyricsVisible}',
]) {
  assert.ok(auxiliary.includes(marker), `auxiliary visibility naming missing: ${marker}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U20（已完成）', 'U21', '进度轨道', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U21 fact: ${marker}`);
}

console.log('U21 player progress interaction verifier PASS');
