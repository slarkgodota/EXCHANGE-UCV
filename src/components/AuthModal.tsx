import React, { useEffect, useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  UserPlus,
  LogIn,
  LogOut,
  KeyRound,
  MapPin,
  GraduationCap,
  Phone,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { useExchange, AuthMode } from '../context/ExchangeContext';
import { CAREERS, UCV_CAMPUSES } from '../data/ucv';
import { CareerType, CampusType } from '../types/exchange';
import { Avatar } from './Avatar';

const CYCLES = ['Ciclo I', 'Ciclo II', 'Ciclo III', 'Ciclo IV', 'Ciclo V', 'Ciclo VI', 'Ciclo VII', 'Ciclo VIII', 'Ciclo IX', 'Ciclo X', 'Egresado', 'Docente'];

const inputBase =
  'w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-red-500/40 focus:border-red-500 focus:outline-none transition';
const labelBase = 'block font-semibold text-slate-700 mb-1.5 text-xs';

const PasswordInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: string;
  id: string;
}> = ({ value, onChange, placeholder = '••••••••', autoComplete, id }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      <input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${inputBase} pr-10`}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const PasswordStrength: React.FC<{ value: string }> = ({ value }) => {
  const checks = [value.length >= 8, /[A-Za-z]/.test(value) && /\d/.test(value), /[^A-Za-z0-9]/.test(value)];
  const score = checks.filter(Boolean).length;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Segura'];
  const colors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  if (!value) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex-1 grid grid-cols-3 gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1 rounded-full ${i < score ? colors[score] : 'bg-slate-200'}`} />
        ))}
      </div>
      <span className="text-[11px] text-slate-500 w-16 text-right">{labels[score]}</span>
    </div>
  );
};

const LoginForm: React.FC<{ onSwitch: (m: AuthMode) => void }> = ({ onSwitch }) => {
  const { loginUser } = useExchange();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginUser(email, password);
    if (!res.ok) setError(res.error || 'No se pudo iniciar sesión.');
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="login-email" className={labelBase}>Correo electrónico</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ucvvirtual.edu.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="login-password" className={labelBase}>Contraseña</label>
        <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Iniciar sesión
      </button>
      <p className="text-center text-xs text-slate-500">
        ¿Aún no tienes cuenta?{' '}
        <button type="button" onClick={() => onSwitch('register')} className="font-bold text-red-600 hover:underline">
          Crea una gratis
        </button>
      </p>
    </form>
  );
};

const RegisterForm: React.FC<{ onSwitch: (m: AuthMode) => void }> = ({ onSwitch }) => {
  const { registerUser } = useExchange();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [career, setCareer] = useState<CareerType>('Ingeniería Civil');
  const [campus, setCampus] = useState<CampusType>('Moyobamba');
  const [cycle, setCycle] = useState('Ciclo I');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = registerUser({
      name,
      email,
      password,
      confirmPassword: confirm,
      career,
      campus,
      cycle,
      phone,
      acceptedTerms: accepted,
    });
    if (!res.ok) setError(res.error || 'No se pudo crear la cuenta.');
  };

  const selectBase = `${inputBase} appearance-none`;

  return (
    <form onSubmit={submit} className="space-y-3.5" noValidate>
      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="reg-name" className={labelBase}>Nombre completo</label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input id="reg-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombres y apellidos" className={inputBase} required />
        </div>
      </div>
      <div>
        <label htmlFor="reg-email" className={labelBase}>Correo electrónico</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ucvvirtual.edu.pe" className={inputBase} required />
        </div>
        <span className="text-[11px] text-slate-400 mt-1 block">Puedes usar tu correo institucional o personal.</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="reg-pass" className={labelBase}>Contraseña</label>
          <PasswordInput id="reg-pass" value={password} onChange={setPassword} autoComplete="new-password" placeholder="Mín. 8, letras y números" />
          <PasswordStrength value={password} />
        </div>
        <div>
          <label htmlFor="reg-pass2" className={labelBase}>Confirmar contraseña</label>
          <PasswordInput id="reg-pass2" value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Repite la contraseña" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="reg-career" className={labelBase}>Carrera</label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select id="reg-career" value={career} onChange={(e) => setCareer(e.target.value as CareerType)} className={selectBase}>
              {CAREERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="reg-campus" className={labelBase}>Campus UCV</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select id="reg-campus" value={campus} onChange={(e) => setCampus(e.target.value as CampusType)} className={selectBase}>
              {UCV_CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="reg-cycle" className={labelBase}>Ciclo</label>
          <select id="reg-cycle" value={cycle} onChange={(e) => setCycle(e.target.value)} className={`${selectBase} pl-3.5`}>
            {CYCLES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="reg-phone" className={labelBase}>Celular <span className="font-normal text-slate-400">(opcional)</span></label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input id="reg-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+51 9XX XXX XXX" className={inputBase} />
          </div>
        </div>
      </div>
      <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-red-600" />
        <span>
          Acepto la política de uso responsable: compartiré solo material propio o de libre acceso, citaré las fuentes y respetaré los derechos de autor. Mi celular solo se mostrará cuando acepte un intercambio.
        </span>
      </label>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Crear mi cuenta
      </button>
      <p className="text-center text-xs text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={() => onSwitch('login')} className="font-bold text-red-600 hover:underline">
          Inicia sesión
        </button>
      </p>
    </form>
  );
};

const AccountPanel: React.FC = () => {
  const { currentUser, getRoleById, logoutUser, changePassword, updateProfile } = useExchange();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!currentUser) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = changePassword(current, next);
    setMsg(res.ok ? { ok: true, text: 'Contraseña actualizada.' } : { ok: false, text: res.error || 'Error' });
    if (res.ok) {
      setCurrent('');
      setNext('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <Avatar name={currentUser.name} src={currentUser.avatar} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <strong className="text-slate-900 truncate">{currentUser.name}</strong>
            {currentUser.verified && <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" aria-label="Cuenta verificada" />}
          </div>
          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
          <p className="text-[11px] text-red-700 font-semibold mt-0.5">{getRoleById(currentUser.role).name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <label className="block">
          <span className={labelBase}>Campus</span>
          <select
            value={currentUser.campus}
            onChange={(e) => updateProfile({ campus: e.target.value as CampusType })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
          >
            {UCV_CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelBase}>Carrera</span>
          <select
            value={currentUser.career}
            onChange={(e) => updateProfile({ career: e.target.value as CareerType })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
          >
            {CAREERS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <form onSubmit={submit} className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-red-600" /> Cambiar contraseña
        </h4>
        {msg && (
          <div className={`p-2.5 rounded-xl text-xs border ${msg.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {msg.text}
          </div>
        )}
        <PasswordInput id="acc-current" value={current} onChange={setCurrent} autoComplete="current-password" placeholder="Contraseña actual" />
        <PasswordInput id="acc-next" value={next} onChange={setNext} autoComplete="new-password" placeholder="Nueva contraseña" />
        <PasswordStrength value={next} />
        <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
          Guardar nueva contraseña
        </button>
      </form>

      <button
        type="button"
        onClick={logoutUser}
        className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>
    </div>
  );
};

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, openAuth, isLoggedIn } = useExchange();
  const mode = authMode;

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsAuthModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const title = isLoggedIn ? 'Mi cuenta' : mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a Exchange UCV';
  const subtitle = isLoggedIn
    ? 'Gestiona tu perfil y tu contraseña'
    : mode === 'login'
    ? 'Ingresa para publicar y coordinar intercambios'
    : 'Crea tu cuenta en menos de un minuto';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && setIsAuthModalOpen(false)}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col">
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-[#0f1a33] via-[#16264a] to-[#4a0d18] text-white">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-4 top-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-1.5 rounded-xl">
              <img src="/assets/logo_ucv_oficial.png" alt="Universidad César Vallejo" className="h-7 w-auto object-contain" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-200">Exchange UCV</span>
          </div>
          <h2 id="auth-title" className="font-display text-2xl font-bold leading-tight">{title}</h2>
          <p className="text-sm text-slate-300 mt-1">{subtitle}</p>

          {!isLoggedIn && (
            <div className="mt-5 grid grid-cols-2 p-1 rounded-xl bg-white/10 text-sm font-semibold" role="tablist">
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => openAuth(m)}
                  className={`py-2 rounded-lg transition ${mode === m ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'}`}
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {isLoggedIn ? (
            <AccountPanel />
          ) : mode === 'login' ? (
            <LoginForm onSwitch={openAuth} />
          ) : (
            <RegisterForm onSwitch={openAuth} />
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            {isLoggedIn ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
            Tu contraseña se guarda cifrada (hash)
          </span>
          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="text-slate-700 hover:text-red-600 font-bold flex items-center gap-1"
            >
              Explorar como invitado <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
