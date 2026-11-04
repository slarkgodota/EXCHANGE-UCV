import React, { useState } from 'react';
import { Inbox, Shield, Plus, LogIn, Menu, X, UserPlus } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { Avatar } from './Avatar';
import { goTo, View } from '../utils/router';

const LINKS: { view: View; label: string }[] = [
  { view: 'inicio', label: 'Inicio' },
  { view: 'catalogo', label: 'Catálogo' },
  { view: 'biblioteca', label: 'Biblioteca' },
  { view: 'sedes', label: 'Sedes' },
];

export const Navbar: React.FC<{ view: View }> = ({ view }) => {
  const {
    currentUser,
    isLoggedIn,
    requests,
    setIsCreateModalOpen,
    setIsRequestsDrawerOpen,
    setIsAdminModalOpen,
    setIsAuthModalOpen,
    openAuth,
    isCreatorOrAdmin,
  } = useExchange();
  const [open, setOpen] = useState(false);

  const pending = currentUser
    ? requests.filter((r) => r.receiverId === currentUser.id && r.status === 'pendiente').length
    : 0;

  const nav = (v: View) => {
    setOpen(false);
    goTo(v);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <button type="button" onClick={() => nav('inicio')} className="flex items-center gap-2.5 shrink-0" aria-label="Exchange UCV, inicio">
            <img src="/assets/logo_ucv_alt.png" alt="" className="h-9 w-9 object-contain" />
            <span className="font-display font-bold text-slate-900 text-lg tracking-tight">
              Exchange<span className="text-red-600">UCV</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center p-1 rounded-full bg-slate-100/80" aria-label="Principal">
            {LINKS.map((l) => {
              const active = view === l.view;
              return (
                <button
                  key={l.view}
                  type="button"
                  onClick={() => nav(l.view)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            {isCreatorOrAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition"
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
            )}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setIsRequestsDrawerOpen(true)}
                className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
                aria-label={`Solicitudes${pending ? `, ${pending} pendientes` : ''}`}
              >
                <Inbox className="w-5 h-5" />
                {pending > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {pending}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLoggedIn ? setIsCreateModalOpen(true) : openAuth('register'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition hover:-translate-y-px"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Publicar</span>
            </button>
            {isLoggedIn && currentUser ? (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className="rounded-full hover:ring-4 hover:ring-slate-100 transition" title="Mi cuenta">
                <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                >
                  <LogIn className="w-4 h-4" /> Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="hidden xs:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  <UserPlus className="w-4 h-4" /> Crear cuenta
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100"
              aria-label="Menú"
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden pb-3 grid gap-1 view-enter" aria-label="Menú móvil">
            {LINKS.map((l) => (
              <button
                key={l.view}
                type="button"
                onClick={() => nav(l.view)}
                className={`px-3 py-2.5 rounded-xl text-left text-sm font-semibold ${view === l.view ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {l.label}
              </button>
            ))}
            {isCreatorOrAdmin && (
              <button type="button" onClick={() => { setOpen(false); setIsAdminModalOpen(true); }} className="px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-red-700 hover:bg-red-50">
                Panel de administración
              </button>
            )}
            {!isLoggedIn && (
              <button type="button" onClick={() => { setOpen(false); openAuth('login'); }} className="px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Iniciar sesión
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
