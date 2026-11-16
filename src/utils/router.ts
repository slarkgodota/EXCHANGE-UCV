import { useEffect, useState } from 'react';

import { VIEWS, View, Route, parseHash } from './routes';
export { VIEWS, parseHash };
export type { View, Route };

const readRoute = (): Route => (typeof window === 'undefined' ? { view: 'inicio' } : parseHash(window.location.hash));

/** Navega a una vista usando el hash de la URL (#catalogo, #biblioteca…). */
export function goTo(view: Exclude<View, 'perfil'>) {
  if (readRoute().view === view) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = view;
}

/** Abre el perfil público de un usuario (#perfil/<id>). */
export function goToProfile(userId: string) {
  const target = `perfil/${encodeURIComponent(userId)}`;
  if (window.location.hash.replace(/^#/, '') === target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = target;
}

export const profileUrl = (userId: string) =>
  `${window.location.origin}${window.location.pathname}#perfil/${encodeURIComponent(userId)}`;

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function useView(): View {
  return useRoute().view;
}
