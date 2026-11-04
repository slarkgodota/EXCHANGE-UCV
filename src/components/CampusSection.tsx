import React, { useMemo, useState } from 'react';
import { MapPin, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { UCV_CAMPUSES, UCV_FACTS } from '../data/ucv';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';

/** Vista Sedes */
export const CampusSection: React.FC = () => {
  const { publications, setFilter } = useExchange();
  const regions = useMemo(() => Array.from(new Set(UCV_CAMPUSES.map((c) => c.region))), []);
  const [region, setRegion] = useState('todas');
  const campuses = UCV_CAMPUSES.filter((c) => region === 'todas' || c.region === region);
  const countFor = (id: string) => publications.filter((p) => p.author.campus === id && p.status !== 'reportado').length;

  return (
    <div className="space-y-8">
      <header className="reveal-1">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          {UCV_FACTS.campusCount} campus, {UCV_FACTS.regionCount} regiones
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Universidad César Vallejo, fundada en 1991 con sede central en Trujillo. Horarios de biblioteca según ucv.edu.pe.
        </p>
      </header>

      <div className="reveal-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {['todas', ...regions].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              region === r ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {r === 'todas' ? 'Todas' : r}
          </button>
        ))}
      </div>

      <div key={region} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
        {campuses.map((c, i) => {
          const n = countFor(c.id);
          const main = c.libraryHours[0];
          return (
            <article key={c.id} style={{ '--i': i } as React.CSSProperties} className="lift min-w-0 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-xl font-bold text-slate-900">{c.label}</h3>
                {c.isHeadquarters && <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-red-50 text-red-700">Sede central</span>}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {c.address ? `${c.address}, ` : ''}{c.city}, {c.region}
              </p>
              <p className="text-sm text-slate-700 flex items-start gap-1.5 mt-4 flex-1">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span>
                  Biblioteca L–V {main.weekdays}
                  {main.saturday ? ` · Sáb ${main.saturday}` : ''}
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter((prev) => ({ ...prev, campus: c.id }));
                  goTo('catalogo');
                }}
                className="group mt-5 inline-flex items-center gap-1 text-sm font-semibold text-red-600"
              >
                {n > 0 ? `${n} publicaci${n === 1 ? 'ón' : 'ones'}` : 'Ver catálogo de esta sede'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Fuente:{' '}
        <a href={UCV_FACTS.campusPage} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 inline-flex items-center gap-0.5">
          ucv.edu.pe <ExternalLink className="w-3 h-3" />
        </a>
        {' '}· Contacto biblioteca: {UCV_FACTS.contact.libraryEmail}
      </p>
    </div>
  );
};
