import React from 'react';
import { Award, Info } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { LevelInfo, XP_HOW_TO } from '../utils/levels';

/** Color de cada nivel (1 Novato … 7 Leyenda UCV). */
const STYLE: Record<number, string> = {
  1: 'bg-slate-100 text-slate-700 border-slate-200',
  2: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  3: 'bg-sky-100 text-sky-800 border-sky-200',
  4: 'bg-blue-100 text-blue-800 border-blue-200',
  5: 'bg-violet-100 text-violet-800 border-violet-200',
  6: 'bg-rose-100 text-rose-800 border-rose-200',
  7: 'lvl-gold border-amber-300',
};
const BAR: Record<number, string> = {
  1: 'bg-slate-400',
  2: 'bg-emerald-500',
  3: 'bg-sky-500',
  4: 'bg-blue-600',
  5: 'bg-violet-600',
  6: 'bg-rose-600',
  7: 'bg-amber-500',
};

export const levelStyle = (level: number) => STYLE[level] || STYLE[1];

/** Insignia pequeña: "Nv. 3 · Colaborador". */
export const LevelBadge: React.FC<{ userId?: string; info?: LevelInfo; showName?: boolean; className?: string }> = ({
  userId,
  info,
  showName = true,
  className = '',
}) => {
  const { getUserLevel } = useExchange();
  const l = info || getUserLevel(userId);
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${levelStyle(l.level)} ${className}`}
      title={`Nivel ${l.level} · ${l.name} · ${l.xp} EXP`}
    >
      <Award className="w-3 h-3" />
      Nv. {l.level}
      {showName && <span className="font-semibold">· {l.name}</span>}
    </span>
  );
};

/** Barra de progreso hacia el siguiente nivel. */
export const LevelProgress: React.FC<{ info: LevelInfo; compact?: boolean }> = ({ info, compact }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
      <span>{info.xp} EXP</span>
      <span>{info.nextMin !== null ? `${info.nextMin - info.xp} EXP para el nivel ${info.level + 1}` : 'Nivel máximo'}</span>
    </div>
    <div className={`w-full ${compact ? 'h-1.5' : 'h-2.5'} rounded-full bg-slate-200 overflow-hidden`}>
      <div className={`h-full rounded-full ${BAR[info.level] || BAR[1]} transition-all duration-700`} style={{ width: `${Math.round(info.progress * 100)}%` }} />
    </div>
  </div>
);

/** Tarjeta completa de nivel (para "Mi cuenta"). */
export const LevelCard: React.FC<{ userId: string }> = ({ userId }) => {
  const { getUserLevel } = useExchange();
  const l = getUserLevel(userId);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tu nivel</p>
          <p className="font-display text-xl font-bold text-slate-900">
            Nivel {l.level} · {l.name}
          </p>
        </div>
        <span className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg font-black ${levelStyle(l.level)}`}>{l.level}</span>
      </div>
      <LevelProgress info={l} />
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-base font-bold text-slate-900">{l.stats.publications}</p>
          <p className="text-[10px] text-slate-500">publicaciones</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-base font-bold text-slate-900">{l.stats.ratingsReceived ? `${l.stats.avgRating}★` : '—'}</p>
          <p className="text-[10px] text-slate-500">{l.stats.ratingsReceived} valoraciones</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-base font-bold text-slate-900">{l.stats.exchanges}</p>
          <p className="text-[10px] text-slate-500">intercambios</p>
        </div>
      </div>
      {l.breakdown.length > 0 && (
        <ul className="text-xs text-slate-600 space-y-1">
          {l.breakdown.map((b) => (
            <li key={b.label} className="flex justify-between gap-2">
              <span>{b.label}</span>
              <span className="font-semibold text-slate-800">+{b.xp}</span>
            </li>
          ))}
        </ul>
      )}
      <details className="text-xs">
        <summary className="cursor-pointer font-semibold text-red-700 inline-flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> ¿Cómo gano EXP?
        </summary>
        <ul className="mt-2 space-y-1 text-slate-600">
          {XP_HOW_TO.map((h) => (
            <li key={h.label} className="flex justify-between gap-2">
              <span>{h.label}</span>
              <span className="font-semibold text-emerald-700 whitespace-nowrap">{h.xp}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-500">Las publicaciones reportadas no suman. Mientras mejores estrellas recibas, más rápido subes.</p>
      </details>
    </section>
  );
};
