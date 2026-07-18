import { useEffect, useMemo, useState } from 'react';
import {
  AudioLines,
  CircleCheck,
  CircleX,
  Droplet,
  FileCog,
  FolderOpen,
  Info,
  Moon,
  Palette,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { LibrarySettings, ThemeType } from '../types';
import { libraryReadCoordinatorService } from '../services/libraryReadCoordinatorService';
import { librarySessionService, type LibrarySessionSnapshot } from '../services/librarySessionService';
import { mpvPlaybackPreferenceService, type MpvPlaybackPreference } from '../services/mpvPlaybackPreferenceService';

interface SettingsPageDailyProps {
  settings: LibrarySettings;
  updateSettings: (updates: Partial<LibrarySettings>) => void;
}

type SettingsTab = 'theme' | 'player' | 'paths' | 'about';
type RootEntry = {
  rootPathToken: string;
  displayName: string;
  libraryType: YangKuraLibraryType;
  selectedAt: string;
};
type RootState = Partial<Record<YangKuraLibraryType, RootEntry>>;

const CURRENT_ROOT_KEY = 'yang_kura_u28_authorized_roots_v1';
const PERSISTED_ROOT_KEY = 'yang_kura_persisted_authorized_roots_v1';

function readRootState(storage: Storage, key: string): RootState {
  try {
    const value = JSON.parse(storage.getItem(key) ?? '{}') as RootState;
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function readRoots(): RootState {
  const persisted = readRootState(localStorage, PERSISTED_ROOT_KEY);
  const current = readRootState(sessionStorage, CURRENT_ROOT_KEY);
  return { ...persisted, ...current };
}

function saveRoot(result: YangKuraSelectLibraryRootSuccessResult): void {
  const entry: RootEntry = {
    rootPathToken: result.rootPathToken,
    displayName: result.displayName,
    libraryType: result.libraryType,
    selectedAt: new Date().toISOString(),
  };
  const current = { ...readRootState(sessionStorage, CURRENT_ROOT_KEY), [result.libraryType]: entry };
  const persisted = { ...readRootState(localStorage, PERSISTED_ROOT_KEY), [result.libraryType]: entry };
  sessionStorage.setItem(CURRENT_ROOT_KEY, JSON.stringify(current));
  localStorage.setItem(PERSISTED_ROOT_KEY, JSON.stringify(persisted));
}

const themes: Array<{ id: ThemeType; label: string; description: string; icon: typeof Moon }> = [
  { id: 'dark', label: '高雅黑', description: '深色、安静，适合夜间长时间使用。', icon: Moon },
  { id: 'acrylic-mist', label: '云雾亚克力', description: '浅色雾面材质，保持文字与控件清晰。', icon: Sparkles },
  { id: 'ocean-drops', label: '微光海洋', description: '低饱和蓝色材质，适合日间浏览。', icon: Droplet },
];

function rootLabel(type: YangKuraLibraryType): string {
  return type === 'music' ? '音乐库' : '音声库';
}

export default function SettingsPageDaily({ settings, updateSettings }: SettingsPageDailyProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');
  const [roots, setRoots] = useState<RootState>(() => readRoots());
  const [session, setSession] = useState<LibrarySessionSnapshot>(() => librarySessionService.getSnapshot());
  const [directoryMessage, setDirectoryMessage] = useState<string | null>(null);
  const [quickLibraryType, setQuickLibraryType] = useState<YangKuraLibraryType | null>(null);
  const [mpvStatus, setMpvStatus] = useState<YangKuraMpvInstallationStatus | null>(null);
  const [mpvMessage, setMpvMessage] = useState<string | null>(null);
  const [mpvBusy, setMpvBusy] = useState(false);
  const [mpvPreference, setMpvPreference] = useState<MpvPlaybackPreference>(() => mpvPlaybackPreferenceService.getPreference());

  useEffect(() => {
    const refresh = () => {
      setSession(librarySessionService.getSnapshot());
      setRoots(readRoots());
    };
    refresh();
    window.addEventListener(librarySessionService.updateEventName, refresh);
    window.addEventListener(librarySessionService.indexReadEventName, refresh);
    return () => {
      window.removeEventListener(librarySessionService.updateEventName, refresh);
      window.removeEventListener(librarySessionService.indexReadEventName, refresh);
    };
  }, []);

  const refreshMpv = async () => {
    if (!window.yangKura?.getMpvInstallationStatus) {
      setMpvMessage('当前使用基础播放方式；未连接到桌面音频检测。');
      return;
    }
    setMpvBusy(true);
    try {
      const result = await window.yangKura.getMpvInstallationStatus();
      setMpvStatus(result);
      setMpvMessage(result.available
        ? '增强播放组件可用。启动失败时仍会自动切回基础播放。'
        : '未检测到增强播放组件；常见格式将使用基础播放，遇到不支持的编码时请点击“选择播放组件”。');
    } catch (error) {
      setMpvMessage(`播放组件检测失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setMpvBusy(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'player') void refreshMpv();
  }, [activeTab]);

  const currentTheme = themes.find((theme) => theme.id === settings.currentTheme) ?? themes[0];
  const CurrentThemeIcon = currentTheme.icon;
  const readAttempt = session.lastReadAttempt;
  const readingType = readAttempt?.status === 'reading' ? readAttempt.libraryType : undefined;

  const sessionMessage = useMemo(() => librarySessionService.getUserFacingStatus(session), [session]);

  const selectRoot = async (libraryType: YangKuraLibraryType) => {
    if (!window.yangKura?.selectLibraryRoot) {
      setDirectoryMessage('当前桌面连接不可用，请重新打开应用。');
      return;
    }
    const result = await window.yangKura.selectLibraryRoot({ libraryType, reason: 'user-selected-library-root' });
    if (!result.ok) {
      setDirectoryMessage(result.message || '未选择目录。');
      return;
    }
    saveRoot(result);
    librarySessionService.recordRootSelected(result);
    setRoots(readRoots());
    setDirectoryMessage(`已选择${rootLabel(libraryType)}目录「${result.displayName}」。可以读取已有记录。`);
  };

  const readIndex = async (libraryType: YangKuraLibraryType) => {
    const root = roots[libraryType];
    if (!root) {
      setDirectoryMessage(`请先选择${rootLabel(libraryType)}目录。`);
      return;
    }
    const result = await libraryReadCoordinatorService.read({
      libraryType,
      displayName: root.displayName,
      rootPathToken: root.rootPathToken,
    });
    setDirectoryMessage(result.ok
      ? `读取完成：${result.summary.collectionCount} 个作品或专辑，${result.summary.trackCount} 条音轨。`
      : result.message);
  };

  const scanAndApply = async (libraryType: YangKuraLibraryType) => {
    const root = roots[libraryType];
    if (!root || !window.yangKura) {
      setDirectoryMessage(`请先选择${rootLabel(libraryType)}目录。`);
      return;
    }
    setQuickLibraryType(libraryType);
    setDirectoryMessage(`正在扫描${rootLabel(libraryType)}目录。不会修改媒体文件。`);
    try {
      const scan = await window.yangKura.requestScannerDryRun({
        rootPathToken: root.rootPathToken,
        mode: 'dry-run',
        previewOnly: true,
        maxEntries: 50_000,
        maxDepth: 24,
      });
      if (!scan.ok) throw new Error(scan.message);
      const preview = await window.yangKura.requestWriteIndexPreview({
        rootPathToken: root.rootPathToken,
        mode: 'preview-only',
        dryRunScannedAt: scan.scannedAt,
        maxPreviewEntries: 20_000,
      });
      if (!preview.ok) throw new Error(preview.message);
      const write = await window.yangKura.requestWriteLibraryIndex({
        rootPathToken: root.rootPathToken,
        mode: 'confirmed-write',
        dryRunScannedAt: preview.summary.sourceDryRunScannedAt,
        createBackup: true,
        maxWriteEntries: 20_000,
      });
      if (!write.ok) throw new Error(write.message);
      librarySessionService.recordIndexWrite(write);
      await readIndex(libraryType);
    } catch (error) {
      setDirectoryMessage(`扫描或应用失败：${error instanceof Error ? error.message : String(error)}。已有媒体文件没有被修改。`);
    } finally {
      setQuickLibraryType(null);
    }
  };

  const selectMpv = async () => {
    if (!window.yangKura?.selectMpvExecutable) return;
    setMpvBusy(true);
    try {
      const result = await window.yangKura.selectMpvExecutable();
      setMpvMessage(result.message);
      await refreshMpv();
    } finally {
      setMpvBusy(false);
    }
  };

  const clearMpv = async () => {
    if (!window.yangKura?.clearMpvExecutable) return;
    setMpvBusy(true);
    try {
      const result = await window.yangKura.clearMpvExecutable();
      setMpvMessage(result.message);
      await refreshMpv();
    } finally {
      setMpvBusy(false);
    }
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Settings }> = [
    { id: 'theme', label: '界面主题', icon: Palette },
    { id: 'player', label: '播放方式', icon: AudioLines },
    { id: 'paths', label: '资源库目录', icon: FolderOpen },
    { id: 'about', label: '关于与隐私', icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12 animate-fade-in" data-u40d-daily-settings="ready">
      <div className="border-b border-border-color/70 pb-3">
        <h2 className="flex items-center gap-2.5 text-xl font-bold"><Settings className="h-5 w-5 text-brand-color" /><span>应用设置</span></h2>
        <p className="mt-1 text-xs text-text-muted">配置界面、播放方式和本地资源库。</p>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              data-settings-tab={tab.id}
              aria-pressed={active}
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold ${active ? 'border-brand-color/30 bg-brand-color/10 text-brand-color' : 'border-transparent bg-card-bg/20 text-text-secondary hover:bg-card-bg/40 hover:text-text-primary'}`}
            >
              <Icon className="h-4 w-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'theme' && (
        <section className="space-y-4 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5">
          <div className="flex items-center gap-2"><Palette className="h-4 w-4 text-brand-color" /><h3 className="text-sm font-bold">界面主题</h3></div>
          <label className="block max-w-md space-y-2 text-xs text-text-secondary">
            <span>选择应用主题</span>
            <select
              aria-label="选择应用主题"
              value={settings.currentTheme}
              onChange={(event) => updateSettings({ currentTheme: event.target.value as ThemeType })}
              className="w-full rounded-lg border border-border-color bg-input-bg px-3.5 py-2.5 text-xs text-text-primary outline-none focus:border-brand-color"
            >
              {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
            </select>
          </label>
          <div className="max-w-md rounded-xl border border-border-color bg-card-bg/45 p-4">
            <div className="flex items-center justify-between"><strong>{currentTheme.label}</strong><CurrentThemeIcon className="h-4 w-4 text-brand-color" /></div>
            <p className="mt-2 text-xs text-text-muted">{currentTheme.description}</p>
          </div>
        </section>
      )}

      {activeTab === 'player' && (
        <section id="mvp123-mpv-settings-status" className="space-y-5 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="text-sm font-bold">本地音频播放</h3><p className="mt-1 text-xs text-text-muted">优先使用增强播放组件；不可用时尝试基础播放，不支持的编码会明确提示。</p></div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${mpvStatus?.available ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/25 bg-amber-500/10 text-amber-300'}`}>
              {mpvStatus?.available ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
              {mpvStatus?.available ? '增强播放可用' : '使用基础播放'}
            </span>
          </div>
          <label className="block max-w-md space-y-2 text-xs text-text-secondary">
            <span>播放方式偏好</span>
            <select
              aria-label="选择本地音频播放后端偏好"
              value={mpvPreference}
              onChange={(event) => {
                const value = event.target.value as MpvPlaybackPreference;
                setMpvPreference(value);
                mpvPlaybackPreferenceService.setPreference(value);
              }}
              className="w-full rounded-lg border border-border-color bg-input-bg px-3 py-2.5 text-xs text-text-primary"
            >
              <option value="prefer-mpv">优先增强播放，失败自动切换</option>
              <option value="html-audio-only">仅使用基础播放</option>
            </select>
          </label>
          {mpvMessage && <p role="status" className="rounded-xl border border-border-color/60 bg-card-bg/35 p-3 text-xs text-text-secondary">{mpvMessage}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void refreshMpv()} disabled={mpvBusy} className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-xs font-bold"><RefreshCw className={`h-3.5 w-3.5 ${mpvBusy ? 'animate-spin' : ''}`} />重新检测</button>
            <button type="button" onClick={() => void selectMpv()} disabled={mpvBusy} className="inline-flex items-center gap-2 rounded-lg bg-brand-color px-3 py-2 text-xs font-bold text-white"><FileCog className="h-3.5 w-3.5" />选择播放组件</button>
            <button type="button" onClick={() => void clearMpv()} disabled={mpvBusy || !mpvStatus?.canClearUserSelection} className="inline-flex items-center gap-2 rounded-lg border border-red-500/25 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" />清除手动设置</button>
          </div>
        </section>
      )}

      {activeTab === 'paths' && (
        <section className="space-y-5">
          <div className="rounded-2xl border border-border-color/70 bg-card-bg/35 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold">本地资源库</h3><p className="mt-1 text-xs text-text-muted">选择目录后可以读取已有记录，或重新扫描。扫描不会改动媒体文件。</p></div><span className="rounded-full border border-border-color px-2.5 py-1 text-[10px] text-text-secondary">本机保存</span></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void selectRoot('asmr')} className="rounded-lg bg-brand-color px-3 py-2 text-xs font-bold text-white">选择音声库目录</button>
              <button type="button" onClick={() => void selectRoot('music')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">选择音乐库目录</button>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
            <h3 className="text-sm font-bold">读取与更新</h3>
            <p className="mt-1 text-xs text-text-muted">{sessionMessage}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(['asmr', 'music'] as const).map((type) => {
                const root = roots[type];
                const reading = readingType === type;
                const scanning = quickLibraryType === type;
                return (
                  <div key={type} className="rounded-xl border border-border-color/60 bg-card-bg/35 p-4">
                    <div className="flex items-center justify-between gap-2"><strong className="text-xs">{rootLabel(type)}</strong><span className="max-w-[65%] truncate text-[10px] text-text-muted">{root?.displayName ?? '尚未选择目录'}</span></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => void readIndex(type)} disabled={!root || reading || Boolean(quickLibraryType)} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-45">{reading ? '读取中…' : '读取已有记录'}</button>
                      <button type="button" onClick={() => void scanAndApply(type)} disabled={!root || Boolean(quickLibraryType) || Boolean(readingType)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-45">{scanning ? '扫描处理中…' : '一键扫描并应用'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {(directoryMessage || readAttempt) && (
              <p role="status" data-u40d-read-status={readAttempt?.status ?? 'idle'} className="mt-4 rounded-xl border border-border-color/60 bg-card-bg/40 p-3 text-xs text-text-secondary">
                {readAttempt?.status === 'reading' ? readAttempt.message : directoryMessage ?? sessionMessage}
              </p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'about' && (
        <section className="space-y-4 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5">
          <div className="flex items-center gap-2"><Info className="h-4 w-4 text-brand-color" /><h3 className="text-sm font-bold">关于 Yang-Kura</h3></div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border-color/60 p-3"><strong className="text-xs">个人本地使用</strong><p className="mt-1 text-[11px] text-text-muted">资源库和播放记录保存在本机。</p></div>
            <div className="rounded-xl border border-border-color/60 p-3"><strong className="text-xs">目录隐私</strong><p className="mt-1 text-[11px] text-text-muted">日常界面只显示目录名称，不展示完整路径。</p></div>
            <div className="rounded-xl border border-border-color/60 p-3"><strong className="text-xs">媒体安全</strong><p className="mt-1 text-[11px] text-text-muted">读取和扫描不会删除、覆盖或移动媒体文件。</p></div>
          </div>
          <p className="text-xs text-text-muted">当前版本：0.169.0-beta.2。高级检修集中在独立的 AI 维护页面。</p>
        </section>
      )}
    </div>
  );
}
