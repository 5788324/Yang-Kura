import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoonStar, SunMedium } from 'lucide-react';
import {
  applyBeta2Theme,
  getBeta2ThemeLabel,
  persistBeta2Theme,
  readBeta2Theme,
  type Beta2ThemeId,
} from './themeRuntime';

export interface ThemeRuntimeBridgeProps {
  children: ReactNode;
}

export function ThemeRuntimeBridge({ children }: ThemeRuntimeBridgeProps) {
  const [theme, setTheme] = useState<Beta2ThemeId>(() => readBeta2Theme());
  const [topbarTarget, setTopbarTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    applyBeta2Theme(theme);
    persistBeta2Theme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTargets = () => {
      applyBeta2Theme(theme);
      setTopbarTarget(document.getElementById('windows-app-bar'));
    };

    syncTargets();
    const observer = new MutationObserver(syncTargets);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'yang_kura_beta2_theme_v1' || event.key === 'sqlite_settings') {
        setTheme(readBeta2Theme());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const nextTheme: Beta2ThemeId = theme === 'dusk-amber' ? 'mist-ivory' : 'dusk-amber';

  return (
    <>
      {children}
      {topbarTarget
        ? createPortal(
            <button
              id="beta2-theme-toggle"
              type="button"
              data-current-theme={theme}
              aria-label={`当前主题：${getBeta2ThemeLabel(theme)}。切换为${getBeta2ThemeLabel(nextTheme)}`}
              title={`切换为${getBeta2ThemeLabel(nextTheme)}`}
              onClick={() => setTheme(nextTheme)}
              className="yk-theme-toggle"
            >
              {theme === 'dusk-amber' ? <MoonStar aria-hidden="true" /> : <SunMedium aria-hidden="true" />}
              <span>{getBeta2ThemeLabel(theme)}</span>
            </button>,
            topbarTarget,
          )
        : null}
    </>
  );
}
