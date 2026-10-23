import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress Vite HMR websocket closure errors in preview mode
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('WebSocket')) {
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('WebSocket')) {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
