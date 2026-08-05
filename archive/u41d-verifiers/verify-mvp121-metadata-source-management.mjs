import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp121-metadata-source-management')) throw new Error('verify:stable missing MVP121');

for (const [file, markers] of [
  ['src/components/AsmrMetadataProviderPreview.tsx', ['mvp121-provider-field-selection', '本地当前值', '外部候选值', '填入已选', 'selectedFields']],
  ['src/services/asmrMetadataProviderPreviewService.ts', ['selectCandidateFields', 'PROVIDER_FIELD_ORDER']],
  ['src/services/metadataOverrideService.ts', ['AsmrMetadataOverrideProvenance', 'appliedFields', 'sourceLabel', 'getAsmrOverrideSourceLabel', "kind: 'manual' | 'provider'"]],
  ['src/components/AsmrDetail.tsx', ['mvp121-saved-metadata-source', 'pendingMetadataSource', "kind: 'provider'", "pendingMetadataSource ?? { kind: 'manual' }"]],
  ['src/App.tsx', ['AsmrMetadataSaveContext', 'upsertAsmrOverride(updated.id, patch, source)']],
  ['tests/fixtures/dlsite/RJ01554928-translation-success.html', ['MVP121 翻译入口回归夹具', '测试声优A']],
  ['docs/METADATA_SOURCE_MANAGEMENT_MVP121.md', ['字段逐项选择', '来源标识', 'RJ01554928']],
]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const overrideText = fs.readFileSync('src/services/metadataOverrideService.ts', 'utf8');
for (const forbidden of ['absolutePath', 'file://', 'fs.writeFile', 'fs.unlink', 'fs.rename', 'sqlite3']) {
  if (overrideText.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`metadata override contains forbidden marker: ${forbidden}`);
}
if (!overrideText.includes("key !== 'provenance'")) throw new Error('provenance must not inflate override field counts');
if (!overrideText.includes('applyAsmrOverrides(works: RJWork[])')) throw new Error('reload merge path missing');

const parserPath = path.resolve('dist-electron/dlsiteMetadataParser.js');
if (!fs.existsSync(parserPath)) throw new Error('compiled DLsite parser missing; run build:electron first');
const { parseDlsiteProductPage } = await import(`${pathToFileURL(parserPath).href}?mvp121=${Date.now()}`);
const html = fs.readFileSync('tests/fixtures/dlsite/RJ01554928-translation-success.html', 'utf8');
const sourceUrl = 'https://www.dlsite.com/maniax/work/=/product_id/RJ01554927.html?translation=RJ01554928';
const candidate = parseDlsiteProductPage({
  html,
  requestedRjId: 'RJ01554928',
  sourceUrl,
  fetchedAt: '2026-07-11T12:00:00.000Z',
});
if (candidate.rjId !== 'RJ01554928') throw new Error(`translation request RJ mismatch: ${candidate.rjId}`);
if (candidate.sourceUrl !== sourceUrl) throw new Error('translation final URL not preserved');
if (candidate.title !== 'MVP121 翻译入口回归夹具') throw new Error('fixture title parse failed');
if (candidate.circle !== 'Yang-Kura 测试社团') throw new Error('fixture circle parse failed');
if (!candidate.cvs?.includes('测试声优A') || !candidate.tags?.includes('翻译入口')) throw new Error('fixture list parse failed');

console.log('MVP121 metadata source management verification PASS');
