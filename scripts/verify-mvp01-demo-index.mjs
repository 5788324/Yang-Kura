import {readFileSync, existsSync} from 'node:fs';

const failures = [];
const read = (file) => readFileSync(file, 'utf8');
const requireFile = (file) => {
  if (!existsSync(file)) failures.push(`missing file: ${file}`);
};

for (const file of [
  'docs/LOCAL_JSON_INDEX_PLAN.md',
  'src/services/libraryIndexAdapter.ts',
  'scripts/verify-mvp01-demo-index.mjs',
]) requireFile(file);

const types = read('src/types.ts');
for (const token of [
  'LibraryRoot',
  'LibraryCollection',
  'LibraryTrack',
  'TrackSource',
  'SubtitleSource',
  'CoverSource',
  'LocalJsonIndex',
]) {
  if (!types.includes(token)) failures.push(`src/types.ts missing ${token}`);
}

const adapter = read('src/services/libraryIndexAdapter.ts');
for (const token of [
  'fromMockData',
  'sourceKind: \'mock\'',
  'root_demo_asmr',
  'root_demo_music',
  'MVP-01 demo index',
]) {
  if (!adapter.includes(token)) failures.push(`libraryIndexAdapter missing ${token}`);
}

const docs = read('docs/LOCAL_JSON_INDEX_PLAN.md');
for (const token of [
  '不实现真实扫描',
  '不写真实 `library-index.json`',
  'MVP 先 `library-index.json`',
  'LibraryRoot',
  'LibraryCollection',
  'LibraryTrack',
]) {
  if (!docs.includes(token)) failures.push(`LOCAL_JSON_INDEX_PLAN missing ${token}`);
}

const app = read('src/App.tsx');
for (const token of [
  'Demo 模式',
  '尚未接入真实扫描',
  'No SQLite',
]) {
  if (!app.includes(token)) failures.push(`App.tsx missing demo marker ${token}`);
}

const downloader = read('src/components/DownloaderPage.tsx');
for (const token of ['Demo / Coming Soon', '不联网', '无真实下载']) {
  if (!downloader.includes(token)) failures.push(`DownloaderPage missing demo marker ${token}`);
}

const diagnostics = read('src/components/DiagnosticsPage.tsx');
for (const token of ['Demo / 原型验证', '不扫描真实磁盘', '未修改任何真实文件']) {
  if (!diagnostics.includes(token)) failures.push(`DiagnosticsPage missing demo marker ${token}`);
}

const forbiddenRealAbility = [
  ['src/services/libraryIndexAdapter.ts', ['node:fs', 'fs.', 'electron', 'sqlite3', 'child_process', 'localStorage', 'new Audio(']],
];
for (const [file, tokens] of forbiddenRealAbility) {
  const text = read(file);
  for (const token of tokens) {
    if (text.includes(token)) failures.push(`${file} contains forbidden real-ability token: ${token}`);
  }
}

const packageJson = read('package.json');
if (!packageJson.includes('verify:mvp01-demo-index')) failures.push('package.json missing verify:mvp01-demo-index');
if (!packageJson.includes('0.40.0-mvp01') && !packageJson.includes('0.41.0-mvp02') && !packageJson.includes('0.42.0-mvp03') && !packageJson.includes('0.43.0-mvp04') && !packageJson.includes('0.44.0-mvp05') && !packageJson.includes('0.45.0-mvp06') && !packageJson.includes('0.46.0-mvp07') && !packageJson.includes('0.47.0-mvp08') && !packageJson.includes('0.47.1-mvp08.1')) failures.push('package.json version not updated to MVP-01 or later');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[Yang-Kura] MVP-01 demo/index verification passed.');
