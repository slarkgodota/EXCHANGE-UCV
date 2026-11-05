import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const KEY = 'exchange_ucv_theme';

const initialDark = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved === 'dark';
  } catch {
    /* ignore */
  }
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

/** Botón flotante para cambiar entre modo claro y modo oscuro. */
export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState<boolean>(initialDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-anim');
    root.classList.toggle('dark', dark);
    const t = setTimeout(() => root.classList.remove('theme-anim'), 350);
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
    return () => clearTimeout(t);
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="fixed z-40 bottom-5 right-5 w-14 h-14 rounded-full shadow-xl shadow-slate-900/30 flex items-center justify-center transition hover:scale-110 active:scale-95 bg-gradient-to-br from-red-600 to-[#0a1430] text-white ring-4 ring-white/70"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))', right: 'calc(1.25rem + env(safe-area-inset-right, 0px))' }}
    >
      <span key={String(dark)} className="view-enter">
        {dark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </span>
    </button>
  );
};
