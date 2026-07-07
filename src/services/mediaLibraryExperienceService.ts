import type { AudioTrack, MusicAlbum, Playlist, RJWork } from '../types';

export interface MediaLibraryExperienceOverviewCard {
  id: 'continue' | 'recent' | 'asmr' | 'music' | 'playlist';
  label: string;
  value: string;
  helper: string;
}

export interface MediaLibraryExperienceOverview {
  title: string;
  description: string;
  cards: MediaLibraryExperienceOverviewCard[];
  primaryHint: string;
}

const formatCount = (count: number, suffix: string): string => `${count} ${suffix}`;

const getMusicTrackCount = (albums: MusicAlbum[]): number =>
  albums.reduce((total, album) => total + album.tracks.length, 0);

export const mediaLibraryExperienceService = {
  getDashboardOverview(input: {
    rjWorks: RJWork[];
    musicAlbums: MusicAlbum[];
    playlists: Playlist[];
    recentTracks: AudioTrack[];
    hasRealLibrary: boolean;
  }): MediaLibraryExperienceOverview {
    const musicTrackCount = getMusicTrackCount(input.musicAlbums);
    const playableTrackCount = input.rjWorks.reduce((total, work) => total + work.tracks.length, 0) + musicTrackCount;

    return {
      title: input.hasRealLibrary ? '本地媒体库已可用' : '从导入资源库开始',
      description: input.hasRealLibrary
        ? '可以继续播放、浏览音声作品、查看音乐专辑，或整理自己的歌单。'
        : '选择本地目录后，Yang-Kura 会读取资源记录并在主界面展示你的音声、音乐、字幕和封面。',
      primaryHint: input.hasRealLibrary
        ? '主界面只保留日常使用入口；扫描、索引和调试信息放在设置与诊断页。'
        : '首次使用建议先导入少量样本目录确认识别效果，再扩展到完整资源库。',
      cards: [
        {
          id: 'continue',
          label: '继续播放',
          value: input.recentTracks.length > 0 ? input.recentTracks[0].title : '暂无记录',
          helper: input.recentTracks.length > 0 ? '从上次听到的位置恢复' : '播放一次后会自动出现',
        },
        {
          id: 'asmr',
          label: '音声作品',
          value: formatCount(input.rjWorks.length, '个'),
          helper: '按 RJ / 标题 / 字幕状态浏览',
        },
        {
          id: 'music',
          label: '音乐音轨',
          value: formatCount(musicTrackCount, '首'),
          helper: `${input.musicAlbums.length} 张专辑，和音声共用播放器`,
        },
        {
          id: 'playlist',
          label: '歌单',
          value: formatCount(input.playlists.length, '个'),
          helper: `${playableTrackCount} 条可播放音轨可加入队列`,
        },
      ],
    };
  },
};
