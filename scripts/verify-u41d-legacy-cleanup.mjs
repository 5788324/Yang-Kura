#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const exists = (file) => fs.existsSync(file);

execFileSync(process.execPath, ['scripts/audit-u41-product-surface.mjs'], { stdio: 'inherit' });
const audit = JSON.parse(read('artifacts/u41-product-audit/product-surface.json'));
const pkg = JSON.parse(read('package.json'));
const pageTypes = read('src/types.ts');
const navigation = read('src/app/navigation.ts');
const router = read('src/app/AppRouter.tsx');
const sidebar = read('src/components/Sidebar.tsx');
const importer = read('src/components/ImporterPage.tsx');
const css = read('src/index.css');
const stable = read('scripts/run-stable-regression.mjs');

assert.deepEqual(audit.productionSurface.routeIds, [
  'dashboard', 'asmr-lib', 'music-lib', 'playlists', 'importer', 'settings', 'diagnostics',
]);
assert.equal(audit.productionSurface.dailyRouteCount, 6);
assert.equal(audit.productionSurface.maintenanceRouteCount, 1);
assert.equal(audit.codeGraph.unreachableImplementationCount, 0);
assert.deepEqual(audit.codeGraph.unreachableFiles.sort(), [
  'src/types/electron-api.d.ts',
  'src/types/electron-runtime-shim.d.ts',
]);
assert.equal(audit.riskMarkers.some((item) => item.present), false);
assert.equal(audit.repositoryScale.workflowCount, 9);
assert.ok(audit.repositoryScale.verifierScriptCount <= 60);

for (const source of [pageTypes, navigation, router, sidebar]) {
  assert.doesNotMatch(source, /DownloaderPage|nav-downloader|['"]downloader['"]|\bdownloader\s*:/);
}
assert.equal(exists('src/components/DownloaderPage.tsx'), false);
assert.equal(exists('src/components/DiagnosticsPage.tsx'), false);
assert.equal(exists('src/components/SettingsPage.tsx'), false);
assert.equal(exists('src/components/Dashboard.tsx'), false);
assert.equal(exists('src/components/AsmrLibrary.tsx'), false);
assert.equal(exists('src/components/AsmrDetail.tsx'), false);

for (const file of [
  'archive/u41d-legacy-code/src/components/DownloaderPage.tsx',
  'archive/u41d-legacy-code/src/components/DiagnosticsPage.tsx',
  'archive/u41d-legacy-code/src/components/SettingsPage.tsx',
  'archive/u41d-legacy-code/src/services/importerFinalRegressionChecklistService.ts',
  'archive/u41d-workflows/beta3-personal-release.yml',
  'archive/u41d-verifiers/verify-mvp112-ui-audit-bugfix.mjs',
]) assert.equal(exists(file), true, `missing archive evidence: ${file}`);

assert.match(importer, /id="u41b-importer-primary-flow"/);
assert.doesNotMatch(importer, /mvp112-importer-primary-flow/);
assert.doesNotMatch(css, /mvp112-importer-primary-flow/);
assert.match(stable, /verify:u41d-legacy-cleanup/);
assert.equal(pkg.scripts?.['verify:u41d-legacy-cleanup'], 'node scripts/verify-u41d-legacy-cleanup.mjs');
assert.equal(Object.keys(pkg.scripts ?? {}).some((key) => key.startsWith('verify:mvp')), false);

const currentWorkflows = fs.readdirSync('.github/workflows').filter((file) => file.endsWith('.yml')).sort();
assert.deepEqual(currentWorkflows, [
  'architecture-guardrails.yml',
  'branch-validation.yml',
  'docs-validation.yml',
  'player-fast-validation.yml',
  'u32-release-candidate.yml',
  'u40b-full-product-acceptance.yml',
  'u41b-daily-user-entry.yml',
  'u41c-runtime-patch.yml',
  'ui-fast-validation.yml',
]);

const archivedImplementationCount = fs.readdirSync('archive/u41d-legacy-code/src/services').length
  + fs.readdirSync('archive/u41d-legacy-code/src/components').length;
assert.ok(archivedImplementationCount >= 90);

console.log('[U41-D legacy cleanup] PASS');
console.log(`routes=${audit.productionSurface.routeCount}; reachable=${audit.codeGraph.reachableFileCount}/${audit.codeGraph.codeFileCount}; workflows=${audit.repositoryScale.workflowCount}; verifiers=${audit.repositoryScale.verifierScriptCount}`);
