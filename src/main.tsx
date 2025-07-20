
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import { initializeRealTimeServices } from './services/index.ts'

// Initialize the complete real-time system
// initializeRealTimeServices(); // Temporarily disabled to prevent errors

createRoot(document.getElementById("root")!).render(<App />);
