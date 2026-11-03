import React from 'react';
import {
  Layers,
  BookOpen,
  GraduationCap,
  Microscope,
  Building2,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { CategoryType, CareerType, CampusType } from '../types/exchange';

interface CategoryOption {
  id: 'todas' | CategoryType;
  label: string;
  countKey?: 'materiales' | 'conocimientos' | 'investigacion';
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'todas', label: 'Todo el Catálogo', icon: Layers },
  { id: 'materiales', label: 'Materiales Académicos', countKey: 'materiales', icon: BookOpen },
  { id: 'conocimientos', label: 'Tutorías y Conocimientos', countKey: 'conocimientos', icon: GraduationCap },
  { id: 'investigacion', label: 'Equipos de Investigación', countKey: 'investigacion', icon: Microscope },
];

const CAREERS: ('todas' | CareerType)[] = [
  'todas',
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Medicina Humana',
  'Derecho',
  'Psicología',
  'Administración',
  'Arquitectura',
  'Contabilidad',
  'General / Interdisciplinario',
];

const CAMPUSES: ('todos' | CampusType)[] = [
  'todos',
  'Lima Norte',
  'Lima Este',
  'Lima Ate',
  'Callao',
  'Trujillo',
  'Piura',
  'Chiclayo',
  'Tarapoto',
  'Chimbote',
  'Huaraz',
  'Chepén',
  'Moyobamba',
];

export const CategoryFilterBar: React.FC = () => {
  const { filter, setFilter, publications } = useExchange();

  const getCategoryCount = (id: 'todas' | CategoryType) => {
    if (id === 'todas') return publications.length;
    return publications.filter((p) => p.category === id).length;
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 4 Simple, Direct Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = filter.category === cat.id;
          const Icon = cat.icon;
          const count = getCategoryCount(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: cat.id }))}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 shadow-xs ${
                isSelected
                  ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-600/30'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-white' : 'text-red-600'}`} />
                <span className="text-xs font-bold truncate">{cat.label}</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Simple Filter Bar: Carrera + Sede + Ordenar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Career Filter */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Carrera UCV:</span>
            <select
              aria-label="Seleccionar carrera profesional"
              value={filter.career}
              onChange={(e) => setFilter((prev) => ({ ...prev, career: e.target.value as any }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="todas">Todas las Carreras</option>
              {CAREERS.filter((c) => c !== 'todas').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-semibold text-slate-700">Sede:</span>
            <select
              aria-label="Seleccionar sede"
              value={filter.campus}
              onChange={(e) => setFilter((prev) => ({ ...prev, campus: e.target.value as any }))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>
                  {c === 'todos' ? 'Todas las Sedes UCV' : `Sede ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700">Ordenar por:</span>
          <select
            aria-label="Ordenar publicaciones"
            value={filter.sortBy}
            onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as any }))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <option value="relevance">Destacados y Relevantes</option>
            <option value="rating">Mejor Calificados (5★)</option>
            <option value="downloads">Más Descargados</option>
            <option value="newest">Más Recientes</option>
          </select>
        </div>
      </div>
    </div>
  );
};
