import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';
import { buildParade, PROFESSIONALS } from '../three/parade3d';
import { Scene3D } from './Scene3D';

/**
 * Inicio: desfile 3D de profesionales de la UCV con sus carreras.
 * Cuando uno llega al centro saluda y aparece su carrera; se puede ir al catálogo de esa carrera.
 */
export const ProfessionalsParade: React.FC = () => {
  const { setFilter } = useExchange();
  const [focus, setFocus] = useState<{ i: number; on: boolean }>({ i: 0, on: false });
  const p = PROFESSIONALS[focus.i];

  const explore = () => {
    setFilter((prev) => ({ ...prev, searchQuery: '', category: 'todas', career: p.career }));
    goTo('catalogo');
  };

  return (
    <div className="parade relative h-[300px] sm:h-[340px] lg:h-[380px]">
      <Scene3D
        sceneKey="parade"
        view="front"
        zoom={1}
        factory={(T, o) => buildParade(T, { ...o, onFocus: (i, on) => setFocus({ i, on }) })}
        className="absolute inset-0"
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-center text-white/80 text-sm px-6">
            Profesionales de la UCV: Derecho · Ingeniería · Medicina · Educación · y más
          </div>
        }
      />
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-1 sm:bottom-2 pointer-events-auto z-10 transition-all duration-300 ${focus.on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        aria-live="polite"
      >
        <button
          type="button"
          onClick={explore}
          tabIndex={focus.on ? 0 : -1}
          className="parade-label group inline-flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl shadow-xl shadow-black/20 text-left"
        >
          <span>
            <span className="pl-k block text-[10px] font-bold uppercase tracking-wider">{p.career}</span>
            <span className="pl-t block font-display font-bold text-base leading-tight">{p.title}</span>
            <span className="pl-s block text-[11px]">{p.phrase}</span>
          </span>
          <span className="pl-go w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition">
            <ArrowRight className="w-4 h-4" />
          </span>
        </button>
      </div>
    </div>
  );
};
