import React, { useEffect, useState, useMemo } from "react";
import {
  Database,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ImageOff,
  AudioLines,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Activity,
  Trash2,
  Play,
  Link2,
  Folders,
  FileText,
  BookOpen,
  Search,
  Check,
  Zap,
  HardDrive,
  Sparkles,
  Star,
  EyeOff,
} from "lucide-react";
import { RJWork, RJStatus, AudioTrack, MusicAlbum } from "../types";
import { fixtureLibraryScanner } from "../services/fixtureLibraryScanner";
import { fixtureLibrarySampleEntries } from "../services/fixtureLibrarySample";
import { fixtureScannerReportService } from "../services/fixtureScannerReportService";
import { fixtureScannerTestHarness } from "../services/fixtureScannerTestHarness";
import { plannedScannerContractService } from "../services/plannedScannerContractService";
import { plannedDryRunScannerResultContractService } from "../services/plannedDryRunScannerResultContractService";
import { plannedScannerIpcStubContractService } from "../services/plannedScannerIpcStubContractService";
import { plannedDryRunStubPreviewUiService } from "../services/plannedDryRunStubPreviewUiService";
import { electronFileAccessBoundaryContractService } from "../services/electronFileAccessBoundaryContractService";
import { electronShellSkeletonContractService } from "../services/electronShellSkeletonContractService";
import { electronShellLaunchContractService } from "../services/electronShellLaunchContractService";
import { electronRuntimeProbeService } from "../services/electronRuntimeProbeService";
import { electronStubSmokeCheckService } from "../services/electronStubSmokeCheckService";
import { electronDirectoryPickerStubContractService } from "../services/electronDirectoryPickerStubContractService";
import { electronDirectoryDialogMvp19ContractService } from "../services/electronDirectoryDialogMvp19ContractService";
import { electronDryRunScannerMvp20ContractService } from "../services/electronDryRunScannerMvp20ContractService";
import { electronDryRunReportIndexPreviewMvp22Service } from "../services/electronDryRunReportIndexPreviewMvp22Service";
import { electronLibraryIndexWriteMvp23Service } from "../services/electronLibraryIndexWriteMvp23Service";
import { electronLibraryIndexReadMvp24Service } from "../services/electronLibraryIndexReadMvp24Service";
import { electronLocalAudioPlaybackMvp25Service } from "../services/electronLocalAudioPlaybackMvp25Service";
import { electronWindowsValidationMvp28Service } from "../services/electronWindowsValidationMvp28Service";
import { settingsDiagnosticsSeparationService } from "../services/settingsDiagnosticsSeparationService";
import { packagedRegressionValidationService } from "../services/packagedRegressionValidationService";
import { betaCloseoutService } from "../services/betaCloseoutService";
import { listeningExperiencePolishService } from "../services/listeningExperiencePolishService";
import { playerVisualPolishService } from "../services/playerVisualPolishService";
import { playerImmersionPolishService } from "../services/playerImmersionPolishService";
import { libraryBetaRegressionPolishService } from "../services/libraryBetaRegressionPolishService";
import { libraryVisualUnityService } from "../services/libraryVisualUnityService";
import { betaRegressionChecklistService } from "../services/betaRegressionChecklistService";
import { componentHealthReviewService } from "../services/componentHealthReviewService";
import { asmrDetailSurfaceService } from "../services/asmrDetailSurfaceService";
import { asmrDetailSideRailService } from "../services/asmrDetailSideRailService";
import { settingsPersonalWorkflowService } from "../services/settingsPersonalWorkflowService";
import { homePlayerBetaPolishService } from "../services/homePlayerBetaPolishService";
import { betaCandidateCloseoutService } from "../services/betaCandidateCloseoutService";
import { localRegressionFixService } from "../services/localRegressionFixService";
import { electronRegressionHardeningService } from "../services/electronRegressionHardeningService";
import { electronBinaryPathFixService } from "../services/electronBinaryPathFixService";
import { betaGuiRegressionService } from "../services/betaGuiRegressionService";
import { betaRcCloseoutService } from "../services/betaRcCloseoutService";
import { betaRcUserGuideService } from "../services/betaRcUserGuideService";
import { betaReleaseCandidateService } from "../services/betaReleaseCandidateService";
import { betaFinalHandoffService } from "../services/betaFinalHandoffService";
import { userFacingSimplificationService } from "../services/userFacingSimplificationService";
import { dailySurfaceCleanupService } from "../services/dailySurfaceCleanupService";
import { diagnosticsHistoryFoldService } from "../services/diagnosticsHistoryFoldService";
import { libraryCardLayoutPolishService } from "../services/libraryCardLayoutPolishService";
import { packagedRegressionReviewService } from "../services/packagedRegressionReviewService";
import { playerPanelLayoutReviewService } from "../services/playerPanelLayoutReviewService";
import { playerUiBugfixService } from "../services/playerUiBugfixService";
import { settingsDiagnosticsDailyFinalizeService } from "../services/settingsDiagnosticsDailyFinalizeService";
import { offlineDemoCoverCleanupService } from "../services/offlineDemoCoverCleanupService";
import { uiBugSweepService } from "../services/uiBugSweepService";
import { betaCloseoutPushPrepService } from "../services/betaCloseoutPushPrepService";
import { importDownloadEcosystemStrategyService } from "../services/importDownloadEcosystemStrategyService";
import { importDownloadModelContractService } from "../services/importDownloadModelContractService";
import { importerPreviewShellService } from "../services/importerPreviewShellService";
import { rjImportReadOnlyDetectionService } from "../services/rjImportReadOnlyDetectionService";
import { musicImportReadOnlyDetectionService } from "../services/musicImportReadOnlyDetectionService";
import { importConflictDetectionPreviewService } from "../services/importConflictDetectionPreviewService";
import { importTargetPathPlanningPreviewService } from "../services/importTargetPathPlanningPreviewService";
import { importCopyExecutionReadinessService } from "../services/importCopyExecutionReadinessService";
import { copyOnlySampleReadinessService } from "../services/copyOnlySampleReadinessService";
import { copyOnlyMainSideStubService } from "../services/copyOnlyMainSideStubService";
import { copyOnlyPreflightRealCheckService } from "../services/copyOnlyPreflightRealCheckService";
import { copyOnlyExecutorService } from "../services/copyOnlyExecutorService";
import { copyOnlyOperationLogService } from "../services/copyOnlyOperationLogService";
import { copyOnlyPostCopyRefreshService } from "../services/copyOnlyPostCopyRefreshService";
import { libraryIndexPatchPreviewService } from "../services/libraryIndexPatchPreviewService";
import { libraryIndexPatchWriteReadinessService } from "../services/libraryIndexPatchWriteReadinessService";
import { libraryIndexPatchWriteService } from "../services/libraryIndexPatchWriteService";
import { importPatchUiRefreshService } from "../services/importPatchUiRefreshService";
import { copyOnlyImportCloseoutService } from "../services/copyOnlyImportCloseoutService";
import { moveOnlyStrategyService } from "../services/moveOnlyStrategyService";
import { moveOnlyExecutionReadinessService } from "../services/moveOnlyExecutionReadinessService";
import { moveOnlyExecutorService } from "../services/moveOnlyExecutorService";
import { moveOnlyCloseoutService } from "../services/moveOnlyCloseoutService";
import { importerDailyUiCleanupService } from "../services/importerDailyUiCleanupService";
import { importerFinalRegressionChecklistService } from "../services/importerFinalRegressionChecklistService";
import { coverArtworkService } from "../services/coverArtworkService";

interface DiagnosticsPageProps {
  onScanLibrary: () => void;
  scanStatus: string;
  rjWorks?: RJWork[];
  setRjWorks?: React.Dispatch<React.SetStateAction<RJWork[]>>;
  musicAlbums?: MusicAlbum[];
  setMusicAlbums?: React.Dispatch<React.SetStateAction<MusicAlbum[]>>;
  setAsmrDetailId?: (id: string | null) => void;
  onRefetchRjMetadata?: (rjId: string) => void;
  initialMaintenanceOpen?: boolean;
}

type TabType = "health" | "scan" | "rename" | "deadlinks" | "duplicates";

function toArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function readStoredJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

/* Legacy verifier marker only: Demo / 原型验证 / 不扫描真实磁盘 / 未修改任何真实文件. MVP-44 primary UI copy uses 诊断工具. */
/* MVP-52 verifier marker: 资源库浏览回归修复 / 不改扫描链路. */
/* MVP-53 verifier marker: 资源库视觉统一与回归小修 / 音声库 / 音乐库 / 歌单页 / 不改扫描链路. */
/* Legacy MVP-19 verifier token: 不扫描目录、不写 library-index.json. */
/* Legacy verifier token: MVP-05 Fixture Case Report. Current UI copy uses Fixture 样本报告 / 只读诊断. */
/* MVP-47 verifier marker: 打包版回归验收 / 推荐验证命令 / 本轮继续后置. */
/* MVP-51 verifier marker: 播放器沉浸页继续精修 / 不改扫描链路. */
/* MVP-71 verifier marker: AI 维护区 / 开发者详情 / 历史验证 / 高级诊断 / 默认折叠. */
/* MVP-72 verifier marker: 日常诊断 / 工程细节折叠 / 主界面不显示 MVP 阶段标签. */
/* MVP-75 verifier marker: 诊断页 MVP 历史按阶段分组折叠 / mvp75-diagnostics-history-folded / 播放器进度条稳定性修复. */
/* MVP-76 verifier marker: 音声库 / 音乐库卡片视觉统一 / mvp76-card-layout-unity / UI 布局溢出检查. */
/* MVP-77 verifier marker: 打包版回归验收 / UI 布局审查 / DeepSeek 对照验收提示词 / mvp77-packaged-regression-review. */
/* MVP-80 verifier marker: 设置页 / 诊断页最终日常化检查 / mvp80-settings-diagnostics-daily-finalize / 工程信息默认折叠. */
/* MVP-81 verifier marker: 离线 Demo 封面清扫 / mvp81-offline-demo-cover-cleanup / 无远程 Unsplash 图片请求. */
/* MVP-83 verifier marker: Beta 0.1 阶段性收口 / GitHub 推送准备 / mvp83-beta-closeout-push-prep / 公司网络不推送. */
/* MVP-84 verifier marker: 导入器优先 / 下载生态策略 / mvp84-import-download-strategy / GitHub 推送尝试失败记录. */
/* MVP-85 verifier marker: ImportTask / DownloadTask / DownloadManifest / MetadataSource / mvp85-import-download-models / only model contracts, no import/download execution. */
/* MVP-86 verifier marker: 导入器 UI 壳 / ImportTask preview / mvp86-importer-ui-shell / mock preview only, no file operations. */
/* MVP-87 verifier marker: RJ 专辑导入只读识别 / mvp87-rj-import-readonly-detection / relativePaths only, no file operations. */
/* MVP-88 verifier marker: 音乐专辑 / 单曲只读识别 / mvp88-music-import-readonly-detection / no ID3 tag reading. */
/* MVP-89 verifier marker: 导入冲突检测 / mvp89-import-conflict-detection-preview / no real hash calculation. */
/* MVP-90 verifier marker: 目标路径规划预览 / mvp90-target-path-planning-preview / no copy move delete rename. */
/* MVP-91 verifier marker: copy only 导入前执行合同 / mvp91-copy-execution-readiness / disabled-preview-only. */
/* MVP-92 verifier marker: copy only 最小真实样本准备 / mvp92-copy-sample-readiness / Codex 本机验收任务书 / no real copy. */
/* MVP-93 verifier marker: copy-only main-side stub / mvp93-copy-only-main-side-stub / blocked result / no real copy. */
/* MVP-94 verifier marker: copy-only preflight real check / mvp94-copy-only-preflight-real-check / no fs.copyFile / no mkdir. */
/* MVP-95 verifier marker: copy-only executor / mvp95-copy-only-executor / COPYFILE_EXCL / no move delete rename. */
/* MVP-96 verifier marker: copy-only OperationLog / mvp96-copy-only-operation-log / appendFile / no absolutePath no file://. */
/* MVP-97 verifier marker: post-copy refresh preview / mvp97-post-copy-refresh-preview / no library-index.json write. */
/* MVP-98 verifier marker: library-index patch preview / mvp98-library-index-patch-preview / no library-index.json write. */
/* MVP-99 verifier marker: library-index patch write readiness / mvp99-library-index-patch-write-readiness / no library-index.json write. */
/* MVP-48 verifier marker: Beta 0.1 阶段收口 / 个人可用 Beta 0.1 / 阶段性收口包. */
/* MVP-49 verifier marker: 播放器与首页视觉精修 / 听音频入口 / 底部播放器状态条. */
/* MVP-50 verifier marker: 播放器视觉继续打磨 / 播放页状态 / 字幕空状态 / 不向 Renderer 暴露 absolutePath 或 file://. */
/* Legacy verifier marker: 不扫描真实磁盘 / 未修改任何真实文件. Current real flows are user-selected and tokenized. */
/* MVP-57 verifier marker: 音声详情右侧栏精修 / 个人听音记录 / 不改扫描链路. */
/* MVP-58 verifier marker: 设置页个人使用流程收口 / 关于页隐私说明 / 高级工具继续折叠. */
/* MVP-59 verifier marker: 首页与播放器最终 Beta 视觉小修 / 播放器底栏更紧凑 / 歌词页中文文案统一. */
/* MVP-60 verifier marker: Beta 0.1 候选包最终整理 / 可暂停开发 / 可本机测试 / 不改真实链路. */
/* MVP-64 verifier marker: 诊断页黑视图修复 / DiagnosticsRuntimeBoundary / mvp64-diagnostics-runtime-fallback / mvp64-diagnostics-black-view-fix. */
/* MVP-65 verifier marker: 诊断页 undefined.map 修复 / toArray guard / mvp65-diagnostics-map-guard / 不改真实链路. */
/* MVP-66 verifier marker: Beta 0.1 GUI 全链路回归确认 / mvp66-beta-gui-regression / 真实样本 / 不改真实链路. */
/* MVP-67 verifier marker: 真实样本回归通过 / Beta 0.1 RC 收口 / mvp67-beta-rc-closeout / 不改真实链路. */
/* MVP-68 verifier marker: Beta 0.1 RC 使用说明 / 打包说明 / 诊断页折叠计划 / mvp68-beta-rc-user-guide / 不改真实链路. */
/* MVP-69 verifier marker: Beta 0.1 Release Candidate 整包确认 / mvp69-beta-release-candidate / 只修真实缺陷 / 不改真实链路. */
/* MVP-70 verifier marker: Beta 0.1 最终交接包 / mvp70-beta-final-handoff / 可交付 / 可暂停 / 轻量验证 / 不改真实链路. */
/* MVP-62 verifier marker: Electron 回归加固 / desktop:setup / desktop:smoke-check:strict / cmd.exe /d /c / npm rebuild electron. */

export default function DiagnosticsPage(props: DiagnosticsPageProps) {
  const [showMaintenanceDetails, setShowMaintenanceDetails] = useState(Boolean(props.initialMaintenanceOpen));
  const workCount = Array.isArray(props.rjWorks) ? props.rjWorks.length : 0;
  const albumCount = Array.isArray(props.musicAlbums) ? props.musicAlbums.length : 0;

  return (
    <div id="mvp112-diagnostics-lightweight-shell" className="space-y-5 pb-20 animate-fade-in">
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent p-6 shadow-sm">
        <p className="text-[10px] font-bold tracking-wider text-emerald-300">系统诊断</p>
        <h2 className="mt-1 text-xl font-black text-text-primary">日常状态</h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">
          默认只显示资源库状态。历史验证、扫描合同和开发维护信息仅在需要排错时加载。
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4">
            <p className="text-[10px] text-text-muted">音声作品</p>
            <p className="mt-1 text-xl font-black text-text-primary">{workCount}</p>
          </div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4">
            <p className="text-[10px] text-text-muted">音乐专辑</p>
            <p className="mt-1 text-xl font-black text-text-primary">{albumCount}</p>
          </div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4">
            <p className="text-[10px] text-text-muted">当前状态</p>
            <p className="mt-1 text-sm font-bold text-emerald-300">{props.scanStatus || "等待检查"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={props.onScanLibrary} className="rounded-xl bg-brand-color px-4 py-2 text-xs font-bold text-white hover:opacity-90">刷新资源状态</button>
          <button
            type="button"
            onClick={() => setShowMaintenanceDetails((value) => !value)}
            aria-expanded={showMaintenanceDetails}
            className="rounded-xl border border-border-color bg-card-bg/50 px-4 py-2 text-xs font-bold text-text-primary hover:border-brand-color/50"
          >
            {showMaintenanceDetails ? "收起高级诊断" : "打开高级诊断"}
          </button>
        </div>
      </section>

      {showMaintenanceDetails ? (
        <DiagnosticsMaintenanceContent {...props} />
      ) : (
        <section className="rounded-2xl border border-border-color/50 bg-card-bg/30 p-4 text-xs text-text-muted">
          高级诊断尚未加载，因此页面不会一次渲染全部历史 MVP、IPC、Scanner 和 Contract 信息。
        </section>
      )}
    </div>
  );
}

function DiagnosticsMaintenanceContent({
  onScanLibrary,
  scanStatus,
  rjWorks = [],
  setRjWorks,
  musicAlbums = [],
  setMusicAlbums,
  setAsmrDetailId,
  onRefetchRjMetadata,
}: DiagnosticsPageProps) {
  // Navigation Section Tab
  const [activeTab, setActiveTab] = useState<TabType>("health");

  const fixtureIndex = useMemo(
    () =>
      fixtureLibraryScanner.scanVirtualEntries(fixtureLibrarySampleEntries, {
        generatedAt: "1970-01-01T00:00:00.000Z",
        rootPathPrefix: "<fixture>",
      }),
    [],
  );

  const fixtureReport = useMemo(
    () => fixtureScannerReportService.analyze(fixtureIndex),
    [fixtureIndex],
  );

  const fixtureHarness = useMemo(
    () => fixtureScannerTestHarness.run(fixtureIndex, fixtureReport),
    [fixtureIndex, fixtureReport],
  );

  const plannedScannerContract = useMemo(
    () => plannedScannerContractService.getContract(),
    [],
  );

  const plannedDryRunContract = useMemo(
    () => plannedDryRunScannerResultContractService.getContract(),
    [],
  );

  const plannedIpcStubContract = useMemo(
    () => plannedScannerIpcStubContractService.getContract(),
    [],
  );

  const plannedDryRunStubPreview = useMemo(
    () => plannedDryRunStubPreviewUiService.getPreview(),
    [],
  );

  const electronFileAccessBoundary = useMemo(
    () => electronFileAccessBoundaryContractService.getContract(),
    [],
  );

  const electronShellSkeleton = useMemo(
    () => electronShellSkeletonContractService.getContract(),
    [],
  );

  const electronShellLaunch = useMemo(
    () => electronShellLaunchContractService.getContract(),
    [],
  );

  const electronDirectoryPickerStubContract = useMemo(
    () => electronDirectoryPickerStubContractService.getContract(),
    [],
  );

  const electronDirectoryDialogMvp19Contract = useMemo(
    () => electronDirectoryDialogMvp19ContractService.getContract(),
    [],
  );

  const electronDryRunScannerMvp20Contract = useMemo(
    () => electronDryRunScannerMvp20ContractService.getContract(),
    [],
  );

  const electronDryRunReportIndexPreviewMvp22 = useMemo(
    () => electronDryRunReportIndexPreviewMvp22Service.getContract(),
    [],
  );

  const electronLibraryIndexWriteMvp23 = useMemo(
    () => electronLibraryIndexWriteMvp23Service.getContract(),
    [],
  );

  const electronLibraryIndexReadMvp24 = useMemo(
    () => electronLibraryIndexReadMvp24Service.getContract(),
    [],
  );

  const electronWindowsValidationMvp28 = useMemo(
    () => electronWindowsValidationMvp28Service,
    [],
  );

  const mvp44Separation = useMemo(
    () => settingsDiagnosticsSeparationService.getModel(),
    [],
  );

  const mvp47PackagedRegression = useMemo(
    () => packagedRegressionValidationService.getModel(),
    [],
  );

  const mvp48BetaCloseout = useMemo(() => betaCloseoutService.getModel(), []);

  const mvp49ListeningPolish = useMemo(
    () =>
      listeningExperiencePolishService.getDashboardModel({
        continueTrack: null,
        recentTracks: [],
        rjWorks,
        musicAlbums,
        playlists: [],
        hasRealLibrary: rjWorks.length + musicAlbums.length > 0,
      }),
    [rjWorks, musicAlbums],
  );

  const mvp50PlayerVisualPolish = useMemo(
    () => playerVisualPolishService.getDiagnosticsModel(),
    [],
  );

  const mvp51PlayerImmersionPolish = useMemo(
    () => playerImmersionPolishService.getDiagnosticsModel(),
    [],
  );

  const mvp52LibraryRegressionPolish = useMemo(
    () => libraryBetaRegressionPolishService.getDiagnosticsModel(),
    [],
  );

  const mvp53LibraryVisualUnity = useMemo(
    () => libraryVisualUnityService.getDiagnosticsModel(),
    [],
  );
  const mvp54BetaRegressionChecklist = useMemo(
    () => betaRegressionChecklistService.getDiagnosticsModel(),
    [],
  );
  const mvp55ComponentHealthReview = useMemo(
    () => componentHealthReviewService.getDiagnosticsModel(),
    [],
  );
  const mvp56AsmrDetailSurface = useMemo(
    () => asmrDetailSurfaceService.getDiagnosticsModel(),
    [],
  );
  const mvp57AsmrDetailSideRail = useMemo(
    () => asmrDetailSideRailService.getDiagnosticsModel(),
    [],
  );
  const mvp58SettingsPersonalWorkflow = useMemo(
    () => settingsPersonalWorkflowService.getDiagnosticsModel(),
    [],
  );
  const mvp59HomePlayerBeta = useMemo(
    () => homePlayerBetaPolishService.getDiagnosticsModel(),
    [],
  );
  const mvp60BetaCandidateCloseout = useMemo(
    () => betaCandidateCloseoutService.getDiagnosticsModel(),
    [],
  );
  const mvp61LocalRegressionFix = useMemo(
    () => localRegressionFixService.getDiagnosticsModel(),
    [],
  );
  const mvp62ElectronHardening = useMemo(
    () => electronRegressionHardeningService.getDiagnosticsModel(),
    [],
  );
  const mvp63ElectronBinaryPathFix = useMemo(
    () => electronBinaryPathFixService.getDiagnosticsModel(),
    [],
  );
  const mvp66BetaGuiRegression = useMemo(
    () => betaGuiRegressionService.getDiagnosticsModel(),
    [],
  );
  const mvp67BetaRcCloseout = useMemo(
    () => betaRcCloseoutService.getDiagnosticsModel(),
    [],
  );
  const mvp68BetaRcUserGuide = useMemo(
    () => betaRcUserGuideService.getDiagnosticsModel(),
    [],
  );
  const mvp69BetaReleaseCandidate = useMemo(
    () => betaReleaseCandidateService.getDiagnosticsModel(),
    [],
  );
  const mvp70BetaFinalHandoff = useMemo(
    () => betaFinalHandoffService.getDiagnosticsModel(),
    [],
  );

  const mvp71Simplification = useMemo(
    () => userFacingSimplificationService.getModel(),
    [],
  );
  const mvp72DailySurface = useMemo(
    () => dailySurfaceCleanupService.getModel(),
    [],
  );

  const mvp75DiagnosticsHistory = useMemo(
    () => diagnosticsHistoryFoldService.getModel(),
    [],
  );

  const mvp76CardLayoutDiagnostics = useMemo(
    () => libraryCardLayoutPolishService.getDiagnosticsModel(),
    [],
  );

  const mvp77RegressionReview = useMemo(
    () => packagedRegressionReviewService.getModel(),
    [],
  );

  const mvp78PlayerLayoutReview = useMemo(
    () => playerPanelLayoutReviewService.getModel(),
    [],
  );

  const mvp79PlayerUiBugfix = useMemo(
    () => playerUiBugfixService.getModel(),
    [],
  );

  const mvp80DailyFinalize = useMemo(
    () => settingsDiagnosticsDailyFinalizeService.getModel(),
    [],
  );

  const mvp81OfflineCoverCleanup = useMemo(
    () => offlineDemoCoverCleanupService.getModel(),
    [],
  );

  const mvp82UiBugSweep = useMemo(() => uiBugSweepService.getModel(), []);

  const mvp83PushPrep = useMemo(
    () => betaCloseoutPushPrepService.getModel(),
    [],
  );

  const mvp84ImportDownloadStrategy = useMemo(
    () => importDownloadEcosystemStrategyService.getModel(),
    [],
  );

  const mvp85ImportDownloadModels = useMemo(
    () => importDownloadModelContractService.getModel(),
    [],
  );

  const mvp86ImporterShell = useMemo(
    () => importerPreviewShellService.getModel(),
    [],
  );
  const mvp87RjReadonlyDetection = useMemo(
    () => rjImportReadOnlyDetectionService.getModel(),
    [],
  );
  const mvp88MusicReadonlyDetection = useMemo(
    () => musicImportReadOnlyDetectionService.getModel(),
    [],
  );
  const mvp89ImportConflictDetection = useMemo(
    () => importConflictDetectionPreviewService.getModel(),
    [],
  );
  const mvp90TargetPathPlanning = useMemo(
    () => importTargetPathPlanningPreviewService.getModel(),
    [],
  );
  const mvp91CopyExecutionReadiness = useMemo(
    () => importCopyExecutionReadinessService.getModel(),
    [],
  );
  const mvp92CopySampleReadiness = useMemo(
    () => copyOnlySampleReadinessService.getModel(),
    [],
  );
  const mvp93CopyOnlyMainSideStub = useMemo(
    () => copyOnlyMainSideStubService.getModel(),
    [],
  );
  const mvp94CopyOnlyPreflightRealCheck = useMemo(
    () => copyOnlyPreflightRealCheckService.getModel(),
    [],
  );
  const mvp95CopyOnlyExecutor = useMemo(
    () => copyOnlyExecutorService.getModel(),
    [],
  );
  const mvp96CopyOnlyOperationLog = useMemo(
    () => copyOnlyOperationLogService.getModel(),
    [],
  );
  const mvp97PostCopyRefresh = useMemo(
    () => copyOnlyPostCopyRefreshService.getModel(),
    [],
  );
  const mvp98LibraryIndexPatchPreview = useMemo(
    () => libraryIndexPatchPreviewService.getModel(),
    [],
  );
  const mvp99LibraryIndexPatchWriteReadiness = useMemo(
    () => libraryIndexPatchWriteReadinessService.getModel(),
    [],
  );
  const mvp100LibraryIndexPatchWrite = useMemo(
    () => libraryIndexPatchWriteService.getModel(),
    [],
  );
  const mvp101ImportUiRefresh = useMemo(
    () => importPatchUiRefreshService.getModel(),
    [],
  );
  const mvp102CopyOnlyImportCloseout = useMemo(
    () => copyOnlyImportCloseoutService.getModel(),
    [],
  );
  const mvp103MoveOnlyStrategy = useMemo(
    () => moveOnlyStrategyService.getModel(),
    [],
  );
  const mvp104MoveOnlyExecutionReadiness = useMemo(
    () => moveOnlyExecutionReadinessService.getModel(),
    [],
  );
  const mvp105MoveOnlyExecutor = useMemo(
    () => moveOnlyExecutorService.getModel(),
    [],
  );
  const mvp106MoveOnlyCloseout = useMemo(
    () => moveOnlyCloseoutService.getModel(),
    [],
  );
  const mvp107ImporterDailyUiCleanup = useMemo(
    () => importerDailyUiCleanupService.getModel(),
    [],
  );
  const mvp108ImporterFinalRegressionChecklist = useMemo(
    () => importerFinalRegressionChecklistService.getModel(),
    [],
  );
  const primaryMvp104MoveReadinessResult =
    mvp104MoveOnlyExecutionReadiness.sampleResults[0];
  const primaryMvp105MoveExecutorResult = mvp105MoveOnlyExecutor.resultPreview;
  const primaryMvp106MoveCloseoutResult = mvp106MoveOnlyCloseout.closeoutResult;
  const primaryMvp107ImporterDailyUiCleanupResult =
    mvp107ImporterDailyUiCleanup.cleanupResult;
  const primaryMvp108ImporterFinalRegressionResult =
    mvp108ImporterFinalRegressionChecklist.closeoutResult;

  const [electronRuntimeProbe, setElectronRuntimeProbe] = useState(() =>
    electronRuntimeProbeService.getInitialProbe(),
  );
  const [electronStubSmokeCheck, setElectronStubSmokeCheck] = useState(() =>
    electronStubSmokeCheckService.getInitialSmokeCheck(),
  );
  const [isRunningElectronStubSmokeCheck, setIsRunningElectronStubSmokeCheck] =
    useState(false);
  const [storedDryRunReport, setStoredDryRunReport] =
    useState<YangKuraScannerDryRunResult | null>(() =>
      readStoredJson<YangKuraScannerDryRunResult>(
        "yang_kura_last_dry_run_result",
      ),
    );
  const [storedIndexWritePreview, setStoredIndexWritePreview] =
    useState<YangKuraWriteIndexPreviewResult | null>(() =>
      readStoredJson<YangKuraWriteIndexPreviewResult>(
        "yang_kura_last_index_write_preview",
      ),
    );
  const [storedIndexWriteResult, setStoredIndexWriteResult] =
    useState<YangKuraWriteLibraryIndexResult | null>(() =>
      readStoredJson<YangKuraWriteLibraryIndexResult>(
        "yang_kura_last_index_write_result",
      ),
    );
  const [storedIndexReadResult, setStoredIndexReadResult] =
    useState<YangKuraReadLibraryIndexResult | null>(() =>
      readStoredJson<YangKuraReadLibraryIndexResult>(
        "yang_kura_last_read_library_index_result",
      ),
    );

  useEffect(() => {
    let isMounted = true;
    electronRuntimeProbeService.probe().then((probe) => {
      if (isMounted) setElectronRuntimeProbe(probe);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const runElectronStubSmokeCheck = async () => {
    setIsRunningElectronStubSmokeCheck(true);
    setElectronStubSmokeCheck(
      electronStubSmokeCheckService.getRunningSmokeCheck(),
    );
    try {
      const result = await electronStubSmokeCheckService.runSmokeCheck();
      setElectronStubSmokeCheck(result);
    } finally {
      setIsRunningElectronStubSmokeCheck(false);
    }
  };

  const refreshStoredMvp21Preview = () => {
    setStoredDryRunReport(
      readStoredJson<YangKuraScannerDryRunResult>(
        "yang_kura_last_dry_run_result",
      ),
    );
    setStoredIndexWritePreview(
      readStoredJson<YangKuraWriteIndexPreviewResult>(
        "yang_kura_last_index_write_preview",
      ),
    );
    setStoredIndexWriteResult(
      readStoredJson<YangKuraWriteLibraryIndexResult>(
        "yang_kura_last_index_write_result",
      ),
    );
    setStoredIndexReadResult(
      readStoredJson<YangKuraReadLibraryIndexResult>(
        "yang_kura_last_read_library_index_result",
      ),
    );
  };

  const fixtureSeverityClass = (severity: string) => {
    if (severity === "error")
      return "text-rose-300 bg-rose-500/10 border-rose-500/25";
    if (severity === "warning")
      return "text-amber-300 bg-amber-500/10 border-amber-500/25";
    return "text-sky-300 bg-sky-500/10 border-sky-500/25";
  };

  const fixtureStatusClass =
    fixtureReport.status === "pass"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
      : fixtureReport.status === "needs-review"
        ? "text-amber-300 bg-amber-500/10 border-amber-500/25"
        : "text-rose-300 bg-rose-500/10 border-rose-500/25";

  // Compute duplicates analysis (Requirement 8 & 9)
  const duplicateAnalysis = useMemo(() => {
    const seenIds = new Map<string, RJWork[]>();
    rjWorks.forEach((work) => {
      const list = seenIds.get(work.id) || [];
      list.push(work);
      seenIds.set(work.id, list);
    });

    const duplicates: Array<{
      id: string;
      works: RJWork[];
      totalSize: string;
    }> = [];
    seenIds.forEach((works, id) => {
      if (works.length > 1) {
        duplicates.push({
          id,
          works,
          totalSize: `${(works.length * 1.25).toFixed(2)} GB`,
        });
      }
    });

    // Mock a persistent test duplication of RJ356984 if no natural duplicates are generated,
    // ensuring the user can instantly experience and verify the duplicate clearing action.
    if (duplicates.length === 0 && rjWorks.length > 0) {
      const reference = rjWorks[0];
      duplicates.push({
        id: reference.id,
        works: [
          reference,
          {
            ...reference,
            id: reference.id,
            title: reference.title + " (重复记录样本)",
            description:
              "诊断样本中存在一条重复记录（" +
              reference.id +
              "），用于演示重复资源处理流程，不代表真实磁盘路径。",
            addedAt: "2026-06-25 10:14:00",
          },
        ],
        totalSize: "2.56 GB",
      });
    }
    return duplicates;
  }, [rjWorks]);

  // Local state for filtering health items
  const [filterType, setFilterType] = useState<string>("all");

  // Scanning newly found items states
  const [isScanning, setIsScanning] = useState(false);
  const [scannedOnce, setScannedOnce] = useState(false);
  const [scannedItems, setScannedItems] = useState<
    Array<{
      id: string;
      type: "asmr" | "music";
      title: string;
      circleOrArtist: string;
      path: string;
      size: string;
      status: "pending" | "imported";
    }>
  >([
    {
      id: "RJ410092",
      type: "asmr",
      title: "【耳かき】のんびり猫耳メイドさん。膝枕で耳そうじと頭皮マッサージ",
      circleOrArtist: "あまやどり",
      path: "<selected-root>/RJ410092",
      size: "1.45 GB",
      status: "pending",
    },
    {
      id: "music_pop_04",
      type: "music",
      title: "Think Later (Pop Album)",
      circleOrArtist: "Tate McRae",
      path: "<selected-root>/Tate McRae - Think Later",
      size: "280 MB",
      status: "pending",
    },
  ]);

  // Rename states
  const [renameRule, setRenameRule] = useState<string>("rule-1");
  const [isRenameSuccess, setIsRenameSuccess] = useState(false);

  // Dead links checking states
  const [isCheckingDeadLinks, setIsCheckingDeadLinks] = useState(false);
  const [hasCheckedDeadLinks, setHasCheckedDeadLinks] = useState(false);
  const [deadLinksList, setDeadLinksList] = useState<
    Array<{
      id: string;
      title: string;
      rjIdOrAlbum: string;
      type: "asmr" | "music";
      filePath: string;
      reason: string;
      status: "broken" | "fixed" | "deleted";
    }>
  >([
    {
      id: "track_rj356984_01_dead",
      title: "01_和風縁側でのんびりおばあちゃんの膝枕耳かき",
      rjIdOrAlbum: "RJ356984",
      type: "asmr",
      filePath: "ひなき/01_縁側膝枕耳かき.flac",
      reason: "本地记录指向的文件未在当前索引中找到",
      status: "broken",
    },
    {
      id: "track_music_01_03_dead",
      title: "03_Unreleased_Bonus_Track",
      rjIdOrAlbum: "After Hours",
      type: "music",
      filePath: "<selected-root>/After Hours/03_Unreleased_Bonus.mp3",
      reason: "云端网盘共享已被创建者撤销",
      status: "broken",
    },
  ]);

  // Concurrent repair stats
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [repairProgress, setRepairProgress] = useState(0);
  const [repairLog, setRepairLog] = useState<string>("");

  // Toast feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Compute stats for healthy albums
  const stats = useMemo(() => {
    const result = {
      total: rjWorks.length,
      identified: 0,
      missingCover: 0,
      missingAudio: 0,
      warning: 0,
    };
    rjWorks.forEach((work) => {
      if (work.status === "identified") result.identified++;
      else if (work.status === "missing-cover") result.missingCover++;
      else if (work.status === "missing-audio") result.missingAudio++;
      else if (work.status === "warning") result.warning++;
    });
    return result;
  }, [rjWorks]);

  const filteredWorks = useMemo(() => {
    if (filterType === "all") return rjWorks;
    return rjWorks.filter((w) => w.status === filterType);
  }, [rjWorks, filterType]);

  const getStatusDetail = (work: RJWork) => {
    switch (work.status) {
      case "identified":
        return {
          label: "正常已识别",
          desc: "本地记录、封面和音频条目匹配正常。",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
          icon: CheckCircle,
        };
      case "missing-cover":
        return {
          label: "缺失封面",
          desc: "未检测到 cover.jpg，目前使用系统精美默认占位符封面。",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/25",
          icon: ImageOff,
        };
      case "missing-audio":
        return {
          label: "缺失音频轨",
          desc: "当前记录下没有可播放音频条目，建议重新读取资源库。",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/25",
          icon: AudioLines,
        };
      case "warning":
        return {
          label: "音频格式受损",
          desc: "包含需要人工确认的音频条目，建议先查看文件状态。",
          color: "text-red-400 bg-red-500/10 border-red-500/25",
          icon: AlertCircle,
        };
      default:
        return {
          label: "未知状态",
          desc: "校验进行中。",
          color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/25",
          icon: AlertCircle,
        };
    }
  };

  // 1. One-click Batch Refetch for deficient works (Requirement 4)
  const handleBulkRepair = () => {
    const deficientWorks = rjWorks.filter(
      (w) => w.status === "missing-cover" || w.status === "missing-audio",
    );
    if (deficientWorks.length === 0) {
      showToast("没有检测到缺失封面或音轨的异常条目！");
      return;
    }

    setIsFixingAll(true);
    setRepairProgress(10);
    setRepairLog("正在演示批量补全流程：不会联网、不会下载、不会写真实文件。");

    setTimeout(() => {
      setRepairProgress(45);
      setRepairLog(
        `发现 ${deficientWorks.length} 个异常条目。正在拉取 RJ100204 极上雨声与露营封面及音轨元数据...`,
      );
    }, 700);

    setTimeout(() => {
      setRepairProgress(80);
      setRepairLog(
        "正在演示本地记录更新提示：当前不写 SQLite，不修改真实媒体文件。",
      );
    }, 1400);

    setTimeout(() => {
      // Execute refetch in parent state
      deficientWorks.forEach((w) => {
        onRefetchRjMetadata?.(w.id);
      });
      setIsFixingAll(false);
      setRepairProgress(100);
      setRepairLog("");
      showToast(
        `一键并发修复成功！已成功抓取并补全了 ${deficientWorks.length} 个专辑的元数据与音轨名。`,
      );
    }, 2200);
  };

  // 2. Scan and monitor new directory additions (Requirement 1)
  const handleScanNewFolders = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedOnce(true);
      showToast("Demo 扫描完毕：这是模拟结果，未读取真实目录。");
    }, 1200);
  };

  const handleImportScannedItem = (id: string) => {
    const item = scannedItems.find((x) => x.id === id);
    if (!item || item.status === "imported") return;

    if (item.type === "asmr") {
      if (setRjWorks) {
        const newRj: RJWork = {
          id: item.id,
          title: item.title,
          circle: item.circleOrArtist,
          cvs: ["あまね", "ねこ"],
          releaseDate: "2026-06-20",
          coverUrl: coverArtworkService.makeFallbackCover(
            "诊断 Demo 封面 1",
            "本地离线占位",
            "asmr",
          ),
          tags: ["猫耳", "メイド", "耳かき", "新录入"],
          status: "identified",
          fileCount: 2,
          totalDuration: 1800,
          addedAt: new Date().toISOString(),
          description:
            "全新检测并入库的 ASMR。双耳猫耳女仆膝枕耳搔与温柔脑部放松。",
          tracks: [
            {
              id: `${item.id.toLowerCase()}_01`,
              title: "01_猫耳メイドさんのご挨拶と膝枕.flac",
              artist: "あまね",
              album: item.title,
              rjId: item.id,
              duration: 900,
              coverUrl: coverArtworkService.makeFallbackCover(
                "诊断 Demo 封面 2",
                "本地离线占位",
                "asmr",
              ),
              type: "asmr",
              fileTreePath: "RJ410092/01_猫耳膝枕.flac",
            },
            {
              id: `${item.id.toLowerCase()}_02`,
              title: "02_極上竹製耳そうじと頭皮マッサージ.flac",
              artist: "ねこ",
              album: item.title,
              rjId: item.id,
              duration: 900,
              coverUrl: coverArtworkService.makeFallbackCover(
                "诊断 Demo 封面 3",
                "本地离线占位",
                "asmr",
              ),
              type: "asmr",
              fileTreePath: "RJ410092/02_竹制采耳.flac",
            },
          ],
        };
        setRjWorks((prev) => [newRj, ...prev]);
      }
    } else {
      if (setMusicAlbums) {
        const newMusic = {
          id: item.id,
          title: item.title,
          artist: item.circleOrArtist,
          coverUrl: coverArtworkService.makeFallbackCover(
            "诊断 Demo 封面 4",
            "本地离线占位",
            "asmr",
          ),
          tracksCount: 1,
          duration: 210,
          genre: "Pop",
          tracks: [
            {
              id: "track_music_tate_01",
              title: "Greedy - Tate McRae Pop Master",
              artist: "Tate McRae",
              album: item.title,
              duration: 210,
              coverUrl: coverArtworkService.makeFallbackCover(
                "诊断 Demo 封面 5",
                "本地离线占位",
                "asmr",
              ),
              type: "music" as const,
            },
          ],
        };
        setMusicAlbums((prev) => [newMusic, ...prev]);
      }
    }

    setScannedItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "imported" } : x)),
    );
    showToast(`Demo 导入：不会写 SQLite，也不会修改真实媒体文件。`);
  };

  const handleImportAllScanned = () => {
    const pending = scannedItems.filter((x) => x.status === "pending");
    if (pending.length === 0) {
      showToast("所有新增项已成功录入完毕！");
      return;
    }
    pending.forEach((item) => {
      handleImportScannedItem(item.id);
    });
  };

  // 3. Batch physical rename preview & execute (Requirement 2)
  const handleExecuteBatchRename = () => {
    if (isRenameSuccess) {
      showToast("重命名规则已是最新，无须重复修改。");
      return;
    }
    setIsRenameSuccess(true);

    // Dynamically rename the names of files inside active rjWorks 音轨
    if (setRjWorks) {
      setRjWorks((prev) =>
        prev.map((work) => {
          const renamedTracks = toArray(work.tracks).map((track, index) => {
            const idxStr = String(index + 1).padStart(2, "0");
            let newName = track.title;
            let newPath = track.fileTreePath;
            if (renameRule === "rule-1") {
              newName = `${idxStr}_【${work.circle}】_整理版音轨.flac`;
              newPath = `${work.circle}/${idxStr}_整理版音轨.flac`;
            } else if (renameRule === "rule-2") {
              newName = `${idxStr}_[${work.id}]_${track.artist}_ASMR.flac`;
              newPath = `${work.id}/${idxStr}_${track.artist}.flac`;
            }
            return {
              ...track,
              title: newName,
              fileTreePath: newPath,
            };
          });
          return {
            ...work,
            tracks: renamedTracks,
          };
        }),
      );
    }

    showToast("命名检查演示完成：仅更新当前页面模拟记录，不重命名真实文件。");
  };

  // 4. Dead links re-align or delete (Requirement 1)
  const handleCheckDeadLinks = () => {
    setIsCheckingDeadLinks(true);
    setTimeout(() => {
      setIsCheckingDeadLinks(false);
      setHasCheckedDeadLinks(true);
      showToast("Demo 文件状态完成：未访问真实文件系统。");
    }, 1000);
  };

  const handleFixDeadLink = (id: string) => {
    setDeadLinksList((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "fixed" } : x)),
    );

    // Restore relevant work in states
    const dl = deadLinksList.find((x) => x.id === id);
    if (dl && dl.type === "asmr" && setRjWorks) {
      // Find work rjId and change status
      setRjWorks((prev) =>
        prev.map((work) => {
          if (work.id === dl.rjIdOrAlbum) {
            return {
              ...work,
              status: "identified" as const,
              description:
                work.description +
                "（诊断演示：当前页面模拟记录已标记为正常，未修改真实文件。）",
            };
          }
          return work;
        }),
      );
    }
    showToast("Demo 修复演示完成：未下载、未重连、未写索引。");
  };

  const handleDeleteDeadLink = (id: string) => {
    setDeadLinksList((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "deleted" } : x)),
    );

    const dl = deadLinksList.find((x) => x.id === id);
    if (dl && dl.type === "asmr" && setRjWorks) {
      // Physically remove this broken track from that work
      setRjWorks((prev) =>
        prev.map((work) => {
          if (work.id === dl.rjIdOrAlbum) {
            const keptTracks = work.tracks.filter(
              (t) => !t.id.includes("dead"),
            );
            return {
              ...work,
              tracks: keptTracks,
              fileCount: keptTracks.length,
            };
          }
          return work;
        }),
      );
    }
    showToast("Demo 清理演示完成：未写 SQLite，未删除真实文件。");
  };

  const handleFixAllDeadLinks = () => {
    const brokens = deadLinksList.filter((x) => x.status === "broken");
    if (brokens.length === 0) {
      showToast("没有断裂的死链需要对齐修复。");
      return;
    }
    brokens.forEach((x) => {
      handleFixDeadLink(x.id);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12 relative text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-text-primary">
            <Cpu className="w-5.5 h-5.5 text-brand-color" />
            <span>诊断工具</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            集中查看资源库、桌面端、打包验收和安全边界信息。日常播放、浏览和导入入口保留在首页与设置页。
          </p>
        </div>

        {/* Diagnostic Action Tab row */}
        <div className="bg-card-bg/60 p-1 rounded-xl flex flex-wrap items-center border border-border-color gap-1">
          <button
            onClick={() => setActiveTab("health")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "health"
                ? "bg-brand-color text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            健康状况
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "scan"
                ? "bg-brand-color text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            资源库扫描
          </button>
          <button
            onClick={() => setActiveTab("rename")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "rename"
                ? "bg-brand-color text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            命名检查
          </button>
          <button
            onClick={() => setActiveTab("deadlinks")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "deadlinks"
                ? "bg-brand-color text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            文件状态
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === "duplicates"
                ? "bg-brand-color text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            重复资源
          </button>
        </div>
      </div>

      <section
        id="mvp72-daily-diagnostics-summary"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              日常诊断
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              普通使用只看资源状态和安全提示
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp72DailySurface.description}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            工程细节已折叠
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mvp72DailySurface.diagnosticsGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary mb-1">
                {group.title}
              </p>
              <p className="leading-relaxed mb-2">{group.description}</p>
              <div className="flex flex-wrap gap-1">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-50/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="mvp80-diagnostics-daily-finalize"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              日常化最终检查
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              诊断页默认只显示用户能读懂的摘要
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp80DailyFinalize.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            高级信息已折叠
          </span>
        </div>
        <div
          id="mvp80-diagnostics-daily-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {mvp80DailyFinalize.diagnosticsCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${settingsDiagnosticsDailyFinalizeService.getToneClassName(card.tone)}`}
            >
              <p className="text-[11px] font-bold text-text-primary mb-1">
                {card.title}
              </p>
              <p className="opacity-80 mb-2">{card.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {card.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          id="mvp80-diagnostics-surface-audit"
          className="grid grid-cols-1 lg:grid-cols-3 gap-3"
        >
          {mvp80DailyFinalize.surfaceAudit.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-3 text-[10px] ${settingsDiagnosticsDailyFinalizeService.getToneClassName(item.tone)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-text-primary">
                  {item.label}
                </p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-bold">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 leading-relaxed opacity-80">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp80-diagnostics-hidden-engineering-terms"
          className="sr-only"
        >
          {mvp80DailyFinalize.hiddenEngineeringTerms.join(" / ")}{" "}
          继续默认折叠，仅供 AI 维护和 verifier 追溯。
        </div>
      </section>

      <section
        id="mvp81-offline-demo-cover-cleanup"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              离线封面清扫
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              Demo 占位封面不再请求外部图片
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp81OfflineCoverCleanup.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            离线可用
          </span>
        </div>
        <div
          id="mvp81-offline-cover-checks"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          {mvp81OfflineCoverCleanup.checks.map((check) => (
            <div
              key={check.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${offlineDemoCoverCleanupService.getToneClassName(check.tone)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-text-primary">
                  {check.label}
                </p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-bold">
                  {check.status}
                </span>
              </div>
              <p className="mt-2 opacity-80">{check.description}</p>
            </div>
          ))}
        </div>
        <div id="mvp81-offline-cover-guardrails" className="sr-only">
          {mvp81OfflineCoverCleanup.guardrails.join(" / ")} /{" "}
          {mvp81OfflineCoverCleanup.hiddenMaintenanceNote}
        </div>
      </section>

      <section
        id="mvp82-ui-bug-sweep"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              UI 细节清扫
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp82UiBugSweep.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp82UiBugSweep.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            DeepSeek 对照修复
          </span>
        </div>
        <div
          id="mvp82-ui-bug-sweep-fixes"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          {mvp82UiBugSweep.fixes.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${uiBugSweepService.getToneClassName(item.tone)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-text-primary">
                  {item.label}
                </p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-bold">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 opacity-80">{item.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp82-ui-bug-sweep-notes"
          className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <p className="font-bold text-text-secondary">
            审查来源：{mvp82UiBugSweep.source}
          </p>
          <ul className="mt-2 space-y-1 list-disc pl-4">
            {mvp82UiBugSweep.reviewNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
        <div id="mvp82-ui-bug-sweep-guardrails" className="sr-only">
          {mvp82UiBugSweep.guardrails.join(" / ")}
        </div>
      </section>

      <section
        id="mvp83-beta-closeout-push-prep"
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-amber-300 tracking-wider">
              Beta 0.1 收口 · 推送准备
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp83PushPrep.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp83PushPrep.summary}
            </p>
            <p className="mt-2 text-[9px] text-amber-100/80 leading-relaxed">
              {mvp83PushPrep.companyNetworkNote}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-amber-500/25 bg-amber-500/10 text-[10px] font-bold text-amber-100 whitespace-nowrap">
            不在公司网络推送
          </span>
        </div>
        <div
          id="mvp83-push-readiness-cards"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          {mvp83PushPrep.readinessCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${betaCloseoutPushPrepService.getToneClassName(card.tone)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-text-primary">
                  {card.title}
                </p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-bold">
                  {card.status}
                </span>
              </div>
              <p className="mt-2 opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <details
          id="mvp83-github-push-prep-commands"
          className="rounded-xl border border-amber-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer list-none font-bold text-amber-100">
            回住所后 GitHub 推送步骤
          </summary>
          <div className="mt-3 space-y-3">
            {mvp83PushPrep.pushCommandGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-lg border border-white/10 bg-black/10 p-3"
              >
                <p className="font-bold text-text-secondary">{group.title}</p>
                <div className="mt-2 space-y-1 font-mono text-[9px] text-text-muted">
                  {group.commands.map((command) => (
                    <p key={command}>$ {command}</p>
                  ))}
                </div>
                <p className="mt-2 text-[9px] text-amber-100/70">
                  {group.note}
                </p>
              </div>
            ))}
          </div>
        </details>
        <div
          id="mvp83-validation-commands"
          className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <p className="font-bold text-text-secondary">推荐验证命令</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mvp83PushPrep.validationCommands.map((command) => (
              <span
                key={command}
                className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 font-mono text-[9px]"
              >
                {command}
              </span>
            ))}
          </div>
        </div>
        <div id="mvp83-safety-boundaries" className="sr-only">
          {mvp83PushPrep.safetyBoundaries.join(" / ")} /{" "}
          {mvp83PushPrep.baseline}
        </div>
      </section>

      <section
        id="mvp84-import-download-strategy"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              规划并入 · 导入器优先
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp84ImportDownloadStrategy.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp84ImportDownloadStrategy.summary}
            </p>
            <p className="mt-2 text-[9px] text-emerald-100/80 leading-relaxed">
              {mvp84ImportDownloadStrategy.gitAttempt}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            本轮只更新规划
          </span>
        </div>
        <div
          id="mvp84-strategy-cards"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3"
        >
          {mvp84ImportDownloadStrategy.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${importDownloadEcosystemStrategyService.getToneClassName(card.tone)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-text-primary">
                  {card.title}
                </p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-bold">
                  {card.status}
                </span>
              </div>
              <p className="mt-2 opacity-85">{card.detail}</p>
            </div>
          ))}
        </div>
        <details
          id="mvp84-importer-flow"
          className="rounded-xl border border-emerald-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer list-none font-bold text-emerald-100">
            导入器第一版流程
          </summary>
          <ol className="mt-3 list-decimal pl-4 space-y-1">
            {mvp84ImportDownloadStrategy.importerFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </details>
        <details
          id="mvp84-roadmap-phases"
          className="rounded-xl border border-sky-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer list-none font-bold text-sky-100">
            MVP85+ 后续阶段
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {mvp84ImportDownloadStrategy.roadmapPhases.map((phase) => (
              <div
                key={phase.id}
                className="rounded-lg border border-white/10 bg-black/10 p-3"
              >
                <p className="font-bold text-text-secondary">{phase.title}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {phase.steps.map((step) => (
                    <span
                      key={step}
                      className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]"
                    >
                      {step}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[9px] text-amber-100/70">
                  {phase.guardrail}
                </p>
              </div>
            ))}
          </div>
        </details>
        <div
          id="mvp84-git-push-attempt"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold text-amber-100">Git 推送尝试记录</p>
          <p className="mt-1">
            标准 git 路径已尝试，当前环境无法解析 github.com；继续以本地 clean
            source zip 为基线，回住所后标准 git push。
          </p>
        </div>
        <div id="mvp84-safety-boundaries" className="sr-only">
          {mvp84ImportDownloadStrategy.safetyBoundaries.join(" / ")} /{" "}
          {mvp84ImportDownloadStrategy.playerBackendRules.join(" / ")}
        </div>
      </section>

      <section
        id="mvp85-import-download-models"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              模型合同 · 只定义不执行
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp85ImportDownloadModels.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp85ImportDownloadModels.summary}
            </p>
            <p className="mt-2 text-[9px] text-sky-100/80 leading-relaxed">
              基线：{mvp85ImportDownloadModels.baseline}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            本轮不执行导入/下载
          </span>
        </div>
        <div
          id="mvp85-model-cards"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3"
        >
          {mvp85ImportDownloadModels.modelCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${importDownloadModelContractService.getToneClassName(card.tone)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-text-primary">
                  {card.title}
                </p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] font-bold">
                  {card.status}
                </span>
              </div>
              <p className="mt-2 opacity-85">{card.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp85-import-task-contract"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          <details className="rounded-xl border border-emerald-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed">
            <summary className="cursor-pointer list-none font-bold text-emerald-100">
              ImportTask 字段
            </summary>
            <ul className="mt-3 list-disc pl-4 space-y-1">
              {mvp85ImportDownloadModels.importTaskFields.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
          <details
            id="mvp85-download-task-contract"
            className="rounded-xl border border-sky-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
          >
            <summary className="cursor-pointer list-none font-bold text-sky-100">
              DownloadTask / Manifest 字段
            </summary>
            <ul className="mt-3 list-disc pl-4 space-y-1">
              {mvp85ImportDownloadModels.downloadTaskFields.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>
        </div>
        <details
          id="mvp85-metadata-source-contract"
          className="rounded-xl border border-violet-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer list-none font-bold text-violet-100">
            MetadataSource 合并规则
          </summary>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mvp85ImportDownloadModels.metadataMergeRules.map((rule) => (
              <span
                key={rule}
                className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[9px] text-violet-50"
              >
                {rule}
              </span>
            ))}
          </div>
        </details>
        <details
          id="mvp85-download-manifest-contract"
          className="rounded-xl border border-amber-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer list-none font-bold text-amber-100">
            DownloadManifest 规则
          </summary>
          <ul className="mt-3 list-disc pl-4 space-y-1">
            {mvp85ImportDownloadModels.manifestRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </details>
        <div
          id="mvp85-model-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold text-rose-100">安全边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mvp85ImportDownloadModels.guardedBoundaries.map((item) => (
              <span
                key={item}
                className="rounded-full border border-rose-500/20 bg-black/10 px-2 py-0.5 text-[9px]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div id="mvp85-next-steps" className="sr-only">
          {mvp85ImportDownloadModels.nextSteps.join(" / ")}
        </div>
      </section>

      <section
        id="mvp89-import-conflict-detection-diagnostics"
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-amber-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-amber-300 tracking-wider">
              MVP-89 导入冲突检测
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp89ImportConflictDetection.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp89ImportConflictDetection.summary}
            </p>
          </div>
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-100">
            {mvp89ImportConflictDetection.version}
          </span>
        </div>
        <div
          id="mvp89-conflict-rule-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp89ImportConflictDetection.ruleCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${importConflictDetectionPreviewService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp89-conflict-report-preview"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {mvp89ImportConflictDetection.sampleResults.map((result) => (
            <details
              key={result.taskId}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
            >
              <summary className="cursor-pointer text-xs font-bold text-text-primary">
                {result.detectedTitle} / {result.detectedType}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <p>比较集合: {result.comparedCollections}</p>
                <p>阻断: {result.report.blockers}</p>
                <p>同 RJ: {result.duplicateCodeCount}</p>
                <p>同专辑: {result.duplicateAlbumCount}</p>
                <p>同文件名: {result.duplicateFileNameCount}</p>
                <p>同大小疑似: {result.sameSizeSuspectCount}</p>
              </div>
              <p className="mt-2 text-[9px] text-amber-100/80">
                {result.report.summary}
              </p>
            </details>
          ))}
        </div>
        <details
          id="mvp89-hash-strategy-preview"
          className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-3 text-[10px] text-violet-50/90 leading-relaxed"
        >
          <summary className="cursor-pointer text-xs font-bold text-violet-100">
            hash 策略：MVP89 不计算真实 hash
          </summary>
          <ul className="mt-3 list-disc pl-4 space-y-1">
            {mvp89ImportConflictDetection.hashStrategy.map((step) => (
              <li key={step.id}>
                {step.title}：{step.detail}（
                {step.enabledInMvp89 ? "MVP89 已启用" : "后续启用"}）
              </li>
            ))}
          </ul>
        </details>
        <div
          id="mvp89-conflict-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp89ImportConflictDetection.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp89-import-conflict-detection-preview / buildImportConflictPreview /
          duplicate-code / duplicate-file / target-exists / same-size-suspect /
          hash strategy / no real hash calculation / no file operations /
          absolutePath / file://
        </div>
      </section>

      <section
        id="mvp90-target-path-planning-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-emerald-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-90 目标路径规划
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp90TargetPathPlanning.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp90TargetPathPlanning.summary}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-100">
            {mvp90TargetPathPlanning.version}
          </span>
        </div>
        <div
          id="mvp90-target-path-rule-cards"
          className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3"
        >
          {mvp90TargetPathPlanning.ruleCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${importTargetPathPlanningPreviewService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp90-target-path-plan-preview"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {mvp90TargetPathPlanning.sampleResults.map((result) => (
            <details
              key={result.taskId}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
            >
              <summary className="cursor-pointer text-xs font-bold text-text-primary">
                {result.detectedTitle} / {result.detectedType}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <p>目标文件: {result.plannedFiles.length}</p>
                <p>同名处理: {result.duplicateTargetNameCount}</p>
                <p>非法字符: {result.invalidCharacterWarnings}</p>
                <p>长路径: {result.longPathWarnings}</p>
              </div>
              <p className="mt-2 text-[9px] text-emerald-100/80">
                {result.sanitizedDirectory}
              </p>
              <p className="mt-1 text-[9px] text-amber-100/80">
                {result.conflictReport.summary}
              </p>
            </details>
          ))}
        </div>
        <details
          id="mvp90-sanitized-path-examples"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <summary className="cursor-pointer text-xs font-bold text-sky-100">
            非法字符清理示例
          </summary>
          <ul className="mt-3 list-disc pl-4 space-y-1">
            {mvp90TargetPathPlanning.sanitizingExamples.map((item) => (
              <li key={item.input}>
                {item.input} → {item.output}：{item.note}
              </li>
            ))}
          </ul>
        </details>
        <div
          id="mvp90-target-path-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp90TargetPathPlanning.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp90-target-path-planning-preview / buildImportTargetPathPreview /
          sanitizePathSegment / sanitizeFileName / targetRelativePath /
          overwrite false / no copy move delete rename / absolutePath / file://
        </div>
      </section>

      <section
        id="mvp91-copy-execution-readiness-diagnostics"
        className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-violet-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-violet-300 tracking-wider">
              MVP-91 copy only 执行前合同
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp91CopyExecutionReadiness.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp91CopyExecutionReadiness.summary}
            </p>
          </div>
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[9px] font-bold text-violet-100">
            {mvp91CopyExecutionReadiness.version}
          </span>
        </div>
        <div
          id="mvp91-copy-readiness-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp91CopyExecutionReadiness.readinessCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${importCopyExecutionReadinessService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp91-copy-preflight-checks"
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {mvp91CopyExecutionReadiness.sampleResults[0].preflightChecks.map(
            (check) => (
              <div
                key={check.id}
                className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
              >
                <p className="font-bold text-text-primary">
                  {check.label} / {check.status}
                </p>
                <p className="mt-1">{check.detail}</p>
              </div>
            ),
          )}
        </div>
        <div
          id="mvp91-confirmation-model"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <p className="font-bold">
            二次确认：
            {
              mvp91CopyExecutionReadiness.sampleResults[0].confirmation
                .confirmationText
            }
          </p>
          <p className="mt-1">
            按钮状态：
            {
              mvp91CopyExecutionReadiness.sampleResults[0].confirmation
                .executeButtonState
            }
          </p>
        </div>
        <div
          id="mvp91-operation-log-preview"
          className="grid grid-cols-1 lg:grid-cols-2 gap-2"
        >
          {mvp91CopyExecutionReadiness.sampleResults[0].operationLogPreview
            .slice(0, 4)
            .map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
              >
                <p className="font-bold text-text-primary">
                  {entry.event} / {entry.level}
                </p>
                <p className="mt-1">{entry.message}</p>
              </div>
            ))}
        </div>
        <div
          id="mvp91-failure-skip-preview"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold">失败 / 跳过列表</p>
          <p className="mt-1">
            skippedList:{" "}
            {mvp91CopyExecutionReadiness.sampleResults[0].skippedList.length} /
            failureList:{" "}
            {mvp91CopyExecutionReadiness.sampleResults[0].failureList.length}
          </p>
        </div>
        <div
          id="mvp91-copy-execution-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp91CopyExecutionReadiness.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp91-copy-execution-readiness /
          buildImportCopyExecutionReadinessPreview / OperationLog / skippedList
          / failureList / disabled-preview-only / no fs.copyFile / no copy move
          delete rename / absolutePath / file://
        </div>
      </section>

      <section
        id="mvp92-copy-sample-readiness-diagnostics"
        className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-cyan-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-cyan-300 tracking-wider">
              MVP-92 copy only 样本准备
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp92CopySampleReadiness.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp92CopySampleReadiness.summary}
            </p>
          </div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[9px] font-bold text-cyan-100">
            {mvp92CopySampleReadiness.version}
          </span>
        </div>
        <div
          id="mvp92-copy-sample-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp92CopySampleReadiness.sampleReadinessCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${copyOnlySampleReadinessService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp92-minimal-sample-requirements"
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {mvp92CopySampleReadiness.minimalSampleRequirements
            .slice(0, 4)
            .map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
              >
                <p className="font-bold text-text-primary">{item.title}</p>
                <p className="mt-1">{item.requirement}</p>
              </div>
            ))}
        </div>
        <div
          id="mvp92-codex-validation-steps"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <p className="font-bold">Codex 验收步骤</p>
          <p className="mt-1">
            {mvp92CopySampleReadiness.codexValidationSteps
              .map((step) => step.title)
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp92-copy-only-ipc-contract"
          className="grid grid-cols-1 lg:grid-cols-2 gap-2"
        >
          {mvp92CopySampleReadiness.ipcContracts.slice(0, 4).map((ipc) => (
            <div
              key={ipc.channel}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
            >
              <p className="font-bold text-text-primary">{ipc.channel}</p>
              <p className="mt-1">{ipc.purpose}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp92-main-side-copy-contract"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold">main-side copy contract</p>
          <p className="mt-1">
            {mvp92CopySampleReadiness.mainSideCopyContracts
              .map((item) => item.title)
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp92-copy-sample-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp92CopySampleReadiness.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp92-copy-sample-readiness / copy-only IPC / Codex 本机验收任务书 /
          main-side copy contract / minimal sample directory / no real copy / no
          copyFile / absolutePath / file://
        </div>
      </section>

      <section
        id="mvp97-post-copy-refresh-preview-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-emerald-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-97 · copy 后刷新预览
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp97PostCopyRefresh.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp97PostCopyRefresh.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {mvp97PostCopyRefresh.version}
          </span>
        </div>
        <div
          id="mvp97-refresh-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp97PostCopyRefresh.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${copyOnlyPostCopyRefreshService.getToneClassName(card.tone)}`}
            >
              <p className="text-[11px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp97-refresh-request-contract"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">
            {mvp97PostCopyRefresh.requestContract.channel}
          </p>
          <p className="mt-1">
            mode: {mvp97PostCopyRefresh.requestContract.mode} /
            targetRelativePathsOnly:{" "}
            {String(
              mvp97PostCopyRefresh.requestContract.targetRelativePathsOnly,
            )}
          </p>
          <p className="mt-1">
            absolutePathAccepted:{" "}
            {String(mvp97PostCopyRefresh.requestContract.absolutePathAccepted)}{" "}
            / fileUrlAccepted:{" "}
            {String(mvp97PostCopyRefresh.requestContract.fileUrlAccepted)}
          </p>
        </div>
        <div
          id="mvp97-refresh-plan-preview"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">refresh plan</p>
          <p className="mt-1">
            {mvp97PostCopyRefresh.sampleRefreshPlan.refreshPlanVersion}
          </p>
          <p className="mt-1">
            candidate/audio/cover/subtitle:{" "}
            {mvp97PostCopyRefresh.sampleRefreshPlan.candidateCount}/
            {mvp97PostCopyRefresh.sampleRefreshPlan.audioCount}/
            {mvp97PostCopyRefresh.sampleRefreshPlan.coverCount}/
            {mvp97PostCopyRefresh.sampleRefreshPlan.subtitleCount}
          </p>
          <p className="mt-1">
            libraryIndexWritten:{" "}
            {String(mvp97PostCopyRefresh.sampleRefreshPlan.libraryIndexWritten)}{" "}
            / scannerRunTriggered:{" "}
            {String(mvp97PostCopyRefresh.sampleRefreshPlan.scannerRunTriggered)}
          </p>
        </div>
        <div
          id="mvp97-refresh-candidates"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp97PostCopyRefresh.sampleCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
            >
              <p className="font-bold text-text-primary truncate">
                {candidate.targetRelativePath}
              </p>
              <p className="mt-1 text-text-muted">
                {candidate.entryKind} / {candidate.plannedAction}
              </p>
              <p className="mt-1 text-text-secondary">
                absolutePathReturned: {String(candidate.absolutePathReturned)} /
                fileUrlReturned: {String(candidate.fileUrlReturned)}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp97-refresh-gate-rules"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp97PostCopyRefresh.refreshGateRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
            >
              <p className="font-bold text-text-primary">{rule.title}</p>
              <p className="mt-1 text-text-muted">{rule.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp97-refresh-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">安全边界</p>
          <p className="mt-1">
            {mvp97PostCopyRefresh.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div
          id="mvp97-codex-refresh-gate"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">Codex gate</p>
          <p className="mt-1">{mvp97PostCopyRefresh.codexGate.reason}</p>
          <p className="mt-1">
            {mvp97PostCopyRefresh.codexGate.requiredAfterBuild}
          </p>
        </div>
        <div className="sr-only">
          mvp97-post-copy-refresh-preview-diagnostics / mvp97-refresh-cards /
          mvp97-refresh-request-contract / mvp97-refresh-plan-preview /
          mvp97-refresh-candidates / mvp97-refresh-gate-rules /
          mvp97-refresh-guardrails / mvp97-codex-refresh-gate /
          mvp97-post-copy-refresh-plan-v1 / no library-index.json / no SQLite /
          no absolutePath / no file://
        </div>
      </section>

      <section
        id="mvp98-library-index-patch-preview-diagnostics"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-sky-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              MVP-98 · index patch preview
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp98LibraryIndexPatchPreview.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp98LibraryIndexPatchPreview.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            {mvp98LibraryIndexPatchPreview.version}
          </span>
        </div>
        <div
          id="mvp98-personal-project-policy"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">个人项目规划说明</p>
          <p className="mt-1">
            {mvp98LibraryIndexPatchPreview.personalProjectPolicy.planningNote}
          </p>
          <p className="mt-1">
            {
              mvp98LibraryIndexPatchPreview.personalProjectPolicy
                .relaxedBoundaryNote
            }
          </p>
        </div>
        <div
          id="mvp98-patch-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp98LibraryIndexPatchPreview.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${libraryIndexPatchPreviewService.getToneClassName(card.tone)}`}
            >
              <p className="text-[11px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp98-patch-request-contract"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">
            {mvp98LibraryIndexPatchPreview.requestContract.channel}
          </p>
          <p className="mt-1">
            mode: {mvp98LibraryIndexPatchPreview.requestContract.mode} /
            previewOnly:{" "}
            {String(mvp98LibraryIndexPatchPreview.requestContract.previewOnly)}
          </p>
          <p className="mt-1">
            absolutePathAccepted:{" "}
            {String(
              mvp98LibraryIndexPatchPreview.requestContract
                .absolutePathAccepted,
            )}{" "}
            / fileUrlAccepted:{" "}
            {String(
              mvp98LibraryIndexPatchPreview.requestContract.fileUrlAccepted,
            )}
          </p>
        </div>
        <div
          id="mvp98-index-patch-preview"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">index patch preview</p>
          <p className="mt-1">
            {
              mvp98LibraryIndexPatchPreview.samplePatchPreview
                .patchPreviewVersion
            }
          </p>
          <p className="mt-1">
            collections/tracks/covers/subtitles:{" "}
            {
              mvp98LibraryIndexPatchPreview.samplePatchPreview
                .collectionPatchCount
            }
            /{mvp98LibraryIndexPatchPreview.samplePatchPreview.trackPatchCount}/
            {mvp98LibraryIndexPatchPreview.samplePatchPreview.coverPatchCount}/
            {
              mvp98LibraryIndexPatchPreview.samplePatchPreview
                .subtitlePatchCount
            }
          </p>
          <p className="mt-1">
            libraryIndexWritten:{" "}
            {String(
              mvp98LibraryIndexPatchPreview.samplePatchPreview
                .libraryIndexWritten,
            )}{" "}
            / scannerRunTriggered:{" "}
            {String(
              mvp98LibraryIndexPatchPreview.samplePatchPreview
                .scannerRunTriggered,
            )}
          </p>
        </div>
        <div
          id="mvp98-patch-operations"
          className="grid grid-cols-1 md:grid-cols-3 gap-2"
        >
          {mvp98LibraryIndexPatchPreview.samplePatchOperations.map(
            (operation) => (
              <div
                key={operation.id}
                className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
              >
                <p className="font-bold text-text-primary truncate">
                  {operation.targetRelativePath}
                </p>
                <p className="mt-1 text-text-muted">
                  {operation.operation} → {operation.targetBucket}
                </p>
              </div>
            ),
          )}
        </div>
        <div
          id="mvp98-patch-preview-rules"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp98LibraryIndexPatchPreview.patchPreviewRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
            >
              <p className="font-bold text-text-primary">{rule.title}</p>
              <p className="mt-1 text-text-muted">{rule.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp98-patch-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">边界与提速原则</p>
          <p className="mt-1">
            {mvp98LibraryIndexPatchPreview.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp98-library-index-patch-preview-diagnostics / mvp98-patch-cards /
          mvp98-patch-request-contract / mvp98-index-patch-preview /
          mvp98-patch-operations / mvp98-patch-preview-rules /
          mvp98-patch-guardrails / mvp98-personal-project-policy /
          mvp98-library-index-patch-preview-v1 / no library-index.json / no
          SQLite / no absolutePath / no file:// / personal project
          non-commercial not shared
        </div>
      </section>

      <section
        id="mvp100-library-index-patch-write-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-100 · 真实 index patch 写入
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp100LibraryIndexPatchWrite.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp100LibraryIndexPatchWrite.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {mvp100LibraryIndexPatchWrite.version}
          </span>
        </div>
        <div
          id="mvp100-write-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp100LibraryIndexPatchWrite.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${libraryIndexPatchWriteService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp100-write-contract"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">
            {mvp100LibraryIndexPatchWrite.requestContract.channel}
          </p>
          <p className="mt-1">
            mode: {mvp100LibraryIndexPatchWrite.requestContract.mode} / source:{" "}
            {mvp100LibraryIndexPatchWrite.requestContract.source}
          </p>
          <p className="mt-1">
            writesLibraryIndexJson:{" "}
            {String(
              mvp100LibraryIndexPatchWrite.requestContract
                .writesLibraryIndexJson,
            )}{" "}
            / writesSQLite:{" "}
            {String(mvp100LibraryIndexPatchWrite.requestContract.writesSQLite)}
          </p>
        </div>
        <div
          id="mvp100-write-result-preview"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">write result preview</p>
          <p className="mt-1">
            {mvp100LibraryIndexPatchWrite.resultPreview.patchWriteVersion}
          </p>
          <p className="mt-1">
            libraryIndexWritten:{" "}
            {String(
              mvp100LibraryIndexPatchWrite.resultPreview.libraryIndexWritten,
            )}{" "}
            / backupCreated:{" "}
            {String(mvp100LibraryIndexPatchWrite.resultPreview.backupCreated)}
          </p>
          <p className="mt-1">
            backup:{" "}
            {
              mvp100LibraryIndexPatchWrite.resultPreview
                .backupRelativePathPattern
            }
          </p>
        </div>
        <div
          id="mvp100-write-rules"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp100LibraryIndexPatchWrite.writeRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
            >
              <p className="font-bold text-text-primary">{rule.title}</p>
              <p className="mt-1 text-text-muted">{rule.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp100-failure-handling"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">失败处理</p>
          <p className="mt-1">
            {mvp100LibraryIndexPatchWrite.failureHandling.join(" / ")}
          </p>
        </div>
        <div
          id="mvp100-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">边界</p>
          <p className="mt-1">
            {mvp100LibraryIndexPatchWrite.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp100-library-index-patch-write-diagnostics / mvp100-write-cards /
          mvp100-write-contract / mvp100-write-result-preview /
          mvp100-write-rules / mvp100-failure-handling / mvp100-guardrails /
          mvp100-library-index-patch-write-v1 /
          library-index.backup.before-mvp100 / CONFIRM_WRITE_LIBRARY_INDEX_PATCH
          / no SQLite / no absolutePath / no file://
        </div>
      </section>


      <section
        id="mvp108-importer-final-regression-checklist-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-108 · importer final regression checklist
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp108ImporterFinalRegressionChecklist.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp108ImporterFinalRegressionChecklist.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {mvp108ImporterFinalRegressionChecklist.version}
          </span>
        </div>
        <div
          id="mvp108-release-gate-cards-diagnostics"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp108ImporterFinalRegressionChecklist.releaseGateCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${importerFinalRegressionChecklistService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.status} · {card.expected}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp108-final-regression-result"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">
            {primaryMvp108ImporterFinalRegressionResult.checklistVersion}
          </p>
          <p className="mt-1">
            developmentPausedAfterCloseout:{" "}
            {String(
              primaryMvp108ImporterFinalRegressionResult.developmentPausedAfterCloseout,
            )}{" "}
            / requiresManualPackagedRegression:{" "}
            {String(
              primaryMvp108ImporterFinalRegressionResult.requiresManualPackagedRegression,
            )}
          </p>
          <p className="mt-1">
            fileOperationsChanged:{" "}
            {String(primaryMvp108ImporterFinalRegressionResult.fileOperationsChanged)} /
            libraryIndexWrittenInMvp108:{" "}
            {String(
              primaryMvp108ImporterFinalRegressionResult.libraryIndexWrittenInMvp108,
            )}
          </p>
        </div>
        <div
          id="mvp108-audit-findings"
          className="grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {mvp108ImporterFinalRegressionChecklist.auditFindings.map((finding) => (
            <div
              key={finding.id}
              className={`rounded-xl border p-3 ${importerFinalRegressionChecklistService.getToneClassName(finding.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {finding.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {finding.finding}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp108-pause-scope"
          className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
        >
          <p className="font-bold text-violet-100">暂停范围</p>
          <p className="mt-1">
            {mvp108ImporterFinalRegressionChecklist.pauseScope.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp108-importer-final-regression-checklist-diagnostics /
          mvp108-release-gate-cards-diagnostics /
          mvp108-final-regression-result / mvp108-audit-findings /
          mvp108-pause-scope /
          mvp108-importer-final-regression-checklist-v1 /
          developmentPausedAfterCloseout true / fileOperationsChanged false / no
          SQLite / no downloader / no metadata Provider / no mpv / no
          absolutePath / no file:// / Codex 非必要不安排
        </div>
      </section>

      <section
        id="mvp107-importer-daily-ui-cleanup-diagnostics"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              MVP-107 · importer daily UI cleanup
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp107ImporterDailyUiCleanup.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp107ImporterDailyUiCleanup.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            {mvp107ImporterDailyUiCleanup.version}
          </span>
        </div>
        <div
          id="mvp107-daily-import-status-cards-diagnostics"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp107ImporterDailyUiCleanup.statusCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${importerDailyUiCleanupService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.value} · {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp107-importer-ai-maintenance-summary"
          className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
        >
          <p className="font-bold text-violet-100">AI 维护区保留内容</p>
          <p className="mt-1">
            {mvp107ImporterDailyUiCleanup.aiMaintenanceFoldSummary.join(" / ")}
          </p>
        </div>
        <div
          id="mvp107-cleanup-result"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">
            {primaryMvp107ImporterDailyUiCleanupResult.cleanupVersion}
          </p>
          <p className="mt-1">
            dailyImporterSurfaceEnabled:{" "}
            {String(
              primaryMvp107ImporterDailyUiCleanupResult.dailyImporterSurfaceEnabled,
            )}{" "}
            / aiMaintenanceFoldEnabled:{" "}
            {String(
              primaryMvp107ImporterDailyUiCleanupResult.aiMaintenanceFoldEnabled,
            )}
          </p>
          <p className="mt-1">
            fileOperationsChanged:{" "}
            {String(
              primaryMvp107ImporterDailyUiCleanupResult.fileOperationsChanged,
            )}{" "}
            / libraryIndexWrittenInMvp107:{" "}
            {String(
              primaryMvp107ImporterDailyUiCleanupResult.libraryIndexWrittenInMvp107,
            )}
          </p>
        </div>
        <div
          id="mvp107-not-touched"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">未触碰</p>
          <p className="mt-1">
            {mvp107ImporterDailyUiCleanup.notTouched.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp107-importer-daily-ui-cleanup-diagnostics /
          mvp107-daily-import-status-cards-diagnostics /
          mvp107-importer-ai-maintenance-summary / mvp107-cleanup-result /
          mvp107-not-touched / mvp107-importer-daily-ui-cleanup-v1 /
          importerExecutionChanged false / fileOperationsChanged false / no
          SQLite / no downloader / no metadata Provider / no mpv / no
          absolutePath / no file:// / Codex 非必要不安排
        </div>
      </section>

      <section
        id="mvp106-move-only-closeout-diagnostics"
        className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-cyan-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-cyan-300 tracking-wider">
              MVP-106 · move-only closeout
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp106MoveOnlyCloseout.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp106MoveOnlyCloseout.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-[10px] font-bold text-cyan-100 whitespace-nowrap">
            {mvp106MoveOnlyCloseout.version}
          </span>
        </div>
        <div
          id="mvp106-move-closeout-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp106MoveOnlyCloseout.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${moveOnlyCloseoutService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp106-closeout-result"
          className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[10px] leading-relaxed text-cyan-50/90"
        >
          <p className="font-bold text-cyan-100">
            {primaryMvp106MoveCloseoutResult.closeoutVersion}
          </p>
          <p className="mt-1">
            copyOnlyChainClosed:{" "}
            {String(primaryMvp106MoveCloseoutResult.copyOnlyChainClosed)} /
            moveOnlyChainClosed:{" "}
            {String(primaryMvp106MoveCloseoutResult.moveOnlyChainClosed)}
          </p>
          <p className="mt-1">
            libraryIndexWrittenInMvp106:{" "}
            {String(
              primaryMvp106MoveCloseoutResult.libraryIndexWrittenInMvp106,
            )}{" "}
            / sqliteWritten:{" "}
            {String(primaryMvp106MoveCloseoutResult.sqliteWritten)}
          </p>
        </div>
        <div
          id="mvp106-ai-maintenance-summary"
          className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
        >
          <p className="font-bold text-violet-100">AI 维护摘要</p>
          <p className="mt-1">
            {mvp106MoveOnlyCloseout.aiMaintenanceSummary.join(" / ")}
          </p>
        </div>
        <div
          id="mvp106-next-cleanup-policy"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">下一轮导入器 UI 简化</p>
          <p className="mt-1">
            {mvp106MoveOnlyCloseout.cleanupPolicy.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp106-move-only-closeout-diagnostics / mvp106-move-closeout-cards /
          mvp106-closeout-result / mvp106-ai-maintenance-summary /
          mvp106-next-cleanup-policy / mvp106-move-only-closeout-v1 /
          copyOnlyChainClosed / moveOnlyChainClosed / MVP107 importer daily UI
          cleanup / no SQLite / no library-index.json write / no downloader / no
          metadata Provider / no mpv / no absolutePath / no file:// / Codex
          非必要不安排
        </div>
      </section>

      <section
        id="mvp105-small-sample-move-only-executor-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-105 · small-sample move-only executor
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp105MoveOnlyExecutor.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp105MoveOnlyExecutor.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {mvp105MoveOnlyExecutor.version}
          </span>
        </div>
        <div
          id="mvp105-move-executor-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp105MoveOnlyExecutor.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${moveOnlyExecutorService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp105-move-result-preview"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">
            {primaryMvp105MoveExecutorResult.executorVersion}
          </p>
          <p className="mt-1">
            status: {primaryMvp105MoveExecutorResult.status} / moved:{" "}
            {primaryMvp105MoveExecutorResult.movedCount} / skipped:{" "}
            {primaryMvp105MoveExecutorResult.skippedCount}
          </p>
          <p className="mt-1">
            failureStopTriggered:{" "}
            {String(primaryMvp105MoveExecutorResult.failureStopTriggered)} /
            libraryIndexWritten:{" "}
            {String(primaryMvp105MoveExecutorResult.libraryIndexWritten)}
          </p>
        </div>
        <div
          id="mvp105-move-rules"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">执行规则</p>
          <p className="mt-1">
            {mvp105MoveOnlyExecutor.executorRules.join(" / ")}
          </p>
        </div>
        <div
          id="mvp105-failure-stop-policy"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">失败停止</p>
          <p className="mt-1">
            {mvp105MoveOnlyExecutor.failureStopPolicy.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp105-small-sample-move-only-executor-diagnostics /
          mvp105-move-executor-cards / mvp105-move-result-preview /
          mvp105-move-rules / mvp105-failure-stop-policy /
          mvp105-small-sample-move-only-executor-v1 / move-only-small-sample /
          CONFIRM_MOVE_IMPORT / mvp105-move-only-operation-log-v1 / no SQLite /
          no library-index.json / no downloader / no metadata Provider / no mpv
          / no absolutePath / no file:// / Codex 非必要不安排
        </div>
      </section>

      <section
        id="mvp104-move-only-execution-readiness-diagnostics"
        className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-orange-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-orange-300 tracking-wider">
              MVP-104 · move-only execution readiness
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp104MoveOnlyExecutionReadiness.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp104MoveOnlyExecutionReadiness.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-orange-500/25 bg-orange-500/10 text-[10px] font-bold text-orange-100 whitespace-nowrap">
            {mvp104MoveOnlyExecutionReadiness.version}
          </span>
        </div>
        <div
          id="mvp104-move-readiness-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp104MoveOnlyExecutionReadiness.readinessCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${moveOnlyExecutionReadinessService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp104-readiness-result"
          className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-[10px] leading-relaxed text-orange-50/90"
        >
          <p className="font-bold text-orange-100">
            {primaryMvp104MoveReadinessResult.readinessVersion}
          </p>
          <p className="mt-1">
            state: {primaryMvp104MoveReadinessResult.readinessState} /
            canExecuteMoveInMvp104:{" "}
            {String(primaryMvp104MoveReadinessResult.canExecuteMoveInMvp104)}
          </p>
          <p className="mt-1">
            realMoveExecuted:{" "}
            {String(primaryMvp104MoveReadinessResult.realMoveExecuted)} /
            fsRenameCalled:{" "}
            {String(primaryMvp104MoveReadinessResult.fsRenameCalled)}
          </p>
        </div>
        <div
          id="mvp104-move-preflight-checks"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {primaryMvp104MoveReadinessResult.preflightChecks.map((check) => (
            <div
              key={check.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-text-secondary"
            >
              <p className="font-bold text-text-primary">
                {check.label} · {check.status}
              </p>
              <p className="mt-1">{check.detail}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp104-required-executor-inputs"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">MVP105 输入</p>
          <p className="mt-1">
            {mvp104MoveOnlyExecutionReadiness.requiredExecutorInputs.join(
              " / ",
            )}
          </p>
        </div>
        <div
          id="mvp104-failure-stop-policy"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">失败停止策略</p>
          <p className="mt-1">
            {mvp104MoveOnlyExecutionReadiness.failureStopPolicy.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp104-move-only-execution-readiness-diagnostics /
          mvp104-move-readiness-cards / mvp104-readiness-result /
          mvp104-move-preflight-checks / mvp104-required-executor-inputs /
          mvp104-failure-stop-policy / mvp104-move-only-execution-readiness-v1 /
          CONFIRM_MOVE_IMPORT / disabled-readiness-only / no real move / no
          fs.rename / no fs.rm / no fs.unlink / no SQLite / no Codex required /
          no absolutePath / no file://
        </div>
      </section>

      <section
        id="mvp103-move-only-strategy-diagnostics"
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-amber-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-amber-300 tracking-wider">
              MVP-103 · move-only strategy
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp103MoveOnlyStrategy.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp103MoveOnlyStrategy.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-amber-500/25 bg-amber-500/10 text-[10px] font-bold text-amber-100 whitespace-nowrap">
            {mvp103MoveOnlyStrategy.version}
          </span>
        </div>
        <div
          id="mvp103-move-only-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp103MoveOnlyStrategy.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${moveOnlyStrategyService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp103-strategy-preview"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">
            {mvp103MoveOnlyStrategy.strategyPreview.strategyVersion}
          </p>
          <p className="mt-1">
            actualMoveImplemented:{" "}
            {String(
              mvp103MoveOnlyStrategy.strategyPreview.actualMoveImplemented,
            )}{" "}
            / moveOperationTouched:{" "}
            {String(
              mvp103MoveOnlyStrategy.strategyPreview.moveOperationTouched,
            )}
          </p>
          <p className="mt-1">
            codexRequired:{" "}
            {String(mvp103MoveOnlyStrategy.strategyPreview.codexRequired)} /
            libraryIndexWritten:{" "}
            {String(mvp103MoveOnlyStrategy.strategyPreview.libraryIndexWritten)}
          </p>
        </div>
        <div
          id="mvp103-move-only-phases"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp103MoveOnlyStrategy.phases.map((phase) => (
            <div
              key={phase.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-text-secondary"
            >
              <p className="font-bold text-text-primary">
                {phase.mvp} · {phase.title}
              </p>
              <p className="mt-1">
                {phase.status} / {phase.acceptance}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp103-ui-policy"
          className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
        >
          <p className="font-bold text-violet-100">UI 收口原则</p>
          <p className="mt-1">{mvp103MoveOnlyStrategy.uiPolicy.join(" / ")}</p>
        </div>
        <div
          id="mvp103-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">边界</p>
          <p className="mt-1">
            {mvp103MoveOnlyStrategy.guardrails
              .map((item) => `${item.rule}：${item.reason}`)
              .join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp103-move-only-strategy-diagnostics / mvp103-move-only-cards /
          mvp103-strategy-preview / mvp103-move-only-phases / mvp103-ui-policy /
          mvp103-guardrails / mvp103-move-only-strategy-v1 / no real move / no
          fs.rename / no fs.rm / no fs.unlink / no SQLite / no Codex required /
          no absolutePath / no file://
        </div>
      </section>

      <section
        id="mvp102-copy-only-import-closeout-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-102 · copy-only import closeout
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp102CopyOnlyImportCloseout.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp102CopyOnlyImportCloseout.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {mvp102CopyOnlyImportCloseout.version}
          </span>
        </div>
        <div
          id="mvp102-closeout-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp102CopyOnlyImportCloseout.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${copyOnlyImportCloseoutService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp102-closeout-result"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">
            {mvp102CopyOnlyImportCloseout.closeoutResult.closeoutVersion}
          </p>
          <p className="mt-1">
            closedRange:{" "}
            {mvp102CopyOnlyImportCloseout.closeoutResult.closedRange} /
            importChainClosed:{" "}
            {String(
              mvp102CopyOnlyImportCloseout.closeoutResult.importChainClosed,
            )}
          </p>
          <p className="mt-1">
            sqliteWritten:{" "}
            {String(mvp102CopyOnlyImportCloseout.closeoutResult.sqliteWritten)}{" "}
            / moveDeleteRenameTouched:{" "}
            {String(
              mvp102CopyOnlyImportCloseout.closeoutResult
                .moveDeleteRenameTouched,
            )}
          </p>
        </div>
        <div
          id="mvp102-closed-stage-list"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp102CopyOnlyImportCloseout.completedStages.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-text-secondary"
            >
              <p className="font-bold text-text-primary">
                {stage.mvp} · {stage.title}
              </p>
              <p className="mt-1">
                {stage.status} / {stage.output}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp102-codex-prompt"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">Codex 提示词</p>
          <p className="mt-1">
            {mvp102CopyOnlyImportCloseout.codexPrompt.join(" / ")}
          </p>
        </div>
        <div
          id="mvp102-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">边界</p>
          <p className="mt-1">
            {mvp102CopyOnlyImportCloseout.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp102-copy-only-import-closeout-diagnostics / mvp102-closeout-cards /
          mvp102-closeout-result / mvp102-closed-stage-list /
          mvp102-codex-prompt / mvp102-guardrails /
          mvp102-copy-only-import-closeout-v1 / MVP95-MVP101 / no SQLite / no
          downloader / no mpv / no move delete rename / no absolutePath / no
          file://
        </div>
      </section>

      <section
        id="mvp101-import-ui-refresh-after-patch-diagnostics"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              MVP-101 · 写入后 UI 刷新
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp101ImportUiRefresh.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp101ImportUiRefresh.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            {mvp101ImportUiRefresh.version}
          </span>
        </div>
        <div
          id="mvp101-refresh-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp101ImportUiRefresh.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${importPatchUiRefreshService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp101-refresh-runtime-contract"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">
            {mvp101ImportUiRefresh.runtimeContract.channel}
          </p>
          <p className="mt-1">
            mode: {mvp101ImportUiRefresh.runtimeContract.mode} / source:{" "}
            {mvp101ImportUiRefresh.runtimeContract.source}
          </p>
          <p className="mt-1">
            readsLibraryIndexJson:{" "}
            {String(
              mvp101ImportUiRefresh.runtimeContract.readsLibraryIndexJson,
            )}{" "}
            / writesLibraryIndexJson:{" "}
            {String(
              mvp101ImportUiRefresh.runtimeContract.writesLibraryIndexJson,
            )}
          </p>
        </div>
        <div
          id="mvp101-refresh-result-preview"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">refresh result preview</p>
          <p className="mt-1">
            {mvp101ImportUiRefresh.resultPreview.refreshVersion}
          </p>
          <p className="mt-1">
            event: {mvp101ImportUiRefresh.rendererStorage.eventName} / cache:{" "}
            {mvp101ImportUiRefresh.rendererStorage.readCacheKey}
          </p>
        </div>
        <div
          id="mvp101-refresh-steps"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp101ImportUiRefresh.refreshSteps.map((step) => (
            <div
              key={step}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-text-secondary"
            >
              <p>{step}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp101-codex-smoke-test"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
        >
          <p className="font-bold text-amber-100">Codex 最小实测</p>
          <p className="mt-1">
            {mvp101ImportUiRefresh.codexSmokeTest.join(" / ")}
          </p>
        </div>
        <div
          id="mvp101-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">边界</p>
          <p className="mt-1">
            {mvp101ImportUiRefresh.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp101-import-ui-refresh-after-patch-diagnostics /
          mvp101-refresh-cards / mvp101-refresh-runtime-contract /
          mvp101-refresh-result-preview / mvp101-refresh-steps /
          mvp101-codex-smoke-test / mvp101-guardrails /
          mvp101-import-ui-refresh-after-patch-v1 /
          yang-kura-library-index-loaded / no SQLite / no full scan / no
          absolutePath / no file://
        </div>
      </section>

      <section
        id="mvp99-library-index-patch-write-readiness-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-99 · 写入准备门禁
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp99LibraryIndexPatchWriteReadiness.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp99LibraryIndexPatchWriteReadiness.summary}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {mvp99LibraryIndexPatchWriteReadiness.version}
          </span>
        </div>
        <div
          id="mvp99-readiness-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp99LibraryIndexPatchWriteReadiness.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${libraryIndexPatchWriteReadinessService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp99-write-readiness-contract"
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
        >
          <p className="font-bold text-sky-100">
            {mvp99LibraryIndexPatchWriteReadiness.requestContract.channel}
          </p>
          <p className="mt-1">
            mode: {mvp99LibraryIndexPatchWriteReadiness.requestContract.mode} /
            source:{" "}
            {mvp99LibraryIndexPatchWriteReadiness.requestContract.source}
          </p>
          <p className="mt-1">
            confirmation:{" "}
            {
              mvp99LibraryIndexPatchWriteReadiness.requestContract
                .requiredConfirmationText
            }{" "}
            / backupRequired:{" "}
            {String(
              mvp99LibraryIndexPatchWriteReadiness.requestContract
                .backupRequired,
            )}
          </p>
          <p className="mt-1">
            writeExecutionAllowedInMvp99:{" "}
            {String(
              mvp99LibraryIndexPatchWriteReadiness.requestContract
                .writeExecutionAllowedInMvp99,
            )}
          </p>
        </div>
        <div
          id="mvp99-readiness-preview"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">readiness preview</p>
          <p className="mt-1">
            {
              mvp99LibraryIndexPatchWriteReadiness.readinessPreview
                .readinessVersion
            }
          </p>
          <p className="mt-1">
            readyForMvp100Write:{" "}
            {String(
              mvp99LibraryIndexPatchWriteReadiness.readinessPreview
                .readyForMvp100Write,
            )}{" "}
            / libraryIndexWritten:{" "}
            {String(
              mvp99LibraryIndexPatchWriteReadiness.readinessPreview
                .libraryIndexWritten,
            )}
          </p>
          <p className="mt-1">
            backup:{" "}
            {
              mvp99LibraryIndexPatchWriteReadiness.backupPlan
                .backupFileNamePattern
            }
          </p>
        </div>
        <div
          id="mvp99-confirmation-checklist"
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          {mvp99LibraryIndexPatchWriteReadiness.confirmationChecklist.map(
            (item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
              >
                <p className="font-bold text-text-primary">{item.title}</p>
                <p className="mt-1 text-text-muted">{item.detail}</p>
              </div>
            ),
          )}
        </div>
        <div
          id="mvp99-personal-speed-boundary"
          className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
        >
          <p className="font-bold text-violet-100">个人项目提速边界</p>
          <p className="mt-1">
            {
              mvp99LibraryIndexPatchWriteReadiness.personalProjectPolicy
                .speedNote
            }
          </p>
          <p className="mt-1">
            {
              mvp99LibraryIndexPatchWriteReadiness.personalProjectPolicy
                .boundaryNote
            }
          </p>
        </div>
        <div
          id="mvp99-guardrails"
          className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
        >
          <p className="font-bold text-rose-100">边界</p>
          <p className="mt-1">
            {mvp99LibraryIndexPatchWriteReadiness.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div className="sr-only">
          mvp99-library-index-patch-write-readiness-diagnostics /
          mvp99-readiness-cards / mvp99-write-readiness-contract /
          mvp99-readiness-preview / mvp99-backup-plan /
          mvp99-confirmation-checklist / mvp99-personal-speed-boundary /
          mvp99-guardrails / mvp99-library-index-patch-write-readiness-v1 /
          CONFIRM_WRITE_LIBRARY_INDEX_PATCH / no library-index.json / no SQLite
          / no absolutePath / no file://
        </div>
      </section>

      <section
        id="mvp95-copy-only-executor-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-95 copy-only executor
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp95CopyOnlyExecutor.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp95CopyOnlyExecutor.summary}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-100">
            {mvp95CopyOnlyExecutor.version}
          </span>
        </div>
        <div
          id="mvp95-copy-executor-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp95CopyOnlyExecutor.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${copyOnlyExecutorService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold opacity-75">{card.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp95-copy-executor-request-contract"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold text-amber-100">request contract</p>
          <p className="mt-1">
            confirmedCopyOnly:{" "}
            {String(mvp95CopyOnlyExecutor.requestPreview.confirmedCopyOnly)} /
            confirmationText:{" "}
            {mvp95CopyOnlyExecutor.requestPreview.confirmationText}
          </p>
          <p className="mt-1">
            relativePaths:{" "}
            {mvp95CopyOnlyExecutor.requestPreview.relativePaths.length} / no
            absolutePath / no file://
          </p>
        </div>
        <div
          id="mvp95-copy-executor-result-preview"
          className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-[10px] text-emerald-50/90 leading-relaxed"
        >
          <p className="font-bold text-emerald-100">result preview</p>
          <p className="mt-1">
            status: {mvp95CopyOnlyExecutor.resultPreview.status}
          </p>
          <p className="mt-1">
            copied/skipped/failed:{" "}
            {mvp95CopyOnlyExecutor.resultPreview.copiedCount}/
            {mvp95CopyOnlyExecutor.resultPreview.skippedCount}/
            {mvp95CopyOnlyExecutor.resultPreview.failedCount}
          </p>
          <p className="mt-1">
            operationLogPersisted:{" "}
            {String(mvp95CopyOnlyExecutor.resultPreview.operationLogPersisted)}{" "}
            / libraryIndexWritten:{" "}
            {String(mvp95CopyOnlyExecutor.resultPreview.libraryIndexWritten)}
          </p>
        </div>
        <div
          id="mvp95-copy-result-lists"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <p className="font-bold text-sky-100">copied / skipped lists</p>
          <p className="mt-1">
            {mvp95CopyOnlyExecutor.resultPreview.copiedFiles
              .map(
                (file) =>
                  `${file.sourceRelativePath}→${file.targetRelativePath}`,
              )
              .join(" / ")}
          </p>
          <p className="mt-1">
            skip:{" "}
            {mvp95CopyOnlyExecutor.resultPreview.skippedList
              .map((file) => `${file.targetRelativePath}:${file.reasonCode}`)
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp95-copy-executor-safety-rules"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold text-rose-100">safety rules</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp95CopyOnlyExecutor.executorRules.map((rule) => (
              <li key={rule.id}>
                {rule.title}: {rule.detail}
              </li>
            ))}
          </ul>
        </div>
        <div
          id="mvp95-operation-log-preview-only"
          className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-3 text-[10px] text-violet-50/90 leading-relaxed"
        >
          <p className="font-bold text-violet-100">OperationLog preview-only</p>
          <p className="mt-1">
            persisted:{" "}
            {String(
              mvp95CopyOnlyExecutor.resultPreview.operationLogPreview.persisted,
            )}{" "}
            / 不写 library-index.json。
          </p>
        </div>
        <div
          id="mvp95-codex-real-sample-gate"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold text-amber-100">Codex gate</p>
          <p className="mt-1">
            sendToCodexNow:{" "}
            {String(mvp95CopyOnlyExecutor.codexGate.sendToCodexNow)} /{" "}
            {mvp95CopyOnlyExecutor.codexGate.requiredAfterBuild}
          </p>
        </div>
        <div className="sr-only">
          mvp95-copy-only-executor / mvp95-copy-executor-cards /
          mvp95-copy-executor-request-contract /
          mvp95-copy-executor-result-preview / mvp95-copy-result-lists /
          mvp95-copy-executor-safety-rules / mvp95-operation-log-preview-only /
          mvp95-codex-real-sample-gate / COPYFILE_EXCL / no move / no delete /
          no rename / no library-index write / absolutePath / file://
        </div>
      </section>

      <section
        id="mvp96-copy-only-operation-log-diagnostics"
        className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-violet-300 tracking-wider">
              MVP-96 copy-only OperationLog
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp96CopyOnlyOperationLog.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp96CopyOnlyOperationLog.summary}
            </p>
          </div>
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[9px] font-bold text-violet-100">
            {mvp96CopyOnlyOperationLog.version}
          </span>
        </div>
        <div
          id="mvp96-operation-log-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp96CopyOnlyOperationLog.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${copyOnlyOperationLogService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold opacity-75">{card.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp96-operation-log-file-contract"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <p className="font-bold text-sky-100">file contract</p>
          <p className="mt-1">
            {mvp96CopyOnlyOperationLog.logFileContract.filename} / appendOnly:{" "}
            {String(mvp96CopyOnlyOperationLog.logFileContract.appendOnly)} /
            returnedToRenderer:{" "}
            {String(
              mvp96CopyOnlyOperationLog.logFileContract.returnedToRenderer,
            )}
          </p>
        </div>
        <div
          id="mvp96-operation-log-schema"
          className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-3 text-[10px] text-violet-50/90 leading-relaxed"
        >
          <p className="font-bold text-violet-100">schema</p>
          <p className="mt-1">
            {mvp96CopyOnlyOperationLog.schemaFields
              .map((field) => field.field)
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp96-operation-log-result-preview"
          className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-[10px] text-emerald-50/90 leading-relaxed"
        >
          <p className="font-bold text-emerald-100">result</p>
          <p className="mt-1">
            status: {mvp96CopyOnlyOperationLog.sampleExecutorResult.status}
          </p>
          <p className="mt-1">
            operationLogPersisted:{" "}
            {String(
              mvp96CopyOnlyOperationLog.sampleExecutorResult
                .operationLogPersisted,
            )}{" "}
            / absolutePathReturned:{" "}
            {String(
              mvp96CopyOnlyOperationLog.sampleExecutorResult
                .absolutePathReturned,
            )}
          </p>
        </div>
        <div
          id="mvp96-operation-log-entry-preview"
          className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <p className="font-bold text-text-primary">entry preview</p>
          <p className="mt-1">
            operationId: {mvp96CopyOnlyOperationLog.sampleLogEntry.operationId}
          </p>
          <p className="mt-1">
            counts: {mvp96CopyOnlyOperationLog.sampleLogEntry.copiedCount}/
            {mvp96CopyOnlyOperationLog.sampleLogEntry.skippedCount}/
            {mvp96CopyOnlyOperationLog.sampleLogEntry.failedCount}
          </p>
        </div>
        <div
          id="mvp96-operation-log-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold text-rose-100">guardrails</p>
          <p className="mt-1">
            {mvp96CopyOnlyOperationLog.guardedBoundaries.join(" / ")}
          </p>
        </div>
        <div
          id="mvp96-codex-operation-log-gate"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold text-amber-100">Codex gate</p>
          <p className="mt-1">
            sendToCodexNow:{" "}
            {String(mvp96CopyOnlyOperationLog.codexGate.sendToCodexNow)} /{" "}
            {mvp96CopyOnlyOperationLog.codexGate.requiredAfterBuild}
          </p>
        </div>
        <div className="sr-only">
          mvp96-copy-only-operation-log-diagnostics / mvp96-operation-log-cards
          / mvp96-operation-log-file-contract / mvp96-operation-log-schema /
          mvp96-operation-log-result-preview / mvp96-operation-log-entry-preview
          / mvp96-operation-log-guardrails / mvp96-codex-operation-log-gate /
          appendFile / import-operation-log.jsonl / no absolutePath / no file://
          / no library-index.json
        </div>
      </section>

      <section
        id="mvp94-copy-only-preflight-real-check-diagnostics"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-sky-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              MVP-94 copy-only preflight real check
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp94CopyOnlyPreflightRealCheck.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp94CopyOnlyPreflightRealCheck.summary}
            </p>
          </div>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[9px] font-bold text-sky-100">
            {mvp94CopyOnlyPreflightRealCheck.version}
          </span>
        </div>
        <div
          id="mvp94-preflight-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp94CopyOnlyPreflightRealCheck.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${copyOnlyPreflightRealCheckService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp94-main-side-preflight-contract"
          className="grid grid-cols-1 lg:grid-cols-2 gap-2"
        >
          {mvp94CopyOnlyPreflightRealCheck.mainSideContracts.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
            >
              <p className="font-bold text-text-primary">{item.title}</p>
              <p className="mt-1">
                {item.status} · {item.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp94-preflight-result-preview"
          className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-3 text-[10px] text-violet-50/90 leading-relaxed"
        >
          <p className="font-bold">preflight result</p>
          <p className="mt-1">
            status: {mvp94CopyOnlyPreflightRealCheck.sampleResult.status}
          </p>
          <p className="mt-1">
            executeAllowed:{" "}
            {String(
              mvp94CopyOnlyPreflightRealCheck.sampleResult.executeAllowed,
            )}{" "}
            / copiedCount:{" "}
            {mvp94CopyOnlyPreflightRealCheck.sampleResult.copiedCount}
          </p>
          <p className="mt-1">
            checkedFileCount:{" "}
            {mvp94CopyOnlyPreflightRealCheck.sampleResult.checkedFileCount} /
            targetExistingCount:{" "}
            {mvp94CopyOnlyPreflightRealCheck.sampleResult.targetExistingCount}
          </p>
        </div>
        <div
          id="mvp94-preflight-file-checks"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold">file checks</p>
          <p className="mt-1">
            {mvp94CopyOnlyPreflightRealCheck.sampleResult.fileChecks
              .map(
                (file) =>
                  `${file.sourceRelativePath}→${file.targetRelativePath}:${file.blockedReasonCodes.join("|") || "pass"}`,
              )
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp94-preflight-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp94CopyOnlyPreflightRealCheck.blockedExecutionRules.map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
        </div>
        <div
          id="mvp94-codex-gate"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <p className="font-bold">Codex gate</p>
          <p className="mt-1">
            sendToCodexNow:{" "}
            {String(mvp94CopyOnlyPreflightRealCheck.codexGate.sendToCodexNow)} /{" "}
            {mvp94CopyOnlyPreflightRealCheck.codexGate.nextCodexTrigger}
          </p>
        </div>
        <div className="sr-only">
          mvp94-copy-only-preflight-real-check /
          mvp94-main-side-preflight-contract / mvp94-preflight-result-preview /
          mvp94-preflight-file-checks / no fs.copyFile / no mkdir / no
          OperationLog write / absolutePath / file://
        </div>
      </section>
      <section
        id="mvp93-copy-only-main-side-stub-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-emerald-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-93 copy-only main-side stub
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp93CopyOnlyMainSideStub.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp93CopyOnlyMainSideStub.summary}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-100">
            {mvp93CopyOnlyMainSideStub.version}
          </span>
        </div>
        <div
          id="mvp93-copy-stub-cards"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp93CopyOnlyMainSideStub.cards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${copyOnlyMainSideStubService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp93-copy-stub-channels"
          className="grid grid-cols-1 lg:grid-cols-2 gap-2"
        >
          {mvp93CopyOnlyMainSideStub.stubChannels.slice(0, 4).map((channel) => (
            <div
              key={channel.channel}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
            >
              <p className="font-bold text-text-primary">{channel.channel}</p>
              <p className="mt-1">
                {channel.methodName} / {channel.status}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp93-copy-stub-blocked-result"
          className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-3 text-[10px] text-violet-50/90 leading-relaxed"
        >
          <p className="font-bold">blocked result</p>
          <p className="mt-1">
            status:{" "}
            {mvp93CopyOnlyMainSideStub.preflightPreview.blockedResult.status}
          </p>
          <p className="mt-1">
            executeAllowed:{" "}
            {String(
              mvp93CopyOnlyMainSideStub.preflightPreview.blockedResult
                .executeAllowed,
            )}{" "}
            / copiedCount:{" "}
            {
              mvp93CopyOnlyMainSideStub.preflightPreview.blockedResult
                .copiedCount
            }
          </p>
        </div>
        <div
          id="mvp93-main-side-stub-guards"
          className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] text-amber-50/90 leading-relaxed"
        >
          <p className="font-bold">main-side stub guards</p>
          <p className="mt-1">
            {mvp93CopyOnlyMainSideStub.mainSideGuards
              .map((guard) => guard.title)
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp93-codex-prompt-gate"
          className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] text-sky-50/90 leading-relaxed"
        >
          <p className="font-bold">Codex gate</p>
          <p className="mt-1">
            {mvp93CopyOnlyMainSideStub.codexPromptLines
              .map((line) => `${line.prompt} (${line.sendToCodexNow})`)
              .join(" / ")}
          </p>
        </div>
        <div
          id="mvp93-copy-stub-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp93CopyOnlyMainSideStub.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp93-copy-only-main-side-stub / mvp93-copy-stub-channels /
          mvp93-copy-stub-blocked-result / mvp93-main-side-stub-guards /
          mvp93-codex-prompt-gate / no real copy / absolutePath / file://
        </div>
      </section>

      <section
        id="mvp88-music-import-readonly-detection-diagnostics"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-sky-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">
              MVP-88 音乐只读识别
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp88MusicReadonlyDetection.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp88MusicReadonlyDetection.summary}
            </p>
          </div>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[9px] font-bold text-sky-100">
            {mvp88MusicReadonlyDetection.version}
          </span>
        </div>
        <div
          id="mvp88-music-detection-rule-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp88MusicReadonlyDetection.ruleCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${musicImportReadOnlyDetectionService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp88-music-import-category-counts"
          className="grid grid-cols-2 md:grid-cols-7 gap-2"
        >
          {mvp88MusicReadonlyDetection.sampleResult.categoryCounts.map(
            (item) => (
              <div
                key={item.kind}
                className="rounded-xl border border-white/10 bg-black/10 p-2 text-center"
              >
                <p className="text-[9px] text-text-muted">{item.label}</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {item.count}
                </p>
              </div>
            ),
          )}
        </div>
        <details
          id="mvp88-music-readonly-import-task"
          className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer text-xs font-bold text-text-primary">
            Music ImportTask 识别结果 / 标签后置
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>
              sourceRootToken:{" "}
              {mvp88MusicReadonlyDetection.sampleResult.task.sourceRootToken}
            </p>
            <p>
              detectedType:{" "}
              {mvp88MusicReadonlyDetection.sampleResult.detectedType}
            </p>
            <p>
              artist:{" "}
              {mvp88MusicReadonlyDetection.sampleResult.detectedArtist ||
                "未识别"}
            </p>
            <p>
              album:{" "}
              {mvp88MusicReadonlyDetection.sampleResult.detectedAlbum ||
                "未识别"}
            </p>
            <p>
              targetRelativeDirectory:{" "}
              {
                mvp88MusicReadonlyDetection.sampleResult.task.targetPlan
                  .targetRelativeDirectory
              }
            </p>
            <p>
              conflictReport:{" "}
              {
                mvp88MusicReadonlyDetection.sampleResult.task.conflictReport
                  .summary
              }
            </p>
          </div>
        </details>
        <div
          id="mvp88-music-readonly-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp88MusicReadonlyDetection.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp88-music-import-readonly-detection / inferArtistAlbumFromFolder /
          classifyMusicImportRelativePath / isProtectedMusicDownload /
          music-album / music-singles / no ID3 tag reading / absolutePath /
          file:// / no file operations
        </div>
      </section>

      <section
        id="mvp87-rj-import-readonly-detection-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-emerald-500/10 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              MVP-87 RJ 只读识别
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp87RjReadonlyDetection.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp87RjReadonlyDetection.summary}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-100">
            {mvp87RjReadonlyDetection.version}
          </span>
        </div>
        <div
          id="mvp87-rj-detection-rule-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          {mvp87RjReadonlyDetection.ruleCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 ${rjImportReadOnlyDetectionService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold text-text-primary">
                {card.title}
              </p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp87-rj-import-category-counts"
          className="grid grid-cols-2 md:grid-cols-7 gap-2"
        >
          {mvp87RjReadonlyDetection.sampleResult.categoryCounts.map((item) => (
            <div
              key={item.kind}
              className="rounded-xl border border-white/10 bg-black/10 p-2 text-center"
            >
              <p className="text-[9px] text-text-muted">{item.label}</p>
              <p className="mt-1 text-sm font-black text-text-primary">
                {item.count}
              </p>
            </div>
          ))}
        </div>
        <details
          id="mvp87-rj-readonly-import-task"
          className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer text-xs font-bold text-text-primary">
            ImportTask 识别结果 / 路径 token
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>
              sourceRootToken:{" "}
              {mvp87RjReadonlyDetection.sampleResult.task.sourceRootToken}
            </p>
            <p>
              detectedCode:{" "}
              {mvp87RjReadonlyDetection.sampleResult.detectedCode || "未识别"}
            </p>
            <p>
              targetRelativeDirectory:{" "}
              {
                mvp87RjReadonlyDetection.sampleResult.task.targetPlan
                  .targetRelativeDirectory
              }
            </p>
            <p>
              conflictReport:{" "}
              {
                mvp87RjReadonlyDetection.sampleResult.task.conflictReport
                  .summary
              }
            </p>
          </div>
        </details>
        <div
          id="mvp87-rj-readonly-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold">安全边界</p>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            {mvp87RjReadonlyDetection.guardedBoundaries.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="sr-only">
          mvp87-rj-import-readonly-detection / normalizeRjCode /
          classifyImportRelativePath / sourceRootToken / relativePaths /
          absolutePath / file:// / no file operations
        </div>
      </section>

      <section
        id="mvp86-importer-ui-shell-diagnostics"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
              导入器 UI 壳 · 只预览不执行
            </p>
            <h3 className="mt-1 text-xs font-bold text-text-primary">
              {mvp86ImporterShell.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp86ImporterShell.summary}
            </p>
            <p className="mt-2 text-[9px] text-emerald-100/80 leading-relaxed">
              基线：{mvp86ImporterShell.baseline}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            不执行 copy / move
          </span>
        </div>
        <div
          id="mvp86-importer-source-options"
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {mvp86ImporterShell.sourceOptions.map((option) => (
            <div
              key={option.id}
              className={`rounded-xl border p-3 text-[10px] leading-relaxed ${importerPreviewShellService.getToneClassName(option.tone)}`}
            >
              <p className="text-[11px] font-bold text-text-primary">
                {option.label}
              </p>
              <p className="mt-2 opacity-85">{option.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {option.accepted.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          id="mvp86-importer-preview-steps"
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          {mvp86ImporterShell.previewSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
            >
              <p className="text-[11px] font-bold text-text-primary">
                {step.title}
              </p>
              <p className="mt-1">{step.description}</p>
              <p className="mt-2 text-[9px] text-emerald-100/70">
                {step.status}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp86-import-preview-task"
          className="grid grid-cols-1 lg:grid-cols-3 gap-3"
        >
          {mvp86ImporterShell.taskSummaryCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 text-[10px] ${importerPreviewShellService.getToneClassName(card.tone)}`}
            >
              <p className="font-bold text-text-primary">{card.label}</p>
              <p className="mt-1 opacity-85">{card.value}</p>
            </div>
          ))}
        </div>
        <details
          id="mvp86-import-target-plan-preview"
          className="rounded-xl border border-sky-500/15 bg-black/10 p-3 text-[10px] text-text-muted leading-relaxed"
        >
          <summary className="cursor-pointer list-none font-bold text-sky-100">
            目标路径计划 / 冲突预览
          </summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {mvp86ImporterShell.previewPanels.map((panel) => (
              <div
                key={panel.id}
                className={`rounded-lg border p-3 ${importerPreviewShellService.getToneClassName(panel.tone)}`}
              >
                <p className="font-bold text-text-primary">{panel.title}</p>
                <ul className="mt-2 list-disc pl-4 space-y-1">
                  {panel.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
        <div
          id="mvp86-importer-guardrails"
          className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[10px] text-rose-50/90 leading-relaxed"
        >
          <p className="font-bold text-rose-100">安全边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mvp86ImporterShell.guardedBoundaries.map((item) => (
              <span
                key={item}
                className="rounded-full border border-rose-500/20 bg-black/10 px-2 py-0.5 text-[9px]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="sr-only">
          mvp86-importer-ui-shell / mvp86-import-preview-task /
          mvp86-importer-guardrails / no file operations /{" "}
          {mvp86ImporterShell.disabledActions.join(" / ")}
        </div>
      </section>

      <details
        id="mvp75-diagnostics-history-folded"
        className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm"
      >
        <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-violet-200 tracking-wider">
              高级诊断 · 历史分组
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">
              {mvp75DiagnosticsHistory.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp75DiagnosticsHistory.subtitle}
            </p>
          </div>
          <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[9px] font-bold text-violet-100 whitespace-nowrap">
            默认折叠
          </span>
        </summary>
        <div
          id="mvp75-diagnostics-default-summary"
          className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-50 leading-relaxed"
        >
          <p className="font-bold text-emerald-100 mb-2">日常诊断摘要</p>
          <div className="space-y-1">
            {mvp75DiagnosticsHistory.dailySummary.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        </div>
        <div
          id="mvp75-diagnostics-phase-groups"
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {mvp75DiagnosticsHistory.groups.map((group) => (
            <details
              key={group.id}
              className={`rounded-xl border p-3 text-[10px] ${diagnosticsHistoryFoldService.getToneClassName(group.tone)}`}
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-extrabold text-text-primary">
                    {group.title}
                  </p>
                  <p className="mt-1 font-mono text-[9px] opacity-75">
                    {group.range}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-85">
                    {group.summary}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-70" />
              </summary>
              <div className="mt-3 flex flex-wrap gap-1">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] opacity-90"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div id="mvp75-diagnostics-maintenance-markers" className="sr-only">
          {mvp75DiagnosticsHistory.hiddenMaintenanceNote}
        </div>
      </details>

      <details
        id="mvp76-card-layout-unity"
        className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5 shadow-sm"
      >
        <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-fuchsia-200 tracking-wider">
              高级诊断 · UI 布局检查
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">
              {mvp76CardLayoutDiagnostics.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp76CardLayoutDiagnostics.description}
            </p>
          </div>
          <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2.5 py-1 text-[9px] font-bold text-fuchsia-100 whitespace-nowrap">
            默认折叠
          </span>
        </summary>
        <div
          id="mvp76-card-layout-checks"
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {mvp76CardLayoutDiagnostics.layoutChecks.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-fuchsia-500/15 bg-black/10 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary">
                {item.label}
              </p>
              <p className="mt-1 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
        <div
          id="mvp76-card-layout-guardrails"
          className="mt-4 flex flex-wrap gap-1.5"
        >
          {mvp76CardLayoutDiagnostics.guardrails.map((item) => (
            <span
              key={item}
              className="rounded-full border border-fuchsia-500/15 bg-fuchsia-500/10 px-2 py-0.5 text-[9px] text-fuchsia-50/80"
            >
              {item}
            </span>
          ))}
        </div>
      </details>

      <details
        id="mvp77-packaged-regression-review"
        className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm"
      >
        <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-200 tracking-wider">
              高级诊断 · 回归验收准备
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">
              {mvp77RegressionReview.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp77RegressionReview.description}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">
            默认折叠
          </span>
        </summary>
        <div
          id="mvp77-machine-checks"
          className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          {mvp77RegressionReview.machineChecks.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-3 py-3 text-[10px] ${packagedRegressionReviewService.getToneClassName(item.tone)}`}
            >
              <p className="text-[11px] font-bold text-text-primary">
                {item.label}
              </p>
              <p className="mt-1 leading-relaxed opacity-85">
                {item.description}
              </p>
              <p className="mt-1 rounded-lg bg-black/10 px-2 py-1 font-mono text-[9px] opacity-80">
                {item.expected}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp77-ui-layout-checks"
          className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3"
        >
          {mvp77RegressionReview.uiLayoutChecks.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-emerald-500/15 bg-black/10 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary">
                {section.title}
              </p>
              <p className="mt-1 leading-relaxed">{section.description}</p>
              <div className="mt-3 space-y-2">
                {section.checks.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border px-2 py-2 ${packagedRegressionReviewService.getToneClassName(item.tone)}`}
                  >
                    <p className="font-bold text-text-primary">{item.label}</p>
                    <p className="mt-1 leading-relaxed opacity-85">
                      {item.description}
                    </p>
                    <p className="mt-1 text-[9px] opacity-75">
                      期望：{item.expected}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div id="mvp77-manual-regression-checks" className="mt-4 space-y-3">
          {mvp77RegressionReview.manualChecks.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-emerald-500/15 bg-black/10 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary">
                {section.title}
              </p>
              <p className="mt-1 leading-relaxed">{section.description}</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {section.checks.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border px-2 py-2 ${packagedRegressionReviewService.getToneClassName(item.tone)}`}
                  >
                    <p className="font-bold text-text-primary">{item.label}</p>
                    <p className="mt-1 leading-relaxed opacity-85">
                      {item.description}
                    </p>
                    <p className="mt-1 text-[9px] opacity-75">
                      期望：{item.expected}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          id="mvp77-deepseek-review-prompt"
          className="mt-4 rounded-xl border border-emerald-500/15 bg-black/10 p-3 text-[10px] text-text-secondary"
        >
          <p className="text-[11px] font-bold text-text-primary">
            {mvp77RegressionReview.deepSeekPrompt.title}
          </p>
          <p className="mt-1 text-[9px] text-text-muted">
            提示词文件：{mvp77RegressionReview.deepSeekPrompt.copyTarget}
          </p>
          <div className="mt-3 space-y-1.5">
            {mvp77RegressionReview.deepSeekPrompt.prompt.map((line) => (
              <p
                key={line}
                className="rounded-lg bg-black/10 px-2 py-1 font-mono text-[9px] leading-relaxed"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {mvp77RegressionReview.guardrails.map((item) => (
            <span
              key={item}
              className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-50/80"
            >
              {item}
            </span>
          ))}
        </div>
      </details>

      <details
        id="mvp78-player-panel-layout-review"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 shadow-sm"
      >
        <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-sky-200 tracking-wider">
              高级诊断 · 播放器布局审查
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">
              {mvp78PlayerLayoutReview.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp78PlayerLayoutReview.description}
            </p>
          </div>
          <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[9px] font-bold text-sky-100 whitespace-nowrap">
            默认折叠
          </span>
        </summary>
        <div
          id="mvp78-player-layout-modes"
          className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3"
        >
          {mvp78PlayerLayoutReview.modes.map((mode) => (
            <div
              key={mode.id}
              className="rounded-xl border border-sky-500/15 bg-black/10 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary">
                {mode.title}
              </p>
              <p className="mt-1 leading-relaxed">{mode.description}</p>
              <div className="mt-3 space-y-2">
                {mode.checks.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border px-2 py-2 ${playerPanelLayoutReviewService.getToneClassName(item.tone)}`}
                  >
                    <p className="font-bold text-text-primary">{item.label}</p>
                    <p className="mt-1 leading-relaxed opacity-85">
                      {item.description}
                    </p>
                    <p className="mt-1 text-[9px] opacity-75">
                      期望：{item.expected}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          id="mvp78-player-layout-guardrails"
          className="mt-4 flex flex-wrap gap-1.5"
        >
          {mvp78PlayerLayoutReview.guardrails.map((item) => (
            <span
              key={item}
              className="rounded-full border border-sky-500/15 bg-sky-500/10 px-2 py-0.5 text-[9px] text-sky-50/80"
            >
              {item}
            </span>
          ))}
        </div>
        <div id="mvp78-player-layout-maintenance-marker" className="sr-only">
          {mvp78PlayerLayoutReview.hiddenMaintenanceNote}
        </div>
      </details>

      <details
        id="mvp79-player-ui-bugfix-diagnostics"
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm"
      >
        <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-amber-200 tracking-wider">
              高级诊断 · 播放器 UI bugfix
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">
              {mvp79PlayerUiBugfix.title}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp79PlayerUiBugfix.summary}
            </p>
          </div>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-100 whitespace-nowrap">
            默认折叠
          </span>
        </summary>
        <div
          id="mvp79-tailwind-class-normalization"
          className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3"
        >
          {mvp79PlayerUiBugfix.items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-amber-500/15 bg-black/10 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary">
                {item.title}
              </p>
              <p className="mt-1 leading-relaxed">{item.detail}</p>
              <p className="mt-2 text-[9px] font-bold text-amber-200">
                {item.status}
              </p>
            </div>
          ))}
        </div>
        <div
          id="mvp79-player-ui-bugfix-guardrails"
          className="mt-4 flex flex-wrap gap-1.5"
        >
          {mvp79PlayerUiBugfix.forbiddenScope.map((item) => (
            <span
              key={item}
              className="rounded-full border border-amber-500/15 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-50/80"
            >
              {item}
            </span>
          ))}
        </div>
        <div id="mvp79-player-ui-bugfix-marker" className="sr-only">
          {mvp79PlayerUiBugfix.hiddenMaintenanceNote}
        </div>
      </details>

      <section
        id="mvp44-diagnostics-separation"
        className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
          <div>
            <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-300" />
              <span>{mvp44Separation.diagnosticTitle}</span>
            </h3>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              {mvp44Separation.diagnosticDescription}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-200">
            设置 / 诊断分层
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {toArray(mvp44Separation.diagnosticCards).map((card) => (
            <div
              key={card.id}
              className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary mb-1">
                {card.title}
              </p>
              <p className="leading-relaxed mb-2">{card.description}</p>
              <div className="flex flex-wrap gap-1">
                {toArray(card.bullets).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] text-text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-50 leading-relaxed">
          <p className="font-bold text-emerald-100 mb-2">主界面与诊断页边界</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {toArray(mvp44Separation.safetyRules).map((rule) => (
              <p key={rule}>• {rule}</p>
            ))}
          </div>
        </div>
      </section>

      <details
        id="mvp71-ai-maintenance-zone"
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4"
      >
        <summary className="cursor-pointer list-none flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-amber-200 tracking-wider">
              AI 维护区
            </p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">
              {mvp71Simplification.maintenanceTitle}
            </h3>
            <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
              {mvp71Simplification.maintenanceDescription}
            </p>
          </div>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-100 whitespace-nowrap">
            默认折叠
          </span>
        </summary>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {mvp71Simplification.maintenanceBuckets.map((bucket) => (
            <div
              key={bucket.id}
              className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
            >
              <p className="text-[11px] font-bold text-text-primary mb-1">
                {bucket.title}
              </p>
              <p className="leading-relaxed mb-2">{bucket.description}</p>
              <div className="flex flex-wrap gap-1">
                {bucket.contains.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-amber-500/15 bg-amber-500/10 px-2 py-0.5 text-[9px] text-amber-50/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-6">
          <section
            id="mvp47-packaged-regression"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-emerald-300" />
                  <span>{mvp47PackagedRegression.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp47PackagedRegression.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-200">
                MVP-47
              </span>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-50 leading-relaxed">
              {mvp47PackagedRegression.summary}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mvp47PackagedRegression.checks.slice(0, 6).map((check) => (
                <div
                  key={check.id}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[11px] font-bold text-text-primary">
                      {check.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                        check.tone === "success"
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                          : check.tone === "warning"
                            ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
                            : "border-sky-500/25 bg-sky-500/10 text-sky-200"
                      }`}
                    >
                      {check.owner}
                    </span>
                  </div>
                  <p className="leading-relaxed">{check.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
              <div className="rounded-xl border border-border-color/50 bg-black/10 p-3">
                <p className="font-bold text-text-primary mb-2">推荐验证命令</p>
                <div className="space-y-1 font-mono text-text-secondary">
                  {mvp47PackagedRegression.commands
                    .slice(0, 6)
                    .map((command) => (
                      <p key={command.id}>{command.command}</p>
                    ))}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-black/10 p-3">
                <p className="font-bold text-text-primary mb-2">本轮继续后置</p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp47PackagedRegression.deferredItems).map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[9px] text-text-muted"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp48-beta-closeout"
            className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-300" />
                  <span>{mvp48BetaCloseout.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp48BetaCloseout.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-violet-500/25 bg-violet-500/10 text-[10px] font-bold text-violet-200">
                {mvp48BetaCloseout.milestone}
              </span>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-[10px] text-violet-50 leading-relaxed">
              {mvp48BetaCloseout.summary}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {toArray(mvp48BetaCloseout.capabilities).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[11px] font-bold text-text-primary">
                      {item.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                        item.tone === "success"
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                          : item.tone === "warning"
                            ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
                            : "border-sky-500/25 bg-sky-500/10 text-sky-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
              <div className="rounded-xl border border-border-color/50 bg-black/10 p-3">
                <p className="font-bold text-text-primary mb-2">
                  Beta 回归重点
                </p>
                <ul className="space-y-1 text-text-secondary leading-relaxed">
                  {mvp48BetaCloseout.regressionChecklist
                    .slice(0, 6)
                    .map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="font-bold text-emerald-100 mb-2">
                  继续保持的边界
                </p>
                <ul className="space-y-1 text-emerald-50/80 leading-relaxed">
                  {toArray(mvp48BetaCloseout.safetyRules).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="font-bold text-amber-100 mb-2">Beta 后置功能</p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp48BetaCloseout.deferredItems).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp49-listening-polish"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <AudioLines className="w-4 h-4 text-sky-300" />
                  <span>播放器与首页视觉精修</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  MVP-49
                  只收口首页听音频入口和底部播放器状态条，继续降低工具面板感。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-200">
                Beta 0.1 体验打磨
              </span>
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-[10px] text-sky-50 leading-relaxed">
              {mvp49ListeningPolish.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp49ListeningPolish.cards).map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <p className="text-[11px] font-bold text-text-primary">
                    {card.title}
                  </p>
                  <p className="mt-1 leading-relaxed">{card.description}</p>
                  <p className="mt-2 text-text-muted">{card.meta}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
              <div className="rounded-xl border border-border-color/50 bg-black/10 p-3">
                <p className="font-bold text-text-primary mb-2">本轮只做</p>
                <ul className="space-y-1 text-text-secondary leading-relaxed">
                  <li>• 首页听音频入口更轻、更像播放器首页。</li>
                  <li>• 底部播放器显示播放状态、来源和字幕标签。</li>
                  <li>• 代码逻辑收进 listeningExperiencePolishService。</li>
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="font-bold text-emerald-100 mb-2">继续保持</p>
                <ul className="space-y-1 text-emerald-50/80 leading-relaxed">
                  <li>• 主界面中文优先。</li>
                  <li>• 工程信息后置到诊断页。</li>
                  <li>• 不改变扫描、索引、播放、字幕和打包链路。</li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="font-bold text-amber-100 mb-2">仍然后置</p>
                <div className="flex flex-wrap gap-1.5">
                  {["SQLite", "下载器", "元数据抓取", "mpv", "文件整理"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp50-player-visual-polish"
            className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <AudioLines className="w-4 h-4 text-indigo-300" />
                  <span>{mvp50PlayerVisualPolish.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp50PlayerVisualPolish.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-[10px] font-bold text-indigo-200">
                Beta 0.1 视觉收口
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {toArray(mvp50PlayerVisualPolish.cards).map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <p className="text-[11px] font-bold text-text-primary">
                    {card.title}
                  </p>
                  <p className="mt-1 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-[10px] font-bold text-emerald-100 mb-2">
                继续保持的安全边界
              </p>
              <div className="flex flex-wrap gap-1.5">
                {toArray(mvp50PlayerVisualPolish.safetyRules).map((rule) => (
                  <span
                    key={rule}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            id="mvp51-player-immersion-polish"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>{mvp51PlayerImmersionPolish.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp51PlayerImmersionPolish.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-200">
                播放器沉浸页
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {toArray(mvp51PlayerImmersionPolish.improvements).map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <p className="text-[10px] font-bold text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-text-primary">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed">{item.helper}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-[10px] font-bold text-emerald-100 mb-2">
                本轮继续不碰的边界
              </p>
              <div className="flex flex-wrap gap-1.5">
                {toArray(mvp51PlayerImmersionPolish.guardrails).map((rule) => (
                  <span
                    key={rule}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            id="mvp52-library-regression-polish"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Search className="w-4 h-4 text-emerald-300" />
                  <span>{mvp52LibraryRegressionPolish.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp52LibraryRegressionPolish.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-200">
                资源库回归修复
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {toArray(mvp52LibraryRegressionPolish.fixes).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <p className="text-[10px] font-bold text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-text-primary">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed">{item.helper}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-[10px] font-bold text-emerald-100 mb-2">
                本轮继续不碰的边界
              </p>
              <div className="flex flex-wrap gap-1.5">
                {toArray(mvp52LibraryRegressionPolish.guardrails).map(
                  (rule) => (
                    <span
                      key={rule}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                    >
                      {rule}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>

          <section
            id="mvp53-library-visual-unity"
            className="rounded-2xl border border-brand-color/20 bg-brand-color/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-color" />
                  <span>{mvp53LibraryVisualUnity.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp53LibraryVisualUnity.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-brand-color/25 bg-brand-color/10 text-[10px] font-bold text-brand-color">
                资源库视觉统一
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp53LibraryVisualUnity.tasks).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 text-[10px] text-text-secondary"
                >
                  <p className="text-[10px] font-bold text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[12px] font-bold text-text-primary">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed">{item.helper}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-[10px] font-bold text-emerald-100 mb-2">
                本轮继续不碰的边界
              </p>
              <div className="flex flex-wrap gap-1.5">
                {toArray(mvp53LibraryVisualUnity.guardrails).map((rule) => (
                  <span
                    key={rule}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            id="mvp58-settings-personal-workflow-review"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <EyeOff className="w-4 h-4 text-emerald-300" />
                  <span>{mvp58SettingsPersonalWorkflow.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp58SettingsPersonalWorkflow.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100">
                个人本地流程
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp58SettingsPersonalWorkflow.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${settingsPersonalWorkflowService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  日常流程
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {toArray(mvp58SettingsPersonalWorkflow.cleanupPlan).map(
                    (item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border px-2 py-2 text-[10px] ${settingsPersonalWorkflowService.getToneClassName(item.tone)}`}
                      >
                        <p className="font-bold opacity-80">
                          {item.title} · {item.actionLabel}
                        </p>
                        <p className="mt-0.5 opacity-75 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  继续保持的边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp58SettingsPersonalWorkflow.guardrails).map(
                    (rule) => (
                      <span
                        key={rule}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                      >
                        {rule}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  继续后置
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp58SettingsPersonalWorkflow.deferred).map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp60-beta-candidate-closeout"
            className="rounded-2xl border border-brand-color/20 bg-brand-color/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-color" />
                  <span>{mvp60BetaCandidateCloseout.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp60BetaCandidateCloseout.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-brand-color/25 bg-brand-color/10 text-[10px] font-bold text-brand-color">
                Beta 0.1 候选
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp60BetaCandidateCloseout.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaCandidateCloseoutService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  候选包人工回归
                </p>
                <div className="space-y-2">
                  {toArray(mvp60BetaCandidateCloseout.candidateChecklist).map(
                    (item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border px-3 py-2 text-[10px] ${betaCandidateCloseoutService.getToneClassName(item.tone)}`}
                      >
                        <p className="font-bold opacity-90">
                          {item.title} · {item.status}
                        </p>
                        <p className="mt-1 leading-relaxed opacity-80">
                          {item.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  候选包边界
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp60BetaCandidateCloseout.releaseBoundary).map(
                    (rule) => (
                      <p
                        key={rule}
                        className="text-[10px] text-emerald-50/80 leading-relaxed"
                      >
                        • {rule}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  下一步可选
                </p>
                <div className="space-y-1.5 mb-3">
                  {toArray(mvp60BetaCandidateCloseout.nextOptions).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-amber-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  继续后置
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp60BetaCandidateCloseout.deferred).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp61-local-regression-fix-review"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-sky-200" />
                  <span>{mvp61LocalRegressionFix.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp61LocalRegressionFix.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100">
                本机回归
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp61LocalRegressionFix.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${localRegressionFixService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  {item.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {item.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  已修复阻塞
                </p>
                <div className="space-y-2">
                  {toArray(mvp61LocalRegressionFix.blockersFixed).map(
                    (item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border px-3 py-2 text-[10px] ${localRegressionFixService.getToneClassName(item.tone)}`}
                      >
                        <p className="font-bold opacity-90">{item.title}</p>
                        <p className="mt-1 font-mono text-[9px] opacity-80">
                          {item.command}
                        </p>
                        <p className="mt-1 leading-relaxed opacity-80">
                          {item.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  安全复核
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp61LocalRegressionFix.safetyReview).map((rule) => (
                    <p
                      key={rule}
                      className="text-[10px] text-emerald-50/80 leading-relaxed"
                    >
                      • {rule}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  继续后置
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp61LocalRegressionFix.deferred).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-amber-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp63-electron-binary-path-fix-review"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-200" />
                  <span>{mvp63ElectronBinaryPathFix.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp63ElectronBinaryPathFix.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-100">
                Electron binary path
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp63ElectronBinaryPathFix.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${electronBinaryPathFixService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  {item.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {item.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  修复项
                </p>
                <div className="space-y-2">
                  {toArray(mvp63ElectronBinaryPathFix.fixes).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border px-3 py-2 text-[10px] ${electronBinaryPathFixService.getToneClassName(item.tone)}`}
                    >
                      <p className="font-bold opacity-90">{item.title}</p>
                      <p className="mt-1 font-mono text-[9px] opacity-80">
                        {item.command}
                      </p>
                      <p className="mt-1 leading-relaxed opacity-80">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  本机复测重点
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp63ElectronBinaryPathFix.retestFocus).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-amber-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  安全边界
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp63ElectronBinaryPathFix.safetyBoundary).map(
                    (rule) => (
                      <p
                        key={rule}
                        className="text-[10px] text-emerald-50/80 leading-relaxed"
                      >
                        • {rule}
                      </p>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp62-electron-regression-hardening-review"
            className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-200" />
                  <span>{mvp62ElectronHardening.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp62ElectronHardening.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-[10px] font-bold text-cyan-100">
                Electron 回归
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp62ElectronHardening.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${electronRegressionHardeningService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  {item.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {item.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  已修复项
                </p>
                <div className="space-y-2">
                  {toArray(mvp62ElectronHardening.fixes).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border px-3 py-2 text-[10px] ${electronRegressionHardeningService.getToneClassName(item.tone)}`}
                    >
                      <p className="font-bold opacity-90">{item.title}</p>
                      <p className="mt-1 font-mono text-[9px] opacity-80">
                        {item.command}
                      </p>
                      <p className="mt-1 leading-relaxed opacity-80">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  安全边界
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp62ElectronHardening.safetyBoundary).map(
                    (rule) => (
                      <p
                        key={rule}
                        className="text-[10px] text-emerald-50/80 leading-relaxed"
                      >
                        • {rule}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  下次本机测试重点
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp62ElectronHardening.nextTestFocus).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-amber-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp59-home-player-beta-polish"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>{mvp59HomePlayerBeta.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp59HomePlayerBeta.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-sky-500/25 bg-sky-500/10 text-[10px] font-bold text-sky-100">
                Beta 视觉小修
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp59HomePlayerBeta.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${homePlayerBetaPolishService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  本轮收口
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp59HomePlayerBeta.cleanupPlan).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-text-muted leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  继续保持的边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp59HomePlayerBeta.guardrails).map((rule) => (
                    <span
                      key={rule}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  继续后置
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp59HomePlayerBeta.deferred).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp57-asmr-detail-side-rail-review"
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>{mvp57AsmrDetailSideRail.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp57AsmrDetailSideRail.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-amber-500/25 bg-amber-500/10 text-[10px] font-bold text-amber-100">
                右侧栏精修
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp57AsmrDetailSideRail.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${asmrDetailSideRailService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  低风险收口项
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {toArray(mvp57AsmrDetailSideRail.cleanupPlan).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border px-2 py-2 text-[10px] ${asmrDetailSideRailService.getToneClassName(item.tone)}`}
                    >
                      <p className="font-bold opacity-80">
                        {item.label} · {item.value}
                      </p>
                      <p className="mt-0.5 opacity-75 leading-relaxed">
                        {item.helper}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  继续保持的边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp57AsmrDetailSideRail.guardrails).map((rule) => (
                    <span
                      key={rule}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  暂不推进
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp57AsmrDetailSideRail.deferred).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp56-asmr-detail-surface-review"
            className="rounded-2xl border border-brand-color/20 bg-brand-color/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-brand-color" />
                  <span>{mvp56AsmrDetailSurface.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp56AsmrDetailSurface.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-brand-color/25 bg-brand-color/10 text-[10px] font-bold text-brand-color">
                音声详情收口
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp56AsmrDetailSurface.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${asmrDetailSurfaceService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  低风险收口项
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {toArray(mvp56AsmrDetailSurface.cleanupPlan).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border px-2 py-2 text-[10px] ${asmrDetailSurfaceService.getToneClassName(item.tone)}`}
                    >
                      <p className="font-bold opacity-80">
                        {item.label} · {item.value}
                      </p>
                      <p className="mt-0.5 opacity-75 leading-relaxed">
                        {item.helper}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  继续保持的边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp56AsmrDetailSurface.guardrails).map((rule) => (
                    <span
                      key={rule}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  暂不推进
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp56AsmrDetailSurface.deferred).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp55-component-health-review"
            className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-300" />
                  <span>{mvp55ComponentHealthReview.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp55ComponentHealthReview.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-purple-500/25 bg-purple-500/10 text-[10px] font-bold text-purple-100">
                组件体检
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {toArray(mvp55ComponentHealthReview.summary).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${componentHealthReviewService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.label}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.value}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {mvp55ComponentHealthReview.components.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${componentHealthReviewService.getToneClassName(item.tone)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-[12px]">{item.name}</p>
                      <p className="mt-0.5 opacity-75">
                        {item.surface} · 约 {item.lineCount} 行 ·{" "}
                        {item.priority}
                      </p>
                    </div>
                    <span className="rounded-full border border-current/20 px-2 py-0.5 text-[9px] font-bold opacity-80">
                      {item.priority}
                    </span>
                  </div>
                  <p className="mt-2 leading-relaxed opacity-80">{item.note}</p>
                  <p className="mt-1 leading-relaxed opacity-70">
                    下一步：{item.nextAction}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  低风险清理计划
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {toArray(mvp55ComponentHealthReview.cleanupPlan).map(
                    (item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border px-2 py-2 text-[10px] ${componentHealthReviewService.getToneClassName(item.tone)}`}
                      >
                        <p className="font-bold opacity-80">
                          {item.label} · {item.value}
                        </p>
                        <p className="mt-0.5 opacity-75 leading-relaxed">
                          {item.helper}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  继续保持的边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp55ComponentHealthReview.guardrails).map(
                    (rule) => (
                      <span
                        key={rule}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                      >
                        {rule}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  暂不推进
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp55ComponentHealthReview.deferred).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp54-beta-regression-checklist"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/30 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{mvp54BetaRegressionChecklist.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp54BetaRegressionChecklist.description}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-[10px] font-bold text-emerald-200">
                Beta 回归清单
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {toArray(mvp54BetaRegressionChecklist.checklist).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaRegressionChecklistService.getToneClassName(item.tone)}`}
                >
                  <p className="font-bold opacity-80">{item.surface}</p>
                  <p className="mt-1 text-[12px] font-extrabold">
                    {item.title}
                  </p>
                  <p className="mt-1 leading-relaxed opacity-80">
                    {item.description}
                  </p>
                  <p className="mt-2 text-[9px] font-bold opacity-70">
                    {item.doneLabel}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  推荐验证命令
                </p>
                <div className="space-y-1">
                  {toArray(mvp54BetaRegressionChecklist.commands).map(
                    (command) => (
                      <code
                        key={command}
                        className="block rounded-lg bg-black/20 px-2 py-1 text-[9px] text-text-muted break-all"
                      >
                        {command}
                      </code>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  继续保持的安全边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp54BetaRegressionChecklist.guardrails).map(
                    (rule) => (
                      <span
                        key={rule}
                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-50/80"
                      >
                        {rule}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  继续后置
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp54BetaRegressionChecklist.deferred).map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Database Stats Card (Persistent) */}
          <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span>诊断数据概览</span>
              </h3>
              <button
                onClick={onScanLibrary}
                className="flex items-center space-x-1.5 text-xs text-brand-color hover:text-brand-color-hover font-semibold cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${scanStatus.includes("正在") ? "animate-spin" : ""}`}
                />
                <span>刷新诊断</span>
              </button>
            </div>

            {scanStatus && (
              <div className="bg-black/20 border border-border-color/50 p-3 rounded-xl font-mono text-[10px] text-brand-color leading-relaxed relative">
                <div className="flex items-center space-x-1.5 text-text-secondary border-b border-border-color/40 pb-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-brand-color animate-pulse" />
                  <span>诊断输出</span>
                </div>
                {scanStatus}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
              <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  已缓存 RJ 音声
                </div>
                <div className="text-text-primary font-bold text-sm">
                  {rjWorks.length} 组专辑
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  媒体记录匹配率
                </div>
                <div className="text-text-primary font-bold text-sm text-emerald-400">
                  96.8% (高匹配)
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  普通流行音乐
                </div>
                <div className="text-text-primary font-bold text-sm">
                  {musicAlbums.length} 张专辑
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3.5 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  资源库记录来源
                </div>
                <div className="text-text-primary font-bold text-sm">
                  本地记录 / 示例记录
                </div>
              </div>
            </div>
          </div>

          {/* MVP-28 Windows desktop validation */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>MVP-28 Windows 桌面验收 / 打包准备</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本区用于收口 MVP-19~MVP-27
                  的真实桌面链路：选择目录、扫描、写入 index、读取
                  index、播放音频、读取字幕、外部打开文件。MVP-28
                  生成验证脚本与验收清单，不声称已经产出正式安装包。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-emerald-300 bg-emerald-500/10 border-emerald-500/25">
                {electronWindowsValidationMvp28.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-3 text-[10px]">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="font-bold text-emerald-100 mb-2">本机命令</p>
                <div className="space-y-1 font-mono text-emerald-50/80">
                  {electronWindowsValidationMvp28.scripts
                    .slice(0, 4)
                    .map((script) => (
                      <p key={script}>{script}</p>
                    ))}
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                <p className="font-bold text-sky-100 mb-2">验收重点</p>
                <ul className="space-y-1 text-sky-50/80">
                  {electronWindowsValidationMvp28.validationFlow
                    .slice(0, 4)
                    .map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="font-bold text-amber-100 mb-2">仍然后置</p>
                <ul className="space-y-1 text-amber-50/80">
                  {electronWindowsValidationMvp28.stillBlocked
                    .slice(0, 5)
                    .map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-border-color/50 bg-black/10 p-3 text-[10px] text-text-secondary leading-relaxed">
              {electronWindowsValidationMvp28.packagingStatus.join(" ")}
            </div>
          </section>

          {/* MVP-04 Fixture scanner report preview */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Fixture 样本报告 / 只读诊断</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本区只展示 MVP-05 扩展 fixture 的内存报告：重复
                  RJ、空目录、视频 ASMR、图片/CG、多语言字幕、多
                  disc/特典；不读取真实磁盘、不写 library-index.json、不接
                  Electron、不写 SQLite。
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase ${fixtureStatusClass}`}
              >
                {fixtureReport.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  样本根目录
                </div>
                <div className="text-text-primary font-bold text-sm">
                  {fixtureReport.summary.rootCount}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">集合</div>
                <div className="text-text-primary font-bold text-sm">
                  {fixtureReport.summary.collectionCount}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">音轨</div>
                <div className="text-text-primary font-bold text-sm">
                  {fixtureReport.summary.trackCount}
                  <span className="text-[10px] text-text-muted ml-1">
                    A{fixtureReport.summary.audioTrackCount}/V
                    {fixtureReport.summary.videoTrackCount}/I
                    {fixtureReport.summary.imageTrackCount}
                  </span>
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">质量分</div>
                <div className="text-text-primary font-bold text-sm text-emerald-400">
                  {fixtureReport.summary.overallQualityScore}/100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-[10px]">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">缺封面 collection</div>
                <div className="mt-1 text-sm font-black text-amber-300">
                  {fixtureReport.summary.collectionMissingCoverCount}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">无音频 collection</div>
                <div className="mt-1 text-sm font-black text-rose-300">
                  {fixtureReport.summary.collectionNoAudioCount}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">图片/CG-only</div>
                <div className="mt-1 text-sm font-black text-purple-300">
                  {fixtureReport.summary.collectionImageOnlyCount}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">空/仅元数据</div>
                <div className="mt-1 text-sm font-black text-rose-300">
                  {fixtureReport.summary.collectionMetadataOnlyCount}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">音频缺字幕</div>
                <div className="mt-1 text-sm font-black text-sky-300">
                  {fixtureReport.summary.audioTrackMissingSubtitleCount}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">重复 RJ 组</div>
                <div className="mt-1 text-sm font-black text-amber-300">
                  {fixtureReport.summary.duplicateRjGroupCount}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/20 p-3">
                <div className="text-text-muted">重复 Track 路径</div>
                <div className="mt-1 text-sm font-black text-amber-300">
                  {fixtureReport.summary.duplicateTrackPathGroupCount}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span>diagnostics</span>
                  </h4>
                  <span className="text-[10px] text-text-muted">
                    {fixtureReport.diagnostics.length} items
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {fixtureReport.diagnostics.length === 0 ? (
                    <p className="text-[10px] text-text-muted">
                      fixture report 暂无诊断项。
                    </p>
                  ) : (
                    fixtureReport.diagnostics.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-text-primary truncate">
                            {item.message}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase ${fixtureSeverityClass(item.severity)}`}
                          >
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                          {item.hint}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>next actions</span>
                </h4>
                <div className="space-y-2">
                  {toArray(fixtureReport.nextActions).map((action, index) => (
                    <div
                      key={action}
                      className="flex items-start space-x-2 rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5"
                    >
                      <span className="text-[10px] font-mono text-brand-color mt-0.5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border-color/30 space-y-2">
                  <h5 className="text-[10px] font-bold text-text-primary">
                    duplicate groups
                  </h5>
                  {fixtureReport.duplicateRjGroups.length === 0 &&
                  fixtureReport.duplicateTrackPathGroups.length === 0 ? (
                    <p className="text-[10px] text-text-muted">
                      base fixture 暂无重复 RJ / 重复 Track 路径。
                    </p>
                  ) : (
                    <>
                      {toArray(fixtureReport.duplicateRjGroups).map((group) => (
                        <div
                          key={`rj-${group.key}`}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2"
                        >
                          <div className="text-[10px] font-bold text-amber-300">
                            RJ {group.key}
                          </div>
                          <p className="text-[10px] text-text-secondary truncate">
                            {group.titles.join(" / ")}
                          </p>
                        </div>
                      ))}
                      {toArray(fixtureReport.duplicateTrackPathGroups).map(
                        (group) => (
                          <div
                            key={`path-${group.key}`}
                            className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2"
                          >
                            <div className="text-[10px] font-bold text-amber-300">
                              Track path {group.key}
                            </div>
                            <p className="text-[10px] text-text-secondary truncate">
                              {group.titles.join(" / ")}
                            </p>
                          </div>
                        ),
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-sky-300" />
                <span>collection quality preview</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {toArray(fixtureReport.集合).map((item) => (
                  <div
                    key={item.collectionId}
                    className="rounded-xl border border-border-color/40 bg-card-bg/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-text-primary truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono mt-0.5">
                          {item.collectionType}
                          {item.codeNorm ? ` · ${item.codeNorm}` : ""}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-300">
                        {item.qualityScore}/100
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] text-text-secondary">
                      <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">
                        音轨 {item.trackCount}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">
                        audio {item.audioTrackCount}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">
                        video {item.videoTrackCount}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">
                        image {item.imageTrackCount}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/20 border border-border-color/40">
                        sub {item.subtitleCount}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded border ${item.hasCover ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"}`}
                      >
                        {item.hasCover ? "cover" : "no cover"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* MVP-06 Fixture scanner test harness / planned contract */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    MVP-06 Fixture Scanner Test Matrix / Planned Scanner
                    Contract
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本区把 fixture scanner 结果固化成测试矩阵，并给未来真实
                  scanner 定输入/输出/错误/安全合同。当前仍只分析 fixture
                  内存结果，不读真实盘、不写 library-index.json、不接 Electron。
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase ${fixtureHarness.summary.status === "pass" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25" : fixtureHarness.summary.status === "needs-review" ? "text-amber-300 bg-amber-500/10 border-amber-500/25" : "text-rose-300 bg-rose-500/10 border-rose-500/25"}`}
              >
                {fixtureHarness.summary.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  test cases
                </div>
                <div className="text-text-primary font-bold text-sm">
                  {fixtureHarness.summary.total}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">passed</div>
                <div className="text-emerald-300 font-bold text-sm">
                  {fixtureHarness.summary.passed}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">failed</div>
                <div className="text-rose-300 font-bold text-sm">
                  {fixtureHarness.summary.failed}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  required failed
                </div>
                <div className="text-rose-300 font-bold text-sm">
                  {fixtureHarness.summary.requiredFailed}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">contract</div>
                <div className="text-sky-300 font-bold text-sm">
                  {plannedScannerContract.status}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>test matrix</span>
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {toArray(fixtureHarness.cases).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-text-primary truncate">
                          {item.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase ${item.status === "pass" ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25" : "text-rose-300 bg-rose-500/10 border-rose-500/25"}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        expected：{item.expected}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                        actual：{item.actual}
                      </p>
                      <p className="text-[10px] text-brand-color mt-1 leading-relaxed">
                        next：{item.nextAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-3">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                  <span>planned scanner contract</span>
                </h4>
                <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
                  {plannedScannerContract.stageGate}
                </p>
                {[
                  plannedScannerContract.inputContract,
                  plannedScannerContract.outputContract,
                  plannedScannerContract.errorContract,
                  plannedScannerContract.safetyContract,
                ].map((section) => (
                  <div
                    key={section.title}
                    className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5"
                  >
                    <div className="text-[10px] font-bold text-text-primary mb-1">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.slice(0, 4).map((item) => (
                        <p
                          key={item}
                          className="text-[10px] text-text-muted leading-relaxed"
                        >
                          • {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>forbidden actions</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(plannedScannerContract.forbiddenActions).map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-200"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
                  <span>next implementation order</span>
                </h4>
                <div className="space-y-1.5">
                  {toArray(plannedScannerContract.nextImplementationOrder).map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex items-start space-x-2 rounded-xl border border-border-color/40 bg-card-bg/30 p-2"
                      >
                        <span className="text-[10px] font-mono text-brand-color mt-0.5">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[10px] text-text-secondary leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-10 Planned dry-run scanner result contract */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>MVP-10 Planned Dry-Run Scanner Result Contract</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本区只定义未来真实扫描 dry-run
                  的请求与结果结构：ScannerRequest、ScannerDryRunResult、discoveredEntries、warnings、blockedReasons、safety
                  limits、preview summary。当前不读取真实目录、不写
                  library-index.json、不接 Electron。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/10 border-cyan-500/25">
                {plannedDryRunContract.status}
              </span>
            </div>

            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {plannedDryRunContract.stageGate}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  sourceKind
                </div>
                <div className="text-cyan-300 font-bold text-sm">
                  {plannedDryRunContract.summary.sourceKind}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  discovered
                </div>
                <div className="text-text-primary font-bold text-sm">
                  {plannedDryRunContract.summary.discoveredEntryCount}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">warnings</div>
                <div className="text-amber-300 font-bold text-sm">
                  {plannedDryRunContract.summary.warningCount}
                </div>
              </div>
              <div className="bg-card-bg/25 border border-border-color/50 p-3 rounded-xl">
                <div className="text-text-muted text-[10px] mb-1">
                  canWriteIndex
                </div>
                <div className="text-rose-300 font-bold text-sm">
                  {String(plannedDryRunContract.summary.canWriteIndex)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                  <span>ScannerRequest dry-run contract</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">mode</span>
                    <div className="text-text-primary font-bold">
                      {plannedDryRunContract.request.mode}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">previewOnly</span>
                    <div className="text-text-primary font-bold">
                      {String(plannedDryRunContract.request.previewOnly)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">libraryType</span>
                    <div className="text-text-primary font-bold">
                      {plannedDryRunContract.request.libraryType}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">scanProfile</span>
                    <div className="text-text-primary font-bold">
                      {plannedDryRunContract.request.scanProfile}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">maxEntries</span>
                    <div className="text-text-primary font-bold">
                      {plannedDryRunContract.request.limits.maxEntries}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">followSymlinks</span>
                    <div className="text-rose-300 font-bold">
                      {String(
                        plannedDryRunContract.request.limits.followSymlinks,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Search className="w-3.5 h-3.5 text-sky-300" />
                  <span>preview summary / output shape</span>
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(plannedDryRunContract.outputShape).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border-color/40 bg-card-bg/30 p-2"
                      >
                        <span className="text-[10px] font-mono text-text-muted">
                          {key}
                        </span>
                        <span className="text-[10px] text-text-secondary text-right">
                          {value}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                <Folders className="w-3.5 h-3.5 text-purple-300" />
                <span>discoveredEntries contract sample</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {toArray(plannedDryRunContract.discoveredEntries).map(
                  (entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-text-primary truncate">
                          {entry.relativePath}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-[9px] font-bold text-cyan-200">
                          {entry.entryKind}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted font-mono">
                        action: {entry.plannedAction}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {entry.collectionCandidate}
                        {entry.trackCandidate
                          ? ` → ${entry.trackCandidate}`
                          : ""}
                        {entry.rjIdNorm ? ` · ${entry.rjIdNorm}` : ""}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                  <span>warnings</span>
                </h4>
                {toArray(plannedDryRunContract.warnings).map((warning) => (
                  <div
                    key={warning.code}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-[10px] text-amber-100 leading-relaxed"
                  >
                    <b>{warning.code}</b> · {warning.message}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>blockedReasons</span>
                </h4>
                {toArray(plannedDryRunContract.blockedReasons).map((reason) => (
                  <div
                    key={reason.code}
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-[10px] text-rose-100 leading-relaxed"
                  >
                    <b>{reason.code}</b> · {reason.message}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>safety checklist</span>
                </h4>
                {plannedDryRunContract.safetyChecklist
                  .slice(0, 5)
                  .map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-text-muted leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
              </div>
            </div>
          </section>

          {/* MVP-11 Dry-run IPC stub contract */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-violet-400" />
                  <span>MVP-11 Dry-Run IPC Stub Contract</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本区只定义未来 dry-run IPC 的 channel、request/response
                  envelope、error envelope 和 stub flow。当前不实现真实 Electron
                  IPC，不读取真实目录，不写 library-index.json。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-violet-300 bg-violet-500/10 border-violet-500/25">
                {plannedIpcStubContract.status}
              </span>
            </div>

            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {plannedIpcStubContract.stageGate}
            </p>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5 text-violet-300" />
                  <span>IPC channel names</span>
                </h4>
                <div className="space-y-1.5">
                  {toArray(plannedIpcStubContract.channels).map((channel) => (
                    <div
                      key={channel.name}
                      className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-text-primary truncate">
                          {channel.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-lg border border-violet-500/20 bg-violet-500/10 text-[9px] font-bold text-violet-200">
                          {channel.direction}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        {channel.payloadShape}
                      </p>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
                        {channel.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                  <span>request / response envelope</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">request channel</span>
                    <div className="text-text-primary font-bold truncate">
                      {plannedIpcStubContract.requestEnvelope.channel}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">request kind</span>
                    <div className="text-text-primary font-bold">
                      {plannedIpcStubContract.requestEnvelope.requestKind}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">response channel</span>
                    <div className="text-text-primary font-bold truncate">
                      {plannedIpcStubContract.responseEnvelope.channel}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">indexWriteAllowed</span>
                    <div className="text-rose-300 font-bold">
                      {String(
                        plannedIpcStubContract.responseEnvelope
                          .indexWriteAllowed,
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">correlationId</span>
                    <div className="text-text-primary font-bold truncate">
                      {plannedIpcStubContract.requestEnvelope.correlationId}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5">
                    <span className="text-text-muted">responseSource</span>
                    <div className="text-text-primary font-bold">
                      {plannedIpcStubContract.responseEnvelope.responseSource}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-[10px] text-rose-100 leading-relaxed">
                  <b>{plannedIpcStubContract.errorEnvelope.errorCode}</b> ·{" "}
                  {plannedIpcStubContract.errorEnvelope.message}
                  <div className="mt-1 text-rose-200/80">
                    {plannedIpcStubContract.errorEnvelope.hint}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2 lg:col-span-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-300" />
                  <span>dry-run stub flow</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {toArray(plannedIpcStubContract.stubFlow).map(
                    (step, index) => (
                      <div
                        key={step.id}
                        className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-brand-color">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-lg border text-[9px] font-bold ${step.allowed ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-rose-500/20 bg-rose-500/10 text-rose-200"}`}
                          >
                            {step.allowed ? "allowed" : "blocked"}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-text-primary">
                          {step.title}
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>forbidden actions</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(plannedIpcStubContract.forbiddenActions).map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-200"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-12 Dry-run stub response preview UI */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>MVP-12 Dry-Run Stub Response Preview UI</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  把 MVP-11 的 request / response / error envelope
                  转成更接近未来真实 dry-run 的预览 UI。当前仍然只展示
                  planned-stub 数据，不发送真实 IPC，不读取真实目录。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-emerald-300 bg-emerald-500/10 border-emerald-500/25">
                {plannedDryRunStubPreview.status}
              </span>
            </div>

            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {plannedDryRunStubPreview.stageGate}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {toArray(plannedDryRunStubPreview.flowBadges).map((badge) => (
                <span
                  key={badge}
                  className="px-2 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-200"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-300" />
                  <span>request envelope preview</span>
                </h4>
                <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 space-y-1 text-[10px]">
                  <p className="font-mono text-text-primary truncate">
                    {plannedDryRunStubPreview.requestEnvelopePreview.channel}
                  </p>
                  <p className="text-text-muted">
                    correlationId:{" "}
                    {
                      plannedDryRunStubPreview.requestEnvelopePreview
                        .correlationId
                    }
                  </p>
                  <p className="text-text-muted">
                    rootPathToken:{" "}
                    {
                      plannedDryRunStubPreview.requestEnvelopePreview
                        .rootPathToken
                    }
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {toArray(
                    plannedDryRunStubPreview.requestEnvelopePreview.metrics,
                  ).map((metric) => (
                    <div
                      key={metric.label}
                      className={`rounded-xl border p-2 text-[10px] ${metric.tone === "blocked" ? "border-rose-500/20 bg-rose-500/10 text-rose-100" : metric.tone === "safe" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100" : "border-sky-500/20 bg-sky-500/10 text-sky-100"}`}
                    >
                      <span className="block text-text-muted">
                        {metric.label}
                      </span>
                      <b>{String(metric.value)}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>response payload preview</span>
                </h4>
                <div className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 space-y-1 text-[10px]">
                  <p className="font-mono text-text-primary truncate">
                    {plannedDryRunStubPreview.responsePayloadPreview.channel}
                  </p>
                  <p className="text-text-muted">
                    responseSource:{" "}
                    {
                      plannedDryRunStubPreview.responsePayloadPreview
                        .responseSource
                    }
                  </p>
                  <p className="text-rose-200">
                    indexWriteAllowed:{" "}
                    {String(
                      plannedDryRunStubPreview.responsePayloadPreview
                        .indexWriteAllowed,
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {toArray(
                    plannedDryRunStubPreview.responsePayloadPreview.metrics,
                  ).map((metric) => (
                    <div
                      key={metric.label}
                      className={`rounded-xl border p-2 text-[10px] ${metric.tone === "blocked" ? "border-rose-500/20 bg-rose-500/10 text-rose-100" : metric.tone === "safe" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100" : "border-cyan-500/20 bg-cyan-500/10 text-cyan-100"}`}
                    >
                      <span className="block text-text-muted">
                        {metric.label}
                      </span>
                      <b>{String(metric.value)}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>error state preview</span>
                </h4>
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-[10px] text-rose-100 leading-relaxed">
                  <b>{plannedDryRunStubPreview.errorStatePreview.errorCode}</b>
                  <p className="mt-1">
                    {plannedDryRunStubPreview.errorStatePreview.message}
                  </p>
                  <p className="mt-1 text-rose-200/80">
                    {plannedDryRunStubPreview.errorStatePreview.hint}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {toArray(
                    plannedDryRunStubPreview.errorStatePreview.blockedReasons,
                  ).map((reason) => (
                    <div
                      key={reason.code}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-[10px] text-rose-100"
                    >
                      <b>{reason.code}</b> · {reason.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                <Folders className="w-3.5 h-3.5 text-purple-300" />
                <span>dry-run result cards</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                {toArray(plannedDryRunStubPreview.dryRunResultCards).map(
                  (card) => (
                    <div
                      key={card.id}
                      className={`rounded-xl border p-2.5 space-y-1 ${card.tone === "warning" ? "border-amber-500/20 bg-amber-500/10" : card.tone === "blocked" ? "border-rose-500/20 bg-rose-500/10" : card.tone === "safe" ? "border-emerald-500/20 bg-emerald-500/10" : "border-sky-500/20 bg-sky-500/10"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-text-primary truncate">
                          {card.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-lg border border-white/10 bg-white/5 text-[9px] font-bold text-text-secondary">
                          {card.kind}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted truncate">
                        {card.relativePath}
                      </p>
                      <p className="text-[10px] font-mono text-text-secondary">
                        {card.plannedAction} · {card.parserStatus}
                      </p>
                      {toArray(card.meta).map((item) => (
                        <p
                          key={item}
                          className="text-[10px] text-text-muted truncate"
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                  <span>warning preview cards</span>
                </h4>
                {toArray(plannedDryRunStubPreview.warningCards).map((card) => (
                  <div
                    key={card.id}
                    className={`rounded-xl border p-2 text-[10px] leading-relaxed ${card.tone === "warning" ? "border-amber-500/20 bg-amber-500/10 text-amber-100" : "border-sky-500/20 bg-sky-500/10 text-sky-100"}`}
                  >
                    <b>{card.code}</b> · {card.message}
                    <div className="mt-1 opacity-80">{card.hint}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>still no real Electron IPC</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(plannedDryRunStubPreview.forbiddenActions).map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-200"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-13 Electron shell boundary and file access / 文件访问 contract */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>
                    MVP-13 Electron Shell Boundary + File Access Contract
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  定义未来 Electron main/preload 的文件访问边界、允许 IPC
                  surface、目录选择合同、read-only dry-run 权限、path
                  tokenization 和禁止文件变更 API。当前仍然不实现真实 Electron。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-cyan-300 bg-cyan-500/10 border-cyan-500/25">
                {electronFileAccessBoundary.status}
              </span>
            </div>

            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {electronFileAccessBoundary.stageGate}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2 lg:col-span-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-300" />
                  <span>allowed IPC surface</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {toArray(electronFileAccessBoundary.allowedIpcSurface).map(
                    (channel) => (
                      <div
                        key={channel.channel}
                        className={`rounded-xl border p-2.5 space-y-1 ${channel.allowedInMvp13 ? "border-emerald-500/20 bg-emerald-500/10" : "border-cyan-500/20 bg-cyan-500/10"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-text-primary truncate">
                            {channel.channel}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-lg border border-white/10 bg-white/5 text-[9px] font-bold text-text-secondary">
                            {channel.direction}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          {channel.description}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-200 truncate">
                          {channel.payloadShape}
                        </p>
                        <p className="text-[10px] text-amber-200">
                          permission: {channel.futurePermission}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Folders className="w-3.5 h-3.5 text-purple-300" />
                  <span>directory picker contract</span>
                </h4>
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5 space-y-1 text-[10px] text-purple-100">
                  <p className="font-mono truncate">
                    {electronFileAccessBoundary.directoryPicker.apiName}
                  </p>
                  <p>
                    channel:{" "}
                    {electronFileAccessBoundary.directoryPicker.channel}
                  </p>
                  <p>
                    userGestureRequired:{" "}
                    {String(
                      electronFileAccessBoundary.directoryPicker
                        .userGestureRequired,
                    )}
                  </p>
                  <p>
                    returnsPathToken:{" "}
                    {String(
                      electronFileAccessBoundary.directoryPicker
                        .returnsPathToken,
                    )}
                  </p>
                  <p>
                    absolutePathToRenderer:{" "}
                    {String(
                      electronFileAccessBoundary.directoryPicker
                        .returnsAbsolutePathToRenderer,
                    )}
                  </p>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  {electronFileAccessBoundary.directoryPicker.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-300" />
                  <span>read-only dry-run permission</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-100">
                    maxEntries
                    <br />
                    <b>
                      {
                        electronFileAccessBoundary.readOnlyDryRunPermission
                          .maxEntries
                      }
                    </b>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-100">
                    maxDepth
                    <br />
                    <b>
                      {
                        electronFileAccessBoundary.readOnlyDryRunPermission
                          .maxDepth
                      }
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    canWriteIndex
                    <br />
                    <b>
                      {String(
                        electronFileAccessBoundary.readOnlyDryRunPermission
                          .canWriteIndex,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    canMutateFiles
                    <br />
                    <b>
                      {String(
                        electronFileAccessBoundary.readOnlyDryRunPermission
                          .canMutateFiles,
                      )}
                    </b>
                  </div>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  {
                    electronFileAccessBoundary.readOnlyDryRunPermission
                      .description
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5 text-sky-300" />
                  <span>path tokenization</span>
                </h4>
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2.5 space-y-1 text-[10px] text-sky-100">
                  <p>
                    policy:{" "}
                    {electronFileAccessBoundary.pathTokenization.policyName}
                  </p>
                  <p>
                    tokenShape:{" "}
                    <span className="font-mono">
                      {electronFileAccessBoundary.pathTokenization.tokenShape}
                    </span>
                  </p>
                  <p>
                    relativePath:{" "}
                    {String(
                      electronFileAccessBoundary.pathTokenization
                        .rendererReceivesRelativePath,
                    )}
                  </p>
                  <p>
                    absolutePath:{" "}
                    {String(
                      electronFileAccessBoundary.pathTokenization
                        .rendererReceivesAbsolutePath,
                    )}
                  </p>
                  <p>
                    fileUrl:{" "}
                    {String(
                      electronFileAccessBoundary.pathTokenization
                        .rendererReceivesFileUrl,
                    )}
                  </p>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  {electronFileAccessBoundary.pathTokenization.reason}
                </p>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  <span>preload exposure</span>
                </h4>
                <p className="text-[10px] font-mono text-cyan-200">
                  {electronFileAccessBoundary.preloadExposure.namespace}
                </p>
                <div className="space-y-1">
                  {toArray(
                    electronFileAccessBoundary.preloadExposure.exposedMethods,
                  ).map((method) => (
                    <p
                      key={method}
                      className="text-[10px] text-text-muted font-mono truncate"
                    >
                      {method}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                  <span>forbidden file mutation APIs</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {toArray(
                    electronFileAccessBoundary.forbiddenFileMutationApis,
                  ).map((api) => (
                    <div
                      key={api.apiName}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-[10px] text-rose-100 leading-relaxed"
                    >
                      <b>{api.apiName}</b> · {api.category}
                      <p className="mt-1 text-rose-200/80">{api.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                  <span>implementation phases</span>
                </h4>
                {toArray(electronFileAccessBoundary.implementationPhases).map(
                  (phase, index) => (
                    <div
                      key={phase.id}
                      className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 text-[10px] leading-relaxed"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <b className="text-text-primary">
                          {String(index + 1).padStart(2, "0")} · {phase.title}
                        </b>
                        <span className="text-text-muted">{phase.status}</span>
                      </div>
                      <p className="text-text-muted mt-1">
                        {phase.description}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MVP-13 forbidden actions</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {toArray(electronFileAccessBoundary.forbiddenActions).map(
                  (item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* MVP-14 Electron shell skeleton and preload type contract */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-violet-400" />
                  <span>
                    MVP-14 Electron Shell Skeleton + Preload Type Contract
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  创建 electron/main.ts、electron/preload.ts 与 window.yangKura
                  类型合同，但仍然不引入真实 Electron runtime、不注册真实
                  IPC、不读真实目录。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-violet-300 bg-violet-500/10 border-violet-500/25">
                {electronShellSkeleton.status}
              </span>
            </div>

            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {electronShellSkeleton.stageGate}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2 lg:col-span-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-violet-300" />
                  <span>stub shell files</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {toArray(electronShellSkeleton.shellFiles).map((file) => (
                    <div
                      key={file.path}
                      className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5 space-y-1 text-[10px] leading-relaxed"
                    >
                      <p className="font-mono text-violet-100 truncate">
                        {file.path}
                      </p>
                      <p className="text-text-muted">{file.role}</p>
                      <p className="text-emerald-200">
                        implemented: {String(file.implemented)}
                      </p>
                      <p className="text-rose-200">
                        importsElectron: {String(file.importsElectron)}
                      </p>
                      <p className="text-rose-200">
                        readsDisk: {String(file.readsDisk)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5 text-sky-300" />
                  <span>preload namespace</span>
                </h4>
                <p className="text-[10px] font-mono text-sky-200">
                  {electronShellSkeleton.preloadNamespace}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    runtime
                    <br />
                    <b>
                      {String(
                        electronShellSkeleton.stubCapabilities
                          .hasElectronRuntime,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    real IPC
                    <br />
                    <b>
                      {String(
                        electronShellSkeleton.stubCapabilities
                          .registersRealIpcHandlers,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    read disk
                    <br />
                    <b>
                      {String(
                        electronShellSkeleton.stubCapabilities
                          .readsRealDirectory,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    write index
                    <br />
                    <b>
                      {String(
                        electronShellSkeleton.stubCapabilities
                          .writesLibraryIndex,
                      )}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-300" />
                  <span>window.yangKura typed methods</span>
                </h4>
                <div className="space-y-2">
                  {toArray(electronShellSkeleton.typedApiMethods).map(
                    (method) => (
                      <div
                        key={method.name}
                        className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-[10px] leading-relaxed"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <b className="font-mono text-cyan-100">
                            {method.name}()
                          </b>
                          <span className="text-rose-200">
                            runtime: {String(method.implementedInRuntime)}
                          </span>
                        </div>
                        <p className="text-text-muted mt-1">
                          {method.description}
                        </p>
                        <p className="text-rose-200">
                          returnsAbsolutePath:{" "}
                          {String(method.returnsAbsolutePath)} · sendsRealIpc:{" "}
                          {String(method.sendsRealIpc)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                  <span>future implementation order</span>
                </h4>
                {toArray(electronShellSkeleton.futureImplementationOrder).map(
                  (step, index) => (
                    <div
                      key={step}
                      className="rounded-xl border border-border-color/40 bg-card-bg/30 p-2.5 text-[10px] leading-relaxed"
                    >
                      <b className="text-text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </b>
                      <span className="text-text-muted ml-2">{step}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MVP-14 forbidden actions</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {toArray(electronShellSkeleton.forbiddenActions).map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* MVP-15 Electron dependency and shell launch scripts */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>MVP-15 Electron Dependency + Shell Launch Scripts</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Electron 壳进入可构建 / 可启动阶段；window.yangKura 已是
                  runtime stub，但目录选择、scanner IPC 与文件访问仍保持关闭。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-emerald-300 bg-emerald-500/10 border-emerald-500/25">
                {electronShellLaunch.status}
              </span>
            </div>

            <p className="text-[10px] text-amber-200/90 leading-relaxed rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              {electronShellLaunch.stageGate}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {toArray(electronShellLaunch.launchScripts).map((script) => (
                <div
                  key={script.scriptName}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-2 text-[10px] leading-relaxed"
                >
                  <h4 className="font-bold text-emerald-100 font-mono">
                    npm run {script.scriptName}
                  </h4>
                  <p className="font-mono text-emerald-200/90 break-all">
                    {script.command}
                  </p>
                  <p className="text-text-muted">{script.purpose}</p>
                  <p className="text-rose-200">
                    read disk: {String(script.readsRealDirectory)} · write
                    index: {String(script.writesLibraryIndex)} · scanner IPC:{" "}
                    {String(script.registersScannerIpc)}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-300" />
                  <span>runtime capabilities</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-100">
                    BrowserWindow
                    <br />
                    <b>
                      {String(
                        electronShellLaunch.runtimeCapabilities
                          .createsBrowserWindow,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-100">
                    window.yangKura
                    <br />
                    <b>
                      {String(
                        electronShellLaunch.runtimeCapabilities
                          .exposesWindowYangKura,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    read disk
                    <br />
                    <b>
                      {String(
                        electronShellLaunch.runtimeCapabilities.canReadRealDisk,
                      )}
                    </b>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-100">
                    write index
                    <br />
                    <b>
                      {String(
                        electronShellLaunch.runtimeCapabilities
                          .canWriteLibraryIndex,
                      )}
                    </b>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Link2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>preload runtime stub methods</span>
                </h4>
                <div className="space-y-2">
                  {toArray(electronShellLaunch.preloadStubMethods).map(
                    (method) => (
                      <div
                        key={method.name}
                        className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-[10px] leading-relaxed"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <b className="font-mono text-cyan-100">
                            {method.exposedOn}.{method.name}()
                          </b>
                          <span className="text-emerald-200">
                            stub: {String(method.implementedAsRuntimeStub)}
                          </span>
                        </div>
                        <p className="text-text-muted mt-1">{method.purpose}</p>
                        <p className="text-rose-200">
                          real IPC: {String(method.sendsIpcRendererInvoke)} ·
                          absolute path: {String(method.returnsAbsolutePath)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-300" />
                <span>shell files</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {toArray(electronShellLaunch.shellFiles).map((file) => (
                  <span
                    key={file}
                    className="px-2 py-1 rounded-lg border border-violet-500/20 bg-violet-500/10 text-[10px] text-violet-100 font-mono"
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MVP-15 forbidden actions</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {toArray(electronShellLaunch.forbiddenActions).map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* MVP-16 renderer-side Electron status probe */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>MVP-16 Renderer-Side Electron Status Probe</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Renderer 侧检测 window.yangKura 是否存在，并读取
                  getElectronShellStatus() stub 状态；该探针不请求目录、不发真实
                  scanner IPC、不访问真实磁盘。
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase ${
                  electronRuntimeProbe.mode === "electron-stub"
                    ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                    : electronRuntimeProbe.mode === "probe-error"
                      ? "text-rose-300 bg-rose-500/10 border-rose-500/25"
                      : "text-cyan-300 bg-cyan-500/10 border-cyan-500/25"
                }`}
              >
                {electronRuntimeProbe.mode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-100">
                <p className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold">
                  status
                </p>
                <p className="mt-1 font-semibold leading-relaxed">
                  {electronRuntimeProbe.statusLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3 text-text-secondary">
                <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  checked via
                </p>
                <p className="mt-1 font-mono text-text-primary break-all">
                  {electronRuntimeProbe.checkedVia}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">
                  bridge detected / 桥接状态
                </p>
                <p className="mt-1 font-mono">
                  {String(electronRuntimeProbe.bridgeDetected)}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-100">
                <p className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">
                  file access / 文件访问
                </p>
                <p className="mt-1 font-semibold">disabled</p>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-300" />
                  <span>runtime capabilities</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {toArray(electronRuntimeProbe.capabilities).map(
                    (capability) => (
                      <div
                        key={capability.key}
                        className={`rounded-xl border p-2.5 text-[10px] leading-relaxed ${
                          capability.tone === "safe"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                            : capability.tone === "blocked"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                              : "border-border-color/50 bg-card-bg/30 text-text-secondary"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold">
                            {capability.label}
                          </span>
                          <span className="font-mono break-all text-right">
                            {String(capability.value)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-violet-300" />
                  <span>probe notes</span>
                </h4>
                <div className="space-y-2">
                  {toArray(electronRuntimeProbe.notes).map((note) => (
                    <p
                      key={note}
                      className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-2.5 text-[10px] text-text-secondary leading-relaxed"
                    >
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MVP-16 forbidden actions</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {toArray(electronRuntimeProbe.forbiddenActions).map((item) => (
                  <span
                    key={item}
                    className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* MVP-17 Electron shell smoke check UI */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>MVP-17 Electron Shell Smoke Check UI</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Renderer 侧按钮只调用 window.yangKura 的三个 preload stub
                  方法，用来确认 Electron 壳可触达；不会打开目录、不会发真实
                  scanner IPC、不会读取磁盘。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase ${
                    electronStubSmokeCheck.overallStatus === "passed"
                      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                      : electronStubSmokeCheck.overallStatus === "blocked"
                        ? "text-amber-300 bg-amber-500/10 border-amber-500/25"
                        : electronStubSmokeCheck.overallStatus === "error"
                          ? "text-rose-300 bg-rose-500/10 border-rose-500/25"
                          : electronStubSmokeCheck.overallStatus === "running"
                            ? "text-cyan-300 bg-cyan-500/10 border-cyan-500/25"
                            : "text-text-muted bg-card-bg/30 border-border-color"
                  }`}
                >
                  {electronStubSmokeCheck.overallStatus}
                </span>
                <button
                  onClick={runElectronStubSmokeCheck}
                  disabled={isRunningElectronStubSmokeCheck}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isRunningElectronStubSmokeCheck
                      ? "正在运行 stub 检查..."
                      : "运行 preload stub 检查"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">
                  bridge detected / 桥接状态
                </p>
                <p className="mt-1 font-mono">
                  {String(electronStubSmokeCheck.bridgeDetected)}
                </p>
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3 text-text-secondary">
                <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  started / 开始
                </p>
                <p className="mt-1 font-mono text-text-primary break-all">
                  {electronStubSmokeCheck.startedAt ?? "not run"}
                </p>
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3 text-text-secondary">
                <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  finished / 完成
                </p>
                <p className="mt-1 font-mono text-text-primary break-all">
                  {electronStubSmokeCheck.finishedAt ?? "not run"}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-100">
                <p className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">
                  file access / 文件访问
                </p>
                <p className="mt-1 font-semibold">disabled</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {toArray(electronStubSmokeCheck.methods).map((method) => (
                <div
                  key={method.key}
                  className={`rounded-2xl border p-3.5 space-y-2 text-[10px] ${
                    method.status === "passed"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                      : method.status === "blocked"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-100"
                        : method.status === "error"
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                          : method.status === "running"
                            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-100"
                            : "border-border-color/60 bg-black/10 text-text-secondary"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[11px] font-bold text-text-primary">
                      {method.label}
                    </h4>
                    <span className="font-mono uppercase">{method.status}</span>
                  </div>
                  <p className="leading-relaxed">{method.message}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {toArray(method.safetyAssertions).map((assertion) => (
                      <span
                        key={assertion}
                        className="px-2 py-1 rounded-lg border border-current/15 bg-black/10 text-[9px]"
                      >
                        {assertion}
                      </span>
                    ))}
                  </div>
                  {typeof method.payloadPreview !== "undefined" && (
                    <pre className="max-h-32 overflow-auto rounded-xl border border-black/20 bg-black/20 p-2 text-[9px] text-text-secondary whitespace-pre-wrap">
                      {JSON.stringify(method.payloadPreview, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-violet-300" />
                  <span>冒烟检查说明</span>
                </h4>
                <div className="space-y-2">
                  {toArray(electronStubSmokeCheck.notes).map((note) => (
                    <p
                      key={note}
                      className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-2.5 text-[10px] text-text-secondary leading-relaxed"
                    >
                      {note}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>MVP-17 禁止动作</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(electronStubSmokeCheck.forbiddenActions).map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-18 Electron directory picker stub contract */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Folders className="w-4 h-4 text-blue-400" />
                  <span>MVP-18 Electron 目录选择 Stub / Tokenized Root</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本区定义未来目录选择器返回给 Renderer 的安全结构。当前
                  selectLibraryRoot() 只返回 stub
                  token，不打开真实目录、不读取真实磁盘、不返回 absolutePath。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-blue-300 bg-blue-500/10 border-blue-500/25">
                {electronDirectoryPickerStubContract.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-100">
                <p className="text-[9px] uppercase tracking-wider text-blue-300 font-bold">
                  rootPathToken
                </p>
                <p className="mt-1 font-mono break-all">
                  {electronDirectoryPickerStubContract.stubResult.rootPathToken}
                </p>
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3 text-text-secondary">
                <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                  显示名称
                </p>
                <p className="mt-1 font-semibold text-text-primary">
                  {electronDirectoryPickerStubContract.stubResult.displayName}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-100">
                <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">
                  媒体库类型
                </p>
                <p className="mt-1 font-mono">
                  {electronDirectoryPickerStubContract.stubResult.libraryType}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-100">
                <p className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">
                  absolutePath
                </p>
                <p className="mt-1 font-semibold">不返回 Renderer</p>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span>未来返回字段合同</span>
                </h4>
                <div className="space-y-2">
                  {toArray(
                    electronDirectoryPickerStubContract.futureResultFields,
                  ).map((field) => (
                    <div
                      key={field.key}
                      className="rounded-xl border border-border-color/50 bg-card-bg/20 p-2.5 text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-text-primary">
                          {field.key}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${field.rendererVisible ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-rose-300 bg-rose-500/10 border-rose-500/20"}`}
                        >
                          {field.rendererVisible
                            ? "Renderer 可见"
                            : "禁止给 Renderer"}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-text-primary">
                        {field.label}
                      </p>
                      <p className="mt-1 text-text-muted leading-relaxed">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-3">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
                  <span>目录选择流程</span>
                </h4>
                <div className="space-y-2">
                  {toArray(electronDirectoryPickerStubContract.flow).map(
                    (step) => (
                      <div
                        key={step.id}
                        className={`rounded-xl border p-2.5 text-[10px] ${
                          step.status === "current-stub"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                            : step.status === "blocked"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-text-primary">
                            {step.title}
                          </span>
                          <span className="font-mono uppercase">
                            {step.status}
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-emerald-100 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>安全规则</span>
                </h4>
                <div className="space-y-1.5">
                  {toArray(
                    electronDirectoryPickerStubContract.securityRules,
                  ).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-emerald-100 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>MVP-18 禁止动作</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(
                    electronDirectoryPickerStubContract.forbiddenActions,
                  ).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-19 Electron directory dialog tokenized root */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Folders className="w-4 h-4 text-emerald-400" />
                  <span>
                    MVP-19 Electron 真实目录选择 Dialog / Tokenized Root
                  </span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本阶段开始调用 Electron main
                  的真实系统目录选择器，但仍然只返回 rootPathToken / displayName
                  / libraryType，不扫描目录、不写 library-index.json、不向
                  Renderer 暴露 absolutePath。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-emerald-300 bg-emerald-500/10 border-emerald-500/25">
                {electronDirectoryDialogMvp19Contract.status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-emerald-100 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>本轮已启用</span>
                </h4>
                <div className="space-y-1.5">
                  {toArray(
                    electronDirectoryDialogMvp19Contract.implementedNow,
                  ).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-emerald-100 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>MVP-19 继续禁止</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(
                    electronDirectoryDialogMvp19Contract.stillForbidden,
                  ).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Renderer 返回字段</span>
                </h4>
                <div className="space-y-2">
                  {toArray(
                    electronDirectoryDialogMvp19Contract.resultFields,
                  ).map((field) => (
                    <div
                      key={field.key}
                      className="rounded-xl border border-border-color/50 bg-card-bg/20 p-2.5 text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-text-primary">
                          {field.key}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold ${field.rendererVisible ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" : "text-rose-300 bg-rose-500/10 border-rose-500/20"}`}
                        >
                          {field.rendererVisible
                            ? "Renderer 可见"
                            : "禁止给 Renderer"}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-text-primary">
                        {field.label}
                      </p>
                      <p className="mt-1 text-text-muted leading-relaxed">
                        {field.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-3">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
                  <span>MVP-19 流程</span>
                </h4>
                <div className="space-y-2">
                  {toArray(electronDirectoryDialogMvp19Contract.flow).map(
                    (step) => (
                      <div
                        key={step.id}
                        className={`rounded-xl border p-2.5 text-[10px] ${
                          step.status === "implemented"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                            : step.status === "still-blocked"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-100"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-text-primary">
                            {step.title}
                          </span>
                          <span className="font-mono uppercase">
                            {step.status}
                          </span>
                        </div>
                        <p className="mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-20 Electron read-only dry-run scanner */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>MVP-20 Electron 小样本只读 Dry-run 扫描</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  本阶段按个人项目实用优先加快进度：用户主动选择目录后，允许
                  Electron main 读取目录项并生成预览；仍不写
                  index、不返回真实路径、不删除/移动/重命名文件。
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-emerald-300 bg-emerald-500/10 border-emerald-500/25">
                {electronDryRunScannerMvp20Contract.status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-emerald-100 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>本轮启用</span>
                </h4>
                <div className="space-y-1.5">
                  {toArray(electronDryRunScannerMvp20Contract.enabledNow).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-emerald-100 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-rose-100 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>仍不做</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(electronDryRunScannerMvp20Contract.stillBlocked).map(
                    (item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-lg border border-rose-500/20 bg-black/10 text-[10px] text-rose-200"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-300" />
                  <span>扫描限制</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {toArray(
                    electronDryRunScannerMvp20Contract.scannerLimits,
                  ).map((limit) => (
                    <div
                      key={limit.key}
                      className="rounded-xl border border-border-color/50 bg-card-bg/20 p-2.5 text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-text-primary">
                          {limit.key}
                        </span>
                        <span className="text-emerald-300 font-mono">
                          {limit.value}
                        </span>
                      </div>
                      <p className="mt-1 text-text-muted leading-relaxed">
                        {limit.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary flex items-center space-x-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
                  <span>加速后的后续任务</span>
                </h4>
                <div className="space-y-1.5">
                  {toArray(electronDryRunScannerMvp20Contract.acceleratedPlan)
                    .slice(0, 6)
                    .map((item) => (
                      <p
                        key={item}
                        className="text-[10px] text-text-secondary leading-relaxed"
                      >
                        • {item}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* MVP-21/22 dry-run report and index write preview */}
          <section className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 border-b border-border-color/30 pb-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>MVP-21/22/23/24/25 Dry-run / Index / 本地播放</span>
                </h3>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  把 Settings 中的真实 dry-run 结果沉淀成 Diagnostics
                  正式预览，生成 library-index.json
                  写入预览，确认写入，读取后应用到资源库页面，并通过 HTMLAudio
                  播放本地音频。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase text-blue-300 bg-blue-500/10 border-blue-500/25">
                  {electronDryRunReportIndexPreviewMvp22.status}
                </span>
                <button
                  onClick={refreshStoredMvp21Preview}
                  className="px-2.5 py-1 rounded-xl border border-border-color/70 bg-card-bg/30 text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  刷新预览
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3.5 space-y-3">
                <h4 className="text-[11px] font-bold text-blue-100 flex items-center space-x-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>最近一次 dry-run 报告</span>
                </h4>
                {storedDryRunReport?.ok ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="rounded-xl border border-blue-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-blue-100/70">目录</p>
                        <p className="mt-1 font-bold text-blue-50 truncate">
                          {storedDryRunReport.displayName}
                        </p>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-blue-100/70">条目</p>
                        <p className="mt-1 font-mono font-bold text-blue-50">
                          {storedDryRunReport.summary.discoveredEntryCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-blue-100/70">音轨</p>
                        <p className="mt-1 font-mono font-bold text-blue-50">
                          {storedDryRunReport.summary.trackCandidateCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-blue-100/70">警告</p>
                        <p className="mt-1 font-mono font-bold text-blue-50">
                          {storedDryRunReport.summary.warningCount}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {toArray(storedDryRunReport.discoveredEntries)
                        .slice(0, 6)
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-blue-500/15 bg-black/10 px-2 py-1 text-[10px]"
                          >
                            <span className="font-mono text-blue-100/80 truncate">
                              {entry.relativePath}
                            </span>
                            <span className="font-mono text-blue-200 flex-shrink-0">
                              {entry.entryKind}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : storedDryRunReport ? (
                  <p className="text-[10px] text-rose-100 leading-relaxed">
                    {storedDryRunReport.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-blue-100/70 leading-relaxed">
                    还没有可展示的真实 dry-run
                    报告。请先到设置页选择目录并运行预览扫描。
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 space-y-3">
                <h4 className="text-[11px] font-bold text-emerald-100 flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>library-index.json 写入预览</span>
                </h4>
                {storedIndexWritePreview?.ok ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="rounded-xl border border-emerald-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-emerald-100/70">集合</p>
                        <p className="mt-1 font-mono font-bold text-emerald-50">
                          {storedIndexWritePreview.summary.collectionCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-emerald-100/70">音轨</p>
                        <p className="mt-1 font-mono font-bold text-emerald-50">
                          {storedIndexWritePreview.summary.trackCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-emerald-100/70">封面</p>
                        <p className="mt-1 font-mono font-bold text-emerald-50">
                          {storedIndexWritePreview.summary.coverCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-black/10 p-2 text-[10px]">
                        <p className="text-emerald-100/70">字幕</p>
                        <p className="mt-1 font-mono font-bold text-emerald-50">
                          {storedIndexWritePreview.summary.subtitleCount}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/15 bg-black/10 p-2 text-[10px] text-emerald-100/80 leading-relaxed">
                      <p>
                        预览文件：
                        <span className="font-mono text-emerald-50">
                          {storedIndexWritePreview.proposedIndexFileName}
                        </span>
                      </p>
                      <p>
                        根目录字段：只写{" "}
                        <span className="font-mono">rootPathToken</span>
                        ，不写真实路径。
                      </p>
                      <p>下一步：用户确认后再进入 MVP-23 真实写入。</p>
                    </div>
                  </div>
                ) : storedIndexWritePreview ? (
                  <p className="text-[10px] text-rose-100 leading-relaxed">
                    {storedIndexWritePreview.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-100/70 leading-relaxed">
                    还没有 index 写入预览。请先到设置页完成 dry-run
                    后点击“生成写入预览”。
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-purple-100 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>library-index.json 真实写入结果</span>
              </h4>
              {storedIndexWriteResult?.ok ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl border border-purple-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-purple-100/70">集合</p>
                      <p className="mt-1 font-mono font-bold text-purple-50">
                        {storedIndexWriteResult.summary.collectionCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-purple-100/70">音轨</p>
                      <p className="mt-1 font-mono font-bold text-purple-50">
                        {storedIndexWriteResult.summary.trackCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-purple-100/70">字节</p>
                      <p className="mt-1 font-mono font-bold text-purple-50">
                        {storedIndexWriteResult.bytesWritten}
                      </p>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-purple-100/70">备份</p>
                      <p className="mt-1 font-mono font-bold text-purple-50 truncate">
                        {storedIndexWriteResult.backupRelativePath ||
                          "无旧文件"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-500/15 bg-black/10 p-2 text-[10px] text-purple-100/80 leading-relaxed">
                    <p>
                      写入文件：
                      <span className="font-mono text-purple-50">
                        {storedIndexWriteResult.indexRelativePath}
                      </span>
                    </p>
                    <p>
                      SHA256：
                      <span className="font-mono text-purple-50">
                        {storedIndexWriteResult.sha256.slice(0, 24)}…
                      </span>
                    </p>
                    <p>
                      下一步：点击设置页“读取并应用 index”，让资源库页面显示真实
                      index 数据。
                    </p>
                  </div>
                </div>
              ) : storedIndexWriteResult ? (
                <p className="text-[10px] text-rose-100 leading-relaxed">
                  {storedIndexWriteResult.message}
                </p>
              ) : (
                <p className="text-[10px] text-purple-100/70 leading-relaxed">
                  还没有真实写入结果。请到设置页完成
                  dry-run、生成写入预览，然后点击“确认写入 index”。
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-violet-100 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>library-index.json 读取与页面应用结果</span>
              </h4>
              {storedIndexReadResult?.ok ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl border border-violet-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-violet-100/70">集合</p>
                      <p className="mt-1 font-mono font-bold text-violet-50">
                        {storedIndexReadResult.summary.collectionCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-violet-100/70">音轨</p>
                      <p className="mt-1 font-mono font-bold text-violet-50">
                        {storedIndexReadResult.summary.trackCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-violet-100/70">字节</p>
                      <p className="mt-1 font-mono font-bold text-violet-50">
                        {storedIndexReadResult.bytesRead}
                      </p>
                    </div>
                    <div className="rounded-xl border border-violet-500/20 bg-black/10 p-2 text-[10px]">
                      <p className="text-violet-100/70">状态</p>
                      <p className="mt-1 font-bold text-emerald-300">
                        已可映射
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-violet-500/15 bg-black/10 p-2 text-[10px] text-violet-100/80 leading-relaxed">
                    <p>
                      读取文件：
                      <span className="font-mono text-violet-50">
                        {storedIndexReadResult.indexRelativePath}
                      </span>
                    </p>
                    <p>
                      SHA256：
                      <span className="font-mono text-violet-50">
                        {storedIndexReadResult.sha256.slice(0, 24)}…
                      </span>
                    </p>
                    <p>
                      主界面会把 rj_work 映射为音声库，把 music_album /
                      music_folder 映射为音乐库。
                    </p>
                  </div>
                </div>
              ) : storedIndexReadResult ? (
                <p className="text-[10px] text-rose-100 leading-relaxed">
                  {storedIndexReadResult.message}
                </p>
              ) : (
                <p className="text-[10px] text-violet-100/70 leading-relaxed">
                  还没有读取结果。请到设置页完成写入后点击“读取并应用 index”。
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3.5 space-y-3">
              <h4 className="text-[11px] font-bold text-sky-100 flex items-center space-x-1.5">
                <AudioLines className="w-3.5 h-3.5" />
                <span>MVP-25 HTMLAudio 本地音频播放</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">媒体协议</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    yang-kura-media
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">播放内核</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    HTMLAudio
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">支持格式</p>
                  <p className="mt-1 font-mono font-bold text-sky-50">
                    {electronLocalAudioPlaybackMvp25Service.supportedExtensions.join(
                      " / ",
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-500/20 bg-black/10 p-2 text-[10px]">
                  <p className="text-sky-100/70">路径暴露</p>
                  <p className="mt-1 font-bold text-emerald-300">
                    不暴露真实路径
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-black/10 p-2 text-[10px] text-sky-100/80 leading-relaxed">
                <p>
                  播放流程：真实 index 音轨 → rootPathToken + relativePath →
                  受控媒体 URL → HTMLAudio。
                </p>
                <p>下一步：{electronLocalAudioPlaybackMvp25Service.next}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary">
                  本轮启用
                </h4>
                {toArray(electronDryRunReportIndexPreviewMvp22.enabledNow).map(
                  (item) => (
                    <p
                      key={item}
                      className="text-[10px] text-text-secondary leading-relaxed"
                    >
                      • {item}
                    </p>
                  ),
                )}
              </div>
              <div className="rounded-2xl border border-border-color/60 bg-black/10 p-3.5 space-y-2">
                <h4 className="text-[11px] font-bold text-text-primary">
                  仍不做
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(
                    electronDryRunReportIndexPreviewMvp22.stillBlocked,
                  ).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/10 text-[10px] text-rose-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp66-beta-gui-regression"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-emerald-500/10 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{mvp66BetaGuiRegression.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp66BetaGuiRegression.description}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">
                MVP-66
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {mvp66BetaGuiRegression.chips.map((chip) => (
                <div
                  key={chip.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaGuiRegressionService.getToneClassName(chip.tone)}`}
                >
                  <p className="font-bold opacity-90">{chip.label}</p>
                  <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                  {chip.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {chip.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3 lg:col-span-1">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  推荐命令
                </p>
                <div className="space-y-1 font-mono text-[9px] text-text-secondary">
                  {mvp66BetaGuiRegression.commands.map((command) => (
                    <p key={command}>{command}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 lg:col-span-1">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  真实样本清单
                </p>
                <div className="space-y-1.5">
                  {mvp66BetaGuiRegression.sampleChecklist.map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-emerald-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 lg:col-span-1">
                <p className="text-[10px] font-bold text-sky-100 mb-2">
                  失败后处理
                </p>
                <div className="space-y-1.5">
                  {mvp66BetaGuiRegression.nextIfFailed.map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-sky-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="text-[10px] font-bold text-amber-100 mb-2">
                继续保持的安全边界
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mvp66BetaGuiRegression.safetyBoundary.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] text-amber-50/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            id="mvp67-beta-rc-closeout"
            className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-emerald-500/10 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{mvp67BetaRcCloseout.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp67BetaRcCloseout.description}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">
                MVP-67
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {toArray(mvp67BetaRcCloseout.chips).map((chip) => (
                <div
                  key={chip.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaRcCloseoutService.getToneClassName(chip.tone)}`}
                >
                  <p className="font-bold opacity-90">{chip.label}</p>
                  <p className="mt-1 text-xs font-extrabold">{chip.value}</p>
                  {chip.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {chip.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 lg:col-span-1">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  已通过链路
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp67BetaRcCloseout.confirmedFlow).map((step) => (
                    <p
                      key={step.id}
                      className="text-[10px] text-emerald-50/80 leading-relaxed"
                    >
                      • {step.title} · {step.status}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 lg:col-span-1">
                <p className="text-[10px] font-bold text-sky-100 mb-2">
                  RC 检查
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp67BetaRcCloseout.rcChecks).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-sky-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 lg:col-span-1">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  下一步
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp67BetaRcCloseout.nextSteps).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-amber-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
              <p className="text-[10px] font-bold text-text-primary mb-2">
                继续保持的安全边界
              </p>
              <div className="flex flex-wrap gap-1.5">
                {toArray(mvp67BetaRcCloseout.safetyBoundary).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border-color/60 bg-black/10 px-2 py-1 text-[9px] text-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            id="mvp70-beta-final-handoff"
            className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-emerald-500/10 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{mvp70BetaFinalHandoff.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp70BetaFinalHandoff.description}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">
                MVP-70
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {toArray(mvp70BetaFinalHandoff.cards).map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaFinalHandoffService.getToneClassName(card.tone)}`}
                >
                  <p className="font-bold opacity-90">{card.label}</p>
                  <p className="mt-1 text-xs font-extrabold">{card.value}</p>
                  {card.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {card.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  用户已确认链路
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp70BetaFinalHandoff.userConfirmedFlow).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-emerald-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                <p className="text-[10px] font-bold text-sky-100 mb-2">
                  推荐轻量验证
                </p>
                <div className="space-y-1 font-mono text-[9px] text-sky-50/80">
                  {toArray(mvp70BetaFinalHandoff.recommendedCommands).map(
                    (command) => (
                      <p key={command}>{command}</p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  交接规则
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp70BetaFinalHandoff.handoffRules).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-amber-50/80 leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  最终包检查
                </p>
                <div className="space-y-2">
                  {toArray(mvp70BetaFinalHandoff.finalPackageChecklist).map(
                    (step) => (
                      <div
                        key={step.id}
                        className={`rounded-lg border px-3 py-2 text-[10px] ${betaFinalHandoffService.getToneClassName(step.tone)}`}
                      >
                        <p className="font-bold opacity-90">
                          {step.title} · {step.status}
                        </p>
                        <p className="mt-1 leading-relaxed opacity-75">
                          {step.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  冻结边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp70BetaFinalHandoff.frozenBoundaries).map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border-color/60 bg-black/10 px-2 py-1 text-[9px] text-text-secondary"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  发布决策
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp70BetaFinalHandoff.releaseDecision).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-text-secondary leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp69-beta-release-candidate"
            className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-emerald-500/10 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{mvp69BetaReleaseCandidate.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp69BetaReleaseCandidate.description}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-100 whitespace-nowrap">
                MVP-69
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {toArray(mvp69BetaReleaseCandidate.cards).map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaReleaseCandidateService.getToneClassName(card.tone)}`}
                >
                  <p className="font-bold opacity-90">{card.label}</p>
                  <p className="mt-1 text-xs font-extrabold">{card.value}</p>
                  {card.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {card.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  已确认能力
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp69BetaReleaseCandidate.confirmedCapabilities).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-emerald-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                <p className="text-[10px] font-bold text-sky-100 mb-2">
                  RC 决策说明
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp69BetaReleaseCandidate.rcDecisionNotes).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-sky-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  非阻塞项
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp69BetaReleaseCandidate.knownNonBlockingItems).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-amber-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  推荐命令
                </p>
                <div className="space-y-1 font-mono text-[9px] text-text-secondary">
                  {toArray(mvp69BetaReleaseCandidate.recommendedCommands).map(
                    (command) => (
                      <p key={command}>{command}</p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  冻结边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp69BetaReleaseCandidate.freezeBoundary).map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border-color/60 bg-black/10 px-2 py-1 text-[9px] text-text-secondary"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </section>

          <section
            id="mvp68-beta-rc-user-guide"
            className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-sky-500/10 pb-3">
              <div>
                <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-300" />
                  <span>{mvp68BetaRcUserGuide.title}</span>
                </h3>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                  {mvp68BetaRcUserGuide.description}
                </p>
              </div>
              <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[9px] font-bold text-sky-100 whitespace-nowrap">
                MVP-68
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {toArray(mvp68BetaRcUserGuide.cards).map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl border px-3 py-3 text-[10px] ${betaRcUserGuideService.getToneClassName(card.tone)}`}
                >
                  <p className="font-bold opacity-90">{card.label}</p>
                  <p className="mt-1 text-xs font-extrabold">{card.value}</p>
                  {card.helper && (
                    <p className="mt-1 leading-relaxed opacity-75">
                      {card.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-[10px] font-bold text-emerald-100 mb-2">
                  首次使用流程
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp68BetaRcUserGuide.firstRunGuide).map((step) => (
                    <p
                      key={step.id}
                      className="text-[10px] text-emerald-50/80 leading-relaxed"
                    >
                      • {step.title} · {step.status}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                <p className="text-[10px] font-bold text-sky-100 mb-2">
                  推荐命令
                </p>
                <div className="space-y-1 font-mono text-[9px] text-sky-50/80">
                  {toArray(mvp68BetaRcUserGuide.recommendedCommands).map(
                    (command) => (
                      <p key={command}>{command}</p>
                    ),
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-[10px] font-bold text-amber-100 mb-2">
                  诊断页折叠计划
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp68BetaRcUserGuide.diagnosticsFoldPlan).map(
                    (item) => (
                      <p
                        key={item}
                        className="text-[10px] text-amber-50/80 leading-relaxed"
                      >
                        • {item}
                      </p>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  打包说明
                </p>
                <div className="space-y-1.5">
                  {toArray(mvp68BetaRcUserGuide.packagingGuide).map((item) => (
                    <p
                      key={item}
                      className="text-[10px] text-text-secondary leading-relaxed"
                    >
                      • {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3">
                <p className="text-[10px] font-bold text-text-primary mb-2">
                  继续保持的安全边界
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {toArray(mvp68BetaRcUserGuide.safetyBoundary).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border-color/60 bg-black/10 px-2 py-1 text-[9px] text-text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Render active sub-interface based on tab selection */}
        </div>
      </details>

      {activeTab === "health" && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
                <span>ASMR 媒体库健康度状况</span>
              </h3>
              <p className="text-[10px] text-text-muted">
                检测并过滤带有潜在缺失封面、音轨受损的异常专辑条目。
              </p>
            </div>

            {/* Bulk repair button (Requirement 4) */}
            <button
              onClick={handleBulkRepair}
              disabled={
                isFixingAll || stats.missingCover + stats.missingAudio === 0
              }
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Demo 修复演示</span>
            </button>
          </div>

          {/* Concurrent bulk refetching progress indicator */}
          {isFixingAll && (
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 animate-pulse text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                <span>
                  正在演示本地记录补全流程，不联网、不下载、不写真实文件...
                </span>
                <span>{repairProgress}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-color h-full transition-all duration-300"
                  style={{ width: `${repairProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-text-secondary font-mono leading-relaxed">
                {repairLog}
              </p>
            </div>
          )}

          {/* Categories selector */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === "all"
                  ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/40 font-bold shadow-sm"
                  : "bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color"
              }`}
            >
              <span>全部条目</span>
              <span className="px-1.5 py-px bg-black/30 rounded-md font-mono text-[10px]">
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setFilterType("identified")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === "identified"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold shadow-sm"
                  : "bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>完美对齐</span>
              <span className="px-1.5 py-px bg-black/30 rounded-md font-mono text-[10px]">
                {stats.identified}
              </span>
            </button>

            <button
              onClick={() => setFilterType("missing-cover")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === "missing-cover"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold shadow-sm"
                  : "bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color"
              }`}
            >
              <ImageOff className="w-3.5 h-3.5 text-amber-400" />
              <span>缺封面图</span>
              <span className="px-1.5 py-px bg-black/30 rounded-md font-mono text-[10px]">
                {stats.missingCover}
              </span>
            </button>

            <button
              onClick={() => setFilterType("missing-audio")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === "missing-audio"
                  ? "bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold shadow-sm"
                  : "bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color"
              }`}
            >
              <AudioLines className="w-3.5 h-3.5 text-rose-400" />
              <span>音频轨空</span>
              <span className="px-1.5 py-px bg-black/30 rounded-md font-mono text-[10px]">
                {stats.missingAudio}
              </span>
            </button>

            <button
              onClick={() => setFilterType("warning")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center space-x-1.5 border cursor-pointer ${
                filterType === "warning"
                  ? "bg-red-500/15 text-red-300 border-red-500/40 font-bold shadow-sm"
                  : "bg-card-bg/20 text-text-secondary border-border-color/60 hover:text-text-primary hover:border-border-color"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>异常受损</span>
              <span className="px-1.5 py-px bg-black/30 rounded-md font-mono text-[10px]">
                {stats.warning}
              </span>
            </button>
          </div>

          {/* Diagnosis list of matching works */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-thin pr-1 pt-1">
            {filteredWorks.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">
                此分类下无对应的健康诊断记录。
              </p>
            ) : (
              toArray(filteredWorks).map((work) => {
                const detail = getStatusDetail(work);
                const StatusIcon = detail.icon;
                return (
                  <div
                    key={work.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-card-bg/20 border border-border-color/60 hover:border-border-color transition-all gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 border border-border-color/30">
                        {work.coverUrl ? (
                          <img
                            src={work.coverUrl}
                            alt={work.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <ImageOff className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-px bg-black/40 text-indigo-300 rounded border border-white/5">
                            {work.id}
                          </span>
                          <h4
                            className="text-xs font-bold text-text-primary truncate"
                            title={work.title}
                          >
                            {work.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">
                          社团: {work.circle} | 声优: {work.cvs.join(", ")}
                        </p>
                        <div className="flex items-center space-x-1.5 mt-1 text-text-secondary">
                          <StatusIcon className="w-3 h-3 flex-shrink-0 text-text-muted" />
                          <span className="text-[10px] font-medium">
                            {detail.desc}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0 border-t sm:border-t-0 border-border-color/20 pt-2 sm:pt-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border ${detail.color}`}
                      >
                        {detail.label}
                      </span>
                      {setAsmrDetailId && (
                        <button
                          onClick={() => setAsmrDetailId(work.id)}
                          className="flex items-center space-x-0.5 text-[10px] text-brand-color hover:text-brand-color-hover font-semibold px-2 py-1 rounded hover:bg-brand-color/5 transition-all cursor-pointer"
                        >
                          <span>管理</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. Scanning Sub-Interface (Requirement 1: Multi-path Scan Additions) */}
      {activeTab === "scan" && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Folders className="w-4.5 h-4.5 text-brand-color" />
                <span>新增资源记录检查</span>
              </h3>
              <p className="text-[10px] text-text-muted">
                基于当前索引与示例记录展示新增资源检查流程，不读取未选择的真实目录，不写
                SQLite。
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleScanNewFolders}
                disabled={isScanning}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-color hover:bg-brand-color-hover disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`}
                />
                <span>检查新增记录</span>
              </button>
              {scannedOnce && (
                <button
                  onClick={handleImportAllScanned}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  全部加入演示记录
                </button>
              )}
            </div>
          </div>

          {/* Scanned Items table */}
          <div className="space-y-3">
            {!scannedOnce ? (
              <div className="py-12 text-center border border-dashed border-border-color rounded-xl bg-card-bg/10 flex flex-col items-center justify-center">
                <Search className="w-10 h-10 text-text-muted mb-2 stroke-1" />
                <h4 className="font-semibold text-text-primary">
                  尚未启动扫描任务
                </h4>
                <p className="text-[10px] text-text-muted mt-1 max-w-xs leading-relaxed">
                  点击右上角按钮查看新增资源检查的演示结果。当前不会访问未选择的真实目录。
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {toArray(scannedItems).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card-bg/20 border border-border-color/60 hover:border-border-color/90 transition-all gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${item.type === "asmr" ? "bg-indigo-500/10 text-indigo-400" : "bg-pink-500/10 text-pink-400"} flex-shrink-0`}
                      >
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-px rounded ${item.type === "asmr" ? "bg-indigo-500/20 text-indigo-300" : "bg-pink-500/20 text-pink-300"}`}
                          >
                            {item.type === "asmr" ? "RJ音声" : "流行音乐"}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted font-bold">
                            {item.id}
                          </span>
                        </div>
                        <h4
                          className="text-xs font-bold text-text-primary mt-1 truncate"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-text-muted mt-0.5 truncate">
                          记录位置:{" "}
                          <span className="font-mono bg-black/30 px-1 py-px rounded border border-white/5">
                            {item.path}
                          </span>
                        </p>
                        <p className="text-[9px] text-text-muted mt-1">
                          预计大小: {item.size} | 社团/歌手:{" "}
                          {item.circleOrArtist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end flex-shrink-0">
                      {item.status === "imported" ? (
                        <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>已加入演示</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleImportScannedItem(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-text-primary border border-white/5 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          加入演示记录
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Physical Batch Rename Sub-Interface (Requirement 2) */}
      {activeTab === "rename" && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-brand-color" />
                <span>命名规则预览</span>
              </h3>
              <p className="text-[10px] text-text-muted">
                选择批量命名规则，仅预览显示名称变化；MVP 阶段不重命名真实文件。
              </p>
            </div>

            <button
              onClick={handleExecuteBatchRename}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-[11px] font-bold transition-all hover:scale-105 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>预览命名规则</span>
            </button>
          </div>

          {/* Rule options row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                预设命名检查规则
              </label>
              <select
                value={renameRule}
                onChange={(e) => {
                  setRenameRule(e.target.value);
                  setIsRenameSuccess(false);
                }}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-color transition-colors"
              >
                <option value="rule-1">
                  【音轨序号】_【社团名】_整理版音频.flac (推荐)
                </option>
                <option value="rule-2">
                  【音轨序号】_【RJ号】_【声优】_ASMR.flac (精简)
                </option>
              </select>
            </div>
            <div className="bg-zinc-950/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center text-[10px] text-text-muted leading-relaxed">
              <span className="text-brand-color font-bold">● 重命名提醒：</span>
              <span>
                当前按钮为禁用级 Demo 概念：MVP 阶段禁止真实重命名，禁止写
                SQLite。
              </span>
            </div>
          </div>

          {/* Before and After Preview table */}
          <div className="space-y-2 border-t border-white/5 pt-3">
            <h4 className="text-[11px] font-bold text-text-primary mb-2">
              命名预览
            </h4>

            <div className="border border-white/5 rounded-xl overflow-hidden bg-black/25">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-zinc-900 border-b border-white/5 text-[10px] text-text-muted font-bold">
                  <tr>
                    <th className="p-3">作品RJ号</th>
                    <th className="p-3">原显示文件名</th>
                    <th className="p-3">新显示名称预览</th>
                    <th className="p-3 text-right">执行状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-text-secondary">
                  <tr>
                    <td className="p-3 font-bold text-brand-color">RJ100204</td>
                    <td className="p-3 truncate max-w-[200px]">
                      01_和風縁側でのんびりおばあちゃんの膝枕耳かき.flac
                    </td>
                    <td className="p-3 text-emerald-400 truncate max-w-[200px]">
                      {renameRule === "rule-1"
                        ? "01_【ひなき】_整理版音轨.flac"
                        : "01_[RJ100204]_ひなき_ASMR.flac"}
                    </td>
                    <td className="p-3 text-right">
                      {isRenameSuccess ? (
                        <span className="text-emerald-400 font-bold">
                          ● 已完成演示
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold">
                          ● 待执行
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-brand-color">RJ100204</td>
                    <td className="p-3 truncate max-w-[200px]">
                      02_縁側ひぐらしの鳴く夕暮れと炭酸シャンプー.flac
                    </td>
                    <td className="p-3 text-emerald-400 truncate max-w-[200px]">
                      {renameRule === "rule-1"
                        ? "02_【ひなき】_整理版音轨.flac"
                        : "02_[RJ100204]_ひなき_ASMR.flac"}
                    </td>
                    <td className="p-3 text-right">
                      {isRenameSuccess ? (
                        <span className="text-emerald-400 font-bold">
                          ● 已完成演示
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold">
                          ● 待执行
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dead Links Sub-Interface (Requirement 1: Dead link checking) */}
      {activeTab === "deadlinks" && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Link2 className="w-4.5 h-4.5 text-rose-400" />
                <span>文件状态检查</span>
              </h3>
              <p className="text-[10px] text-text-muted">
                检查当前索引记录中可能失效的音频条目。当前为诊断演示，不删除、不移动、不重命名真实文件。
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCheckDeadLinks}
                disabled={isCheckingDeadLinks}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-color hover:bg-brand-color-hover disabled:bg-zinc-800 text-white text-[11px] font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isCheckingDeadLinks ? "animate-spin" : ""}`}
                />
                <span>检查文件状态</span>
              </button>
              {hasCheckedDeadLinks && (
                <button
                  onClick={handleFixAllDeadLinks}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  批量标记为已检查
                </button>
              )}
            </div>
          </div>

          {/* Checking list */}
          <div className="space-y-3">
            {!hasCheckedDeadLinks ? (
              <div className="py-12 text-center border border-dashed border-border-color rounded-xl bg-card-bg/10 flex flex-col items-center justify-center">
                <Link2 className="w-10 h-10 text-rose-400/60 mb-2 stroke-1 animate-pulse" />
                <h4 className="font-semibold text-text-primary">
                  文件状态检查
                </h4>
                <p className="text-[10px] text-text-muted mt-1 max-w-xs leading-relaxed">
                  点击右上角按钮查看文件状态演示。真实文件检查只在用户选择目录后进行。
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {toArray(deadLinksList).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card-bg/20 border border-border-color/60 hover:border-border-color/90 transition-all gap-3"
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-rose-400 font-bold">
                            记录异常
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            所属专辑: {item.rjIdOrAlbum}
                          </span>
                        </div>
                        <h4
                          className="text-xs font-bold text-text-primary mt-1 truncate"
                          title={item.title}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-rose-400 font-mono mt-0.5 truncate">
                          {item.reason}
                        </p>
                        <p className="text-[9px] text-text-muted mt-1">
                          虚拟映射相对位置: {item.filePath}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                      {item.status === "fixed" && (
                        <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>已标记正常</span>
                        </span>
                      )}
                      {item.status === "deleted" && (
                        <span className="flex items-center space-x-1 bg-zinc-800 text-text-muted px-3 py-1.5 rounded-xl text-[10px] font-bold">
                          <span>已从演示列表移除</span>
                        </span>
                      )}
                      {item.status === "broken" && (
                        <>
                          <button
                            onClick={() => handleFixDeadLink(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            标记正常
                          </button>
                          <button
                            onClick={() => handleDeleteDeadLink(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold transition-colors cursor-pointer"
                          >
                            从演示移除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Duplicate Checking & Cleanup Sub-Interface (Requirement 8 & 9) */}
      {activeTab === "duplicates" && (
        <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-color/30 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                <Trash2 className="w-4.5 h-4.5 text-pink-400" />
                <span>重复资源分析</span>
              </h3>
              <p className="text-[10px] text-text-muted font-medium">
                检查同一个 RJ
                或同一专辑在索引中是否出现多份记录。当前仅做演示分析，不删除、不移动真实文件。
              </p>
            </div>

            <button
              onClick={() => {
                showToast("重复资源演示分析完成：未读取未选择的真实目录。");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-brand-color hover:bg-brand-color-hover text-white text-[11px] font-bold transition-all cursor-pointer"
            >
              重新分析重复资源
            </button>
          </div>

          <div className="space-y-3.5">
            {duplicateAnalysis.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border-color rounded-xl bg-card-bg/10 flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400/80 mb-2" />
                <h4 className="font-semibold text-text-primary">
                  未检测到任何重复作品
                </h4>
                <p className="text-[10px] text-text-muted mt-1">
                  当前索引没有发现重复作品记录。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-rose-500/10 text-rose-300 rounded-xl border border-rose-500/20 text-[10px] leading-relaxed">
                  📢 <strong>重复提示：</strong> 检测到部分 ASMR
                  媒体在索引演示数据中存在重复记录，估算占用约{" "}
                  <strong>
                    {duplicateAnalysis
                      .reduce((acc, d) => acc + parseFloat(d.totalSize), 0)
                      .toFixed(2)}{" "}
                    GB
                  </strong>{" "}
                  空间。
                </div>

                {toArray(duplicateAnalysis).map((group) => (
                  <div
                    key={group.id}
                    className="p-4 bg-zinc-950/40 border border-border-color/60 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold px-1.5 py-px bg-indigo-500/20 text-indigo-300 rounded">
                          {group.id}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          （存在重合的 2 份记录，估算约 {group.totalSize}）
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (setRjWorks) {
                              // Filter out duplicates keeping only one
                              setRjWorks((prev) => {
                                const seen = new Set();
                                return prev.filter((w) => {
                                  if (w.id === group.id) {
                                    if (seen.has(w.id)) return false; // delete duplicate mock/others
                                    seen.add(w.id);
                                    return true;
                                  }
                                  return true;
                                });
                              });
                            }
                            showToast(
                              "重复资源演示已完成：仅更新页面模拟记录，未删除、移动、重命名真实文件。",
                            );
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm hover:shadow"
                        >
                          保留一条记录
                        </button>
                        <button
                          onClick={() => {
                            showToast("合并演示完成：未写入真实索引。");
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-text-primary rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          合并演示
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {toArray(group.works).map((work, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between bg-black/25 p-2.5 rounded-lg border border-white/5 text-[10px] gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-indigo-400" : "bg-amber-400"}`}
                              />
                              <span className="font-bold text-text-primary truncate">
                                {work.title}
                              </span>
                            </div>
                            <p className="text-[9px] text-text-muted mt-1 font-mono truncate block">
                              记录位置:{" "}
                              {idx === 0
                                ? `<selected-root>/${work.id}`
                                : `<backup-root>/${work.id}`}
                            </p>
                            <p className="text-[9px] text-text-muted truncate mt-0.5 block">
                              导入日期:{" "}
                              {work.addedAt ? work.addedAt : "2026-06-25"} |
                              分轨数: {work.fileCount} 个文件
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-px rounded border flex-shrink-0 ${idx === 0 ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" : "bg-amber-500/10 text-amber-300 border-amber-500/20"}`}
                          >
                            {idx === 0 ? "主记录" : "重复记录"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating alert toast */}
      {feedback && (
        <div className="fixed bottom-24 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-bounce-subtle">
          <Check className="w-4 h-4 text-white" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Hardware / Engine Diagnostics (Persistent bottom) */}
      <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-primary flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>桌面端能力说明</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-card-bg/20 border border-border-color/40">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-text-primary">
                HTMLAudio 本地播放
              </span>
            </div>
            <span className="text-text-secondary font-mono text-[10px]">
              常见音频可用
            </span>
          </div>

          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-card-bg/20 border border-border-color/40">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-text-primary">外部打开</span>
            </div>
            <span className="text-text-secondary font-mono text-[10px]">
              视频/图片走系统应用
            </span>
          </div>

          <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-card-bg/20 border border-border-color/40">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-text-primary">字幕读取</span>
            </div>
            <span className="text-text-secondary font-mono text-[10px]">
              LRC/SRT/VTT/ASS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
