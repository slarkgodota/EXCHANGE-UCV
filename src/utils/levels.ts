import type { Publication, ContactExchangeRequest as ExchangeRequest, ReviewReply } from '../types/exchange';

/**
 * Sistema de EXP y niveles.
 * La EXP no se guarda: se calcula siempre a partir de lo que hay en la base de datos
 * (publicaciones, estrellas recibidas, intercambios, reseñas y respuestas), así es igual
 * en todos los dispositivos y nadie puede "inventarse" puntos.
 */

export interface LevelDef {
  level: number;
  name: string;
  min: number; // EXP mínima para llegar a este nivel
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: 'Novato', min: 0 },
  { level: 2, name: 'Aprendiz', min: 60 },
  { level: 3, name: 'Colaborador', min: 150 },
  { level: 4, name: 'Destacado', min: 300 },
  { level: 5, name: 'Experto', min: 500 },
  { level: 6, name: 'Mentor', min: 800 },
  { level: 7, name: 'Leyenda UCV', min: 1200 },
];

/** Cuánta EXP da cada cosa. */
export const XP_RULES = {
  publicacion: 25, // por cada publicación visible
  destacada: 40, // extra si un admin la marca como destacada
  porEstrella: 5, // por cada estrella recibida por encima de 1 (1★ = 0, 3★ = 10, 5★ = 20)
  intercambioAceptado: 15, // cuando aceptas la solicitud de alguien
  intercambioCompletado: 30, // para los dos, cuando el intercambio se completa
  resenaEscrita: 5, // por valorar publicaciones de otros
  respuesta: 2, // por responder comentarios
  maxRespuestas: 25, // solo cuentan las primeras 25 respuestas (para evitar spam)
};

export const XP_HOW_TO: { label: string; xp: string }[] = [
  { label: 'Publicar un material, tutoría o convocatoria', xp: `+${XP_RULES.publicacion}` },
  { label: 'Recibir una valoración (según las estrellas)', xp: `+0 a +${XP_RULES.porEstrella * 4}` },
  { label: 'Que tu publicación sea destacada', xp: `+${XP_RULES.destacada}` },
  { label: 'Aceptar una solicitud de intercambio', xp: `+${XP_RULES.intercambioAceptado}` },
  { label: 'Completar un intercambio (los dos ganan)', xp: `+${XP_RULES.intercambioCompletado}` },
  { label: 'Valorar la publicación de otro estudiante', xp: `+${XP_RULES.resenaEscrita}` },
  { label: `Responder comentarios (hasta ${XP_RULES.maxRespuestas})`, xp: `+${XP_RULES.respuesta}` },
];

export interface LevelInfo {
  xp: number;
  level: number;
  name: string;
  min: number;
  nextMin: number | null; // EXP del siguiente nivel (null si es el máximo)
  progress: number; // 0..1 dentro del nivel actual
  stats: {
    publications: number;
    ratingsReceived: number;
    avgRating: number;
    exchanges: number;
    reviewsWritten: number;
    replies: number;
  };
  breakdown: { label: string; xp: number }[];
}

export function levelFor(xp: number): Omit<LevelInfo, 'stats' | 'breakdown'> {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) cur = l;
  const next = LEVELS.find((l) => l.level === cur.level + 1) || null;
  const progress = next ? Math.min(1, (xp - cur.min) / (next.min - cur.min)) : 1;
  return { xp, level: cur.level, name: cur.name, min: cur.min, nextMin: next ? next.min : null, progress };
}

const emptyStats = () => ({ publications: 0, ratingsReceived: 0, ratingSum: 0, exchanges: 0, reviewsWritten: 0, replies: 0, featured: 0, accepted: 0, completed: 0 });

// ───────────── Periodos de la clasificación ─────────────

export type Period = 'total' | 'mes' | 'semana';

export const PERIODS: { id: Period; label: string; short: string }[] = [
  { id: 'total', label: 'Todo el tiempo', short: 'General' },
  { id: 'mes', label: 'Este mes', short: 'Mes' },
  { id: 'semana', label: 'Esta semana', short: 'Semana' },
];

/**
 * Lee las fechas que guarda la app: "2026-11-16", "2026-11-16 14:30" (hora UTC) o ISO completo.
 * Devuelve milisegundos, o NaN si no se puede leer.
 */
export function parseWhen(s?: string): number {
  if (!s) return NaN;
  const t = s.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12).getTime(); // solo día → mediodía local
  m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(t);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return Date.parse(t);
}

/** Inicio del periodo (hora local): lunes 00:00 para la semana, día 1 para el mes. */
export function periodStart(period: Period, now: Date = new Date()): number {
  if (period === 'total') return -Infinity;
  if (period === 'mes') return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

/** Cuándo se reinicia el periodo (para mostrar "se reinicia en 3 días"). */
export function periodEnd(period: Period, now: Date = new Date()): number {
  if (period === 'total') return Infinity;
  if (period === 'mes') return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  return periodStart('semana', now) + 7 * 86400000;
}

/** Calcula la EXP y el nivel de todos los usuarios de una sola vez.
 *  Con `since` solo cuenta lo que pasó desde esa fecha (para la clasificación semanal/mensual). */
export function computeAllLevels(
  publications: Publication[],
  requests: ExchangeRequest[],
  replies: ReviewReply[],
  since: number = -Infinity
): Record<string, LevelInfo> {
  const acc: Record<string, ReturnType<typeof emptyStats>> = {};
  const get = (id: string) => (acc[id] ||= emptyStats());
  const all = since === -Infinity;
  // Si una fecha no se puede leer solo cuenta en "Todo el tiempo".
  const inRange = (when?: string) => all || parseWhen(when) >= since;

  for (const p of publications) {
    if (p.status === 'reportado' || p.status === 'en_revision') continue;
    if (inRange(p.createdAt)) get(p.author.id).publications++;
    if (p.status === 'destacado' && inRange(p.featuredAt || p.createdAt)) get(p.author.id).featured++;
    for (const r of p.reviews || []) {
      if (r.authorId === p.author.id) continue; // nadie gana EXP valorándose a sí mismo
      if (!inRange(r.createdAt)) continue;
      const a = get(p.author.id);
      a.ratingsReceived++;
      a.ratingSum += Math.max(1, Math.min(5, r.rating));
      get(r.authorId).reviewsWritten++;
    }
  }
  for (const q of requests) {
    if (q.senderId === q.receiverId) continue;
    if (!inRange(q.respondedAt || q.createdAt)) continue;
    if (q.status === 'aceptada' || q.status === 'completada') get(q.receiverId).accepted++;
    if (q.status === 'completada') {
      get(q.receiverId).completed++;
      get(q.senderId).completed++;
    }
  }
  for (const r of replies) if (inRange(r.createdAt)) get(r.authorId).replies++;

  const out: Record<string, LevelInfo> = {};
  for (const [id, s] of Object.entries(acc)) {
    const starXp = s.ratingSum - s.ratingsReceived; // suma de (estrellas - 1)
    const countedReplies = Math.min(s.replies, XP_RULES.maxRespuestas);
    const breakdown = [
      { label: `Publicaciones (${s.publications})`, xp: s.publications * XP_RULES.publicacion },
      { label: `Estrellas recibidas (${s.ratingsReceived} valoraciones)`, xp: starXp * XP_RULES.porEstrella },
      { label: `Publicaciones destacadas (${s.featured})`, xp: s.featured * XP_RULES.destacada },
      { label: `Solicitudes aceptadas (${s.accepted})`, xp: s.accepted * XP_RULES.intercambioAceptado },
      { label: `Intercambios completados (${s.completed})`, xp: s.completed * XP_RULES.intercambioCompletado },
      { label: `Valoraciones escritas (${s.reviewsWritten})`, xp: s.reviewsWritten * XP_RULES.resenaEscrita },
      { label: `Respuestas (${countedReplies})`, xp: countedReplies * XP_RULES.respuesta },
    ].filter((b) => b.xp > 0);
    const xp = breakdown.reduce((t, b) => t + b.xp, 0);
    out[id] = {
      ...levelFor(xp),
      stats: {
        publications: s.publications,
        ratingsReceived: s.ratingsReceived,
        avgRating: s.ratingsReceived ? Math.round((s.ratingSum / s.ratingsReceived) * 10) / 10 : 0,
        exchanges: s.completed,
        reviewsWritten: s.reviewsWritten,
        replies: s.replies,
      },
      breakdown,
    };
  }
  return out;
}

export interface RankEntry {
  userId: string;
  rank: number;
  xp: number;
  info: LevelInfo;
}

/** Ordena a los usuarios por EXP (empates: mejor promedio de estrellas, luego más publicaciones).
 *  Los empates exactos comparten puesto. */
export function rankUsers(levels: Record<string, LevelInfo>, userIds?: string[]): RankEntry[] {
  const ids = (userIds || Object.keys(levels)).filter((id) => levels[id] && levels[id].xp > 0);
  const sorted = ids
    .map((id) => ({ userId: id, xp: levels[id].xp, info: levels[id] }))
    .sort(
      (a, b) =>
        b.xp - a.xp ||
        b.info.stats.avgRating - a.info.stats.avgRating ||
        b.info.stats.publications - a.info.stats.publications ||
        (a.userId < b.userId ? -1 : 1)
    );
  const out: RankEntry[] = [];
  sorted.forEach((e, i) => {
    const prev = out[i - 1];
    const tie = prev && prev.xp === e.xp && prev.info.stats.avgRating === e.info.stats.avgRating && prev.info.stats.publications === e.info.stats.publications;
    out.push({ ...e, rank: tie ? prev.rank : i + 1 });
  });
  return out;
}

export function levelOf(levels: Record<string, LevelInfo>, userId?: string): LevelInfo {
  return (
    (userId && levels[userId]) || {
      ...levelFor(0),
      stats: { publications: 0, ratingsReceived: 0, avgRating: 0, exchanges: 0, reviewsWritten: 0, replies: 0 },
      breakdown: [],
    }
  );
}
