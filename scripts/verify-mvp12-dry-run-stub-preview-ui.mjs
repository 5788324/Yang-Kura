#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures = [];
const read = (file) => readFileSync(file, 'utf8');
const requireFile = (file) => { if (!existsSync(file)) failures.push(`missing file: ${file}`); };

for (const file of [
  'src/services/plannedDryRunStubPreviewUiService.ts',
  'src/services/plannedScannerIpcStubContractService.ts',
  'src/services/index.ts',
  'src/components/DiagnosticsPage.tsx',
  'docs/DRY_RUN_STUB_RESPONSE_PREVIEW_UI_MVP12.md',
  'scripts/verify-mvp12-dry-run-stub-preview-ui.mjs',
]) requireFile(file);

const service = read('src/services/plannedDryRunStubPreviewUiService.ts');
const index = read('src/services/index.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const docs = read('docs/DRY_RUN_STUB_RESPONSE_PREVIEW_UI_MVP12.md');
const pkg = read('package.json');

for (const token of [
  'PlannedDryRunStubPreviewUiModel',
  'DryRunRequestEnvelopePreview',
  'DryRunResponsePayloadPreview',
  'DryRunErrorStatePreview',
  'DryRunResultPreviewCard',
  'DryRunWarningPreviewCard',
  'plannedDryRunStubPreviewUiService',
  'MVP-12 Dry-Run Stub Response Preview UI',
  'request envelope preview',
  'response payload preview',
  'error state preview',
  'dry-run result cards',
  'still no real Electron IPC',
  'plannedScannerIpcStubContractService.getContract',
  'indexWriteAllowed',
  'no real Electron IPC call',
]) {
  if (!service.includes(token)) failures.push(`MVP-12 service missing token: ${token}`);
}

for (const token of [
  'plannedDryRunStubPreviewUiService',
  'PlannedDryRunStubPreviewUiModel',
  'DryRunRequestEnvelopePreview',
  'DryRunResponsePayloadPreview',
  'DryRunErrorStatePreview',
  'DryRunResultPreviewCard',
]) {
  if (!index.includes(token)) failures.push(`services index missing token: ${token}`);
}

for (const token of [
  'plannedDryRunStubPreviewUiService.getPreview',
  'MVP-12 Dry-Run Stub Response Preview UI',
  'request envelope preview',
  'response payload preview',
  'error state preview',
  'dry-run result cards',
  'warning preview cards',
  'still no real Electron IPC',
]) {
  if (!diagnostics.includes(token)) failures.push(`DiagnosticsPage missing MVP-12 UI token: ${token}`);
}

for (const token of [
  'MVP-12 Dry-Run Stub Response Preview UI',
  'plannedDryRunStubPreviewUiService',
  'request envelope preview',
  'response payload preview',
  'error state preview',
  'dry-run result cards',
  'no real Electron IPC call',
]) {
  if (!docs.includes(token)) failures.push(`MVP-12 docs missing token: ${token}`);
}

if (!pkg.includes('verify:mvp12-dry-run-stub-preview-ui')) failures.push('package.json missing token: verify:mvp12-dry-run-stub-preview-ui');
if (!pkg.includes('0.64.0-mvp26') && !pkg.includes('0.52.0-mvp13') && !pkg.includes('0.53.0-mvp14') && !pkg.includes('0.54.0-mvp15') && !pkg.includes('0.55.0-mvp16') && !pkg.includes('0.56.0-mvp17') && !pkg.includes('0.57.0-mvp18') && !pkg.includes('0.58.0-mvp19') && !pkg.includes('0.60.0-mvp22') && !pkg.includes('0.61.0-mvp23') && !packageJson.includes('0.67.0-mvp29') && !packageJson.includes('0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31')) failures.push('package.json missing supported MVP-12+ version token');

for (const [file, tokens] of [
  ['src/services/plannedDryRunStubPreviewUiService.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],
]) {
  const text = read(file);
  for (const token of tokens) {
    if (text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`);
  }
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('[Yang-Kura] MVP-12 dry-run stub response preview UI static verification passed.');
