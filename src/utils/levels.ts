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

/** Calcula la EXP y el nivel de todos los usuarios de una sola vez. */
export function computeAllLevels(
  publications: Publication[],
  requests: ExchangeRequest[],
  replies: ReviewReply[]
): Record<string, LevelInfo> {
  const acc: Record<string, ReturnType<typeof emptyStats>> = {};
  const get = (id: string) => (acc[id] ||= emptyStats());

  for (const p of publications) {
    if (p.status === 'reportado' || p.status === 'en_revision') continue;
    const a = get(p.author.id);
    a.publications++;
    if (p.status === 'destacado') a.featured++;
    for (const r of p.reviews || []) {
      if (r.authorId === p.author.id) continue; // nadie gana EXP valorándose a sí mismo
      a.ratingsReceived++;
      a.ratingSum += Math.max(1, Math.min(5, r.rating));
      get(r.authorId).reviewsWritten++;
    }
  }
  for (const q of requests) {
    if (q.senderId === q.receiverId) continue;
    if (q.status === 'aceptada' || q.status === 'completada') get(q.receiverId).accepted++;
    if (q.status === 'completada') {
      get(q.receiverId).completed++;
      get(q.senderId).completed++;
    }
  }
  for (const r of replies) get(r.authorId).replies++;

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

export function levelOf(levels: Record<string, LevelInfo>, userId?: string): LevelInfo {
  return (
    (userId && levels[userId]) || {
      ...levelFor(0),
      stats: { publications: 0, ratingsReceived: 0, avgRating: 0, exchanges: 0, reviewsWritten: 0, replies: 0 },
      breakdown: [],
    }
  );
}
