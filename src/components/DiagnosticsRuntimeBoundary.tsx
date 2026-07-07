import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';

interface DiagnosticsRuntimeBoundaryProps {
  children: ReactNode;
  resetKey: string;
}

interface DiagnosticsRuntimeBoundaryState {
  hasError: boolean;
  message: string;
}

export class DiagnosticsRuntimeBoundary extends Component<
  DiagnosticsRuntimeBoundaryProps,
  DiagnosticsRuntimeBoundaryState
> {
  declare props: DiagnosticsRuntimeBoundaryProps;
  declare setState: (state: Partial<DiagnosticsRuntimeBoundaryState>) => void;

  state: DiagnosticsRuntimeBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: unknown): DiagnosticsRuntimeBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('[Yang-Kura] Diagnostics runtime boundary caught an error.', error, errorInfo);
  }

  componentDidUpdate(prevProps: DiagnosticsRuntimeBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section
        id="mvp64-diagnostics-runtime-fallback"
        className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 shadow-sm space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>MVP-64 诊断页运行时保护</span>
            </div>
            <h2 className="text-lg font-bold text-text-primary">诊断页已进入安全降级视图</h2>
            <p className="max-w-2xl text-xs leading-relaxed text-text-secondary">
              某个诊断区块渲染时出现异常。Yang-Kura 已拦截错误，避免 Electron 窗口变成黑屏。
              这不会删除、移动、重命名真实媒体文件，也不会改动资源库索引。
            </p>
          </div>
          <ShieldCheck className="h-8 w-8 flex-shrink-0 text-emerald-300" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-[11px] leading-relaxed text-text-muted">
          <p className="font-bold text-text-primary">错误摘要</p>
          <p className="mt-1 font-mono text-amber-100">{this.state.message || '未知诊断页运行时错误'}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['主流程保护', '首页、音声库、音乐库、播放器不应被诊断页错误拖崩。'],
            ['本地安全边界', 'Renderer 仍不接收 absolutePath / file://。'],
            ['下一步复测', '重新进入诊断页，确认不再出现黑视图。'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-bg-primary/35 p-3">
              <p className="text-xs font-bold text-text-primary">{title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-text-muted">{desc}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => this.setState({ hasError: false, message: '' })}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition hover:bg-amber-400"
        >
          <RefreshCw className="h-4 w-4" />
          重新尝试打开诊断页
        </button>
      </section>
    );
  }
}

export default DiagnosticsRuntimeBoundary;
