import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AppShell} from './app/AppShell';
import {ThemeRuntimeBridge} from './app/ThemeRuntimeBridge';
import AutomationCompatibilityProbe from './components/AutomationCompatibilityProbe';
import {installRuntimeAccessibility} from './runtimeAccessibility';
import {automationProfileCleanupService} from './services/automationProfileCleanupService';
import './styles/design-tokens.css';
import './styles/design-components.css';
import './index.css';
import './styles/theme-contrast-bridge.css';
import './styles/empty-state-truthfulness.css';
import './accessibility.css';
import './playerThemeBridge.css';
import './styles/production-shell.css';
import './styles/library-pages.css';
import './styles/rj-detail.css';
import './styles/music-library.css';
import './styles/music-library-track-row.css';
import './styles/u40c-ui-polish.css';

async function bootstrap(): Promise<void> {
  let automationProfile = false;
  try {
    const status = await window.yangKura?.getElectronShellStatus?.() as { automationProfile?: boolean } | undefined;
    automationProfile = status?.automationProfile === true;
  } catch {
    automationProfile = false;
  }

  document.documentElement.dataset.yangKuraAutomationProfile = automationProfile ? 'true' : 'false';
  automationProfileCleanupService.run(automationProfile);
  installRuntimeAccessibility();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeRuntimeBridge>
        <AppShell bridge>
          <AutomationCompatibilityProbe />
          <App />
        </AppShell>
      </ThemeRuntimeBridge>
    </StrictMode>,
  );
}

void bootstrap();
