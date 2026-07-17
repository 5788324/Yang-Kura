import { ArrowRight, Gauge, ShieldCheck, Wrench } from 'lucide-react';

interface SettingsMaintenanceEntryProps {
  onOpenMaintenance: () => void;
}

export default function SettingsMaintenanceEntry({
  onOpenMaintenance,
}: SettingsMaintenanceEntryProps) {
  return (
    <section
      id="u39b-settings-maintenance-entry"
      className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card-bg/45 to-transparent p-5 shadow-sm"
      aria-labelledby="u39b-settings-maintenance-title"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-amber-300">
            <Wrench className="h-4 w-4" aria-hidden="true" />
            <p className="text-[10px] font-bold tracking-[0.16em]">AI 维护</p>
          </div>
          <h2 id="u39b-settings-maintenance-title" className="mt-1 text-base font-black text-text-primary">
            诊断、性能与工程工具独立打开
          </h2>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text-muted">
            日常设置只保留主题、播放和资源库配置。真实资源状态、性能检查及完整历史诊断按需进入维护页面，避免设置页持续堆叠工程信息。
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-text-secondary">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-color/60 bg-card-bg/45 px-2.5 py-1">
              <ShieldCheck className="h-3 w-3 text-emerald-300" aria-hidden="true" />
              默认轻量加载
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-color/60 bg-card-bg/45 px-2.5 py-1">
              <Gauge className="h-3 w-3 text-cyan-300" aria-hidden="true" />
              完整诊断按需展开
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMaintenance}
          className="inline-flex min-h-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-color px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/70"
          aria-label="打开 AI 维护页面"
        >
          打开 AI 维护
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
