
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize services in the background without blocking app startup
const initializeServices = async () => {
  try {
    const { initializeRealTimeServices } = await import('./services/index');
    await initializeRealTimeServices();
  } catch (error) {
    console.warn('[App] Background service initialization warning:', error);
    // Don't let service initialization failures break the app
  }
};

// Start services after the app renders
setTimeout(initializeServices, 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
