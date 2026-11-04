import { useEffect, useState } from 'react';

/** Vistas de la plataforma. Cada una se muestra por separado. */
export const VIEWS = ['inicio', 'catalogo', 'biblioteca', 'sedes'] as const;
export type View = (typeof VIEWS)[number];

const readView = (): View => {
  if (typeof window === 'undefined') return 'inicio';
  const h = window.location.hash.replace('#', '') as View;
  return (VIEWS as readonly string[]).includes(h) ? h : 'inicio';
};

/** Navega a una vista usando el hash de la URL (#catalogo, #biblioteca…). */
export function goTo(view: View) {
  if (readView() === view) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = view;
}

export function useView(): View {
  const [view, setView] = useState<View>(readView);
  useEffect(() => {
    const onHash = () => {
      setView(readView());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return view;
}
