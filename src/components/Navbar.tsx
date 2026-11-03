import React from 'react';
import {
  Sparkles,
  Inbox,
  Shield,
  User,
  Plus,
  Info,
  LogIn,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { publicAsset } from '../utils/publicAsset';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    requests,
    setIsCreateModalOpen,
    setIsRequestsDrawerOpen,
    setIsAdminModalOpen,
    setIsAuthModalOpen,
    setIsProjectInfoModalOpen,
    logoutUser,
    isCreatorOrAdmin,
    filter,
    setFilter,
    getRoleById,
  } = useExchange();

  const pendingReceivedCount = currentUser
    ? requests.filter((r) => r.receiverId === currentUser.id && r.status === 'pendiente').length
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Official UCV Brand Logo & National Scope */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFilter((prev) => ({ ...prev, category: 'todas', career: 'todas', searchQuery: '' }));
              }}
              className="flex items-center gap-3 text-left group"
            >
              <img
                src={publicAsset('assets/logo_ucv_oficial.png')}
                alt="Universidad César Vallejo"
                className="h-8 md:h-9 w-auto object-contain"
              />
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 uppercase hidden sm:inline-block">
                Perú • Todas las Sedes
              </span>
            </button>
          </div>

          {/* Center Navigation Shortcuts */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: 'todas' }))}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter.category === 'todas'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Inicio
            </button>

            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: 'materiales' }))}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter.category === 'materiales'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Materiales
            </button>

            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: 'conocimientos' }))}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter.category === 'conocimientos'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Conocimientos
            </button>

            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: 'investigacion' }))}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter.category === 'investigacion'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Investigación
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Info PDF Project */}
            <button
              type="button"
              onClick={() => setIsProjectInfoModalOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
              title="Ficha del Proyecto Grupo 5"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">Proyecto Grupo 5</span>
            </button>

            {/* Admin Panel button - Only visible for creators/administrators */}
            {isCreatorOrAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="p-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Panel de Administración y Monitoreo (Exclusivo Creadores UCV)"
              >
                <Shield className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Solicitudes / Messages */}
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsRequestsDrawerOpen(true);
                }
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Bandeja de Intercambios"
            >
              <Inbox className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Solicitudes</span>
              {pendingReceivedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingReceivedCount}
                </span>
              )}
            </button>

            {/* + Publicar CTA Button */}
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-600/20 hover:from-red-500 hover:to-rose-500 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Publicar</span>
            </button>

            {/* User Session Chip / Auth Entry */}
            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  title="Cambiar cuenta o ver perfil"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
                  />
                  <div className="text-left hidden md:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[95px]">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-red-100 text-red-700 uppercase">
                        {getRoleById(currentUser.role).name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      Sede {currentUser.campus}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={logoutUser}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-red-400" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
