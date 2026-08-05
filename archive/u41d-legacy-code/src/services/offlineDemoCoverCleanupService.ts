export type Mvp81OfflineCoverTone = 'success' | 'warning' | 'neutral';

export interface Mvp81OfflineCoverCheck {
  id: string;
  label: string;
  status: string;
  description: string;
  tone: Mvp81OfflineCoverTone;
}

export interface Mvp81OfflineDemoCoverCleanupModel {
  version: '0.119.0-mvp81';
  title: string;
  summary: string;
  checks: Mvp81OfflineCoverCheck[];
  guardrails: string[];
  hiddenMaintenanceNote: string;
}

export const offlineDemoCoverCleanupService = {
  getModel(): Mvp81OfflineDemoCoverCleanupModel {
    return {
      version: '0.119.0-mvp81',
      title: 'MVP-81 离线 Demo 封面清扫',
      summary: '移除 UI 原型中的 Unsplash 远程封面占位，统一改用本地生成 SVG 封面，避免公司网络/离线环境下出现图片请求失败或控制台噪音。',
      checks: [
        {
          id: 'mock-data-local-covers',
          label: 'Mock 数据封面',
          status: '已本地化',
          description: 'mockData.ts 的默认封面改为 coverArtworkService 生成的 data:image/svg+xml，占位仍有媒体感但不联网。',
          tone: 'success',
        },
        {
          id: 'downloader-demo-local-covers',
          label: '下载器 Demo 封面',
          status: '已本地化',
          description: '下载器页继续保持 Demo / Coming Soon，不再请求外部图片，也不新增真实下载行为。',
          tone: 'success',
        },
        {
          id: 'diagnostics-demo-local-covers',
          label: '诊断 Demo 封面',
          status: '已本地化',
          description: '诊断页的模拟导入/扫描数据改用本地生成封面，减少控制台 404 / 网络阻断噪音。',
          tone: 'success',
        },
        {
          id: 'playlist-user-cover-local',
          label: '自建歌单默认封面',
          status: '已本地化',
          description: '新建歌单默认封面由本地生成，不依赖外部图片服务。',
          tone: 'success',
        },
      ],
      guardrails: [
        '不新增网络请求。',
        '不读取真实媒体文件。',
        '不写入 library-index.json。',
        '不修改播放内核。',
        '不向 Renderer 暴露 absolutePath。',
        '不向 Renderer 暴露 file://。',
      ],
      hiddenMaintenanceNote: 'mvp81-offline-demo-cover-cleanup keeps demo imagery local-only and leaves scanner/index/playback/file safety unchanged.',
    };
  },

  getToneClassName(tone: Mvp81OfflineCoverTone): string {
    if (tone === 'success') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    if (tone === 'warning') return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    return 'border-zinc-700/50 bg-zinc-900/50 text-zinc-200';
  },
};
