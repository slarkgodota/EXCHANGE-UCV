import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { Avatar } from './Avatar';
import { LevelBadge, LevelProgress } from './LevelBadge';
import { Orcid } from './Orcid';
import { getCampusLabel } from '../data/ucv';

const MEDAL = ['medal medal-1', 'medal medal-2', 'medal medal-3'];

/** Ranking de los estudiantes con más EXP (Inicio). */
export const TopContributors: React.FC<{ limit?: number }> = ({ limit = 6 }) => {
  const { users, userLevels } = useExchange();
  const ranked = users
    .map((u) => ({ u, l: userLevels[u.id] }))
    .filter((x) => x.l && x.l.xp > 0)
    .sort((a, b) => b.l.xp - a.l.xp || b.l.stats.avgRating - a.l.stats.avgRating)
    .slice(0, limit);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20" aria-labelledby="ranking-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ranking-title" className="font-display text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" /> Top colaboradores
          </h2>
          <p className="text-slate-500 mt-1">Suben de nivel publicando, recibiendo buenas valoraciones y completando intercambios.</p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <p className="mt-6 p-6 rounded-3xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
          Todavía nadie tiene EXP. ¡Publica algo y sé el primero del ranking!
        </p>
      ) : (
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {ranked.map(({ u, l }, i) => (
            <li key={u.id} style={{ '--i': i } as React.CSSProperties} className="lift relative rounded-3xl border border-slate-200 bg-white p-5 space-y-3 min-w-0">
              <span className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow ${MEDAL[i] || 'bg-slate-900 text-white'}`}>
                {i + 1}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={u.name} src={u.avatar} size="md" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{u.name}</p>
                  <Orcid orcid={u.orcid} className="block" />
                  <p className="text-[11px] text-slate-500 truncate">{u.career} · {getCampusLabel(u.campus)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LevelBadge info={l} />
                <span className="text-[11px] text-slate-500">{l.stats.publications} publicaciones</span>
                {l.stats.ratingsReceived > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-700">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {l.stats.avgRating}
                  </span>
                )}
              </div>
              <LevelProgress info={l} compact />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
