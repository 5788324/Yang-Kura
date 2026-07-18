import { AlertTriangle, LoaderCircle, RefreshCw } from 'lucide-react';
import type { LibrarySessionReadAttemptSnapshot } from '../../services/librarySessionService';
import { Button, Feedback, Surface } from '../../shared/ui';

interface LibraryReadStateNoticeProps {
  attempt: LibrarySessionReadAttemptSnapshot;
  onOpenSettings: () => void;
  blocking?: boolean;
}

export default function LibraryReadStateNotice({ attempt, onOpenSettings, blocking = false }: LibraryReadStateNoticeProps) {
  const reading = attempt.status === 'reading';
  const title = reading
    ? '正在读取资源库'
    : attempt.status === 'timed-out'
      ? '读取等待超时'
      : attempt.status === 'interrupted'
        ? '上一次读取未正常结束'
        : '资源库读取失败';
  const description = reading
    ? `${attempt.displayName ? `正在读取「${attempt.displayName}」。` : ''}完成后首页、音声库、音乐库和设置页会同时更新。`
    : attempt.message;

  return (
    <Surface
      className={blocking ? 'yk-library-page-state__surface' : 'mb-4'}
      padding="lg"
      elevation="raised"
      data-u40d-library-read-state={attempt.status}
    >
      <div className="mb-3 flex items-center gap-2 text-brand-color">
        {reading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        <span className="text-xs font-bold">统一资源库状态</span>
      </div>
      <Feedback
        tone={reading ? 'info' : 'warning'}
        title={title}
        description={description}
        action={!reading ? (
          <Button variant="primary" leadingIcon={<RefreshCw className="h-4 w-4" />} onClick={onOpenSettings}>
            前往设置重试
          </Button>
        ) : undefined}
      />
    </Surface>
  );
}
