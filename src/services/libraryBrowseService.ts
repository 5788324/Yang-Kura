import type { AudioTrack, RJWork } from '../types';
import { playbackHistoryService, type PlaybackHistoryEntry } from './playbackHistoryService';

export type WorkSubtitleFilter = 'all' | 'has-subtitle' | 'missing-subtitle';
export type WorkPlaybackFilter = 'all' | 'unplayed' | 'in-progress' | 'completed';
export type WorkSourceFilter = 'all' | 'local-index' | 'demo';

export interface WorkSubtitleSummary {
  hasSubtitle: boolean;
  subtitleTrackCount: number;
  totalTrackCount: number;
}

export interface WorkPlaybackSummary {
  state: Exclude<WorkPlaybackFilter, 'all'>;
  playedTrackCount: number;
  completedTrackCount: number;
  totalTrackCount: number;
  maxPercent: number;
  lastPlayedAt?: string;
}

const hasTrackSubtitle = (track: AudioTrack): boolean => {
  if ((track.subtitleRelativePaths || []).length > 0) return true;
  if (track.lyricsRelativePath) return true;
  if (track.lyricsSourceKind === 'local-file') return true;
  if ((track.lyrics || []).length > 0) return true;
  return false;
};

const isLocalIndexTrack = (track: AudioTrack): boolean => Boolean(track.rootPathToken && track.sourceRelativePath);

const makeHistoryMap = (): Map<string, PlaybackHistoryEntry> => {
  const result = new Map<string, PlaybackHistoryEntry>();
  playbackHistoryService.load().forEach((entry) => result.set(entry.trackId, entry));
  return result;
};

export const libraryBrowseService = {
  getWorkSubtitleSummary(work: RJWork): WorkSubtitleSummary {
    const totalTrackCount = work.tracks.length;
    const subtitleTrackCount = work.tracks.filter(hasTrackSubtitle).length;
    return {
      hasSubtitle: subtitleTrackCount > 0,
      subtitleTrackCount,
      totalTrackCount,
    };
  },

  getWorkSourceKind(work: RJWork): Exclude<WorkSourceFilter, 'all'> {
    return work.tracks.some(isLocalIndexTrack) ? 'local-index' : 'demo';
  },

  getWorkPlaybackSummary(work: RJWork, historyMap = makeHistoryMap()): WorkPlaybackSummary {
    const totalTrackCount = work.tracks.length;
    const entries = work.tracks
      .map((track) => historyMap.get(track.id))
      .filter((entry): entry is PlaybackHistoryEntry => Boolean(entry));
    const playedTrackCount = entries.length;
    const completedTrackCount = entries.filter((entry) => entry.completed).length;
    const maxPercent = entries.reduce((max, entry) => Math.max(max, entry.percent || 0), 0);
    const lastPlayedAt = entries
      .map((entry) => entry.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    let state: WorkPlaybackSummary['state'] = 'unplayed';
    if (totalTrackCount > 0 && completedTrackCount >= totalTrackCount) {
      state = 'completed';
    } else if (playedTrackCount > 0 || maxPercent > 0) {
      state = 'in-progress';
    }

    return {
      state,
      playedTrackCount,
      completedTrackCount,
      totalTrackCount,
      maxPercent,
      lastPlayedAt,
    };
  },

  buildHistoryMap: makeHistoryMap,

  getLastPlayedSortValue(work: RJWork, historyMap = makeHistoryMap()): number {
    const summary = this.getWorkPlaybackSummary(work, historyMap);
    return summary.lastPlayedAt ? new Date(summary.lastPlayedAt).getTime() : 0;
  },

  matchesSubtitleFilter(work: RJWork, filter: WorkSubtitleFilter): boolean {
    if (filter === 'all') return true;
    const summary = this.getWorkSubtitleSummary(work);
    return filter === 'has-subtitle' ? summary.hasSubtitle : !summary.hasSubtitle;
  },

  matchesPlaybackFilter(work: RJWork, filter: WorkPlaybackFilter, historyMap = makeHistoryMap()): boolean {
    if (filter === 'all') return true;
    return this.getWorkPlaybackSummary(work, historyMap).state === filter;
  },

  matchesSourceFilter(work: RJWork, filter: WorkSourceFilter): boolean {
    if (filter === 'all') return true;
    return this.getWorkSourceKind(work) === filter;
  },

  formatPlaybackText(summary: WorkPlaybackSummary): string {
    if (summary.state === 'completed') return '已听完';
    if (summary.state === 'in-progress') return `听到 ${Math.round(summary.maxPercent)}%`;
    return '未播放';
  },
};
