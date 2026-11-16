/** Rutas de la página (sin React, para poder probarlas). */
/** Vistas de la plataforma. Cada una se muestra por separado. */
export const VIEWS = ['inicio', 'catalogo', 'biblioteca', 'ranking', 'sedes', 'perfil'] as const;
export type View = (typeof VIEWS)[number];

/** Pestañas de la página de perfil. */
export const PROFILE_TABS = ['publicaciones', 'valoraciones', 'logros', 'acerca'] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

export interface Route {
  view: View;
  /** Para #perfil/<id>: el id del usuario. */
  param?: string;
  /** Para #perfil/<id>/<pestaña>. */
  tab?: ProfileTab;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [head, ...rest] = raw.split('/');
  const view = head as View;
  if (!(VIEWS as readonly string[]).includes(view)) return { view: 'inicio' };
  if (view === 'perfil') {
    let param = '';
    try {
      param = decodeURIComponent(rest[0] || '');
    } catch {
      param = '';
    }
    if (!param) return { view: 'inicio' };
    const t = rest[1] as ProfileTab;
    return (PROFILE_TABS as readonly string[]).includes(t) ? { view, param, tab: t } : { view, param };
  }
  return { view };
}

export const profileHash = (userId: string, tab?: ProfileTab) =>
  `perfil/${encodeURIComponent(userId)}${tab && tab !== 'publicaciones' ? `/${tab}` : ''}`;
