
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRealTimeServices } from './services/index.ts'

// Initialize the complete real-time system
initializeRealTimeServices();

createRoot(document.getElementById("root")!).render(<App />);
