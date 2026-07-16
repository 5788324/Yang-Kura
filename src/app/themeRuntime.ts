export type Beta2ThemeId = 'dusk-amber' | 'mist-ivory';

export const BETA2_THEME_STORAGE_KEY = 'yang_kura_beta2_theme_v1';
export const LEGACY_SETTINGS_STORAGE_KEY = 'sqlite_settings';

const LEGACY_THEME_MAP: Record<string, Beta2ThemeId> = {
  dark: 'dusk-amber',
  'acrylic-mist': 'dusk-amber',
  'ocean-drops': 'mist-ivory',
  'dusk-amber': 'dusk-amber',
  'mist-ivory': 'mist-ivory',
};

const CANONICAL_THEME_TO_LEGACY: Record<Beta2ThemeId, 'dark' | 'ocean-drops'> = {
  'dusk-amber': 'dark',
  'mist-ivory': 'ocean-drops',
};

export const normalizeBeta2Theme = (value: unknown): Beta2ThemeId =>
  typeof value === 'string' && value in LEGACY_THEME_MAP
    ? LEGACY_THEME_MAP[value]
    : 'dusk-amber';

const readLegacyTheme = (): unknown => {
  if (typeof localStorage === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { currentTheme?: unknown };
    return parsed.currentTheme;
  } catch {
    return undefined;
  }
};

export const readBeta2Theme = (): Beta2ThemeId => {
  if (typeof localStorage === 'undefined') return 'dusk-amber';
  const explicit = localStorage.getItem(BETA2_THEME_STORAGE_KEY);
  return normalizeBeta2Theme(explicit ?? readLegacyTheme());
};

export const persistBeta2Theme = (theme: Beta2ThemeId): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BETA2_THEME_STORAGE_KEY, theme);
};

export const persistLegacyThemeCompatibility = (theme: Beta2ThemeId): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    localStorage.setItem(LEGACY_SETTINGS_STORAGE_KEY, JSON.stringify({
      ...parsed,
      currentTheme: CANONICAL_THEME_TO_LEGACY[theme],
    }));
  } catch {
    // Keep the canonical preference authoritative if the legacy payload is unreadable.
  }
};

export const getLegacyThemeCompatibilityId = (theme: Beta2ThemeId): string =>
  CANONICAL_THEME_TO_LEGACY[theme];

export const getBeta2ThemeLabel = (theme: Beta2ThemeId): string =>
  theme === 'dusk-amber' ? '暮夜琥珀' : '雾光象牙';

export const applyBeta2Theme = (theme: Beta2ThemeId): void => {
  if (typeof document === 'undefined') return;
  const themeClass = `theme-${theme}`;
  const otherThemeClass = theme === 'dusk-amber' ? 'theme-mist-ivory' : 'theme-dusk-amber';
  const targets = [document.documentElement, document.body, document.querySelector('.u32-release-ui')]
    .filter((target): target is HTMLElement => target instanceof HTMLElement);

  for (const target of targets) {
    if (target.classList.contains(otherThemeClass)) target.classList.remove(otherThemeClass);
    if (!target.classList.contains(themeClass)) target.classList.add(themeClass);
    if (target.dataset.ykTheme !== theme) target.dataset.ykTheme = theme;
  }
};
