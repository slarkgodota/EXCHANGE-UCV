import React, { useEffect, useState } from 'react';

const KEY = 'exchange_ucv_theme';

const initialDark = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved === 'dark';
  } catch {
    /* ignore */
  }
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
};

/** Emblema hexagonal propio de Exchange UCV: borde dorado, fondo rojo y sol o luna al centro. */
const Emblem: React.FC<{ dark: boolean }> = ({ dark }) => (
  <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden>
    <defs>
      <linearGradient id="emb-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fde68a" />
        <stop offset="0.5" stopColor="#d4a017" />
        <stop offset="1" stopColor="#8a5a00" />
      </linearGradient>
      <radialGradient id="emb-core" cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stopColor={dark ? '#3b4a7a' : '#ef4444'} />
        <stop offset="1" stopColor={dark ? '#0a1430' : '#7f1d1d'} />
      </radialGradient>
    </defs>
    {/* marco hexagonal */}
    <polygon points="32,2 58,17 58,47 32,62 6,47 6,17" fill="url(#emb-gold)" />
    <polygon points="32,7 53.5,19.5 53.5,44.5 32,57 10.5,44.5 10.5,19.5" fill="url(#emb-core)" />
    {/* marcas en los vértices */}
    <g fill="#fde68a" opacity="0.9">
      <circle cx="32" cy="10.5" r="1.4" />
      <circle cx="32" cy="53.5" r="1.4" />
      <circle cx="13.5" cy="21.5" r="1.2" />
      <circle cx="50.5" cy="21.5" r="1.2" />
      <circle cx="13.5" cy="42.5" r="1.2" />
      <circle cx="50.5" cy="42.5" r="1.2" />
    </g>
    {dark ? (
      // sol: estás en modo oscuro, toca para volver a claro
      <g stroke="#fde68a" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <circle cx="32" cy="32" r="7" fill="#fde68a" stroke="none" />
        <path d="M32 18v4M32 42v4M18 32h4M42 32h4M22.1 22.1l2.8 2.8M39.1 39.1l2.8 2.8M22.1 41.9l2.8-2.8M39.1 24.9l2.8-2.8" />
      </g>
    ) : (
      // luna: estás en modo claro, toca para pasar a oscuro
      <path d="M38.5 21.5a11.5 11.5 0 1 0 4 19.2A9.5 9.5 0 0 1 38.5 21.5z" fill="#fde68a" />
    )}
  </svg>
);

/** Botón flotante para cambiar entre modo claro y modo oscuro. */
export const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState<boolean>(initialDark);
  const [spin, setSpin] = useState(0);

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
      onClick={() => {
        setDark(!dark);
        setSpin((s) => s + 1);
      }}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="theme-emblem fixed z-40 w-16 h-16 transition-transform hover:scale-110 active:scale-95"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))', right: 'calc(1.25rem + env(safe-area-inset-right, 0px))' }}
    >
      <span key={spin} className={spin ? 'emblem-spin block w-full h-full' : 'block w-full h-full'}>
        <Emblem dark={dark} />
      </span>
    </button>
  );
};
