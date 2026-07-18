import { useEffect, useRef, useState, type ReactNode } from 'react';
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
              aria-label={`当前主题：${currentThemeLabel}。切换为${getBeta2ThemeLabel(nextTheme)}`}
              title={`当前主题：${currentThemeLabel}；切换为${getBeta2ThemeLabel(nextTheme)}`}
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
