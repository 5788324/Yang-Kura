import type { ReactNode } from 'react';
import { Headphones, LayoutDashboard, Music2, Settings2 } from 'lucide-react';
import { Button, Feedback, Surface } from '../../shared/ui';

export type LibraryPageKind = 'dashboard' | 'asmr' | 'music';

export interface LibraryPageStateProps {
  kind: LibraryPageKind;
  connected: boolean;
  itemCount: number;
  onOpenSettings: () => void;
  children: ReactNode;
}

const PAGE_COPY: Record<LibraryPageKind, {
  label: string;
  disconnectedTitle: string;
  disconnectedDescription: string;
  emptyTitle: string;
  emptyDescription: string;
}> = {
  dashboard: {
    label: '首页',
    disconnectedTitle: '先连接一个本地资源库',
    disconnectedDescription: '选择本地目录并读取 library-index.json 后，首页会显示继续播放、最近加入和常用入口。',
    emptyTitle: '资源库已连接，但当前没有可展示内容',
    emptyDescription: 'Index 已读取成功。可以重新扫描目录、导入文件，或检查当前资源库是否为空。',
  },
  asmr: {
    label: '音声库',
    disconnectedTitle: '连接资源库后浏览音声作品',
    disconnectedDescription: '选择包含 ASMR/RJ 音声的本地目录，再读取或生成索引。绝对路径不会暴露给 Renderer。',
    emptyTitle: '当前音声库没有作品',
    emptyDescription: '资源库连接正常，但没有识别到 ASMR/RJ 集合。可重新扫描或检查索引内容。',
  },
  music: {
    label: '音乐库',
    disconnectedTitle: '连接资源库后浏览本地音乐',
    disconnectedDescription: '选择本地音乐目录并读取索引后，可按歌曲、专辑、艺术家和文件夹浏览。',
    emptyTitle: '当前音乐库没有曲目',
    emptyDescription: '资源库连接正常，但没有识别到普通音乐曲目。可重新扫描或检查索引内容。',
  },
};

function PageIcon({ kind }: { kind: LibraryPageKind }) {
  if (kind === 'asmr') return <Headphones aria-hidden="true" />;
  if (kind === 'music') return <Music2 aria-hidden="true" />;
  return <LayoutDashboard aria-hidden="true" />;
}

export default function LibraryPageState({
  kind,
  connected,
  itemCount,
  onOpenSettings,
  children,
}: LibraryPageStateProps) {
  if (itemCount > 0) {
    return (
      <div className="yk-library-page" data-library-page={kind} data-u37a-library-page="ready">
        {children}
      </div>
    );
  }

  const copy = PAGE_COPY[kind];
  const title = connected ? copy.emptyTitle : copy.disconnectedTitle;
  const description = connected ? copy.emptyDescription : copy.disconnectedDescription;

  return (
    <div className="yk-library-page yk-library-page-state" data-library-page={kind} data-u37a-library-page={connected ? 'empty' : 'disconnected'}>
      <Surface className="yk-library-page-state__surface" padding="lg" elevation="raised">
        <div className="yk-library-page-state__icon" aria-hidden="true">
          <PageIcon kind={kind} />
        </div>
        <Feedback
          tone="info"
          title={title}
          description={description}
          action={(
            <Button
              variant="primary"
              leadingIcon={<Settings2 className="h-4 w-4" aria-hidden="true" />}
              onClick={onOpenSettings}
            >
              {connected ? '检查资源库设置' : '选择资源库'}
            </Button>
          )}
        />
        <p className="yk-library-page-state__helper">
          {copy.label}只读取 tokenized root 与相对路径；现有 Index、播放、字幕和导入安全边界保持不变。
        </p>
      </Surface>
    </div>
  );
}
