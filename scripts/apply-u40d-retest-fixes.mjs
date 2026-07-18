import fs from 'node:fs';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function replaceExact(file, from, to) {
  const current = read(file);
  if (!current.includes(from)) {
    throw new Error(`${file}: expected patch anchor not found`);
  }
  write(file, current.replace(from, to));
}

replaceExact(
  'src/components/PlaylistPage.tsx',
  '共 ${filteredPlaylists.length} 个歌单、${playlistSummary.trackCount} 首音轨；自建歌单保存在本机。',
  '共 {filteredPlaylists.length} 个歌单、{playlistSummary.trackCount} 首音轨；自建歌单保存在本机。',
);

replaceExact(
  'src/components/ImporterPage.tsx',
  `      <details\n        id="mvp107-importer-ai-maintenance-fold"\n        className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 shadow-sm"\n      >`,
  `      <details\n        id="mvp107-importer-ai-maintenance-fold"\n        hidden\n        aria-hidden="true"\n        className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-5 shadow-sm"\n      >`,
);

write('src/app/themeRuntime.ts', `export type Beta2ThemeId = 'dusk-amber' | 'mist-ivory';
export type LegacyThemeCompatibilityId = 'dark' | 'acrylic-mist' | 'ocean-drops';

export const BETA2_THEME_STORAGE_KEY = 'yang_kura_beta2_theme_v1';
export const LEGACY_SETTINGS_STORAGE_KEY = 'sqlite_settings';

const LEGACY_THEME_MAP: Record<string, Beta2ThemeId> = {
  dark: 'dusk-amber',
  'acrylic-mist': 'dusk-amber',
  'ocean-drops': 'mist-ivory',
  'dusk-amber': 'dusk-amber',
  'mist-ivory': 'mist-ivory',
};

const CANONICAL_THEME_TO_LEGACY: Record<Beta2ThemeId, LegacyThemeCompatibilityId> = {
  'dusk-amber': 'dark',
  'mist-ivory': 'ocean-drops',
};

export const normalizeLegacyThemeCompatibilityId = (value: unknown): LegacyThemeCompatibilityId => {
  if (value === 'acrylic-mist' || value === 'ocean-drops') return value;
  return 'dark';
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

export const readLegacyThemeCompatibilityId = (): LegacyThemeCompatibilityId =>
  normalizeLegacyThemeCompatibilityId(readLegacyTheme());

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

export const getLegacyThemeCompatibilityId = (theme: Beta2ThemeId): LegacyThemeCompatibilityId =>
  CANONICAL_THEME_TO_LEGACY[theme];

export const getLegacyThemeLabel = (theme: LegacyThemeCompatibilityId): string => {
  if (theme === 'acrylic-mist') return '云雾亚克力';
  if (theme === 'ocean-drops') return '微光海洋';
  return '高雅黑';
};

export const getBeta2ThemeLabel = (theme: Beta2ThemeId): string =>
  theme === 'dusk-amber' ? '暮夜琥珀' : '雾光象牙';

export const applyBeta2Theme = (theme: Beta2ThemeId): void => {
  if (typeof document === 'undefined') return;
  const themeClass = \`theme-\${theme}\`;
  const otherThemeClass = theme === 'dusk-amber' ? 'theme-mist-ivory' : 'theme-dusk-amber';
  const targets = [document.documentElement, document.body, document.querySelector('.u32-release-ui')]
    .filter((target): target is HTMLElement => target instanceof HTMLElement);

  for (const target of targets) {
    if (target.classList.contains(otherThemeClass)) target.classList.remove(otherThemeClass);
    if (!target.classList.contains(themeClass)) target.classList.add(themeClass);
    if (target.dataset.ykTheme !== theme) target.dataset.ykTheme = theme;
  }
};
`);

write('src/app/ThemeRuntimeBridge.tsx', `import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoonStar, SunMedium } from 'lucide-react';
import {
  applyBeta2Theme,
  getBeta2ThemeLabel,
  getLegacyThemeCompatibilityId,
  getLegacyThemeLabel,
  normalizeBeta2Theme,
  normalizeLegacyThemeCompatibilityId,
  persistBeta2Theme,
  persistLegacyThemeCompatibility,
  readBeta2Theme,
  readLegacyThemeCompatibilityId,
  type Beta2ThemeId,
  type LegacyThemeCompatibilityId,
} from './themeRuntime';

export interface ThemeRuntimeBridgeProps {
  children: ReactNode;
}

export function ThemeRuntimeBridge({ children }: ThemeRuntimeBridgeProps) {
  const [theme, setTheme] = useState<Beta2ThemeId>(() => readBeta2Theme());
  const [legacyTheme, setLegacyTheme] = useState<LegacyThemeCompatibilityId>(() => readLegacyThemeCompatibilityId());
  const [topbarTarget, setTopbarTarget] = useState<HTMLElement | null>(null);
  const lastLegacyThemeRef = useRef<string | null>(null);

  useEffect(() => {
    applyBeta2Theme(theme);
    persistBeta2Theme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTargets = () => {
      const appRoot = document.querySelector<HTMLElement>('.u32-release-ui');
      const legacyThemeValue = appRoot?.dataset.u30Theme ?? null;

      if (legacyThemeValue) {
        const normalizedLegacy = normalizeLegacyThemeCompatibilityId(legacyThemeValue);
        setLegacyTheme((current) => current === normalizedLegacy ? current : normalizedLegacy);

        if (lastLegacyThemeRef.current === null) {
          lastLegacyThemeRef.current = legacyThemeValue;
        } else if (legacyThemeValue !== lastLegacyThemeRef.current) {
          lastLegacyThemeRef.current = legacyThemeValue;
          const normalized = normalizeBeta2Theme(legacyThemeValue);
          if (normalized !== theme) {
            setTheme(normalized);
            return;
          }
        }
      }

      applyBeta2Theme(theme);
      setTopbarTarget(document.getElementById('windows-app-bar'));
    };

    syncTargets();
    const observer = new MutationObserver(syncTargets);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-u30-theme'],
    });
    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'yang_kura_beta2_theme_v1' || event.key === 'sqlite_settings') {
        setTheme(readBeta2Theme());
        setLegacyTheme(readLegacyThemeCompatibilityId());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const selectTheme = (nextTheme: Beta2ThemeId) => {
    const nextLegacyTheme = getLegacyThemeCompatibilityId(nextTheme);
    persistLegacyThemeCompatibility(nextTheme);
    lastLegacyThemeRef.current = nextLegacyTheme;
    setLegacyTheme(nextLegacyTheme);
    const appRoot = document.querySelector<HTMLElement>('.u32-release-ui');
    if (appRoot) appRoot.dataset.u30Theme = nextLegacyTheme;
    setTheme(nextTheme);
  };

  const nextTheme: Beta2ThemeId = theme === 'dusk-amber' ? 'mist-ivory' : 'dusk-amber';
  const currentThemeLabel = getLegacyThemeLabel(legacyTheme);

  return (
    <>
      {children}
      {topbarTarget
        ? createPortal(
            <button
              id="beta2-theme-toggle"
              type="button"
              data-current-theme={theme}
              data-current-legacy-theme={legacyTheme}
              aria-label={\`当前主题：\${currentThemeLabel}。切换为\${getBeta2ThemeLabel(nextTheme)}\`}
              title={\`当前主题：\${currentThemeLabel}；切换为\${getBeta2ThemeLabel(nextTheme)}\`}
              onClick={() => selectTheme(nextTheme)}
              className="yk-theme-toggle"
            >
              {theme === 'dusk-amber' ? <MoonStar aria-hidden="true" /> : <SunMedium aria-hidden="true" />}
              <span>{currentThemeLabel}</span>
            </button>,
            topbarTarget,
          )
        : null}
    </>
  );
}
`);

replaceExact(
  'electron/main.ts',
  `const e2eUserDataPath = process.env.YANG_KURA_E2E_MODE === '1'\n  ? process.env.YANG_KURA_E2E_USER_DATA_ROOT?.trim()\n  : undefined;\nconst stableUserDataPath = e2eUserDataPath\n  ? path.resolve(e2eUserDataPath)\n  : path.join(app.getPath('appData'), 'Yang-Kura');`,
  `const isolatedUserDataPath = process.env.YANG_KURA_USER_DATA_ROOT?.trim();\nconst e2eUserDataPath = process.env.YANG_KURA_E2E_MODE === '1'\n  ? process.env.YANG_KURA_E2E_USER_DATA_ROOT?.trim()\n  : undefined;\nconst stableUserDataPath = isolatedUserDataPath\n  ? path.resolve(isolatedUserDataPath)\n  : e2eUserDataPath\n    ? path.resolve(e2eUserDataPath)\n    : path.join(app.getPath('appData'), 'Yang-Kura');`,
);

replaceExact(
  'electron/main.ts',
  `configureStableAppStorage();\n\nconst mpvSettingsStore`,
  `configureStableAppStorage();\n\nconst hasSingleInstanceLock = app.requestSingleInstanceLock();\nif (!hasSingleInstanceLock) {\n  app.quit();\n} else {\n  app.on('second-instance', () => {\n    const existingWindow = BrowserWindow.getAllWindows()[0];\n    if (!existingWindow) return;\n    if (existingWindow.isMinimized()) existingWindow.restore();\n    if (!existingWindow.isVisible()) existingWindow.show();\n    existingWindow.focus();\n  });\n}\n\nconst mpvSettingsStore`,
);

replaceExact(
  'electron/main.ts',
  `app.whenReady().then(async () => {\n  await mpvSettingsStore.initialize();`,
  `app.whenReady().then(async () => {\n  if (!hasSingleInstanceLock) return;\n  await mpvSettingsStore.initialize();`,
);

console.log('Focused U40-D Codex retest fixes applied.');
