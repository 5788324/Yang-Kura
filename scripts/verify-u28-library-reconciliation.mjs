import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const dashboard = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const shell = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');
const sessionServiceSource = fs.readFileSync('src/services/librarySessionService.ts', 'utf8');

const checks = [
  ['session-only root authorization', settings.includes('yang_kura_u28_authorized_roots_v1') && settings.includes('sessionStorage.setItem')],
  ['settings token fallback', settings.includes('getU28RootSessionEntry(libraryType)?.rootPathToken')],
  ['root selection is recorded', settings.includes('writeU28RootSession(result)')],
  ['stale ASMR state is replaced', app.includes('asmrBase = mapped.rjWorks') && !app.includes('if (mapped.rjWorks.length > 0) asmrBase')],
  ['stale music state is replaced', app.includes('musicBase = mapped.musicAlbums')],
  ['real index refresh replaces both libraries', app.includes('setRjWorks(metadataOverrideService.applyAsmrOverrides(mapped.rjWorks))') && app.includes('setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums))')],
  ['header reads explicit session index state', app.includes('librarySessionSnapshot.lastIndex')],
  ['dashboard separates connection from content count', dashboard.includes('const hasLoadedIndex = Boolean(lastIndex)') && dashboard.includes('const hasLibraryTracks = Boolean(lastIndex && lastIndex.trackCount > 0)') && !dashboard.includes('const hasRealLibrary = Boolean(lastIndex && lastIndex.trackCount > 0)')],
  ['dashboard renders valid loaded-empty state', dashboard.includes('id="u28-home-loaded-empty-state"') && dashboard.includes('资源库已连接，当前没有音轨') && dashboard.includes('已连接空资源库')],
  ['dashboard distinguishes authorized unread state', dashboard.includes("hasAuthorizedRoot ? '读取资源库'") && dashboard.includes('等待读取资源库')],
  ['session service records explicit read attempts', sessionServiceSource.includes("status: 'loaded'") && sessionServiceSource.includes("status: 'failed'")],
  ['session service owns cross-page index event', sessionServiceSource.includes("const INDEX_READ_EVENT_NAME = 'yang-kura-library-index-loaded'") && sessionServiceSource.includes('emitIndexReadUpdated()')],
  ['session service enforces current-window authorization', sessionServiceSource.includes("const CURRENT_WINDOW_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1'") && sessionServiceSource.includes('applyCurrentWindowAuthorizationBoundary')],
  ['root reselection clears stale loaded state', sessionServiceSource.includes('lastIndex: undefined') && sessionServiceSource.includes('lastReadAttempt: undefined')],
  ['demo scanner removed from active handler', !app.includes('Demo 扫描演示：不会读取真实磁盘')],
  ['diagnostics names real state', shell.includes('刷新真实资源状态') && shell.includes('不再使用 Demo 扫描冒充真实状态')],
  ['privacy boundary retained', settings.includes('真实路径不会展示') && !settings.includes('absolutePath: result')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log((ok ? 'PASS' : 'FAIL') + '\t' + name);
if (failed.length) process.exit(1);

const compiledService = ts.transpileModule(sessionServiceSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const localStorageValues = new Map();
const sessionStorageValues = new Map();
const listeners = new Map();

class MockEvent {
  constructor(type) {
    this.type = type;
  }
}

const makeStorage = (values) => ({
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  },
  clear() {
    values.clear();
  },
});

const localStorage = makeStorage(localStorageValues);
const sessionStorage = makeStorage(sessionStorageValues);

const window = {
  addEventListener(type, listener) {
    const bucket = listeners.get(type) ?? new Set();
    bucket.add(listener);
    listeners.set(type, bucket);
  },
  removeEventListener(type, listener) {
    listeners.get(type)?.delete(listener);
  },
  dispatchEvent(event) {
    for (const listener of [...(listeners.get(event.type) ?? [])]) listener(event);
    return true;
  },
};

const runtimeModule = { exports: {} };
vm.runInNewContext(compiledService, {
  module: runtimeModule,
  exports: runtimeModule.exports,
  localStorage,
  sessionStorage,
  window,
  Event: MockEvent,
  console,
  Date,
  JSON,
  Number,
  Object,
  String,
  Array,
  Set,
  Map,
});

const librarySessionService = runtimeModule.exports.librarySessionService;
let currentReadResult;
let indexReadEventCount = 0;

window.addEventListener(librarySessionService.indexReadEventName, () => {
  indexReadEventCount += 1;
  // Mirrors App's synchronous event listener. The service must prevent recursive event loops.
  librarySessionService.recordIndexRead(currentReadResult);
});

const selectedRoot = {
  ok: true,
  libraryType: 'asmr',
  displayName: 'U28 空资源库',
  rootPathToken: 'session-only-token',
};

const authorizeCurrentWindow = () => {
  sessionStorage.setItem(librarySessionService.currentWindowRootSessionKey, JSON.stringify({
    asmr: {
      rootPathToken: selectedRoot.rootPathToken,
      displayName: selectedRoot.displayName,
      libraryType: selectedRoot.libraryType,
      selectedAt: '2026-07-14T11:58:00.000Z',
    },
  }));
};

const emptyIndexResult = {
  ok: true,
  libraryType: 'asmr',
  displayName: 'U28 空资源库',
  indexRelativePath: 'library-index.json',
  readAt: '2026-07-14T12:00:00.000Z',
  message: '合法空 Index 读取成功。',
  index: {
    generatedAt: '2026-07-14T11:59:00.000Z',
  },
  summary: {
    rootCount: 0,
    collectionCount: 0,
    trackCount: 0,
    warningCount: 0,
  },
  bytesRead: 2,
  sha256: 'u28-empty-index',
};

librarySessionService.recordRootSelected(selectedRoot);
authorizeCurrentWindow();
currentReadResult = emptyIndexResult;
librarySessionService.recordIndexRead(currentReadResult);
let snapshot = librarySessionService.getSnapshot();

if (!librarySessionService.hasCurrentWindowAuthorization()) {
  throw new Error('当前窗口授权未被会话服务识别。');
}
if (!snapshot.lastIndex) throw new Error('合法空 Index 被错误视为未读取。');
if (snapshot.lastIndex.trackCount !== 0 || snapshot.lastIndex.collectionCount !== 0) {
  throw new Error('合法空 Index 的零计数未被保留。');
}
if (snapshot.lastReadAttempt?.status !== 'loaded') {
  throw new Error('合法空 Index 未记录为 loaded。');
}
if (indexReadEventCount !== 1) {
  throw new Error(`空 Index 跨页面事件应触发一次，实际为 ${indexReadEventCount} 次。`);
}

// Simulate a full application restart: localStorage persists, sessionStorage authorization does not.
sessionStorage.clear();
snapshot = librarySessionService.getSnapshot();
if (librarySessionService.hasCurrentWindowAuthorization()) {
  throw new Error('重启后仍错误保留当前窗口目录授权。');
}
if (snapshot.lastIndex !== undefined || snapshot.lastReadAttempt !== undefined) {
  throw new Error('重启后旧 Index 仍被冒充为当前已连接资源库。');
}

// The real UI records root selection before writing the new session token.
librarySessionService.recordRootSelected(selectedRoot);
authorizeCurrentWindow();
snapshot = librarySessionService.getSnapshot();
if (snapshot.lastIndex !== undefined) {
  throw new Error('重新授权后未重新读取 Index，却恢复了上一次成功状态。');
}

currentReadResult = emptyIndexResult;
librarySessionService.recordIndexRead(currentReadResult);
snapshot = librarySessionService.getSnapshot();
if (!snapshot.lastIndex || snapshot.lastReadAttempt?.status !== 'loaded') {
  throw new Error('重新授权并读取后，空 Index 未恢复为 loaded。');
}
if (indexReadEventCount !== 2) {
  throw new Error(`第二次空 Index 读取后事件累计应为两次，实际为 ${indexReadEventCount} 次。`);
}

currentReadResult = {
  ok: false,
  message: 'library-index.json 不存在或不可读。',
};
librarySessionService.recordIndexRead(currentReadResult);
snapshot = librarySessionService.getSnapshot();

if (snapshot.lastIndex !== undefined) {
  throw new Error('读取失败后仍残留上一次成功 Index，状态会产生误导。');
}
if (snapshot.lastReadAttempt?.status !== 'failed') {
  throw new Error('读取失败未与合法空 Index 明确区分。');
}
if (indexReadEventCount !== 3) {
  throw new Error(`失败状态跨页面事件累计应为三次，实际为 ${indexReadEventCount} 次。`);
}

console.log('PASS\tempty index is a loaded resource library');
console.log('PASS\tfailed read is distinct from an empty index');
console.log('PASS\tcross-page event is recursion-safe');
console.log('PASS\trestart requires current-window reauthorization');
console.log('PASS\treauthorization does not resurrect stale index state');
console.log('U28 library reconciliation verifier passed.');