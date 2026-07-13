import type { ThemeType } from '../types';

export const SUPPORTED_THEME_IDS = [
  'dark',
  'acrylic-mist',
  'ocean-drops',
] as const satisfies readonly ThemeType[];

export const DEFAULT_THEME_ID: ThemeType = 'acrylic-mist';

export function isSupportedTheme(value: unknown): value is ThemeType {
  return typeof value === 'string'
    && (SUPPORTED_THEME_IDS as readonly string[]).includes(value);
}

export function normalizeThemeType(value: unknown): ThemeType {
  return isSupportedTheme(value) ? value : DEFAULT_THEME_ID;
}
