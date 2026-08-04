import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.156.0-mvp118', '0.157.0-mvp119', '0.158.0-mvp120', '0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(packageJson.version)) throw new Error(`unexpected version: ${packageJson.version}`);
for (const [file, marker] of [
  ['electron/dlsiteMetadataParser.ts', 'parseDlsiteProductPage'],
  ['electron/dlsiteMetadataProvider.ts', 'official-dlsite-domain-only'],
  ['electron/dlsiteMetadataProvider.ts', 'AbortSignal.timeout'],
  ['electron/ipc/contracts.ts', "asmrSingleRjPreview: 'yang-kura:metadata:asmr:single-rj-preview'"],
  ['electron/main.ts', "registerMetadataHandler('asmrSingleRjPreview'"],
  ['electron/preload.ts', 'requestAsmrMetadataProvider'],
  ['src/types/electron-api.d.ts', 'YangKuraAsmrMetadataProviderResult'],
  ['src/components/AsmrMetadataProviderPreview.tsx', '查询（优先缓存）'],
  ['docs/DLSITE_SINGLE_RJ_PROVIDER_MVP118.md', '不自动保存'],
]) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}
const provider = fs.readFileSync('electron/dlsiteMetadataProvider.ts', 'utf8');
for (const forbidden of ['fs.writeFile', 'fs.unlink', 'fs.rename', 'sqlite', 'absolutePathReturned: true', 'fileUrlReturned: true']) {
  if (provider.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`provider contains forbidden marker: ${forbidden}`);
}
if (!provider.includes("new Set(['www.dlsite.com', 'dlsite.com'])")) throw new Error('DLsite hostname allowlist missing');
const parserPath = path.resolve('dist-electron/dlsiteMetadataParser.js');
if (!fs.existsSync(parserPath)) throw new Error('dist-electron parser missing');
const { parseDlsiteProductPage } = await import(`${pathToFileURL(parserPath).href}?mvp118=${Date.now()}`);
const fixture = `<!doctype html><html><head><meta property="og:title" content="テスト音声作品 | DLsite 同人"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"テスト音声作品","brand":{"name":"テストサークル"},"description":"説明","releaseDate":"2026-07-01","keywords":"耳かき,癒し"}</script></head><body><table><tr><th>声優</th><td>声優A、声優B</td></tr><tr><th>ジャンル</th><td>ASMR、バイノーラル</td></tr></table></body></html>`;
const candidate = parseDlsiteProductPage({ html: fixture, requestedRjId: 'RJ123456', sourceUrl: 'https://www.dlsite.com/maniax/work/=/product_id/RJ123456.html', fetchedAt: '2026-07-11T00:00:00.000Z' });
if (candidate.rjId !== 'RJ00123456' || candidate.title !== 'テスト音声作品' || candidate.circle !== 'テストサークル') throw new Error('fixture basic fields failed');
if (!candidate.cvs?.includes('声優A') || !candidate.tags?.includes('ASMR') || !candidate.tags?.includes('耳かき')) throw new Error('fixture lists failed');
console.log('MVP118 DLsite single-RJ metadata provider verification PASS');
