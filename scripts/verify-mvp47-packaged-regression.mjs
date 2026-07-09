import fs from 'node:fs';

const requiredFiles = [
  'src/services/packagedRegressionValidationService.ts',
  'src/components/DiagnosticsPage.tsx',
  'scripts/desktop-smoke-check.mjs',
  'docs/CURRENT_ROADMAP_MVP47.md',
  'docs/PACKAGED_REGRESSION_MVP47.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-47 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.85.0-mvp47 or later compatible MVP-48, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp47-packaged-regression']) {
  throw new Error('Missing verify:mvp47-packaged-regression script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp47-packaged-regression')) {
  throw new Error('verify:all does not include MVP-47 verifier');
}

const service = fs.readFileSync('src/services/packagedRegressionValidationService.ts', 'utf8');
for (const token of [
  'packagedRegressionValidationService',
  'PackagedRegressionValidationModel',
  '打包版回归验收',
  '资源库恢复提示',
  '索引闭环',
  '播放闭环',
  'Renderer 不接收 absolutePath',
  'Renderer 不接收 file://',
]) {
  if (!service.includes(token)) throw new Error(`MVP-47 service missing token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'mvp47-packaged-regression',
  'packagedRegressionValidationService',
  '打包版回归验收',
  '推荐验证命令',
  '本轮继续后置',
  '命名规则预览',
  '文件状态检查',
  '重复资源分析',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-47 token: ${token}`);
}
for (const stale of [
  '正在并发从 DLsite / ASMR.one',
  'ASMR.one 代理代理',
  '香港加速节点连接正常',
  '已一键物理剪切',
  '一键媒体库物理批量重命名',
  '多物理路径追加扫描监控',
  '已物理修复连线',
  '物理地址:',
  'D:/YangKura',
  'E:/ASMR_Backup',
]) {
  if (diagnostics.includes(stale)) throw new Error(`DiagnosticsPage still contains risky stale copy: ${stale}`);
}

const smoke = fs.readFileSync('scripts/desktop-smoke-check.mjs', 'utf8');
for (const token of ['MVP-47', '打包版回归验收', '资源库恢复提示', 'Renderer never displays absolutePath or file://']) {
  if (!smoke.includes(token)) throw new Error(`desktop-smoke-check missing MVP-47 token: ${token}`);
}

const docs = fs.readFileSync('docs/PACKAGED_REGRESSION_MVP47.md', 'utf8');
for (const token of ['不接 SQLite', '不删除 / 移动 / 重命名', 'Renderer 不接收 absolutePath', 'Renderer 不接收 file://']) {
  if (!docs.includes(token)) throw new Error(`MVP-47 docs missing token: ${token}`);
}

console.log('MVP-47 packaged regression verification passed.');
