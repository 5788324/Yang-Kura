import type { AudioTrack, MusicAlbum, Playlist } from "../types";

export interface MediaSurfaceBadge {
  id: string;
  label: string;
  tone: "emerald" | "indigo" | "amber" | "rose" | "slate" | "purple";
}

export interface MusicLibrarySurfaceSummary {
  albumCount: number;
  trackCount: number;
  localTrackCount: number;
  subtitleTrackCount: number;
  externalOnlyCount: number;
  favoriteTrackCount: number;
}

export interface PlaylistSurfaceSummary {
  playlistCount: number;
  userPlaylistCount: number;
  systemPlaylistCount: number;
  trackCount: number;
  asmrTrackCount: number;
  musicTrackCount: number;
}

const externalOnlyKinds = new Set([
  "video",
  "image",
  "text",
  "archive",
  "other",
]);

function isLocalTrack(track: AudioTrack): boolean {
  return (
    track.playbackSourceKind === "tokenized-local-file" ||
    track.externalOpenSourceKind === "tokenized-local-file"
  );
}

function hasSubtitle(track: AudioTrack): boolean {
  return Boolean(
    track.lyricsRelativePath ||
    (track.subtitleRelativePaths && track.subtitleRelativePaths.length > 0),
  );
}

function isExternalOnlyTrack(track: AudioTrack): boolean {
  return Boolean(track.mediaKind && externalOnlyKinds.has(track.mediaKind));
}

export const mediaSurfaceStatusService = {
  getTrackBadges(track: AudioTrack): MediaSurfaceBadge[] {
    const badges: MediaSurfaceBadge[] = [];

    badges.push({
      id: track.type === "asmr" ? "asmr" : "music",
      label: track.type === "asmr" ? "音声" : "音乐",
      tone: track.type === "asmr" ? "purple" : "emerald",
    });

    if (isLocalTrack(track)) {
      badges.push({ id: "local", label: "本地", tone: "indigo" });
    } else {
      badges.push({ id: "sample", label: "示例", tone: "slate" });
    }

    if (hasSubtitle(track)) {
      badges.push({ id: "subtitle", label: "有字幕", tone: "emerald" });
    }

    if (isExternalOnlyTrack(track)) {
      badges.push({ id: "external", label: "外部打开", tone: "amber" });
    }

    return badges;
  },

  getAlbumBadges(album: MusicAlbum): MediaSurfaceBadge[] {
    const tracks = album.tracks ?? [];
    const localCount = tracks.filter(isLocalTrack).length;
    const subtitleCount = tracks.filter(hasSubtitle).length;
    const externalCount = tracks.filter(isExternalOnlyTrack).length;
    const badges: MediaSurfaceBadge[] = [];

    badges.push({
      id: "track-count",
      label: `${tracks.length} 首`,
      tone: "indigo",
    });
    badges.push({
      id: localCount > 0 ? "local" : "sample",
      label: localCount > 0 ? "本地资源" : "示例资源",
      tone: localCount > 0 ? "emerald" : "slate",
    });
    if (subtitleCount > 0)
      badges.push({
        id: "subtitle",
        label: `${subtitleCount} 首有字幕`,
        tone: "emerald",
      });
    if (externalCount > 0)
      badges.push({
        id: "external",
        label: `${externalCount} 个外部打开`,
        tone: "amber",
      });

    return badges;
  },

  getPlaylistBadges(playlist: Playlist): MediaSurfaceBadge[] {
    const tracks = playlist.tracks ?? [];
    const asmrCount = tracks.filter((track) => track.type === "asmr").length;
    const musicCount = tracks.filter((track) => track.type === "music").length;
    const localCount = tracks.filter(isLocalTrack).length;
    const badges: MediaSurfaceBadge[] = [];

    badges.push({
      id: playlist.isSystem ? "system" : "user",
      label: playlist.isSystem ? "系统示例" : "本地歌单",
      tone: playlist.isSystem ? "slate" : "emerald",
    });
    if (asmrCount > 0)
      badges.push({ id: "asmr", label: `${asmrCount} 音声`, tone: "purple" });
    if (musicCount > 0)
      badges.push({
        id: "music",
        label: `${musicCount} 音乐`,
        tone: "emerald",
      });
    if (localCount > 0)
      badges.push({ id: "local", label: `${localCount} 本地`, tone: "indigo" });
    if (tracks.length === 0)
      badges.push({ id: "empty", label: "空歌单", tone: "amber" });

    return badges;
  },

  getMusicSummary(
    albums: MusicAlbum[],
    favorites: string[] = [],
  ): MusicLibrarySurfaceSummary {
    const tracks = albums.flatMap((album) => album.tracks ?? []);
    const favoriteIds = new Set(favorites);
    return {
      albumCount: albums.length,
      trackCount: tracks.length,
      localTrackCount: tracks.filter(isLocalTrack).length,
      subtitleTrackCount: tracks.filter(hasSubtitle).length,
      externalOnlyCount: tracks.filter(isExternalOnlyTrack).length,
      favoriteTrackCount: tracks.filter((track) => favoriteIds.has(track.id))
        .length,
    };
  },

  getPlaylistSummary(playlists: Playlist[]): PlaylistSurfaceSummary {
    const tracks = playlists.flatMap((playlist) => playlist.tracks ?? []);
    return {
      playlistCount: playlists.length,
      userPlaylistCount: playlists.filter((playlist) => !playlist.isSystem)
        .length,
      systemPlaylistCount: playlists.filter((playlist) => playlist.isSystem)
        .length,
      trackCount: tracks.length,
      asmrTrackCount: tracks.filter((track) => track.type === "asmr").length,
      musicTrackCount: tracks.filter((track) => track.type === "music").length,
    };
  },
};
