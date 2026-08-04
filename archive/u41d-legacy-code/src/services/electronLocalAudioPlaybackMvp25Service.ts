export const electronLocalAudioPlaybackMvp25Service = {
  status: 'mvp25-html-audio-local-playback' as const,
  enabledNow: [
    'rootPathToken + relativePath 媒体 URL 解析',
    'yang-kura-media:// 受控媒体协议',
    'HTMLAudio 播放 mp3 / wav / flac / m4a / aac / ogg / opus',
    '播放失败中文提示',
    '进度与最近播放继续使用 localStorage',
  ],
  stillBlocked: [
    '不暴露 absolutePath',
    '不暴露 file://',
    '不接 SQLite',
    '不读 LRC 正文',
    '不做删除 / 移动 / 重命名',
    '不接下载器',
  ],
  supportedExtensions: ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus'],
  next: 'MVP-26：LRC / 字幕正文读取与歌词模式同步。',
};
