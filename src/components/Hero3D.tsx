import React from 'react';
import { Search, Sparkles, ShieldCheck, Globe, ArrowRight, BookOpen, Users, Star } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { publicAsset } from '../utils/publicAsset';

export const Hero3D: React.FC = () => {
  const { filter, setFilter, setIsCreateModalOpen, setIsProjectInfoModalOpen, setIsAuthModalOpen, isLoggedIn, currentUser } = useExchange();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#161f38] to-[#2b0d14] text-white shadow-xl border border-slate-800 mb-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-8 md:py-12 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold backdrop-blur-sm">
            <Globe className="w-3.5 h-3.5 text-red-400" />
            <span>Universidad César Vallejo • Red Universitaria Nacional (Perú)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Exchange <span className="text-red-500">UCV</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
            La plataforma académica donde los estudiantes de todas las sedes de la UCV comparten apuntes de clase, ofrecen tutorías y forman equipos de investigación.
          </p>

          {/* Clean Search Bar */}
          <div className="relative max-w-lg">
            <div className="flex items-center bg-white text-slate-900 rounded-2xl p-1.5 shadow-lg border border-slate-100 focus-within:ring-2 focus-within:ring-red-500">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Busca por curso o carrera (ej. Cálculo, Estructuras, Suelos)..."
                value={filter.searchQuery}
                onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full bg-transparent border-0 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {filter.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
                  className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 mr-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              + Publicar Material o Tutoría
            </button>

            <button
              type="button"
              onClick={() => setIsProjectInfoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Ficha del Proyecto Grupo 5
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="font-bold text-white text-base">Todas las Sedes</span>
              <p className="text-[11px] text-slate-400">Lima, Trujillo, Piura y más</p>
            </div>
            <div>
              <span className="font-bold text-amber-400 text-base">4.9 ★</span>
              <p className="text-[11px] text-slate-400">Valoración de 5 Estrellas</p>
            </div>
            <div>
              <span className="font-bold text-emerald-400 text-base">Demo</span>
              <p className="text-[11px] text-slate-400">Perfiles de muestra</p>
            </div>
          </div>
        </div>

        {/* Right Column: Seamless official UCV Emblem Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-slate-900/60 backdrop-blur-xl border border-slate-700/80 shadow-2xl flex flex-col items-center text-center space-y-4">
            {/* Glowing circle accent behind shield */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent rounded-3xl pointer-events-none" />

            {/* Official UCV Shield Isotype */}
            <div className="relative z-10 w-28 h-28 flex items-center justify-center">
              <img
                src={publicAsset('assets/logo_ucv_alt.png')}
                alt="Escudo Oficial Universidad César Vallejo"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(200,16,46,0.35)]"
              />
            </div>

            {/* Official Horizontal Full Logo Banner */}
            <div className="relative z-10 bg-white px-4 py-2 rounded-xl shadow-md w-full flex items-center justify-center">
              <img
                src={publicAsset('assets/logo_ucv_oficial.png')}
                alt="Universidad César Vallejo"
                className="h-7 w-auto object-contain"
              />
            </div>

            {/* User status chip or prompt */}
            <div className="relative z-10 w-full pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isLoggedIn && currentUser ? (
                  <span className="text-slate-200">
                    Sesión: <strong>{currentUser.name.split(' ')[0]}</strong>
                  </span>
                ) : (
                  <span>Portal Abierto</span>
                )}
              </span>

              {!isLoggedIn && (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline"
                >
                  Identificarse →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
