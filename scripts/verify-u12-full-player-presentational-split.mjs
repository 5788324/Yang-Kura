import fs from 'node:fs';

const lyricsPath = 'src/components/LyricsPanel.tsx';
const headerPath = 'src/components/player/FullPlayerHeader.tsx';
const focusPath = 'src/components/player/PlayerFocusSummary.tsx';
const statePath = 'PROJECT_STATE.md';
const roadmapPath = 'PROJECT_ROADMAP.md';

const lyrics = fs.readFileSync(lyricsPath, 'utf8');
const header = fs.readFileSync(headerPath, 'utf8');
const focus = fs.readFileSync(focusPath, 'utf8');
const projectState = fs.readFileSync(statePath, 'utf8');
const roadmap = fs.readFileSync(roadmapPath, 'utf8');
const failures = [];

for (const marker of [
  "import FullPlayerHeader, { type FullPlayerStyle } from './player/FullPlayerHeader';",
  "import PlayerFocusSummary from './player/PlayerFocusSummary';",
  "useState<FullPlayerStyle>('classic')",
  '<FullPlayerHeader',
  'closeButtonRef={closeButtonRef}',
  'onPlayerStyleChange={setPlayerStyle}',
  'modeTitle={playerSurfaceSummary.modeTitle}',
  '<PlayerFocusSummary',
  'model={mvp73PlayerFocus}',
]) {
  if (!lyrics.includes(marker)) failures.push(`LyricsPanel missing U12 integration marker: ${marker}`);
}

for (const forbidden of [
  'id="mvp78-player-header-wrap-safe"',
  'id="mvp73-player-daily-visual-focus"',
  '<ChevronDown',
  'playerDailyVisualFocusService.getChipClass(chip.tone)',
]) {
  if (lyrics.includes(forbidden)) failures.push(`LyricsPanel still owns extracted presentation: ${forbidden}`);
}

for (const marker of [
  "export type FullPlayerStyle = 'classic' | 'vinyl' | 'lyrics';",
  'id="mvp78-player-header-wrap-safe"',
  'ref={closeButtonRef}',
  'onClick={onClose}',
  "{ value: 'classic', label: '经典模式' }",
  "{ value: 'vinyl', label: '黑胶唱片' }",
  "{ value: 'lyrics', label: '歌词模式' }",
  'onPlayerStyleChange(option.value)',
  '{modeTitle}',
  '{sourceHint}',
]) {
  if (!header.includes(marker)) failures.push(`FullPlayerHeader missing marker: ${marker}`);
}

for (const marker of [
  'id="mvp73-player-daily-visual-focus"',
  '{model.eyebrow}',
  '{model.modeLabel}',
  '{model.title}',
  '{model.subtitle}',
  '{model.focusLine}',
  'model.chips.map',
  'model.cards.map',
  'playerDailyVisualFocusService.getChipClass(chip.tone)',
]) {
  if (!focus.includes(marker)) failures.push(`PlayerFocusSummary missing marker: ${marker}`);
}

for (const [name, source] of [
  ['FullPlayerHeader', header],
  ['PlayerFocusSummary', focus],
]) {
  for (const forbidden of [
    'useEffect(',
    'useState(',
    'localStorage',
    'sessionStorage',
    'window.electron',
    'ipcRenderer',
    'togglePlay',
    'onSeek',
    'onVolumeChange',
  ]) {
    if (source.includes(forbidden)) failures.push(`${name} contains forbidden side effect marker: ${forbidden}`);
  }
}

for (const marker of ['U11', 'U12', '纯展示', 'MVP130']) {
  if (!projectState.includes(marker) && !roadmap.includes(marker)) {
    failures.push(`project progress missing U12 marker: ${marker}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U12 full player presentational split verifier PASS');
