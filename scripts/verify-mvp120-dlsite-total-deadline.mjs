import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (pkg.version !== '0.158.0-mvp120') throw new Error(`unexpected version: ${pkg.version}`);
if (!pkg.scripts?.['verify:all']?.includes('verify:mvp120-dlsite-total-deadline')) throw new Error('verify:all missing MVP120');

for (const [file, markers] of [
  ['electron/providerRequestDeadline.ts', ['createProviderRequestDeadline', 'getProviderRequestRemainingMs', 'deadlineAtMs']],
  ['electron/dlsiteMetadataProvider.ts', ['single-query-total-deadline', 'const requestDeadline = createProviderRequestDeadline(timeoutMs)', 'const remainingMs = getProviderRequestRemainingMs(requestDeadline)', 'AbortSignal.timeout(Math.max(1, remainingMs))', '单次查询总耗时超过']],
  ['docs/DLSITE_TOTAL_DEADLINE_MVP120.md', ['总截止时间', '12 秒', '6 个候选 URL']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const providerText = fs.readFileSync('electron/dlsiteMetadataProvider.ts', 'utf8');
if (providerText.includes('AbortSignal.timeout(timeoutMs)')) throw new Error('per-URL full timeout remains');
const deadlineCreation = providerText.indexOf('const requestDeadline = createProviderRequestDeadline(timeoutMs)');
const loop = providerText.indexOf('for (const urlText of buildUrls(requestedRjId))');
if (deadlineCreation < 0 || loop < 0 || deadlineCreation > loop) throw new Error('deadline must be created once before candidate URL loop');

const compiled = path.resolve('dist-electron/providerRequestDeadline.js');
if (!fs.existsSync(compiled)) throw new Error('compiled deadline helper missing; run build:electron first');
const { createProviderRequestDeadline, getProviderRequestRemainingMs } = await import(`${pathToFileURL(compiled).href}?mvp120=${Date.now()}`);
const deadline = createProviderRequestDeadline(12_000, 1_000);
if (deadline.deadlineAtMs !== 13_000 || deadline.totalTimeoutMs !== 12_000) throw new Error('deadline creation failed');
if (getProviderRequestRemainingMs(deadline, 5_000) !== 8_000) throw new Error('remaining budget failed');
if (getProviderRequestRemainingMs(deadline, 13_001) !== 0) throw new Error('expired budget must clamp to zero');

console.log('MVP120 DLsite total deadline verification PASS');
