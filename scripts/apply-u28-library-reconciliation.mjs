import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content, 'utf8');

function replaceOnce(content, search, replacement, label) {
  const index = content.indexOf(search);
  if (index < 0) throw new Error(`U28 patch target not found: ${label}`);
  if (content.indexOf(search, index + search.length) >= 0) {
    throw new Error(`U28 patch target is ambiguous: ${label}`);
  }
  return content.slice(0, index) + replacement + content.slice(index + search.length);
}

function replaceRegexOnce(content, pattern, replacement, label) {
  const matches = [...content.matchAll(new RegExp(pattern.source, `${pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`}`))];
  if (matches.length !== 1) throw new Error(`U28 regex target count ${matches.length}: ${label}`);
  return content.replace(pattern, replacement);
}

const settingsPath = 'src/components/SettingsPage.tsx';
let settings = read(settingsPath);

const propsBlock = `interface SettingsPageProps {
  settings: LibrarySettings;
  updateSettings: (updates: Partial<LibrarySettings>) => void;
}
`;
const propsReplacement = `${propsBlock}
const U28_ROOT_SESSION_KEY = 'yang_kura_u28_authorized_roots_v1';

type U28RootSessionEntry = {
  rootPathToken: string;
  displayName: string;
  libraryType: YangKuraLibraryType;
  selectedAt: string;
};

type U28RootSessionState = Partial<Record<YangKuraLibraryType, U28RootSessionEntry>>;

const readU28RootSession = (): U28RootSessionState => {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const parsed = JSON.parse(sessionStorage.getItem(U28_ROOT_SESSION_KEY) ?? '{}') as U28RootSessionState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeU28RootSession = (result: YangKuraSelectLibraryRootSuccessResult): void => {
  if (typeof sessionStorage === 'undefined') return;
  const previous = readU28RootSession();
  sessionStorage.setItem(U28_ROOT_SESSION_KEY, JSON.stringify({
    ...previous,
    [result.libraryType]: {
      rootPathToken: result.rootPathToken,
      displayName: result.displayName,
      libraryType: result.libraryType,
      selectedAt: new Date().toISOString(),
    },
  }));
};

const getU28RootSessionEntry = (libraryType: YangKuraLibraryType): U28RootSessionEntry | undefined =>
  readU28RootSession()[libraryType];
`;
settings = replaceOnce(settings, propsBlock, propsReplacement, 'SettingsPage session helpers');

settings = replaceOnce(
  settings,
  `  const [newAsmrLabel, setNewAsmrLabel] = useState("");
  const [newAsmrPath, setNewAsmrPath] = useState("");`,
  `  const [newAsmrLabel, setNewAsmrLabel] = useState(() => getU28RootSessionEntry("asmr")?.displayName ?? "");
  const [newAsmrPath, setNewAsmrPath] = useState(() => {
    const token = getU28RootSessionEntry("asmr")?.rootPathToken;
    return token ? \`rootPathToken:\${token}\` : "";
  });`,
  'ASMR session-backed form state',
);
settings = replaceOnce(
  settings,
  `  const [newMusicLabel, setNewMusicLabel] = useState("");
  const [newMusicPath, setNewMusicPath] = useState("");`,
  `  const [newMusicLabel, setNewMusicLabel] = useState(() => getU28RootSessionEntry("music")?.displayName ?? "");
  const [newMusicPath, setNewMusicPath] = useState(() => {
    const token = getU28RootSessionEntry("music")?.rootPathToken;
    return token ? \`rootPathToken:\${token}\` : "";
  });`,
  'music session-backed form state',
);
settings = replaceOnce(
  settings,
  `      librarySessionService.recordRootSelected(result);
      if (libraryType === "music") {`,
  `      librarySessionService.recordRootSelected(result);
      writeU28RootSession(result);
      if (libraryType === "music") {`,
  'record selected root in window session',
);
settings = replaceOnce(
  settings,
  `  const getSelectedRootToken = (
    libraryType: YangKuraLibraryType,
  ): string | null => {
    const value = libraryType === "music" ? newMusicPath : newAsmrPath;
    const prefix = "rootPathToken:";
    if (!value.startsWith(prefix)) return null;
    return value.slice(prefix.length).trim() || null;
  };`,
  `  const getSelectedRootToken = (
    libraryType: YangKuraLibraryType,
  ): string | null => {
    const value = libraryType === "music" ? newMusicPath : newAsmrPath;
    const prefix = "rootPathToken:";
    if (value.startsWith(prefix)) return value.slice(prefix.length).trim() || null;
    return getU28RootSessionEntry(libraryType)?.rootPathToken ?? null;
  };`,
  'selected root token session fallback',
);
write(settingsPath, settings);

const appPath = 'src/App.tsx';
let app = read(appPath);
app = replaceOnce(
  app,
  `  const [scanStatus, setScanStatus] = useState<string>(
    '当前已支持真实 index 读取、HTMLAudio 本地音频播放、LRC 字幕读取、视频/图片外部打开；仍未接 SQLite / 下载器。'
  );`,
  `  const [scanStatus, setScanStatus] = useState<string>(
    '尚未读取真实资源库记录。请先在设置中选择目录并读取现有记录，或执行安全扫描。'
  );`,
  'real diagnostics initial status',
);

app = replaceRegexOnce(
  app,
  /  useEffect\(\(\) => \{\n    let asmrBase = rjWorks;[\s\S]*?  \}, \[\]\);\n\n  useEffect\(\(\) => \{\n    const main = mainContentRef\.current;/,
  `  useEffect(() => {
    let asmrBase = rjWorks;
    let musicBase = musicAlbums;
    try {
      const cached = localStorage.getItem('yang_kura_last_read_library_index_result');
      if (cached) {
        const result = JSON.parse(cached) as YangKuraReadLibraryIndexResult;
        if (result.ok) {
          const mapped = libraryIndexAdapter.fromLocalJsonIndexToAppData(result.index as LocalJsonIndex);
          asmrBase = mapped.rjWorks;
          musicBase = mapped.musicAlbums;
        }
      }
    } catch {
      // Keep the current local bases when no readable real index cache exists.
    }
    rjWorksBaseRef.current = asmrBase;
    musicAlbumsBaseRef.current = musicBase;
    setRjWorks(metadataOverrideService.applyAsmrOverrides(asmrBase));
    setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(musicBase));
  }, []);

  useEffect(() => {
    const main = mainContentRef.current;`,
  'initial real index hydration clears stale cached collections',
);

app = replaceRegexOnce(
  app,
  /  const applyStoredLibraryIndexToUi = \(\) => \{[\s\S]*?  \};\n\n  useEffect\(\(\) => \{\n    applyStoredLibraryIndexToUi\(\);/,
  `  const applyStoredLibraryIndexToUi = (): boolean => {
    try {
      const raw = localStorage.getItem('yang_kura_last_read_library_index_result');
      if (!raw) {
        setScanStatus('当前没有已读取的真实 library-index.json。请先在设置中完成目录授权和读取。');
        return false;
      }
      const result = JSON.parse(raw) as YangKuraReadLibraryIndexResult;
      if (!result.ok) {
        setScanStatus(\`最近一次真实 index 读取未成功：\${result.message}\`);
        return false;
      }
      librarySessionService.recordIndexRead(result);
      const mapped = libraryIndexAdapter.fromLocalJsonIndexToAppData(result.index as LocalJsonIndex);
      rjWorksBaseRef.current = mapped.rjWorks;
      musicAlbumsBaseRef.current = mapped.musicAlbums;
      setRjWorks(metadataOverrideService.applyAsmrOverrides(mapped.rjWorks));
      setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums));
      setScanStatus(
        \`已加载真实 library-index.json：\${mapped.rjWorks.length} 个音声集合，\${mapped.musicAlbums.length} 个音乐集合，\${result.summary.trackCount} 条轨道。\`,
      );
      return true;
    } catch (error) {
      setScanStatus(\`读取本地 index 缓存失败：\${error instanceof Error ? error.message : String(error)}\`);
      return false;
    }
  };

  useEffect(() => {
    applyStoredLibraryIndexToUi();`,
  'real index application always replaces stale UI state',
);

app = replaceRegexOnce(
  app,
  /  \/\/ Handler: Scan local physical library mock animation\n  const handleScanLibrary = \(\) => \{[\s\S]*?  \};\n\n  \/\/ Toggle user liked state/,
  `  // Diagnostics refresh only reconciles the latest real index snapshot.
  const handleScanLibrary = () => {
    applyStoredLibraryIndexToUi();
  };

  // Toggle user liked state`,
  'remove diagnostics demo scan',
);
write(appPath, app);

const shellPath = 'src/components/DiagnosticsPageShell.tsx';
let shell = read(shellPath);
shell = replaceOnce(
  shell,
  `        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">完整历史诊断组件超过一万行，现在仅在用户主动打开时下载和解析，避免影响应用启动与日常浏览。</p>`,
  `        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">这里仅显示当前真实 Index 映射出的资源状态。没有完成目录授权或 Index 读取时，会明确显示不可用，不再使用 Demo 扫描冒充真实状态。</p>`,
  'diagnostics real-state explanation',
);
shell = replaceOnce(
  shell,
  `{props.scanStatus || '等待检查'}`,
  `{props.scanStatus || '尚未读取真实资源状态'}`,
  'diagnostics unavailable fallback',
);
shell = replaceOnce(
  shell,
  `刷新资源状态</button>`,
  `刷新真实资源状态</button>`,
  'diagnostics button label',
);
write(shellPath, shell);

const verifier = `import fs from 'node:fs';

const settings = fs.readFileSync('src/components/SettingsPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const shell = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');

const checks = [
  ['session-only root authorization', settings.includes("yang_kura_u28_authorized_roots_v1") && settings.includes('sessionStorage.setItem')],
  ['settings token fallback', settings.includes('getU28RootSessionEntry(libraryType)?.rootPathToken')],
  ['root selection is recorded', settings.includes('writeU28RootSession(result)')],
  ['stale ASMR state is replaced', app.includes('asmrBase = mapped.rjWorks') && !app.includes('if (mapped.rjWorks.length > 0) asmrBase')],
  ['stale music state is replaced', app.includes('musicBase = mapped.musicAlbums')],
  ['real index refresh replaces both libraries', app.includes('setRjWorks(metadataOverrideService.applyAsmrOverrides(mapped.rjWorks))') && app.includes('setMusicAlbums(metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums))')],
  ['demo scanner removed from active handler', !app.includes('Demo 扫描演示：不会读取真实磁盘')],
  ['diagnostics names real state', shell.includes('刷新真实资源状态') && shell.includes('不再使用 Demo 扫描冒充真实状态')],
  ['privacy boundary retained', !settings.includes('absolutePath: result') && !settings.includes('file://')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}\t${name}`);
if (failed.length) process.exit(1);
console.log('U28 library reconciliation verifier passed.');
`;
write('scripts/verify-u28-library-reconciliation.mjs', verifier);

const note = `# U28 资源库状态闭环修复说明

本分支只修复 U27 实机验收发现的 MAJ-001 和 MAJ-002。

## 修复内容

- 原生目录选择得到的 rootPathToken 保存到当前 BrowserWindow 的 sessionStorage；关闭应用后自动失效，不把临时授权冒充长期授权。
- 设置页重新挂载时可以恢复本窗口中的目录授权，读取与扫描按钮不再无故重新禁用。
- 真实 Index 映射即使为空，也会覆盖旧的 RJ/音乐缓存，避免顶栏残留历史 51 条音轨。
- 诊断页刷新只重新应用最近一次真实 Index 读取结果；没有真实结果时明确提示不可用。
- 不读取真实库以外的目录，不新增文件写入，不接 SQLite，不启用 MVP130。

## Windows 实机门槛

1. 原生选择 E:\\arsm 后，设置页立即显示已授权且读取/扫描按钮可用。
2. 读取已有 Index 后，首页、顶栏、音声库与播放器使用同一数据快照。
3. 真实 Index 为空时，旧缓存必须清空，不得保留历史计数。
4. 诊断刷新不得出现 Demo 扫描文案。
5. E:\\arsm 仅做授权、读取、浏览和播放；写入测试使用仓库外临时副本。
`;
write('docs/U28_LIBRARY_RECONCILIATION_IMPLEMENTATION.md', note);
write('.u28-patch-applied', new Date().toISOString());
console.log('U28 source patch applied.');
