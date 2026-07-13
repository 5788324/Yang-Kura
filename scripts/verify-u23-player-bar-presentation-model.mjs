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

const modelPath = 'src/player/playerBarPresentationModel.ts';
const model = transpile(modelPath);
const calls = [];
const requireMap = {
  '../services/playerExperienceService': {
    playerExperienceService: {
      getSummary(state) {
        calls.push(['experience', state]);
        return { completionModeDescription: 'completion-description' };
      },
    },
  },
  '../services/listeningExperiencePolishService': {
    listeningExperiencePolishService: {
      getPlayerBarModel(state) {
        calls.push(['listening', state]);
        return {
          statusBadges: [{ label: 'status', tone: 'green' }],
          completionLabel: 'completion-label',
          completionHint: 'completion-hint',
        };
      },
    },
  },
  '../services/playerVisualPolishService': {
    playerVisualPolishService: {
      getPlayerBarModel(state) {
        calls.push(['visual', state]);
        return { contextLine: 'visual-context' };
      },
    },
  },
  '../services/betaRegressionChecklistService': {
    betaRegressionChecklistService: {
      getPlayerModel(state) {
        calls.push(['regression', state]);
        return { compactLine: 'regression-line' };
      },
    },
  },
  '../services/homePlayerBetaPolishService': {
    homePlayerBetaPolishService: {
      getPlayerBarModel(state) {
        calls.push(['beta', state]);
        return {
          compactLine: 'beta-line',
          emptyTitle: 'empty-title',
          emptyHint: 'empty-hint',
          chips: [{ id: 'chip', label: 'label', value: 'value', tone: 'muted' }],
        };
      },
    },
  },
  '../services/playerBarDailyCleanupService': {
    playerBarDailyCleanupService: {
      getPlayerBarModel(state) {
        calls.push(['daily', state]);
        return {
          compactStatus: 'daily-status',
          visibleBadges: ['badge-a', 'badge-b'],
          hiddenMaintenanceNote: 'daily-note',
        };
      },
    },
  },
  '../services/playerUiBugfixService': {
    playerUiBugfixService: {
      getModel() {
        calls.push(['compatibility']);
        return { hiddenMaintenanceNote: 'compatibility-note' };
      },
    },
  },
  './playerBarMath': {
    formatPlayerTime(value) {
      return `time:${value}`;
    },
    getPlayerVolumeMetrics(volume, isMuted) {
      calls.push(['volume', volume, isMuted]);
      return {
        visibleVolume: isMuted ? 0 : volume,
        visibleVolumePercent: isMuted ? 0 : volume * 100,
      };
    },
  },
};

const runtimeModule = { exports: {} };
const context = vm.createContext({
  module: runtimeModule,
  exports: runtimeModule.exports,
  console,
  require(id) {
    assert.ok(id in requireMap, `unexpected runtime import: ${id}`);
    return requireMap[id];
  },
});
new vm.Script(model.output, { filename: modelPath }).runInContext(context);
const { createPlayerBarPresentationModel } = runtimeModule.exports;

const playerState = {
  currentTrack: { id: 'track-1' },
  isPlaying: true,
  progress: 15,
  volume: 0.6,
  queue: [{ id: 'track-1' }, { id: 'track-2' }],
  currentIndex: 0,
  isMuted: false,
  loopMode: 'one',
  playbackMode: 'mpv',
  playbackError: null,
  playbackNotice: 'notice',
};

const presentation = createPlayerBarPresentationModel({
  playerState,
  displayProgress: 65,
  duration: 125,
});

assert.equal(presentation.hasTrack, true);
assert.equal(presentation.trackSummary.isPlaying, true);
assert.equal(presentation.trackSummary.playbackNotice, 'notice');
assert.equal(presentation.trackSummary.compactStatus, 'daily-status');
assert.equal(presentation.trackSummary.visibleBadges[0], 'badge-a');
assert.equal(presentation.trackSummary.hiddenMaintenanceNote, 'daily-note');
assert.equal(presentation.trackSummary.completionModeDescription, 'completion-description');
assert.equal(presentation.trackSummary.statusBadges[0].label, 'status');
assert.equal(presentation.trackSummary.visualContextLine, 'visual-context');
assert.equal(presentation.trackSummary.regressionLine, 'regression-line');
assert.equal(presentation.trackSummary.compactLine, 'beta-line');
assert.equal(presentation.emptyState.title, 'empty-title');
assert.equal(presentation.emptyState.hint, 'empty-hint');
assert.equal(presentation.emptyState.regressionLine, 'regression-line');
assert.equal(presentation.transport.hasTrack, true);
assert.equal(presentation.transport.loopMode, 'one');
assert.equal(presentation.transport.playbackMode, 'mpv');
assert.equal(presentation.transport.queueCount, 2);
assert.equal(presentation.transport.currentTimeLabel, 'time:65');
assert.equal(presentation.transport.durationLabel, 'time:125');
assert.equal(presentation.auxiliary.hasTrack, true);
assert.equal(presentation.auxiliary.completionLabel, 'completion-label');
assert.equal(presentation.auxiliary.completionHint, 'completion-hint');
assert.equal(presentation.auxiliary.visibleVolume, 0.6);
assert.equal(presentation.auxiliary.visibleVolumePercent, 60);
assert.equal(presentation.compatibility.betaChips[0].id, 'chip');
assert.equal(presentation.compatibility.hiddenMaintenanceNote, 'compatibility-note');
assert.equal(calls.filter(([name]) => name === 'experience').length, 1);
assert.equal(calls.filter(([name]) => name === 'listening').length, 1);
assert.equal(calls.filter(([name]) => name === 'visual').length, 1);
assert.equal(calls.filter(([name]) => name === 'regression').length, 1);
assert.equal(calls.filter(([name]) => name === 'beta').length, 1);
assert.equal(calls.filter(([name]) => name === 'daily').length, 1);
assert.equal(calls.filter(([name]) => name === 'compatibility').length, 1);

const emptyPresentation = createPlayerBarPresentationModel({
  playerState: { ...playerState, currentTrack: null, isMuted: true },
  displayProgress: 0,
  duration: 0,
});
assert.equal(emptyPresentation.hasTrack, false);
assert.equal(emptyPresentation.transport.hasTrack, false);
assert.equal(emptyPresentation.auxiliary.hasTrack, false);
assert.equal(emptyPresentation.auxiliary.visibleVolume, 0);
assert.equal(emptyPresentation.auxiliary.visibleVolumePercent, 0);

for (const marker of [
  'export function createPlayerBarPresentationModel',
  'playerExperienceService.getSummary(playerState)',
  'listeningExperiencePolishService.getPlayerBarModel(playerState)',
  'playerVisualPolishService.getPlayerBarModel(playerState)',
  'betaRegressionChecklistService.getPlayerModel(playerState)',
  'homePlayerBetaPolishService.getPlayerBarModel(playerState)',
  'playerBarDailyCleanupService.getPlayerBarModel(playerState)',
  'playerUiBugfixService.getModel()',
  'getPlayerVolumeMetrics(playerState.volume, playerState.isMuted)',
  'trackSummary:',
  'emptyState:',
  'transport:',
  'auxiliary:',
  'compatibility:',
]) {
  assert.ok(model.source.includes(marker), `presentation model contract missing: ${marker}`);
}

for (const forbidden of [
  "from 'react'",
  'useState(',
  'useEffect(',
  'useMemo(',
  'localStorage',
  'window.yangKura',
  'document.',
  'setTimeout(',
  'togglePlay(',
  'onSeek(',
]) {
  assert.ok(!model.source.includes(forbidden), `presentation model crossed behavior boundary: ${forbidden}`);
}

const playerBarPath = 'src/components/PlayerBar.tsx';
const playerBar = transpile(playerBarPath, true).source;
for (const marker of [
  "import { createPlayerBarPresentationModel } from '../player/playerBarPresentationModel';",
  'const presentation = createPlayerBarPresentationModel({',
  'hasTrack={presentation.hasTrack}',
  '{...presentation.trackSummary}',
  '<PlayerEmptyState {...presentation.emptyState} />',
  '{...presentation.transport}',
  '{...presentation.auxiliary}',
  '<PlayerCompatibilityMarkers {...presentation.compatibility} />',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar presentation integration missing: ${marker}`);
}

for (const forbidden of [
  "from '../services/playerExperienceService'",
  "from '../services/listeningExperiencePolishService'",
  "from '../services/playerVisualPolishService'",
  "from '../services/betaRegressionChecklistService'",
  "from '../services/homePlayerBetaPolishService'",
  "from '../services/playerBarDailyCleanupService'",
  "from '../services/playerUiBugfixService'",
  'const playerSummary =',
  'const mvp49Player =',
  'const mvp50PlayerVisual =',
  'const mvp54PlayerRegression =',
  'const mvp59PlayerBeta =',
  'const mvp74PlayerBar =',
  'const mvp79PlayerUi =',
  'getPlayerVolumeMetrics(',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns presentation aggregation: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U22（已完成）', 'U23', '展示模型聚合', 'PlayerBar 结构收口', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U23 fact: ${marker}`);
}

console.log('U23 player bar presentation model verifier PASS');
