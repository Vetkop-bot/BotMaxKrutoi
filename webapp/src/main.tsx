import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { maxApp } from './design/hooks/useMaxApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Tell MAX the app has rendered so it hides its loader
maxApp.ready();
