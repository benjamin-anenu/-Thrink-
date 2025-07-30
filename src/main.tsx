
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize services when the app starts
import { initializeRealTimeServices } from './services/index';

// Initialize connection and error handling
initializeRealTimeServices().catch((error) => {
  console.error('[App] Failed to initialize services:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
