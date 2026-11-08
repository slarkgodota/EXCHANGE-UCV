import React, { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';
import { buildEmblems, EMBLEMS, EmblemControl } from '../three/emblems3d';
import { Scene3D } from './Scene3D';

/**
 * Inicio: animación 3D "de universitario a profesional".
 * El birrete se transforma en el emblema de cada carrera; debajo aparece la profesión.
 */
export const CareerEmblems: React.FC = () => {
  const { setFilter } = useExchange();
  const [idx, setIdx] = useState(0);
  const control = useRef<EmblemControl>({ jump: () => {} });
  const e = EMBLEMS[idx];

  const explore = () => {
    setFilter((prev) => ({ ...prev, searchQuery: '', category: 'todas', career: e.career ?? 'todas' }));
    goTo('catalogo');
  };

  return (
    <div className="emblems reveal-3 min-w-0">
      <div className="relative mx-auto aspect-square w-full max-w-[520px]">
        <div aria-hidden className="absolute inset-[12%] rounded-full transition-colors duration-700" style={{ background: `radial-gradient(circle, ${e.accent}33 0%, transparent 70%)` }} />
        <Scene3D
          sceneKey="emblems"
          view="studio"
          factory={(T, o) => buildEmblems(T, { ...o, onChange: setIdx, control: control.current })}
          className="absolute inset-0"
          fallback={<div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">Profesionales UCV</div>}
        />
      </div>
      <div className="relative -mt-6 text-center" aria-live="polite">
        <p key={e.id + 'k'} className="career-title text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: `color-mix(in srgb, ${e.accent} 55%, #ffffff)` }}>
          {e.kicker}
        </p>
        <h2 key={e.id + 't'} className="career-title font-display text-3xl sm:text-4xl font-bold text-white mt-1">{e.title}</h2>
        <p key={e.id + 'p'} className="career-title text-sm text-slate-300 mt-1">{e.phrase}</p>
        {e.career && (
          <button type="button" onClick={explore} className="group mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 hover:bg-white hover:text-slate-900 text-white text-xs font-semibold transition">
            Ver publicaciones de {e.kicker}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
        <div className="mt-5 flex justify-center gap-1.5" role="tablist" aria-label="Carreras">
          {EMBLEMS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={x.kicker}
              title={x.kicker}
              onClick={() => control.current.jump(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
