export interface PlayerAcceptanceCheckItem {
  id: 'resume' | 'queue-switch' | 'seek' | 'shutdown';
  title: string;
  description: string;
}

export const playerAcceptanceService = {
  version: '0.163.0-mvp125',
  command: 'npm run test:mpv:acceptance',
  checks: [
    {
      id: 'resume',
      title: '进度恢复',
      description: '启动真实 mpv 后确认时间事件返回，并从指定的小样本位置继续播放。',
    },
    {
      id: 'queue-switch',
      title: '队列切歌',
      description: '可选提供第二条音频，验证同一 mpv 进程 loadfile 切换后当前音轨状态同步。',
    },
    {
      id: 'seek',
      title: '暂停与跳转',
      description: '通过正式 IPC 执行暂停、恢复和精确跳转，不直接操作真实路径。',
    },
    {
      id: 'shutdown',
      title: '退出残留',
      description: '测试结束主动回收 mpv，并确认后端不再报告运行、连接或活动音轨。',
    },
  ] satisfies PlayerAcceptanceCheckItem[],
  safetyNotes: [
    '只读取用户明确提供的小样本音频。',
    '不修改、移动、删除或重命名媒体文件。',
    '输出只显示文件名，不打印 absolutePath 或 file://。',
    '未提供测试音频时命令安全跳过，不扫描资源库。',
  ],
} as const;
