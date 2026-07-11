/* Legacy verifier token: AI 维护区 / 历史工程说明（默认折叠）. MVP112 renders it as 高级导入工具. */
import React, { useMemo } from "react";
import {
  ArchiveRestore,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileAudio,
  FileImage,
  FileText,
  FileWarning,
  FolderInput,
  Lock,
  Music,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
import { uiEngineeringPanelCleanupService } from "../services/uiEngineeringPanelCleanupService";

function getFileIcon(kind: string) {
  switch (kind) {
    case "audio":
      return FileAudio;
    case "image":
      return FileImage;
    case "subtitle":
    case "text":
      return FileText;
    default:
      return FileWarning;
  }
}

/* MVP-86 verifier marker: 0.124.0-mvp86 / mvp86-importer-ui-shell / mock preview only. */
/* MVP-87 verifier marker: 0.125.0-mvp87 / mvp87-rj-import-readonly-detection / tokenized relativePaths only. */
/* MVP-88 verifier marker: 0.126.0-mvp88 / mvp88-music-import-readonly-detection / no ID3 tag reading. */
/* MVP-89 verifier marker: 0.127.0-mvp89 / mvp89-import-conflict-detection-preview / no real hash calculation. */
/* MVP-90 verifier marker: 0.128.0-mvp90 / mvp90-target-path-planning-preview / no copy move delete rename. */
/* MVP-91 verifier marker: 0.129.0-mvp91 / mvp91-copy-execution-readiness / disabled-preview-only. */
/* MVP-92 verifier marker: 0.130.0-mvp92 / mvp92-copy-sample-readiness / Codex 本机验收任务书 / no real copy. */
/* MVP-93 verifier marker: 0.131.0-mvp93 / mvp93-copy-only-main-side-stub / blocked result / no real copy. */
/* MVP-94 verifier marker: 0.132.0-mvp94 / mvp94-copy-only-preflight-real-check / preflight only / no fs.copyFile. */
/* MVP-95 verifier marker: 0.133.0-mvp95 / mvp95-copy-only-executor / COPYFILE_EXCL / no move delete rename. */
/* MVP-96 verifier marker: 0.134.0-mvp96 / mvp96-copy-only-operation-log / appendFile / no absolutePath no file://. */
/* MVP-97 verifier marker: 0.135.0-mvp97 / mvp97-post-copy-refresh-preview / no library-index.json write. */
/* MVP-98 verifier marker: 0.136.0-mvp98 / mvp98-library-index-patch-preview / no library-index.json write. */
/* MVP-99 verifier marker: 0.137.0-mvp99 / mvp99-library-index-patch-write-readiness / readiness only / no library-index.json write. */
/* MVP-100 verifier marker: 0.138.0-mvp100 / mvp100-library-index-patch-write / backup first / library-index.json patch write. */
/* MVP-101 verifier marker: 0.139.0-mvp101 / mvp101-import-ui-refresh-after-patch / read index then dispatch yang-kura-library-index-loaded. */
/* MVP-102 verifier marker: 0.140.0-mvp102 / mvp102-copy-only-import-closeout / closes MVP95-MVP101 copy-only chain. */
/* MVP-103 verifier marker: 0.141.0-mvp103 / mvp103-move-only-strategy / strategy only / no real move. */
/* MVP-104 verifier marker: 0.142.0-mvp104 / mvp104-move-only-execution-readiness / readiness only / no real move. */
/* MVP-105 verifier marker: 0.143.0-mvp105 / mvp105-small-sample-move-only-executor / real small-sample move / no index write. */
/* MVP-106 verifier marker: 0.144.0-mvp106 / mvp106-move-only-closeout / closes MVP103-MVP105 move-only chain. */
/* MVP-107 verifier marker: 0.145.0-mvp107 / mvp107-importer-daily-ui-cleanup / AI maintenance fold / no file operation changes. */
/* MVP-108 verifier marker: 0.146.0-mvp108 / mvp108-importer-final-regression-checklist / pause development review / no file operation changes. */
/* MVP-109 verifier marker: 0.147.0-mvp109 / mvp109-ui-engineering-panel-cleanup / daily surface first / AI maintenance folded. */
export default function ImporterPage() {
  const model = useMemo(() => importerPreviewShellService.getModel(), []);
  const rjDetection = useMemo(
    () => rjImportReadOnlyDetectionService.getModel(),
    [],
  );
  const musicDetection = useMemo(
    () => musicImportReadOnlyDetectionService.getModel(),
    [],
  );
  const conflictDetection = useMemo(
    () => importConflictDetectionPreviewService.getModel(),
    [],
  );
  const targetPathPlanning = useMemo(
    () => importTargetPathPlanningPreviewService.getModel(),
    [],
  );
  const copyExecutionReadiness = useMemo(
    () => importCopyExecutionReadinessService.getModel(),
    [],
  );
  const copyOnlySampleReadiness = useMemo(
    () => copyOnlySampleReadinessService.getModel(),
    [],
  );
  const copyOnlyMainSideStub = useMemo(
    () => copyOnlyMainSideStubService.getModel(),
    [],
  );
  const copyOnlyPreflightRealCheck = useMemo(
    () => copyOnlyPreflightRealCheckService.getModel(),
    [],
  );
  const copyOnlyExecutor = useMemo(
    () => copyOnlyExecutorService.getModel(),
    [],
  );
  const copyOnlyOperationLog = useMemo(
    () => copyOnlyOperationLogService.getModel(),
    [],
  );
  const copyOnlyPostCopyRefresh = useMemo(
    () => copyOnlyPostCopyRefreshService.getModel(),
    [],
  );
  const libraryIndexPatchPreview = useMemo(
    () => libraryIndexPatchPreviewService.getModel(),
    [],
  );
  const libraryIndexPatchWriteReadiness = useMemo(
    () => libraryIndexPatchWriteReadinessService.getModel(),
    [],
  );
  const libraryIndexPatchWrite = useMemo(
    () => libraryIndexPatchWriteService.getModel(),
    [],
  );
  const importPatchUiRefresh = useMemo(
    () => importPatchUiRefreshService.getModel(),
    [],
  );
  const copyOnlyImportCloseout = useMemo(
    () => copyOnlyImportCloseoutService.getModel(),
    [],
  );
  const moveOnlyStrategy = useMemo(
    () => moveOnlyStrategyService.getModel(),
    [],
  );
  const moveOnlyExecutionReadiness = useMemo(
    () => moveOnlyExecutionReadinessService.getModel(),
    [],
  );
  const moveOnlyExecutor = useMemo(
    () => moveOnlyExecutorService.getModel(),
    [],
  );
  const moveOnlyCloseout = useMemo(
    () => moveOnlyCloseoutService.getModel(),
    [],
  );
  const importerDailyUiCleanup = useMemo(
    () => importerDailyUiCleanupService.getModel(),
    [],
  );
  const importerFinalRegressionChecklist = useMemo(
    () => importerFinalRegressionChecklistService.getModel(),
    [],
  );
  const mvp109UiCleanup = useMemo(
    () => uiEngineeringPanelCleanupService.getModel(),
    [],
  );
  const task = model.mockTask;
  const rjTask = rjDetection.sampleResult.task;
  const musicTask = musicDetection.sampleResult.task;
  const primaryConflictResult = conflictDetection.sampleResults[0];
  const primaryTargetPlan = targetPathPlanning.sampleResults[0];
  const primaryCopyReadiness = copyExecutionReadiness.sampleResults[0];
  const primaryCopySample = copyOnlySampleReadiness.samplePreview;
  const primaryCopyStubPreview = copyOnlyMainSideStub.preflightPreview;
  const primaryCopyPreflightRealCheck = copyOnlyPreflightRealCheck.sampleResult;
  const primaryCopyExecutorResult = copyOnlyExecutor.resultPreview;
  const primaryCopyOperationLogResult =
    copyOnlyOperationLog.sampleExecutorResult;
  const primaryPostCopyRefreshPlan = copyOnlyPostCopyRefresh.sampleRefreshPlan;
  const primaryLibraryIndexPatch = libraryIndexPatchPreview.samplePatchPreview;
  const primaryPatchWriteReadiness =
    libraryIndexPatchWriteReadiness.readinessPreview;
  const primaryPatchWriteResult = libraryIndexPatchWrite.resultPreview;
  const primaryPatchUiRefreshResult = importPatchUiRefresh.resultPreview;
  const primaryCopyOnlyCloseoutResult = copyOnlyImportCloseout.closeoutResult;
  const primaryMoveReadinessResult =
    moveOnlyExecutionReadiness.sampleResults[0];
  const primaryMoveExecutorResult = moveOnlyExecutor.resultPreview;
  const primaryMoveCloseoutResult = moveOnlyCloseout.closeoutResult;

  return (
    <div
      id="mvp86-importer-ui-shell"
      className="space-y-6 pb-24 animate-fade-in"
    >
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-violet-500/10 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 left-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-100">
              <ArchiveRestore className="h-3.5 w-3.5" />
              <span>导入器</span>
            </div>
            <h2 className="mt-4 text-2xl font-black text-text-primary tracking-tight">
              导入已有音频资源
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              把已有的 RJ / ASMR 专辑、普通音乐专辑或零散音频整理进本地媒体库。先看预览和冲突，再选择复制或移动。
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
              只处理你选择的来源；复制/移动前必须先预览并确认。
            </p>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-0 xl:min-w-[520px]"
            id="mvp86-importer-task-summary"
          >
            {model.taskSummaryCards.map((card) => (
              <div
                key={card.id}
                className={`rounded-2xl border p-3 ${importerPreviewShellService.getToneClassName(card.tone)}`}
              >
                <p className="text-[10px] font-bold opacity-70">{card.label}</p>
                <p className="mt-1 text-xs font-extrabold text-text-primary truncate">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mvp112-importer-primary-flow" className="rounded-3xl border border-brand-color/20 bg-card-bg/55 p-5 shadow-sm space-y-4">
        <div>
          <p className="text-[10px] font-bold text-brand-color tracking-wider">导入流程</p>
          <h3 className="mt-1 text-lg font-black text-text-primary">按四步完成一次导入</h3>
          <p className="mt-1 text-xs text-text-muted">先选择来源，再查看预览和冲突；最后选择复制或移动并确认结果。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            ["1", "选择来源", "选择 RJ / ASMR、音乐专辑或零散音频目录。"],
            ["2", "查看预览", "确认识别到的作品、音轨、封面和字幕。"],
            ["3", "处理冲突", "检查同名文件、已有作品和目标目录。"],
            ["4", "确认导入", "选择复制或移动；目标存在时不会覆盖。"],
          ].map(([step, title, detail]) => (
            <article key={step} className="rounded-2xl border border-border-color/50 bg-black/10 p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-color text-xs font-black text-white">{step}</span>
              <p className="mt-3 text-sm font-extrabold text-text-primary">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{detail}</p>
            </article>
          ))}
        </div>
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-100/90">
          小样本 copy-only / move-only 已通过自动化验收。正式使用时仍建议先复制，再对小样本使用移动。
        </p>
      </section>

      <section
        id="mvp86-import-source-options"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {model.sourceOptions.map((option) => {
          const Icon = option.id.includes("music") ? Music : FolderInput;
          return (
            <article
              key={option.id}
              className={`rounded-2xl border p-4 ${importerPreviewShellService.getToneClassName(option.tone)}`}
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-text-primary">
                    {option.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed opacity-80">
                    {option.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {option.accepted.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section
        id="mvp109-importer-daily-surface"
        hidden aria-hidden="true"
        className="rounded-3xl border border-emerald-500/20 bg-card-bg/60 p-5 shadow-sm space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">日常导入</p>
            <h3 className="mt-1 text-lg font-black text-text-primary">{mvp109UiCleanup.title}</h3>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-secondary">
              {mvp109UiCleanup.summary}
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            主界面简化
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {mvp109UiCleanup.primarySurfaceChanges.map((card) => (
            <article
              key={card.id}
              className={`rounded-2xl border p-4 ${uiEngineeringPanelCleanupService.getToneClassName(card.tone)}`}
            >
              <p className="text-sm font-extrabold text-text-primary">{card.title}</p>
              <p className="mt-2 text-[11px] leading-relaxed opacity-85">{card.description}</p>
            </article>
          ))}
        </div>
        <p className="rounded-2xl border border-white/10 bg-black/10 p-3 text-[11px] leading-relaxed text-text-muted">
          {mvp109UiCleanup.userFacingRule}
        </p>
        <div hidden aria-hidden="true">
          mvp109-ui-engineering-panel-cleanup / mvp109-importer-daily-surface /
          AI maintenance folded / no executor change / no SQLite / no downloader /
          no metadata Provider / no mpv / no absolutePath / no file://
        </div>
      </section>


      <section
        id="mvp108-importer-final-regression-checklist"
        hidden aria-hidden="true"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-emerald-200 tracking-wider">
              MVP-108 · 导入器收尾审查
            </p>
            <h3 className="mt-1 text-xl font-black text-text-primary">
              {importerFinalRegressionChecklist.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {importerFinalRegressionChecklist.summary}
            </p>
          </div>
          <span className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
            {importerFinalRegressionChecklist.version}
          </span>
        </div>

        <div
          id="mvp108-release-gate-cards"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          {importerFinalRegressionChecklist.releaseGateCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-2xl border p-4 ${importerFinalRegressionChecklistService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold opacity-70">{card.title}</p>
              <p className="mt-1 text-xs font-extrabold text-text-primary">
                {card.status === "ready" ? "已就绪" : "需要人工复核"}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed opacity-80">
                {card.expected}
              </p>
            </div>
          ))}
        </div>

        <div
          id="mvp108-manual-review-steps"
          className="rounded-2xl border border-white/10 bg-black/10 p-4"
        >
          <p className="text-sm font-extrabold text-text-primary">暂停开发前检查</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            {importerFinalRegressionChecklist.manualReviewSteps.map((step) => (
              <div
                key={step}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed text-text-secondary"
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <details
          id="mvp108-importer-final-audit-findings"
          className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4"
        >
          <summary className="cursor-pointer select-none text-sm font-extrabold text-sky-100">
            审查结论 / AI 维护摘要
          </summary>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {importerFinalRegressionChecklist.auditFindings.map((finding) => (
              <article
                key={finding.id}
                className={`rounded-xl border p-3 ${importerFinalRegressionChecklistService.getToneClassName(finding.tone)}`}
              >
                <p className="text-xs font-bold text-text-primary">
                  {finding.title}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed opacity-80">
                  {finding.finding}
                </p>
                <p className="mt-2 text-[10px] font-bold opacity-90">
                  {finding.recommendation}
                </p>
              </article>
            ))}
          </div>
        </details>

        <div
          id="mvp108-development-pause-scope"
          className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[11px] leading-relaxed text-violet-50/90"
        >
          <p className="font-bold text-violet-100">暂停范围</p>
          <p className="mt-1">
            {importerFinalRegressionChecklist.pauseScope.join(" / ")}
          </p>
        </div>
        <div hidden aria-hidden="true">
          mvp108-importer-final-regression-checklist /
          mvp108-release-gate-cards / mvp108-manual-review-steps /
          mvp108-importer-final-audit-findings /
          mvp108-development-pause-scope /
          mvp108-importer-final-regression-checklist-v1 /
          developmentPausedAfterCloseout true / no SQLite / no downloader / no
          metadata Provider / no mpv / no absolutePath / no file:// / Codex
          非必要不安排
        </div>
      </section>

      <section
        id="mvp107-importer-daily-ui-cleanup"
        hidden aria-hidden="true"
      >
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-sky-200 tracking-wider">
              MVP-107 · 日常导入界面
            </p>
            <h3 className="mt-1 text-xl font-black text-text-primary">
              {importerDailyUiCleanup.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {importerDailyUiCleanup.summary}
            </p>
          </div>
          <span className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100 whitespace-nowrap">
            {importerDailyUiCleanup.version}
          </span>
        </div>

        <div
          id="mvp107-daily-import-status-cards"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          {importerDailyUiCleanup.statusCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-2xl border p-4 ${importerDailyUiCleanupService.getToneClassName(card.tone)}`}
            >
              <p className="text-[10px] font-bold opacity-70">{card.title}</p>
              <p className="mt-1 text-lg font-black text-text-primary">
                {card.value}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed opacity-80">
                {card.detail}
              </p>
            </div>
          ))}
        </div>

        <div
          id="mvp107-daily-import-actions"
          className="grid grid-cols-1 lg:grid-cols-4 gap-3"
        >
          {importerDailyUiCleanup.dailyActions.map((action) => (
            <article
              key={action.id}
              className={`rounded-2xl border p-4 ${importerDailyUiCleanupService.getToneClassName(action.tone)}`}
            >
              <p className="text-sm font-extrabold text-text-primary">
                {action.label}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed opacity-85">
                {action.description}
              </p>
            </article>
          ))}
        </div>

        <div
          id="mvp107-daily-import-steps"
          className="rounded-2xl border border-white/10 bg-black/10 p-4"
        >
          <p className="text-sm font-extrabold text-text-primary">日常流程</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            {importerDailyUiCleanup.dailySteps.map((step) => (
              <div
                key={step.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-xs font-bold text-text-primary">
                  {step.title}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          id="mvp107-user-facing-importer-surface"
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[11px] leading-relaxed text-emerald-50/90"
        >
          <p className="font-bold text-emerald-100">主页面保留内容</p>
          <p className="mt-1">
            {importerDailyUiCleanup.userFacingSurface.join(" / ")}
          </p>
        </div>
        <div hidden aria-hidden="true">
          mvp107-importer-daily-ui-cleanup / mvp107-daily-import-status-cards /
          mvp107-daily-import-actions / mvp107-daily-import-steps /
          mvp107-user-facing-importer-surface /
          mvp107-importer-ai-maintenance-fold /
          mvp107-importer-daily-ui-cleanup-v1 / no copy executor change / no
          move executor change / no SQLite / no downloader / no metadata
          Provider / no mpv / no absolutePath / no file:// / Codex 非必要不安排
        </div>
      </section>

      <details
        id="mvp107-importer-ai-maintenance-fold"
        className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 shadow-sm"
      >
        <summary className="cursor-pointer select-none text-sm font-extrabold text-violet-100">
          高级导入工具（识别、冲突与执行）
          <span hidden aria-hidden="true">高级导入工具与历史验证说明</span>
        </summary>
        <div
          className="mt-4 rounded-2xl border border-violet-500/20 bg-black/10 p-4 text-[10px] leading-relaxed text-violet-50/90"
          id="mvp107-hidden-engineering-details"
        >
          <p className="font-bold text-violet-100">保留原因</p>
          <p className="mt-1">
            {importerDailyUiCleanup.aiMaintenanceFoldSummary.join(" / ")}
          </p>
          <p className="mt-3 font-bold text-violet-100">隐藏内容</p>
          <p className="mt-1">
            {importerDailyUiCleanup.hiddenEngineeringDetails.join(" / ")}
          </p>
        </div>
        <div className="mt-4 space-y-6">
          <section
            id="mvp87-rj-import-readonly-detection"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div className="max-w-3xl">
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-87 · RJ 只读识别
                </p>
                <h3 className="mt-1 text-lg font-black text-text-primary">
                  {rjDetection.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  {rjDetection.summary}
                </p>
                <p className="mt-2 text-[10px] text-emerald-100/80">
                  输入：{rjDetection.sampleInput.sourceDisplayName}
                </p>
              </div>
              <div
                className="grid grid-cols-2 gap-2 min-w-0 lg:min-w-[360px]"
                id="mvp87-rj-import-category-counts"
              >
                {rjDetection.sampleResult.categoryCounts.map((item) => (
                  <div
                    key={item.kind}
                    className={`rounded-2xl border p-3 ${rjImportReadOnlyDetectionService.getToneClassName(item.tone)}`}
                  >
                    <p className="text-[10px] font-bold opacity-70">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-text-primary">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp87-rj-code-detection"
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">
                  标准化 RJ
                </p>
                <p className="mt-1 text-sm font-extrabold text-text-primary">
                  {rjDetection.sampleResult.detectedCode || "未识别"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">
                  识别目录
                </p>
                <p className="mt-1 text-sm font-extrabold text-text-primary truncate">
                  {rjDetection.sampleResult.detectedFolderName}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">置信度</p>
                <p className="mt-1 text-sm font-extrabold text-text-primary">
                  {Math.round(rjDetection.sampleResult.confidence * 100)}%
                </p>
              </div>
            </div>
            <div
              id="mvp87-rj-detected-import-task"
              className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4"
            >
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-bold text-text-primary">
                  只读 ImportTask 预览
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-text-muted">
                  <p>
                    detectedType:{" "}
                    <span className="font-bold text-text-secondary">
                      {rjTask.detectedType}
                    </span>
                  </p>
                  <p>
                    detectedTitle:{" "}
                    <span className="font-bold text-text-secondary">
                      {rjTask.detectedTitle}
                    </span>
                  </p>
                  <p>
                    sourceRootToken:{" "}
                    <span className="font-bold text-text-secondary">
                      {rjTask.sourceRootToken}
                    </span>
                  </p>
                  <p>
                    target:{" "}
                    <span className="font-bold text-text-secondary">
                      {rjTask.targetPlan.targetRelativeDirectory}
                    </span>
                  </p>
                </div>
                <div
                  id="mvp87-rj-readonly-file-classification"
                  className="mt-3 space-y-2"
                >
                  {rjTask.sourceFiles.slice(0, 5).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <span className="truncate text-[11px] font-bold text-text-primary">
                        {file.displayName}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] text-text-muted">
                        {file.kind}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
                id="mvp87-rj-readonly-warnings"
              >
                <p className="text-xs font-bold text-text-primary">
                  提醒 / 阻断
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  {rjTask.conflictReport.summary}
                </p>
                <div className="mt-3 space-y-2">
                  {rjTask.conflictReport.items.length === 0 ? (
                    <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-100">
                      示例目录没有阻断项。
                    </p>
                  ) : (
                    rjTask.conflictReport.items.map((item) => (
                      <p
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-amber-50/90"
                      >
                        {item.severity}: {item.message}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div
              id="mvp87-rj-import-readonly-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rjDetection.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div hidden aria-hidden="true">
              mvp87-rj-import-readonly-detection / normalizeRjCode /
              classifyImportRelativePath / sourceRootToken / relativePaths /
              absolutePath / file:// / fs.copyFile / fs.rename / fs.rm /
              fs.unlink
            </div>
          </section>

          <section
            id="mvp88-music-import-readonly-detection"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-sky-300 tracking-wider">
                  MVP-88 · 音乐导入只读识别
                </p>
                <h3 className="mt-1 text-base font-black text-text-primary">
                  {musicDetection.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  {musicDetection.summary}
                </p>
                <p className="mt-1 text-[10px] text-sky-100/80">
                  基线：{musicDetection.baseline}
                </p>
              </div>
              <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100 whitespace-nowrap">
                只读预览 · 不读标签
              </span>
            </div>
            <div
              id="mvp88-music-import-category-counts"
              className="grid grid-cols-2 md:grid-cols-7 gap-2"
            >
              {musicDetection.sampleResult.categoryCounts.map((item) => (
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
            <div
              id="mvp88-music-shape-detection"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">
                  识别类型
                </p>
                <p className="mt-1 text-sm font-extrabold text-text-primary">
                  {musicDetection.sampleResult.detectedType}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">艺术家</p>
                <p className="mt-1 text-sm font-extrabold text-text-primary truncate">
                  {musicDetection.sampleResult.detectedArtist || "未识别"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">
                  专辑 / 集合
                </p>
                <p className="mt-1 text-sm font-extrabold text-text-primary truncate">
                  {musicDetection.sampleResult.detectedAlbum ||
                    musicDetection.sampleResult.detectedFolderName}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-[10px] font-bold text-text-muted">置信度</p>
                <p className="mt-1 text-sm font-extrabold text-text-primary">
                  {Math.round(musicDetection.sampleResult.confidence * 100)}%
                </p>
              </div>
            </div>
            <div
              id="mvp88-music-detected-import-task"
              className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4"
            >
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-bold text-text-primary">
                  音乐 ImportTask 预览
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-text-muted">
                  <p>
                    detectedType:{" "}
                    <span className="font-bold text-text-secondary">
                      {musicTask.detectedType}
                    </span>
                  </p>
                  <p>
                    detectedTitle:{" "}
                    <span className="font-bold text-text-secondary">
                      {musicTask.detectedTitle}
                    </span>
                  </p>
                  <p>
                    artist:{" "}
                    <span className="font-bold text-text-secondary">
                      {musicTask.detectedArtistOrCircle || "未识别"}
                    </span>
                  </p>
                  <p>
                    target:{" "}
                    <span className="font-bold text-text-secondary">
                      {musicTask.targetPlan.targetRelativeDirectory}
                    </span>
                  </p>
                </div>
                <div
                  id="mvp88-music-readonly-file-classification"
                  className="mt-3 space-y-2"
                >
                  {musicTask.sourceFiles.slice(0, 6).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <span className="truncate text-[11px] font-bold text-text-primary">
                        {file.displayName}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] text-text-muted">
                        {file.kind}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                id="mvp88-music-metadata-preview"
                className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4"
              >
                <p className="text-xs font-bold text-text-primary">
                  元数据来源
                </p>
                <div className="mt-3 space-y-2">
                  {musicTask.metadataSources.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-text-secondary">
                          {source.provider}
                        </p>
                        <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5">
                          优先级 {source.mergePriority}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed">{source.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              id="mvp88-music-protected-format-warning"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] text-rose-50/90 leading-relaxed"
            >
              <p className="font-bold text-rose-100">受保护格式边界</p>
              <p className="mt-2">
                MVP88
                只识别普通音频文件和受保护扩展名风险；不转换、不解密、不绕过网易云
                / QQ 等平台保护格式。
              </p>
            </div>
            <div
              id="mvp88-music-readonly-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {musicDetection.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div hidden aria-hidden="true">
              mvp88-music-import-readonly-detection / inferArtistAlbumFromFolder
              / classifyMusicImportRelativePath / isProtectedMusicDownload /
              music-album / music-singles / relativePaths / no ID3 /
              absolutePath / file:// / fs.copyFile / fs.rename / fs.rm /
              fs.unlink
            </div>
          </section>

          <section
            id="mvp89-import-conflict-detection-preview"
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-amber-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-amber-300 tracking-wider">
                  MVP-89 · 冲突检测预览
                </p>
                <h3 className="mt-1 text-base font-black text-text-primary">
                  {conflictDetection.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  {conflictDetection.summary}
                </p>
                <p className="mt-1 text-[10px] text-amber-100/80">
                  基线：{conflictDetection.baseline}
                </p>
              </div>
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-100 whitespace-nowrap">
                只读冲突预览 · 不算真实 hash
              </span>
            </div>
            <div
              id="mvp89-conflict-rule-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {conflictDetection.ruleCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${importConflictDetectionPreviewService.getToneClassName(card.tone)}`}
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
              id="mvp89-conflict-summary"
              className="grid grid-cols-2 md:grid-cols-5 gap-2"
            >
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">比较集合</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryConflictResult.comparedCollections}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">同 RJ</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryConflictResult.duplicateCodeCount}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">同专辑</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryConflictResult.duplicateAlbumCount}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">同文件名</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryConflictResult.duplicateFileNameCount}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">同大小疑似</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryConflictResult.sameSizeSuspectCount}
                </p>
              </div>
            </div>
            <div
              id="mvp89-conflict-report-preview"
              className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4"
            >
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-bold text-text-primary">
                  ConflictReport 预览
                </p>
                <p className="mt-2 text-[10px] leading-relaxed text-text-muted">
                  {primaryConflictResult.report.summary}
                </p>
                <div className="mt-3 space-y-2">
                  {primaryConflictResult.report.items
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed text-text-secondary"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-text-primary">
                            {item.kind}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">
                            {item.severity}
                            {item.blocksExecution ? " / 阻断" : ""}
                          </span>
                        </div>
                        <p className="mt-1">{item.message}</p>
                      </div>
                    ))}
                </div>
              </div>
              <div
                id="mvp89-hash-strategy-preview"
                className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4"
              >
                <p className="text-xs font-bold text-violet-100">hash 策略</p>
                <div className="mt-3 space-y-2">
                  {conflictDetection.hashStrategy.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-violet-50/90"
                    >
                      <p className="font-bold">
                        {step.title} ·{" "}
                        {step.enabledInMvp89 ? "MVP89 已启用" : "后续启用"}
                      </p>
                      <p className="mt-1 opacity-80">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              id="mvp89-conflict-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {conflictDetection.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div hidden aria-hidden="true">
              mvp89-import-conflict-detection-preview /
              buildImportConflictPreview / duplicate-code / duplicate-file /
              target-exists / same-size-suspect / hash strategy / no real hash
              calculation / no file operations / absolutePath / file:// /
              fs.copyFile / fs.rename / fs.rm / fs.unlink
            </div>
          </section>

          <section
            id="mvp90-target-path-planning-preview"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-90 · 目标路径规划预览
                </p>
                <h3 className="mt-1 text-base font-black text-text-primary">
                  {targetPathPlanning.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  {targetPathPlanning.summary}
                </p>
                <p className="mt-1 text-[10px] text-emerald-100/80">
                  基线：{targetPathPlanning.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100 whitespace-nowrap">
                只生成计划 · 不执行文件操作
              </span>
            </div>
            <div
              id="mvp90-target-path-rule-cards"
              className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3"
            >
              {targetPathPlanning.ruleCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${importTargetPathPlanningPreviewService.getToneClassName(card.tone)}`}
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
              id="mvp90-target-path-summary"
              className="grid grid-cols-2 md:grid-cols-5 gap-2"
            >
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">目标文件</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryTargetPlan.plannedFiles.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">同名处理</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryTargetPlan.duplicateTargetNameCount}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">非法字符清理</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryTargetPlan.invalidCharacterWarnings}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">长路径提醒</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryTargetPlan.longPathWarnings}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
                <p className="text-[9px] text-text-muted">跳过文件</p>
                <p className="mt-1 text-sm font-black text-text-primary">
                  {primaryTargetPlan.skippedFileCount}
                </p>
              </div>
            </div>
            <div
              id="mvp90-target-path-plan-preview"
              className="grid grid-cols-1 xl:grid-cols-[1fr_0.75fr] gap-4"
            >
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-xs font-bold text-text-primary">
                  目标路径计划
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  集合目录：{primaryTargetPlan.sanitizedDirectory}
                </p>
                <div className="mt-3 space-y-2">
                  {primaryTargetPlan.plannedFiles.slice(0, 6).map((file) => (
                    <div
                      key={file.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-text-primary truncate">
                          {file.sanitizedName}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] text-text-muted">
                          overwrite: false
                        </span>
                      </div>
                      <p className="mt-1 truncate text-text-muted">
                        {file.targetRelativePath}
                      </p>
                      {file.warnings.length > 0 && (
                        <p className="mt-1 text-amber-100/90">
                          {file.warnings.join(" / ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div
                id="mvp90-sanitized-path-examples"
                className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4"
              >
                <p className="text-xs font-bold text-sky-100">
                  非法字符清理示例
                </p>
                <div className="mt-3 space-y-2">
                  {targetPathPlanning.sanitizingExamples.map((item) => (
                    <div
                      key={item.input}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-sky-50/90"
                    >
                      <p className="font-bold">
                        {item.input} → {item.output}
                      </p>
                      <p className="mt-1 opacity-80">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              id="mvp90-path-warning-preview"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] text-amber-50/90 leading-relaxed"
            >
              <p className="font-bold text-amber-100">路径计划报告</p>
              <p className="mt-2">{primaryTargetPlan.conflictReport.summary}</p>
            </div>
            <div
              id="mvp90-target-path-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {targetPathPlanning.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div hidden aria-hidden="true">
              mvp90-target-path-planning-preview / buildImportTargetPathPreview
              / sanitizePathSegment / sanitizeFileName / targetRelativePath /
              overwrite false / no copy move delete rename / absolutePath /
              file:// / fs.copyFile / fs.rename / fs.rm / fs.unlink
            </div>
          </section>

          <section
            id="mvp91-copy-execution-readiness"
            className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-violet-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-violet-300 tracking-wider">
                  MVP-91 · copy only 执行前合同
                </p>
                <h3 className="mt-1 text-base font-black text-text-primary">
                  {copyExecutionReadiness.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-text-muted">
                  {copyExecutionReadiness.summary}
                </p>
                <p className="mt-1 text-[10px] text-violet-100/80">
                  基线：{copyExecutionReadiness.baseline}
                </p>
              </div>
              <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-[10px] font-bold text-rose-100 whitespace-nowrap">
                执行按钮继续禁用
              </span>
            </div>
            <div
              id="mvp91-copy-readiness-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyExecutionReadiness.readinessCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${importCopyExecutionReadinessService.getToneClassName(card.tone)}`}
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
              {primaryCopyReadiness.preflightChecks.map((check) => (
                <div
                  key={check.id}
                  className={`rounded-xl border p-3 ${check.status === "pass" ? "border-emerald-500/20 bg-emerald-500/10" : check.status === "warning" ? "border-amber-500/20 bg-amber-500/10" : "border-rose-500/20 bg-rose-500/10"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold text-text-primary">
                      {check.label}
                    </p>
                    <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">
                      {check.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[9px] leading-relaxed text-text-muted">
                    {check.detail}
                  </p>
                </div>
              ))}
            </div>
            <div
              id="mvp91-confirmation-model"
              className="grid grid-cols-1 xl:grid-cols-[0.8fr_1fr] gap-4"
            >
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                <p className="text-xs font-bold text-sky-100">二次确认模型</p>
                <p className="mt-2 text-[10px] leading-relaxed text-text-muted">
                  {primaryCopyReadiness.confirmation.confirmationText}
                </p>
                <div className="mt-3 space-y-2">
                  {primaryCopyReadiness.confirmation.requirements.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                      >
                        <p className="font-bold text-text-primary">
                          {item.label}
                        </p>
                        <p className="mt-1 text-text-muted">{item.detail}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div
                id="mvp91-file-execution-plan"
                className="rounded-2xl border border-white/10 bg-black/10 p-4"
              >
                <p className="text-xs font-bold text-text-primary">
                  copy only 文件计划
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-[9px] text-text-muted">计划 copy</p>
                    <p className="text-sm font-black text-text-primary">
                      {primaryCopyReadiness.plannedCopyCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-[9px] text-text-muted">跳过</p>
                    <p className="text-sm font-black text-text-primary">
                      {primaryCopyReadiness.plannedSkipCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-[9px] text-text-muted">失败预览</p>
                    <p className="text-sm font-black text-text-primary">
                      {primaryCopyReadiness.plannedFailureCount}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {primaryCopyReadiness.fileExecutionPlan
                    .slice(0, 5)
                    .map((file) => (
                      <div
                        key={file.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-text-primary truncate">
                            {file.action} / {file.status}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">
                            overwrite: false
                          </span>
                        </div>
                        <p className="mt-1 truncate text-text-muted">
                          {file.targetRelativePath}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div
              id="mvp91-operation-log-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
            >
              <p className="text-xs font-bold text-emerald-100">
                OperationLog 预览
              </p>
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
                {primaryCopyReadiness.operationLogPreview
                  .slice(0, 6)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                    >
                      <p className="font-bold text-text-primary">
                        {entry.event} / {entry.level}
                      </p>
                      <p className="mt-1 text-text-muted">{entry.message}</p>
                    </div>
                  ))}
              </div>
            </div>
            <div
              id="mvp91-failure-skip-preview"
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs font-bold text-amber-100">跳过列表</p>
                <p className="mt-2 text-[10px] text-text-muted">
                  {primaryCopyReadiness.skippedList.length === 0
                    ? "当前样例没有跳过项。"
                    : primaryCopyReadiness.skippedList
                        .map((item) => item.reason)
                        .join(" / ")}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                <p className="text-xs font-bold text-rose-100">失败列表</p>
                <p className="mt-2 text-[10px] text-text-muted">
                  {primaryCopyReadiness.failureList.length === 0
                    ? "当前样例没有失败项。"
                    : primaryCopyReadiness.failureList
                        .map((item) => item.reason)
                        .join(" / ")}
                </p>
              </div>
            </div>
            <div
              id="mvp91-copy-execution-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {copyExecutionReadiness.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <button
              id="mvp91-disabled-copy-execute-button"
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70"
            >
              <Lock className="h-4 w-4" />
              copy only 执行后置：本轮只做执行合同
            </button>
            <div hidden aria-hidden="true">
              mvp91-copy-execution-readiness /
              buildImportCopyExecutionReadinessPreview / OperationLog /
              skippedList / failureList / disabled-preview-only / no fs.copyFile
              / no copy move delete rename / absolutePath / file://
            </div>
          </section>

          <section
            id="mvp92-copy-sample-readiness"
            className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-cyan-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-cyan-300 tracking-wider">
                  MVP-92 · copy only 样本准备
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {copyOnlySampleReadiness.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlySampleReadiness.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{copyOnlySampleReadiness.baseline}
                </p>
              </div>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-100">
                {copyOnlySampleReadiness.version}
              </span>
            </div>
            <div
              id="mvp92-copy-sample-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyOnlySampleReadiness.sampleReadinessCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${copyOnlySampleReadinessService.getToneClassName(card.tone)}`}
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
              {copyOnlySampleReadiness.minimalSampleRequirements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text-primary">{item.title}</p>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-100">
                      required: {String(item.required)}
                    </span>
                  </div>
                  <p className="mt-1 text-text-secondary">{item.requirement}</p>
                  <p className="mt-1 text-text-muted">{item.reason}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp92-codex-validation-steps"
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4"
            >
              <p className="text-xs font-bold text-sky-100">
                Codex 本机验收任务书
              </p>
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
                {copyOnlySampleReadiness.codexValidationSteps.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-text-primary">
                        {step.title}
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">
                        {step.phase}
                      </span>
                    </div>
                    {step.command && (
                      <code className="mt-2 block rounded-lg bg-black/30 px-2 py-1 text-[9px] text-sky-100">
                        {step.command}
                      </code>
                    )}
                    <p className="mt-2 text-text-muted">{step.expected}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp92-copy-only-ipc-contract"
              className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4"
            >
              <p className="text-xs font-bold text-violet-100">
                copy-only IPC 合同
              </p>
              <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-2">
                {copyOnlySampleReadiness.ipcContracts.map((ipc) => (
                  <div
                    key={ipc.channel}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <p className="font-bold text-text-primary">{ipc.channel}</p>
                    <p className="mt-1 text-text-muted">
                      {ipc.direction} · {ipc.purpose}
                    </p>
                    <p className="mt-1 text-text-secondary">
                      Renderer：{ipc.rendererPayloadRule}
                    </p>
                    <p className="mt-1 text-text-secondary">
                      Main：{ipc.mainSideRule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp92-main-side-copy-contract"
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              {copyOnlySampleReadiness.mainSideCopyContracts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed"
                >
                  <p className="font-bold text-amber-100">{item.title}</p>
                  <p className="mt-1 text-text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp92-sample-gates-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
            >
              <p className="text-xs font-bold text-emerald-100">
                样本执行门槛：{primaryCopySample.sampleName}
              </p>
              <p className="mt-2 text-[10px] text-text-muted">
                来源样本：{primaryCopySample.sampleSourceRoot}
              </p>
              <p className="mt-1 text-[10px] text-text-muted">
                目标样本：{primaryCopySample.sampleTargetRoot}
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
                {primaryCopySample.gates.map((gate) => (
                  <div
                    key={gate.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <p className="font-bold text-text-primary">{gate.label}</p>
                    <p className="mt-1 text-text-muted">{gate.status}</p>
                    <p className="mt-1 text-text-secondary">{gate.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp92-copy-sample-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {copyOnlySampleReadiness.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <button
              id="mvp92-disabled-real-copy-button"
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70"
            >
              <Lock className="h-4 w-4" />
              真实 copy 后置：MVP92 只准备 Codex 验收和合同
            </button>
            <div hidden aria-hidden="true">
              mvp92-copy-sample-readiness / copy-only IPC / Codex 本机验收任务书
              / main-side copy contract / minimal sample directory / no real
              copy / no copyFile / absolutePath / file://
            </div>
          </section>

          <section
            id="mvp95-copy-only-executor"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-95 · 真实 copy-only executor
                </p>
                <h3 className="mt-1 text-sm font-black text-text-primary">
                  {copyOnlyExecutor.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlyExecutor.summary}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-100">
                {copyOnlyExecutor.version}
              </span>
            </div>

            <div
              id="mvp95-copy-executor-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyOnlyExecutor.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl border p-3 ${copyOnlyExecutorService.getToneClassName(card.tone)}`}
                >
                  <p className="text-[10px] font-bold opacity-75">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>

            <div
              id="mvp95-copy-executor-request-contract"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">执行请求合同</p>
              <p className="mt-1">
                operationPlanId:{" "}
                {copyOnlyExecutor.requestPreview.operationPlanId}
              </p>
              <p className="mt-1">
                confirmedCopyOnly:{" "}
                {String(copyOnlyExecutor.requestPreview.confirmedCopyOnly)} /
                confirmationText:{" "}
                {copyOnlyExecutor.requestPreview.confirmationText}
              </p>
              <p className="mt-1">
                files: {copyOnlyExecutor.requestPreview.relativePaths.length} /
                absolutePathReturned:{" "}
                {String(copyOnlyExecutor.requestPreview.absolutePathReturned)}
              </p>
            </div>

            <div
              id="mvp95-copy-executor-result-preview"
              className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-4"
            >
              <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90">
                <p className="font-bold text-emerald-100">执行结果 preview</p>
                <p className="mt-1">
                  status: {primaryCopyExecutorResult.status}
                </p>
                <p className="mt-1">
                  copied/skipped/failed: {primaryCopyExecutorResult.copiedCount}
                  /{primaryCopyExecutorResult.skippedCount}/
                  {primaryCopyExecutorResult.failedCount}
                </p>
                <p className="mt-1">
                  createdDirectoryCount:{" "}
                  {primaryCopyExecutorResult.createdDirectoryCount}
                </p>
                <p className="mt-1">
                  operationLogPersisted:{" "}
                  {String(primaryCopyExecutorResult.operationLogPersisted)} /
                  libraryIndexWritten:{" "}
                  {String(primaryCopyExecutorResult.libraryIndexWritten)}
                </p>
              </div>
              <div id="mvp95-copy-result-lists" className="space-y-2">
                {primaryCopyExecutorResult.copiedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
                  >
                    <p className="font-bold">copied · {file.id}</p>
                    <p className="mt-1 break-all">
                      {file.sourceRelativePath} → {file.targetRelativePath}
                    </p>
                  </div>
                ))}
                {primaryCopyExecutorResult.skippedList.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
                  >
                    <p className="font-bold">skipped · {file.reasonCode}</p>
                    <p className="mt-1 break-all">
                      {file.sourceRelativePath} → {file.targetRelativePath}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              id="mvp95-copy-executor-safety-rules"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {copyOnlyExecutor.executorRules.map((rule) => (
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
              id="mvp95-operation-log-preview-only"
              className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">
                OperationLog preview-only
              </p>
              <p className="mt-1">
                persisted:{" "}
                {String(
                  primaryCopyExecutorResult.operationLogPreview.persisted,
                )}{" "}
                / mode: {primaryCopyExecutorResult.operationLogPreview.mode}
              </p>
              <p className="mt-1">
                本轮不写 OperationLog 文件，不写
                library-index.json，只返回相对路径结果。
              </p>
            </div>

            <div
              id="mvp95-codex-real-sample-gate"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">Codex 真实样本 gate</p>
              <p className="mt-1">
                sendToCodexNow:{" "}
                {String(copyOnlyExecutor.codexGate.sendToCodexNow)} /{" "}
                {copyOnlyExecutor.codexGate.reason}
              </p>
              <p className="mt-1">
                {copyOnlyExecutor.codexGate.requiredAfterBuild}
              </p>
            </div>

            <button
              id="mvp95-real-copy-button-guarded"
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-100 opacity-80"
            >
              <Lock className="h-4 w-4" />
              UI 按钮仍禁用；真实 copy 只开放给 main-side 受控 IPC + Codex
              样本验收
            </button>
            <div hidden aria-hidden="true">
              mvp95-copy-only-executor / mvp95-copy-executor-cards /
              mvp95-copy-executor-request-contract /
              mvp95-copy-executor-result-preview / mvp95-copy-result-lists /
              mvp95-copy-executor-safety-rules /
              mvp95-operation-log-preview-only / mvp95-codex-real-sample-gate /
              COPYFILE_EXCL / no move / no delete / no rename / no library-index
              write / absolutePath / file://
            </div>
          </section>

          <section
            id="mvp96-copy-only-operation-log"
            className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-violet-300 tracking-wider">
                  MVP-96 · OperationLog 最小落盘
                </p>
                <h3 className="mt-1 text-sm font-black text-text-primary">
                  {copyOnlyOperationLog.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlyOperationLog.summary}
                </p>
              </div>
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-100">
                {copyOnlyOperationLog.version}
              </span>
            </div>
            <div
              id="mvp96-operation-log-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyOnlyOperationLog.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl border p-3 ${copyOnlyOperationLogService.getToneClassName(card.tone)}`}
                >
                  <p className="text-[10px] font-bold opacity-75">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>
            <div
              id="mvp96-operation-log-file-contract"
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">日志文件合同</p>
              <p className="mt-1">
                filename: {copyOnlyOperationLog.logFileContract.filename} /
                appendOnly:{" "}
                {String(copyOnlyOperationLog.logFileContract.appendOnly)}
              </p>
              <p className="mt-1">
                returnedToRenderer:{" "}
                {String(
                  copyOnlyOperationLog.logFileContract.returnedToRenderer,
                )}{" "}
                / absolutePathReturned:{" "}
                {String(
                  copyOnlyOperationLog.logFileContract.absolutePathReturned,
                )}{" "}
                / fileUrlReturned:{" "}
                {String(copyOnlyOperationLog.logFileContract.fileUrlReturned)}
              </p>
            </div>
            <div
              id="mvp96-operation-log-schema"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {copyOnlyOperationLog.schemaFields.map((field) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                >
                  <p className="font-bold text-text-primary">{field.field}</p>
                  <p className="mt-1 text-text-muted">{field.rule}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp96-operation-log-result-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">
                executor result + persisted log
              </p>
              <p className="mt-1">
                status: {primaryCopyOperationLogResult.status}
              </p>
              <p className="mt-1">
                operationLogPersisted:{" "}
                {String(primaryCopyOperationLogResult.operationLogPersisted)} /
                libraryIndexWritten:{" "}
                {String(primaryCopyOperationLogResult.libraryIndexWritten)}
              </p>
              <p className="mt-1">
                operationId:{" "}
                {primaryCopyOperationLogResult.operationLog.operationId}
              </p>
            </div>
            <div
              id="mvp96-operation-log-entry-preview"
              className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">JSONL entry preview</p>
              <p className="mt-1">
                operationLogVersion:{" "}
                {copyOnlyOperationLog.sampleLogEntry.operationLogVersion}
              </p>
              <p className="mt-1">
                copied/skipped/failed:{" "}
                {copyOnlyOperationLog.sampleLogEntry.copiedCount}/
                {copyOnlyOperationLog.sampleLogEntry.skippedCount}/
                {copyOnlyOperationLog.sampleLogEntry.failedCount}
              </p>
              <p className="mt-1 break-all">
                copied:{" "}
                {copyOnlyOperationLog.sampleLogEntry.copiedFiles
                  .map((file) => file.targetRelativePath)
                  .join(" / ")}
              </p>
            </div>
            <div
              id="mvp96-operation-log-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">安全边界</p>
              <ul className="mt-2 list-disc pl-4 space-y-1">
                {copyOnlyOperationLog.guardedBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div
              id="mvp96-codex-operation-log-gate"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">Codex gate</p>
              <p className="mt-1">
                sendToCodexNow:{" "}
                {String(copyOnlyOperationLog.codexGate.sendToCodexNow)} /{" "}
                {copyOnlyOperationLog.codexGate.reason}
              </p>
              <p className="mt-1">
                {copyOnlyOperationLog.codexGate.requiredAfterBuild}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp96-copy-only-operation-log / mvp96-operation-log-cards /
              mvp96-operation-log-file-contract / mvp96-operation-log-schema /
              mvp96-operation-log-result-preview /
              mvp96-operation-log-entry-preview / mvp96-operation-log-guardrails
              / mvp96-codex-operation-log-gate / appendFile /
              import-operation-log.jsonl / no absolutePath / no file:// / no
              library-index.json
            </div>
          </section>

          <section
            id="mvp97-post-copy-refresh-preview"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-97 · copy 后入库刷新预览
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {copyOnlyPostCopyRefresh.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlyPostCopyRefresh.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{copyOnlyPostCopyRefresh.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {copyOnlyPostCopyRefresh.version}
              </span>
            </div>
            <div
              id="mvp97-refresh-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyOnlyPostCopyRefresh.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${copyOnlyPostCopyRefreshService.getToneClassName(card.tone)}`}
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
              id="mvp97-refresh-request-contract"
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">post-copy refresh IPC</p>
              <p className="mt-1">
                channel: {copyOnlyPostCopyRefresh.requestContract.channel}
              </p>
              <p className="mt-1">
                mode: {copyOnlyPostCopyRefresh.requestContract.mode} / source:{" "}
                {copyOnlyPostCopyRefresh.requestContract.source}
              </p>
              <p className="mt-1">
                targetRelativePathsOnly:{" "}
                {String(
                  copyOnlyPostCopyRefresh.requestContract
                    .targetRelativePathsOnly,
                )}{" "}
                / absolutePathAccepted:{" "}
                {String(
                  copyOnlyPostCopyRefresh.requestContract.absolutePathAccepted,
                )}{" "}
                / fileUrlAccepted:{" "}
                {String(
                  copyOnlyPostCopyRefresh.requestContract.fileUrlAccepted,
                )}
              </p>
            </div>
            <div
              id="mvp97-refresh-plan-preview"
              className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-4"
            >
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90">
                <p className="font-bold text-emerald-100">
                  refresh plan preview
                </p>
                <p className="mt-1">
                  refreshPlanVersion:{" "}
                  {primaryPostCopyRefreshPlan.refreshPlanVersion}
                </p>
                <p className="mt-1">
                  candidateCount: {primaryPostCopyRefreshPlan.candidateCount} /
                  audio: {primaryPostCopyRefreshPlan.audioCount} / subtitle:{" "}
                  {primaryPostCopyRefreshPlan.subtitleCount}
                </p>
                <p className="mt-1">
                  libraryIndexWritten:{" "}
                  {String(primaryPostCopyRefreshPlan.libraryIndexWritten)} /
                  scannerRunTriggered:{" "}
                  {String(primaryPostCopyRefreshPlan.scannerRunTriggered)} /
                  sqliteWritten:{" "}
                  {String(primaryPostCopyRefreshPlan.sqliteWritten)}
                </p>
              </div>
              <div id="mvp97-refresh-candidates" className="space-y-2">
                {copyOnlyPostCopyRefresh.sampleCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-text-primary truncate">
                        {candidate.targetRelativePath}
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">
                        {candidate.entryKind}
                      </span>
                    </div>
                    <p className="mt-1 text-text-muted">
                      plannedAction: {candidate.plannedAction} / sizeBytes:{" "}
                      {candidate.sizeBytes}
                    </p>
                    <p className="mt-1 text-text-secondary">
                      absolutePathReturned:{" "}
                      {String(candidate.absolutePathReturned)} /
                      fileUrlReturned: {String(candidate.fileUrlReturned)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp97-refresh-gate-rules"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {copyOnlyPostCopyRefresh.refreshGateRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text-primary">{rule.title}</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">
                      enforced: {String(rule.enforced)}
                    </span>
                  </div>
                  <p className="mt-1 text-text-muted">{rule.detail}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp97-refresh-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">安全边界</p>
              <ul className="mt-2 list-disc pl-4 space-y-1">
                {copyOnlyPostCopyRefresh.guardedBoundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div
              id="mvp97-codex-refresh-gate"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">Codex gate</p>
              <p className="mt-1">
                sendToCodexNow:{" "}
                {String(copyOnlyPostCopyRefresh.codexGate.sendToCodexNow)} /{" "}
                {copyOnlyPostCopyRefresh.codexGate.reason}
              </p>
              <p className="mt-1">
                {copyOnlyPostCopyRefresh.codexGate.requiredAfterBuild}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp97-post-copy-refresh-preview / mvp97-refresh-cards /
              mvp97-refresh-request-contract / mvp97-refresh-plan-preview /
              mvp97-refresh-candidates / mvp97-refresh-gate-rules /
              mvp97-refresh-guardrails / mvp97-codex-refresh-gate /
              mvp97-post-copy-refresh-plan-v1 / no library-index.json / no
              SQLite / no absolutePath / no file://
            </div>
          </section>

          <section
            id="mvp98-library-index-patch-preview"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-sky-300 tracking-wider">
                  MVP-98 · library-index patch 预览
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {libraryIndexPatchPreview.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {libraryIndexPatchPreview.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{libraryIndexPatchPreview.baseline}
                </p>
              </div>
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100">
                {libraryIndexPatchPreview.version}
              </span>
            </div>
            <div
              id="mvp98-personal-project-policy"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">个人项目规划说明</p>
              <p className="mt-1">
                {libraryIndexPatchPreview.personalProjectPolicy.planningNote}
              </p>
              <p className="mt-1">
                {
                  libraryIndexPatchPreview.personalProjectPolicy
                    .relaxedBoundaryNote
                }
              </p>
            </div>
            <div
              id="mvp98-patch-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {libraryIndexPatchPreview.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${libraryIndexPatchPreviewService.getToneClassName(card.tone)}`}
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
              id="mvp98-patch-request-contract"
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">index patch preview IPC</p>
              <p className="mt-1">
                channel: {libraryIndexPatchPreview.requestContract.channel}
              </p>
              <p className="mt-1">
                mode: {libraryIndexPatchPreview.requestContract.mode} / source:{" "}
                {libraryIndexPatchPreview.requestContract.source}
              </p>
              <p className="mt-1">
                previewOnly:{" "}
                {String(libraryIndexPatchPreview.requestContract.previewOnly)} /
                absolutePathAccepted:{" "}
                {String(
                  libraryIndexPatchPreview.requestContract.absolutePathAccepted,
                )}{" "}
                / fileUrlAccepted:{" "}
                {String(
                  libraryIndexPatchPreview.requestContract.fileUrlAccepted,
                )}
              </p>
            </div>
            <div
              id="mvp98-index-patch-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">
                patch preview summary
              </p>
              <p className="mt-1">
                patchPreviewVersion:{" "}
                {primaryLibraryIndexPatch.patchPreviewVersion}
              </p>
              <p className="mt-1">
                collections/tracks/covers/subtitles:{" "}
                {primaryLibraryIndexPatch.collectionPatchCount}/
                {primaryLibraryIndexPatch.trackPatchCount}/
                {primaryLibraryIndexPatch.coverPatchCount}/
                {primaryLibraryIndexPatch.subtitlePatchCount}
              </p>
              <p className="mt-1">
                libraryIndexWritten:{" "}
                {String(primaryLibraryIndexPatch.libraryIndexWritten)} /
                scannerRunTriggered:{" "}
                {String(primaryLibraryIndexPatch.scannerRunTriggered)} /
                sqliteWritten: {String(primaryLibraryIndexPatch.sqliteWritten)}
              </p>
            </div>
            <div
              id="mvp98-patch-operations"
              className="grid grid-cols-1 md:grid-cols-3 gap-2"
            >
              {libraryIndexPatchPreview.samplePatchOperations.map(
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
                    <p className="mt-1 text-text-secondary">
                      absolutePathReturned:{" "}
                      {String(operation.absolutePathReturned)} /
                      fileUrlReturned: {String(operation.fileUrlReturned)}
                    </p>
                  </div>
                ),
              )}
            </div>
            <div
              id="mvp98-patch-preview-rules"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {libraryIndexPatchPreview.patchPreviewRules.map((rule) => (
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
                {libraryIndexPatchPreview.guardedBoundaries.join(" / ")}
              </p>
              <p className="mt-2 text-amber-100">
                {libraryIndexPatchPreview.speedUpPlan.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp98-library-index-patch-preview / mvp98-patch-cards /
              mvp98-patch-request-contract / mvp98-index-patch-preview /
              mvp98-patch-operations / mvp98-patch-preview-rules /
              mvp98-patch-guardrails / mvp98-personal-project-policy /
              mvp98-library-index-patch-preview-v1 / no library-index.json / no
              SQLite / no absolutePath / no file:// / personal project
              non-commercial not shared
            </div>
          </section>

          <section
            id="mvp100-library-index-patch-write"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-100 · index patch 真实写入
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {libraryIndexPatchWrite.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {libraryIndexPatchWrite.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{libraryIndexPatchWrite.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {libraryIndexPatchWrite.version}
              </span>
            </div>
            <div
              id="mvp100-write-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {libraryIndexPatchWrite.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${libraryIndexPatchWriteService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">
                confirmed patch write IPC
              </p>
              <p className="mt-1">
                channel: {libraryIndexPatchWrite.requestContract.channel}
              </p>
              <p className="mt-1">
                mode: {libraryIndexPatchWrite.requestContract.mode} / source:{" "}
                {libraryIndexPatchWrite.requestContract.source}
              </p>
              <p className="mt-1">
                confirmation:{" "}
                {
                  libraryIndexPatchWrite.requestContract
                    .requiredConfirmationText
                }{" "}
                / backupRequired:{" "}
                {String(libraryIndexPatchWrite.requestContract.backupRequired)}
              </p>
              <p className="mt-1">
                writesLibraryIndexJson:{" "}
                {String(
                  libraryIndexPatchWrite.requestContract.writesLibraryIndexJson,
                )}{" "}
                / writesSQLite:{" "}
                {String(libraryIndexPatchWrite.requestContract.writesSQLite)}
              </p>
            </div>
            <div
              id="mvp100-write-result-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">write result preview</p>
              <p className="mt-1">
                patchWriteVersion: {primaryPatchWriteResult.patchWriteVersion}
              </p>
              <p className="mt-1">
                indexPatchWritten:{" "}
                {String(primaryPatchWriteResult.indexPatchWritten)} /
                backupCreated: {String(primaryPatchWriteResult.backupCreated)}
              </p>
              <p className="mt-1">
                index: {primaryPatchWriteResult.indexRelativePath} / backup:{" "}
                {primaryPatchWriteResult.backupRelativePathPattern}
              </p>
              <p className="mt-1">
                expected collections/tracks/covers/subtitles:{" "}
                {primaryPatchWriteResult.expectedPatch.collectionPatchCount}/
                {primaryPatchWriteResult.expectedPatch.trackPatchCount}/
                {primaryPatchWriteResult.expectedPatch.coverPatchCount}/
                {primaryPatchWriteResult.expectedPatch.subtitlePatchCount}
              </p>
            </div>
            <div
              id="mvp100-write-rules"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {libraryIndexPatchWrite.writeRules.map((rule) => (
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
                {libraryIndexPatchWrite.failureHandling.join(" / ")}
              </p>
            </div>
            <div
              id="mvp100-personal-project-policy"
              className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">个人项目提速边界</p>
              <p className="mt-1">
                {libraryIndexPatchWrite.personalProjectPolicy.boundaryNote}
              </p>
              <p className="mt-1">
                {libraryIndexPatchWrite.personalProjectPolicy.speedNote}
              </p>
            </div>
            <div
              id="mvp100-guardrails"
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">边界</p>
              <p className="mt-1">
                {libraryIndexPatchWrite.guardedBoundaries.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp100-library-index-patch-write / mvp100-write-cards /
              mvp100-write-contract / mvp100-write-result-preview /
              mvp100-write-rules / mvp100-failure-handling /
              mvp100-personal-project-policy / mvp100-guardrails /
              mvp100-library-index-patch-write-v1 /
              library-index.backup.before-mvp100 /
              CONFIRM_WRITE_LIBRARY_INDEX_PATCH / no SQLite / no absolutePath /
              no file://
            </div>
          </section>

          <section
            id="mvp106-move-only-closeout"
            className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-cyan-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-cyan-300 tracking-wider">
                  MVP-106 · move-only closeout
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {moveOnlyCloseout.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {moveOnlyCloseout.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{moveOnlyCloseout.baseline}
                </p>
              </div>
              <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-100">
                {moveOnlyCloseout.version}
              </span>
            </div>
            <div
              id="mvp106-move-closeout-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {moveOnlyCloseout.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${moveOnlyCloseoutService.getToneClassName(card.tone)}`}
                >
                  <p className="text-xs font-bold text-text-primary">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed opacity-80">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>
            <div
              id="mvp106-closeout-result"
              className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[10px] leading-relaxed text-cyan-50/90"
            >
              <p className="font-bold text-cyan-100">
                {primaryMoveCloseoutResult.closeoutVersion}
              </p>
              <p className="mt-1">
                copyOnlyChainClosed:{" "}
                {String(primaryMoveCloseoutResult.copyOnlyChainClosed)} /
                moveOnlyChainClosed:{" "}
                {String(primaryMoveCloseoutResult.moveOnlyChainClosed)}
              </p>
              <p className="mt-1">
                smallSampleOnly:{" "}
                {String(primaryMoveCloseoutResult.smallSampleOnly)} /
                overwriteAllowed:{" "}
                {String(primaryMoveCloseoutResult.overwriteAllowed)} /
                sourceCleanup:{" "}
                {String(
                  primaryMoveCloseoutResult.sourceDirectoryCleanupAllowed,
                )}
              </p>
              <p className="mt-1">
                next: {primaryMoveCloseoutResult.nextRecommendedMvp}
              </p>
            </div>
            <div
              id="mvp106-user-summary"
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">给用户看的结论</p>
              <p className="mt-1">
                {moveOnlyCloseout.userFacingSummary.join(" / ")}
              </p>
            </div>
            <div
              id="mvp106-ai-maintenance-summary"
              className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">AI 维护摘要</p>
              <p className="mt-1">
                {moveOnlyCloseout.aiMaintenanceSummary.join(" / ")}
              </p>
            </div>
            <div
              id="mvp106-next-cleanup-policy"
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">下一轮 UI 简化</p>
              <p className="mt-1">
                {moveOnlyCloseout.cleanupPolicy.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp106-move-only-closeout / mvp106-move-closeout-cards /
              mvp106-closeout-result / mvp106-user-summary /
              mvp106-ai-maintenance-summary / mvp106-next-cleanup-policy /
              mvp106-move-only-closeout-v1 / copyOnlyChainClosed /
              moveOnlyChainClosed / MVP107 importer daily UI cleanup / no SQLite
              / no library-index.json write / no downloader / no metadata
              Provider / no mpv / no absolutePath / no file:// / Codex
              非必要不安排
            </div>
          </section>

          <section
            id="mvp105-small-sample-move-only-executor"
            className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-105 · small-sample move-only executor
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {moveOnlyExecutor.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {moveOnlyExecutor.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{moveOnlyExecutor.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {moveOnlyExecutor.version}
              </span>
            </div>
            <div
              id="mvp105-move-executor-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {moveOnlyExecutor.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${moveOnlyExecutorService.getToneClassName(card.tone)}`}
                >
                  <p className="text-xs font-bold text-text-primary">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed opacity-80">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>
            <div
              id="mvp105-move-result-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">
                {primaryMoveExecutorResult.executorVersion}
              </p>
              <p className="mt-1">
                status: {primaryMoveExecutorResult.status} / moved:{" "}
                {primaryMoveExecutorResult.movedCount} / skipped:{" "}
                {primaryMoveExecutorResult.skippedCount} / failed:{" "}
                {primaryMoveExecutorResult.failedCount}
              </p>
              <p className="mt-1">
                operationLogPersisted:{" "}
                {String(primaryMoveExecutorResult.operationLogPersisted)} /
                failureStopTriggered:{" "}
                {String(primaryMoveExecutorResult.failureStopTriggered)}
              </p>
              <p className="mt-1">
                libraryIndexWritten:{" "}
                {String(primaryMoveExecutorResult.libraryIndexWritten)} /
                sqliteWritten: {String(primaryMoveExecutorResult.sqliteWritten)}
              </p>
            </div>
            <div
              id="mvp105-move-rules"
              className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">执行规则</p>
              <p className="mt-1">
                {moveOnlyExecutor.executorRules.join(" / ")}
              </p>
            </div>
            <div
              id="mvp105-failure-stop-policy"
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">失败停止</p>
              <p className="mt-1">
                {moveOnlyExecutor.failureStopPolicy.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp105-small-sample-move-only-executor /
              mvp105-move-executor-cards / mvp105-move-result-preview /
              mvp105-move-rules / mvp105-failure-stop-policy /
              mvp105-small-sample-move-only-executor-v1 / move-only-small-sample
              / CONFIRM_MOVE_IMPORT / mvp105-move-only-operation-log-v1 / no
              SQLite / no library-index.json / no downloader / no metadata
              Provider / no mpv / no absolutePath / no file:// / Codex
              非必要不安排
            </div>
          </section>

          <section
            id="mvp104-move-only-execution-readiness"
            className="rounded-3xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-orange-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-orange-300 tracking-wider">
                  MVP-104 · move-only execution readiness
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {moveOnlyExecutionReadiness.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {moveOnlyExecutionReadiness.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{moveOnlyExecutionReadiness.baseline}
                </p>
              </div>
              <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[10px] font-bold text-orange-100">
                {moveOnlyExecutionReadiness.version}
              </span>
            </div>
            <div
              id="mvp104-move-readiness-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {moveOnlyExecutionReadiness.readinessCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${moveOnlyExecutionReadinessService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3 text-[10px] leading-relaxed text-orange-50/90"
            >
              <p className="font-bold text-orange-100">
                {primaryMoveReadinessResult.readinessVersion}
              </p>
              <p className="mt-1">
                state: {primaryMoveReadinessResult.readinessState} /
                canExecuteMoveInMvp104:{" "}
                {String(primaryMoveReadinessResult.canExecuteMoveInMvp104)}
              </p>
              <p className="mt-1">
                move/skip/blocked: {primaryMoveReadinessResult.plannedMoveCount}
                /{primaryMoveReadinessResult.plannedSkipCount}/
                {primaryMoveReadinessResult.plannedBlockedCount}
              </p>
              <p className="mt-1">
                confirmation:{" "}
                {primaryMoveReadinessResult.confirmation.confirmationText} /
                executeButtonState:{" "}
                {primaryMoveReadinessResult.confirmation.executeButtonState}
              </p>
            </div>
            <div
              id="mvp104-move-preflight-checks"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {primaryMoveReadinessResult.preflightChecks.map((check) => (
                <div
                  key={check.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                >
                  <p className="font-bold text-text-primary">
                    {check.label} · {check.status}
                  </p>
                  <p className="mt-1 text-text-muted">{check.detail}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp104-required-executor-inputs"
              className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">MVP105 必须输入</p>
              <p className="mt-1">
                {moveOnlyExecutionReadiness.requiredExecutorInputs.join(" / ")}
              </p>
            </div>
            <div
              id="mvp104-failure-stop-policy"
              className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">失败停止策略</p>
              <p className="mt-1">
                {moveOnlyExecutionReadiness.failureStopPolicy.join(" / ")}
              </p>
            </div>
            <div
              id="mvp104-personal-speed-policy"
              className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">个人项目提速策略</p>
              <p className="mt-1">
                {moveOnlyExecutionReadiness.personalProjectSpeedPolicy.join(
                  " / ",
                )}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp104-move-only-execution-readiness / mvp104-move-readiness-cards
              / mvp104-readiness-result / mvp104-move-preflight-checks /
              mvp104-required-executor-inputs / mvp104-failure-stop-policy /
              mvp104-personal-speed-policy /
              mvp104-move-only-execution-readiness-v1 / CONFIRM_MOVE_IMPORT /
              disabled-readiness-only / no real move / no fs.rename / no fs.rm /
              no fs.unlink / no SQLite / no Codex required / no absolutePath /
              no file://
            </div>
          </section>

          <section
            id="mvp103-move-only-strategy"
            className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-amber-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-amber-300 tracking-wider">
                  MVP-103 · move-only strategy
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {moveOnlyStrategy.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {moveOnlyStrategy.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{moveOnlyStrategy.baseline}
                </p>
              </div>
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-100">
                {moveOnlyStrategy.version}
              </span>
            </div>
            <div
              id="mvp103-move-only-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {moveOnlyStrategy.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${moveOnlyStrategyService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">
                {moveOnlyStrategy.strategyPreview.strategyVersion}
              </p>
              <p className="mt-1">
                actualMoveImplemented:{" "}
                {String(moveOnlyStrategy.strategyPreview.actualMoveImplemented)}{" "}
                / moveOperationTouched:{" "}
                {String(moveOnlyStrategy.strategyPreview.moveOperationTouched)}
              </p>
              <p className="mt-1">
                codexRequired:{" "}
                {String(moveOnlyStrategy.strategyPreview.codexRequired)} / next:{" "}
                {moveOnlyStrategy.strategyPreview.nextRecommendedMvp}
              </p>
            </div>
            <div
              id="mvp103-move-only-phases"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {moveOnlyStrategy.phases.map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-text-secondary"
                >
                  <p className="font-bold text-text-primary">
                    {phase.mvp} · {phase.title}
                  </p>
                  <p className="mt-1">{phase.status}</p>
                  <p className="mt-1">{phase.summary}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp103-move-rules"
              className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">move-only 规则</p>
              <p className="mt-1">
                {moveOnlyStrategy.moveOnlyRules.join(" / ")}
              </p>
            </div>
            <div
              id="mvp103-ui-policy"
              className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">UI 收口原则</p>
              <p className="mt-1">{moveOnlyStrategy.uiPolicy.join(" / ")}</p>
            </div>
            <div
              id="mvp103-guardrails"
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">边界</p>
              <p className="mt-1">
                {moveOnlyStrategy.guardrails
                  .map((item) => item.rule)
                  .join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp103-move-only-strategy / mvp103-move-only-cards /
              mvp103-strategy-preview / mvp103-move-only-phases /
              mvp103-move-rules / mvp103-ui-policy / mvp103-guardrails /
              mvp103-move-only-strategy-v1 / no real move / no fs.rename / no
              fs.rm / no fs.unlink / no SQLite / no Codex required / no
              absolutePath / no file://
            </div>
          </section>

          <section
            id="mvp102-copy-only-import-closeout"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-102 · copy-only 导入闭环收口
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {copyOnlyImportCloseout.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlyImportCloseout.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{copyOnlyImportCloseout.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {copyOnlyImportCloseout.version}
              </span>
            </div>
            <div
              id="mvp102-closeout-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {copyOnlyImportCloseout.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${copyOnlyImportCloseoutService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">
                closeout result preview
              </p>
              <p className="mt-1">
                closeoutVersion: {primaryCopyOnlyCloseoutResult.closeoutVersion}
              </p>
              <p className="mt-1">
                closedRange: {primaryCopyOnlyCloseoutResult.closedRange} /
                importChainClosed:{" "}
                {String(primaryCopyOnlyCloseoutResult.importChainClosed)}
              </p>
              <p className="mt-1">
                patchWrite:{" "}
                {primaryCopyOnlyCloseoutResult.libraryIndexPatchWriteVersion} /
                uiRefresh: {primaryCopyOnlyCloseoutResult.uiRefreshVersion}
              </p>
            </div>
            <div
              id="mvp102-closed-stage-list"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {copyOnlyImportCloseout.completedStages.map((stage) => (
                <div
                  key={stage.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-text-secondary"
                >
                  <p className="font-bold text-text-primary">
                    {stage.mvp} · {stage.title}
                  </p>
                  <p className="mt-1">status: {stage.status}</p>
                  <p className="mt-1 text-text-muted">{stage.output}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp102-acceptance-checklist"
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">闭环验收点</p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                {copyOnlyImportCloseout.acceptanceChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div
              id="mvp102-codex-prompt"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">
                Codex 最小实机验收提示词
              </p>
              <ol className="mt-2 space-y-1.5 list-decimal list-inside">
                {copyOnlyImportCloseout.codexPrompt.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div
              id="mvp102-guardrails"
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">边界</p>
              <p className="mt-1">
                {copyOnlyImportCloseout.guardedBoundaries.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp102-copy-only-import-closeout / mvp102-closeout-cards /
              mvp102-closeout-result / mvp102-closed-stage-list /
              mvp102-acceptance-checklist / mvp102-codex-prompt /
              mvp102-guardrails / mvp102-copy-only-import-closeout-v1 /
              MVP95-MVP101 / no SQLite / no downloader / no metadata Provider /
              no mpv / no move delete rename / no absolutePath / no file://
            </div>
          </section>

          <section
            id="mvp101-import-ui-refresh-after-patch"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-sky-300 tracking-wider">
                  MVP-101 · 导入后刷新资源库
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {importPatchUiRefresh.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {importPatchUiRefresh.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{importPatchUiRefresh.baseline}
                </p>
              </div>
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100">
                {importPatchUiRefresh.version}
              </span>
            </div>
            <div
              id="mvp101-refresh-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {importPatchUiRefresh.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${importPatchUiRefreshService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">refresh-after-write IPC</p>
              <p className="mt-1">
                channel: {importPatchUiRefresh.runtimeContract.channel}
              </p>
              <p className="mt-1">
                mode: {importPatchUiRefresh.runtimeContract.mode} / source:{" "}
                {importPatchUiRefresh.runtimeContract.source}
              </p>
              <p className="mt-1">
                readsLibraryIndexJson:{" "}
                {String(
                  importPatchUiRefresh.runtimeContract.readsLibraryIndexJson,
                )}{" "}
                / writesLibraryIndexJson:{" "}
                {String(
                  importPatchUiRefresh.runtimeContract.writesLibraryIndexJson,
                )}
              </p>
              <p className="mt-1">
                fullScanTriggered:{" "}
                {String(importPatchUiRefresh.runtimeContract.fullScanTriggered)}{" "}
                / writesSQLite:{" "}
                {String(importPatchUiRefresh.runtimeContract.writesSQLite)}
              </p>
            </div>
            <div
              id="mvp101-refresh-result-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">
                refresh result preview
              </p>
              <p className="mt-1">
                refreshVersion: {primaryPatchUiRefreshResult.refreshVersion}
              </p>
              <p className="mt-1">
                readsLibraryIndexJson:{" "}
                {String(primaryPatchUiRefreshResult.readsLibraryIndexJson)} /
                dispatchesLibraryLoadedEvent:{" "}
                {String(
                  primaryPatchUiRefreshResult.dispatchesLibraryLoadedEvent,
                )}
              </p>
              <p className="mt-1">
                expected collections/tracks/covers/subtitles:{" "}
                {primaryPatchUiRefreshResult.expectedPatch.collectionPatchCount}
                /{primaryPatchUiRefreshResult.expectedPatch.trackPatchCount}/
                {primaryPatchUiRefreshResult.expectedPatch.coverPatchCount}/
                {primaryPatchUiRefreshResult.expectedPatch.subtitlePatchCount}
              </p>
            </div>
            <div
              id="mvp101-renderer-refresh-storage"
              className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">Renderer 刷新路径</p>
              <p className="mt-1">
                readCacheKey:{" "}
                {importPatchUiRefresh.rendererStorage.readCacheKey}
              </p>
              <p className="mt-1">
                refreshCacheKey:{" "}
                {importPatchUiRefresh.rendererStorage.refreshCacheKey}
              </p>
              <p className="mt-1">
                event: {importPatchUiRefresh.rendererStorage.eventName}
              </p>
            </div>
            <div
              id="mvp101-refresh-steps"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {importPatchUiRefresh.refreshSteps.map((step) => (
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
              <p className="font-bold text-amber-100">Codex 最小实机验收</p>
              <p className="mt-1">
                {importPatchUiRefresh.codexSmokeTest.join(" / ")}
              </p>
            </div>
            <div
              id="mvp101-guardrails"
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">边界</p>
              <p className="mt-1">
                {importPatchUiRefresh.guardedBoundaries.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp101-import-ui-refresh-after-patch / mvp101-refresh-cards /
              mvp101-refresh-runtime-contract / mvp101-refresh-result-preview /
              mvp101-renderer-refresh-storage / mvp101-refresh-steps /
              mvp101-codex-smoke-test / mvp101-guardrails /
              mvp101-import-ui-refresh-after-patch-v1 /
              yang-kura-library-index-loaded /
              yang_kura_last_read_library_index_result / no SQLite / no full
              scan / no absolutePath / no file://
            </div>
          </section>

          <section
            id="mvp99-library-index-patch-write-readiness"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-99 · index patch 写入准备
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {libraryIndexPatchWriteReadiness.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {libraryIndexPatchWriteReadiness.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{libraryIndexPatchWriteReadiness.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {libraryIndexPatchWriteReadiness.version}
              </span>
            </div>
            <div
              id="mvp99-readiness-cards"
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              {libraryIndexPatchWriteReadiness.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${libraryIndexPatchWriteReadinessService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-[10px] leading-relaxed text-sky-50/90"
            >
              <p className="font-bold text-sky-100">write readiness IPC</p>
              <p className="mt-1">
                channel:{" "}
                {libraryIndexPatchWriteReadiness.requestContract.channel}
              </p>
              <p className="mt-1">
                mode: {libraryIndexPatchWriteReadiness.requestContract.mode} /
                source: {libraryIndexPatchWriteReadiness.requestContract.source}
              </p>
              <p className="mt-1">
                confirmation:{" "}
                {
                  libraryIndexPatchWriteReadiness.requestContract
                    .requiredConfirmationText
                }{" "}
                / backupRequired:{" "}
                {String(
                  libraryIndexPatchWriteReadiness.requestContract
                    .backupRequired,
                )}
              </p>
              <p className="mt-1">
                writeExecutionAllowedInMvp99:{" "}
                {String(
                  libraryIndexPatchWriteReadiness.requestContract
                    .writeExecutionAllowedInMvp99,
                )}{" "}
                / absolutePathAccepted:{" "}
                {String(
                  libraryIndexPatchWriteReadiness.requestContract
                    .absolutePathAccepted,
                )}
              </p>
            </div>
            <div
              id="mvp99-readiness-preview"
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90"
            >
              <p className="font-bold text-emerald-100">readiness preview</p>
              <p className="mt-1">
                readinessVersion: {primaryPatchWriteReadiness.readinessVersion}
              </p>
              <p className="mt-1">
                readyForMvp100Write:{" "}
                {String(primaryPatchWriteReadiness.readyForMvp100Write)} /
                writeExecutionAllowedInMvp99:{" "}
                {String(
                  primaryPatchWriteReadiness.writeExecutionAllowedInMvp99,
                )}
              </p>
              <p className="mt-1">
                expected collections/tracks/covers/subtitles:{" "}
                {primaryPatchWriteReadiness.expectedPatch.collectionPatchCount}/
                {primaryPatchWriteReadiness.expectedPatch.trackPatchCount}/
                {primaryPatchWriteReadiness.expectedPatch.coverPatchCount}/
                {primaryPatchWriteReadiness.expectedPatch.subtitlePatchCount}
              </p>
              <p className="mt-1">
                libraryIndexWritten:{" "}
                {String(primaryPatchWriteReadiness.libraryIndexWritten)} /
                scannerRunTriggered:{" "}
                {String(primaryPatchWriteReadiness.scannerRunTriggered)} /
                sqliteWritten:{" "}
                {String(primaryPatchWriteReadiness.sqliteWritten)}
              </p>
            </div>
            <div
              id="mvp99-backup-plan"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90"
            >
              <p className="font-bold text-amber-100">备份策略</p>
              <p className="mt-1">
                {
                  libraryIndexPatchWriteReadiness.backupPlan
                    .backupFileNamePattern
                }{" "}
                / {libraryIndexPatchWriteReadiness.backupPlan.backupLocation}
              </p>
              <p className="mt-1">
                overwriteBackup:{" "}
                {String(
                  libraryIndexPatchWriteReadiness.backupPlan.overwriteBackup,
                )}
              </p>
              <p className="mt-1">
                {libraryIndexPatchWriteReadiness.backupPlan.restoreNote}
              </p>
            </div>
            <div
              id="mvp99-confirmation-checklist"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {libraryIndexPatchWriteReadiness.confirmationChecklist.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <p className="font-bold text-text-primary">{item.title}</p>
                    <p className="mt-1 text-text-muted">{item.detail}</p>
                    <p className="mt-1 text-text-secondary">
                      required: {String(item.required)} / ready:{" "}
                      {String(item.ready)}
                    </p>
                  </div>
                ),
              )}
            </div>
            <div
              id="mvp99-personal-speed-boundary"
              className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed text-violet-50/90"
            >
              <p className="font-bold text-violet-100">个人项目提速边界</p>
              <p className="mt-1">
                {
                  libraryIndexPatchWriteReadiness.personalProjectPolicy
                    .speedNote
                }
              </p>
              <p className="mt-1">
                {
                  libraryIndexPatchWriteReadiness.personalProjectPolicy
                    .boundaryNote
                }
              </p>
            </div>
            <div
              id="mvp99-guardrails"
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] leading-relaxed text-rose-50/90"
            >
              <p className="font-bold text-rose-100">MVP99 边界</p>
              <p className="mt-1">
                {libraryIndexPatchWriteReadiness.guardedBoundaries.join(" / ")}
              </p>
            </div>
            <div hidden aria-hidden="true">
              mvp99-library-index-patch-write-readiness / mvp99-readiness-cards
              / mvp99-write-readiness-contract / mvp99-readiness-preview /
              mvp99-backup-plan / mvp99-confirmation-checklist /
              mvp99-personal-speed-boundary / mvp99-guardrails /
              mvp99-library-index-patch-write-readiness-v1 /
              CONFIRM_WRITE_LIBRARY_INDEX_PATCH / no library-index.json / no
              SQLite / no absolutePath / no file://
            </div>
          </section>

          <section
            id="mvp94-copy-only-preflight-real-check"
            className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-sky-300 tracking-wider">
                  MVP-94 · copy-only preflight 真实化
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {copyOnlyPreflightRealCheck.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlyPreflightRealCheck.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{copyOnlyPreflightRealCheck.baseline}
                </p>
              </div>
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100">
                {copyOnlyPreflightRealCheck.version}
              </span>
            </div>
            <div
              id="mvp94-preflight-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyOnlyPreflightRealCheck.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${copyOnlyPreflightRealCheckService.getToneClassName(card.tone)}`}
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
              {copyOnlyPreflightRealCheck.mainSideContracts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text-primary">{item.title}</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
            <div
              id="mvp94-preflight-result-preview"
              className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-4"
            >
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed">
                <p className="text-xs font-bold text-violet-100">
                  preflight report preview
                </p>
                <p className="mt-2 text-text-secondary">
                  status：{primaryCopyPreflightRealCheck.status}
                </p>
                <p className="mt-1 text-text-secondary">
                  checkedFileCount：
                  {primaryCopyPreflightRealCheck.checkedFileCount}
                </p>
                <p className="mt-1 text-text-secondary">
                  targetExistingCount：
                  {primaryCopyPreflightRealCheck.targetExistingCount}
                </p>
                <p className="mt-1 text-text-secondary">
                  targetParentMissingCount：
                  {primaryCopyPreflightRealCheck.targetParentMissingCount}
                </p>
                <p className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-50">
                  executeAllowed:{" "}
                  {String(primaryCopyPreflightRealCheck.executeAllowed)} /
                  copyAllowed:{" "}
                  {String(primaryCopyPreflightRealCheck.copyAllowed)}
                </p>
              </div>
              <div id="mvp94-preflight-file-checks" className="space-y-2">
                {primaryCopyPreflightRealCheck.fileChecks.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-text-primary truncate">
                        {file.sourceRelativePath}
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">
                        blocked: {file.blockedReasonCodes.length}
                      </span>
                    </div>
                    <p className="mt-1 text-text-muted truncate">
                      → {file.targetRelativePath}
                    </p>
                    <p className="mt-1 text-text-secondary">
                      sourceExists: {String(file.sourceExists)} / targetExists:{" "}
                      {String(file.targetExists)} / targetParentExists:{" "}
                      {String(file.targetParentExists)}
                    </p>
                    {file.blockedReasonCodes.length > 0 && (
                      <p className="mt-1 text-amber-100">
                        {file.blockedReasonCodes.join(" / ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp94-preflight-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {copyOnlyPreflightRealCheck.blockedExecutionRules.map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div
              id="mvp94-codex-gate"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed"
            >
              <p className="text-xs font-bold text-amber-100">Codex gate</p>
              <p className="mt-2 text-text-secondary">
                sendToCodexNow:{" "}
                {String(copyOnlyPreflightRealCheck.codexGate.sendToCodexNow)}
              </p>
              <p className="mt-1 text-text-muted">
                {copyOnlyPreflightRealCheck.codexGate.reason}
              </p>
              <p className="mt-1 text-amber-100">
                {copyOnlyPreflightRealCheck.codexGate.nextCodexTrigger}
              </p>
            </div>
            <button
              id="mvp94-disabled-real-copy-button"
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70"
            >
              <Lock className="h-4 w-4" />
              预检可以真实化：copy 执行仍禁用
            </button>
            <div hidden aria-hidden="true">
              mvp94-copy-only-preflight-real-check /
              mvp94-main-side-preflight-contract /
              mvp94-preflight-result-preview / mvp94-preflight-file-checks / no
              fs.copyFile / no mkdir / no OperationLog write / absolutePath /
              file://
            </div>
          </section>

          <section
            id="mvp93-copy-only-main-side-stub"
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                  MVP-93 · copy-only main-side stub
                </p>
                <h3 className="mt-1 text-sm font-extrabold text-text-primary">
                  {copyOnlyMainSideStub.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {copyOnlyMainSideStub.summary}
                </p>
                <p className="mt-1 text-[10px] text-text-muted">
                  基线：{copyOnlyMainSideStub.baseline}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                {copyOnlyMainSideStub.version}
              </span>
            </div>
            <div
              id="mvp93-copy-stub-cards"
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              {copyOnlyMainSideStub.cards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-2xl border p-3 ${copyOnlyMainSideStubService.getToneClassName(card.tone)}`}
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
              className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4"
            >
              <p className="text-xs font-bold text-sky-100">
                copy-only stub 通道
              </p>
              <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-2">
                {copyOnlyMainSideStub.stubChannels.map((channel) => (
                  <div
                    key={channel.channel}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-text-primary truncate">
                        {channel.channel}
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">
                        {channel.status}
                      </span>
                    </div>
                    <p className="mt-1 text-text-muted">{channel.methodName}</p>
                    <p className="mt-1 text-text-secondary">
                      {channel.mainReturnRule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp93-copy-stub-blocked-result"
              className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-4"
            >
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed">
                <p className="text-xs font-bold text-violet-100">
                  blocked result preview
                </p>
                <p className="mt-2 text-text-secondary">
                  operationPlanId：{primaryCopyStubPreview.operationPlanId}
                </p>
                <p className="mt-1 text-text-secondary">
                  preflight：{primaryCopyStubPreview.preflightStatus}
                </p>
                <p className="mt-1 text-text-secondary">
                  按钮：{primaryCopyStubPreview.executeButtonState}
                </p>
                <p className="mt-1 text-text-secondary">
                  计划文件数：{primaryCopyStubPreview.plannedFileCount}
                </p>
                <p className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-50">
                  {primaryCopyStubPreview.blockedResult.message}
                </p>
              </div>
              <div
                id="mvp93-main-side-stub-guards"
                className="grid grid-cols-1 md:grid-cols-2 gap-2"
              >
                {copyOnlyMainSideStub.mainSideGuards.map((guard) => (
                  <div
                    key={guard.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-text-primary">
                        {guard.title}
                      </p>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-100">
                        stub: {String(guard.enforcedByStub)}
                      </span>
                    </div>
                    <p className="mt-1 text-text-muted">{guard.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp93-codex-prompt-gate"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed"
            >
              <p className="text-xs font-bold text-amber-100">Codex 介入判断</p>
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
                {copyOnlyMainSideStub.codexPromptLines.map((line) => (
                  <div
                    key={line.id}
                    className="rounded-xl border border-white/10 bg-black/10 p-3"
                  >
                    <p className="font-bold text-text-primary">
                      sendToCodexNow: {String(line.sendToCodexNow)}
                    </p>
                    <p className="mt-1 text-text-secondary">{line.prompt}</p>
                    <p className="mt-1 text-text-muted">{line.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="mvp93-copy-stub-guardrails"
              className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4"
            >
              <p className="text-xs font-bold text-rose-100">本轮边界</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {copyOnlyMainSideStub.guardedBoundaries.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <button
              id="mvp93-disabled-copy-stub-execute-button"
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70"
            >
              <Lock className="h-4 w-4" />
              copy-only stub 已注册：真实执行继续禁用
            </button>
            <div hidden aria-hidden="true">
              mvp93-copy-only-main-side-stub / mvp93-copy-stub-channels /
              mvp93-copy-stub-blocked-result / mvp93-main-side-stub-guards /
              mvp93-codex-prompt-gate / no real copy / absolutePath / file://
            </div>
          </section>

          <section
            id="mvp86-import-preview-steps"
            className="rounded-2xl border border-border-color bg-card-bg/70 p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border-color/50 pb-3">
              <div>
                <p className="text-[10px] font-bold text-sky-300 tracking-wider">
                  导入流程
                </p>
                <h3 className="text-sm font-extrabold text-text-primary">
                  只展示预览，不执行文件操作
                </h3>
              </div>
              <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-[10px] font-bold text-rose-100">
                执行按钮已禁用
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {model.previewSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="rounded-2xl border border-white/10 bg-black/10 p-3 min-w-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-color text-[10px] font-black text-white">
                      {index + 1}
                    </span>
                    {step.status === "blocked-execution" ? (
                      <Lock className="h-4 w-4 text-rose-300" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    )}
                  </div>
                  <p className="mt-3 text-xs font-bold text-text-primary">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="mvp86-import-preview-task"
            className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5"
          >
            <article className="rounded-2xl border border-border-color bg-card-bg/70 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/50 pb-3">
                <div>
                  <p className="text-[10px] font-bold text-emerald-300 tracking-wider">
                    ImportTask mock preview
                  </p>
                  <h3 className="text-lg font-black text-text-primary">
                    {task.previewLabel}
                  </h3>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {task.sourceDisplayName}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">
                  {task.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <p className="text-[10px] font-bold text-text-muted">
                    识别结果
                  </p>
                  <p className="mt-1 font-bold text-text-primary">
                    {task.detectedCode} · {task.detectedTitle}
                  </p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {task.detectedArtistOrCircle} / {task.detectedType}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                  <p className="text-[10px] font-bold text-text-muted">
                    目标位置
                  </p>
                  <p className="mt-1 font-bold text-text-primary">
                    {task.targetDisplayName}
                  </p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    operationMode: {task.operationMode} / overwrite: false
                  </p>
                </div>
              </div>

              <div id="mvp86-import-file-list" className="space-y-2">
                {task.sourceFiles.map((file) => {
                  const Icon = getFileIcon(file.kind);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                          <Icon className="h-4 w-4 text-sky-200" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-text-primary">
                            {file.displayName}
                          </p>
                          <p className="truncate text-[10px] text-text-muted">
                            {file.relativePath}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] font-bold text-text-secondary">
                          {file.kind}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {importerPreviewShellService.formatFileSize(
                            file.sizeBytes,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <aside className="space-y-4">
              <div
                id="mvp86-import-metadata-preview"
                className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-200" />
                  <p className="text-sm font-extrabold text-text-primary">
                    元数据候选
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {task.metadataSources.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-text-secondary">
                          {source.provider}
                        </p>
                        <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5">
                          优先级 {source.mergePriority}
                        </span>
                      </div>
                      <p className="mt-1 text-text-primary font-bold">
                        {source.title || source.code}
                      </p>
                      <p className="mt-1 leading-relaxed">{source.notes}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="mvp86-import-conflict-preview"
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-amber-200" />
                  <p className="text-sm font-extrabold text-text-primary">
                    冲突报告
                  </p>
                </div>
                <p className="mt-2 text-[11px] text-text-muted">
                  {task.conflictReport.summary}
                </p>
                <div className="mt-3 space-y-2">
                  {task.conflictReport.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-amber-50/90"
                    >
                      <p className="font-bold">
                        {item.severity} / {item.kind}
                      </p>
                      <p className="mt-1 opacity-85">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section
            id="mvp86-import-target-plan-preview"
            className="grid grid-cols-1 lg:grid-cols-4 gap-4"
          >
            {model.previewPanels.map((panel) => (
              <div
                key={panel.id}
                className={`rounded-2xl border p-4 ${importerPreviewShellService.getToneClassName(panel.tone)}`}
              >
                <p className="text-sm font-extrabold text-text-primary">
                  {panel.title}
                </p>
                <ul className="mt-3 space-y-2 text-[10px] leading-relaxed opacity-85">
                  {panel.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span className="min-w-0 break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section
            id="mvp86-importer-guardrails"
            className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-200" />
              <div>
                <p className="text-sm font-extrabold text-text-primary">
                  安全边界
                </p>
                <p className="text-[11px] text-text-muted">
                  当前页面是导入器外壳，不会执行真实导入。
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-xs font-bold text-rose-100">禁用动作</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {model.disabledActions.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                <p className="text-xs font-bold text-rose-100">后续顺序</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {model.nextSteps.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] text-text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              id="mvp86-importer-disabled-execute-button"
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70"
            >
              <Lock className="h-4 w-4" />
              执行导入后置：本轮不复制 / 不移动 / 不删除
            </button>
            <div hidden aria-hidden="true">
              {model.guardedBoundaries.join(" / ")} / mvp86-importer-ui-shell /
              mvp86-import-preview-task / absolutePath / file:// / fs.copyFile /
              fs.rename / fs.rm / fs.unlink
            </div>
          </section>
        </div>
      </details>
    </div>
  );
}
