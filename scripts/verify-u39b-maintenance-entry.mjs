import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const requireToken = (file, token) => {
  const source = read(file);
  if (!source.includes(token)) failures.push(`${file} missing ${token}`);
};
const forbidToken = (file, token) => {
  const source = read(file);
  if (source.includes(token)) failures.push(`${file} retains forbidden token ${token}`);
};

for (const file of [
  'src/components/SettingsMaintenanceEntry.tsx',
  'src/components/DiagnosticsPageShell.tsx',
  'src/app/AppRouter.tsx',
  'src/app/navigation.ts',
]) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}

requireToken('src/components/SettingsMaintenanceEntry.tsx', 'id="u39b-settings-maintenance-entry"');
requireToken('src/components/SettingsMaintenanceEntry.tsx', 'onOpenMaintenance');
requireToken('src/components/SettingsMaintenanceEntry.tsx', '打开 AI 维护');
requireToken('src/app/AppRouter.tsx', "props.setCurrentPage('diagnostics')");
requireToken('src/app/AppRouter.tsx', "props.setCurrentPage('settings')");
requireToken('src/app/AppRouter.tsx', 'onBackToSettings');
requireToken('src/components/DiagnosticsPageShell.tsx', '返回设置');
requireToken('src/components/DiagnosticsPageShell.tsx', '返回维护概览');
requireToken('src/components/DiagnosticsPageShell.tsx', "const DiagnosticsPage = lazy(() => import('./DiagnosticsPage'))");
requireToken('src/app/navigation.ts', "daily: false");
requireToken('src/app/navigation.ts', "visibleInSidebar: false");
forbidToken('src/components/SettingsMaintenanceEntry.tsx', 'MVP');
forbidToken('src/components/SettingsMaintenanceEntry.tsx', 'npm run');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[verify-u39b-maintenance-entry] dedicated maintenance entry PASS');
