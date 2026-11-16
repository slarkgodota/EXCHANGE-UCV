import { useEffect, useState } from 'react';

import { VIEWS, View, Route, parseHash, profileHash, ProfileTab, PROFILE_TABS } from './routes';
export { VIEWS, parseHash, PROFILE_TABS };
export type { View, Route, ProfileTab };

/** Cuántas veces se navegó dentro de la página (para que "Volver" no saque al usuario del sitio). */
let internalNavs = 0;

const readRoute = (): Route => (typeof window === 'undefined' ? { view: 'inicio' } : parseHash(window.location.hash));

/** Navega a una vista usando el hash de la URL (#catalogo, #biblioteca…). */
export function goTo(view: Exclude<View, 'perfil'>) {
  if (readRoute().view === view) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = view;
}

/** Abre la página de perfil de un usuario (#perfil/<id>), en la misma pestaña. */
export function goToProfile(userId: string, tab?: ProfileTab) {
  const target = profileHash(userId, tab);
  if (window.location.hash.replace(/^#/, '') === target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = target;
}

/** Cambia de pestaña dentro del perfil sin llenar el historial. */
export function setProfileTab(userId: string, tab: ProfileTab) {
  window.location.replace(`#${profileHash(userId, tab)}`);
}

/** Botón "Volver": regresa a donde estaba; si entró directo al enlace, va al Inicio. */
export function goBack() {
  if (internalNavs > 0) window.history.back();
  else window.location.hash = 'inicio';
}

export const profileUrl = (userId: string) =>
  `${window.location.origin}${window.location.pathname}#perfil/${encodeURIComponent(userId)}`;

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onHash = () => {
      internalNavs++;
      setRoute((prev) => {
        const next = readRoute();
        // Cambiar de pestaña en el mismo perfil no sube hasta arriba
        if (!(prev.view === next.view && prev.param === next.param)) window.scrollTo({ top: 0 });
        return next;
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function useView(): View {
  return useRoute().view;
}
