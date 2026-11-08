import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { SCENES, SCENE_BY_ID, SceneId } from '../data/careerScenes';
import { CareerIllustration } from './CareerIllustration';

/** Catálogo: ilustración animada de la carrera elegida. */
export const CareerBanner: React.FC<{ scene: SceneId; count: number }> = ({ scene, count }) => {
  const meta = SCENE_BY_ID[scene];
  return (
    <section
      className="on-dark relative h-[23rem] sm:h-80 rounded-3xl overflow-hidden text-white transition-[background] duration-700"
      style={{ background: `radial-gradient(130% 120% at 80% 30%, ${meta.bg[1]}, ${meta.bg[0]})` }}
      aria-label={`${meta.label}: ${meta.place}`}
    >
      <div className="absolute inset-0 sm:inset-y-0 sm:right-auto sm:w-[55%] pointer-events-none bg-gradient-to-t sm:bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
      <CareerIllustration scene={scene} />
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-8 max-w-md pointer-events-none">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">{meta.career ? 'Carrera' : 'Categoría'}</p>
        <h2 key={scene} className="career-title font-display text-3xl sm:text-4xl font-bold leading-tight">{meta.career ?? meta.label}</h2>
        <p className="text-sm text-white/85 mt-1">{meta.tagline}</p>
        <p className="mt-3 self-start inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
          {count} {count === 1 ? 'publicación' : 'publicaciones'}
        </p>
      </div>
    </section>
  );
};

/** Fila para elegir carrera o categoría (con "Todas" para volver a la página normal). */
export const CareerPicker: React.FC<{ active: SceneId | null }> = ({ active }) => {
  const { setFilter } = useExchange();
  const choose = (id: SceneId | null) => {
    const m = id ? SCENE_BY_ID[id] : null;
    setFilter((prev) => ({ ...prev, searchQuery: '', career: m?.career ?? 'todas', category: m?.category ?? 'todas' }));
  };
  const chip = (on: boolean) =>
    `shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
      on ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-200 hover:border-red-500 hover:text-red-700'
    }`;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Explora por carrera</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="list">
        <button type="button" role="listitem" onClick={() => choose(null)} aria-pressed={!active} className={chip(!active)}>
          Todas
        </button>
        {SCENES.map((r) => (
          <button key={r.id} type="button" role="listitem" onClick={() => choose(r.id)} aria-pressed={active === r.id} className={chip(active === r.id)}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${r.bg[0]}, ${r.bg[1]})` }} />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};
