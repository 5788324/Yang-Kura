#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
const failures = [];
const read = (file) => readFileSync(file, 'utf8');
const requireFile = (file) => { if (!existsSync(file)) failures.push(`missing file: ${file}`); };

for (const file of [
  'src/services/plannedScannerIpcStubContractService.ts',
  'src/services/plannedDryRunScannerResultContractService.ts',
  'src/services/index.ts',
  'src/components/DiagnosticsPage.tsx',
  'docs/DRY_RUN_IPC_STUB_CONTRACT_MVP11.md',
  'scripts/verify-mvp11-dry-run-ipc-stub.mjs',
]) requireFile(file);

const service = read('src/services/plannedScannerIpcStubContractService.ts');
const index = read('src/services/index.ts');
const diagnostics = read('src/components/DiagnosticsPage.tsx');
const docs = read('docs/DRY_RUN_IPC_STUB_CONTRACT_MVP11.md');
const pkg = read('package.json');

for (const token of [
  'PlannedScannerIpcStubContract',
  'ScannerIpcChannelName',
  'ScannerIpcRequestEnvelopeContract',
  'ScannerIpcResponseEnvelopeContract',
  'ScannerIpcErrorEnvelopeContract',
  'plannedScannerIpcStubContractService',
  'MVP-11 Dry-Run IPC Stub Contract',
  'planned-stub-only',
  'yang-kura:scanner:dry-run:request',
  'yang-kura:scanner:dry-run:response',
  'yang-kura:scanner:dry-run:error',
  'ScannerDryRunRequestContract',
  'PlannedDryRunScannerResultContract',
  'rendererOnly: true',
  'requiresUserConfirmation: true',
  'indexWriteAllowed: false',
  'responseSource: \'planned-stub\'',
  'scanner-ipc-not-implemented',
]) {
  if (!service.includes(token)) failures.push(`IPC stub service missing token: ${token}`);
}

for (const token of [
  'plannedScannerIpcStubContractService',
  'PlannedScannerIpcStubContract',
  'ScannerIpcRequestEnvelopeContract',
  'ScannerIpcResponseEnvelopeContract',
  'ScannerIpcErrorEnvelopeContract',
]) {
  if (!index.includes(token)) failures.push(`services index missing token: ${token}`);
}

for (const token of [
  'plannedScannerIpcStubContractService.getContract',
  'MVP-11 Dry-Run IPC Stub Contract',
  'IPC channel names',
  'request / response envelope',
  'dry-run stub flow',
  'indexWriteAllowed',
  'forbidden actions',
]) {
  if (!diagnostics.includes(token)) failures.push(`DiagnosticsPage missing MVP-11 UI token: ${token}`);
}

for (const token of [
  'MVP-11 Dry-Run IPC Stub Contract',
  'yang-kura:scanner:dry-run:request',
  'ScannerIpcRequestEnvelopeContract',
  'ScannerIpcResponseEnvelopeContract',
  'ScannerIpcErrorEnvelopeContract',
  'indexWriteAllowed: false',
  'planned-stub',
]) {
  if (!docs.includes(token)) failures.push(`MVP-11 docs missing token: ${token}`);
}

if (!pkg.includes('verify:mvp11-dry-run-ipc-stub')) failures.push('package.json missing token: verify:mvp11-dry-run-ipc-stub');
if (!pkg.includes('0.64.0-mvp26') && !pkg.includes('0.50.0-mvp11') && !pkg.includes('0.51.0-mvp12') && !pkg.includes('0.52.0-mvp13') && !pkg.includes('0.53.0-mvp14') && !pkg.includes('0.54.0-mvp15') && !pkg.includes('0.55.0-mvp16') && !pkg.includes('0.56.0-mvp17') && !pkg.includes('0.57.0-mvp18') && !pkg.includes('0.58.0-mvp19') && !pkg.includes('0.60.0-mvp22') && !pkg.includes('0.61.0-mvp23') && !packageJson.includes('0.67.0-mvp29') && !packageJson.includes('0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31')) failures.push('package.json missing supported MVP-11+ version token');

for (const [file, tokens] of [
  ['src/services/plannedScannerIpcStubContractService.ts', ['node:fs','fs.','from \'electron\'','require(\'electron\')','sqlite3','child_process','localStorage','new Audio','writeFile','unlink','rename','readdir','statSync']],
]) {
  const text = read(file);
  for (const token of tokens) {
    if (text.includes(token)) failures.push(`${file} contains forbidden token: ${token}`);
  }
}

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('[Yang-Kura] MVP-11 dry-run IPC stub contract static verification passed.');
