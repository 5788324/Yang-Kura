import React from 'react';
import { Gauge, Database, ShieldCheck, Terminal } from 'lucide-react';
import { libraryPerformanceService } from '../services/libraryPerformanceService';

export default function LibraryPerformanceDiagnosticsPanel() {
  const model = libraryPerformanceService.getDiagnosticsModel();
  return (
    <section id="mvp126-library-performance-diagnostics" className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-cyan-300">性能诊断</p>
          <h3 className="mt-1 text-sm font-black text-text-primary flex items-center gap-2"><Gauge className="w-4 h-4" />{model.title}</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-text-muted">{model.description}</p>
        </div>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-200">生成夹具，不读真实库</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3"><Database className="w-4 h-4 text-cyan-300" /><p className="mt-2 text-[10px] text-text-muted">音声作品</p><p className="text-lg font-black">{model.syntheticFixture.asmrWorks.toLocaleString()}</p></div>
        <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3"><Database className="w-4 h-4 text-indigo-300" /><p className="mt-2 text-[10px] text-text-muted">音乐专辑</p><p className="text-lg font-black">{model.syntheticFixture.musicAlbums.toLocaleString()}</p></div>
        <div className="rounded-xl border border-border-color/50 bg-card-bg/35 p-3"><Database className="w-4 h-4 text-emerald-300" /><p className="mt-2 text-[10px] text-text-muted">总曲目</p><p className="text-lg font-black">{model.syntheticFixture.totalTracks.toLocaleString()}</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {model.renderBudgets.map((item) => <div key={item.id} className="rounded-xl border border-border-color/40 bg-card-bg/25 p-3"><p className="text-[10px] text-text-muted">{item.label}</p><p className="mt-1 text-xs font-black text-text-primary">{item.value}</p><p className="mt-1 text-[9px] text-text-muted">{item.helper}</p></div>)}
      </div>
      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
        <p className="text-[10px] font-bold text-emerald-200 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />安全边界</p>
        <ul className="mt-2 space-y-1 text-[10px] text-text-muted">{model.safeguards.map((item) => <li key={item}>• {item}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-border-color/50 bg-black/20 px-3 py-2 font-mono text-[10px] text-cyan-100 flex items-center gap-2"><Terminal className="w-3.5 h-3.5" />{model.benchmarkCommand}</div>
    </section>
  );
}
