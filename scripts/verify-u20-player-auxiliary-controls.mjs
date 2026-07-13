import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const componentPath = 'src/components/PlayerBarAuxiliaryControls.tsx';
const componentSource = fs.readFileSync(componentPath, 'utf8');
const transpiled = ts.transpileModule(componentSource, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: componentPath,
  reportDiagnostics: true,
});

const errors = (transpiled.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, `auxiliary controls TypeScript diagnostics: ${errors.map((item) => item.messageText).join('; ')}`);

for (const marker of [
  'export function PlayerAuxiliaryControls',
  'export function PlayerCompatibilityMarkers',
  'AUXILIARY_ICON_BUTTON_BASE_CLASS',
  'AUXILIARY_ICON_BUTTON_IDLE_CLASS',
  'aria-label="辅助播放控制"',
  'aria-label={`播放完成策略：${completionLabel}`}',
  'isPlaylistMenuOpen: boolean;',
  'isFloatingLyricsVisible: boolean;',
  'isVolumePopoverVisible: boolean;',
  'aria-haspopup="menu"',
  'aria-expanded={isPlaylistMenuOpen}',
  'aria-pressed={isFloatingLyricsVisible}',
  'aria-pressed={isMuted}',
  '<FolderPlus className="w-4.5 h-4.5" aria-hidden="true" />',
  '<Tv className="w-4.5 h-4.5" aria-hidden="true" />',
  '<MoreHorizontal className="w-4 h-4" aria-hidden="true" />',
  'mvp59-player-beta-chips',
  'mvp79-player-ui-bugfix',
]) {
  assert.ok(componentSource.includes(marker), `auxiliary control contract missing: ${marker}`);
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
  'setPlayerToastMessage',
  'toggleCompletionMode(',
  'toggleMute(',
]) {
  assert.ok(!componentSource.includes(forbidden), `auxiliary controls crossed behavior boundary: ${forbidden}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  "import { PlayerAuxiliaryControls, PlayerCompatibilityMarkers } from './PlayerBarAuxiliaryControls';",
  "import { usePlayerBarActions } from '../hooks/usePlayerBarActions';",
  '<PlayerAuxiliaryControls',
  '{...presentation.auxiliary}',
  'onToggleCompletion={() => toggleCompletionMode?.()}',
  'onSelectPlaylist={selectPlaylist}',
  'onToggleFloatingLyrics={toggleFloatingLyrics}',
  'onToggleMute={toggleMute}',
  'onMoreActions={showMoreActions}',
  '<PlayerCompatibilityMarkers {...presentation.compatibility} />',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar auxiliary integration missing: ${marker}`);
}

const presentationModel = fs.readFileSync('src/player/playerBarPresentationModel.ts', 'utf8');
for (const marker of [
  'auxiliary:',
  'completionLabel: listening.completionLabel',
  'completionHint: listening.completionHint',
  'visibleVolume: volume.visibleVolume',
  'visibleVolumePercent: volume.visibleVolumePercent',
  'compatibility:',
  'betaChips: beta.chips',
  'hiddenMaintenanceNote: compatibility.hiddenMaintenanceNote',
]) {
  assert.ok(presentationModel.includes(marker), `auxiliary presentation mapping missing: ${marker}`);
}

const actionHook = fs.readFileSync('src/hooks/usePlayerBarActions.ts', 'utf8');
for (const marker of [
  'const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState(false);',
  'const [isFloatingLyricsVisible, setIsFloatingLyricsVisible] = useState(false);',
  'const togglePlaylistMenu = useCallback(() => {',
  'const selectPlaylist = useCallback(',
  'const toggleFloatingLyrics = useCallback(() => {',
  'const showMoreActions = useCallback(() => {',
  'showMessage(MORE_PLAYER_ACTIONS_MESSAGE)',
]) {
  assert.ok(actionHook.includes(marker), `player action auxiliary contract missing: ${marker}`);
}

for (const forbidden of [
  "from 'lucide-react'",
  '<FolderPlus ',
  '<Tv ',
  '<Volume2 ',
  '<VolumeX ',
  '<MoreHorizontal ',
  'id="mvp59-player-beta-chips"',
  'id="mvp79-player-ui-bugfix"',
  'aria-label={`播放完成策略：${mvp49Player.completionLabel}`}',
  'showPlaylistDropdown',
  'desktopLyricsActive',
  'showVolumeSlider',
  'handleTogglePlaylist',
  'handleToggleFloatingLyrics',
  'handleMoreActions',
  'setPlayerToastMessage',
  'mvp59PlayerBeta',
  'mvp79PlayerUi',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns extracted auxiliary presentation or actions: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U19（已完成）', 'U20', '辅助控制区', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U20 fact: ${marker}`);
}

console.log('U20 player auxiliary controls verifier PASS');
