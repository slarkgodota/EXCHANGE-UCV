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
import { LibrarySection } from './components/LibrarySection';
import { CampusSection } from './components/CampusSection';
import { Footer } from './components/Footer';
import { ThemeToggle } from './components/ThemeToggle';
import { filterPublications } from './utils/exchangeLogic';
import { RoomBanner, RoomPicker } from './components/RoomShowcase';
import { RoomTheme } from './components/RoomTheme';
import { activeRoomFor } from './data/roomThemes';
import { ROOM_BY_ID } from './data/rooms';
import { useView, goTo } from './utils/router';
import { BookOpen, Plus, WifiOff } from 'lucide-react';

const CatalogView: React.FC = () => {
  const { publications, filter, resetFilter, setIsCreateModalOpen, isLoggedIn, openAuth } = useExchange();
  const list = filterPublications(publications, filter);
  // El cuarto 3D cambia según lo que se busca (con una pequeña espera para no cambiar en cada tecla)
  const [roomFilter, setRoomFilter] = useState(filter);
  useEffect(() => {
    const id = window.setTimeout(() => setRoomFilter(filter), 450);
    return () => window.clearTimeout(id);
  }, [filter.searchQuery, filter.career, filter.category, filter.course]);
  const active = activeRoomFor(roomFilter);
  const publish = () => (isLoggedIn ? setIsCreateModalOpen(true) : openAuth('register'));

  return (
    <div className="space-y-8">
      <header className="reveal-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {active && <p key={active + '-k'} className="room-title text-xs font-bold uppercase tracking-[0.2em] text-red-700">Catálogo · {ROOM_BY_ID[active].label}</p>}
          <h1 key={active ?? 'none'} className="room-title font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">{active ? ROOM_BY_ID[active].place : 'Catálogo'}</h1>
          <p className="text-slate-500 mt-2">{active ? ROOM_BY_ID[active].tagline : 'Lo que comparten y buscan los estudiantes de la UCV.'}</p>
        </div>
        <button
          type="button"
          onClick={publish}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Publicar
        </button>
      </header>

      <div className="reveal-2">
        <RoomBanner room={active} count={list.length} />
        <RoomPicker active={active} />
      </div>

      <div className="reveal-2">
        <CategoryFilterBar />
      </div>

      {list.length === 0 ? (
        <div className="reveal-3 text-center py-20 px-6 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-5">
            {publications.length === 0 ? 'Aún no hay publicaciones' : 'Sin resultados'}
          </h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            {publications.length === 0
              ? 'Sé la primera persona en compartir un material, ofrecer ayuda o convocar a tu equipo.'
              : 'Prueba con otra búsqueda o quita los filtros.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {publications.length > 0 && (
              <button type="button" onClick={resetFilter} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700">
                Quitar filtros
              </button>
            )}
            <button type="button" onClick={publish} className="px-5 py-2.5 rounded-full text-sm font-bold bg-red-600 hover:bg-red-700 text-white">
              {isLoggedIn ? 'Publicar ahora' : 'Crear cuenta y publicar'}
            </button>
            <button type="button" onClick={() => goTo('biblioteca')} className="px-5 py-2.5 rounded-full text-sm font-semibold border border-slate-200 hover:bg-white text-slate-700">
              Ir a la biblioteca
            </button>
          </div>
        </div>
      ) : (
        <div key={JSON.stringify(filter)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {list.map((pub, i) => (
            <PublicationCard key={pub.id} publication={pub} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const ExchangePortal: React.FC = () => {
  const view = useView();
  const { syncStatus, syncError } = useExchange();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <RoomTheme />
      {!isOnline && (
        <div className="bg-amber-500 text-amber-950 text-xs font-bold py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" /> Sin conexión: puedes ver lo guardado en este dispositivo.
        </div>
      )}
      {(syncStatus === 'error' || syncError) && (
        <div role="alert" className="bg-red-600 text-white text-xs font-semibold py-2 px-4 text-center">
          {syncError || 'No se pudo conectar con la base de datos. Lo que veas puede no estar actualizado.'}
        </div>
      )}
      {syncStatus === 'loading' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs shadow-lg">Cargando publicaciones…</div>
      )}
      <Navbar view={view} />

      <main key={view} className="flex-1 w-full view-enter">
        {view === 'inicio' ? (
          <Hero3D />
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            {view === 'catalogo' && <CatalogView />}
            {view === 'biblioteca' && <LibrarySection />}
            {view === 'sedes' && <CampusSection />}
          </div>
        )}
      </main>

      <Footer />

      <PublicationDetailModal />
      <CreatePublicationModal />
      <ContactExchangeModal />
      <RequestsDrawer />
      <AdminPanelModal />
      <ProjectInfoModal />
      <AuthModal />
      <ThemeToggle />
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
