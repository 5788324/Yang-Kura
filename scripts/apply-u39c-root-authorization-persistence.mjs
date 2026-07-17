import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

function filePath(relativePath) {
  return path.join(cwd, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), 'utf8');
}

function write(relativePath, content) {
  const target = filePath(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const normalized = content.endsWith('\n') ? content : `${content}\n`;
  if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === normalized) return;
  fs.writeFileSync(target, normalized, 'utf8');
}

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Missing patch anchor: ${label}`);
  return source.replace(before, after);
}

function insertAfter(source, anchor, insertion, label) {
  if (source.includes(insertion.trim())) return source;
  if (!source.includes(anchor)) throw new Error(`Missing insertion anchor: ${label}`);
  return source.replace(anchor, `${anchor}${insertion}`);
}

function appendBefore(source, anchor, section, label) {
  if (source.includes(section.trim().split('\n')[0])) return source;
  if (!source.includes(anchor)) throw new Error(`Missing section anchor: ${label}`);
  return source.replace(anchor, `${section}\n\n${anchor}`);
}

const rootAuthorizationStoreSource = `import fs from 'node:fs/promises';
import path from 'node:path';

export type RootAuthorizationLibraryType = 'asmr' | 'music' | 'mixed';

export interface RootAuthorizationRecord {
  rootPathToken: string;
  absolutePath: string;
  displayName: string;
  libraryType: RootAuthorizationLibraryType;
  selectedAt: string;
}

interface RootAuthorizationFileV1 {
  schemaVersion: 1;
  updatedAt: string;
  records: RootAuthorizationRecord[];
}

interface AuthorizeRootInput {
  absolutePath: string;
  displayName: string;
  libraryType: RootAuthorizationLibraryType;
  createToken: () => string;
}

const TOKEN_PREFIX = 'rootPathToken:';
const TOKEN_PATTERN = /^yk-root-[A-Za-z0-9-]{8,}$/;

function isLibraryType(value: unknown): value is RootAuthorizationLibraryType {
  return value === 'asmr' || value === 'music' || value === 'mixed';
}

function normalizeAbsolutePath(value: string): string {
  if (!path.isAbsolute(value)) throw new Error('Root authorization paths must be absolute.');
  return path.resolve(value);
}

function pathKey(value: string): string {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isValidToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

function parseRecord(value: unknown): RootAuthorizationRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Partial<RootAuthorizationRecord>;
  if (!isValidToken(candidate.rootPathToken)) return null;
  if (typeof candidate.absolutePath !== 'string' || !path.isAbsolute(candidate.absolutePath)) return null;
  if (typeof candidate.displayName !== 'string' || !candidate.displayName.trim()) return null;
  if (!isLibraryType(candidate.libraryType)) return null;
  return {
    rootPathToken: candidate.rootPathToken,
    absolutePath: path.resolve(candidate.absolutePath),
    displayName: candidate.displayName.trim(),
    libraryType: candidate.libraryType,
    selectedAt: typeof candidate.selectedAt === 'string' ? candidate.selectedAt : new Date(0).toISOString(),
  };
}

export class RootAuthorizationStore {
  private readonly records = new Map<string, RootAuthorizationRecord>();

  constructor(private readonly authorizationFilePath: string) {}

  async initialize(): Promise<RootAuthorizationRecord[]> {
    this.records.clear();
    try {
      const raw = await fs.readFile(this.authorizationFilePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<RootAuthorizationFileV1>;
      if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.records)) return [];
      const occupiedPaths = new Set<string>();
      for (const rawRecord of parsed.records) {
        const record = parseRecord(rawRecord);
        if (!record) continue;
        const key = record.libraryType + ':' + pathKey(record.absolutePath);
        if (occupiedPaths.has(key) || this.records.has(record.rootPathToken)) continue;
        occupiedPaths.add(key);
        this.records.set(record.rootPathToken, record);
      }
    } catch {
      this.records.clear();
    }
    return this.list();
  }

  list(): RootAuthorizationRecord[] {
    return Array.from(this.records.values()).map((record) => ({ ...record }));
  }

  async authorize(input: AuthorizeRootInput): Promise<RootAuthorizationRecord> {
    const absolutePath = normalizeAbsolutePath(input.absolutePath);
    const normalizedKey = pathKey(absolutePath);
    const existingByPath = Array.from(this.records.values()).find(
      (record) => record.libraryType === input.libraryType && pathKey(record.absolutePath) === normalizedKey,
    );
    const indexedToken = existingByPath ? null : await this.readTokenFromLibraryIndex(absolutePath, input.libraryType);
    let rootPathToken = existingByPath?.rootPathToken ?? indexedToken ?? input.createToken();
    if (!isValidToken(rootPathToken)) rootPathToken = input.createToken();

    const conflictingRecord = this.records.get(rootPathToken);
    if (conflictingRecord && pathKey(conflictingRecord.absolutePath) !== normalizedKey) {
      rootPathToken = input.createToken();
    }

    for (const [token, record] of this.records) {
      if (record.libraryType === input.libraryType && pathKey(record.absolutePath) === normalizedKey && token !== rootPathToken) {
        this.records.delete(token);
      }
    }

    const record: RootAuthorizationRecord = {
      rootPathToken,
      absolutePath,
      displayName: input.displayName.trim() || path.basename(absolutePath),
      libraryType: input.libraryType,
      selectedAt: new Date().toISOString(),
    };
    this.records.set(rootPathToken, record);
    await this.persist();
    return { ...record };
  }

  private async readTokenFromLibraryIndex(
    absolutePath: string,
    libraryType: RootAuthorizationLibraryType,
  ): Promise<string | null> {
    try {
      const raw = await fs.readFile(path.join(absolutePath, 'library-index.json'), 'utf8');
      const parsed = JSON.parse(raw.replace(/^\uFEFF/, '')) as { roots?: unknown[] };
      if (!Array.isArray(parsed.roots)) return null;
      const roots = parsed.roots.filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value));
      const matchingRoot = roots.find((root) => root.libraryType === libraryType) ?? roots[0];
      const rootPathValue = matchingRoot?.rootPath;
      if (typeof rootPathValue !== 'string' || !rootPathValue.startsWith(TOKEN_PREFIX)) return null;
      const token = rootPathValue.slice(TOKEN_PREFIX.length).trim();
      return isValidToken(token) ? token : null;
    } catch {
      return null;
    }
  }

  private async persist(): Promise<void> {
    const payload: RootAuthorizationFileV1 = {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      records: this.list().sort((left, right) => left.selectedAt.localeCompare(right.selectedAt)),
    };
    await fs.mkdir(path.dirname(this.authorizationFilePath), { recursive: true });
    const temporaryPath = this.authorizationFilePath + '.tmp-' + process.pid + '-' + Date.now();
    try {
      await fs.writeFile(temporaryPath, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
      await fs.rm(this.authorizationFilePath, { force: true });
      await fs.rename(temporaryPath, this.authorizationFilePath);
    } catch (error) {
      await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }
}
`;
write('electron/rootAuthorizationStore.ts', rootAuthorizationStoreSource);

let main = read('electron/main.ts');
main = replaceOnce(
  main,
  "import { MpvSettingsStore } from './mpvSettingsStore.js';",
  "import { MpvSettingsStore } from './mpvSettingsStore.js';\nimport { RootAuthorizationStore } from './rootAuthorizationStore.js';",
  'main import RootAuthorizationStore',
);
main = replaceOnce(
  main,
  "const mpvSettingsStore = new MpvSettingsStore(path.join(stableUserDataPath, 'mpv-settings.json'));",
  "const mpvSettingsStore = new MpvSettingsStore(path.join(stableUserDataPath, 'mpv-settings.json'));\nconst rootAuthorizationStore = new RootAuthorizationStore(path.join(stableUserDataPath, 'root-authorizations.json'));",
  'main root authorization store instance',
);
main = replaceOnce(
  main,
  `    const absolutePath = result.filePaths[0];
    const displayName = path.basename(absolutePath) || getDefaultDisplayName(libraryType);
    const rootPathToken = \`yk-root-\${crypto.randomUUID()}\`;

    rootTokenMap.set(rootPathToken, {
      rootPathToken,
      absolutePath,
      displayName,
      libraryType,
      selectedAt: new Date().toISOString(),
    });`,
  `    const absolutePath = result.filePaths[0];
    const displayName = path.basename(absolutePath) || getDefaultDisplayName(libraryType);
    const rootRecord = await rootAuthorizationStore.authorize({
      absolutePath,
      displayName,
      libraryType,
      createToken: () => \`yk-root-\${crypto.randomUUID()}\`,
    });
    const { rootPathToken } = rootRecord;
    rootTokenMap.set(rootPathToken, rootRecord);`,
  'main persistent root selection',
);
main = replaceOnce(
  main,
  `app.whenReady().then(async () => {
  await mpvSettingsStore.initialize();
  registerMediaProtocol();`,
  `app.whenReady().then(async () => {
  await mpvSettingsStore.initialize();
  const restoredRootRecords = await rootAuthorizationStore.initialize();
  restoredRootRecords.forEach((record) => rootTokenMap.set(record.rootPathToken, record));
  registerMediaProtocol();`,
  'main root authorization hydration',
);
write('electron/main.ts', main);

let settings = read('src/components/SettingsPage.tsx');
settings = replaceOnce(
  settings,
  "const U28_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';",
  "const U28_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';\nconst U39_PERSISTED_ROOTS_KEY = 'yang_kura_persisted_authorized_roots_v1';",
  'settings persisted root key',
);
settings = replaceOnce(
  settings,
  `const getU28RootSessionEntry = (libraryType: YangKuraLibraryType): U28RootSessionEntry | undefined =>
  readU28RootSession()[libraryType];`,
  `const readPersistedRootSession = (): U28RootSessionState => {
  if (typeof localStorage === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(U39_PERSISTED_ROOTS_KEY) ?? '{}') as U28RootSessionState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writePersistedRootSession = (result: YangKuraSelectLibraryRootSuccessResult): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    const previous = readPersistedRootSession();
    localStorage.setItem(U39_PERSISTED_ROOTS_KEY, JSON.stringify({
      ...previous,
      [result.libraryType]: {
        rootPathToken: result.rootPathToken,
        displayName: result.displayName,
        libraryType: result.libraryType,
        selectedAt: new Date().toISOString(),
      },
    }));
  } catch {
    // The current-window session remains usable when persistent browser storage is unavailable.
  }
};

const getU28RootSessionEntry = (libraryType: YangKuraLibraryType): U28RootSessionEntry | undefined =>
  readU28RootSession()[libraryType] ?? readPersistedRootSession()[libraryType];`,
  'settings persisted root helpers',
);
settings = replaceOnce(
  settings,
  `      librarySessionService.recordRootSelected(result);
      writeU28RootSession(result);`,
  `      writeU28RootSession(result);
      writePersistedRootSession(result);
      librarySessionService.recordRootSelected(result);`,
  'settings persist root selection before session snapshot',
);
write('src/components/SettingsPage.tsx', settings);

let sessionService = read('src/services/librarySessionService.ts');
sessionService = replaceOnce(
  sessionService,
  "const CURRENT_WINDOW_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';",
  "const CURRENT_WINDOW_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';\nconst PERSISTED_ROOT_SESSION_KEY = 'yang_kura_persisted_authorized_roots_v1';",
  'library session persisted root key',
);
sessionService = replaceOnce(
  sessionService,
  `const hasCurrentWindowAuthorization = (): boolean => {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CURRENT_WINDOW_ROOT_SESSION_KEY) ?? '{}') as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    return Object.values(parsed).some((value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const rootPathToken = (value as { rootPathToken?: unknown }).rootPathToken;
      return typeof rootPathToken === 'string' && rootPathToken.trim().length > 0;
    });
  } catch {
    return false;
  }
};`,
  `const storageHasAuthorization = (storage: Storage, key: string): boolean => {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? '{}') as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
    return Object.values(parsed).some((value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const rootPathToken = (value as { rootPathToken?: unknown }).rootPathToken;
      return typeof rootPathToken === 'string' && rootPathToken.trim().length > 0;
    });
  } catch {
    return false;
  }
};

const hasCurrentWindowAuthorization = (): boolean => {
  if (typeof sessionStorage !== 'undefined' && storageHasAuthorization(sessionStorage, CURRENT_WINDOW_ROOT_SESSION_KEY)) return true;
  if (typeof localStorage !== 'undefined' && storageHasAuthorization(localStorage, PERSISTED_ROOT_SESSION_KEY)) return true;
  return false;
};`,
  'library session persistent authorization boundary',
);
sessionService = sessionService.replace(
  '重启后请先重新选择该目录，再点“读取现有 index”。',
  '授权已保存在本机，可在重启后继续读取和播放。',
);
sessionService = sessionService.replace(
  '打包版重启后需要重新选择目录以恢复权限。',
  '授权已保存在本机，重启后会自动恢复。',
);
write('src/services/librarySessionService.ts', sessionService);

let u28 = read('scripts/test-u28-electron-e2e.mjs');
u28 = replaceOnce(
  u28,
  `  runtime = await launchApp(fixtureDir, profileDir);
  try {
    await waitForBodyText(runtime.cdp, '资源库待重新连接');
    await expectBodyExcludes(runtime.cdp, '已加载 0 条音轨');
    await expectBodyExcludes(runtime.cdp, '已连接空资源库');
    await screenshot(runtime.cdp, '08-restart-reauthorization-required');

    await selectAsmrRoot(runtime.cdp);
    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '等待读取资源库');
    await expectBodyExcludes(runtime.cdp, '已连接空资源库');

    await openSettingsPaths(runtime.cdp);
    await readAsmrIndex(runtime.cdp);
    await waitForBodyText(runtime.cdp, '文件编码：utf8-bom');
    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '已连接空资源库');
    await expectBodyContains(runtime.cdp, '已加载 0 条音轨');
    await screenshot(runtime.cdp, '09-restart-reread-empty-index');
    await assertNoRendererExceptions(runtime, 'restart');
    report.scenarios.push({ name: 'restart-reauthorize-reread', status: 'PASS' });
  } finally {
    await closeApp(runtime);
  }`,
  `  const authorizationFile = path.join(profileDir, 'Yang-Kura', 'root-authorizations.json');
  assert.ok(fs.existsSync(authorizationFile), '主进程未持久化 root authorization 文件');
  const authorizationState = JSON.parse(fs.readFileSync(authorizationFile, 'utf8'));
  assert.equal(authorizationState.schemaVersion, 1, 'root authorization schemaVersion 异常');
  assert.equal(authorizationState.records?.length, 1, 'root authorization 记录数量异常');
  assert.ok(authorizationState.records[0].rootPathToken.startsWith('yk-root-'), '持久化 token 格式异常');

  runtime = await launchApp(fixtureDir, profileDir);
  try {
    await waitForBodyText(runtime.cdp, '已连接空资源库');
    await expectBodyContains(runtime.cdp, '已加载 0 条音轨');
    await screenshot(runtime.cdp, '08-restart-authorization-restored');

    await openSettingsPaths(runtime.cdp);
    await waitForBodyText(runtime.cdp, '已选择目录，可读取已有记录或重新扫描');
    const enabled = await runtime.cdp.evaluate(\`(() => [...document.querySelectorAll('button')].some((button) => button.offsetParent !== null && button.textContent?.trim() === '读取已有记录' && !button.disabled))()\`);
    assert.equal(enabled, true, '重启后读取按钮必须直接可用');
    await readAsmrIndex(runtime.cdp);
    await waitForBodyText(runtime.cdp, '文件编码：utf8-bom');
    await navigate(runtime.cdp, 'dashboard');
    await waitForBodyText(runtime.cdp, '已连接空资源库');
    await expectBodyContains(runtime.cdp, '已加载 0 条音轨');
    await screenshot(runtime.cdp, '09-restart-reread-empty-index');
    await assertNoRendererExceptions(runtime, 'restart persisted authorization');
    report.scenarios.push({ name: 'restart-persisted-authorization-reread', status: 'PASS' });
  } finally {
    await closeApp(runtime);
  }`,
  'U28 restart authorization scenario',
);
u28 = replaceOnce(
  u28,
  `  const runtime = await launchApp(fixtureDir, profileDir);
  try {
    await selectAsmrRoot(runtime.cdp);
    const rootPathToken = await runtime.cdp.evaluate(\`(() => { const value = JSON.parse(sessionStorage.getItem(\${JSON.stringify(ROOT_SESSION_KEY)}) ?? '{}'); return value.asmr?.rootPathToken ?? ''; })()\`);`,
  `  let rootPathToken = '';
  let runtime = await launchApp(fixtureDir, profileDir);
  try {
    await selectAsmrRoot(runtime.cdp);
    rootPathToken = await runtime.cdp.evaluate(\`(() => { const value = JSON.parse(sessionStorage.getItem(\${JSON.stringify(ROOT_SESSION_KEY)}) ?? '{}'); return value.asmr?.rootPathToken ?? ''; })()\`);`,
  'U28 populated scenario mutable runtime',
);
u28 = replaceOnce(
  u28,
  `    report.scenarios.push({ name: 'populated-index-media-playback', status: 'PASS', mediaProbe });
  } finally {
    await closeApp(runtime);
  }
}`,
  `    report.scenarios.push({ name: 'populated-index-media-playback', status: 'PASS', mediaProbe });
  } finally {
    await closeApp(runtime);
  }

  runtime = await launchApp(fixtureDir, profileDir);
  try {
    await waitForBodyText(runtime.cdp, '已连接本地资源库');
    await expectBodyContains(runtime.cdp, '已加载 1 条音轨');
    const restartMediaProbe = await runtime.cdp.evaluate(\`(async () => {
      const url = 'yang-kura-media://track/' + encodeURIComponent(\${JSON.stringify(rootPathToken)}) + '/' + encodeURIComponent('sample.wav');
      const response = await fetch(url);
      const body = new Uint8Array(await response.arrayBuffer());
      return { ok: response.ok, status: response.status, byteLength: body.byteLength, riff: String.fromCharCode(...body.slice(0, 4)) };
    })()\`, true);
    assert.equal(restartMediaProbe.ok, true, '重启后受控媒体协议读取失败');
    assert.equal(restartMediaProbe.status, 200, '重启后媒体协议状态码异常');
    assert.equal(restartMediaProbe.byteLength, wavSize, '重启后媒体协议字节数不一致');
    assert.equal(restartMediaProbe.riff, 'RIFF', '重启后媒体协议未返回 WAV');

    await navigate(runtime.cdp, 'asmr-lib');
    await waitForBodyText(runtime.cdp, WORK_TITLE);
    await clickVisibleText(runtime.cdp, WORK_TITLE, '*');
    await waitForBodyText(runtime.cdp, '播放全部音声');
    await clickSelector(runtime.cdp, '#play-all-asmr');
    await waitForBodyText(runtime.cdp, TRACK_TITLE);
    await delay(900);
    const restartPlayerText = await runtime.cdp.evaluate(\`document.querySelector('#app-player-bar')?.innerText ?? ''\`);
    assert.ok(restartPlayerText.includes(TRACK_TITLE), '重启后 PlayerBar 未显示真实音轨');
    assert.ok(!restartPlayerText.includes('播放失败：'), \`重启后真实 WAV 播放失败：\${restartPlayerText}\`);
    await screenshot(runtime.cdp, '15-populated-restart-playback');
    await assertNoRendererExceptions(runtime, 'populated restart playback');
    report.scenarios.push({ name: 'restart-persisted-authorization-playback', status: 'PASS', restartMediaProbe });
  } finally {
    await closeApp(runtime);
  }
}`,
  'U28 populated restart playback scenario',
);
write('scripts/test-u28-electron-e2e.mjs', u28);

const verifierSource = `import fs from 'node:fs';

const checks = [
  ['electron/rootAuthorizationStore.ts', 'export class RootAuthorizationStore'],
  ['electron/rootAuthorizationStore.ts', "path.join(absolutePath, 'library-index.json')"],
  ['electron/rootAuthorizationStore.ts', "mode: 0o600"],
  ['electron/main.ts', "import { RootAuthorizationStore } from './rootAuthorizationStore.js';"],
  ['electron/main.ts', "new RootAuthorizationStore(path.join(stableUserDataPath, 'root-authorizations.json'))"],
  ['electron/main.ts', 'await rootAuthorizationStore.initialize()'],
  ['electron/main.ts', 'await rootAuthorizationStore.authorize({'],
  ['src/components/SettingsPage.tsx', 'yang_kura_persisted_authorized_roots_v1'],
  ['src/services/librarySessionService.ts', 'PERSISTED_ROOT_SESSION_KEY'],
  ['scripts/test-u28-electron-e2e.mjs', 'restart-persisted-authorization-reread'],
  ['scripts/test-u28-electron-e2e.mjs', 'restart-persisted-authorization-playback'],
];

const failures = [];
for (const [file, token] of checks) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) failures.push(file + ' missing ' + token);
}
const rendererFiles = ['src/components/SettingsPage.tsx', 'src/services/librarySessionService.ts'];
for (const file of rendererFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (/absolutePath\s*:/.test(source)) failures.push(file + ' must not persist absolutePath in Renderer');
}
if (fs.readFileSync('scripts/test-u28-electron-e2e.mjs', 'utf8').includes('restart-reauthorize-reread')) {
  failures.push('U28 still treats restart reauthorization as the expected behavior');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-u39c-root-authorization-persistence] PASS');
`;
write('scripts/verify-u39c-root-authorization-persistence.mjs', verifierSource);

const architectureDoc = `# U39-C 资源库授权持久化与重启恢复

## 问题

Electron Main 过去只在内存的 \`rootTokenMap\` 中保存 \`rootPathToken → absolutePath\`。Renderer 会持久化 tokenized Index、播放队列和最近播放，但应用重启后 Main 的映射为空，导致同一个旧 token 无法继续解析 Index、媒体 URL、mpv 或字幕。

U39 综合 Windows 审计因此把“真实资源库重启后恢复播放”判定为 Blocker。

## 修复

- 新增 \`electron/rootAuthorizationStore.ts\`；
- 授权记录保存在 Electron 用户数据目录的 \`root-authorizations.json\`；
- 文件只在 Main 进程读写，Renderer 只保存 token、显示名、资源库类型和选择时间；
- 启动时先恢复授权记录，再注册媒体协议和创建窗口；
- 用户重新选择既有资源库时，优先复用已保存 token；若没有记录，则从现有 \`library-index.json\` 的 \`rootPathToken:\` 字段接管旧 token；
- 同一目录不会不断生成新 token；token 与另一个路径冲突时会生成新 token。

## 升级行为

旧版本从未保存 absolute path，因此升级后的第一次启动无法无提示恢复旧授权。用户只需重新选择原目录一次；U39-C 会从现有 Index 接管旧 token 并持久化。之后重启无需再次选择目录。

## 隐私边界

- absolute path 只保存在本机 Electron 用户数据目录和 Main 内存；
- Renderer、Index 返回值、日志和 UI 不接收 absolute path 或 \`file://\`；
- 授权文件使用仅当前用户可读写的文件模式请求；
- 本轮不修改媒体文件、Index 内容或导入事务。

## 验证

- TypeScript 与 Renderer/Electron 生产构建；
- U39-C 定向 verifier；
- U28 Electron E2E：重启后无需重选即可读取空 Index，真实 WAV 媒体协议与播放继续可用；
- U29 Electron E2E：播放器、Seek、队列、字幕和续播；
- Windows portable/NSIS 与安装数据保留门禁。
`;
write('docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md', architectureDoc);

let readme = read('README.md');
readme = readme.replace(/^> 当前阶段：.*$/m, '> 当前阶段：U39-C 真实资源库重启授权修复完成；真实 Bug 和日常体验优先');
readme = appendBefore(
  readme,
  '## 快速开发模式',
  `## U39-C 资源库授权持久化

- Electron Main 将 root token 与用户选择目录的映射保存在本机用户数据目录，重启后自动恢复。
- 重新选择既有资源库时会复用授权记录，或从现有 Index 接管旧 token，避免“读取成功但播放仍使用旧 token”。
- Renderer 只保存 token、显示名、资源库类型和选择时间，不保存绝对路径。
- 旧版本升级后需要重新选择原目录一次；之后无需每次重启重新授权。
- U28 已覆盖重启后直接读取和真实 WAV 播放。`,
  'README U39-C section',
);
write('README.md', readme);

let projectState = read('PROJECT_STATE.md');
projectState = insertAfter(
  projectState,
  'U39-B：设置与 AI 维护入口边界完成\n',
  'U39-C：资源库授权持久化与重启读取/播放恢复完成\n',
  'PROJECT_STATE U39-C status',
);
projectState = projectState.replace('当前任务：日常体验与真实 Bug 优先', '当前任务：U39 审计 Major/Minor 问题继续按优先级修复');
projectState = appendBefore(
  projectState,
  '## 快速开发模式',
  `## U39-C 真实资源库重启恢复

- 根因：Main 端 \`rootTokenMap\` 仅在内存中，重启后旧 token 失效。
- 修复：\`root-authorizations.json\` 在 Electron 用户数据目录持久化授权映射，启动时恢复。
- 兼容：重新选择旧资源库时从现有 Index 接管旧 token，避免 token 漂移。
- Renderer 仍不保存或显示绝对路径。
- U28 新增重启后无需重选即可读取和播放的真实 Electron 场景。`,
  'PROJECT_STATE U39-C section',
);
write('PROJECT_STATE.md', projectState);

let roadmap = read('PROJECT_ROADMAP.md');
roadmap = insertAfter(
  roadmap,
  'U39-B：设置与 AI 维护入口边界完成\n',
  'U39-C：资源库授权持久化与重启恢复完成\n',
  'ROADMAP U39-C baseline',
);
roadmap = roadmap.replace('当前任务：真实 Bug、字幕体验与日常 UI 优先', '当前任务：U39 审计 Major/Minor 问题继续按优先级修复');
roadmap = appendBefore(
  roadmap,
  '### Beta 2 个人日用版发布 — 已完成',
  `### U39-C：真实资源库重启授权 — 已完成

- Main 端持久化 root token 授权映射；
- 重新选择旧目录时接管 Index 既有 token；
- Renderer 持久化脱敏授权摘要；
- U28 覆盖重启后直接读取与播放；
- 不修改媒体文件或 Index 内容。`,
  'ROADMAP U39-C completed section',
);
write('PROJECT_ROADMAP.md', roadmap);

let handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
handoff = insertAfter(
  handoff,
  'U39-B：设置与 AI 维护入口边界完成\n',
  'U39-C：资源库授权持久化与重启恢复完成\n',
  'handoff U39-C status',
);
handoff = handoff.replace('当前任务：真实 Bug、字幕体验和日常 UI 优先', '当前任务：继续修复 U39 审计 Major/Minor 问题');
handoff = insertAfter(
  handoff,
  '- U39-B：设置页顶部新增独立 AI 维护入口；Diagnostics 继续两阶段按需加载，并可返回设置。\n',
  '- U39-C：Main 持久化 root token 授权映射，重新选择旧目录时接管 Index token，重启后可直接读取和播放。\n',
  'handoff U39-C completed fact',
);
handoff = insertAfter(
  handoff,
  '8. `docs/architecture/U39_MAINTENANCE_ENTRY.md`\n',
  '9. `docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md`\n',
  'handoff U39-C reading order',
);
write('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff);

let worklog = read('AI_HANDOFF/WORKLOG.md');
worklog = appendBefore(
  worklog,
  '## 当前结论',
  `### U39-C — 资源库授权持久化与重启恢复

- 根因：Electron Main 的 root token 映射仅存在于内存，重启后 Index、媒体协议、mpv 和字幕无法解析旧 token。
- 新增 \`RootAuthorizationStore\`，在用户数据目录持久化并启动恢复授权记录。
- 重新选择既有资源库时复用存储记录，或从现有 Index 接管旧 token。
- Renderer 持久化脱敏授权摘要，Library Session 不再把正常重启误判为必须重新授权。
- U28 改为验证重启后无需重选即可读取空 Index，并继续读取真实 WAV 与播放。
- U29、构建和 Windows 打包链用于回归验证。`,
  'WORKLOG U39-C section',
);
worklog = worklog.replace('U39-B：设置与 AI 维护入口边界完成\n', 'U39-B：设置与 AI 维护入口边界完成\nU39-C：资源库授权持久化与重启恢复完成\n');
worklog = worklog.replace('当前任务：真实 Bug、字幕体验与日常 UI 优先', '当前任务：继续修复 U39 审计 Major/Minor 问题');
write('AI_HANDOFF/WORKLOG.md', worklog);

let verifyHandoff = read('scripts/verify-handoff.mjs');
verifyHandoff = insertAfter(
  verifyHandoff,
  "  'docs/architecture/U39_MAINTENANCE_ENTRY.md',\n",
  "  'docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md',\n",
  'verify-handoff U39-C doc',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  'scripts/verify-u39b-maintenance-entry.mjs',\n",
  "  'scripts/verify-u39c-root-authorization-persistence.mjs',\n",
  'verify-handoff U39-C verifier',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  ['README.md', 'U39-B 设置与 AI 维护入口'],\n",
  "  ['README.md', 'U39-C 资源库授权持久化'],\n",
  'verify-handoff README U39-C token',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  ['PROJECT_STATE.md', 'U39-B：设置与 AI 维护入口边界完成'],\n",
  "  ['PROJECT_STATE.md', 'U39-C：资源库授权持久化与重启读取/播放恢复完成'],\n",
  'verify-handoff PROJECT_STATE U39-C token',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  ['PROJECT_ROADMAP.md', 'U39-B：设置与 AI 维护入口边界完成'],\n",
  "  ['PROJECT_ROADMAP.md', 'U39-C：资源库授权持久化与重启恢复完成'],\n",
  'verify-handoff ROADMAP U39-C token',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U39-B：设置与 AI 维护入口边界完成'],\n",
  "  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U39-C：资源库授权持久化与重启恢复完成'],\n",
  'verify-handoff handoff U39-C token',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  ['AI_HANDOFF/WORKLOG.md', '### U39-B — 设置与 AI 维护入口边界'],\n",
  "  ['AI_HANDOFF/WORKLOG.md', '### U39-C — 资源库授权持久化与重启恢复'],\n",
  'verify-handoff worklog U39-C token',
);
verifyHandoff = insertAfter(
  verifyHandoff,
  "  ['docs/architecture/U39_MAINTENANCE_ENTRY.md', '完整历史诊断按需加载'],\n",
  "  ['docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md', '# U39-C 资源库授权持久化与重启恢复'],\n  ['docs/architecture/U39_ROOT_AUTHORIZATION_PERSISTENCE.md', '重启无需再次选择目录'],\n",
  'verify-handoff architecture U39-C tokens',
);
verifyHandoff = verifyHandoff.replace("console.log('[verify-handoff] U39-B maintenance entry handoff PASS');", "console.log('[verify-handoff] U39-C root authorization persistence handoff PASS');");
write('scripts/verify-handoff.mjs', verifyHandoff);

console.log('U39-C root authorization persistence patch applied.');
