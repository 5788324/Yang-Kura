import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {installRuntimeAccessibility} from './runtimeAccessibility';
import './index.css';
import './accessibility.css';

installRuntimeAccessibility();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
