import type { PlayerState } from '../types';
import { betaRegressionChecklistService } from '../services/betaRegressionChecklistService';
import { homePlayerBetaPolishService } from '../services/homePlayerBetaPolishService';
import { listeningExperiencePolishService } from '../services/listeningExperiencePolishService';
import { playerBarDailyCleanupService } from '../services/playerBarDailyCleanupService';
import { playerExperienceService } from '../services/playerExperienceService';
import { playerUiBugfixService } from '../services/playerUiBugfixService';
import { playerVisualPolishService } from '../services/playerVisualPolishService';
import { formatPlayerTime, getPlayerVolumeMetrics } from './playerBarMath';

export interface PlayerBarPresentationInput {
  playerState: PlayerState;
  displayProgress: number;
  duration: number;
}

export function createPlayerBarPresentationModel({
  playerState,
  displayProgress,
  duration,
}: PlayerBarPresentationInput) {
  const experience = playerExperienceService.getSummary(playerState);
  const listening = listeningExperiencePolishService.getPlayerBarModel(playerState);
  const visual = playerVisualPolishService.getPlayerBarModel(playerState);
  const regression = betaRegressionChecklistService.getPlayerModel(playerState);
  const beta = homePlayerBetaPolishService.getPlayerBarModel(playerState);
  const daily = playerBarDailyCleanupService.getPlayerBarModel(playerState);
  const compatibility = playerUiBugfixService.getModel();
  const volume = getPlayerVolumeMetrics(playerState.volume, playerState.isMuted);
  const hasTrack = playerState.currentTrack !== null;

  return {
    hasTrack,
    trackSummary: {
      isPlaying: playerState.isPlaying,
      playbackError: playerState.playbackError,
      playbackNotice: playerState.playbackNotice,
      compactStatus: daily.compactStatus,
      visibleBadges: daily.visibleBadges,
      hiddenMaintenanceNote: daily.hiddenMaintenanceNote,
      completionModeDescription: experience.completionModeDescription,
      statusBadges: listening.statusBadges,
      visualContextLine: visual.contextLine,
      regressionLine: regression.compactLine,
      compactLine: beta.compactLine,
    },
    emptyState: {
      title: beta.emptyTitle,
      hint: beta.emptyHint,
      regressionLine: regression.compactLine,
    },
    transport: {
      hasTrack,
      loopMode: playerState.loopMode,
      playbackMode: playerState.playbackMode,
      isPlaying: playerState.isPlaying,
      queueCount: playerState.queue.length,
      currentTimeLabel: formatPlayerTime(displayProgress),
      durationLabel: formatPlayerTime(duration),
    },
    auxiliary: {
      hasTrack,
      completionLabel: listening.completionLabel,
      completionHint: listening.completionHint,
      isMuted: playerState.isMuted,
      visibleVolume: volume.visibleVolume,
      visibleVolumePercent: volume.visibleVolumePercent,
    },
    compatibility: {
      betaChips: beta.chips,
      hiddenMaintenanceNote: compatibility.hiddenMaintenanceNote,
    },
  };
}

export type PlayerBarPresentationModel = ReturnType<typeof createPlayerBarPresentationModel>;
