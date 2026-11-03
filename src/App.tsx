import React, { useState, useEffect } from 'react';
import { ExchangeProvider, useExchange } from './context/ExchangeContext';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { PublicationCard } from './components/PublicationCard';
import { PublicationDetailModal } from './components/PublicationDetailModal';
import { CreatePublicationModal } from './components/CreatePublicationModal';
import { ContactExchangeModal } from './components/ContactExchangeModal';
import { RequestsDrawer } from './components/RequestsDrawer';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ProjectInfoModal } from './components/ProjectInfoModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { filterPublications } from './utils/exchangeLogic';
import {
  BookOpen,
  ArrowRight,
  Star,
  WifiOff,
  Sparkles,
} from 'lucide-react';

const ExchangePortal: React.FC = () => {
  const {
    publications,
    filter,
    setFilter,
    setIsCreateModalOpen,
    setIsProjectInfoModalOpen,
    isLoggedIn,
    setIsAuthModalOpen,
    isSupabaseConfigured,
  } = useExchange();

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const filteredPubs = filterPublications(publications, filter);

  const hasActiveFilters =
    filter.category !== 'todas' ||
    filter.career !== 'todas' ||
    filter.campus !== 'todos' ||
    filter.minRating > 0 ||
    filter.searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Offline Status Alert if disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>
            Modo Sin Conexión (Offline) Activo: Puedes consultar todos tus materiales, apuntes y usuarios guardados en tu equipo.
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-medium text-amber-900">
        {isSupabaseConfigured
          ? 'El acceso de cuentas usa Supabase; los perfiles, publicaciones y cambios todavía se guardan solo en este navegador. No publiques datos sensibles.'
          : 'Prototipo público: el inicio de sesión aún no está configurado; los cambios se guardan solo en este navegador. No ingreses datos personales.'}
      </div>

      {/* Main Interactive Presentation Banner */}
      <Hero3D />

      {/* Category Filter and Search Toolbar */}
      <CategoryFilterBar />

      {/* Catalog & Feed Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Active Filters Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full inline-block" />
              Catálogo de Intercambio Académico
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explora apuntes, asesorías y convocatorias de investigación de todas las sedes de la UCV
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-xs">
              {filteredPubs.length} {filteredPubs.length === 1 ? 'recurso disponible' : 'recursos disponibles'}
            </span>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                + Publicar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Acceso Miembros
              </button>
            )}
          </div>
        </div>

        {/* Filter Breadcrumbs if applied */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200">
            <span className="font-bold text-slate-700">Filtros aplicados:</span>
            {filter.category !== 'todas' && (
              <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-semibold border border-red-200">
                {filter.category}
              </span>
            )}
            {filter.career !== 'todas' && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                {filter.career}
              </span>
            )}
            {filter.campus !== 'todos' && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                Sede {filter.campus}
              </span>
            )}
            {filter.searchQuery && (
              <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                "{filter.searchQuery}"
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                setFilter({
                  category: 'todas',
                  career: 'todas',
                  campus: 'todos',
                  searchQuery: '',
                  sortBy: 'relevance',
                  minRating: 0,
                })
              }
              className="text-xs text-red-600 font-bold hover:underline ml-1 cursor-pointer"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Publications Grid */}
        {filteredPubs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">No encontramos publicaciones</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No hay recursos con los filtros seleccionados. Intenta ampliar tu búsqueda o comparte el primer material para tus compañeros.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setFilter({
                    category: 'todas',
                    career: 'todas',
                    campus: 'todos',
                    searchQuery: '',
                    sortBy: 'relevance',
                    minRating: 0,
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Restablecer Filtros
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
              >
                + Publicar Ahora
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPubs.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}

        {/* Sample use cases */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Ejemplos de uso
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Formas de colaborar en comunidad
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsProjectInfoModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              Conocer esta propuesta <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Real Case 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-red-50/30 border border-slate-200/90 space-y-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Los apuntes de cálculo y diseño estructural me permitieron preparar mi sustento en Estructuras I."
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                  JR
                </div>
                <div>
                  <strong className="block text-xs text-slate-900">Estudiante de demostración</strong>
                  <span className="text-[11px] text-slate-500">Ing. Civil • UCV Trujillo</span>
                </div>
              </div>
            </div>

            {/* Real Case 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 space-y-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Coordinamos un equipo multidisciplinario para postular al semillero de investigación. La plataforma resuelve la dificultad para encontrar colaboradores afines."
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  MC
                </div>
                <div>
                  <strong className="block text-xs text-slate-900">Estudiante de demostración</strong>
                  <span className="text-[11px] text-slate-500">Ing. Civil • UCV Tarapoto</span>
                </div>
              </div>
            </div>

            {/* Real Case 3 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/90 space-y-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "Como catedrático asesor, destaco la incorporación de las políticas de uso responsable y respeto a los derechos de autor. Fomenta el compañerismo sin caer en el plagio."
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  AT
                </div>
                <div>
                  <strong className="block text-xs text-slate-900">Asesor académico de demostración</strong>
                  <span className="text-[11px] text-slate-500">Docente Asesor • UCV Lima Norte</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with copyright & legal information */}
      <Footer />

      {/* Modals & Drawers */}
      <PublicationDetailModal />
      <CreatePublicationModal />
      <ContactExchangeModal />
      <RequestsDrawer />
      <AdminPanelModal />
      <ProjectInfoModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ExchangeProvider>
      <ExchangePortal />
    </ExchangeProvider>
  );
}
