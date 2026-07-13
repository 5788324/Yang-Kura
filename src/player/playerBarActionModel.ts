import type { AudioTrack, Playlist } from '../types';

export interface PlaylistSelectionDecision {
  shouldAdd: boolean;
  message: string;
}

export function getPlaylistSelectionDecision(
  track: AudioTrack,
  playlist: Playlist,
): PlaylistSelectionDecision {
  if (playlist.isSystem) {
    return {
      shouldAdd: false,
      message: '系统示例歌单不可修改，请新建自建歌单',
    };
  }

  const alreadyExists = playlist.tracks.some((playlistTrack) => playlistTrack.id === track.id);
  if (alreadyExists) {
    return {
      shouldAdd: false,
      message: '已存在于该歌单中',
    };
  }

  return {
    shouldAdd: true,
    message: `成功收藏到歌单《${playlist.name}》`,
  };
}

export function getFavoriteToggleMessage(isLiked: boolean): string {
  return isLiked ? '已取消喜欢' : '已添加到喜欢';
}

export function getFloatingLyricsToggleMessage(isVisible: boolean): string {
  return isVisible ? '歌词浮窗已关闭' : '歌词浮窗已开启';
}

export const MORE_PLAYER_ACTIONS_MESSAGE = '更多播放操作将在后续版本开放';
