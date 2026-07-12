export type MpvPlaybackPreference = 'prefer-mpv' | 'html-audio-only';

const STORAGE_KEY = 'yang_kura_mpv_playback_preference_v1';
const UPDATE_EVENT = 'yang-kura-mpv-playback-preference-changed';

function isPreference(value: unknown): value is MpvPlaybackPreference {
  return value === 'prefer-mpv' || value === 'html-audio-only';
}

export const mpvPlaybackPreferenceService = {
  storageKey: STORAGE_KEY,
  updateEventName: UPDATE_EVENT,

  getPreference(): MpvPlaybackPreference {
    if (typeof window === 'undefined') return 'prefer-mpv';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPreference(stored) ? stored : 'prefer-mpv';
  },

  setPreference(preference: MpvPlaybackPreference): MpvPlaybackPreference {
    const next = isPreference(preference) ? preference : 'prefer-mpv';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent<MpvPlaybackPreference>(UPDATE_EVENT, { detail: next }));
    }
    return next;
  },

  getLabel(preference: MpvPlaybackPreference): string {
    return preference === 'html-audio-only' ? '仅使用 HTMLAudio' : '优先使用 mpv';
  },

  shouldAttemptMpv(preference: MpvPlaybackPreference): boolean {
    return preference !== 'html-audio-only';
  },
};
