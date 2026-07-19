import { useMemo, useState } from 'react';
import {
  ArchiveRestore,
  Check,
  CheckCircle2,
  Copy,
  FileAudio,
  FileImage,
  FileText,
  FolderInput,
  FolderOutput,
  LoaderCircle,
  MoveRight,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  buildImportTargetRelativePath,
  createImportOperationPlanId,
  getImportExecutionLimit,
  isImportableScannerEntry,
  sanitizeImportFolderName,
  type ImportExecutionMode,
} from '../features/importer/importerDailyWorkflow';
import { libraryReadCoordinatorService } from '../services/libraryReadCoordinatorService';

type SelectedRoot = Extract<YangKuraSelectLibraryRootResult, { ok: true }>;
type ScannerSuccess = Extract<YangKuraScannerDryRunResult, { ok: true }>;
type CopyPreflight = YangKuraImportCopyOnlyPreflightRealCheckResult;
type ExecutionResult = YangKuraImportCopyOnlyExecuteResult | YangKuraImportMoveOnlyExecuteResult;

type BusyStage = 'source' | 'scan' | 'target' | 'preflight' | 'execute' | 'index' | null;

const fileKindLabel: Record<string, string> = {
  audio: '音频',
  video: '视频',
  image: '图片',
  cover: '封面',
  subtitle: '字幕',
  text: '文本',
  archive: '压缩包',
  other: '其他',
};

function EntryIcon({ kind }: { kind: string }) {
  if (kind === 'audio' || kind === 'video') return <FileAudio className="h-4 w-4" aria-hidden="true" />;
  if (kind === 'image' || kind === 'cover') return <FileImage className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

function resultCount(result: ExecutionResult | null): { committed: number; skipped: number; failed: number } {
  if (!result) return { committed: 0, skipped: 0, failed: 0 };
  if ('copiedCount' in result) return { committed: result.copiedCount ?? 0, skipped: result.skippedCount ?? 0, failed: result.failedCount ?? 0 };
  return { committed: result.movedCount ?? 0, skipped: result.skippedCount ?? 0, failed: result.failedCount ?? 0 };
}

export default function ImporterPage() {
  const api = window.yangKura;
  const [sourceRoot, setSourceRoot] = useState<SelectedRoot | null>(null);
  const [targetRoot, setTargetRoot] = useState<SelectedRoot | null>(null);
  const [scanResult, setScanResult] = useState<ScannerSuccess | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<ImportExecutionMode>('copy');
  const [targetFolder, setTargetFolder] = useState('');
  const [preflight, setPreflight] = useState<CopyPreflight | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [indexMessage, setIndexMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('选择来源目录后，应用会只读扫描并列出可导入文件。');
  const [confirmed, setConfirmed] = useState(false);
  const [busyStage, setBusyStage] = useState<BusyStage>(null);
  const [operationPlanId, setOperationPlanId] = useState(createImportOperationPlanId);

  const importableEntries = useMemo(
    () => (scanResult?.discoveredEntries ?? []).filter(isImportableScannerEntry),
    [scanResult],
  );
  const selectedEntries = useMemo(
    () => importableEntries.filter((entry) => selectedPaths.has(entry.relativePath)),
    [importableEntries, selectedPaths],
  );
  const limit = getImportExecutionLimit(mode);
  const targetRelativePaths = useMemo(() => {
    try {
      return selectedEntries.map((entry) => buildImportTargetRelativePath(targetFolder, entry.relativePath));
    } catch {
      return [];
    }
  }, [selectedEntries, targetFolder]);
  const selectedTooMany = selectedEntries.length > limit;
  const sameRoot = Boolean(sourceRoot && targetRoot && sourceRoot.rootPathToken === targetRoot.rootPathToken);
  const preflightReady = Boolean(
    preflight
      && preflight.operationPlanId === operationPlanId
      && preflight.checkedFileCount === selectedEntries.length,
  );
  const counts = resultCount(executionResult);

  const clearAfterSelectionChange = () => {
    setPreflight(null);
    setExecutionResult(null);
    setIndexMessage('');
    setConfirmed(false);
  };

  const resetTask = () => {
    setSourceRoot(null);
    setTargetRoot(null);
    setScanResult(null);
    setSelectedPaths(new Set());
    setTargetFolder('');
    setPreflight(null);
    setExecutionResult(null);
    setIndexMessage('');
    setConfirmed(false);
    setOperationPlanId(createImportOperationPlanId());
    setStatusMessage('已清空本次导入任务。');
  };

  const selectSource = async () => {
    if (!api?.selectLibraryRoot || !api.requestScannerDryRun) {
      setStatusMessage('当前不是可用的桌面运行环境，无法选择来源目录。');
      return;
    }
    setBusyStage('source');
    try {
      const result = await api.selectLibraryRoot({ libraryType: 'mixed', reason: 'user-selected-library-root', selectionRole: 'import-source' });
      if (!result.ok) {
        setStatusMessage(result.message);
        return;
      }
      setSourceRoot(result);
      setTargetFolder(sanitizeImportFolderName(result.displayName));
      setTargetRoot(null);
      setOperationPlanId(createImportOperationPlanId());
      clearAfterSelectionChange();
      setBusyStage('scan');
      const scan = await api.requestScannerDryRun({
        rootPathToken: result.rootPathToken,
        mode: 'dry-run',
        previewOnly: true,
        maxEntries: 500,
        maxDepth: 12,
      });
      if (!scan.ok) {
        setScanResult(null);
        setSelectedPaths(new Set());
        setStatusMessage(scan.message);
        return;
      }
      const entries = scan.discoveredEntries.filter(isImportableScannerEntry);
      setScanResult(scan);
      setSelectedPaths(new Set(entries.slice(0, getImportExecutionLimit('copy')).map((entry) => entry.relativePath)));
      setStatusMessage(`只读扫描完成：发现 ${entries.length} 个可导入文件，默认选中前 ${Math.min(entries.length, getImportExecutionLimit('copy'))} 个。`);
    } catch (error) {
      setStatusMessage(`来源目录扫描失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyStage(null);
    }
  };

  const rescanSource = async () => {
    if (!api?.requestScannerDryRun || !sourceRoot) return;
    setBusyStage('scan');
    clearAfterSelectionChange();
    try {
      const scan = await api.requestScannerDryRun({
        rootPathToken: sourceRoot.rootPathToken,
        mode: 'dry-run',
        previewOnly: true,
        maxEntries: 500,
        maxDepth: 12,
      });
      if (!scan.ok) {
        setStatusMessage(scan.message);
        return;
      }
      const entries = scan.discoveredEntries.filter(isImportableScannerEntry);
      setScanResult(scan);
      setSelectedPaths(new Set(entries.slice(0, limit).map((entry) => entry.relativePath)));
      setStatusMessage(`重新扫描完成：发现 ${entries.length} 个可导入文件。`);
    } catch (error) {
      setStatusMessage(`重新扫描失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyStage(null);
    }
  };

  const selectTarget = async () => {
    if (!api?.selectLibraryRoot) {
      setStatusMessage('当前不是可用的桌面运行环境，无法选择目标资源库。');
      return;
    }
    setBusyStage('target');
    try {
      const result = await api.selectLibraryRoot({ libraryType: 'mixed', reason: 'user-selected-library-root', selectionRole: 'import-target' });
      if (!result.ok) {
        setStatusMessage(result.message);
        return;
      }
      setTargetRoot(result);
      clearAfterSelectionChange();
      setStatusMessage(`目标资源库已选择：${result.displayName}。下一步执行冲突预检。`);
    } catch (error) {
      setStatusMessage(`目标目录选择失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyStage(null);
    }
  };

  const updateMode = (nextMode: ImportExecutionMode) => {
    setMode(nextMode);
    const nextLimit = getImportExecutionLimit(nextMode);
    if (selectedPaths.size > nextLimit) {
      setSelectedPaths(new Set(importableEntries.slice(0, nextLimit).map((entry) => entry.relativePath)));
      setStatusMessage(nextMode === 'move' ? '移动模式最多允许 20 个文件，已自动保留前 20 个选择。' : '复制模式最多允许 200 个文件。');
    }
    clearAfterSelectionChange();
  };

  const toggleEntry = (relativePath: string) => {
    setSelectedPaths((previous) => {
      const next = new Set(previous);
      if (next.has(relativePath)) next.delete(relativePath);
      else next.add(relativePath);
      return next;
    });
    clearAfterSelectionChange();
  };

  const selectExecutableEntries = () => {
    setSelectedPaths(new Set(importableEntries.slice(0, limit).map((entry) => entry.relativePath)));
    clearAfterSelectionChange();
  };

  const runPreflight = async () => {
    if (!api?.requestImportCopyOnlyPreflight || !sourceRoot || !targetRoot) return;
    if (sameRoot) {
      setStatusMessage('来源目录和目标目录不能相同。');
      return;
    }
    if (selectedEntries.length === 0 || targetRelativePaths.length !== selectedEntries.length) {
      setStatusMessage('至少选择一个文件，并填写安全的目标文件夹名称。');
      return;
    }
    if (selectedTooMany) {
      setStatusMessage(`${mode === 'move' ? '移动' : '复制'}模式本次最多允许 ${limit} 个文件。`);
      return;
    }
    setBusyStage('preflight');
    setExecutionResult(null);
    setIndexMessage('');
    setConfirmed(false);
    try {
      const result = await api.requestImportCopyOnlyPreflight({
        operationPlanId,
        rootPathToken: sourceRoot.rootPathToken,
        targetRootPathToken: targetRoot.rootPathToken,
        mode: 'copy-only-stub',
        relativePaths: selectedEntries.map((entry) => entry.relativePath),
        targetRelativePaths,
      });
      if (result.ok && result.status === 'mvp94-copy-only-preflight-real-check-complete') {
        setPreflight(result);
        setStatusMessage(`预检完成：${result.checkedFileCount} 个文件，${result.blockedFileCount} 个存在冲突或警告。不会覆盖既有文件。`);
      } else {
        setPreflight(null);
        setStatusMessage(result.message);
      }
    } catch (error) {
      setPreflight(null);
      setStatusMessage(`冲突预检失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyStage(null);
    }
  };

  const refreshIndexAfterImport = async (committedTargetPaths: string[]) => {
    if (!api || !targetRoot || committedTargetPaths.length === 0) return;
    setBusyStage('index');
    setIndexMessage('正在备份并更新 library-index.json…');
    try {
      const refreshPreview = await api.requestImportPostCopyRefreshPreview({
        operationPlanId,
        targetRootPathToken: targetRoot.rootPathToken,
        mode: 'post-copy-refresh-preview',
        targetRelativePaths: committedTargetPaths,
      });
      if (!refreshPreview.ok || !refreshPreview.refreshCandidates?.length) {
        setIndexMessage(`文件操作已完成，但未生成 Index 更新候选：${refreshPreview.message}`);
        return;
      }
      const patchPreview = await api.requestImportLibraryIndexPatchPreview({
        operationPlanId,
        targetRootPathToken: targetRoot.rootPathToken,
        mode: 'library-index-patch-preview',
        sourceRefreshPlanVersion: 'mvp97-post-copy-refresh-plan-v1',
        refreshCandidates: refreshPreview.refreshCandidates,
        maxPatchItems: 500,
      });
      if (!patchPreview.ok || !patchPreview.indexPatchPreview) {
        setIndexMessage(`文件操作已完成，但 Index patch 预览失败：${patchPreview.message}`);
        return;
      }
      const readiness = await api.requestImportLibraryIndexPatchWriteReadiness({
        operationPlanId,
        targetRootPathToken: targetRoot.rootPathToken,
        mode: 'library-index-patch-write-readiness',
        sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
        indexPatchPreview: patchPreview.indexPatchPreview,
        userConfirmedPatchPreview: true,
        createBackup: true,
        confirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      });
      if (!readiness.ok || !readiness.readyForMvp100Write) {
        setIndexMessage(`文件操作已完成，但 Index 写入准备未通过：${readiness.message}`);
        return;
      }
      const writeResult = await api.requestImportLibraryIndexPatchWrite({
        operationPlanId,
        targetRootPathToken: targetRoot.rootPathToken,
        mode: 'library-index-patch-write-confirmed',
        sourceReadinessVersion: 'mvp99-library-index-patch-write-readiness-v1',
        sourcePatchPreviewVersion: 'mvp98-library-index-patch-preview-v1',
        indexPatchPreview: patchPreview.indexPatchPreview,
        userConfirmedPatchWrite: true,
        createBackup: true,
        confirmationText: 'CONFIRM_WRITE_LIBRARY_INDEX_PATCH',
      });
      if (!writeResult.ok || writeResult.status !== 'mvp100-library-index-patch-write-complete') {
        setIndexMessage(`文件操作已完成，但 Index 写入失败：${writeResult.message}`);
        return;
      }
      const refreshResult = await api.requestImportLibraryIndexPatchRefreshAfterWrite({
        operationPlanId,
        targetRootPathToken: targetRoot.rootPathToken,
        mode: 'refresh-after-patch-write',
        sourcePatchWriteVersion: 'mvp100-library-index-patch-write-v1',
        patchWriteStatus: writeResult.status,
      });
      if (refreshResult.ok && refreshResult.readResult?.ok) {
        libraryReadCoordinatorService.acceptResult(refreshResult.readResult);
        window.dispatchEvent(new Event('yang-kura-library-index-loaded'));
        setIndexMessage(`Index 已备份并更新：新增或更新 ${patchPreview.patchItemCount} 项，资源库界面已刷新。`);
      } else {
        setIndexMessage(`Index 已写入，但界面刷新未完成：${refreshResult.message}`);
      }
    } catch (error) {
      setIndexMessage(`文件操作已完成，但 Index 更新发生异常：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyStage(null);
    }
  };

  const executeImport = async () => {
    if (!api || !sourceRoot || !targetRoot || !preflightReady || !confirmed) return;
    setBusyStage('execute');
    setExecutionResult(null);
    setIndexMessage('');
    try {
      let result: ExecutionResult;
      if (mode === 'copy') {
        const copyResult = await api.requestImportCopyOnlyExecute({
          operationPlanId,
          rootPathToken: sourceRoot.rootPathToken,
          targetRootPathToken: targetRoot.rootPathToken,
          mode: 'copy-only-stub',
          relativePaths: selectedEntries.map((entry) => entry.relativePath),
          targetRelativePaths,
          confirmedCopyOnly: true,
          confirmationText: 'COPY ONLY',
        });
        if (!('copiedFiles' in copyResult) || !('copiedCount' in copyResult)) {
          setStatusMessage(copyResult.message);
          return;
        }
        result = copyResult;
      } else {
        result = await api.requestImportMoveOnlyExecute({
          operationPlanId,
          rootPathToken: sourceRoot.rootPathToken,
          targetRootPathToken: targetRoot.rootPathToken,
          mode: 'move-only-small-sample',
          relativePaths: selectedEntries.map((entry) => entry.relativePath),
          targetRelativePaths,
          confirmedMoveOnly: true,
          confirmationText: 'CONFIRM_MOVE_IMPORT',
          overwriteAllowed: false,
          maxMoveItems: 20,
        });
      }
      setExecutionResult(result);
      setStatusMessage(result.message);
      const committedTargetPaths = 'copiedFiles' in result
        ? (result.copiedFiles ?? []).map((item) => item.targetRelativePath)
        : (result.movedFiles ?? []).map((item) => item.targetRelativePath);
      if (committedTargetPaths.length > 0 && result.ok) {
        await refreshIndexAfterImport(committedTargetPaths);
      }
    } catch (error) {
      setStatusMessage(`导入执行失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusyStage(null);
    }
  };

  const isBusy = busyStage !== null;

  return (
    <div
      className="mx-auto max-w-6xl space-y-5 pb-24 animate-fade-in"
      data-u41b-importer-daily="ready"
      id="u41b-importer-primary-flow"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border-color/70 pb-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl font-bold"><ArchiveRestore className="h-5 w-5 text-brand-color" /><span>导入本地媒体</span></h2>
          <p className="mt-1 text-xs text-text-muted">选择来源、预览文件、检查冲突，再复制或移动到资源库。全程不覆盖既有文件。</p>
        </div>
        <button type="button" onClick={resetTask} disabled={isBusy} className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-xs font-bold disabled:opacity-40"><X className="h-3.5 w-3.5" />清空本次任务</button>
      </header>

      {!api && (
        <div role="alert" className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200">
          导入功能需要 Yang-Kura 桌面版。当前浏览器预览不会执行文件操作。
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5" data-import-step="source">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-color">步骤 1</p><h3 className="mt-1 text-sm font-bold">选择并扫描来源</h3></div><FolderInput className="h-5 w-5 text-brand-color" /></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void selectSource()} disabled={isBusy || !api} className="rounded-lg bg-brand-color px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{busyStage === 'source' ? '选择中…' : '选择来源目录'}</button>
            <button type="button" onClick={() => void rescanSource()} disabled={isBusy || !sourceRoot} className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-xs font-bold disabled:opacity-40"><RefreshCw className={`h-3.5 w-3.5 ${busyStage === 'scan' ? 'animate-spin' : ''}`} />重新扫描</button>
          </div>
          <div className="rounded-xl border border-border-color/60 bg-card-bg/35 p-3 text-xs">
            <p className="font-bold">{sourceRoot?.displayName ?? '尚未选择来源目录'}</p>
            <p className="mt-1 text-text-muted">{scanResult ? `${importableEntries.length} 个可导入文件；扫描只读，不修改来源。` : '只显示目录名称，不向界面返回完整路径。'}</p>
          </div>
          {scanResult && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span>已选 {selectedEntries.length} / {importableEntries.length}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={selectExecutableEntries} className="font-bold text-brand-color">选择本模式上限</button>
                  <button type="button" onClick={() => { setSelectedPaths(new Set()); clearAfterSelectionChange(); }} className="font-bold text-text-muted">清空选择</button>
                </div>
              </div>
              <div className="max-h-72 space-y-1 overflow-auto rounded-xl border border-border-color/60 p-2" aria-label="可导入文件列表">
                {importableEntries.length === 0 && <p className="p-3 text-xs text-text-muted">没有发现可导入文件。</p>}
                {importableEntries.map((entry) => {
                  const checked = selectedPaths.has(entry.relativePath);
                  return (
                    <label key={entry.id} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-card-bg/55">
                      <input type="checkbox" checked={checked} onChange={() => toggleEntry(entry.relativePath)} className="mt-0.5" />
                      <span className="mt-0.5 text-brand-color"><EntryIcon kind={entry.entryKind} /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold" title={entry.relativePath}>{entry.relativePath}</span><span className="text-[10px] text-text-muted">{fileKindLabel[entry.entryKind] ?? entry.entryKind}{entry.warningCodes.length ? ` · ${entry.warningCodes.join(', ')}` : ''}</span></span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5" data-import-step="target">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-color">步骤 2</p><h3 className="mt-1 text-sm font-bold">选择目标与方式</h3></div><FolderOutput className="h-5 w-5 text-brand-color" /></div>
          <button type="button" onClick={() => void selectTarget()} disabled={isBusy || !sourceRoot || !api} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{busyStage === 'target' ? '选择中…' : '选择目标资源库'}</button>
          <div className="rounded-xl border border-border-color/60 bg-card-bg/35 p-3 text-xs"><p className="font-bold">{targetRoot?.displayName ?? '尚未选择目标资源库'}</p><p className="mt-1 text-text-muted">目标应是已有 Yang-Kura 资源库目录。Index 更新前会创建备份。</p></div>
          {sameRoot && <p role="alert" className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-200">来源和目标是同一授权目录，已阻止执行。</p>}
          <fieldset className="grid grid-cols-2 gap-2" disabled={isBusy}>
            <legend className="mb-2 text-xs font-bold">文件处理方式</legend>
            <button type="button" aria-pressed={mode === 'copy'} onClick={() => updateMode('copy')} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold ${mode === 'copy' ? 'border-brand-color bg-brand-color/10 text-brand-color' : 'border-border-color text-text-secondary'}`}><Copy className="h-4 w-4" />复制</button>
            <button type="button" aria-pressed={mode === 'move'} onClick={() => updateMode('move')} className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold ${mode === 'move' ? 'border-amber-400 bg-amber-500/10 text-amber-200' : 'border-border-color text-text-secondary'}`}><MoveRight className="h-4 w-4" />移动</button>
          </fieldset>
          <label className="block space-y-2 text-xs"><span className="font-bold">目标子文件夹</span><input value={targetFolder} onChange={(event) => { setTargetFolder(event.target.value); clearAfterSelectionChange(); }} placeholder="例如 RJ01234567" className="w-full rounded-lg border border-border-color bg-input-bg px-3 py-2.5 text-text-primary outline-none focus:border-brand-color" /><span className="block text-[10px] text-text-muted">默认使用来源目录名称；禁止绝对路径和 <code>..</code>。</span></label>
          <div className="rounded-xl border border-border-color/60 p-3 text-xs text-text-secondary"><p>本模式上限：{limit} 个文件</p><p className="mt-1">当前计划：{selectedEntries.length} 个文件，{mode === 'copy' ? '保留来源' : '成功后从来源移除'}</p></div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5" data-import-step="preflight">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-color">步骤 3</p><h3 className="mt-1 text-sm font-bold">真实冲突预检</h3></div><ShieldCheck className="h-5 w-5 text-brand-color" /></div>
          <p className="text-xs text-text-muted">检查来源是否存在、目标是否已存在、父目录是否可创建。预检不执行复制或移动。</p>
          <button type="button" onClick={() => void runPreflight()} disabled={isBusy || !sourceRoot || !targetRoot || selectedEntries.length === 0 || selectedTooMany || sameRoot} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{busyStage === 'preflight' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}执行预检</button>
          {preflight && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-lg border border-border-color p-3"><strong>{preflight.checkedFileCount}</strong><span className="mt-1 block text-[10px] text-text-muted">已检查</span></div>
                <div className="rounded-lg border border-amber-500/25 p-3"><strong>{preflight.targetExistingCount}</strong><span className="mt-1 block text-[10px] text-text-muted">目标已存在</span></div>
                <div className="rounded-lg border border-red-500/25 p-3"><strong>{preflight.sourceMissingCount}</strong><span className="mt-1 block text-[10px] text-text-muted">来源缺失</span></div>
                <div className="rounded-lg border border-border-color p-3"><strong>{preflight.targetParentMissingCount}</strong><span className="mt-1 block text-[10px] text-text-muted">将新建目录</span></div>
              </div>
              {preflight.blockedFileCount > 0 && <p className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">有 {preflight.blockedFileCount} 个文件存在警告。目标已存在的文件会跳过，不会覆盖；来源缺失会使整批失败并回滚本轮已处理文件。</p>}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-border-color/70 bg-card-bg/35 p-5" data-import-step="execute">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-color">步骤 4</p><h3 className="mt-1 text-sm font-bold">确认执行并刷新资源库</h3></div>{executionResult?.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <ArchiveRestore className="h-5 w-5 text-brand-color" />}</div>
          <label className="flex items-start gap-3 rounded-xl border border-border-color/60 bg-card-bg/35 p-3 text-xs">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!preflightReady || isBusy} className="mt-0.5" />
            <span>我确认执行{mode === 'copy' ? '复制' : '移动'}，不覆盖既有文件，并允许先备份再更新 <code>library-index.json</code>。{mode === 'move' ? '移动成功后来源文件会被移除。' : ''}</span>
          </label>
          <button type="button" onClick={() => void executeImport()} disabled={isBusy || !preflightReady || !confirmed || selectedTooMany || sameRoot} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 ${mode === 'move' ? 'bg-amber-600' : 'bg-brand-color'}`}>{busyStage === 'execute' || busyStage === 'index' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : mode === 'move' ? <MoveRight className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}执行{mode === 'copy' ? '复制' : '移动'}</button>
          {executionResult && (
            <div className={`rounded-xl border p-4 text-xs ${executionResult.ok ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-red-500/25 bg-red-500/10'}`}>
              <p className="font-bold">{executionResult.message}</p>
              <p className="mt-2">完成 {counts.committed}，跳过 {counts.skipped}，失败 {counts.failed}。</p>
              {'operationLogPersisted' in executionResult && <p className="mt-1">OperationLog：{executionResult.operationLogPersisted ? '已写入' : '未写入'}。</p>}
              {'rollbackAttempted' in executionResult && executionResult.rollbackAttempted && <p className="mt-1">回滚：{executionResult.rollbackSucceeded ? '已完成' : '未完整完成'}。</p>}
            </div>
          )}
          {indexMessage && <p role="status" className="rounded-xl border border-border-color/60 bg-card-bg/40 p-3 text-xs text-text-secondary">{indexMessage}</p>}
        </section>
      </div>

      <p role="status" aria-live="polite" className="rounded-xl border border-border-color/60 bg-card-bg/35 p-3 text-xs text-text-secondary">{statusMessage}</p>

      <details id="mvp107-importer-ai-maintenance-fold" className="rounded-2xl border border-border-color/50 bg-card-bg/20 p-4 text-xs text-text-muted">
        <summary className="cursor-pointer font-bold text-text-secondary">高级导入工具（识别、冲突与执行）</summary>
        <div className="mt-3 space-y-2">
          <p>日常页面已连接真实 tokenized 目录选择、只读扫描、冲突预检、copy/move 事务、OperationLog、失败回滚和 Index patch 刷新。</p>
          <p>安全边界：不返回绝对路径，不生成 file://，不覆盖目标文件，移动模式单次最多 20 项，复制模式单次最多 200 项。</p>
        </div>
      </details>

      <div className="sr-only" aria-hidden="true">
        u41b-real-importer-ui / mvp86-importer-ui-shell retired / mvp107-importer-daily-ui-cleanup / no absolutePath / no file://
      </div>
    </div>
  );
}
