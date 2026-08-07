import { ArrowRight, ShieldCheck } from 'lucide-react';

interface SettingsMaintenanceEntryProps {
  onOpenMaintenance: () => void;
}

export default function SettingsMaintenanceEntry({
  onOpenMaintenance,
}: SettingsMaintenanceEntryProps) {
  return (
    <details
      id="u39b-settings-maintenance-entry"
      className="mt-5 rounded-2xl border border-border-color/50 bg-card-bg/20 p-4"
    >
      <summary className="cursor-pointer list-none text-xs font-bold text-text-primary">
        高级
      </summary>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border-color/50 bg-card-bg/30 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
          <ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          诊断与修复
        </span>
        <button
          type="button"
          onClick={onOpenMaintenance}
          className="inline-flex min-h-9 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-color px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/70"
          aria-label="打开诊断与修复页面"
        >
          打开
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </details>
  );
}
