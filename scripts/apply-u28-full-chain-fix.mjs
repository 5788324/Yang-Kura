#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`U28 patch anchor not found: ${label}`);
  return source.replace(before, after);
}

const dashboardPath = 'src/components/Dashboard.tsx';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');
dashboard = replaceOnce(
  dashboard,
  `  const lastIndex = librarySessionSnapshot.lastIndex;\n  const hasRealLibrary = Boolean(lastIndex && lastIndex.trackCount > 0);\n  const libraryStatusText = hasRealLibrary\n    ? \`已连接「\${lastIndex?.displayName}」：\${lastIndex?.collectionCount} 个集合，\${lastIndex?.trackCount} 条音轨\`\n    : '尚未读取资源库记录。先去设置页选择目录，再读取现有记录或一键扫描并应用。';\n  const libraryActionText = hasRealLibrary ? '更新资源库' : '导入资源库';`,
  `  const lastIndex = librarySessionSnapshot.lastIndex;\n  const hasLoadedIndex = Boolean(lastIndex);\n  const hasLibraryTracks = Boolean(lastIndex && lastIndex.trackCount > 0);\n  const hasAuthorizedRoot = Object.keys(librarySessionSnapshot.selectedRoots).length > 0;\n  const isLoadedEmptyLibrary = hasLoadedIndex && !hasLibraryTracks;\n  // Existing downstream home models use hasRealLibrary as a connection flag, not a non-zero track count.\n  const hasRealLibrary = hasLoadedIndex;\n  const libraryStatusText = hasLoadedIndex\n    ? \`已连接「\${lastIndex?.displayName}」：\${lastIndex?.collectionCount} 个集合，\${lastIndex?.trackCount} 条音轨\${isLoadedEmptyLibrary ? '；Index 已成功读取，当前为空。' : ''}\`\n    : hasAuthorizedRoot\n      ? '目录已授权，尚未读取资源库记录。请前往设置页读取已有记录。'\n      : '尚未选择资源库。请前往设置页选择目录，再读取现有记录。';\n  const libraryActionText = hasLoadedIndex ? '更新资源库' : hasAuthorizedRoot ? '读取资源库' : '导入资源库';\n  const libraryCardTitle = hasLibraryTracks\n    ? '已连接本地资源库'\n    : isLoadedEmptyLibrary\n      ? '已连接空资源库'\n      : hasAuthorizedRoot\n        ? '等待读取资源库'\n        : '等待导入资源库';`,
  'Dashboard connection semantics',
);
dashboard = replaceOnce(
  dashboard,
  `  const isCleanLibrary = !hasRealLibrary && rjWorks.length === 0 && musicAlbums.length === 0 && recentTracks.length === 0 && playlists.length === 0;`,
  `  const isInitialEmptyLibrary = !hasLoadedIndex && rjWorks.length === 0 && musicAlbums.length === 0 && recentTracks.length === 0 && playlists.length === 0;`,
  'Dashboard initial empty state',
);
dashboard = replaceOnce(dashboard, `{isCleanLibrary && (`, `{isInitialEmptyLibrary && (`, 'Dashboard empty state render');
dashboard = replaceOnce(
  dashboard,
  `      )}\n      <section id="mvp45-home-continue-listening"`,
  `      )}\n      {isLoadedEmptyLibrary && (\n        <section id="u28-home-loaded-empty-state" className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 md:p-8 text-center space-y-4">\n          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center"><Headphones className="w-7 h-7" /></div>\n          <div className="space-y-2">\n            <h2 className="text-xl font-extrabold text-text-primary">资源库已连接，当前没有音轨</h2>\n            <p className="mx-auto max-w-2xl text-sm text-text-muted leading-relaxed">已成功读取「{lastIndex?.displayName}」的 library-index.json：0 个集合，0 条音轨。这是一个有效的空资源库，不是读取失败。</p>\n          </div>\n          <button id="u28-home-loaded-empty-state-action" onClick={() => setCurrentPage('settings')} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">重新读取资源库</button>\n        </section>\n      )}\n      <section id="mvp45-home-continue-listening"`,
  'Dashboard loaded-empty panel',
);
dashboard = replaceOnce(
  dashboard,
  `              >\n                导入资源库\n              </button>`,
  `              >\n                {libraryActionText}\n              </button>`,
  'Dashboard hero settings action',
);
dashboard = replaceOnce(
  dashboard,
  `{hasRealLibrary ? '已连接本地资源库' : '等待导入资源库'}`,
  `{libraryCardTitle}`,
  'Dashboard resource card title',
);
fs.writeFileSync(dashboardPath, dashboard, 'utf8');

const mainPath = 'electron/main.ts';
let main = fs.readFileSync(mainPath, 'utf8');
main = replaceOnce(
  main,
  `    const result = await dialog.showOpenDialog(mainWindow, {\n      title: \`选择 \${getDefaultDisplayName(libraryType)} 根目录\`,\n      buttonLabel: '选择此目录',\n      properties: ['openDirectory', 'dontAddToRecent'],\n    });`,
  `    const e2eRootPath = process.env.YANG_KURA_E2E_MODE === '1'\n      ? process.env.YANG_KURA_E2E_LIBRARY_ROOT?.trim()\n      : undefined;\n    let result: { canceled: boolean; filePaths: string[] };\n    if (e2eRootPath) {\n      try {\n        const resolvedE2eRoot = path.resolve(e2eRootPath);\n        const e2eRootStat = await fs.stat(resolvedE2eRoot);\n        if (!e2eRootStat.isDirectory()) throw Object.assign(new Error('not-directory'), { code: 'ENOTDIR' });\n        result = { canceled: false, filePaths: [resolvedE2eRoot] };\n      } catch (error) {\n        return {\n          ok: false,\n          status: 'u28-e2e-root-invalid',\n          libraryType,\n          permissionState: 'rejected',\n          source: 'u28-electron-e2e-fixture',\n          absolutePathReturned: false,\n          fileUrlReturned: false,\n          message: \`E2E 临时资源库不可用：\${getSafeErrorCode(error)}\`,\n          safetyNotes: buildSafetyNotes(),\n        } as const;\n      }\n    } else {\n      result = await dialog.showOpenDialog(mainWindow, {\n        title: \`选择 \${getDefaultDisplayName(libraryType)} 根目录\`,\n        buttonLabel: '选择此目录',\n        properties: ['openDirectory', 'dontAddToRecent'],\n      });\n    }`,
  'Electron E2E directory fixture hook',
);
fs.writeFileSync(mainPath, main, 'utf8');

const verifierPath = 'scripts/verify-u28-library-reconciliation.mjs';
let verifier = fs.readFileSync(verifierPath, 'utf8');
verifier = replaceOnce(
  verifier,
  `const app = fs.readFileSync('src/App.tsx', 'utf8');\nconst shell = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');`,
  `const app = fs.readFileSync('src/App.tsx', 'utf8');\nconst dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');\nconst shell = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');`,
  'U28 verifier Dashboard source',
);
verifier = replaceOnce(
  verifier,
  `  ['header reads explicit session index state', app.includes('librarySessionSnapshot.lastIndex')],`,
  `  ['header reads explicit session index state', app.includes('librarySessionSnapshot.lastIndex')],\n  ['dashboard separates connection from content count', dashboard.includes('const hasLoadedIndex = Boolean(lastIndex)') && dashboard.includes('const hasLibraryTracks = Boolean(lastIndex && lastIndex.trackCount > 0)') && !dashboard.includes('const hasRealLibrary = Boolean(lastIndex && lastIndex.trackCount > 0)')],\n  ['dashboard renders valid loaded-empty state', dashboard.includes('id="u28-home-loaded-empty-state"') && dashboard.includes('资源库已连接，当前没有音轨') && dashboard.includes('已连接空资源库')],\n  ['dashboard distinguishes authorized unread state', dashboard.includes("hasAuthorizedRoot ? '读取资源库'") && dashboard.includes('等待读取资源库')],`,
  'U28 verifier final Dashboard semantics',
);
fs.writeFileSync(verifierPath, verifier, 'utf8');

const packagePath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.scripts['test:u28:electron-e2e'] = 'node scripts/test-u28-electron-e2e.mjs';
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

const workflowPath = '.github/workflows/branch-validation.yml';
let workflow = fs.readFileSync(workflowPath, 'utf8');
workflow = replaceOnce(
  workflow,
  `      - name: Audit high and critical dependency risk\n        run: npm audit --audit-level=high\n\n      - name: Run focused UI verifiers`,
  `      - name: Audit high and critical dependency risk\n        run: npm audit --audit-level=high\n\n      - name: Rebuild Electron runtime for desktop E2E\n        run: npm rebuild electron\n\n      - name: Build desktop application for U28 E2E\n        env:\n          NODE_OPTIONS: --max-old-space-size=8192\n        run: |\n          npm run build\n          npm run build:electron\n\n      - name: Run U28 Electron full-chain UI acceptance\n        run: npm run test:u28:electron-e2e\n\n      - name: Upload U28 Electron screenshots and report\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: u28-electron-e2e\n          path: artifacts/u28-electron-e2e\n          if-no-files-found: warn\n          retention-days: 14\n\n      - name: Run focused UI verifiers`,
  'Branch Validation Electron E2E gate',
);
fs.writeFileSync(workflowPath, workflow, 'utf8');

console.log('U28 full-chain product and validation patch applied.');
