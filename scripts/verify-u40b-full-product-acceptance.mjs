#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const artifactDir = path.join(cwd, 'artifacts', 'u40b-full-product-acceptance');
fs.mkdirSync(artifactDir, { recursive: true });

const readJson = (relativePath) => {
  const filePath = path.join(cwd, relativePath);
  if (!fs.existsSync(filePath)) throw new Error(`Missing U40-B evidence: ${relativePath}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};
const pass = (value) => String(value ?? '').toLowerCase() === 'pass';

const suites = [
  { id:'u28', name:'资源库、Index、重启授权与真实媒体读取', report:'artifacts/u28-electron-e2e/report.json' },
  { id:'u29', name:'播放器、Seek、队列、字幕格式与续播', report:'artifacts/u29-electron-e2e/report.json' },
  { id:'u30', name:'主题、DPI、键盘、焦点和减少动画', report:'artifacts/u30-ui-matrix/report.json' },
  { id:'u31', name:'导入器 copy/move、冲突与回滚', report:'artifacts/u31-importer-transactions/report.json' },
  { id:'u32', name:'日常页面与详情页视觉审查', report:'artifacts/u32-ui-audit/report.json' },
  { id:'u40b', name:'全产品可见控件、表单、弹层、窗口状态和 1 秒音频旅程', report:'artifacts/u40b-full-product-acceptance/interaction-coverage.json' },
];

const results = suites.map((suite) => {
  const evidence = readJson(suite.report);
  return { ...suite, status: pass(evidence.status) ? 'PASS' : 'FAIL', evidence };
});
const failures = results.filter((item) => item.status !== 'PASS');
const journey = results.find((item) => item.id === 'u40b').evidence;

assert.equal(failures.length, 0, `U40-B failed suites: ${failures.map((item)=>item.id).join(', ')}`);
assert.equal(journey.coverageSummary?.uncovered, 0, 'U40-B visible control coverage must have zero uncovered controls');
assert.equal(journey.runtimeErrors?.length ?? 0, 0, 'U40-B runtime errors must be zero');
assert.ok((journey.fixture?.audioFiles?.length ?? 0) >= 4, 'U40-B must generate several one-second audio files');
assert.ok((journey.pages?.length ?? 0) >= 6, 'U40-B must visit all daily pages');

const featureInventory = {
  generatedAt: new Date().toISOString(),
  head: process.env.GITHUB_SHA ?? null,
  scope: 'all-known-user-visible-product-surfaces-excluding-physical-hardware',
  functionalDomains: [
    'application shell and window states',
    'dashboard and navigation',
    'ASMR library and RJ detail',
    'music tracks, albums, artists and folders',
    'playlists',
    'importer UI and transactional file operations',
    'settings and three themes',
    'AI maintenance entry',
    'player controls, queue and full lyrics',
    'LRC/SRT/VTT/ASS and no-subtitle states',
    'Local JSON Index read/write/broken/restart states',
    'keyboard, focus, Escape and reduced motion',
  ],
  suites: results.map(({ evidence, ...item }) => ({ ...item, evidenceStatus: evidence.status })),
  visibleControlCoverage: journey.coverageSummary,
  physicalEnvironmentExcluded: [
    'audible sound quality through real speakers/headphones',
    'sound-card and driver differences',
    'subjective appearance on a physical monitor',
    'third-party player application UI after external open',
  ],
};

const finalSummary = {
  status: 'PASS',
  generatedAt: new Date().toISOString(),
  head: process.env.GITHUB_SHA ?? null,
  suites: results.map(({ evidence, ...item }) => ({ ...item, evidenceStatus: evidence.status })),
  totals: {
    suites: results.length,
    suitesPassed: results.length,
    oneSecondAudioFiles: journey.fixture.audioFiles.length,
    subtitleFiles: journey.fixture.subtitleFiles.length,
    pageRecords: journey.pages.length,
    visibleControlStates: journey.coverageSummary.visibleControlStates,
    interactionRecords: journey.coverageSummary.interactions,
    userJourneys: journey.coverageSummary.userJourneys,
    screenshots: journey.coverageSummary.screenshots,
    uncoveredControls: journey.coverageSummary.uncovered,
    runtimeErrors: journey.runtimeErrors.length,
  },
  conclusion: 'All known automated user journeys and visible control states passed. Physical hardware and third-party application UI were intentionally excluded by user request.',
};

fs.writeFileSync(path.join(artifactDir, 'feature-inventory.json'), JSON.stringify(featureInventory, null, 2), 'utf8');
fs.writeFileSync(path.join(artifactDir, 'final-summary.json'), JSON.stringify(finalSummary, null, 2), 'utf8');
fs.writeFileSync(path.join(artifactDir, 'failures.json'), JSON.stringify([], null, 2), 'utf8');

console.log(JSON.stringify(finalSummary, null, 2));
console.log('U40-B aggregate acceptance PASS');
