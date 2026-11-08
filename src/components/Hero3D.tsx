import React from 'react';
import { ArrowRight, BookOpen, Users, FlaskConical, Library, Search } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';
import { HOW_IT_WORKS } from '../data/catalog';
import { UCV_FACTS } from '../data/ucv';
import { LIBRARY_RESOURCES } from '../data/library';
import { TopContributors } from './TopContributors';
import { HeroRooms } from './RoomShowcase';

const SECTIONS = [
  { cat: 'conocimientos', icon: Users, title: 'Conocimientos', text: 'Ofrece ayuda en lo que dominas o pide apoyo para aprender.', tone: 'from-blue-500 to-indigo-600' },
  { cat: 'materiales', icon: BookOpen, title: 'Materiales', text: 'Resúmenes, apuntes, presentaciones y mapas conceptuales.', tone: 'from-red-500 to-rose-600' },
  { cat: 'investigacion', icon: FlaskConical, title: 'Investigación', text: 'Publica tu idea de proyecto y encuentra compañeros.', tone: 'from-emerald-500 to-teal-600' },
] as const;

/** Vista de inicio */
export const Hero3D: React.FC = () => {
  const { setFilter, setIsCreateModalOpen, openAuth, isLoggedIn, currentUser } = useExchange();

  const openCategory = (cat: (typeof SECTIONS)[number]['cat']) => {
    setFilter((prev) => ({ ...prev, category: cat }));
    goTo('catalogo');
  };

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-[#0a1430] text-white">
        <div aria-hidden className="blob absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-red-600/30 blur-3xl" />
        <div aria-hidden className="blob-slow absolute -bottom-48 -left-32 w-[480px] h-[480px] rounded-full bg-blue-500/20 blur-3xl" />
        <div aria-hidden className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          <div className="text-center lg:text-left min-w-0">
          <p className="reveal-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Comparte · Aprende · Colabora
          </p>
          <h1 className="reveal-2 font-display mt-6 text-5xl sm:text-6xl lg:text-[4.2rem] font-bold tracking-tight leading-[1.02] text-balance">
            {isLoggedIn && currentUser ? (
              <>Hola, {currentUser.name.split(' ')[0]}.<br /><span className="text-shine">¿Qué compartes hoy?</span></>
            ) : (
              <>Juntos <span className="text-shine">aprendemos</span> más.</>
            )}
          </h1>
          <p className="reveal-3 mt-5 text-lg text-slate-300 max-w-xl mx-auto lg:mx-0">
            Apuntes, asesorías entre pares y equipos de investigación para estudiantes de la UCV, en un solo lugar.
          </p>
          <div className="reveal-4 mt-9 flex flex-wrap justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={() => goTo('catalogo')}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold shadow-xl shadow-red-900/40 transition hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" /> Explorar catálogo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => (isLoggedIn ? setIsCreateModalOpen(true) : openAuth('register'))}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold transition"
            >
              {isLoggedIn ? 'Publicar algo' : 'Crear cuenta gratis'}
            </button>
          </div>
          </div>
          <HeroRooms />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative">
        <div className="grid md:grid-cols-3 gap-4 stagger">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.cat}
                type="button"
                style={{ '--i': i } as React.CSSProperties}
                onClick={() => openCategory(s.cat)}
                className="lift group text-left bg-white rounded-3xl border border-slate-200 p-6 shadow-sm"
              >
                <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.tone} text-white flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-4">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{s.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
                  Ver publicaciones <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-slate-900 text-center">¿Cómo funciona?</h2>
        <ol className="mt-10 grid sm:grid-cols-5 gap-6 stagger">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title} style={{ '--i': i + 3 } as React.CSSProperties} className="text-center">
              <span className="mx-auto w-11 h-11 rounded-full bg-slate-900 text-white font-display font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="font-bold text-slate-900 mt-3">{step.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <TopContributors />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-2 gap-4">
          <button type="button" onClick={() => goTo('biblioteca')} className="lift group text-left rounded-3xl p-7 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <Library className="w-7 h-7 text-red-400" />
            <h3 className="font-display text-2xl font-bold mt-4">Biblioteca</h3>
            <p className="text-slate-300 mt-1">{LIBRARY_RESOURCES.length} recursos oficiales y gratuitos, con valoración de la comunidad.</p>
            <span className="mt-5 inline-flex items-center gap-1 font-semibold text-red-300">Abrir <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
          </button>
          <button type="button" onClick={() => goTo('sedes')} className="lift group text-left rounded-3xl p-7 bg-gradient-to-br from-red-600 to-rose-700 text-white">
            <span className="font-display text-5xl font-bold">{UCV_FACTS.campusCount}</span>
            <h3 className="font-display text-2xl font-bold mt-2">campus en {UCV_FACTS.regionCount} regiones</h3>
            <p className="text-red-100 mt-1">Ubicación y horarios de biblioteca de cada sede UCV.</p>
            <span className="mt-5 inline-flex items-center gap-1 font-semibold">Ver sedes <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
          </button>
        </div>
      </section>
    </>
  );
};
