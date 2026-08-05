export const electronTrackLyricsReadMvp26Service = {
  status: 'mvp26-track-lyrics-read' as const,
  enabledNow: [
    'rootPathToken + trackRelativePath 字幕读取请求',
    'Electron main 只读读取 .lrc / .srt / .vtt / .ass',
    'SRT / VTT / ASS 转换为 LRC 兼容时间轴行',
    '歌词面板沿用现有时间轴高亮与滚动逻辑',
    '字幕缺失 / 过大 / 不安全内容中文提示',
  ],
  stillBlocked: [
    '不暴露 absolutePath',
    '不暴露 file://',
    '不写字幕文件',
    '不编辑字幕文件',
    '不接 SQLite',
    '不做批量字幕生成',
  ],
  supportedExtensions: ['lrc', 'srt', 'vtt', 'ass'],
  next: 'MVP-27：视频 / 图片外部打开，优先系统默认应用 / PotPlayer。',
};
