import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AppShell} from './app/AppShell';
import {ThemeRuntimeBridge} from './app/ThemeRuntimeBridge';
import {installRuntimeAccessibility} from './runtimeAccessibility';
import './styles/design-tokens.css';
import './styles/design-components.css';
import './index.css';
import './accessibility.css';
import './playerThemeBridge.css';
import './styles/production-shell.css';
import './styles/library-pages.css';
import './styles/rj-detail.css';
import './styles/music-library.css';

installRuntimeAccessibility();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeRuntimeBridge>
      <AppShell bridge>
        <App />
      </AppShell>
    </ThemeRuntimeBridge>
  </StrictMode>,
);
