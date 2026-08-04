import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`unexpected version: ${pkg.version}`);
if (!fs.readFileSync('scripts/run-stable-regression.mjs', 'utf8').includes('verify:mvp127-missing-index-management')) throw new Error('verify:stable missing MVP127');
if (!pkg.scripts?.['test:index-health:models']) throw new Error('MVP127 model test script missing');

const checks = [
  ['electron/libraryIndexHealthService.ts', ['collectLibraryIndexHealthReferences', 'buildLibraryIndexRemovalPreview', 'preview-only', 'media files were not deleted']],
  ['electron/main.ts', ['mvp127-library-index-health-check-complete', 'mvp127-library-index-removal-preview-ready', 'mvp127-nearest-existing-parent-opened', 'read-only health check', 'registerLibraryIndexHealthIpc']],
  ['electron/preload.ts', ['requestLibraryIndexHealthCheck', 'requestLibraryIndexRemovalPreview', 'requestRevealMissingEntryParent']],
  ['src/types/electron-api.d.ts', ['YangKuraLibraryIndexHealthCheckResult', 'YangKuraLibraryIndexRemovalPreviewResult', 'YangKuraRevealMissingEntryParentResult']],
  ['src/components/SettingsPage.tsx', ['mvp127-library-index-health-management', '缺失文件与失效记录', '只读重新扫描', '从索引移除预览', '打开最近存在目录']],
  ['docs/MISSING_FILE_INDEX_MANAGEMENT_MVP127.md', ['只读检查', '移除预览', '不会删除真实文件']],
];
for (const [file, markers] of checks) {
  const text = fs.readFileSync(file, 'utf8');
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${file} missing ${marker}`);
}

const main = fs.readFileSync('electron/main.ts', 'utf8');
if (main.includes('absolutePathReturned: true') || main.includes('fileUrlReturned: true')) throw new Error('path privacy regression');
const healthService = fs.readFileSync('electron/libraryIndexHealthService.ts', 'utf8');
if (/from ['"]node:fs|fs\.rm|fs\.unlink|fs\.rename|fs\.writeFile|fs\.copyFile/.test(healthService)) throw new Error('health model service must remain file-system agnostic');

const output = execFileSync(process.execPath, ['scripts/test-mvp127-library-index-health-service.mjs'], { encoding: 'utf8' });
if (!output.includes('PASS') || !output.includes('no file writes')) throw new Error('MVP127 model test output incomplete');
console.log(output.trim());
console.log('MVP127 missing-file/index-management verifier PASS');
