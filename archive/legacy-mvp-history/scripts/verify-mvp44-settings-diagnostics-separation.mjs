import fs from 'node:fs';

const requiredFiles = [
  'src/services/settingsDiagnosticsSeparationService.ts',
  'src/components/SettingsPage.tsx',
  'src/components/DiagnosticsPage.tsx',
  'docs/CURRENT_ROADMAP_MVP44.md',
  'docs/SETTINGS_DIAGNOSTICS_SEPARATION_MVP44.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing MVP-44 file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!['0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95', '0.134.0-mvp96', '0.135.0-mvp97', '0.136.0-mvp98', '0.137.0-mvp99', '0.138.0-mvp100', '0.139.0-mvp101', '0.140.0-mvp102'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.82.0-mvp44 or later compatible MVP-45, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp44-settings-diagnostics-separation']) {
  throw new Error('Missing verify:mvp44-settings-diagnostics-separation script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp44-settings-diagnostics-separation')) {
  throw new Error('verify:all does not include MVP-44 verifier');
}

const service = fs.readFileSync('src/services/settingsDiagnosticsSeparationService.ts', 'utf8');
for (const token of [
  'settingsDiagnosticsSeparationService',
  'dailyFlowCards',
  'separationCards',
  'diagnosticCards',
  '选择资源库目录',
  '读取现有记录',
  '一键扫描并应用',
]) {
  if (!service.includes(token)) throw new Error(`MVP-44 service missing token: ${token}`);
}
for (const forbidden of ['fs.unlink', 'fs.rename', 'fs.rm', 'child_process', 'ASMR.one', 'DLsite']) {
  if (service.includes(forbidden)) throw new Error(`MVP-44 service should not introduce forbidden token: ${forbidden}`);
}

const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
for (const token of [
  'mvp44-settings-daily-flow',
  'mvp44-settings-diagnostics-separation',
  'settingsDiagnosticsSeparationService',
  '高级资源库工具',
]) {
  if (!settings.includes(token)) throw new Error(`SettingsPage missing MVP-44 token: ${token}`);
}

const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
for (const token of [
  'mvp44-diagnostics-separation',
  'settingsDiagnosticsSeparationService',
  '主界面与诊断页边界',
  '资源库扫描',
  '命名检查',
  '文件状态',
  '重复资源',
]) {
  if (!diagnostics.includes(token)) throw new Error(`DiagnosticsPage missing MVP-44 token: ${token}`);
}
for (const stale of ['诊断页 · Demo / 原型验证', 'Shell 挂载输出监控', 'Demo 数据状态 / 尚无 SQLite']) {
  if (diagnostics.includes(stale)) throw new Error(`DiagnosticsPage still contains stale MVP-44 visible copy: ${stale}`);
}

console.log('MVP-44 settings/diagnostics separation verification passed.');
