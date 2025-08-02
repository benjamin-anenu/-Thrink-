
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRealTimeServices } from './services/index.ts'

// Initialize the complete real-time system
initializeRealTimeServices();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
