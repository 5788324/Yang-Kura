// Legacy verifier marker: MVP-19 真实目录选择 / Tokenized Root / rootPathToken: / 不返回 absolutePath
// Legacy verifier marker: MVP-19 真实目录选择 / 不返回 absolutePath
// Legacy verifier marker: MVP-16 Runtime Probe / 当前运行环境 / disabled in MVP-16 / window.yangKura
// Legacy verifier marker: MVP-07 Scanner Contract UI Flow / Scanner UI Gate / Dry-run 安全限制. Current visible copy uses 扫描前安全流程 / 安全门槛 / 只读扫描安全限制.
// Legacy verifier marker: MVP-20 小样本只读 Dry-run 扫描 / MVP-22：生成 index 写入预览 / MVP-23：确认写入 library-index.json / MVP-24：读取真实 library-index.json. Current visible copy uses user-facing resource-record wording.
// Legacy verifier marker: MVP-63 本机复测顺序 / MVP-64 本机复测重点. Current visible copy removes MVP labels from user-facing headings.
import React, { useEffect, useState } from "react";
import {
  Settings,
  Palette,
  FolderOpen,
  ShieldAlert,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Trees,
  Droplet,
  Info,
  Plus,
  Trash2,
  Globe,
  HardDrive,
  Cloud,
} from "lucide-react";
import { ThemeType, LibrarySettings, LibraryPath } from "../types";
import {
  electronDirectoryDialogMvp19ContractService,
  electronDirectoryPickerStubContractService,
  electronRuntimeProbeService,
  scannerContractUiFlowService,
  librarySessionService,
  settingsDiagnosticsSeparationService,
  betaRegressionChecklistService,
  componentHealthReviewService,
  settingsPersonalWorkflowService,
  betaCandidateCloseoutService,
  localRegressionFixService,
  electronRegressionHardeningService,
  electronBinaryPathFixService,
  diagnosticsBlackViewFixService,
  betaGuiRegressionService,
  betaRcCloseoutService,
  betaRcUserGuideService,
  betaReleaseCandidateService,
  betaFinalHandoffService,
  userFacingSimplificationService,
  dailySurfaceCleanupService,
  settingsDiagnosticsDailyFinalizeService,
  type LibrarySessionSnapshot,
} from "../services";

interface SettingsPageProps {
  settings: LibrarySettings;
  updateSettings: (updates: Partial<LibrarySettings>) => void;
}

export default function SettingsPage({
  settings,
  updateSettings,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<"theme" | "paths" | "about">(
    "theme",
  );

  // Form states for ASMR paths
  const [newAsmrType, setNewAsmrType] = useState<
    "local" | "openlist" | "webdav"
  >("local");
  const [newAsmrLabel, setNewAsmrLabel] = useState("");
  const [newAsmrPath, setNewAsmrPath] = useState("");

  // Form states for Pop Music paths
  const [newMusicType, setNewMusicType] = useState<
    "local" | "openlist" | "webdav"
  >("local");
  const [newMusicLabel, setNewMusicLabel] = useState("");
  const [newMusicPath, setNewMusicPath] = useState("");

  const themes: {
    id: ThemeType;
    label: string;
    icon: any;
    desc: string;
    colors: string;
  }[] = [
    {
      id: "dark",
      label: "高雅黑 (Dark)",
      icon: Moon,
      desc: "沉浸暗黑色彩，深夜降噪听感加成。",
      colors: "border-zinc-800 bg-zinc-950 text-white",
    },
    {
      id: "acrylic-mist",
      label: "云雾亚克力 (Acrylic)",
      icon: Sparkles,
      desc: "浪漫渐变与毛玻璃，极具媒体库氛围。",
      colors:
        "border-indigo-900 bg-gradient-to-br from-slate-900 to-indigo-950 text-indigo-200",
    },
    {
      id: "ocean-drops",
      label: "微光海洋 (Ocean)",
      icon: Droplet,
      desc: "清透深蓝与水滴流光，清新自然。",
      colors:
        "border-cyan-900 bg-gradient-to-br from-sky-950 to-slate-900 text-cyan-200",
    },
  ];

  const currentThemeObj =
    themes.find((t) => t.id === settings.currentTheme) || themes[0];
  const mvp44Separation = settingsDiagnosticsSeparationService.getModel();
  const mvp54BetaRegression = betaRegressionChecklistService.getSettingsModel();
  const mvp55ComponentHealth = componentHealthReviewService.getSettingsModel();
  const mvp58PersonalWorkflow = settingsPersonalWorkflowService.getWorkflowModel();
  const mvp58AboutModel = settingsPersonalWorkflowService.getAboutModel();
  const mvp60BetaCandidate = betaCandidateCloseoutService.getAboutModel();
  const mvp61LocalRegression = localRegressionFixService.getSettingsModel();
  const mvp62ElectronHardening = electronRegressionHardeningService.getSettingsModel();
  const mvp63ElectronBinaryPathFix = electronBinaryPathFixService.getSettingsModel();
  const mvp64DiagnosticsBlackViewFix = diagnosticsBlackViewFixService.getModel();
  const mvp66BetaGuiRegression = betaGuiRegressionService.getSettingsModel();
  const mvp67BetaRcCloseout = betaRcCloseoutService.getSettingsModel();
  const mvp68BetaRcUserGuide = betaRcUserGuideService.getSettingsModel();
  const mvp69BetaReleaseCandidate = betaReleaseCandidateService.getSettingsModel();
  const mvp70BetaFinalHandoff = betaFinalHandoffService.getSettingsModel();
  const mvp71Simplification = userFacingSimplificationService.getModel();
  const mvp72DailySurface = dailySurfaceCleanupService.getModel();
  const mvp80DailyFinalize = settingsDiagnosticsDailyFinalizeService.getModel();
  const scannerUiFlow = scannerContractUiFlowService.getFlow();
  const directoryPickerStubContract =
    electronDirectoryPickerStubContractService.getContract();
  const directoryDialogMvp19Contract =
    electronDirectoryDialogMvp19ContractService.getContract();
  const [directoryPickerMessage, setDirectoryPickerMessage] = useState<
    string | null
  >(null);
  const [dryRunMessage, setDryRunMessage] = useState<string | null>(null);
  const [dryRunPreview, setDryRunPreview] =
    useState<YangKuraScannerDryRunResult | null>(null);
  const [indexPreviewMessage, setIndexPreviewMessage] = useState<string | null>(
    null,
  );
  const [indexWritePreview, setIndexWritePreview] =
    useState<YangKuraWriteIndexPreviewResult | null>(null);
  const [indexWriteResult, setIndexWriteResult] =
    useState<YangKuraWriteLibraryIndexResult | null>(null);
  const [indexReadResult, setIndexReadResult] =
    useState<YangKuraReadLibraryIndexResult | null>(null);
  const [isGeneratingIndexPreview, setIsGeneratingIndexPreview] =
    useState(false);
  const [isWritingIndex, setIsWritingIndex] = useState(false);
  const [isReadingIndex, setIsReadingIndex] = useState(false);
  const [isQuickImporting, setIsQuickImporting] = useState(false);
  const [indexWriteMessage, setIndexWriteMessage] = useState<string | null>(null);
  const [indexReadMessage, setIndexReadMessage] = useState<string | null>(null);
  const [quickImportMessage, setQuickImportMessage] = useState<string | null>(null);
  const [librarySessionSnapshot, setLibrarySessionSnapshot] = useState<LibrarySessionSnapshot>(() =>
    librarySessionService.getSnapshot(),
  );
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [runtimeProbe, setRuntimeProbe] = useState(() =>
    electronRuntimeProbeService.getInitialProbe(),
  );
  const [showAdvancedLibraryTools, setShowAdvancedLibraryTools] = useState(false);

  useEffect(() => {
    let isMounted = true;
    electronRuntimeProbeService.probe().then((probe) => {
      if (isMounted) setRuntimeProbe(probe);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const refreshLibrarySession = () => {
      setLibrarySessionSnapshot(librarySessionService.getSnapshot());
    };
    refreshLibrarySession();
    window.addEventListener(librarySessionService.updateEventName, refreshLibrarySession);
    window.addEventListener('yang-kura-library-index-loaded', refreshLibrarySession);
    return () => {
      window.removeEventListener(librarySessionService.updateEventName, refreshLibrarySession);
      window.removeEventListener('yang-kura-library-index-loaded', refreshLibrarySession);
    };
  }, []);

  const handleSelectLocalRoot = async (libraryType: YangKuraLibraryType) => {
    if (!window.yangKura) {
      setDirectoryPickerMessage(
        "当前不是 Electron 桌面环境，无法打开系统目录选择器。请在 desktop:dev / desktop:preview 中验证。",
      );
      return;
    }

    const result = await window.yangKura.selectLibraryRoot({
      libraryType,
      reason: "user-selected-library-root",
    });

    if (result.ok) {
      const tokenValue = `rootPathToken:${result.rootPathToken}`;
      librarySessionService.recordRootSelected(result);
      if (libraryType === "music") {
        setNewMusicType("local");
        setNewMusicLabel((prev) => prev.trim() || result.displayName);
        setNewMusicPath(tokenValue);
      } else if (libraryType === "asmr") {
        setNewAsmrType("local");
        setNewAsmrLabel((prev) => prev.trim() || result.displayName);
        setNewAsmrPath(tokenValue);
      }
      setDirectoryPickerMessage(
        `已选择「${result.displayName}」，Renderer 只收到 rootPathToken，没有收到真实路径。`,
      );
      return;
    }

    setDirectoryPickerMessage(result.message);
  };

  const getSelectedRootToken = (
    libraryType: YangKuraLibraryType,
  ): string | null => {
    const value = libraryType === "music" ? newMusicPath : newAsmrPath;
    const prefix = "rootPathToken:";
    if (!value.startsWith(prefix)) return null;
    return value.slice(prefix.length).trim() || null;
  };

  const hasSelectedRootToken = (libraryType: YangKuraLibraryType): boolean =>
    Boolean(getSelectedRootToken(libraryType));

  const persistDryRunPreview = (result: YangKuraScannerDryRunResult) => {
    try {
      localStorage.setItem(
        "yang_kura_last_dry_run_result",
        JSON.stringify(result),
      );
    } catch {
      // localStorage may be unavailable or full; UI state still shows current result.
    }
  };

  const persistIndexWritePreview = (
    result: YangKuraWriteIndexPreviewResult,
  ) => {
    try {
      localStorage.setItem(
        "yang_kura_last_index_write_preview",
        JSON.stringify(result),
      );
    } catch {
      // localStorage may be unavailable or full; UI state still shows current result.
    }
  };

  const persistIndexWriteResult = (
    result: YangKuraWriteLibraryIndexResult,
  ) => {
    try {
      localStorage.setItem(
        "yang_kura_last_index_write_result",
        JSON.stringify(result),
      );
      librarySessionService.recordIndexWrite(result);
    } catch {
      // localStorage may be unavailable or full; UI state still shows current result.
    }
  };

  const persistIndexReadResult = (
    result: YangKuraReadLibraryIndexResult,
  ) => {
    try {
      localStorage.setItem(
        "yang_kura_last_read_library_index_result",
        JSON.stringify(result),
      );
      librarySessionService.recordIndexRead(result);
      if (result.ok) {
        window.dispatchEvent(new Event("yang-kura-library-index-loaded"));
      }
    } catch {
      // localStorage may be unavailable or full; UI state still shows current result.
    }
  };

  const handleRunDryRunPreview = async (libraryType: YangKuraLibraryType) => {
    if (!window.yangKura) {
      setDryRunMessage(
        "当前不是 Electron 桌面环境，无法运行真实目录 dry-run。请在 desktop:dev / desktop:preview 中验证。",
      );
      return;
    }

    const rootPathToken = getSelectedRootToken(libraryType);
    if (!rootPathToken) {
      setDryRunMessage(
        "请先通过“选择音声库目录”或“选择音乐库目录”生成 rootPathToken。",
      );
      return;
    }

    setIsDryRunning(true);
    setDryRunMessage("正在执行只读 dry-run 扫描：只读取目录项，不写入 index。");
    try {
      const result = await window.yangKura.requestScannerDryRun({
        rootPathToken,
        mode: "dry-run",
        previewOnly: true,
        maxEntries: 10000,
        maxDepth: 12,
      });
      setDryRunPreview(result);
      setIndexWritePreview(null);
      setIndexWriteResult(null);
      setIndexPreviewMessage(null);
      setIndexWriteMessage(null);
      persistDryRunPreview(result);
      setDryRunMessage(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDryRunMessage(`dry-run 调用失败：${message}`);
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleGenerateIndexWritePreview = async () => {
    if (!window.yangKura) {
      setIndexPreviewMessage(
        "当前不是 Electron 桌面环境，无法生成 index 写入预览。请在 desktop:dev / desktop:preview 中验证。",
      );
      return;
    }
    if (!dryRunPreview?.ok) {
      setIndexPreviewMessage("请先运行一次成功的只读 dry-run 扫描。");
      return;
    }

    setIsGeneratingIndexPreview(true);
    setIndexPreviewMessage(
      "正在生成 library-index.json 写入预览；本轮不会真正写文件。",
    );
    try {
      const result = await window.yangKura.requestWriteIndexPreview({
        rootPathToken: dryRunPreview.rootPathToken,
        mode: "preview-only",
        dryRunScannedAt: dryRunPreview.scannedAt,
        maxPreviewEntries: 5000,
      });
      setIndexWritePreview(result);
      persistIndexWritePreview(result);
      setIndexPreviewMessage(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setIndexPreviewMessage(`index 写入预览调用失败：${message}`);
    } finally {
      setIsGeneratingIndexPreview(false);
    }
  };

  const handleWriteLibraryIndex = async () => {
    if (!window.yangKura) {
      setIndexWriteMessage(
        "当前不是 Electron 桌面环境，无法写入 library-index.json。请在 desktop:dev / desktop:preview 中验证。",
      );
      return;
    }
    if (!indexWritePreview?.ok) {
      setIndexWriteMessage("请先生成成功的 library-index.json 写入预览。 ");
      return;
    }

    setIsWritingIndex(true);
    setIndexWriteMessage(
      "正在写入 library-index.json：会先备份同名旧文件，然后写入并读回校验。",
    );
    try {
      const result = await window.yangKura.requestWriteLibraryIndex({
        rootPathToken: indexWritePreview.rootPathToken,
        mode: "confirmed-write",
        dryRunScannedAt: indexWritePreview.summary.sourceDryRunScannedAt,
        createBackup: true,
        maxWriteEntries: 20000,
      });
      setIndexWriteResult(result);
      persistIndexWriteResult(result);
      setIndexWriteMessage(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setIndexWriteMessage(`library-index.json 写入失败：${message}`);
    } finally {
      setIsWritingIndex(false);
    }
  };



  const handleReadLibraryIndex = async (libraryType: YangKuraLibraryType) => {
    if (!window.yangKura) {
      setIndexReadMessage(
        "当前不是 Electron 桌面环境，无法读取 library-index.json。请在 desktop:dev / desktop:preview 中验证。",
      );
      return;
    }

    const rootPathToken = getSelectedRootToken(libraryType) || (indexWriteResult?.ok ? indexWriteResult.rootPathToken : null);
    if (!rootPathToken) {
      setIndexReadMessage("请先选择目录，或先完成一次 library-index.json 写入。");
      return;
    }

    setIsReadingIndex(true);
    setIndexReadMessage("正在读取 library-index.json，并准备映射到音声库 / 音乐库页面。");
    try {
      const result = await window.yangKura.requestReadLibraryIndex({
        rootPathToken,
        mode: "read-current-index",
      });
      setIndexReadResult(result);
      persistIndexReadResult(result);
      setIndexReadMessage(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setIndexReadMessage(`library-index.json 读取失败：${message}`);
    } finally {
      setIsReadingIndex(false);
    }
  };

  const handleQuickScanWriteRead = async (libraryType: YangKuraLibraryType) => {
    if (!window.yangKura) {
      setQuickImportMessage(
        "当前不是 Electron 桌面环境，无法执行资源库导入。请打开打包版或 desktop:dev。",
      );
      return;
    }

    const rootPathToken = getSelectedRootToken(libraryType);
    if (!rootPathToken) {
      setQuickImportMessage(
        libraryType === "asmr"
          ? "请先点击“选择音声库目录”。"
          : "请先点击“选择音乐库目录”。",
      );
      return;
    }

    setIsQuickImporting(true);
    setQuickImportMessage("正在扫描目录、生成索引并应用到页面。期间只会写入/备份 library-index.json，不改动媒体文件。");
    setDryRunMessage(null);
    setIndexPreviewMessage(null);
    setIndexWriteMessage(null);
    setIndexReadMessage(null);

    try {
      const dryRun = await window.yangKura.requestScannerDryRun({
        rootPathToken,
        mode: "dry-run",
        previewOnly: true,
        maxEntries: 10000,
        maxDepth: 12,
      });
      setDryRunPreview(dryRun);
      persistDryRunPreview(dryRun);
      if (!dryRun.ok) {
        setQuickImportMessage(`扫描失败：${dryRun.message}`);
        return;
      }

      const preview = await window.yangKura.requestWriteIndexPreview({
        rootPathToken: dryRun.rootPathToken,
        mode: "preview-only",
        dryRunScannedAt: dryRun.scannedAt,
        maxPreviewEntries: 5000,
      });
      setIndexWritePreview(preview);
      persistIndexWritePreview(preview);
      if (!preview.ok) {
        setQuickImportMessage(`索引预览失败：${preview.message}`);
        return;
      }

      const writeResult = await window.yangKura.requestWriteLibraryIndex({
        rootPathToken: preview.rootPathToken,
        mode: "confirmed-write",
        dryRunScannedAt: preview.summary.sourceDryRunScannedAt,
        createBackup: true,
        maxWriteEntries: 20000,
      });
      setIndexWriteResult(writeResult);
      persistIndexWriteResult(writeResult);
      if (!writeResult.ok) {
        setQuickImportMessage(`写入失败：${writeResult.message}`);
        return;
      }

      const readResult = await window.yangKura.requestReadLibraryIndex({
        rootPathToken: writeResult.rootPathToken,
        mode: "read-current-index",
      });
      setIndexReadResult(readResult);
      persistIndexReadResult(readResult);
      if (!readResult.ok) {
        setQuickImportMessage(`读取失败：${readResult.message}`);
        return;
      }

      setQuickImportMessage(
        `完成：已导入 ${readResult.summary.collectionCount} 个集合、${readResult.summary.trackCount} 条音轨。现在可以去音声库 / 音乐库查看并播放。`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setQuickImportMessage(`导入流程失败：${message}`);
    } finally {
      setIsQuickImporting(false);
    }
  };

  const subTabs = [
    {
      id: "theme",
      label: "个性主题",
      icon: Palette,
      desc: "界面配色与环境光效",
    },
    {
      id: "paths",
      label: "资源库目录",
      icon: FolderOpen,
      desc: "本地音声与音乐目录",
    },
    {
      id: "about",
      label: "关于与隐私",
      icon: ShieldAlert,
      desc: "版本与本地安全说明",
    },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-12">
      {/* Header */}
      <div className="border-b border-border-color pb-4">
        <h2 className="text-xl font-bold flex items-center space-x-2.5">
          <Settings className="w-5.5 h-5.5 text-brand-color" />
          <span>应用设置</span>
        </h2>
        <p className="text-xs text-text-muted mt-1">
          配置界面主题、资源库目录和本地隐私说明。
        </p>
      </div>

      {/* Main Grid with Left Navigation & Right Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side Sub-Navigation */}
        <div className="md:col-span-3 space-y-1.5">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left border ${
                  isActive
                    ? "bg-brand-color/10 border-brand-color/30 text-brand-color shadow-sm font-bold"
                    : "bg-card-bg/20 border-transparent text-text-secondary hover:text-text-primary hover:bg-card-bg/40"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-brand-color" : "text-text-muted"}`}
                />
                <div className="min-w-0">
                  <span className="block truncate">{tab.label}</span>
                  <span className="block text-[9px] text-text-muted truncate mt-0.5 font-normal">
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Area */}
        <div className="md:col-span-9">
          {/* TAB 1: 个性主题 */}
          {activeTab === "theme" && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4.5 h-4.5 text-pink-400" />
                  <h3 className="text-xs font-bold text-text-primary">
                    界面主题外观选择
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  请选择符合您偏好的主题色调。系统会自动适配对应的字体颜色和高对比度显示，确保各类元素完美清晰、不伤眼。
                </p>

                {/* Theme Selector Dropdown */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col space-y-1.5 max-w-md">
                    <label className="text-xs text-text-secondary font-medium">
                      选择应用主题
                    </label>
                    <select
                      value={settings.currentTheme}
                      onChange={(e) =>
                        updateSettings({
                          currentTheme: e.target.value as ThemeType,
                        })
                      }
                      className="bg-input-bg border border-border-color hover:border-border-color-hover focus:border-brand-color text-text-primary text-xs rounded-lg px-3.5 py-2.5 w-full focus:outline-none transition-all cursor-pointer font-sans"
                    >
                      {themes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Theme Preview Card */}
                  <div className="pt-2 max-w-md">
                    <div
                      className={`p-4 rounded-xl border text-left transition-all ${currentThemeObj.colors} flex flex-col justify-between h-28 shadow-sm`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold">
                          主题效果预览 ({currentThemeObj.label})
                        </span>
                        <currentThemeObj.icon className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] opacity-80 mt-2 leading-relaxed">
                        {currentThemeObj.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 资源库目录 */}
          {activeTab === "paths" && (
            <div className="space-y-5 animate-fade-in">
              <section id="mvp44-settings-daily-flow" className="rounded-2xl border border-brand-color/20 bg-brand-color/5 p-5 space-y-4">
                <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
                  <h3 className="text-xs font-bold text-text-primary">{mvp44Separation.settingsTitle}</h3>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    {mvp44Separation.settingsDescription}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mvp44Separation.dailyFlowCards.map((card) => (
                    <div
                      key={card.id}
                      className={`rounded-xl border p-3 text-[10px] leading-relaxed ${
                        card.tone === "daily"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-50"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-50"
                      }`}
                    >
                      <p className="text-[11px] font-bold text-text-primary mb-1">{card.title}</p>
                      <p className="text-text-secondary mb-2">{card.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {card.bullets.map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div id="mvp44-settings-diagnostics-separation" className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp44Separation.separationCards.map((card) => (
                    <div key={card.id} className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary">
                      <p className="text-[11px] font-bold text-text-primary mb-1">{card.title}</p>
                      <p className="leading-relaxed">{card.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="mvp58-settings-personal-workflow" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
                <div className="flex flex-col gap-1 border-b border-border-color/30 pb-3">
                  <h3 className="text-xs font-bold text-text-primary">{mvp58PersonalWorkflow.title}</h3>
                  <p className="text-[10px] text-text-muted leading-relaxed">{mvp58PersonalWorkflow.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp58PersonalWorkflow.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-2 text-[10px] ${settingsPersonalWorkflowService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-80">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      <p className="mt-1 opacity-75 leading-relaxed">{chip.helper}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mvp58PersonalWorkflow.steps.map((step, index) => (
                    <div key={step.id} className={`rounded-xl border p-3 text-[10px] ${settingsPersonalWorkflowService.getToneClassName(step.tone)}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded-full border border-current/20 bg-black/10 px-2 py-0.5 text-[9px] font-bold">第 {index + 1} 步</span>
                        <span className="text-[9px] opacity-75">{step.actionLabel}</span>
                      </div>
                      <p className="text-[11px] font-bold opacity-90">{step.title}</p>
                      <p className="mt-1 leading-relaxed opacity-80">{step.description}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-text-muted leading-relaxed border-t border-border-color/30 pt-2">{mvp58PersonalWorkflow.helper}</p>
              </section>

              <section id="mvp71-settings-user-facing-simplification" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-300 tracking-wider">设置页精简</p>
                    <h3 className="mt-1 text-xs font-bold text-text-primary">日常设置只保留资源库入口</h3>
                    <p id="mvp72-settings-daily-workflow-cleanup" className="mt-1 text-[10px] text-text-muted leading-relaxed">
                      {mvp72DailySurface.settingsRules[0]}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">AI 维护后置</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mvp72DailySurface.settingsRules.map((rule) => (
                    <p key={rule} className="rounded-xl border border-border-color/45 bg-card-bg/35 p-3 text-[10px] text-text-secondary leading-relaxed">• {rule}</p>
                  ))}
                </div>
              </section>

              <section id="mvp80-settings-daily-finalize" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-border-color/30 pb-3">
                  <div>
                    <p className="text-[10px] font-bold text-sky-300 tracking-wider">日常设置检查</p>
                    <h3 className="mt-1 text-xs font-bold text-text-primary">设置页只保留日常入口和安全说明</h3>
                    <p className="mt-1 text-[10px] text-text-muted leading-relaxed">{mvp80DailyFinalize.summary}</p>
                  </div>
                  <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[9px] font-bold text-sky-100 whitespace-nowrap">工程信息后置</span>
                </div>
                <div id="mvp80-settings-daily-cards" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mvp80DailyFinalize.settingsCards.map((card) => (
                    <div key={card.id} className={`rounded-xl border p-3 text-[10px] leading-relaxed ${settingsDiagnosticsDailyFinalizeService.getToneClassName(card.tone)}`}>
                      <p className="text-[11px] font-bold text-text-primary mb-1">{card.title}</p>
                      <p className="opacity-80 mb-2">{card.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {card.items.map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div id="mvp80-settings-hidden-engineering-terms" className="sr-only">
                  {mvp80DailyFinalize.hiddenEngineeringTerms.join(' / ')} 默认进入高级诊断或 AI 维护区。
                </div>
              </section>

              <details id="mvp71-settings-ai-maintenance-area" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
                <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-amber-200 tracking-wider">AI 维护区 / 开发者详情</p>
                    <h3 className="mt-1 text-xs font-bold text-text-primary">桌面端状态与历史验证默认折叠</h3>
                    <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
                      桌面端、扫描预览、写入预览和历史验证保留在这里，需要维护时再展开。
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-100 whitespace-nowrap">默认折叠</span>
                </summary>
                <div className="mt-4 space-y-4">

              {/* MVP-16 Renderer-Side Electron Status Probe */}
              <div className="bg-cyan-500/5 border border-cyan-500/15 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-border-color/30 pb-3">
                  <div className="flex items-start space-x-2.5">
                    <HardDrive className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        桌面端状态
                      </h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        用于确认桌面端连接状态；不会自动扫描或修改文件。
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-1 rounded-full border font-mono font-bold whitespace-nowrap ${
                      runtimeProbe.mode === "electron-stub"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : runtimeProbe.mode === "probe-error"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                          : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                    }`}
                  >
                    {runtimeProbe.mode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-[10px] text-cyan-100">
                    <p className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold">
                      Status
                    </p>
                    <p className="mt-1 font-semibold">
                      {runtimeProbe.statusLabel}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 text-[10px] text-text-secondary">
                    <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                      连接状态
                    </p>
                    <p className="mt-1 font-mono text-text-primary">
                      window.yangKura = {String(runtimeProbe.bridgeDetected)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-100">
                    <p className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">
                      文件访问
                    </p>
                    <p className="mt-1 font-semibold">当前未启用</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {runtimeProbe.capabilities.slice(0, 6).map((capability) => (
                    <div
                      key={capability.key}
                      className={`rounded-lg border p-2 text-[10px] ${
                        capability.tone === "safe"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                          : capability.tone === "blocked"
                            ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                            : "border-border-color/50 bg-card-bg/30 text-text-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">
                          {capability.label}
                        </span>
                        <span className="font-mono break-all">
                          {String(capability.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  {runtimeProbe.notes.slice(0, 3).map((note) => (
                    <p
                      key={note}
                      className="text-[10px] text-text-muted leading-relaxed"
                    >
                      • {note}
                    </p>
                  ))}
                </div>
              </div>

                </div>
              </details>

              {/* MVP-19 Electron Directory Dialog */}
              <div className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-border-color/30 pb-3">
                  <div className="flex items-start space-x-2.5">
                    <FolderOpen className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        选择本地资源库目录
                      </h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        桌面端会打开系统目录选择器。主界面只显示目录名称和授权状态，真实路径仅保留在主进程侧。
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono font-bold whitespace-nowrap">
                    {directoryDialogMvp19Contract.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectLocalRoot("asmr")}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600/80 text-white text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>选择音声库目录</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectLocalRoot("music")}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600/80 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>选择音乐库目录</span>
                  </button>
                </div>

                {directoryPickerMessage && (
                  <p className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-[10px] text-blue-100 leading-relaxed">
                    {directoryPickerMessage}
                  </p>
                )}

                <div className="rounded-2xl border border-border-color/60 bg-card-bg/40 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">上次资源库</h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        {librarySessionService.getUserFacingStatus(librarySessionSnapshot)}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full bg-white/5 text-text-muted border border-border-color/60 font-bold whitespace-nowrap">
                      本机记录
                    </span>
                  </div>
                  {librarySessionSnapshot.lastIndex && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                      <div className="rounded-xl bg-black/10 border border-border-color/40 p-2">
                        <p className="text-[9px] text-text-muted">目录</p>
                        <p className="text-[11px] font-bold text-text-primary truncate">{librarySessionSnapshot.lastIndex.displayName}</p>
                      </div>
                      <div className="rounded-xl bg-black/10 border border-border-color/40 p-2">
                        <p className="text-[9px] text-text-muted">集合</p>
                        <p className="text-[11px] font-bold text-text-primary">{librarySessionSnapshot.lastIndex.collectionCount}</p>
                      </div>
                      <div className="rounded-xl bg-black/10 border border-border-color/40 p-2">
                        <p className="text-[9px] text-text-muted">音轨</p>
                        <p className="text-[11px] font-bold text-text-primary">{librarySessionSnapshot.lastIndex.trackCount}</p>
                      </div>
                      <div className="rounded-xl bg-black/10 border border-border-color/40 p-2">
                        <p className="text-[9px] text-text-muted">上次读取</p>
                        <p className="text-[11px] font-bold text-text-primary truncate">
                          {librarySessionSnapshot.lastIndex.readAt ? new Date(librarySessionSnapshot.lastIndex.readAt).toLocaleString() : "未记录"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-violet-100">
                        打包版快速导入
                      </h3>
                      <p className="text-[10px] text-violet-100/80 mt-1 leading-relaxed">
                        选好目录后，已有 library-index.json 时可以直接读取；第一次使用或资源变更时，点击“一键扫描并应用”。该流程只写入/备份 index，不修改媒体文件。
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded-full bg-violet-500/10 text-violet-200 border border-violet-500/20 font-bold whitespace-nowrap">
                      推荐入口
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 space-y-2">
                      <p className="text-[11px] font-bold text-text-primary">音声库</p>
                      <p className="text-[10px] text-text-muted break-all">
                        {hasSelectedRootToken("asmr") ? "已选择目录，可读取现有 index 或重新扫描。" : "先点击上方“选择音声库目录”。"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReadLibraryIndex("asmr")}
                          disabled={!hasSelectedRootToken("asmr") || isReadingIndex || isQuickImporting}
                          className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isReadingIndex ? "读取中..." : "读取现有 index"}
                        </button>
                        <button
                          onClick={() => handleQuickScanWriteRead("asmr")}
                          disabled={!hasSelectedRootToken("asmr") || isQuickImporting}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isQuickImporting ? "处理中..." : "一键扫描并应用"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 space-y-2">
                      <p className="text-[11px] font-bold text-text-primary">音乐库</p>
                      <p className="text-[10px] text-text-muted break-all">
                        {hasSelectedRootToken("music") ? "已选择目录，可读取现有 index 或重新扫描。" : "先点击上方“选择音乐库目录”。"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReadLibraryIndex("music")}
                          disabled={!hasSelectedRootToken("music") || isReadingIndex || isQuickImporting}
                          className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isReadingIndex ? "读取中..." : "读取现有 index"}
                        </button>
                        <button
                          onClick={() => handleQuickScanWriteRead("music")}
                          disabled={!hasSelectedRootToken("music") || isQuickImporting}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isQuickImporting ? "处理中..." : "一键扫描并应用"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {quickImportMessage && (
                    <p className="rounded-xl border border-violet-500/20 bg-black/10 p-3 text-[10px] text-violet-100 leading-relaxed">
                      {quickImportMessage}
                    </p>
                  )}
                  {indexReadMessage && !indexWriteResult?.ok && (
                    <p className="rounded-xl border border-violet-500/20 bg-black/10 p-3 text-[10px] text-violet-100 leading-relaxed">
                      {indexReadMessage}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-[10px] text-blue-100">
                    <p className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">
                      Renderer 可见
                    </p>
                    <p className="mt-1 font-mono break-all">
                      目录令牌 / 显示名称 / 资源类型
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 text-[10px] text-text-secondary">
                    <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                      安全对照
                    </p>
                    <p className="mt-1 font-mono break-all">
                      {directoryPickerStubContract.stubResult.rootPathToken}
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-100">
                    <p className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">
                      真实路径
                    </p>
                    <p className="mt-1 font-semibold">
                      不返回 absolutePath / file://
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {directoryDialogMvp19Contract.securityRules
                    .slice(0, 5)
                    .map((rule) => (
                      <p
                        key={rule}
                        className="text-[10px] text-text-muted leading-relaxed"
                      >
                        • {rule}
                      </p>
                    ))}
                </div>
              </div>

              <div id="mvp54-settings-regression-path" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary"><span className="sr-only">Beta 回归路径</span>{mvp54BetaRegression.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp54BetaRegression.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-200 whitespace-nowrap">维护记录</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {mvp54BetaRegression.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-2 text-[10px] ${betaRegressionChecklistService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-80">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      <p className="mt-1 opacity-75 leading-relaxed">{chip.helper}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed border-t border-border-color/30 pt-2">{mvp54BetaRegression.helper}</p>
              </div>

              <div id="mvp39-advanced-library-tools" className="rounded-2xl border border-border-color/60 bg-card-bg/45 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">高级资源库工具</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                      日常使用只需要选择目录、读取现有记录或一键扫描并应用。扫描预览、写入预览和安全流程继续折叠在这里；更详细的 Electron / IPC / 验证信息统一放到诊断页。
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAdvancedLibraryTools((value) => !value)}
                    className="px-3 py-2 rounded-xl border border-border-color/70 bg-card-bg hover:bg-hover-bg text-xs font-bold text-text-primary transition-all cursor-pointer"
                  >
                    {showAdvancedLibraryTools ? "收起高级工具" : "展开高级工具"}
                  </button>
                </div>
                {!showAdvancedLibraryTools && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-text-muted">
                    <div className="rounded-xl border border-border-color/40 bg-black/10 p-3">扫描预览：只读检查目录结构</div>
                    <div className="rounded-xl border border-border-color/40 bg-black/10 p-3">写入预览：确认资源记录摘要</div>
                    <div className="rounded-xl border border-border-color/40 bg-black/10 p-3">安全流程：不改动媒体文件</div>
                  </div>
                )}
              </div>

              {showAdvancedLibraryTools && (
                <div className="space-y-5">
              {/* MVP-20 read-only dry-run scanner */}
              <div className="bg-emerald-500/5 border border-emerald-500/15 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-border-color/30 pb-3">
                  <div className="flex items-start space-x-2.5">
                    <HardDrive className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        扫描预览（只读）
                      </h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        选择目录后可立即生成扫描预览。该操作只读取目录项和文件统计，不写
                        library-index.json，不返回真实路径，不删除/移动/重命名文件。
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-bold whitespace-nowrap">
                    read-only
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRunDryRunPreview("asmr")}
                    disabled={isDryRunning}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isDryRunning ? "扫描中..." : "预览音声库扫描"}</span>
                  </button>
                  <button
                    onClick={() => handleRunDryRunPreview("music")}
                    disabled={isDryRunning}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isDryRunning ? "扫描中..." : "预览音乐库扫描"}</span>
                  </button>
                </div>

                {dryRunMessage && (
                  <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-100 leading-relaxed">
                    {dryRunMessage}
                  </p>
                )}

                {dryRunPreview?.ok && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 text-[10px]">
                      <p className="text-text-muted">发现条目</p>
                      <p className="mt-1 text-lg font-mono font-bold text-text-primary">
                        {dryRunPreview.summary.discoveredEntryCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 text-[10px]">
                      <p className="text-text-muted">音轨候选</p>
                      <p className="mt-1 text-lg font-mono font-bold text-text-primary">
                        {dryRunPreview.summary.trackCandidateCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 text-[10px]">
                      <p className="text-text-muted">封面候选</p>
                      <p className="mt-1 text-lg font-mono font-bold text-text-primary">
                        {dryRunPreview.summary.coverCandidateCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border-color/50 bg-card-bg/30 p-3 text-[10px]">
                      <p className="text-text-muted">字幕候选</p>
                      <p className="mt-1 text-lg font-mono font-bold text-text-primary">
                        {dryRunPreview.summary.subtitleCandidateCount}
                      </p>
                    </div>
                  </div>
                )}

                {dryRunPreview?.ok &&
                  dryRunPreview.discoveredEntries.length > 0 && (
                    <div className="rounded-xl border border-border-color/50 bg-black/10 p-3 space-y-2">
                      <h4 className="text-[11px] font-bold text-text-primary">
                        前 8 条相对路径预览
                      </h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {dryRunPreview.discoveredEntries
                          .slice(0, 8)
                          .map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between gap-3 text-[10px] rounded-lg bg-card-bg/30 border border-border-color/40 px-2.5 py-1.5"
                            >
                              <span className="font-mono text-text-secondary truncate">
                                {entry.relativePath}
                              </span>
                              <span className="text-emerald-300 font-mono flex-shrink-0">
                                {entry.entryKind}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {dryRunPreview?.ok && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-[11px] font-bold text-blue-100">
                          生成资源库记录预览
                        </h4>
                        <p className="text-[10px] text-blue-100/80 mt-1 leading-relaxed">
                          根据最近一次扫描预览生成资源库记录摘要
                          预览对象；不会真正写文件，真实写入放到下一轮确认。
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateIndexWritePreview}
                        disabled={isGeneratingIndexPreview}
                        className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isGeneratingIndexPreview
                          ? "生成中..."
                          : "生成写入预览"}
                      </button>
                    </div>

                    {indexPreviewMessage && (
                      <p className="rounded-lg border border-blue-500/20 bg-black/10 p-2 text-[10px] text-blue-100 leading-relaxed">
                        {indexPreviewMessage}
                      </p>
                    )}

                    {indexWritePreview?.ok && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                          <p className="text-text-muted">集合</p>
                          <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                            {indexWritePreview.summary.collectionCount}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                          <p className="text-text-muted">音轨</p>
                          <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                            {indexWritePreview.summary.trackCount}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                          <p className="text-text-muted">封面</p>
                          <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                            {indexWritePreview.summary.coverCount}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                          <p className="text-text-muted">字幕</p>
                          <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                            {indexWritePreview.summary.subtitleCount}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                          <p className="text-text-muted">预览文件</p>
                          <p className="mt-0.5 text-[10px] font-mono font-bold text-text-primary truncate">
                            {indexWritePreview.proposedIndexFileName}
                          </p>
                        </div>
                      </div>
                    )}

                    {indexWritePreview?.ok && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-[11px] font-bold text-emerald-100">
                              确认应用资源库记录
                            </h4>
                            <p className="text-[10px] text-emerald-100/80 mt-1 leading-relaxed">
                              将预览内容写入用户选择的目录根部。若已有同名文件，会先生成 backup。仍不写 SQLite，不改动媒体文件。
                            </p>
                          </div>
                          <button
                            onClick={handleWriteLibraryIndex}
                            disabled={isWritingIndex}
                            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isWritingIndex ? "写入中..." : "确认写入 index"}
                          </button>
                        </div>

                        {indexWriteMessage && (
                          <p className="rounded-lg border border-emerald-500/20 bg-black/10 p-2 text-[10px] text-emerald-100 leading-relaxed">
                            {indexWriteMessage}
                          </p>
                        )}

                        {indexWriteResult?.ok && (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                              <p className="text-text-muted">已写集合</p>
                              <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                                {indexWriteResult.summary.collectionCount}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                              <p className="text-text-muted">已写音轨</p>
                              <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                                {indexWriteResult.summary.trackCount}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                              <p className="text-text-muted">字节</p>
                              <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                                {indexWriteResult.bytesWritten}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                              <p className="text-text-muted">备份</p>
                              <p className="mt-0.5 text-[10px] font-mono font-bold text-text-primary truncate">
                                {indexWriteResult.backupRelativePath || "无旧文件"}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                              <p className="text-text-muted">SHA256</p>
                              <p className="mt-0.5 text-[10px] font-mono font-bold text-text-primary truncate">
                                {indexWriteResult.sha256.slice(0, 12)}…
                              </p>
                            </div>
                          </div>
                        )}



                        {indexWriteResult?.ok && (
                          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="text-[11px] font-bold text-violet-100">
                                  读取并应用资源库记录
                                </h4>
                                <p className="text-[10px] text-violet-100/80 mt-1 leading-relaxed">
                                  读取刚写入的 index，并把集合 / 音轨映射到现有音声库与音乐库页面。仍不读取音频正文、不返回真实路径。
                                </p>
                              </div>
                              <button
                                onClick={() => handleReadLibraryIndex(indexWriteResult.libraryType)}
                                disabled={isReadingIndex}
                                className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {isReadingIndex ? "读取中..." : "读取并应用 index"}
                              </button>
                            </div>

                            {indexReadMessage && (
                              <p className="rounded-lg border border-violet-500/20 bg-black/10 p-2 text-[10px] text-violet-100 leading-relaxed">
                                {indexReadMessage}
                              </p>
                            )}

                            {indexReadResult?.ok && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                                  <p className="text-text-muted">读取集合</p>
                                  <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                                    {indexReadResult.summary.collectionCount}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                                  <p className="text-text-muted">读取音轨</p>
                                  <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                                    {indexReadResult.summary.trackCount}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                                  <p className="text-text-muted">字节</p>
                                  <p className="mt-0.5 text-base font-mono font-bold text-text-primary">
                                    {indexReadResult.bytesRead}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-border-color/50 bg-card-bg/30 p-2 text-[10px]">
                                  <p className="text-text-muted">应用状态</p>
                                  <p className="mt-0.5 text-[10px] font-bold text-emerald-300">
                                    已通知主界面刷新
                                  </p>
                                </div>
                              </div>
                            )}

                            {indexReadResult && !indexReadResult.ok && (
                              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-100 leading-relaxed">
                                {indexReadResult.message}
                              </div>
                            )}
                          </div>
                        )}

                        {indexWriteResult && !indexWriteResult.ok && (
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-100 leading-relaxed">
                            {indexWriteResult.message}
                          </div>
                        )}
                      </div>
                    )}

                    {indexWritePreview && !indexWritePreview.ok && (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-100 leading-relaxed">
                        {indexWritePreview.message}
                      </div>
                    )}
                  </div>
                )}

                {dryRunPreview && !dryRunPreview.ok && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-[10px] text-rose-100 leading-relaxed">
                    {dryRunPreview.message}
                  </div>
                )}
              </div>

              {/* MVP-07 Scanner Contract UI Flow */}
              <div className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-border-color/30 pb-3">
                  <div className="flex items-start space-x-2.5">
                    <ShieldAlert className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        扫描前安全流程
                      </h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        这里把未来真实 scanner
                        的用户操作流提前展示出来。当前仍只保存 Demo
                        路径文本，不访问真实目录、不写 library-index.json。
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono font-bold whitespace-nowrap">
                    {scannerUiFlow.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed font-semibold">
                  <span className="font-mono mr-1">安全门槛：</span>
                  {scannerUiFlow.gateLabel}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {scannerUiFlow.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="bg-card-bg/30 border border-border-color/60 rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[11px] font-bold text-text-primary">
                          {phase.title}
                        </h4>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            phase.status === "current-demo"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : phase.status === "planned"
                                ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                : "bg-red-500/10 text-red-300 border border-red-500/20"
                          }`}
                        >
                          {phase.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        {phase.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                          Allowed
                        </p>
                        {phase.allowedActions.slice(0, 3).map((item) => (
                          <div
                            key={item}
                            className="text-[10px] text-text-secondary leading-relaxed"
                          >
                            ✓ {item}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-red-300 font-bold">
                          Blocked
                        </p>
                        {phase.blockedActions.slice(0, 3).map((item) => (
                          <div
                            key={item}
                            className="text-[10px] text-red-200/75 leading-relaxed"
                          >
                            × {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-card-bg/25 border border-border-color/50 rounded-xl p-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-text-primary">
                      只读扫描安全限制
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {scannerUiFlow.limits.map((limit) => (
                        <div
                          key={limit.key}
                          className="p-2.5 rounded-lg bg-card-bg/30 border border-border-color/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-text-primary">
                              {limit.label}
                            </span>
                            <span className="text-[9px] font-mono text-blue-300">
                              {limit.value}
                            </span>
                          </div>
                          <p className="text-[9px] text-text-muted leading-relaxed mt-1">
                            {limit.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card-bg/25 border border-border-color/50 rounded-xl p-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-text-primary">
                      扫描前安全确认 Checklist
                    </h4>
                    <div className="space-y-2">
                      {scannerUiFlow.preflightChecklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-card-bg/30 border border-border-color/40"
                        >
                          <p className="text-[10px] text-text-secondary leading-relaxed">
                            {item.required ? "必选 · " : ""}
                            {item.label}
                          </p>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap ${
                              item.currentState === "satisfied-by-demo"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : item.currentState === "planned-only"
                                  ? "bg-blue-500/10 text-blue-300"
                                  : "bg-red-500/10 text-red-300"
                            }`}
                          >
                            {item.currentState}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg/25 border border-border-color/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-text-primary">
                    用户可见流程
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {scannerUiFlow.userVisibleSteps.map((step, index) => (
                      <div
                        key={step}
                        className="text-[10px] text-text-secondary leading-relaxed bg-card-bg/30 border border-border-color/40 rounded-lg p-2.5"
                      >
                        <span className="font-mono text-brand-color mr-1">
                          {index + 1}.
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-300 pt-2 font-semibold">
                    下一步：{scannerUiFlow.nextDevelopmentStep}
                  </p>
                </div>
              </div>
                </div>
              )}

              {/* ASMR (RJ) 仓库 */}
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-color/30 pb-3">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        ASMR / RJ 音声库目录
                      </h3>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        添加本地音声目录；网络源和元数据同步后续再接。
                      </p>
                    </div>
                  </div>
                </div>

                {/* ASMR Path List */}
                <div className="space-y-2.5">
                  {(settings.asmrPaths || []).map((pathItem) => (
                    <div
                      key={pathItem.id}
                      className="flex items-center justify-between bg-card-bg/20 border border-border-color/60 p-3.5 rounded-xl hover:border-brand-color/30 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          {pathItem.type === "local" ? (
                            <HardDrive className="w-4 h-4" />
                          ) : pathItem.type === "openlist" ? (
                            <Globe className="w-4 h-4" />
                          ) : (
                            <Cloud className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-text-primary truncate">
                              {pathItem.label || "未命名仓库"}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                pathItem.type === "local"
                                  ? "bg-amber-500/15 text-amber-500"
                                  : pathItem.type === "openlist"
                                    ? "bg-indigo-500/15 text-indigo-400"
                                    : "bg-pink-500/15 text-pink-400"
                              }`}
                            >
                              {pathItem.type === "local"
                                ? "本地路径"
                                : pathItem.type === "openlist"
                                  ? "OpenList"
                                  : "WebDAV"}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">
                            {pathItem.path}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = (settings.asmrPaths || []).filter(
                            (p) => p.id !== pathItem.id,
                          );
                          updateSettings({ asmrPaths: updated });
                        }}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="卸载该仓库"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(settings.asmrPaths || []).length === 0 && (
                    <div className="text-center py-6 text-[11px] text-text-muted">
                      暂无挂载的 ASMR 仓库，请在下方添加
                    </div>
                  )}
                </div>

                {/* Add ASMR Path Form */}
                <div className="bg-card-bg/20 border border-border-color/40 p-4 rounded-xl space-y-3 pt-3">
                  <span className="text-[10px] font-bold text-brand-color uppercase tracking-wider block">
                    添加新 ASMR 挂载源
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">
                        挂载源类型
                      </label>
                      <select
                        value={newAsmrType}
                        onChange={(e) => setNewAsmrType(e.target.value as any)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary cursor-pointer"
                      >
                        <option value="local">
                          📁 本地文件夹
                        </option>
                        <option value="openlist">
                          🌐 OpenList 共享网络列表 (JSON URL)
                        </option>
                        <option value="webdav">
                          ☁️ WebDAV / 网盘 (Cloud Storage)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">
                        仓库别名 / 自定义标签
                      </label>
                      <input
                        type="text"
                        placeholder="例如：我的主音声库"
                        value={newAsmrLabel}
                        onChange={(e) => setNewAsmrLabel(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">
                        路径令牌或网络 URL
                      </label>
                      <input
                        type="text"
                        placeholder={
                          newAsmrType === "local"
                            ? "建议使用上方“选择目录”生成资源库令牌"
                            : newAsmrType === "openlist"
                              ? "后置：OpenList JSON URL"
                              : "后置：WebDAV 地址"
                        }
                        value={newAsmrPath}
                        onChange={(e) => setNewAsmrPath(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        if (!newAsmrPath.trim()) {
                          alert("请输入路径或 URL！");
                          return;
                        }
                        const label =
                          newAsmrLabel.trim() ||
                          (newAsmrType === "local"
                            ? "本地 ASMR 仓库"
                            : newAsmrType === "openlist"
                              ? "OpenList网络源"
                              : "WebDAV网盘源");
                        const newPath: LibraryPath = {
                          id: "asmr-" + Date.now().toString(),
                          type: newAsmrType,
                          path: newAsmrPath.trim(),
                          label,
                        };
                        updateSettings({
                          asmrPaths: [...(settings.asmrPaths || []), newPath],
                        });
                        setNewAsmrLabel("");
                        setNewAsmrPath("");
                      }}
                      className="flex items-center space-x-1.5 px-4.5 py-2 rounded-lg bg-brand-color text-white text-xs font-bold hover:scale-105 transition-all cursor-pointer shadow shadow-brand-color/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>保存路径记录</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pop Music 仓库 */}
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-color/30 pb-3">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">
                        音乐库路径
                      </h3>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        音乐库同样支持本地目录记录；网络源保持后置。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Music Path List */}
                <div className="space-y-2.5">
                  {(settings.musicPaths || []).map((pathItem) => (
                    <div
                      key={pathItem.id}
                      className="flex items-center justify-between bg-card-bg/20 border border-border-color/60 p-3.5 rounded-xl hover:border-brand-color/30 transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          {pathItem.type === "local" ? (
                            <HardDrive className="w-4 h-4" />
                          ) : pathItem.type === "openlist" ? (
                            <Globe className="w-4 h-4" />
                          ) : (
                            <Cloud className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-text-primary truncate">
                              {pathItem.label || "未命名仓库"}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                pathItem.type === "local"
                                  ? "bg-amber-500/15 text-amber-500"
                                  : pathItem.type === "openlist"
                                    ? "bg-indigo-500/15 text-indigo-400"
                                    : "bg-pink-500/15 text-pink-400"
                              }`}
                            >
                              {pathItem.type === "local"
                                ? "本地路径"
                                : pathItem.type === "openlist"
                                  ? "OpenList"
                                  : "WebDAV"}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">
                            {pathItem.path}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = (settings.musicPaths || []).filter(
                            (p) => p.id !== pathItem.id,
                          );
                          updateSettings({ musicPaths: updated });
                        }}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="卸载该仓库"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(settings.musicPaths || []).length === 0 && (
                    <div className="text-center py-6 text-[11px] text-text-muted">
                      暂无挂载的流行音乐仓库，请在下方添加
                    </div>
                  )}
                </div>

                {/* Add Music Path Form */}
                <div className="bg-card-bg/20 border border-border-color/40 p-4 rounded-xl space-y-3 pt-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    添加新流行音乐源
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">
                        挂载源类型
                      </label>
                      <select
                        value={newMusicType}
                        onChange={(e) => setNewMusicType(e.target.value as any)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary cursor-pointer"
                      >
                        <option value="local">
                          📁 本地文件夹
                        </option>
                        <option value="openlist">
                          🌐 OpenList 共享网络列表 (JSON URL)
                        </option>
                        <option value="webdav">
                          ☁️ WebDAV / 网盘 (Cloud Storage)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">
                        仓库别名 / 自定义标签
                      </label>
                      <input
                        type="text"
                        placeholder="例如：我的音乐库"
                        value={newMusicLabel}
                        onChange={(e) => setNewMusicLabel(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">
                        路径令牌或网络 URL
                      </label>
                      <input
                        type="text"
                        placeholder={
                          newMusicType === "local"
                            ? "建议使用上方“选择目录”生成资源库令牌"
                            : newMusicType === "openlist"
                              ? "后置：OpenList JSON URL"
                              : "后置：WebDAV 地址"
                        }
                        value={newMusicPath}
                        onChange={(e) => setNewMusicPath(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        if (!newMusicPath.trim()) {
                          alert("请输入路径或 URL！");
                          return;
                        }
                        const label =
                          newMusicLabel.trim() ||
                          (newMusicType === "local"
                            ? "本地音乐仓库"
                            : newMusicType === "openlist"
                              ? "OpenList网络源"
                              : "WebDAV网盘源");
                        const newPath: LibraryPath = {
                          id: "music-" + Date.now().toString(),
                          type: newMusicType,
                          path: newMusicPath.trim(),
                          label,
                        };
                        updateSettings({
                          musicPaths: [...(settings.musicPaths || []), newPath],
                        });
                        setNewMusicLabel("");
                        setNewMusicPath("");
                      }}
                      className="flex items-center space-x-1.5 px-4.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:scale-105 transition-all cursor-pointer shadow shadow-emerald-600/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>保存路径记录</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 关于与隐私 */}
          {activeTab === "about" && (
            <div className="space-y-5 animate-fade-in">
              {/* About Product */}
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-4.5 h-4.5 text-blue-400" />
                  <h3 className="text-xs font-bold text-text-primary">
                    关于本品
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs leading-relaxed text-text-secondary">
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">产品名称</span>
                    <span className="text-brand-color font-semibold">Yang-Kura</span>
                  </div>
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">产品定位</span>
                    <span className="text-text-primary font-semibold">个人本地媒体库</span>
                  </div>
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">当前阶段</span>
                    <span className="text-text-primary font-semibold">个人可用 Beta 0.1</span>
                  </div>
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">数据路线</span>
                    <span className="text-text-primary">Local JSON Index 优先，SQLite 后置</span>
                  </div>
                  <p className="text-text-muted text-[11px] mt-2 leading-relaxed">
                    {mvp58AboutModel.description}
                  </p>
                </div>
              </div>

              <section id="mvp58-about-personal-privacy" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp58AboutModel.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp58AboutModel.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">个人本地</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp58AboutModel.privacyItems.map((item) => (
                    <div key={item.id} className={`rounded-xl border px-3 py-3 text-[10px] ${settingsPersonalWorkflowService.getToneClassName(item.tone)}`}>
                      <p className="font-bold opacity-90">{item.title}</p>
                      <p className="mt-1 leading-relaxed opacity-80">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">个人使用说明</p>
                    <div className="space-y-1.5">
                      {mvp58AboutModel.personalUseNotes.map((note) => (
                        <p key={note} className="text-[10px] text-text-secondary leading-relaxed">• {note}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                    <p className="text-[10px] font-bold text-amber-100 mb-2">继续后置</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mvp58AboutModel.deferred.map((item) => (
                        <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <details id="mvp80-settings-history-folded" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
                <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-amber-200 tracking-wider">AI 维护区 / 历史记录</p>
                    <h3 className="mt-1 text-xs font-bold text-text-primary">Beta、Electron、GUI 回归记录默认折叠</h3>
                    <p className="mt-1 text-[10px] text-text-muted leading-relaxed">这些记录用于 AI 维护与版本追溯，日常设置无需展开。</p>
                  </div>
                  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-100 whitespace-nowrap">默认折叠</span>
                </summary>
                <div className="mt-4 space-y-4">
              <section id="mvp60-beta-candidate-summary" className="rounded-2xl border border-brand-color/20 bg-brand-color/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp60BetaCandidate.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp60BetaCandidate.description}</p>
                  </div>
                  <span className="rounded-full border border-brand-color/20 bg-brand-color/10 px-2.5 py-1 text-[9px] font-bold text-brand-color whitespace-nowrap">Beta 候选</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp60BetaCandidate.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-3 text-[10px] ${betaCandidateCloseoutService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-90">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      {chip.helper && <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">候选包使用顺序</p>
                    <div className="space-y-2">
                      {mvp60BetaCandidate.useFlow.map((item) => (
                        <div key={item.id} className={`rounded-lg border px-3 py-2 text-[10px] ${betaCandidateCloseoutService.getToneClassName(item.tone)}`}>
                          <p className="font-bold opacity-90">{item.title} · {item.status}</p>
                          <p className="mt-1 leading-relaxed opacity-80">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">候选包边界</p>
                    <div className="space-y-1.5">
                      {mvp60BetaCandidate.boundaryNotes.map((note) => (
                        <p key={note} className="text-[10px] text-emerald-50/80 leading-relaxed">• {note}</p>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-amber-100 mt-3 mb-2">继续后置</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mvp60BetaCandidate.deferred.map((item) => (
                        <span key={item} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp61-local-regression-fix" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp61LocalRegression.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp61LocalRegression.description}</p>
                  </div>
                  <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[9px] font-bold text-sky-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp61LocalRegression.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-3 text-[10px] ${localRegressionFixService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-90">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      {chip.helper && <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">本机 GUI 回归顺序</p>
                    <div className="space-y-2">
                      {mvp61LocalRegression.localFlow.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${localRegressionFixService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title}</p>
                          <p className="mt-1 font-mono text-[9px] opacity-80">{step.command}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">收口说明</p>
                    <div className="space-y-1.5">
                      {mvp61LocalRegression.notes.map((note) => (
                        <p key={note} className="text-[10px] text-emerald-50/80 leading-relaxed">• {note}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>



              <section id="mvp66-beta-gui-regression" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp66BetaGuiRegression.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp66BetaGuiRegression.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp66BetaGuiRegression.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-3 text-[10px] ${betaGuiRegressionService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-90">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      {chip.helper && <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">GUI 回归顺序</p>
                    <div className="space-y-2">
                      {mvp66BetaGuiRegression.localFlow.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${betaGuiRegressionService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title} · {step.status}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                    <p className="text-[10px] font-bold text-sky-100 mb-2">通过标准</p>
                    <div className="space-y-1.5">
                      {mvp66BetaGuiRegression.passCriteria.map((item) => (
                        <p key={item} className="text-[10px] text-sky-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp67-beta-rc-closeout" className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp67BetaRcCloseout.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp67BetaRcCloseout.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp67BetaRcCloseout.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-3 text-[10px] ${betaRcCloseoutService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-90">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      {chip.helper && <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">已确认真实链路</p>
                    <div className="space-y-2">
                      {mvp67BetaRcCloseout.confirmedFlow.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${betaRcCloseoutService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title} · {step.status}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                    <p className="text-[10px] font-bold text-sky-100 mb-2">RC 收口检查</p>
                    <div className="space-y-1.5">
                      {mvp67BetaRcCloseout.rcChecks.map((item) => (
                        <p key={item} className="text-[10px] text-sky-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 space-y-1">
                      {mvp67BetaRcCloseout.knownNotes.map((item) => (
                        <p key={item} className="text-[9px] text-amber-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp70-beta-final-handoff" className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp70BetaFinalHandoff.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp70BetaFinalHandoff.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp70BetaFinalHandoff.cards.map((card) => (
                    <div key={card.id} className={`rounded-xl border px-3 py-3 text-[10px] ${betaFinalHandoffService.getToneClassName(card.tone)}`}>
                      <p className="font-bold opacity-90">{card.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{card.value}</p>
                      {card.helper && <p className="mt-1 leading-relaxed opacity-75">{card.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">用户已确认链路</p>
                    <div className="space-y-1.5">
                      {mvp70BetaFinalHandoff.userConfirmedFlow.map((item) => (
                        <p key={item} className="text-[10px] text-emerald-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                    <p className="text-[10px] font-bold text-sky-100 mb-2">轻量验证</p>
                    <div className="space-y-1 font-mono text-[9px] text-sky-50/80">
                      {mvp70BetaFinalHandoff.codexLightCheck.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                    <p className="text-[10px] font-bold text-amber-100 mb-2">交接规则</p>
                    <div className="space-y-1.5">
                      {mvp70BetaFinalHandoff.handoffRules.map((item) => (
                        <p key={item} className="text-[10px] text-amber-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp69-beta-release-candidate" className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp69BetaReleaseCandidate.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp69BetaReleaseCandidate.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp69BetaReleaseCandidate.cards.map((card) => (
                    <div key={card.id} className={`rounded-xl border px-3 py-3 text-[10px] ${betaReleaseCandidateService.getToneClassName(card.tone)}`}>
                      <p className="font-bold opacity-90">{card.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{card.value}</p>
                      {card.helper && <p className="mt-1 leading-relaxed opacity-75">{card.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">已确认能力</p>
                    <div className="space-y-1.5">
                      {mvp69BetaReleaseCandidate.confirmedCapabilities.map((item) => (
                        <p key={item} className="text-[10px] text-emerald-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                    <p className="text-[10px] font-bold text-sky-100 mb-2">RC 检查</p>
                    <div className="space-y-2">
                      {mvp69BetaReleaseCandidate.releaseChecklist.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${betaReleaseCandidateService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title} · {step.status}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                    <p className="text-[10px] font-bold text-amber-100 mb-2">非阻塞项</p>
                    <div className="space-y-1.5">
                      {mvp69BetaReleaseCandidate.knownNonBlockingItems.map((item) => (
                        <p key={item} className="text-[10px] text-amber-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp68-beta-rc-user-guide" className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp68BetaRcUserGuide.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp68BetaRcUserGuide.description}</p>
                  </div>
                  <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[9px] font-bold text-sky-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp68BetaRcUserGuide.cards.map((card) => (
                    <div key={card.id} className={`rounded-xl border px-3 py-3 text-[10px] ${betaRcUserGuideService.getToneClassName(card.tone)}`}>
                      <p className="font-bold opacity-90">{card.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{card.value}</p>
                      {card.helper && <p className="mt-1 leading-relaxed opacity-75">{card.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">首次使用流程</p>
                    <div className="space-y-2">
                      {mvp68BetaRcUserGuide.firstRunGuide.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${betaRcUserGuideService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title} · {step.status}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                    <p className="text-[10px] font-bold text-sky-100 mb-2">打包 / 启动说明</p>
                    <div className="space-y-1.5">
                      {mvp68BetaRcUserGuide.packagingGuide.map((item) => (
                        <p key={item} className="text-[10px] text-sky-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                    <p className="text-[10px] font-bold text-amber-100 mb-2">诊断页折叠计划</p>
                    <div className="space-y-1.5">
                      {mvp68BetaRcUserGuide.diagnosticsFoldPlan.map((item) => (
                        <p key={item} className="text-[10px] text-amber-50/80 leading-relaxed">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp64-diagnostics-black-view-fix" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp64DiagnosticsBlackViewFix.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp64DiagnosticsBlackViewFix.description}</p>
                  </div>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp64DiagnosticsBlackViewFix.summary.map((item) => (
                    <div key={item.id} className={`rounded-xl border px-3 py-3 text-[10px] ${diagnosticsBlackViewFixService.getToneClassName(item.tone)}`}>
                      <p className="font-bold opacity-90">{item.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">本机复测重点</p>
                    <div className="space-y-1.5">
                      {mvp64DiagnosticsBlackViewFix.nextRetest.map((step) => (
                        <p key={step} className="text-[10px] text-text-muted leading-relaxed">• {step}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">安全边界</p>
                    <div className="space-y-1.5">
                      {mvp64DiagnosticsBlackViewFix.safetyBoundary.map((rule) => (
                        <p key={rule} className="text-[10px] text-emerald-50/80 leading-relaxed">• {rule}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp63-electron-binary-path-fix" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp63ElectronBinaryPathFix.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp63ElectronBinaryPathFix.description}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp63ElectronBinaryPathFix.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-3 text-[10px] ${electronBinaryPathFixService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-90">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      {chip.helper && <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">本机复测顺序</p>
                    <div className="space-y-2">
                      {mvp63ElectronBinaryPathFix.testFlow.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${electronBinaryPathFixService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title}</p>
                          <p className="mt-1 font-mono text-[9px] opacity-80">{step.command}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">修复说明</p>
                    <div className="space-y-1.5">
                      {mvp63ElectronBinaryPathFix.notes.map((note) => (
                        <p key={note} className="text-[10px] text-emerald-50/80 leading-relaxed">• {note}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>


              <section id="mvp62-electron-regression-hardening" className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp62ElectronHardening.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp62ElectronHardening.description}</p>
                  </div>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-bold text-cyan-100 whitespace-nowrap">维护记录</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {mvp62ElectronHardening.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-3 text-[10px] ${electronRegressionHardeningService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-90">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      {chip.helper && <p className="mt-1 leading-relaxed opacity-75">{chip.helper}</p>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                    <p className="text-[10px] font-bold text-text-primary mb-2">Electron GUI 回归顺序</p>
                    <div className="space-y-2">
                      {mvp62ElectronHardening.guiFlow.map((step) => (
                        <div key={step.id} className={`rounded-lg border px-3 py-2 text-[10px] ${electronRegressionHardeningService.getToneClassName(step.tone)}`}>
                          <p className="font-bold opacity-90">{step.title}</p>
                          <p className="mt-1 font-mono text-[9px] opacity-80">{step.command}</p>
                          <p className="mt-1 leading-relaxed opacity-75">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-[10px] font-bold text-emerald-100 mb-2">本轮收口说明</p>
                    <div className="space-y-1.5">
                      {mvp62ElectronHardening.notes.map((note) => (
                        <p key={note} className="text-[10px] text-emerald-50/80 leading-relaxed">• {note}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div id="mvp55-settings-component-health" className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{mvp55ComponentHealth.title}</h3>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{mvp55ComponentHealth.description}</p>
                  </div>
                  <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[9px] font-bold text-purple-100 whitespace-nowrap">维护记录</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {mvp55ComponentHealth.chips.map((chip) => (
                    <div key={chip.id} className={`rounded-xl border px-3 py-2 text-[10px] ${componentHealthReviewService.getToneClassName(chip.tone)}`}>
                      <p className="font-bold opacity-80">{chip.label}</p>
                      <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                      <p className="mt-1 opacity-75 leading-relaxed">{chip.helper}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed border-t border-border-color/30 pt-2">{mvp55ComponentHealth.helper}</p>
              </div>

                </div>
              </details>

              {/* Privacy Card */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                  <h3 className="text-xs font-bold text-emerald-400">
                    本地隐私与文件安全说明
                  </h3>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-text-secondary leading-relaxed">
                    Yang-Kura
                    的核心设计是个人本地使用优先。当前阶段只做本地资源库记录、播放与字幕展示，隐私和文件安全规则如下：
                  </p>
                  <ul className="list-disc pl-4 space-y-2.5 text-[11px] text-text-muted leading-relaxed pt-1.5">
                    <li>
                      <strong>不上传真实媒体</strong>
                      ：不会上传 ASMR/RJ 与本地音乐文件，播放记录和资源库记录默认留在本机。
                    </li>
                    <li>
                      <strong>本地记录优先</strong>：MVP 阶段继续使用 library-index.json 和本机记录；SQLite 后置。
                    </li>
                    <li>
                      <strong>纯净无广告，不索取高危权限</strong>
                      ：不接在线账号、云同步或广告分析；高级功能继续后置。
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
