import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.154.0-mvp116', '0.155.0-mvp117', '0.156.0-mvp118', '0.157.0-mvp119', '0.158.0-mvp120'].includes(packageJson.version)) throw new Error(`Unexpected version: ${packageJson.version}`);

const checks = [
  ['src/services/metadataOverrideService.ts', 'previewImportSnapshot'],
  ['src/services/metadataOverrideService.ts', 'totalFields'],
  ['src/components/MusicMetadataManagementPanel.tsx', 'mvp116-metadata-backup-preview'],
  ['src/components/MusicMetadataManagementPanel.tsx', 'mvp116-metadata-override-summary'],
  ['src/components/AsmrDetail.tsx', '还原本地修改'],
  ['src/components/AsmrLibrary.tsx', '个人收听标记筛选'],
  ['src/components/MusicLibrary.tsx', 'filteredAlbums'],
  ['src/App.tsx', 'handleClearRjWorkOverride'],
];
for (const [file, marker] of checks) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}
const service = fs.readFileSync('src/services/metadataOverrideService.ts', 'utf8');
if (service.includes('absolutePath') || service.includes('file://')) throw new Error('metadata override service must not persist path data');
console.log('MVP116 metadata search / restore / preview verification PASS');
