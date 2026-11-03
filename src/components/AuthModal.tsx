import React, { useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { publicAsset } from '../utils/publicAsset';

// ============================================
// DOMINIOS INSTITUCIONALES PERMITIDOS
// Si el array está vacío, acepta cualquier correo.
// ============================================
const DOMINIOS_PERMITIDOS = ['@ucvvirtual.edu.pe', '@ucss.pe'];

function validarCorreoInstitucional(email: string): boolean {
  if (DOMINIOS_PERMITIDOS.length === 0) return true;
  return DOMINIOS_PERMITIDOS.some(d => email.toLowerCase().endsWith(d));
}

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    continueAsGuest,
    loginUser,
    registerUser,
    authLoading,
    authStatusMessage,
    clearAuthStatusMessage,
    isSupabaseConfigured,
    isLoggedIn,
  } = useExchange();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen || authLoading) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !isSupabaseConfigured) return;

    // ✅ VALIDACIÓN DE CORREO INSTITUCIONAL
    if (!validarCorreoInstitucional(email)) {
      setFeedback(`Solo se aceptan correos institucionales: ${DOMINIOS_PERMITIDOS.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    clearAuthStatusMessage();

    try {
      const result =
        mode === 'login'
          ? await loginUser(email, password)
          : await registerUser(name, email, password);

      if (result.message) setFeedback(result.message);
      if (result.success && !result.needsEmailConfirmation) {
        setName('');
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

    const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setFeedback(null);
    setPassword('');
    clearAuthStatusMessage();
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
    setPassword('');
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-[#182038] to-[#2c0e14] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl">
              <img
                src={publicAsset('assets/logo_ucv_oficial.png')}
                alt="Universidad César Vallejo"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-base">
                {mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
              </h2>
              <p className="text-[11px] text-slate-300">Exchange UCV</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!isSupabaseConfigured && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-950 leading-relaxed">
              El inicio de sesión todavía no está conectado. El propietario debe configurar
              el proyecto de autenticación para habilitar las cuentas.
            </div>
          )}

          {(authStatusMessage || feedback) && (
            <div
              role="status"
              className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900"
            >
              {authStatusMessage || feedback}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <label className="block text-sm font-semibold text-slate-700">
                Nombre completo
                <span className="relative block mt-1.5">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
                    placeholder="Tu nombre"
                  />
                </span>
              </label>
            )}

            <label className="block text-sm font-semibold text-slate-700">
              Correo electrónico
              <span className="relative block mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
                  placeholder="tu-correo@ucvvirtual.edu.pe"
                />
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Contraseña
              <span className="relative block mt-1.5">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-red-500/40"
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={!isSupabaseConfigured || isSubmitting}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? 'Procesando...'
                : mode === 'login'
                  ? 'Iniciar sesión'
                  : 'Crear cuenta'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-red-700 hover:text-red-800 underline underline-offset-2"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-slate-600">
              Solo se aceptan correos institucionales de UCV Virtual y UCSS.
              El correo debe ser verificado antes de poder iniciar sesión.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPassword('');
              continueAsGuest();
            }}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-5 h-5" />
            {isLoggedIn ? 'Volver a Exchange UCV' : 'Explorar como invitado'}
          </button>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Exchange UCV · Acceso con correo institucional
        </div>
      </div>
    </div>
  );
};   