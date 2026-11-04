import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useExchange, DEFAULT_FILTER } from '../context/ExchangeContext';
import { CategoryType } from '../types/exchange';
import { CAREERS, UCV_CAMPUSES } from '../data/ucv';
import { RESOURCE_TYPES } from '../data/catalog';

const CATEGORIES: { id: 'todas' | CategoryType; label: string }[] = [
  { id: 'todas', label: 'Todo' },
  { id: 'conocimientos', label: 'Conocimientos' },
  { id: 'materiales', label: 'Materiales' },
  { id: 'investigacion', label: 'Investigación' },
];

const selectCls =
  'w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-4 focus:ring-red-500/15 focus:border-red-400 focus:outline-none';

export const CategoryFilterBar: React.FC = () => {
  const { filter, setFilter, publications, resetFilter } = useExchange();
  const [open, setOpen] = useState(false);
  const visible = publications.filter((p) => p.status !== 'reportado');
  const count = (id: 'todas' | CategoryType) => (id === 'todas' ? visible.length : visible.filter((p) => p.category === id).length);

  const advancedActive =
    filter.career !== DEFAULT_FILTER.career ||
    filter.campus !== DEFAULT_FILTER.campus ||
    filter.resourceType !== DEFAULT_FILTER.resourceType ||
    filter.intent !== DEFAULT_FILTER.intent ||
    filter.course.trim() !== '';

  const set = <K extends keyof typeof filter>(k: K, v: (typeof filter)[K]) => setFilter((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <label className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            id="cat-search"
            type="search"
            value={filter.searchQuery}
            onChange={(e) => set('searchQuery', e.target.value)}
            placeholder="Busca por tema, curso o autor"
            className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-red-500/15 focus:border-red-400 focus:outline-none transition"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set('category', c.id)}
              aria-pressed={filter.category === c.id}
              className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                filter.category === c.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {c.label} <span className="opacity-60">{count(c.id)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold border transition ${
              open || advancedActive ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtros{advancedActive ? ' •' : ''}
          </button>
        </div>
      </div>

      {open && (
        <div className="view-enter bg-white rounded-3xl border border-slate-200 p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <label className="space-y-1.5">
            <span className="font-semibold text-slate-700">Carrera</span>
            <select id="f-career" value={filter.career} onChange={(e) => set('career', e.target.value as any)} className={selectCls}>
              <option value="todas">Todas</option>
              {CAREERS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold text-slate-700">Curso</span>
            <input id="f-course" type="search" value={filter.course} onChange={(e) => set('course', e.target.value)} placeholder="Ej. Estática" className={selectCls} />
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold text-slate-700">Tipo de recurso</span>
            <select id="f-type" aria-label="Tipo de recurso" value={filter.resourceType} onChange={(e) => set('resourceType', e.target.value as any)} className={selectCls}>
              <option value="todos">Todos</option>
              {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="font-semibold text-slate-700">Sede</span>
            <select id="f-campus" value={filter.campus} onChange={(e) => set('campus', e.target.value as any)} className={selectCls}>
              <option value="todos">Todas</option>
              {UCV_CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-700 block">Publicaciones que</span>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100" role="group">
              {([['todos', 'Todas'], ['ofrezco', 'Ofrecen'], ['busco', 'Buscan']] as const).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={filter.intent === v}
                  onClick={() => set('intent', v)}
                  className={`py-1.5 rounded-lg font-semibold transition ${filter.intent === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <label className="space-y-1.5">
            <span className="font-semibold text-slate-700">Ordenar por</span>
            <select id="f-sort" value={filter.sortBy} onChange={(e) => set('sortBy', e.target.value as any)} className={selectCls}>
              <option value="newest">Más recientes</option>
              <option value="rating">Mejor valorados ★</option>
              <option value="relevance">Destacados</option>
              <option value="downloads">Más consultados</option>
            </select>
          </label>
          {advancedActive && (
            <button type="button" onClick={resetFilter} className="sm:col-span-2 lg:col-span-3 justify-self-start inline-flex items-center gap-1 text-sm font-semibold text-red-600">
              <X className="w-4 h-4" /> Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};
