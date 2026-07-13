import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadTypeScriptModule(path) {
  const source = fs.readFileSync(path, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: path,
  });

  const runtimeModule = { exports: {} };
  const context = vm.createContext({
    module: runtimeModule,
    exports: runtimeModule.exports,
    console,
  });
  new vm.Script(compiled.outputText, { filename: path }).runInContext(context);
  return runtimeModule.exports;
}

const math = loadTypeScriptModule('src/player/playerBarMath.ts');
const lyrics = loadTypeScriptModule('src/player/lyricsTimeline.ts');

assert.equal(math.clampPlayerValue(12, 0, 10), 10);
assert.equal(math.clampPlayerValue(-2, 0, 10), 0);
assert.equal(math.getSafeTrackDuration(null), 0);
assert.equal(math.getSafeTrackDuration({ duration: -1 }), 0);
assert.equal(math.getSafeTrackDuration({ duration: Number.NaN }), 0);
assert.equal(math.getSafeTrackDuration({ duration: 125.5 }), 125.5);
assert.equal(math.formatPlayerTime(-1), '0:00');
assert.equal(math.formatPlayerTime(Number.NaN), '0:00');
assert.equal(math.formatPlayerTime(65.9), '1:05');
assert.equal(math.seekFromPointerPosition(200, 100, 200, 120), 60);
assert.equal(math.seekFromPointerPosition(20, 100, 200, 120), 0);
assert.equal(math.seekFromPointerPosition(400, 100, 200, 120), 120);
assert.equal(math.seekFromPointerPosition(200, 100, 0, 120), null);
assert.equal(math.seekFromPointerPosition(200, 100, 200, 0), null);

const progressNormal = math.getPlayerProgressMetrics(30, null, 120);
assert.equal(progressNormal.currentDisplayProgress, 30);
assert.equal(progressNormal.progressPercent, 25);
const progressDragged = math.getPlayerProgressMetrics(30, 150, 120);
assert.equal(progressDragged.currentDisplayProgress, 120);
assert.equal(progressDragged.progressPercent, 100);
const progressInvalid = math.getPlayerProgressMetrics(Number.NaN, null, 0);
assert.equal(progressInvalid.currentDisplayProgress, 0);
assert.equal(progressInvalid.progressPercent, 0);

const volumeNormal = math.getPlayerVolumeMetrics(1.5, false);
assert.equal(volumeNormal.visibleVolume, 1);
assert.equal(volumeNormal.visibleVolumePercent, 100);
const volumeMuted = math.getPlayerVolumeMetrics(0.7, true);
assert.equal(volumeMuted.visibleVolume, 0);
assert.equal(volumeMuted.visibleVolumePercent, 0);

const timeline = lyrics.parseLyrics([
  '[00:00.00]第一句',
  'invalid line',
  '[00:05.50]第二句',
]);
assert.equal(timeline.length, 2);
assert.equal(lyrics.getActiveLyricText(timeline, 0, 'fallback'), '第一句');
assert.equal(lyrics.getActiveLyricText(timeline, 6, 'fallback'), '第二句');
assert.equal(lyrics.getActiveLyricText([], 6, 'fallback'), 'fallback');

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
const seekHook = fs.readFileSync('src/hooks/usePlayerSeekInteraction.ts', 'utf8');
const lyricHook = fs.readFileSync('src/hooks/useFloatingLyricText.ts', 'utf8');
const playerIntegration = `${playerBar}\n${seekHook}\n${lyricHook}`;
for (const marker of [
  "from '../player/playerBarMath'",
  "from '../player/lyricsTimeline'",
  'getSafeTrackDuration(currentTrack)',
  'getPlayerProgressMetrics(progress, dragPreviewSeconds, duration)',
  'getPlayerVolumeMetrics(volume, isMuted)',
  'seekFromPointerPosition(event.clientX, rect.left, rect.width, duration)',
  'parseLyrics(currentTrack?.lyrics)',
  "getActiveLyricText(parsedLyrics, progress, fallback)",
  'useFloatingLyricText(currentTrack, progress)',
]) {
  assert.ok(playerIntegration.includes(marker), `player integration missing: ${marker}`);
}

for (const forbidden of [
  'const clamp =',
  'const getSafeDuration =',
  'const formatTime =',
  'const parseLrcFractionalSeconds =',
  'const seekFromPointer =',
  'currentTrack.lyrics.map(line =>',
  'parseLyrics(',
  'getActiveLyricText(',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns extracted logic: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U14', 'U15', '播放器底栏纯逻辑', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U15 fact: ${marker}`);
}

console.log('U15 player bar pure logic verifier PASS');
