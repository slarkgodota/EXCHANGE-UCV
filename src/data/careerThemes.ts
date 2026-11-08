import type { SceneId } from './careerScenes';
import { scoreText, sceneForCareer } from './careerScenes';

/**
 * Identidad visual de cada carrera: cuando la persona elige una carrera o categoría,
 * TODA la página cambia a estos colores, letras y fondo animado.
 */
export type Motif =
  | 'law' | 'blueprint' | 'code' | 'gears' | 'drafting' | 'ecg' | 'care' | 'mind'
  | 'charts' | 'numbers' | 'studio' | 'chalk' | 'bubbles' | 'books' | 'molecules';

export interface CareerTheme {
  hue: number; // tono base para fondos y superficies
  sat: number; // saturación de las superficies (0-100)
  accent: string; // botones (con texto blanco encima)
  accentLight: string; // textos de acento en modo oscuro
  accent2: string; // segundo color (detalles, motivos)
  hero: [string, string]; // portada y pie de página
  font: string; // letra de títulos
  motif: Motif;
}

const SERIF = 'Georgia, "Times New Roman", "Libre Baskerville", serif';
const MONO = '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace';
const ROUND = '"Nunito", "Varela Round", "Trebuchet MS", system-ui, sans-serif';
const CONDENSED = '"Oswald", "Bebas Neue", "Arial Narrow", Impact, sans-serif';
const GEOMETRIC = '"Futura", "Century Gothic", "Avenir Next", "Montserrat", sans-serif';
const CHALK = '"Chalkboard SE", "Comic Neue", "Comic Sans MS", "Segoe Print", cursive';
const CLEAN = '"Segoe UI", "Helvetica Neue", system-ui, sans-serif';
const BOLD = '"Anton", Impact, "Arial Black", sans-serif';

export const CAREER_THEMES: Record<SceneId, CareerTheme> = {
  derecho: { hue: 8, sat: 30, accent: '#8b1e2d', accentLight: '#f5c08a', accent2: '#c9a227', hero: ['#2a0f12', '#7a2e2e'], font: SERIF, motif: 'law' },
  civil: { hue: 38, sat: 35, accent: '#b45309', accentLight: '#fbbf24', accent2: '#facc15', hero: ['#1c1917', '#92400e'], font: CONDENSED, motif: 'blueprint' },
  sistemas: { hue: 232, sat: 40, accent: '#4f46e5', accentLight: '#67e8f9', accent2: '#22d3ee', hero: ['#070b1a', '#312e81'], font: MONO, motif: 'code' },
  industrial: { hue: 210, sat: 12, accent: '#c2410c', accentLight: '#fdba74', accent2: '#f59e0b', hero: ['#1f2933', '#475569'], font: CONDENSED, motif: 'gears' },
  arquitectura: { hue: 30, sat: 10, accent: '#9a3412', accentLight: '#fdba74', accent2: '#57534e', hero: ['#1c1917', '#57534e'], font: GEOMETRIC, motif: 'drafting' },
  medicina: { hue: 172, sat: 35, accent: '#0f766e', accentLight: '#5eead4', accent2: '#e11d48', hero: ['#042f2e', '#0d5f58'], font: CLEAN, motif: 'ecg' },
  enfermeria: { hue: 214, sat: 45, accent: '#1d4ed8', accentLight: '#93c5fd', accent2: '#dc2626', hero: ['#0c2340', '#1d4ed8'], font: ROUND, motif: 'care' },
  psicologia: { hue: 266, sat: 35, accent: '#6d28d9', accentLight: '#c4b5fd', accent2: '#ec4899', hero: ['#24104a', '#6d28d9'], font: ROUND, motif: 'mind' },
  administracion: { hue: 215, sat: 30, accent: '#1e3a8a', accentLight: '#93c5fd', accent2: '#16a34a', hero: ['#0b1a33', '#1e3a8a'], font: CLEAN, motif: 'charts' },
  contabilidad: { hue: 140, sat: 28, accent: '#15803d', accentLight: '#86efac', accent2: '#ca8a04', hero: ['#052e16', '#166534'], font: MONO, motif: 'numbers' },
  comunicacion: { hue: 345, sat: 25, accent: '#be123c', accentLight: '#fda4af', accent2: '#f59e0b', hero: ['#111114', '#9f1239'], font: BOLD, motif: 'studio' },
  educacion: { hue: 150, sat: 25, accent: '#166534', accentLight: '#fde68a', accent2: '#d97706', hero: ['#10241a', '#1f4d3a'], font: CHALK, motif: 'chalk' },
  tutoria: { hue: 222, sat: 45, accent: '#2563eb', accentLight: '#93c5fd', accent2: '#f97316', hero: ['#14204a', '#1d4ed8'], font: ROUND, motif: 'bubbles' },
  biblioteca: { hue: 30, sat: 28, accent: '#7c2d12', accentLight: '#fcd34d', accent2: '#b45309', hero: ['#1a1208', '#5b3a1e'], font: SERIF, motif: 'books' },
  investigacion: { hue: 176, sat: 32, accent: '#0f766e', accentLight: '#5eead4', accent2: '#db2777', hero: ['#03211f', '#0b5f59'], font: CLEAN, motif: 'molecules' },
};

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

/** Variables CSS de la carrera según modo claro u oscuro. */
export function themeVars(id: SceneId, dark: boolean): Record<string, string> {
  const t = CAREER_THEMES[id];
  const { hue: h, sat: s } = t;
  const base = dark
    ? {
        '--r-page': hsl(h, Math.min(40, s + 5), 7),
        '--r-page-2': hsl(h, Math.min(45, s + 10), 11),
        '--r-surface': hsl(h, s * 0.8, 11),
        '--r-surface-2': hsl(h, s * 0.7, 15),
        '--r-surface-3': hsl(h, s * 0.6, 19),
        '--r-border': hsl(h, s * 0.6, 23),
        '--r-ink': hsl(h, 25, 95),
        '--r-ink-2': hsl(h, 18, 86),
        '--r-muted': hsl(h, 12, 70),
        '--r-muted-2': hsl(h, 10, 58),
        '--r-accent-text': t.accentLight,
        '--r-tint': `color-mix(in srgb, ${t.accent} 26%, ${hsl(h, s * 0.8, 11)})`,
        '--r-motif': t.accentLight,
        '--r-motif-op': '0.34',
      }
    : {
        '--r-page': hsl(h, Math.min(55, s + 12), 92),
        '--r-page-2': hsl(h, Math.min(65, s + 22), 84),
        '--r-surface': hsl(h, s * 0.7, 99),
        '--r-surface-2': hsl(h, s * 0.8, 96),
        '--r-surface-3': hsl(h, s * 0.8, 92),
        '--r-border': hsl(h, s * 0.6, 84),
        '--r-ink': hsl(h, 40, 12),
        '--r-ink-2': hsl(h, 25, 22),
        '--r-muted': hsl(h, 14, 36),
        '--r-muted-2': hsl(h, 10, 46),
        '--r-accent-text': t.accent,
        '--r-tint': `color-mix(in srgb, ${t.accent} 11%, ${hsl(h, s * 0.7, 99)})`,
        '--r-motif': t.accent,
        '--r-motif-op': '0.3',
      };
  return {
    ...base,
    '--r-accent': t.accent,
    '--r-accent-hover': `color-mix(in srgb, ${t.accent} 82%, black)`,
    '--r-accent2': t.accent2,
    '--r-hero-1': t.hero[0],
    '--r-hero-2': t.hero[1],
    '--r-font': t.font,
  };
}

/**
 * Carrera activa según lo que la persona eligió. Devuelve null si no eligió nada
 * (entonces la página se ve normal).
 */
export function activeCareerFor(f: { searchQuery?: string; career?: string; category?: string }): SceneId | null {
  const byText = scoreText(f.searchQuery || '');
  if (byText) return byText.id;
  if (f.career && f.career !== 'todas') {
    const r = sceneForCareer(f.career);
    if (r) return r;
  }
  if (f.category === 'conocimientos') return 'tutoria';
  if (f.category === 'materiales') return 'biblioteca';
  if (f.category === 'investigacion') return 'investigacion';
  return null;
}
