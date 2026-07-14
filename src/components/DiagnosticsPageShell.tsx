import React, { Suspense, lazy, useState } from 'react';
import { Activity, Gauge, Wrench } from 'lucide-react';
import type { MusicAlbum, RJWork } from '../types';

const DiagnosticsPage = lazy(() => import('./DiagnosticsPage'));
const LibraryPerformanceDiagnosticsPanel = lazy(() => import('./LibraryPerformanceDiagnosticsPanel'));

interface DiagnosticsPageShellProps {
  onScanLibrary: () => void;
  scanStatus: string;
  rjWorks?: RJWork[];
  setRjWorks?: React.Dispatch<React.SetStateAction<RJWork[]>>;
  musicAlbums?: MusicAlbum[];
  setMusicAlbums?: React.Dispatch<React.SetStateAction<MusicAlbum[]>>;
  setAsmrDetailId?: (id: string | null) => void;
  onRefetchRjMetadata?: (rjId: string) => void;
}


export default function DiagnosticsPageShell(props: DiagnosticsPageShellProps) {
  const [showPerformance, setShowPerformance] = useState(false);
  const [showFullDiagnostics, setShowFullDiagnostics] = useState(false);
  const workCount = Array.isArray(props.rjWorks) ? props.rjWorks.length : 0;
  const albumCount = Array.isArray(props.musicAlbums) ? props.musicAlbums.length : 0;

  if (showFullDiagnostics) {
    return (
      <Suspense fallback={<div className="rounded-2xl border border-border-color/50 bg-card-bg/30 p-6 text-xs text-text-muted">正在按需加载完整诊断工具…</div>}>
        <DiagnosticsPage {...props} initialMaintenanceOpen />
      </Suspense>
    );
  }

  return (
    <div id="mvp126-diagnostics-two-stage-loader" className="space-y-5 pb-20 animate-fade-in">
      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent p-6 shadow-sm">
        <p className="text-[10px] font-bold tracking-wider text-emerald-300">系统诊断</p>
        <h2 className="mt-1 text-xl font-black text-text-primary">日常状态</h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">这里仅显示当前真实 Index 映射出的资源状态。没有完成目录授权或 Index 读取时，会明确显示不可用，不再使用 Demo 扫描冒充真实状态。</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">音声作品</p><p id="u28-diagnostics-asmr-count" className="mt-1 text-xl font-black text-text-primary">{workCount}</p></div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">音乐专辑</p><p id="u28-diagnostics-music-count" className="mt-1 text-xl font-black text-text-primary">{albumCount}</p></div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">当前状态</p><p id="u28-diagnostics-index-status" className="mt-1 text-sm font-bold text-emerald-300">{props.scanStatus || '尚未读取真实资源状态'}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={props.onScanLibrary} className="rounded-xl bg-brand-color px-4 py-2 text-xs font-bold text-white hover:opacity-90 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" />刷新真实资源状态</button>
          <button type="button" onClick={() => setShowPerformance((value) => !value)} className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-100 flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" />{showPerformance ? '收起性能诊断' : '查看性能诊断'}</button>
          <button type="button" onClick={() => setShowFullDiagnostics(true)} className="rounded-xl border border-border-color bg-card-bg/50 px-4 py-2 text-xs font-bold text-text-primary flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" />打开完整诊断</button>
        </div>
      </section>
      {showPerformance && <Suspense fallback={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-text-muted">正在加载性能诊断…</div>}><LibraryPerformanceDiagnosticsPanel /></Suspense>}
      <section className="rounded-2xl border border-border-color/50 bg-card-bg/30 p-4 text-xs text-text-muted">日常页面只加载轻量状态。完整历史 MVP、IPC、Scanner 和 Contract 信息保持按需加载。</section>
    </div>
  );
}
