import React, { Suspense, lazy, useState } from 'react';
import { Activity, ArrowLeft, Gauge, ShieldCheck } from 'lucide-react';
import type { MusicAlbum, RJWork } from '../types';

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
  onBackToSettings: () => void;
}

export default function DiagnosticsPageShell(props: DiagnosticsPageShellProps) {
  const [showPerformance, setShowPerformance] = useState(false);
  const workCount = Array.isArray(props.rjWorks) ? props.rjWorks.length : 0;
  const albumCount = Array.isArray(props.musicAlbums) ? props.musicAlbums.length : 0;
  const musicTrackCount = (props.musicAlbums ?? []).reduce((count, album) => count + album.tracks.length, 0);

  return (
    <div id="mvp126-diagnostics-two-stage-loader" className="space-y-5 pb-20 animate-fade-in" data-u40d-maintenance-runtime="current-only">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={props.onBackToSettings}
          className="inline-flex items-center gap-2 rounded-xl border border-border-color bg-card-bg/55 px-3 py-2 text-xs font-bold text-text-primary hover:border-brand-color/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          返回设置
        </button>
        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-200">独立维护区</span>
      </div>

      <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent p-6 shadow-sm">
        <p className="text-[10px] font-bold tracking-wider text-emerald-300">AI 维护</p>
        <h2 className="mt-1 text-xl font-black text-text-primary">当前资源状态与性能检查</h2>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">这里只显示本次应用会话的真实资源数量、读取状态和按需性能检查。历史开发记录已经归档，不再作为可操作页面加载。</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">音声作品</p><p id="u28-diagnostics-asmr-count" className="mt-1 text-xl font-black text-text-primary">{workCount}</p></div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">音乐专辑</p><p id="u28-diagnostics-music-count" className="mt-1 text-xl font-black text-text-primary">{albumCount}</p></div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">音乐曲目</p><p className="mt-1 text-xl font-black text-text-primary">{musicTrackCount}</p></div>
          <div className="rounded-2xl border border-border-color/50 bg-card-bg/40 p-4"><p className="text-[10px] text-text-muted">当前状态</p><p id="u28-diagnostics-index-status" className="mt-1 text-sm font-bold text-emerald-300">{props.scanStatus || '尚未读取资源库'}</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={props.onScanLibrary} className="flex items-center gap-1.5 rounded-xl bg-brand-color px-4 py-2 text-xs font-bold text-white hover:opacity-90"><Activity className="h-3.5 w-3.5" />刷新当前状态</button>
          <button type="button" onClick={() => setShowPerformance((value) => !value)} className="flex items-center gap-1.5 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-100"><Gauge className="h-3.5 w-3.5" />{showPerformance ? '收起性能检查' : '查看性能检查'}</button>
        </div>
      </section>

      {showPerformance && (
        <Suspense fallback={<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-text-muted">正在加载性能检查…</div>}>
          <LibraryPerformanceDiagnosticsPanel />
        </Suspense>
      )}

      <section className="flex items-start gap-3 rounded-2xl border border-border-color/50 bg-card-bg/30 p-4 text-xs text-text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
        <p>维护页不会直接删除或移动媒体文件。需要修改资源库记录的操作仍要求预览、备份和明确确认。</p>
      </section>
    </div>
  );
}
