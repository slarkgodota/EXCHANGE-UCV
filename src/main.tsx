import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Aplicar el tema guardado antes de dibujar (evita un destello claro)
try {
  const t = localStorage.getItem('exchange_ucv_theme');
  if (t === 'dark' || (!t && window.matchMedia?.('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
} catch {}

// Register service worker for instant offline availability
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
