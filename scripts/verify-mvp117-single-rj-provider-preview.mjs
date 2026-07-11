import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.155.0-mvp117', '0.156.0-mvp118', '0.157.0-mvp119', '0.158.0-mvp120'].includes(packageJson.version)) throw new Error(`unexpected version: ${packageJson.version}`);

const checks = [
  ['src/services/asmrMetadataProviderPreviewService.ts', 'schemaVersion: 1'],
  ['src/services/asmrMetadataProviderPreviewService.ts', 'RJ 号不一致'],
  ['src/services/asmrMetadataProviderPreviewService.ts', 'changedFieldCount'],
  ['src/components/AsmrMetadataProviderPreview.tsx', 'mvp117-single-rj-provider-preview'],
  ['src/components/AsmrMetadataProviderPreview.tsx', '填入当前编辑表单（尚未保存）'],
  ['src/components/AsmrDetail.tsx', 'AsmrMetadataProviderPreview'],
  ['src/services/index.ts', 'asmrMetadataProviderPreviewService'],
  ['docs/LOCAL_METADATA_CLOSEOUT_PROVIDER_PREVIEW_MVP117.md', '不自动保存'],
];
for (const [file, marker] of checks) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}
const service = fs.readFileSync('src/services/asmrMetadataProviderPreviewService.ts', 'utf8');
for (const forbidden of ['fetch(', 'axios', 'absolutePath', 'file://', 'writeFile', 'sqlite']) {
  if (service.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`provider preview service contains forbidden marker: ${forbidden}`);
}
const component = fs.readFileSync('src/components/AsmrMetadataProviderPreview.tsx', 'utf8');
if (!component.includes('查询结果只用于差异预览')) throw new Error('provider preview UI must preserve preview-only wording');
console.log('MVP117 single-RJ provider preview verification PASS');
