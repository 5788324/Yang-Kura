import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const contractPath = 'src/theme/themeContract.ts';
const contractSource = fs.readFileSync(contractPath, 'utf8');
const settingsService = fs.readFileSync('src/services/settingsPathPrivacyService.ts', 'utf8');
const settingsPage = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const themeCss = fs.readFileSync('src/index.css', 'utf8');
const projectState = fs.readFileSync('PROJECT_STATE.md', 'utf8');
const roadmap = fs.readFileSync('PROJECT_ROADMAP.md', 'utf8');

const compiled = ts.transpileModule(contractSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    strict: true,
  },
  fileName: contractPath,
});

const runtimeModule = { exports: {} };
const context = vm.createContext({
  module: runtimeModule,
  exports: runtimeModule.exports,
  console,
});
new vm.Script(compiled.outputText, { filename: contractPath }).runInContext(context);

const {
  SUPPORTED_THEME_IDS,
  DEFAULT_THEME_ID,
  isSupportedTheme,
  normalizeThemeType,
} = runtimeModule.exports;

assert.deepEqual(
  [...SUPPORTED_THEME_IDS],
  ['dark', 'acrylic-mist', 'ocean-drops'],
  'supported theme order changed',
);
assert.equal(DEFAULT_THEME_ID, 'acrylic-mist');
for (const themeId of SUPPORTED_THEME_IDS) {
  assert.equal(isSupportedTheme(themeId), true, `${themeId} should be supported`);
  assert.equal(normalizeThemeType(themeId), themeId, `${themeId} should be preserved`);
}
for (const unsupported of ['light', 'forest-cabin', 'unknown', '', null, undefined]) {
  assert.equal(isSupportedTheme(unsupported), false, `${String(unsupported)} should be rejected`);
  assert.equal(normalizeThemeType(unsupported), DEFAULT_THEME_ID, `${String(unsupported)} should migrate to the default theme`);
}

for (const marker of [
  'import { normalizeThemeType } from "../theme/themeContract";',
  'currentTheme: normalizeThemeType(settings.currentTheme)',
]) {
  assert.ok(settingsService.includes(marker), `settings sanitizer missing theme migration marker: ${marker}`);
}

for (const themeId of SUPPORTED_THEME_IDS) {
  const marker = `id: "${themeId}"`;
  assert.equal((settingsPage.match(new RegExp(marker, 'g')) ?? []).length, 1, `SettingsPage theme option drifted: ${themeId}`);
}
for (const legacyMarker of ['id: "light"', 'id: "forest-cabin"']) {
  assert.ok(!settingsPage.includes(legacyMarker), `SettingsPage exposes legacy theme marker: ${legacyMarker}`);
}

for (const selector of ['.theme-dark {', '.theme-acrylic-mist {', '.theme-ocean-drops {']) {
  assert.equal((themeCss.match(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length, 1, `${selector} must exist exactly once`);
}
for (const legacySelector of ['.theme-light', '.theme-forest-cabin']) {
  assert.ok(!themeCss.includes(legacySelector), `unreachable legacy theme CSS remains: ${legacySelector}`);
}

const progressDocuments = `${projectState}\n${roadmap}`;
for (const marker of ['U12', 'U13', '三主题合同', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U13 fact: ${marker}`);
}

console.log('U13 supported theme contract verifier PASS');
