import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.158.0-mvp120', '0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp120-dlsite-total-deadline')) throw new Error('verify:stable missing MVP120');

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
