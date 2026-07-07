export const electronExternalOpenMvp27Service = {
  getContract() {
    return {
      stage: 'MVP-27',
      title: '视频 / 图片 / 文件外部打开',
      allowedIpc: [
        'yang-kura:external:open-file',
        'yang-kura:external:open-in-file-manager',
      ],
      allowedActions: [
        '用系统默认应用打开 tokenized root 下的视频、图片、音频、文本或压缩包',
        '在系统文件管理器中定位 tokenized root 下的文件或目录',
      ],
      forbiddenActions: [
        '不删除文件',
        '不移动文件',
        '不重命名文件',
        '不把 absolutePath 返回给 Renderer',
        '不把 file:// 返回给 Renderer',
        '不内置视频播放器',
        '不回写外部播放器播放进度',
      ],
      rendererInputs: ['rootPathToken', 'relativePath', 'entryId', 'expectedKind'],
      rendererOutputs: ['ok', 'status', 'message', 'relativePath', 'openedWith', 'absolutePathReturned=false', 'fileUrlReturned=false'],
    };
  },
};
