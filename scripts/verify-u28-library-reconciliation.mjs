import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const settings = fs.readFileSync('src/components/SettingsPageDaily.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const router = fs.readFileSync('src/app/AppRouter.tsx', 'utf8');
const topBar = fs.readFileSync('src/app/TopBar.tsx', 'utf8');
const shell = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');
const sessionServiceSource = fs.readFileSync('src/services/librarySessionService.ts', 'utf8');
const coordinator = fs.readFileSync('src/services/libraryReadCoordinatorService.ts', 'utf8');

const checks = [
  ['daily settings owns persisted root authorization', settings.includes('yang_kura_persisted_authorized_roots_v1') && settings.includes('localStorage.setItem(PERSISTED_ROOT_KEY')],
  ['daily settings uses shared read coordinator', settings.includes('libraryReadCoordinatorService.read')],
  ['stale ASMR state is replaced', app.includes('rjWorksBaseRef.current = mapped.rjWorks') && !app.includes('if (mapped.rjWorks.length > 0)')],
  ['stale music state is replaced', app.includes('musicAlbumsBaseRef.current = mapped.musicAlbums')],
  ['real index refresh replaces both libraries', app.includes('setRjWorks(metadataOverrideService.applyAsmrOverrides(mapped.rjWorks))') && app.includes('setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums))')],
  ['router uses shared read state', router.includes('LibraryReadStateNotice') && router.includes("readAttempt?.status === 'reading'")],
  ['top bar uses shared read state', topBar.includes('data-u40d-library-status') && topBar.includes("attempt?.status === 'reading'")],
  ['session service records full read lifecycle', ['reading', 'loaded', 'failed', 'timed-out', 'interrupted'].every((status) => sessionServiceSource.includes(`'${status}'`))],
  ['session service owns cross-page index event', sessionServiceSource.includes("const INDEX_READ_EVENT_NAME = 'yang-kura-library-index-loaded'") && sessionServiceSource.includes('emitIndexReadUpdated()')],
  ['session service accepts persisted authorization', sessionServiceSource.includes("const PERSISTED_ROOT_SESSION_KEY = 'yang_kura_persisted_authorized_roots_v1'")],
  ['coordinator has timeout and stale-operation protection', coordinator.includes('DEFAULT_TIMEOUT_MS = 120_000') && coordinator.includes('persistIfCurrent') && coordinator.includes('activeOperationId !== currentOperationId')],
  ['historical diagnostics runtime is archived', shell.includes('data-u40d-maintenance-runtime="current-only"') && !shell.includes("import('./DiagnosticsPage')")],
  ['daily settings does not expose implementation terminology', !settings.includes('Renderer') && !settings.includes('contract') && !settings.includes('npm run')],
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
let indexReadEventCount = 0;
window.addEventListener(librarySessionService.indexReadEventName, () => {
  indexReadEventCount += 1;
});

const selectedRoot = {
  ok: true,
  libraryType: 'asmr',
  displayName: 'U28 资源库',
  rootPathToken: 'persisted-token',
};
const rootEntry = {
  rootPathToken: selectedRoot.rootPathToken,
  displayName: selectedRoot.displayName,
  libraryType: selectedRoot.libraryType,
  selectedAt: '2026-07-14T11:58:00.000Z',
};
localStorage.setItem('yang_kura_persisted_authorized_roots_v1', JSON.stringify({ asmr: rootEntry }));
librarySessionService.recordRootSelected(selectedRoot);

const successResult = {
  ok: true,
  libraryType: 'asmr',
  displayName: selectedRoot.displayName,
  indexRelativePath: 'library-index.json',
  readAt: '2026-07-14T12:00:00.000Z',
  message: '资源库读取成功。',
  index: { generatedAt: '2026-07-14T11:59:00.000Z' },
  summary: { rootCount: 1, collectionCount: 3, trackCount: 12, warningCount: 0 },
  bytesRead: 200,
  sha256: 'first-index',
};

librarySessionService.recordIndexReadStarted({ operationId: 'read-1', libraryType: 'asmr', displayName: selectedRoot.displayName });
librarySessionService.recordIndexRead(successResult, 'read-1');
let snapshot = librarySessionService.getSnapshot();
if (snapshot.lastReadAttempt?.status !== 'loaded' || snapshot.lastIndex?.trackCount !== 12) {
  throw new Error('成功读取没有收敛到 loaded。');
}
if (indexReadEventCount !== 1) throw new Error(`首次成功读取应触发一次跨页面事件，实际 ${indexReadEventCount}。`);

librarySessionService.recordIndexReadStarted({ operationId: 'read-2', libraryType: 'asmr', displayName: selectedRoot.displayName });
librarySessionService.recordIndexReadTimedOut({ operationId: 'read-2', libraryType: 'asmr', displayName: selectedRoot.displayName, message: '等待超过 120 秒。' });
snapshot = librarySessionService.getSnapshot();
if (snapshot.lastReadAttempt?.status !== 'timed-out') throw new Error('读取超时没有收敛到 timed-out。');
if (snapshot.lastIndex?.sha256 !== 'first-index') throw new Error('超时错误清除了仍可用的上一次成功资源库。');

librarySessionService.recordIndexReadStarted({ operationId: 'read-3', libraryType: 'asmr', displayName: selectedRoot.displayName });
librarySessionService.recordIndexRead({ ...successResult, sha256: 'stale-read-2' }, 'read-2');
snapshot = librarySessionService.getSnapshot();
if (snapshot.lastIndex?.sha256 !== 'first-index' || snapshot.lastReadAttempt?.operationId !== 'read-3') {
  throw new Error('较旧读取结果覆盖了较新的读取会话。');
}

librarySessionService.recordIndexRead({ ok: false, message: 'library-index.json 暂时不可读。' }, 'read-3');
snapshot = librarySessionService.getSnapshot();
if (snapshot.lastReadAttempt?.status !== 'failed') throw new Error('读取失败没有收敛到 failed。');
if (snapshot.lastIndex?.sha256 !== 'first-index') throw new Error('读取失败错误清除了上一次成功资源库。');
if (indexReadEventCount !== 1) throw new Error('失败状态不应伪装成新的 Index 加载事件。');

librarySessionService.recordIndexReadStarted({ operationId: 'read-4', libraryType: 'asmr', displayName: selectedRoot.displayName });
librarySessionService.recordIndexRead({ ...successResult, sha256: 'second-index', summary: { ...successResult.summary, trackCount: 13 } }, 'read-4');
snapshot = librarySessionService.getSnapshot();
if (snapshot.lastReadAttempt?.status !== 'loaded' || snapshot.lastIndex?.trackCount !== 13) {
  throw new Error('重试成功没有覆盖失败状态。');
}
if (indexReadEventCount !== 2) throw new Error(`两次成功读取应累计两个事件，实际 ${indexReadEventCount}。`);

sessionStorage.clear();
snapshot = librarySessionService.getSnapshot();
if (!librarySessionService.hasCurrentWindowAuthorization()) throw new Error('持久授权在重启模拟后丢失。');
if (snapshot.lastIndex?.sha256 !== 'second-index') throw new Error('持久授权重启后错误丢失已加载状态。');

console.log('PASS\tshared read lifecycle converges');
console.log('PASS\ttimeout and failure preserve last usable library');
console.log('PASS\tstale late results are ignored');
console.log('PASS\tpersisted authorization survives restart');
console.log('U28 library reconciliation verifier passed.');
