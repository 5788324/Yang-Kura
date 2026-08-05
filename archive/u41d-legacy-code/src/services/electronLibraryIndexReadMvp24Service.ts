export type ElectronLibraryIndexReadMvp24Status = 'mvp24-library-index-read-ui-data-source';

export interface ElectronLibraryIndexReadMvp24Contract {
  status: ElectronLibraryIndexReadMvp24Status;
  enabledNow: string[];
  stillNotDoing: string[];
  uiMappingRules: string[];
  storageKeys: string[];
}

export const electronLibraryIndexReadMvp24Service = {
  getContract(): ElectronLibraryIndexReadMvp24Contract {
    return {
      status: 'mvp24-library-index-read-ui-data-source',
      enabledNow: [
        'Electron main 可读取用户选择目录根部的 library-index.json。',
        'Renderer 通过 rootPathToken 请求读取，不提交 absolutePath。',
        '读取结果写入 localStorage.yang_kura_last_read_library_index_result。',
        'App 启动或收到 yang-kura-library-index-loaded 事件后，将 index 映射为 RJWork / MusicAlbum。',
      ],
      stillNotDoing: [
        '不返回 absolutePath / file://。',
        '不读取音频正文。',
        '不读取 LRC 正文。',
        '不接 SQLite。',
        '不删除、移动、重命名媒体文件。',
      ],
      uiMappingRules: [
        'rj_work collection 映射到音声库 RJWork。',
        'music_album / music_folder collection 映射到音乐库 MusicAlbum。',
        'track.source.relativePath 显示为文件树路径。',
        '本地封面暂不生成 file://，没有可显示 URL 时使用安全占位封面。',
      ],
      storageKeys: [
        'yang_kura_last_read_library_index_result',
        'yang_kura_last_index_write_result',
        'yang_kura_last_dry_run_result',
      ],
    };
  },
};
