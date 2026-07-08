import React, { useMemo } from 'react';
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
} from 'lucide-react';
import { importerPreviewShellService } from '../services/importerPreviewShellService';
import { rjImportReadOnlyDetectionService } from '../services/rjImportReadOnlyDetectionService';
import { musicImportReadOnlyDetectionService } from '../services/musicImportReadOnlyDetectionService';
import { importConflictDetectionPreviewService } from '../services/importConflictDetectionPreviewService';
import { importTargetPathPlanningPreviewService } from '../services/importTargetPathPlanningPreviewService';
import { importCopyExecutionReadinessService } from '../services/importCopyExecutionReadinessService';
import { copyOnlySampleReadinessService } from '../services/copyOnlySampleReadinessService';
import { copyOnlyMainSideStubService } from '../services/copyOnlyMainSideStubService';
import { copyOnlyPreflightRealCheckService } from '../services/copyOnlyPreflightRealCheckService';
import { copyOnlyExecutorService } from '../services/copyOnlyExecutorService';

function getFileIcon(kind: string) {
  switch (kind) {
    case 'audio':
      return FileAudio;
    case 'image':
      return FileImage;
    case 'subtitle':
    case 'text':
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
export default function ImporterPage() {
  const model = useMemo(() => importerPreviewShellService.getModel(), []);
  const rjDetection = useMemo(() => rjImportReadOnlyDetectionService.getModel(), []);
  const musicDetection = useMemo(() => musicImportReadOnlyDetectionService.getModel(), []);
  const conflictDetection = useMemo(() => importConflictDetectionPreviewService.getModel(), []);
  const targetPathPlanning = useMemo(() => importTargetPathPlanningPreviewService.getModel(), []);
  const copyExecutionReadiness = useMemo(() => importCopyExecutionReadinessService.getModel(), []);
  const copyOnlySampleReadiness = useMemo(() => copyOnlySampleReadinessService.getModel(), []);
  const copyOnlyMainSideStub = useMemo(() => copyOnlyMainSideStubService.getModel(), []);
  const copyOnlyPreflightRealCheck = useMemo(() => copyOnlyPreflightRealCheckService.getModel(), []);
  const copyOnlyExecutor = useMemo(() => copyOnlyExecutorService.getModel(), []);
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

  return (
    <div id="mvp86-importer-ui-shell" className="space-y-6 pb-24 animate-fade-in">
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-violet-500/10 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 left-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-100">
              <ArchiveRestore className="h-3.5 w-3.5" />
              <span>MVP-86 · 导入器预览页</span>
            </div>
            <h2 className="mt-4 text-2xl font-black text-text-primary tracking-tight">{model.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{model.summary}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">基线：{model.baseline}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 min-w-0 xl:min-w-[520px]" id="mvp86-importer-task-summary">
            {model.taskSummaryCards.map((card) => (
              <div key={card.id} className={`rounded-2xl border p-3 ${importerPreviewShellService.getToneClassName(card.tone)}`}>
                <p className="text-[10px] font-bold opacity-70">{card.label}</p>
                <p className="mt-1 text-xs font-extrabold text-text-primary truncate">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mvp86-import-source-options" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {model.sourceOptions.map((option) => {
          const Icon = option.id.includes('music') ? Music : FolderInput;
          return (
            <article key={option.id} className={`rounded-2xl border p-4 ${importerPreviewShellService.getToneClassName(option.tone)}`}>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-text-primary">{option.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed opacity-80">{option.description}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {option.accepted.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px]">{item}</span>
                ))}
              </div>
            </article>
          );
        })}
      </section>


      <section id="mvp87-rj-import-readonly-detection" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">MVP-87 · RJ 只读识别</p>
            <h3 className="mt-1 text-lg font-black text-text-primary">{rjDetection.title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">{rjDetection.summary}</p>
            <p className="mt-2 text-[10px] text-emerald-100/80">输入：{rjDetection.sampleInput.sourceDisplayName}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-0 lg:min-w-[360px]" id="mvp87-rj-import-category-counts">
            {rjDetection.sampleResult.categoryCounts.map((item) => (
              <div key={item.kind} className={`rounded-2xl border p-3 ${rjImportReadOnlyDetectionService.getToneClassName(item.tone)}`}>
                <p className="text-[10px] font-bold opacity-70">{item.label}</p>
                <p className="mt-1 text-lg font-black text-text-primary">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp87-rj-code-detection" className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">标准化 RJ</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary">{rjDetection.sampleResult.detectedCode || '未识别'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">识别目录</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary truncate">{rjDetection.sampleResult.detectedFolderName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">置信度</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary">{Math.round(rjDetection.sampleResult.confidence * 100)}%</p>
          </div>
        </div>
        <div id="mvp87-rj-detected-import-task" className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-bold text-text-primary">只读 ImportTask 预览</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-text-muted">
              <p>detectedType: <span className="font-bold text-text-secondary">{rjTask.detectedType}</span></p>
              <p>detectedTitle: <span className="font-bold text-text-secondary">{rjTask.detectedTitle}</span></p>
              <p>sourceRootToken: <span className="font-bold text-text-secondary">{rjTask.sourceRootToken}</span></p>
              <p>target: <span className="font-bold text-text-secondary">{rjTask.targetPlan.targetRelativeDirectory}</span></p>
            </div>
            <div id="mvp87-rj-readonly-file-classification" className="mt-3 space-y-2">
              {rjTask.sourceFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="truncate text-[11px] font-bold text-text-primary">{file.displayName}</span>
                  <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] text-text-muted">{file.kind}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4" id="mvp87-rj-readonly-warnings">
            <p className="text-xs font-bold text-text-primary">提醒 / 阻断</p>
            <p className="mt-2 text-[10px] text-text-muted">{rjTask.conflictReport.summary}</p>
            <div className="mt-3 space-y-2">
              {rjTask.conflictReport.items.length === 0 ? (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-100">示例目录没有阻断项。</p>
              ) : rjTask.conflictReport.items.map((item) => (
                <p key={item.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-amber-50/90">{item.severity}: {item.message}</p>
              ))}
            </div>
          </div>
        </div>
        <div id="mvp87-rj-import-readonly-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rjDetection.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <div className="sr-only">mvp87-rj-import-readonly-detection / normalizeRjCode / classifyImportRelativePath / sourceRootToken / relativePaths / absolutePath / file:// / fs.copyFile / fs.rename / fs.rm / fs.unlink</div>
      </section>

      <section id="mvp88-music-import-readonly-detection" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">MVP-88 · 音乐导入只读识别</p>
            <h3 className="mt-1 text-base font-black text-text-primary">{musicDetection.title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">{musicDetection.summary}</p>
            <p className="mt-1 text-[10px] text-sky-100/80">基线：{musicDetection.baseline}</p>
          </div>
          <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100 whitespace-nowrap">只读预览 · 不读标签</span>
        </div>
        <div id="mvp88-music-import-category-counts" className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {musicDetection.sampleResult.categoryCounts.map((item) => (
            <div key={item.kind} className="rounded-xl border border-white/10 bg-black/10 p-2 text-center">
              <p className="text-[9px] text-text-muted">{item.label}</p>
              <p className="mt-1 text-sm font-black text-text-primary">{item.count}</p>
            </div>
          ))}
        </div>
        <div id="mvp88-music-shape-detection" className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">识别类型</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary">{musicDetection.sampleResult.detectedType}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">艺术家</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary truncate">{musicDetection.sampleResult.detectedArtist || '未识别'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">专辑 / 集合</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary truncate">{musicDetection.sampleResult.detectedAlbum || musicDetection.sampleResult.detectedFolderName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-[10px] font-bold text-text-muted">置信度</p>
            <p className="mt-1 text-sm font-extrabold text-text-primary">{Math.round(musicDetection.sampleResult.confidence * 100)}%</p>
          </div>
        </div>
        <div id="mvp88-music-detected-import-task" className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-bold text-text-primary">音乐 ImportTask 预览</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-text-muted">
              <p>detectedType: <span className="font-bold text-text-secondary">{musicTask.detectedType}</span></p>
              <p>detectedTitle: <span className="font-bold text-text-secondary">{musicTask.detectedTitle}</span></p>
              <p>artist: <span className="font-bold text-text-secondary">{musicTask.detectedArtistOrCircle || '未识别'}</span></p>
              <p>target: <span className="font-bold text-text-secondary">{musicTask.targetPlan.targetRelativeDirectory}</span></p>
            </div>
            <div id="mvp88-music-readonly-file-classification" className="mt-3 space-y-2">
              {musicTask.sourceFiles.slice(0, 6).map((file) => (
                <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="truncate text-[11px] font-bold text-text-primary">{file.displayName}</span>
                  <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] text-text-muted">{file.kind}</span>
                </div>
              ))}
            </div>
          </div>
          <div id="mvp88-music-metadata-preview" className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-xs font-bold text-text-primary">元数据来源</p>
            <div className="mt-3 space-y-2">
              {musicTask.metadataSources.map((source) => (
                <div key={source.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text-secondary">{source.provider}</p>
                    <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5">优先级 {source.mergePriority}</span>
                  </div>
                  <p className="mt-1 leading-relaxed">{source.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="mvp88-music-protected-format-warning" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] text-rose-50/90 leading-relaxed">
          <p className="font-bold text-rose-100">受保护格式边界</p>
          <p className="mt-2">MVP88 只识别普通音频文件和受保护扩展名风险；不转换、不解密、不绕过网易云 / QQ 等平台保护格式。</p>
        </div>
        <div id="mvp88-music-readonly-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {musicDetection.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <div className="sr-only">mvp88-music-import-readonly-detection / inferArtistAlbumFromFolder / classifyMusicImportRelativePath / isProtectedMusicDownload / music-album / music-singles / relativePaths / no ID3 / absolutePath / file:// / fs.copyFile / fs.rename / fs.rm / fs.unlink</div>
      </section>

      <section id="mvp89-import-conflict-detection-preview" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-amber-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-amber-300 tracking-wider">MVP-89 · 冲突检测预览</p>
            <h3 className="mt-1 text-base font-black text-text-primary">{conflictDetection.title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">{conflictDetection.summary}</p>
            <p className="mt-1 text-[10px] text-amber-100/80">基线：{conflictDetection.baseline}</p>
          </div>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-100 whitespace-nowrap">只读冲突预览 · 不算真实 hash</span>
        </div>
        <div id="mvp89-conflict-rule-cards" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {conflictDetection.ruleCards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 ${importConflictDetectionPreviewService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold text-text-primary">{card.title}</p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp89-conflict-summary" className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">比较集合</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryConflictResult.comparedCollections}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">同 RJ</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryConflictResult.duplicateCodeCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">同专辑</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryConflictResult.duplicateAlbumCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">同文件名</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryConflictResult.duplicateFileNameCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">同大小疑似</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryConflictResult.sameSizeSuspectCount}</p>
          </div>
        </div>
        <div id="mvp89-conflict-report-preview" className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-bold text-text-primary">ConflictReport 预览</p>
            <p className="mt-2 text-[10px] leading-relaxed text-text-muted">{primaryConflictResult.report.summary}</p>
            <div className="mt-3 space-y-2">
              {primaryConflictResult.report.items.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed text-text-secondary">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-text-primary">{item.kind}</span>
                    <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">{item.severity}{item.blocksExecution ? ' / 阻断' : ''}</span>
                  </div>
                  <p className="mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div id="mvp89-hash-strategy-preview" className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-xs font-bold text-violet-100">hash 策略</p>
            <div className="mt-3 space-y-2">
              {conflictDetection.hashStrategy.map((step) => (
                <div key={step.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-violet-50/90">
                  <p className="font-bold">{step.title} · {step.enabledInMvp89 ? 'MVP89 已启用' : '后续启用'}</p>
                  <p className="mt-1 opacity-80">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="mvp89-conflict-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {conflictDetection.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <div className="sr-only">mvp89-import-conflict-detection-preview / buildImportConflictPreview / duplicate-code / duplicate-file / target-exists / same-size-suspect / hash strategy / no real hash calculation / no file operations / absolutePath / file:// / fs.copyFile / fs.rename / fs.rm / fs.unlink</div>
      </section>

      <section id="mvp90-target-path-planning-preview" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">MVP-90 · 目标路径规划预览</p>
            <h3 className="mt-1 text-base font-black text-text-primary">{targetPathPlanning.title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">{targetPathPlanning.summary}</p>
            <p className="mt-1 text-[10px] text-emerald-100/80">基线：{targetPathPlanning.baseline}</p>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100 whitespace-nowrap">只生成计划 · 不执行文件操作</span>
        </div>
        <div id="mvp90-target-path-rule-cards" className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {targetPathPlanning.ruleCards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 ${importTargetPathPlanningPreviewService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold text-text-primary">{card.title}</p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp90-target-path-summary" className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">目标文件</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryTargetPlan.plannedFiles.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">同名处理</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryTargetPlan.duplicateTargetNameCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">非法字符清理</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryTargetPlan.invalidCharacterWarnings}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">长路径提醒</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryTargetPlan.longPathWarnings}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/10 p-3 text-center">
            <p className="text-[9px] text-text-muted">跳过文件</p>
            <p className="mt-1 text-sm font-black text-text-primary">{primaryTargetPlan.skippedFileCount}</p>
          </div>
        </div>
        <div id="mvp90-target-path-plan-preview" className="grid grid-cols-1 xl:grid-cols-[1fr_0.75fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-bold text-text-primary">目标路径计划</p>
            <p className="mt-2 text-[10px] text-text-muted">集合目录：{primaryTargetPlan.sanitizedDirectory}</p>
            <div className="mt-3 space-y-2">
              {primaryTargetPlan.plannedFiles.slice(0, 6).map((file) => (
                <div key={file.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-text-primary truncate">{file.sanitizedName}</span>
                    <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px] text-text-muted">overwrite: false</span>
                  </div>
                  <p className="mt-1 truncate text-text-muted">{file.targetRelativePath}</p>
                  {file.warnings.length > 0 && <p className="mt-1 text-amber-100/90">{file.warnings.join(' / ')}</p>}
                </div>
              ))}
            </div>
          </div>
          <div id="mvp90-sanitized-path-examples" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
            <p className="text-xs font-bold text-sky-100">非法字符清理示例</p>
            <div className="mt-3 space-y-2">
              {targetPathPlanning.sanitizingExamples.map((item) => (
                <div key={item.input} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-sky-50/90">
                  <p className="font-bold">{item.input} → {item.output}</p>
                  <p className="mt-1 opacity-80">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="mvp90-path-warning-preview" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] text-amber-50/90 leading-relaxed">
          <p className="font-bold text-amber-100">路径计划报告</p>
          <p className="mt-2">{primaryTargetPlan.conflictReport.summary}</p>
        </div>
        <div id="mvp90-target-path-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {targetPathPlanning.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <div className="sr-only">mvp90-target-path-planning-preview / buildImportTargetPathPreview / sanitizePathSegment / sanitizeFileName / targetRelativePath / overwrite false / no copy move delete rename / absolutePath / file:// / fs.copyFile / fs.rename / fs.rm / fs.unlink</div>
      </section>

      <section id="mvp91-copy-execution-readiness" className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-violet-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-violet-300 tracking-wider">MVP-91 · copy only 执行前合同</p>
            <h3 className="mt-1 text-base font-black text-text-primary">{copyExecutionReadiness.title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">{copyExecutionReadiness.summary}</p>
            <p className="mt-1 text-[10px] text-violet-100/80">基线：{copyExecutionReadiness.baseline}</p>
          </div>
          <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-[10px] font-bold text-rose-100 whitespace-nowrap">执行按钮继续禁用</span>
        </div>
        <div id="mvp91-copy-readiness-cards" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {copyExecutionReadiness.readinessCards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 ${importCopyExecutionReadinessService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold text-text-primary">{card.title}</p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp91-copy-preflight-checks" className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {primaryCopyReadiness.preflightChecks.map((check) => (
            <div key={check.id} className={`rounded-xl border p-3 ${check.status === 'pass' ? 'border-emerald-500/20 bg-emerald-500/10' : check.status === 'warning' ? 'border-amber-500/20 bg-amber-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold text-text-primary">{check.label}</p>
                <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">{check.status}</span>
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-text-muted">{check.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp91-confirmation-model" className="grid grid-cols-1 xl:grid-cols-[0.8fr_1fr] gap-4">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
            <p className="text-xs font-bold text-sky-100">二次确认模型</p>
            <p className="mt-2 text-[10px] leading-relaxed text-text-muted">{primaryCopyReadiness.confirmation.confirmationText}</p>
            <div className="mt-3 space-y-2">
              {primaryCopyReadiness.confirmation.requirements.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                  <p className="font-bold text-text-primary">{item.label}</p>
                  <p className="mt-1 text-text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div id="mvp91-file-execution-plan" className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs font-bold text-text-primary">copy only 文件计划</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2"><p className="text-[9px] text-text-muted">计划 copy</p><p className="text-sm font-black text-text-primary">{primaryCopyReadiness.plannedCopyCount}</p></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2"><p className="text-[9px] text-text-muted">跳过</p><p className="text-sm font-black text-text-primary">{primaryCopyReadiness.plannedSkipCount}</p></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-2"><p className="text-[9px] text-text-muted">失败预览</p><p className="text-sm font-black text-text-primary">{primaryCopyReadiness.plannedFailureCount}</p></div>
            </div>
            <div className="mt-3 space-y-2">
              {primaryCopyReadiness.fileExecutionPlan.slice(0, 5).map((file) => (
                <div key={file.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] leading-relaxed">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-text-primary truncate">{file.action} / {file.status}</span>
                    <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[9px]">overwrite: false</span>
                  </div>
                  <p className="mt-1 truncate text-text-muted">{file.targetRelativePath}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div id="mvp91-operation-log-preview" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold text-emerald-100">OperationLog 预览</p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
            {primaryCopyReadiness.operationLogPreview.slice(0, 6).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <p className="font-bold text-text-primary">{entry.event} / {entry.level}</p>
                <p className="mt-1 text-text-muted">{entry.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp91-failure-skip-preview" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs font-bold text-amber-100">跳过列表</p>
            <p className="mt-2 text-[10px] text-text-muted">{primaryCopyReadiness.skippedList.length === 0 ? '当前样例没有跳过项。' : primaryCopyReadiness.skippedList.map((item) => item.reason).join(' / ')}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-xs font-bold text-rose-100">失败列表</p>
            <p className="mt-2 text-[10px] text-text-muted">{primaryCopyReadiness.failureList.length === 0 ? '当前样例没有失败项。' : primaryCopyReadiness.failureList.map((item) => item.reason).join(' / ')}</p>
          </div>
        </div>
        <div id="mvp91-copy-execution-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {copyExecutionReadiness.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <button id="mvp91-disabled-copy-execute-button" type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70">
          <Lock className="h-4 w-4" />
          copy only 执行后置：本轮只做执行合同
        </button>
        <div className="sr-only">mvp91-copy-execution-readiness / buildImportCopyExecutionReadinessPreview / OperationLog / skippedList / failureList / disabled-preview-only / no fs.copyFile / no copy move delete rename / absolutePath / file://</div>
      </section>


      <section id="mvp92-copy-sample-readiness" className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-cyan-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-cyan-300 tracking-wider">MVP-92 · copy only 样本准备</p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">{copyOnlySampleReadiness.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{copyOnlySampleReadiness.summary}</p>
            <p className="mt-1 text-[10px] text-text-muted">基线：{copyOnlySampleReadiness.baseline}</p>
          </div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-100">{copyOnlySampleReadiness.version}</span>
        </div>
        <div id="mvp92-copy-sample-cards" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {copyOnlySampleReadiness.sampleReadinessCards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 ${copyOnlySampleReadinessService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold text-text-primary">{card.title}</p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp92-minimal-sample-requirements" className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {copyOnlySampleReadiness.minimalSampleRequirements.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-text-primary">{item.title}</p>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-100">required: {String(item.required)}</span>
              </div>
              <p className="mt-1 text-text-secondary">{item.requirement}</p>
              <p className="mt-1 text-text-muted">{item.reason}</p>
            </div>
          ))}
        </div>
        <div id="mvp92-codex-validation-steps" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
          <p className="text-xs font-bold text-sky-100">Codex 本机验收任务书</p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
            {copyOnlySampleReadiness.codexValidationSteps.map((step) => (
              <div key={step.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-text-primary">{step.title}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">{step.phase}</span>
                </div>
                {step.command && <code className="mt-2 block rounded-lg bg-black/30 px-2 py-1 text-[9px] text-sky-100">{step.command}</code>}
                <p className="mt-2 text-text-muted">{step.expected}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp92-copy-only-ipc-contract" className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-xs font-bold text-violet-100">copy-only IPC 合同</p>
          <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-2">
            {copyOnlySampleReadiness.ipcContracts.map((ipc) => (
              <div key={ipc.channel} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <p className="font-bold text-text-primary">{ipc.channel}</p>
                <p className="mt-1 text-text-muted">{ipc.direction} · {ipc.purpose}</p>
                <p className="mt-1 text-text-secondary">Renderer：{ipc.rendererPayloadRule}</p>
                <p className="mt-1 text-text-secondary">Main：{ipc.mainSideRule}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp92-main-side-copy-contract" className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {copyOnlySampleReadiness.mainSideCopyContracts.map((item) => (
            <div key={item.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed">
              <p className="font-bold text-amber-100">{item.title}</p>
              <p className="mt-1 text-text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp92-sample-gates-preview" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs font-bold text-emerald-100">样本执行门槛：{primaryCopySample.sampleName}</p>
          <p className="mt-2 text-[10px] text-text-muted">来源样本：{primaryCopySample.sampleSourceRoot}</p>
          <p className="mt-1 text-[10px] text-text-muted">目标样本：{primaryCopySample.sampleTargetRoot}</p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
            {primaryCopySample.gates.map((gate) => (
              <div key={gate.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <p className="font-bold text-text-primary">{gate.label}</p>
                <p className="mt-1 text-text-muted">{gate.status}</p>
                <p className="mt-1 text-text-secondary">{gate.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp92-copy-sample-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {copyOnlySampleReadiness.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <button id="mvp92-disabled-real-copy-button" type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70">
          <Lock className="h-4 w-4" />
          真实 copy 后置：MVP92 只准备 Codex 验收和合同
        </button>
        <div className="sr-only">mvp92-copy-sample-readiness / copy-only IPC / Codex 本机验收任务书 / main-side copy contract / minimal sample directory / no real copy / no copyFile / absolutePath / file://</div>
      </section>




      <section id="mvp95-copy-only-executor" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">MVP-95 · 真实 copy-only executor</p>
            <h3 className="mt-1 text-sm font-black text-text-primary">{copyOnlyExecutor.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{copyOnlyExecutor.summary}</p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-100">{copyOnlyExecutor.version}</span>
        </div>

        <div id="mvp95-copy-executor-cards" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {copyOnlyExecutor.cards.map((card) => (
            <div key={card.id} className={`rounded-xl border p-3 ${copyOnlyExecutorService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold opacity-75">{card.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{card.detail}</p>
            </div>
          ))}
        </div>

        <div id="mvp95-copy-executor-request-contract" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed text-amber-50/90">
          <p className="font-bold text-amber-100">执行请求合同</p>
          <p className="mt-1">operationPlanId: {copyOnlyExecutor.requestPreview.operationPlanId}</p>
          <p className="mt-1">confirmedCopyOnly: {String(copyOnlyExecutor.requestPreview.confirmedCopyOnly)} / confirmationText: {copyOnlyExecutor.requestPreview.confirmationText}</p>
          <p className="mt-1">files: {copyOnlyExecutor.requestPreview.relativePaths.length} / absolutePathReturned: {String(copyOnlyExecutor.requestPreview.absolutePathReturned)}</p>
        </div>

        <div id="mvp95-copy-executor-result-preview" className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-4">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-[10px] leading-relaxed text-emerald-50/90">
            <p className="font-bold text-emerald-100">执行结果 preview</p>
            <p className="mt-1">status: {primaryCopyExecutorResult.status}</p>
            <p className="mt-1">copied/skipped/failed: {primaryCopyExecutorResult.copiedCount}/{primaryCopyExecutorResult.skippedCount}/{primaryCopyExecutorResult.failedCount}</p>
            <p className="mt-1">createdDirectoryCount: {primaryCopyExecutorResult.createdDirectoryCount}</p>
            <p className="mt-1">operationLogPersisted: {String(primaryCopyExecutorResult.operationLogPersisted)} / libraryIndexWritten: {String(primaryCopyExecutorResult.libraryIndexWritten)}</p>
          </div>
          <div id="mvp95-copy-result-lists" className="space-y-2">
            {primaryCopyExecutorResult.copiedFiles.map((file) => (
              <div key={file.id} className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-[10px] leading-relaxed text-sky-50/90">
                <p className="font-bold">copied · {file.id}</p>
                <p className="mt-1 break-all">{file.sourceRelativePath} → {file.targetRelativePath}</p>
              </div>
            ))}
            {primaryCopyExecutorResult.skippedList.map((file) => (
              <div key={file.id} className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-50/90">
                <p className="font-bold">skipped · {file.reasonCode}</p>
                <p className="mt-1 break-all">{file.sourceRelativePath} → {file.targetRelativePath}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="mvp95-copy-executor-safety-rules" className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {copyOnlyExecutor.executorRules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
              <p className="font-bold text-text-primary">{rule.title}</p>
              <p className="mt-1 text-text-muted">{rule.detail}</p>
            </div>
          ))}
        </div>

        <div id="mvp95-operation-log-preview-only" className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed text-violet-50/90">
          <p className="font-bold text-violet-100">OperationLog preview-only</p>
          <p className="mt-1">persisted: {String(primaryCopyExecutorResult.operationLogPreview.persisted)} / mode: {primaryCopyExecutorResult.operationLogPreview.mode}</p>
          <p className="mt-1">本轮不写 OperationLog 文件，不写 library-index.json，只返回相对路径结果。</p>
        </div>

        <div id="mvp95-codex-real-sample-gate" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-[10px] leading-relaxed text-rose-50/90">
          <p className="font-bold text-rose-100">Codex 真实样本 gate</p>
          <p className="mt-1">sendToCodexNow: {String(copyOnlyExecutor.codexGate.sendToCodexNow)} / {copyOnlyExecutor.codexGate.reason}</p>
          <p className="mt-1">{copyOnlyExecutor.codexGate.requiredAfterBuild}</p>
        </div>

        <button id="mvp95-real-copy-button-guarded" type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-100 opacity-80">
          <Lock className="h-4 w-4" />
          UI 按钮仍禁用；真实 copy 只开放给 main-side 受控 IPC + Codex 样本验收
        </button>
        <div className="sr-only">mvp95-copy-only-executor / mvp95-copy-executor-cards / mvp95-copy-executor-request-contract / mvp95-copy-executor-result-preview / mvp95-copy-result-lists / mvp95-copy-executor-safety-rules / mvp95-operation-log-preview-only / mvp95-codex-real-sample-gate / COPYFILE_EXCL / no move / no delete / no rename / no library-index write / absolutePath / file://</div>
      </section>

      <section id="mvp94-copy-only-preflight-real-check" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-sky-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">MVP-94 · copy-only preflight 真实化</p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">{copyOnlyPreflightRealCheck.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{copyOnlyPreflightRealCheck.summary}</p>
            <p className="mt-1 text-[10px] text-text-muted">基线：{copyOnlyPreflightRealCheck.baseline}</p>
          </div>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-100">{copyOnlyPreflightRealCheck.version}</span>
        </div>
        <div id="mvp94-preflight-cards" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {copyOnlyPreflightRealCheck.cards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 ${copyOnlyPreflightRealCheckService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold text-text-primary">{card.title}</p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp94-main-side-preflight-contract" className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {copyOnlyPreflightRealCheck.mainSideContracts.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-text-primary">{item.title}</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">{item.status}</span>
              </div>
              <p className="mt-1 text-text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp94-preflight-result-preview" className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-4">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed">
            <p className="text-xs font-bold text-violet-100">preflight report preview</p>
            <p className="mt-2 text-text-secondary">status：{primaryCopyPreflightRealCheck.status}</p>
            <p className="mt-1 text-text-secondary">checkedFileCount：{primaryCopyPreflightRealCheck.checkedFileCount}</p>
            <p className="mt-1 text-text-secondary">targetExistingCount：{primaryCopyPreflightRealCheck.targetExistingCount}</p>
            <p className="mt-1 text-text-secondary">targetParentMissingCount：{primaryCopyPreflightRealCheck.targetParentMissingCount}</p>
            <p className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-50">executeAllowed: {String(primaryCopyPreflightRealCheck.executeAllowed)} / copyAllowed: {String(primaryCopyPreflightRealCheck.copyAllowed)}</p>
          </div>
          <div id="mvp94-preflight-file-checks" className="space-y-2">
            {primaryCopyPreflightRealCheck.fileChecks.map((file) => (
              <div key={file.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-text-primary truncate">{file.sourceRelativePath}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">blocked: {file.blockedReasonCodes.length}</span>
                </div>
                <p className="mt-1 text-text-muted truncate">→ {file.targetRelativePath}</p>
                <p className="mt-1 text-text-secondary">sourceExists: {String(file.sourceExists)} / targetExists: {String(file.targetExists)} / targetParentExists: {String(file.targetParentExists)}</p>
                {file.blockedReasonCodes.length > 0 && <p className="mt-1 text-amber-100">{file.blockedReasonCodes.join(' / ')}</p>}
              </div>
            ))}
          </div>
        </div>
        <div id="mvp94-preflight-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {copyOnlyPreflightRealCheck.blockedExecutionRules.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <div id="mvp94-codex-gate" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed">
          <p className="text-xs font-bold text-amber-100">Codex gate</p>
          <p className="mt-2 text-text-secondary">sendToCodexNow: {String(copyOnlyPreflightRealCheck.codexGate.sendToCodexNow)}</p>
          <p className="mt-1 text-text-muted">{copyOnlyPreflightRealCheck.codexGate.reason}</p>
          <p className="mt-1 text-amber-100">{copyOnlyPreflightRealCheck.codexGate.nextCodexTrigger}</p>
        </div>
        <button id="mvp94-disabled-real-copy-button" type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70">
          <Lock className="h-4 w-4" />
          预检可以真实化：copy 执行仍禁用
        </button>
        <div className="sr-only">mvp94-copy-only-preflight-real-check / mvp94-main-side-preflight-contract / mvp94-preflight-result-preview / mvp94-preflight-file-checks / no fs.copyFile / no mkdir / no OperationLog write / absolutePath / file://</div>
      </section>

      <section id="mvp93-copy-only-main-side-stub" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 border-b border-emerald-500/10 pb-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 tracking-wider">MVP-93 · copy-only main-side stub</p>
            <h3 className="mt-1 text-sm font-extrabold text-text-primary">{copyOnlyMainSideStub.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{copyOnlyMainSideStub.summary}</p>
            <p className="mt-1 text-[10px] text-text-muted">基线：{copyOnlyMainSideStub.baseline}</p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">{copyOnlyMainSideStub.version}</span>
        </div>
        <div id="mvp93-copy-stub-cards" className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {copyOnlyMainSideStub.cards.map((card) => (
            <div key={card.id} className={`rounded-2xl border p-3 ${copyOnlyMainSideStubService.getToneClassName(card.tone)}`}>
              <p className="text-[10px] font-bold text-text-primary">{card.title}</p>
              <p className="mt-1 text-[9px] leading-relaxed opacity-80">{card.detail}</p>
            </div>
          ))}
        </div>
        <div id="mvp93-copy-stub-channels" className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
          <p className="text-xs font-bold text-sky-100">copy-only stub 通道</p>
          <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-2">
            {copyOnlyMainSideStub.stubChannels.map((channel) => (
              <div key={channel.channel} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-text-primary truncate">{channel.channel}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-text-muted">{channel.status}</span>
                </div>
                <p className="mt-1 text-text-muted">{channel.methodName}</p>
                <p className="mt-1 text-text-secondary">{channel.mainReturnRule}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp93-copy-stub-blocked-result" className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-4">
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-[10px] leading-relaxed">
            <p className="text-xs font-bold text-violet-100">blocked result preview</p>
            <p className="mt-2 text-text-secondary">operationPlanId：{primaryCopyStubPreview.operationPlanId}</p>
            <p className="mt-1 text-text-secondary">preflight：{primaryCopyStubPreview.preflightStatus}</p>
            <p className="mt-1 text-text-secondary">按钮：{primaryCopyStubPreview.executeButtonState}</p>
            <p className="mt-1 text-text-secondary">计划文件数：{primaryCopyStubPreview.plannedFileCount}</p>
            <p className="mt-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-50">{primaryCopyStubPreview.blockedResult.message}</p>
          </div>
          <div id="mvp93-main-side-stub-guards" className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {copyOnlyMainSideStub.mainSideGuards.map((guard) => (
              <div key={guard.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-text-primary">{guard.title}</p>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] text-emerald-100">stub: {String(guard.enforcedByStub)}</span>
                </div>
                <p className="mt-1 text-text-muted">{guard.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp93-codex-prompt-gate" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[10px] leading-relaxed">
          <p className="text-xs font-bold text-amber-100">Codex 介入判断</p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
            {copyOnlyMainSideStub.codexPromptLines.map((line) => (
              <div key={line.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                <p className="font-bold text-text-primary">sendToCodexNow: {String(line.sendToCodexNow)}</p>
                <p className="mt-1 text-text-secondary">{line.prompt}</p>
                <p className="mt-1 text-text-muted">{line.reason}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="mvp93-copy-stub-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-xs font-bold text-rose-100">本轮边界</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {copyOnlyMainSideStub.guardedBoundaries.map((item) => (
              <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
            ))}
          </div>
        </div>
        <button id="mvp93-disabled-copy-stub-execute-button" type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-100 opacity-70">
          <Lock className="h-4 w-4" />
          copy-only stub 已注册：真实执行继续禁用
        </button>
        <div className="sr-only">mvp93-copy-only-main-side-stub / mvp93-copy-stub-channels / mvp93-copy-stub-blocked-result / mvp93-main-side-stub-guards / mvp93-codex-prompt-gate / no real copy / absolutePath / file://</div>
      </section>

      <section id="mvp86-import-preview-steps" className="rounded-2xl border border-border-color bg-card-bg/70 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-border-color/50 pb-3">
          <div>
            <p className="text-[10px] font-bold text-sky-300 tracking-wider">导入流程</p>
            <h3 className="text-sm font-extrabold text-text-primary">只展示预览，不执行文件操作</h3>
          </div>
          <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-[10px] font-bold text-rose-100">执行按钮已禁用</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {model.previewSteps.map((step, index) => (
            <div key={step.id} className="rounded-2xl border border-white/10 bg-black/10 p-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-color text-[10px] font-black text-white">{index + 1}</span>
                {step.status === 'blocked-execution' ? (
                  <Lock className="h-4 w-4 text-rose-300" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                )}
              </div>
              <p className="mt-3 text-xs font-bold text-text-primary">{step.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="mvp86-import-preview-task" className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
        <article className="rounded-2xl border border-border-color bg-card-bg/70 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 border-b border-border-color/50 pb-3">
            <div>
              <p className="text-[10px] font-bold text-emerald-300 tracking-wider">ImportTask mock preview</p>
              <h3 className="text-lg font-black text-text-primary">{task.previewLabel}</h3>
              <p className="mt-1 text-[11px] text-text-muted">{task.sourceDisplayName}</p>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-100">{task.status}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
              <p className="text-[10px] font-bold text-text-muted">识别结果</p>
              <p className="mt-1 font-bold text-text-primary">{task.detectedCode} · {task.detectedTitle}</p>
              <p className="mt-1 text-[11px] text-text-muted">{task.detectedArtistOrCircle} / {task.detectedType}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
              <p className="text-[10px] font-bold text-text-muted">目标位置</p>
              <p className="mt-1 font-bold text-text-primary">{task.targetDisplayName}</p>
              <p className="mt-1 text-[11px] text-text-muted">operationMode: {task.operationMode} / overwrite: false</p>
            </div>
          </div>

          <div id="mvp86-import-file-list" className="space-y-2">
            {task.sourceFiles.map((file) => {
              const Icon = getFileIcon(file.kind);
              return (
                <div key={file.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                      <Icon className="h-4 w-4 text-sky-200" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-text-primary">{file.displayName}</p>
                      <p className="truncate text-[10px] text-text-muted">{file.relativePath}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-text-secondary">{file.kind}</p>
                    <p className="text-[10px] text-text-muted">{importerPreviewShellService.formatFileSize(file.sizeBytes)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <aside className="space-y-4">
          <div id="mvp86-import-metadata-preview" className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-200" />
              <p className="text-sm font-extrabold text-text-primary">元数据候选</p>
            </div>
            <div className="mt-3 space-y-2">
              {task.metadataSources.map((source) => (
                <div key={source.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] text-text-muted">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-text-secondary">{source.provider}</p>
                    <span className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5">优先级 {source.mergePriority}</span>
                  </div>
                  <p className="mt-1 text-text-primary font-bold">{source.title || source.code}</p>
                  <p className="mt-1 leading-relaxed">{source.notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="mvp86-import-conflict-preview" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-200" />
              <p className="text-sm font-extrabold text-text-primary">冲突报告</p>
            </div>
            <p className="mt-2 text-[11px] text-text-muted">{task.conflictReport.summary}</p>
            <div className="mt-3 space-y-2">
              {task.conflictReport.items.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-black/10 p-3 text-[10px] leading-relaxed text-amber-50/90">
                  <p className="font-bold">{item.severity} / {item.kind}</p>
                  <p className="mt-1 opacity-85">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section id="mvp86-import-target-plan-preview" className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {model.previewPanels.map((panel) => (
          <div key={panel.id} className={`rounded-2xl border p-4 ${importerPreviewShellService.getToneClassName(panel.tone)}`}>
            <p className="text-sm font-extrabold text-text-primary">{panel.title}</p>
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

      <section id="mvp86-importer-guardrails" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-rose-200" />
          <div>
            <p className="text-sm font-extrabold text-text-primary">安全边界</p>
            <p className="text-[11px] text-text-muted">当前页面是导入器外壳，不会执行真实导入。</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-xs font-bold text-rose-100">禁用动作</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {model.disabledActions.map((item) => (
                <span key={item} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-50">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-xs font-bold text-rose-100">后续顺序</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {model.nextSteps.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-black/10 px-2 py-0.5 text-[10px] text-text-secondary">{item}</span>
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
        <div className="sr-only">
          {model.guardedBoundaries.join(' / ')} / mvp86-importer-ui-shell / mvp86-import-preview-task / absolutePath / file:// / fs.copyFile / fs.rename / fs.rm / fs.unlink
        </div>
      </section>
    </div>
  );
}
