#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${file}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

const playlist = read('src/components/PlaylistPage.tsx');
const importer = read('src/components/ImporterPage.tsx');
const themeRuntime = read('src/app/themeRuntime.ts');
const themeBridge = read('src/app/ThemeRuntimeBridge.tsx');
const electronMain = read('electron/main.ts');

const requireToken = (content, token, file) => {
  if (!content.includes(token)) failures.push(`${file} missing: ${token}`);
};
const forbidToken = (content, token, file) => {
  if (content.includes(token)) failures.push(`${file} still contains: ${token}`);
};

forbidToken(
  playlist,
  '共 ${filteredPlaylists.length} 个歌单、${playlistSummary.trackCount} 首音轨',
  'src/components/PlaylistPage.tsx',
);
requireToken(
  playlist,
  '共 {filteredPlaylists.length} 个歌单、{playlistSummary.trackCount} 首音轨',
  'src/components/PlaylistPage.tsx',
);

requireToken(importer, 'id="mvp107-importer-ai-maintenance-fold"\n        hidden\n        aria-hidden="true"', 'src/components/ImporterPage.tsx');
requireToken(themeRuntime, "export type LegacyThemeCompatibilityId = 'dark' | 'acrylic-mist' | 'ocean-drops';", 'src/app/themeRuntime.ts');
requireToken(themeRuntime, "if (theme === 'acrylic-mist') return '云雾亚克力';", 'src/app/themeRuntime.ts');
requireToken(themeRuntime, "if (theme === 'ocean-drops') return '微光海洋';", 'src/app/themeRuntime.ts');
requireToken(themeBridge, 'const currentThemeLabel = getLegacyThemeLabel(legacyTheme);', 'src/app/ThemeRuntimeBridge.tsx');
requireToken(themeBridge, '<span>{currentThemeLabel}</span>', 'src/app/ThemeRuntimeBridge.tsx');
requireToken(electronMain, 'process.env.YANG_KURA_USER_DATA_ROOT?.trim()', 'electron/main.ts');
requireToken(electronMain, 'const hasSingleInstanceLock = app.requestSingleInstanceLock();', 'electron/main.ts');
requireToken(electronMain, "app.on('second-instance'", 'electron/main.ts');
requireToken(electronMain, 'restoredRootRecords.forEach((record) => rootTokenMap.set(record.rootPathToken, record));', 'electron/main.ts');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[u40d-retest] profile, restart, playlist, theme, importer and token restoration checks PASS');
