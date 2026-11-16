/** Opciones de personalización del perfil. */

export const PROFILE_ACCENTS: { id: string; label: string; from: string; to: string }[] = [
  { id: 'rojo', label: 'Rojo UCV', from: '#c8102e', to: '#7f1d1d' },
  { id: 'azul', label: 'Azul', from: '#2563eb', to: '#1e3a8a' },
  { id: 'esmeralda', label: 'Esmeralda', from: '#059669', to: '#064e3b' },
  { id: 'violeta', label: 'Violeta', from: '#7c3aed', to: '#3b0764' },
  { id: 'ambar', label: 'Ámbar', from: '#d97706', to: '#78350f' },
  { id: 'rosa', label: 'Rosa', from: '#db2777', to: '#831843' },
  { id: 'cian', label: 'Cian', from: '#0891b2', to: '#164e63' },
  { id: 'grafito', label: 'Grafito', from: '#475569', to: '#0f172a' },
];

export const accentById = (id?: string) => PROFILE_ACCENTS.find((a) => a.id === id);

export const PROFILE_LIMITS = { name: 60, bio: 300, interests: 8, interest: 24, links: 3, link: 200 };

/** Normaliza un enlace: agrega https:// si falta y solo acepta http(s). Devuelve null si no sirve. */
export function normalizeLink(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.toString().slice(0, PROFILE_LIMITS.link);
  } catch {
    return null;
  }
}

/** Nombre corto para mostrar un enlace ("LinkedIn", "GitHub", o el dominio). */
export function linkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const known: Record<string, string> = {
      'linkedin.com': 'LinkedIn',
      'github.com': 'GitHub',
      'gitlab.com': 'GitLab',
      'behance.net': 'Behance',
      'researchgate.net': 'ResearchGate',
      'scholar.google.com': 'Google Académico',
      'youtube.com': 'YouTube',
      'tiktok.com': 'TikTok',
      'instagram.com': 'Instagram',
      'facebook.com': 'Facebook',
      'x.com': 'X',
      'twitter.com': 'X',
    };
    const k = Object.keys(known).find((d) => host === d || host.endsWith('.' + d));
    return k ? known[k] : host;
  } catch {
    return url;
  }
}

/** Limpia la lista de intereses: sin repetidos, recortados y con tope. */
export function cleanInterests(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const t = raw.replace(/\s+/g, ' ').trim().slice(0, PROFILE_LIMITS.interest);
    const k = t.toLowerCase();
    if (!t || seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= PROFILE_LIMITS.interests) break;
  }
  return out;
}

export const CYCLES = ['Ciclo I', 'Ciclo II', 'Ciclo III', 'Ciclo IV', 'Ciclo V', 'Ciclo VI', 'Ciclo VII', 'Ciclo VIII', 'Ciclo IX', 'Ciclo X', 'Egresado', 'Docente'];
