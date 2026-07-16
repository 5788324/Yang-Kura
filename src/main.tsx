import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {installRuntimeAccessibility} from './runtimeAccessibility';
import './styles/design-tokens.css';
import './styles/design-components.css';
import './index.css';
import './accessibility.css';
import './playerThemeBridge.css';

installRuntimeAccessibility();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
