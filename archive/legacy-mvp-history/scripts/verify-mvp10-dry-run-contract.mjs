#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures = [];
const read = (file) => readFileSync(file, 'utf8');
const requireFile = (file) => { if (!existsSync(file)) failures.push(`missing file: ${file}`); };

for (const file of [
  'src/services/plannedDryRunScannerResultContractService.ts',
  'src/services/index.ts',
  'src/components/DiagnosticsPage.tsx',
  'docs/PLANNED_DRY_RUN_SCANNER_RESULT_CONTRACT_MVP10.md',
  'scripts/verify-mvp10-dry-run-contract.mjs',
]) requireFile(file);

const service = read('src/services/plannedDryRunScannerResultContractService.ts');
const index = read('src/services/index.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const docs = read('docs/PLANNED_DRY_RUN_SCANNER_RESULT_CONTRACT_MVP10.md');
const pkg = read('package.json');

for (const token of [
  'PlannedDryRunScannerResultContract',
  'ScannerDryRunRequestContract',
  'ScannerDryRunDiscoveredEntryContract',
  'ScannerDryRunWarningContract',
  'ScannerDryRunBlockedReasonContract',
  'ScannerDryRunPreviewSummaryContract',
  'ScannerSafetyLimitsContract',
  'plannedDryRunScannerResultContractService',
  'previewOnly: true',
  'canWriteIndex: false',
  'rootPathToken',
  '<user-selected-root>',
  'maxEntries: 5000',
  'maxDepth: 8',
  'followSymlinks: false',
  'allowFileMutation: false',
  'allowIndexWrite: false',
  'discoveredEntries',
  'blockedReasons',
  'writeTarget: \'never during dry-run\'',
]) {
  if (!service.includes(token)) failures.push(`dry-run contract service missing token: ${token}`);
}

for (const token of [
  'plannedDryRunScannerResultContractService',
  'PlannedDryRunScannerResultContract',
  'ScannerDryRunRequestContract',
]) {
  if (!index.includes(token)) failures.push(`services index missing export token: ${token}`);
}

for (const token of [
  'plannedDryRunScannerResultContractService.getContract',
  'MVP-10 Planned Dry-Run Scanner Result Contract',
  'ScannerRequest dry-run contract',
  'preview summary / output shape',
  'discoveredEntries contract sample',
  'blockedReasons',
  'safety checklist',
  'canWriteIndex',
]) {
  if (!diagnostics.includes(token)) failures.push(`DiagnosticsPage missing MVP-10 UI token: ${token}`);
}

for (const token of [
  'MVP-10 Planned Dry-Run Scanner Result Contract',
  'ScannerDryRunRequestContract',
  'ScannerDryRunPreviewSummaryContract',
  'ScannerDryRunDiscoveredEntryContract',
  'canWriteIndex = false',
  'never during dry-run',
]) {
  if (!docs.includes(token)) failures.push(`MVP-10 docs missing token: ${token}`);
}

for (const token of ['verify:mvp10-dry-run-contract']) {
  if (!pkg.includes(token)) failures.push(`package.json missing token: ${token}`);
}
if (!pkg.includes('0.64.0-mvp26') && !pkg.includes('0.49.0-mvp10') && !pkg.includes('0.50.0-mvp11') && !pkg.includes('0.51.0-mvp12') && !pkg.includes('0.52.0-mvp13') && !pkg.includes('0.53.0-mvp14') && !pkg.includes('0.54.0-mvp15') && !pkg.includes('0.55.0-mvp16') && !pkg.includes('0.56.0-mvp17') && !pkg.includes('0.57.0-mvp18') && !pkg.includes('0.58.0-mvp19') && !pkg.includes('0.60.0-mvp22') && !pkg.includes('0.61.0-mvp23') && !packageJson.includes('0.67.0-mvp29') && !packageJson.includes('0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31')) failures.push('package.json missing supported MVP-10+ version token');

for (const [file, tokens] of [
  ['src/services/plannedDryRunScannerResultContractService.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],
]) {
  const text = read(file);
  for (const token of tokens) {
    if (text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`);
  }
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('[Yang-Kura] MVP-10 planned dry-run scanner result contract static verification passed.');
