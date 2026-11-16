/** Rutas de la página (sin React, para poder probarlas). */
/** Vistas de la plataforma. Cada una se muestra por separado. */
export const VIEWS = ['inicio', 'catalogo', 'biblioteca', 'ranking', 'sedes', 'perfil'] as const;
export type View = (typeof VIEWS)[number];

export interface Route {
  view: View;
  /** Para #perfil/<id>: el id del usuario. */
  param?: string;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [head, ...rest] = raw.split('/');
  const view = head as View;
  if (!(VIEWS as readonly string[]).includes(view)) return { view: 'inicio' };
  if (view === 'perfil') {
    let param = '';
    try {
      param = decodeURIComponent(rest.join('/'));
    } catch {
      param = '';
    }
    return param ? { view, param } : { view: 'inicio' };
  }
  return { view };
}

