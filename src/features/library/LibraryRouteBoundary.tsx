import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button, Feedback, Surface } from '../../shared/ui';

export interface LibraryRouteBoundaryProps {
  pageTitle: string;
  resetKey: string;
  onReset?: () => void;
  children: ReactNode;
}

interface LibraryRouteBoundaryState {
  error: Error | null;
}

export default class LibraryRouteBoundary extends Component<LibraryRouteBoundaryProps, LibraryRouteBoundaryState> {
  state: LibraryRouteBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): LibraryRouteBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[U37-A library route boundary]', this.props.pageTitle, error, errorInfo.componentStack);
  }

  componentDidUpdate(previousProps: LibraryRouteBoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="yk-library-page yk-library-page-state" data-u37a-library-page="error">
        <Surface className="yk-library-page-state__surface" padding="lg" elevation="raised">
          <div className="yk-library-page-state__icon" data-tone="danger" aria-hidden="true">
            <AlertTriangle />
          </div>
          <Feedback
            tone="danger"
            title={`${this.props.pageTitle}暂时无法显示`}
            description="页面渲染遇到异常。资源库文件和 Index 不会因此被修改，可直接重试当前页面。"
            action={(
              <Button
                variant="primary"
                leadingIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
                onClick={this.handleRetry}
              >
                重试页面
              </Button>
            )}
          />
          <p className="yk-library-page-state__helper">
            错误已限制在当前页面边界内，播放器、队列和其他页面继续保持可用。
          </p>
        </Surface>
      </div>
    );
  }
}
