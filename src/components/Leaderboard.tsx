import React, { useState } from 'react';
import { Trophy, Star, ArrowRight, Clock, Crown, Sparkles, FileText } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { Avatar } from './Avatar';
import { LevelBadge, LevelProgress } from './LevelBadge';
import { UserLink } from './UserLink';
import { getCampusLabel } from '../data/ucv';
import { PERIODS, Period, periodEnd, RankEntry, XP_HOW_TO } from '../utils/levels';
import { goTo, goToProfile } from '../utils/router';
import type { StudentUser } from '../types/exchange';

const PERIOD_KEY = 'exchange_ucv_ranking_period';
const MEDAL = ['medal medal-1', 'medal medal-2', 'medal medal-3'];

const fmt = (n: number) => n.toLocaleString('es-PE');
export const xpText = (xp: number, period: Period) => (period === 'total' ? `${fmt(xp)} EXP` : `+${fmt(xp)} EXP`);

function readPeriod(): Period {
  try {
    const v = localStorage.getItem(PERIOD_KEY);
    if (v === 'total' || v === 'mes' || v === 'semana') return v;
  } catch {
    /* sin almacenamiento */
  }
  return 'total';
}

/** "Se reinicia en 3 días" / "en 5 horas". */
export function resetText(period: Period, now = new Date()): string | null {
  if (period === 'total') return null;
  const ms = periodEnd(period, now) - now.getTime();
  const days = Math.floor(ms / 86400000);
  if (days >= 1) return `Se reinicia en ${days} ${days === 1 ? 'día' : 'días'}`;
  const hours = Math.max(1, Math.ceil(ms / 3600000));
  return `Se reinicia en ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
}

export const PeriodTabs: React.FC<{ value: Period; onChange: (p: Period) => void; className?: string }> = ({ value, onChange, className = '' }) => (
  <div role="tablist" aria-label="Periodo de la clasificación" className={`inline-flex p-1 rounded-full bg-slate-100 border border-slate-200 ${className}`}>
    {PERIODS.map((p) => (
      <button
        key={p.id}
        type="button"
        role="tab"
        aria-selected={value === p.id}
        onClick={() => onChange(p.id)}
        className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
          value === p.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        {p.label}
      </button>
    ))}
  </div>
);

function usePeriod() {
  const [period, setPeriodState] = useState<Period>(readPeriod);
  const setPeriod = (p: Period) => {
    setPeriodState(p);
    try {
      localStorage.setItem(PERIOD_KEY, p);
    } catch {
      /* sin almacenamiento */
    }
  };
  return [period, setPeriod] as const;
}

const EmptyRanking: React.FC<{ period: Period }> = ({ period }) => (
  <p className="mt-6 p-6 rounded-3xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
    {period === 'total'
      ? 'Todavía nadie tiene EXP. ¡Publica algo y sé el primero del ranking!'
      : `Nadie ha ganado EXP ${period === 'mes' ? 'este mes' : 'esta semana'} todavía. ¡Es tu oportunidad de ir primero!`}
  </p>
);

const RankRowStats: React.FC<{ e: RankEntry }> = ({ e }) => (
  <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
    <span className="inline-flex items-center gap-0.5"><FileText className="w-3 h-3" /> {e.info.stats.publications}</span>
    {e.info.stats.ratingsReceived > 0 && (
      <span className="inline-flex items-center gap-0.5 font-semibold text-amber-700">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {e.info.stats.avgRating}
      </span>
    )}
  </span>
);

/** Inicio: los 6 primeros con pestañas Todo el tiempo / Mes / Semana. */
export const TopContributors: React.FC<{ limit?: number }> = ({ limit = 6 }) => {
  const { users, getRanking } = useExchange();
  const [period, setPeriod] = usePeriod();
  const byId = new Map(users.map((u) => [u.id, u]));
  const ranked = getRanking(period).slice(0, limit);
  const reset = resetText(period);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20" aria-labelledby="ranking-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="ranking-title" className="font-display text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" /> Clasificación
          </h2>
          <p className="text-slate-500 mt-1">Suben publicando, recibiendo buenas valoraciones y completando intercambios.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <PeriodTabs value={period} onChange={setPeriod} />
          {reset && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><Clock className="w-3 h-3" /> {reset}</span>
          )}
        </div>
      </div>

      {ranked.length === 0 ? (
        <EmptyRanking period={period} />
      ) : (
        <ol key={period} className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {ranked.map((e, i) => {
            const u = byId.get(e.userId)!;
            return (
              <li
                key={u.id}
                style={{ '--i': i } as React.CSSProperties}
                onClick={() => goToProfile(u.id)}
                className="lift relative rounded-3xl border border-slate-200 bg-white p-5 space-y-3 min-w-0 cursor-pointer"
              >
                <span className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow ${MEDAL[e.rank - 1] || 'bg-slate-900 text-white'}`}>
                  {e.rank}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} src={u.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <UserLink userId={u.id} className="block font-bold text-slate-900 truncate max-w-full">{u.name}</UserLink>
                    <p className="text-[11px] text-slate-500 truncate">{u.career} · {getCampusLabel(u.campus)}</p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-lg font-bold text-slate-900 leading-none">{xpText(e.xp, period)}</span>
                    {period !== 'total' && <span className="text-[10px] text-slate-500">{period === 'mes' ? 'este mes' : 'esta semana'}</span>}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <LevelBadge userId={u.id} />
                  <RankRowStats e={e} />
                </div>
                <LevelProgressFor userId={u.id} />
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => goTo('ranking')}
          className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-sm font-semibold text-slate-700 transition"
        >
          Ver ranking completo <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
};

const LevelProgressFor: React.FC<{ userId: string }> = ({ userId }) => {
  const { getUserLevel } = useExchange();
  return <LevelProgress info={getUserLevel(userId)} compact />;
};

const PodiumSpot: React.FC<{ e: RankEntry; u: StudentUser; period: Period; place: 1 | 2 | 3 }> = ({ e, u, period, place }) => {
  const height = place === 1 ? 'h-28 sm:h-36' : place === 2 ? 'h-20 sm:h-24' : 'h-14 sm:h-16';
  const base = place === 1 ? 'from-amber-300 to-amber-500' : place === 2 ? 'from-slate-200 to-slate-400' : 'from-orange-200 to-orange-400';
  return (
    <li className={`flex flex-col items-center min-w-0 ${place === 1 ? 'order-2' : place === 2 ? 'order-1' : 'order-3'}`}>
      <button type="button" onClick={() => goToProfile(u.id)} className="group flex flex-col items-center min-w-0 w-full" title="Ver perfil">
        <span className="relative">
          {place === 1 && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500 fill-amber-300" aria-hidden />}
          <Avatar name={u.name} src={u.avatar} size={place === 1 ? 'xl' : 'lg'} className="ring-4 ring-white shadow-lg transition group-hover:scale-105" />
          <span className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow ${MEDAL[place - 1]}`}>{e.rank}</span>
        </span>
        <span className="mt-3 font-bold text-slate-900 text-sm truncate max-w-full px-1 group-hover:underline underline-offset-2">{u.name}</span>
        <span className="text-[11px] text-slate-500 truncate max-w-full px-1">{u.career}</span>
        <span className="mt-1 font-display font-bold text-slate-900">{xpText(e.xp, period)}</span>
      </button>
      <div className={`mt-3 w-full rounded-t-2xl bg-gradient-to-b ${base} ${height} flex items-start justify-center pt-2 font-display text-2xl font-black text-white/90`} aria-hidden>
        {place}
      </div>
    </li>
  );
};

/** Vista #ranking: podio, tabla completa y tu posición. */
export const RankingView: React.FC = () => {
  const { users, getRanking, currentUser, isLoggedIn, openAuth } = useExchange();
  const [period, setPeriod] = usePeriod();
  const byId = new Map(users.map((u) => [u.id, u]));
  const all = getRanking(period);
  const podium = all.filter((e) => e.rank <= 3).slice(0, 3);
  const rest = all.slice(podium.length, 50);
  const mine = currentUser ? all.find((e) => e.userId === currentUser.id) : undefined;
  const reset = resetText(period);
  const periodWord = period === 'total' ? 'en total' : period === 'mes' ? 'este mes' : 'esta semana';

  return (
    <div className="space-y-8">
      <header className="reveal-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-9 h-9 text-amber-500" /> Ranking
          </h1>
          <p className="text-slate-500 mt-2">Los estudiantes que más aportan a la comunidad UCV. Toca a cualquiera para ver su perfil.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1.5">
          <PeriodTabs value={period} onChange={setPeriod} />
          {reset && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" /> {reset}</span>}
        </div>
      </header>

      {currentUser && (
        <div className="reveal-2 flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200">
          <Avatar name={currentUser.name} src={currentUser.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">Tu posición</p>
            <p className="text-xs text-slate-500">
              {mine ? `Puesto #${mine.rank} de ${all.length} · ${xpText(mine.xp, period)} ${periodWord}` : `Aún no ganas EXP ${periodWord}. Publica o valora algo para entrar.`}
            </p>
          </div>
          <button type="button" onClick={() => goToProfile(currentUser.id)} className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">
            Ver mi perfil
          </button>
        </div>
      )}

      {all.length === 0 ? (
        <EmptyRanking period={period} />
      ) : (
        <div key={period} className="view-enter space-y-6">
          <ol className="grid grid-cols-3 items-end gap-2 sm:gap-6 max-w-2xl mx-auto pt-8" aria-label="Podio">
            {podium.map((e, i) => (
              <PodiumSpot key={e.userId} e={e} u={byId.get(e.userId)!} period={period} place={(i + 1) as 1 | 2 | 3} />
            ))}
          </ol>

          {rest.length > 0 && (
            <ol className="rounded-3xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden" start={podium.length + 1}>
              {rest.map((e) => {
                const u = byId.get(e.userId)!;
                const me = currentUser?.id === u.id;
                return (
                  <li
                    key={u.id}
                    onClick={() => goToProfile(u.id)}
                    className={`flex items-center gap-3 px-4 sm:px-5 py-3 cursor-pointer transition hover:bg-slate-50 ${me ? 'bg-red-50/70' : ''}`}
                  >
                    <span className="w-8 text-center font-display font-bold text-slate-500 shrink-0">{e.rank}</span>
                    <Avatar name={u.name} src={u.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <UserLink userId={u.id} className="block text-sm font-semibold text-slate-900 truncate max-w-full">
                        {u.name} {me && <span className="text-[10px] font-bold text-red-700">(tú)</span>}
                      </UserLink>
                      <p className="text-[11px] text-slate-500 truncate">{u.career} · {getCampusLabel(u.campus)}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <LevelBadge userId={u.id} />
                      <RankRowStats e={e} />
                    </div>
                    <span className="font-display font-bold text-slate-900 text-sm shrink-0 w-24 text-right">{xpText(e.xp, period)}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Cómo ganar EXP</h2>
        <p className="text-sm text-slate-500 mt-1">
          "Todo el tiempo" suma toda tu EXP. "Este mes" empieza el día 1 y "Esta semana" el lunes: así cualquiera puede llegar arriba aunque recién empiece.
        </p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {XP_HOW_TO.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm">
              <span className="text-slate-700">{r.label}</span>
              <span className="font-bold text-emerald-700 shrink-0">{r.xp}</span>
            </li>
          ))}
        </ul>
        {!isLoggedIn && (
          <button type="button" onClick={() => openAuth('register')} className="mt-5 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
            Crear cuenta y empezar a sumar
          </button>
        )}
      </section>
    </div>
  );
};
