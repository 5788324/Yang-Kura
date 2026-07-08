import fs from 'node:fs';

const requiredFiles = [
  'src/services/electronStubSmokeCheckService.ts',
  'src/components/DiagnosticsPage.tsx',
  'docs/ELECTRON_SHELL_SMOKE_CHECK_MVP17.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required MVP-17 file: ${file}`);
  }
}

const service = fs.readFileSync('src/services/electronStubSmokeCheckService.ts', 'utf8');
const diagnostics = fs.readFileSync('src/components/DiagnosticsPage.tsx', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredServiceTokens = [
  'MVP-17 Electron Shell Smoke Check UI',
  'electronStubSmokeCheckService',
  'getInitialSmokeCheck',
  'getRunningSmokeCheck',
  'runSmokeCheck',
  'getElectronShellStatus',
  'selectLibraryRoot',
  'requestScannerDryRun',
  'mvp19-user-selected-tokenized-root expected after user click',
  'absolutePath must stay undefined',
  'indexWriteAllowed=false expected',
];

for (const token of requiredServiceTokens) {
  if (!service.includes(token)) {
    throw new Error(`MVP-17 service missing token: ${token}`);
  }
}

const requiredDiagnosticsTokens = [
  'electronStubSmokeCheckService',
  'electronStubSmokeCheck',
  'runElectronStubSmokeCheck',
  'MVP-17 Electron Shell Smoke Check UI',
  '运行 preload stub 检查',
  'MVP-17 禁止动作',
];

for (const token of requiredDiagnosticsTokens) {
  if (!diagnostics.includes(token)) {
    throw new Error(`DiagnosticsPage missing MVP-17 token: ${token}`);
  }
}

const forbiddenServicePatterns = [
  'node:fs',
  'fs.',
  'ipcRenderer',
  'ipcMain',
  'showOpenDialog',
  'writeFile',
  'appendFile',
  'unlink',
  'rename',
  'rm(',
  'rmdir',
  'child_process',
  'new Audio',
];

for (const pattern of forbiddenServicePatterns) {
  if (service.includes(pattern)) {
    throw new Error(`MVP-17 smoke check service must not contain forbidden pattern: ${pattern}`);
  }
}

if (!packageJson.scripts['verify:mvp17-electron-smoke-check-ui']) {
  throw new Error('package.json missing verify:mvp17-electron-smoke-check-ui script');
}

if (!packageJson.scripts['verify:all'].includes('verify:mvp17-electron-smoke-check-ui')) {
  throw new Error('verify:all does not include MVP-17 verifier');
}

if (!['0.56.0-mvp17', '0.57.0-mvp18', '0.58.0-mvp19', '0.59.0-mvp20', '0.60.0-mvp22', '0.61.0-mvp23', '0.62.0-mvp24', '0.63.0-mvp25', '0.64.0-mvp26', '0.65.0-mvp27', '0.66.0-mvp28', '0.66.1-mvp28.1', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.66.2-mvp28.2', '0.67.0-mvp29', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.67.1-mvp29.1', '0.68.0-mvp30', '0.69.0-mvp31', '0.70.0-mvp32', '0.71.0-mvp33', '0.72.0-mvp34', '0.73.0-mvp35', '0.74.0-mvp36', '0.75.0-mvp37', '0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85', '0.124.0-mvp86', '0.125.0-mvp87', '0.126.0-mvp88', '0.127.0-mvp89', '0.128.0-mvp90', '0.129.0-mvp91', '0.130.0-mvp92', '0.131.0-mvp93', '0.132.0-mvp94', '0.133.0-mvp95'].includes(packageJson.version)) {
  throw new Error(`Expected version 0.56.0-mvp17 or 0.57.0-mvp18, got ${packageJson.version}`);
}

console.log('MVP-17 Electron smoke check UI verifier passed.');
