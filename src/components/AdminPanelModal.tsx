import React, { useEffect, useMemo, useState } from 'react';
import { X, Shield, Users, FileText, Flag, KeyRound, Search, UserPlus, Trash2, Lock, Check, Star, Eye, EyeOff, BadgeCheck, RotateCcw, Plus } from 'lucide-react';
import { useExchange, CREATOR_EMAILS } from '../context/ExchangeContext';
import { calculateAdminMetrics, validateAdminCreateUser } from '../utils/exchangeLogic';
import { CareerType, CampusType, RolePermission } from '../types/exchange';
import { CAREERS, UCV_CAMPUSES, getCampusLabel } from '../data/ucv';
import { Avatar } from './Avatar';
import { StarDisplay } from './StarRating';

type Tab = 'resumen' | 'usuarios' | 'publicaciones' | 'reportes' | 'roles';

const PERMISSION_LABELS: Record<keyof RolePermission, string> = {
  canPublish: 'Publicar',
  canAccessAdminPanel: 'Entrar al panel',
  canManageUsers: 'Gestionar usuarios',
  canManageRoles: 'Gestionar roles',
  canAuditAI: 'Revisar originalidad',
  canModeratePublications: 'Moderar publicaciones',
  canExportData: 'Exportar datos',
};

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-red-500/15 focus:border-red-400 focus:outline-none';

/** Pide confirmación dentro de la página (los diálogos del navegador no funcionan en todos los visores). */
const ConfirmButton: React.FC<{ onConfirm: () => void; label: string; confirmLabel?: string; className?: string; icon?: React.ReactNode }> = ({
  onConfirm,
  label,
  confirmLabel = 'Confirmar',
  className = '',
  icon,
}) => {
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 4000);
    return () => clearTimeout(t);
  }, [asking]);
  return (
    <button
      type="button"
      onClick={() => {
        if (asking) {
          setAsking(false);
          onConfirm();
        } else setAsking(true);
      }}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
        asking ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
      } ${className}`}
    >
      {icon}
      {asking ? confirmLabel : label}
    </button>
  );
};

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    isCreatorOrAdmin,
    publications,
    users,
    requests,
    reports,
    roles,
    getRoleById,
    createUserByAdmin,
    updateUserRole,
    setUserVerified,
    deleteUser,
    updatePublicationStatus,
    deletePublication,
    resolveReport,
    createRole,
    deleteRole,
    resetDatabase,
    currentUser,
  } = useExchange();

  const [tab, setTab] = useState<Tab>('resumen');
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [showNew, setShowNew] = useState(false);
  const [nu, setNu] = useState({ name: '', email: '', password: '', role: 'student', career: 'Ingeniería Civil' as CareerType, campus: 'Moyobamba' as CampusType });
  const [formError, setFormError] = useState<string | null>(null);

  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [newPerms, setNewPerms] = useState<RolePermission>({
    canPublish: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canManageRoles: false,
    canAuditAI: false,
    canModeratePublications: false,
    canExportData: false,
  });

  useEffect(() => {
    if (!isAdminModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsAdminModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAdminModalOpen]);

  const metrics = useMemo(() => calculateAdminMetrics(publications, users, requests, reports), [publications, users, requests, reports]);

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users
      .filter((u) => roleFilter === 'todos' || u.role === roleFilter)
      .filter((u) => !s || [u.name, u.email, u.career, getCampusLabel(u.campus)].join(' ').toLowerCase().includes(s))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [users, q, roleFilter]);

  if (!isAdminModalOpen || !isCreatorOrAdmin) return null;

  const isProtected = (email: string) => CREATOR_EMAILS.includes(email.toLowerCase().trim());
  const pendingReports = reports.filter((r) => r.status === 'pendiente').length;
  const totalReviews = publications.reduce((a, p) => a + p.reviews.length, 0);

  const submitNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAdminCreateUser({ ...nu, existingEmails: users.map((u) => u.email) });
    if (err) {
      setFormError(err);
      return;
    }
    const created = createUserByAdmin({ ...nu, cycle: '' });
    setFormError(null);
    setShowNew(false);
    setNu({ ...nu, name: '', email: '', password: '' });
    flash(`Cuenta creada para ${created.name} como ${getRoleById(created.role).name}.`);
  };

  const submitNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole.name.trim().length < 3) {
      flash('El nombre del rol debe tener al menos 3 caracteres.');
      return;
    }
    const id = newRole.name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_');
    if (roles.some((r) => r.id === id)) {
      flash('Ya existe un rol con ese nombre.');
      return;
    }
    createRole({ id, name: newRole.name.trim(), description: newRole.description.trim() || 'Rol personalizado', badgeColor: 'indigo', iconName: 'award', permissions: newPerms });
    setNewRole({ name: '', description: '' });
    flash('Rol creado.');
  };

  const TABS: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'resumen', label: 'Resumen', icon: Shield },
    { id: 'usuarios', label: 'Usuarios', icon: Users, count: users.length },
    { id: 'publicaciones', label: 'Publicaciones', icon: FileText, count: publications.length },
    { id: 'reportes', label: 'Reportes', icon: Flag, count: pendingReports },
    { id: 'roles', label: 'Roles', icon: KeyRound, count: roles.length },
  ];

  const roleCounts = roles.map((r) => ({ role: r, n: users.filter((u) => u.role === r.id).length })).filter((x) => x.n > 0);
  const recent = [...users].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-6 animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && setIsAdminModalOpen(false)}
    >
      <div role="dialog" aria-modal="true" aria-label="Panel de administración" className="view-enter relative bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        <div className="px-6 py-4 bg-[#0a1430] text-white flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Panel de administración</h2>
            <p className="text-xs text-slate-400">Sesión: {currentUser?.email}</p>
          </div>
          <button type="button" onClick={() => setIsAdminModalOpen(false)} className="p-2 rounded-full hover:bg-white/10" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 pt-3 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                  active ? 'border-red-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-[11px] px-1.5 rounded-full ${t.id === 'reportes' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div key={tab} className="p-4 sm:p-6 overflow-y-auto view-enter">
          {tab === 'resumen' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
                {[
                  { label: 'Usuarios registrados', value: metrics.totalUsers },
                  { label: 'Publicaciones activas', value: metrics.totalPublications },
                  { label: 'Solicitudes de intercambio', value: metrics.totalExchanges },
                  { label: 'Reportes pendientes', value: metrics.pendingReports },
                ].map((m, i) => (
                  <div key={m.label} style={{ '--i': i } as React.CSSProperties} className="bg-white rounded-2xl border border-slate-200 p-4">
                    <p className="font-display text-3xl font-bold text-slate-900 tabular-nums">{m.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-900 text-sm">Usuarios por rol</h3>
                  <ul className="mt-3 space-y-2.5">
                    {roleCounts.map(({ role, n }) => (
                      <li key={role.id} className="text-sm">
                        <div className="flex justify-between">
                          <span>{role.name}</span>
                          <span className="tabular-nums font-semibold">{n}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(n / Math.max(1, users.length)) * 100}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-900 text-sm">Valoración promedio de publicaciones</h3>
                  <div className="mt-2">
                    <StarDisplay value={metrics.averageSatisfaction} count={totalReviews} size="md" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-5">Últimos registros</h3>
                  <ul className="mt-2 space-y-2">
                    {recent.map((u) => (
                      <li key={u.id} className="flex items-center gap-2 text-sm">
                        <Avatar name={u.name} src={u.avatar} size="xs" />
                        <span className="truncate flex-1">{u.name}</span>
                        <span className="text-xs text-slate-400 tabular-nums">{u.createdAt || 'inicial'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Reiniciar datos</h3>
                  <p className="text-xs text-slate-500">Borra publicaciones, cuentas creadas, solicitudes y valoraciones de este dispositivo.</p>
                </div>
                <ConfirmButton onConfirm={resetDatabase} label="Reiniciar" confirmLabel="Sí, borrar todo" icon={<RotateCcw className="w-3.5 h-3.5" />} className="border border-slate-200" />
              </div>
            </div>
          )}

          {tab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input id="adm-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo, carrera o sede" className={`${inputCls} pl-10`} />
                </label>
                <select id="adm-role" aria-label="Filtrar por rol" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={`${inputCls} sm:w-52`}>
                  <option value="todos">Todos los roles</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowNew(!showNew)} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
                  <UserPlus className="w-4 h-4" /> Nueva cuenta
                </button>
              </div>

              {showNew && (
                <form onSubmit={submitNewUser} className="view-enter bg-white rounded-2xl border border-red-200 p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {formError && <p className="sm:col-span-2 lg:col-span-3 p-2.5 rounded-xl bg-red-50 text-red-800 text-xs">{formError}</p>}
                  <input id="nu-name" aria-label="Nombre" placeholder="Nombre completo" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} className={inputCls} />
                  <input id="nu-email" aria-label="Correo" type="email" placeholder="Correo" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} className={inputCls} />
                  <input id="nu-pass" aria-label="Contraseña inicial" type="text" placeholder="Contraseña inicial (8+, letras y números)" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} className={inputCls} />
                  <select id="nu-role" aria-label="Rol" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })} className={inputCls}>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <select id="nu-career" aria-label="Carrera" value={nu.career} onChange={(e) => setNu({ ...nu, career: e.target.value as CareerType })} className={inputCls}>
                    {CAREERS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <select id="nu-campus" aria-label="Sede" value={nu.campus} onChange={(e) => setNu({ ...nu, campus: e.target.value as CampusType })} className={inputCls}>
                    {UCV_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <button type="submit" className="sm:col-span-2 lg:col-span-3 justify-self-end px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                    Crear cuenta
                  </button>
                </form>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm min-w-[820px]">
                  <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Usuario</th>
                      <th className="px-4 py-3 font-semibold">Carrera · Sede</th>
                      <th className="px-4 py-3 font-semibold">Registro</th>
                      <th className="px-4 py-3 font-semibold">Rol</th>
                      <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const locked = isProtected(u.email);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.name} src={u.avatar} size="sm" />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 flex items-center gap-1">
                                  {u.name}
                                  {u.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {u.email}
                                  {u.phone ? ` · ${u.phone}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {u.career}
                            <br />
                            {getCampusLabel(u.campus)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">{u.createdAt || 'Cuenta inicial'}</td>
                          <td className="px-4 py-3">
                            {locked ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                                <Lock className="w-3.5 h-3.5 text-slate-400" /> {getRoleById(u.role).name}
                              </span>
                            ) : (
                              <select
                                aria-label={`Rol de ${u.name}`}
                                value={u.role}
                                onChange={(e) => {
                                  updateUserRole(u.id, e.target.value);
                                  flash(`${u.name} ahora es ${getRoleById(e.target.value).name}.`);
                                }}
                                className="w-40 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-red-500/30 focus:outline-none"
                              >
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setUserVerified(u.id, !u.verified)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${u.verified ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                <Check className="w-3.5 h-3.5" /> {u.verified ? 'Verificado' : 'Verificar'}
                              </button>
                              {!locked && u.id !== currentUser?.id && (
                                <ConfirmButton
                                  onConfirm={() => {
                                    if (deleteUser(u.id)) flash(`Cuenta de ${u.name} eliminada.`);
                                  }}
                                  label="Eliminar"
                                  icon={<Trash2 className="w-3.5 h-3.5" />}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Sin usuarios con ese filtro.</p>}
              </div>
            </div>
          )}

          {tab === 'publicaciones' && (
            <div className="space-y-3 stagger">
              {publications.length === 0 && <p className="p-10 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">Aún no hay publicaciones.</p>}
              {publications.map((p, i) => (
                <div key={p.id} style={{ '--i': i } as React.CSSProperties} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {p.title}
                      {p.status === 'reportado' && <span className="ml-2 text-[11px] text-red-600">(oculta)</span>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.author.name} · {p.course} · {p.createdAt}
                    </p>
                    <div className="mt-1">
                      <StarDisplay value={p.ratingAverage} count={p.ratingCount} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => updatePublicationStatus(p.id, p.status === 'destacado' ? 'aprobado' : 'destacado')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${p.status === 'destacado' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Star className="w-3.5 h-3.5" /> {p.status === 'destacado' ? 'Destacado' : 'Destacar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePublicationStatus(p.id, p.status === 'reportado' ? 'aprobado' : 'reportado')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {p.status === 'reportado' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {p.status === 'reportado' ? 'Mostrar' : 'Ocultar'}
                    </button>
                    <ConfirmButton onConfirm={() => deletePublication(p.id)} label="Eliminar" icon={<Trash2 className="w-3.5 h-3.5" />} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'reportes' && (
            <div className="space-y-3 stagger">
              {reports.length === 0 && <p className="p-10 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">No hay reportes.</p>}
              {reports.map((r, i) => (
                <div key={r.id} style={{ '--i': i } as React.CSSProperties} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{r.publicationTitle}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.status === 'pendiente' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {r.reason.replace('_', ' ')} · por {r.reporterName} · {r.createdAt}
                  </p>
                  <p className="text-sm text-slate-700">{r.details}</p>
                  {(r.status === 'pendiente' || r.status === 'investigando') && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          resolveReport(r.id, 'resuelto');
                          updatePublicationStatus(r.publicationId, 'reportado');
                          flash('Publicación ocultada y reporte resuelto.');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white"
                      >
                        Ocultar publicación
                      </button>
                      <button type="button" onClick={() => resolveReport(r.id, 'descartado')} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'roles' && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-3 stagger">
                {roles.map((r, i) => {
                  const n = users.filter((u) => u.role === r.id).length;
                  return (
                    <div key={r.id} style={{ '--i': i } as React.CSSProperties} className="bg-white rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">
                          {n} usuario{n === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(Object.keys(PERMISSION_LABELS) as (keyof RolePermission)[])
                          .filter((k) => r.permissions[k])
                          .map((k) => (
                            <span key={k} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{PERMISSION_LABELS[k]}</span>
                          ))}
                      </div>
                      {!r.isSystem && (
                        <div className="mt-2 flex justify-end">
                          <ConfirmButton onConfirm={() => deleteRole(r.id)} label="Eliminar rol" icon={<Trash2 className="w-3.5 h-3.5" />} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submitNewRole} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Crear rol
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input id="nr-name" aria-label="Nombre del rol" placeholder="Nombre (ej. Coordinador de escuela)" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} className={inputCls} />
                  <input id="nr-desc" aria-label="Descripción del rol" placeholder="Descripción" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} className={inputCls} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {(Object.keys(PERMISSION_LABELS) as (keyof RolePermission)[]).map((k) => (
                    <label key={k} className="inline-flex items-center gap-1.5 text-slate-700">
                      <input type="checkbox" checked={newPerms[k]} onChange={(e) => setNewPerms({ ...newPerms, [k]: e.target.checked })} className="accent-red-600" />
                      {PERMISSION_LABELS[k]}
                    </label>
                  ))}
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  Crear rol
                </button>
              </form>
            </div>
          )}
        </div>

        {toast && (
          <div role="status" className="view-enter absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};
