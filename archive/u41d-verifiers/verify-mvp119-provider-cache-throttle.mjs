import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.157.0-mvp119', '0.158.0-mvp120', '0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(packageJson.version)) throw new Error(`unexpected version: ${packageJson.version}`);

for (const [file, markers] of [
  ['electron/metadataProviderCache.ts', ['MetadataProviderCache', 'getThrottleState', 'clearAll']],
  ['electron/dlsiteMetadataProvider.ts', ['CACHE_TTL_MS = 10 * 60 * 1000', 'SAME_RJ_THROTTLE_MS = 5_000', "cacheMode === 'force-refresh'", 'mvp119-dlsite-throttled', 'clearDlsiteMetadataCache']],
  ['electron/ipc/contracts.ts', ["asmrSingleRjCacheClear: 'yang-kura:metadata:asmr:single-rj-cache-clear'"]],
  ['electron/main.ts', ["registerMetadataHandler('asmrSingleRjCacheClear'"]],
  ['electron/preload.ts', ['clearAsmrMetadataProviderCache', 'IPC_CHANNELS.metadata.asmrSingleRjPreview', 'IPC_CHANNELS.metadata.asmrSingleRjCacheClear']],
  ['electron/preload/contracts.ts', ["cacheMode?: 'prefer-cache' | 'force-refresh'", 'AsmrMetadataProviderCacheClearRequest']],
  ['src/types/electron-api.d.ts', ['YangKuraAsmrMetadataProviderCacheInfo', 'clearAsmrMetadataProviderCache']],
  ['src/components/AsmrMetadataProviderPreview.tsx', ['查询（优先缓存）', '重新查询', '清除缓存', '最近查询：', '标准 JSON']],
  ['docs/PROVIDER_CACHE_THROTTLE_MVP119.md', ['10 分钟', '5 秒', '不自动保存']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const provider = fs.readFileSync('electron/dlsiteMetadataProvider.ts', 'utf8').toLowerCase();
for (const forbidden of ['fs.writefile', 'fs.unlink', 'fs.rename', 'sqlite', 'absolutepathreturned: true', 'fileurlreturned: true']) {
  if (provider.includes(forbidden)) throw new Error(`provider contains forbidden marker: ${forbidden}`);
}

const cachePath = path.resolve('dist-electron/metadataProviderCache.js');
if (!fs.existsSync(cachePath)) throw new Error('compiled metadataProviderCache missing; run build:electron first');
const { MetadataProviderCache } = await import(`${pathToFileURL(cachePath).href}?mvp119=${Date.now()}`);
const cache = new MetadataProviderCache(600_000, 5_000);
const base = Date.parse('2026-07-11T00:00:00.000Z');
if (cache.read('RJ00123456', base).hit) throw new Error('new cache should miss');
const write = cache.write('RJ00123456', { title: 'fixture' }, base);
if (!write.hit || cache.read('RJ00123456', base + 1_000).value.title !== 'fixture') throw new Error('cache hit failed');
if (cache.read('RJ00123456', base + 600_001).hit) throw new Error('expired cache should miss');
cache.recordNetworkRequest('RJ00123456', base);
const throttled = cache.getThrottleState('RJ00123456', base + 1_000);
if (throttled.allowed || throttled.retryAfterMs !== 4_000) throw new Error('same-RJ throttle failed');
if (!cache.getThrottleState('RJ00123456', base + 5_000).allowed) throw new Error('throttle should expire');
cache.write('RJ00123456', { title: 'clear' }, base + 6_000);
if (!cache.clear('RJ00123456') || cache.read('RJ00123456', base + 6_001).hit) throw new Error('cache clear failed');

console.log('MVP119 provider cache/throttle verification PASS');
