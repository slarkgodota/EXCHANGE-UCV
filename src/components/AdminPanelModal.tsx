import React, { useState } from 'react';
import {
  X,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  RotateCcw,
  Star,
  Search,
  BadgeCheck,
  Building,
  Lock,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Trash2,
  GraduationCap,
  Sparkles,
  FlaskConical,
  Award,
  Scale,
  BookOpen,
  UserCheck,
  Sliders,
  PlusCircle,
  Check,
  Brain,
} from 'lucide-react';
import { useExchange, CREATOR_EMAILS } from '../context/ExchangeContext';
import { calculateAdminMetrics, validateAdminCreateUser, canModifyRole } from '../utils/exchangeLogic';
import { CareerType, CampusType, RoleDefinition, RolePermission } from '../types/exchange';

const CAREERS: CareerType[] = [
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Medicina Humana',
  'Derecho',
  'Psicología',
  'Administración',
  'Arquitectura',
  'Contabilidad',
  'Ciencias de la Comunicación',
  'General / Interdisciplinario',
];

const CAMPUSES: CampusType[] = [
  'Lima Norte',
  'Lima Este',
  'Lima Ate',
  'Callao',
  'Trujillo',
  'Piura',
  'Chiclayo',
  'Tarapoto',
  'Moyobamba',
  'Chimbote',
  'Huaraz',
  'Chepén',
  'Arequipa',
];

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    publications,
    users,
    requests,
    reports,
    updatePublicationStatus,
    resolveReport,
    resetDatabase,
    isCreatorOrAdmin,
    isOwner,
    setIsAuthModalOpen,
    currentUser,
    createUserByAdmin,
    updateUserRole,
    deleteUser,
    runAIAuditOnPublication,
    roles,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    canManageRoles,
  } = useExchange();

  const [activeTab, setActiveTab] = useState<'kpis' | 'publicaciones' | 'reportes' | 'usuarios' | 'roles'>('kpis');
  const [searchTerm, setSearchTerm] = useState('');
  const [resetConfirm, setResetConfirm] = useState(false);

  // New user form state inside Admin panel
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('student');
  const [newUserCareer, setNewUserCareer] = useState<CareerType>('Ingeniería Civil');
  const [newUserCampus, setNewUserCampus] = useState<CampusType>('Lima Norte');
  const [newUserCycle, setNewUserCycle] = useState('Ciclo V');
  const [newUserPhone, setNewUserPhone] = useState('+51 9');
  const [newUserBio, setNewUserBio] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom role creation state
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleColor, setNewRoleColor] = useState<RoleDefinition['badgeColor']>('indigo');
  const [newRoleIcon, setNewRoleIcon] = useState<RoleDefinition['iconName']>('award');
  const [newRolePermissions, setNewRolePermissions] = useState<RolePermission>({
    canPublish: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canManageRoles: false,
    canAuditAI: false,
    canModeratePublications: false,
    canExportData: false,
  });
  const [roleFormError, setRoleFormError] = useState<string | null>(null);

  // Filter users inside Admin panel
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const renderRoleBadge = (roleId: string) => {
    const role = getRoleById(roleId);
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
    };
    const c = colorMap[role.badgeColor] || colorMap.blue;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border} shadow-2xs`}>
        {role.iconName === 'crown' && <Crown className="w-3 h-3 text-amber-300" />}
        {role.iconName === 'shield' && <Shield className="w-3 h-3 text-purple-600" />}
        {role.iconName === 'graduation-cap' && <GraduationCap className="w-3 h-3 text-amber-600" />}
        {role.iconName === 'flask' && <FlaskConical className="w-3 h-3 text-indigo-600" />}
        {role.iconName === 'award' && <Award className="w-3 h-3 text-teal-600" />}
        {role.iconName === 'scale' && <Scale className="w-3 h-3 text-cyan-600" />}
        {role.iconName === 'book-open' && <BookOpen className="w-3 h-3 text-emerald-600" />}
        {role.iconName === 'user-check' && <UserCheck className="w-3 h-3 text-blue-600" />}
        {role.name}
      </span>
    );
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormError(null);

    const nameTrimmed = newRoleName.trim();
    if (!nameTrimmed || nameTrimmed.length < 3) {
      setRoleFormError('El nombre del rol debe tener al menos 3 caracteres.');
      return;
    }

    const slug = nameTrimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (roles.some((r) => r.id === slug || r.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setRoleFormError('Ya existe un rol con este nombre o identificador.');
      return;
    }

    const created = createRole({
      id: slug,
      name: nameTrimmed,
      description: newRoleDescription.trim() || 'Rol institucional personalizado UCV.',
      badgeColor: newRoleColor,
      iconName: newRoleIcon,
      permissions: newRolePermissions,
    });

    setToastMessage(`✅ Nuevo rol "${created.name}" creado con éxito.`);
    setShowCreateRoleForm(false);
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRoleColor('indigo');
    setNewRoleIcon('award');
    setNewRolePermissions({
      canPublish: true,
      canAccessAdminPanel: false,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: false,
      canModeratePublications: false,
      canExportData: false,
    });
    setTimeout(() => setToastMessage(null), 4500);
  };

  if (!isAdminModalOpen) return null;

  // Security guard: Only creators and administrators can access the panel
  if (!isCreatorOrAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              Acceso Exclusivo para Administradores
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El panel de administración y control está reservado exclusivamente para los creadores de Grupo 5 y los usuarios a quienes se les ha otorgado permisos de administrador.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600">
            Usuario actual: <strong className="text-slate-800">{currentUser ? currentUser.name : 'Invitado / No autenticado'}</strong>
            <br />
            <span className="text-slate-400">Rol: {currentUser ? currentUser.role : 'Sin sesión activa'}</span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminModalOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-colors cursor-pointer"
            >
              Iniciar Sesión con Cuenta Autorizada
            </button>
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Regresar a la Plataforma
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = calculateAdminMetrics(publications, users, requests, reports);

  const auditedPubs = publications.filter((p) => p.aiAudit);
  const avgOriginality =
    auditedPubs.length > 0
      ? Math.round(
          auditedPubs.reduce((acc, p) => acc + (p.aiAudit?.originalityScore || 0), 0) /
            auditedPubs.length
        )
      : 97;

  const handleExportDB = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      institution: 'Universidad César Vallejo - Perú (Nacional)',
      project: 'Exchange UCV - Grupo 5',
      metrics,
      publications,
      users,
      requests,
      reports,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exchange_ucv_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = validateAdminCreateUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      career: newUserCareer,
      campus: newUserCampus,
      existingEmails: users.map((u) => u.email),
    });

    if (validation) {
      setFormError(validation);
      return;
    }

    const created = createUserByAdmin({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      career: newUserCareer,
      campus: newUserCampus,
      cycle: newUserCycle,
      phone: newUserPhone.trim(),
      bio: newUserBio.trim(),
    });

    setToastMessage(
      `Perfil local de demostración "${created.name}" creado. Para iniciar sesión, debe registrarse desde el formulario de acceso.`
    );
    setShowCreateForm(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('+51 9');
    setNewUserBio('');

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleAdminRole = (userId: string, currentRole: string, userName: string, userEmail: string) => {
    if (!canModifyRole(userEmail, CREATOR_EMAILS)) {
      setToastMessage(`Los permisos del fundador (${userName}) están protegidos institucionalmente.`);
      return;
    }

    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    updateUserRole(userId, newRole);
    setToastMessage(
      newRole === 'admin'
        ? `✅ Permisos de Administrador concedidos a ${userName}. Ahora tiene acceso total al panel.`
        : `ℹ️ Se revocaron los permisos de administrador a ${userName}. Regresó a rol Estudiante.`
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleDocenteRole = (userId: string, currentRole: string, userName: string, userEmail: string) => {
    if (!canModifyRole(userEmail, CREATOR_EMAILS)) return;
    const newRole = currentRole === 'docente' ? 'student' : 'docente';
    updateUserRole(userId, newRole);
    setToastMessage(`Rol actualizado para ${userName}: ahora es ${newRole === 'docente' ? 'Docente / Catedrático' : 'Estudiante'}.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleDeleteUser = (userId: string, userName: string, userEmail: string) => {
    if (!canModifyRole(userEmail, CREATOR_EMAILS)) {
      setToastMessage(`No se puede dar de baja a los fundadores del Grupo 5.`);
      return;
    }

    if (window.confirm(`¿Estás seguro de dar de baja al usuario "${userName}" (${userEmail}) de la base de datos?`)) {
      const ok = deleteUser(userId);
      if (ok) {
        setToastMessage(`Usuario ${userName} eliminado del padrón.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearchTerm.trim()) return true;
    const q = userSearchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.career.toLowerCase().includes(q) ||
      u.campus.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Panel de Control & Administración Exchange UCV</h3>
                <span className="text-[10px] bg-red-600/50 text-red-200 px-2 py-0.5 rounded-full font-mono uppercase">
                  Nacional • Perú
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supervisión institucional, padrón de usuarios, control de roles y ética académica UCV
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportDB}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar DB
            </button>

            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-inner">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('kpis')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kpis'
                ? 'border-red-600 text-red-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Métricas y Resumen General
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'usuarios'
                ? 'border-red-600 text-red-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Padrón de Usuarios ({users.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'border-red-600 text-red-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Gestión de Roles ({roles.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publicaciones')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'publicaciones'
                ? 'border-red-600 text-red-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Publicaciones ({publications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reportes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reportes'
                ? 'border-red-600 text-red-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Control de Plagio & Reportes ({reports.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: KPIS */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Usuarios Registrados</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalUsers}</div>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Grupo 5 & Habilitados</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Publicaciones Activas</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalPublications}</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {metrics.materialsCount} Mat. / {metrics.knowledgeCount} Con.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Intercambios Coordinados</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalExchanges}</div>
                  <p className="text-[11px] text-blue-600 font-medium mt-1">Colaboraciones entre pares</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Satisfacción Promedio</span>
                  <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
                    {metrics.averageSatisfaction.toFixed(1)} <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">5 Estrellas verificadas</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Originalidad IA UCV</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                    {avgOriginality}% <Brain className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Auditoría ética Gemini</p>
                </div>
              </div>

              {/* Demo project context */}
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-red-950 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    Exchange UCV · Prototipo
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-200 text-red-900 font-bold">
                    Datos de demostración
                  </span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  Esta versión pública no incluye cuentas institucionales.
                  Gestiona solo perfiles ficticios guardados en este navegador.
                </p>
              </div>

              {/* Maintenance Tools */}
              <div className="border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Mantenimiento de Base de Datos</h5>
                  <p className="text-[11px] text-slate-500">
                    Restaura los datos ficticios iniciales de la demostración.
                  </p>
                </div>

                {resetConfirm ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetDatabase();
                        setResetConfirm(false);
                        setToastMessage('Datos de demostración restaurados.');
                      }}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      Confirmar Reinicio
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    Reiniciar Base de Datos
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PADRÓN DE USUARIOS Y GESTIÓN DE ROLES / PERMISOS */}
          {activeTab === 'usuarios' && (
            <div className="space-y-5">
              {/* Top Controls: Search + Button to create user */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo, carrera o sede..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showCreateForm ? 'Cerrar Formulario' : '+ Registrar Estudiante / Docente'}</span>
                </button>
              </div>

              {/* Informative banner on account governance */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-xs text-slate-600 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-slate-900 block font-bold">
                    Control de Permisos y Cuentas UCV
                  </strong>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Como administrador, puedes registrar nuevas cuentas institucionales para estudiantes y docentes que lo soliciten, así como <strong>otorgar o revocar permisos de administrador</strong> a cualquier usuario para que también pueda gestionar la plataforma. Los fundadores del Grupo 5 tienen permisos permanentes.
                  </p>
                </div>
              </div>

              {/* Create User Form Drawer/Card */}
              {showCreateForm && (
                <div className="p-5 bg-gradient-to-br from-slate-50 to-red-50/30 rounded-2xl border-2 border-red-200/80 shadow-md space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-red-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Registrar y Habilitar Nuevo Usuario en DB
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Acceso gestionado por administración
                    </span>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                      Este formulario solo crea perfiles locales de demostración; no crea
                      cuentas Supabase. Cada persona debe registrarse desde el formulario
                      de acceso para poder iniciar sesión.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nombres y Apellidos:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Luis Alberto Sánchez"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Correo Institucional UCV:
                        </label>
                        <input
                          type="email"
                          placeholder="ejemplo@ucvvirtual.edu.pe"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                          required
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Correo para iniciar sesión.
                        </span>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Rol a Otorgar:
                        </label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 font-semibold text-slate-800"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Carrera Profesional:
                        </label>
                        <select
                          value={newUserCareer}
                          onChange={(e) => setNewUserCareer(e.target.value as CareerType)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50"
                        >
                          {CAREERS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Sede UCV:
                        </label>
                        <select
                          value={newUserCampus}
                          onChange={(e) => setNewUserCampus(e.target.value as CampusType)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50"
                        >
                          {CAMPUSES.map((camp) => (
                            <option key={camp} value={camp}>
                              Sede {camp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Ciclo o Grado Académico:
                        </label>
                        <input
                          type="text"
                          placeholder={newUserRole === 'docente' ? 'Catedrático / Magíster' : 'Ciclo V'}
                          value={newUserCycle}
                          onChange={(e) => setNewUserCycle(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Teléfono / WhatsApp:
                        </label>
                        <input
                          type="text"
                          placeholder="+51 987 654 321"
                          value={newUserPhone}
                          onChange={(e) => setNewUserPhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Notas / Especialidad:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Interés en estructuras, tutorías, semilleros..."
                        value={newUserBio}
                        onChange={(e) => setNewUserBio(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
                      >
                        Guardar y Habilitar en DB
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Users Cards with Role Actions */}
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Padrón de usuarios registrados: <strong>{filteredUsers.length}</strong></span>
                  <span className="text-[11px] text-slate-400">
                    Cambios de rol se reflejan de inmediato en tiempo real
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredUsers.map((u) => {
                    const isFounder = CREATOR_EMAILS.includes(u.email.toLowerCase().trim());
                    const canEdit = canModifyRole(u.email, CREATOR_EMAILS);

                    return (
                      <div
                        key={u.id}
                        className={`p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                          isFounder
                            ? 'bg-gradient-to-br from-red-50/70 via-white to-rose-50/40 border-red-200 shadow-xs'
                            : u.role === 'admin'
                            ? 'bg-purple-50/50 border-purple-200 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Top: Avatar & User Identity */}
                        <div className="flex items-start gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-slate-900 truncate font-bold text-sm">
                                {u.name}
                              </strong>
                              {u.verified && (
                                <span title="Verificado UCV">
                                  <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                              {u.email}
                            </p>

                            <p className="text-[11px] text-slate-600 mt-1">
                              {u.career} • Sede {u.campus}
                            </p>

                            <span className="text-[10px] text-slate-400">
                              {u.cycle} {u.phone ? `• ${u.phone}` : ''}
                            </span>
                          </div>

                          {/* Role Badge */}
                          <div className="shrink-0 text-right">
                            {isFounder ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-600 text-white uppercase shadow-xs">
                                <Crown className="w-3 h-3 text-amber-300" />
                                Dueño / Fundador G5
                              </span>
                            ) : (
                              renderRoleBadge(u.role)
                            )}
                          </div>
                        </div>

                        {/* Actions for role management */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          {isFounder ? (
                            <span className="text-[11px] font-medium text-red-700 italic flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              Permisos Totales • Fundador del Proyecto
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-slate-500 font-medium">Asignar Rol:</span>
                              <select
                                value={u.role}
                                onChange={(e) => {
                                  const newRoleId = e.target.value;
                                  if (!canModifyRole(u.email, CREATOR_EMAILS)) {
                                    setToastMessage(`Los permisos del fundador (${u.name}) están protegidos institucionalmente.`);
                                    return;
                                  }
                                  updateUserRole(u.id, newRoleId);
                                  const rDef = getRoleById(newRoleId);
                                  setToastMessage(`✅ Rol de ${u.name} actualizado a: ${rDef.name}`);
                                  setTimeout(() => setToastMessage(null), 4000);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:border-red-400 focus:ring-2 focus:ring-red-500/50 focus:outline-none cursor-pointer shadow-2xs"
                              >
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name, u.email)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto cursor-pointer"
                              title="Dar de baja de la base de datos"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLICACIONES */}
          {activeTab === 'publicaciones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Moderación y Estado de Recursos</span>
                <span className="text-slate-500">Mostrando {publications.length} registros</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Título / Curso</th>
                      <th className="p-3">Carrera</th>
                      <th className="p-3">Autor</th>
                      <th className="p-3">Originalidad IA</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {publications.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900 max-w-[240px]">
                          <div className="font-bold truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-500">{p.course} • {p.category}</div>
                        </td>
                        <td className="p-3 text-slate-600">{p.career}</td>
                        <td className="p-3 text-slate-700">
                          <div>{p.author.name}</div>
                          <div className="text-[10px] text-slate-400">Sede {p.author.campus}</div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Brain className="w-3 h-3 text-emerald-600 shrink-0" />
                            {p.aiAudit ? `${p.aiAudit.originalityScore}%` : '96%'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-amber-600">
                          {p.ratingAverage.toFixed(1)}★ ({p.reviews.length})
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'destacado'
                                ? 'bg-amber-100 text-amber-800'
                                : p.status === 'aprobado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'reportado'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={async () => {
                              setToastMessage(`Auditando "${p.title}" con Gemini 3.8 Flash...`);
                              await runAIAuditOnPublication(p.id);
                              setToastMessage(`Auditoría IA completada para "${p.title}".`);
                              setTimeout(() => setToastMessage(null), 3500);
                            }}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[11px] font-semibold cursor-pointer"
                            title="Auditar originalidad con IA"
                          >
                            Auditar IA
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updatePublicationStatus(
                                p.id,
                                p.status === 'destacado' ? 'aprobado' : 'destacado'
                              )
                            }
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            {p.status === 'destacado' ? 'Desmarcar' : 'Destacar'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updatePublicationStatus(
                                p.id,
                                p.status === 'reportado' ? 'aprobado' : 'reportado'
                              )
                            }
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-semibold cursor-pointer"
                          >
                            {p.status === 'reportado' ? 'Reactivar' : 'Pausar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTES & PLAGIO */}
          {activeTab === 'reportes' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Supervisión de Plagio y Uso Responsable (Sección 10 del Proyecto Exchange UCV):</strong>
                <p className="mt-1">
                  Los materiales compartidos deben respetar los derechos de autor y servir para aprender, evitando el fraude o la copia.
                </p>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No hay reportes de plagio pendientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>{rep.publicationTitle}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.status === 'resuelto'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>

                      <p className="text-slate-600">
                        <strong>Motivo:</strong> {rep.reason.toUpperCase()} — {rep.details}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span>Reportado por: {rep.reporterName} ({rep.reporterEmail}) • {rep.createdAt}</span>

                        {rep.status === 'pendiente' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => resolveReport(rep.id, 'descartado')}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                            >
                              Desestimar
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveReport(rep.id, 'resuelto')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                            >
                              Marcar como Resuelto
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GESTIÓN DE ROLES (Creador y Gestor para Dueños) */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Institutional Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-5 rounded-2xl text-white border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-red-500" />
                    <h3 className="font-extrabold text-base sm:text-lg">
                      Gestor de Roles y Permisos Institucionales
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Configuración de privilegios, distintivos y jerarquías universitarias. Los fundadores y dueños del <strong>Grupo 5</strong> pueden crear nuevos roles personalizados para coordinadores, docentes o tutores.
                  </p>
                </div>

                {canManageRoles && (
                  <button
                    type="button"
                    onClick={() => setShowCreateRoleForm(!showCreateRoleForm)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all shrink-0 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {showCreateRoleForm ? 'Cerrar Formulario' : '+ Crear Nuevo Rol'}
                  </button>
                )}
              </div>

              {/* Formulario de Creación de Nuevo Rol */}
              {showCreateRoleForm && (
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-red-200/80 shadow-md space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-sm text-slate-900 block">
                          Crear Nuevo Rol Institucional Personalizado
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          Define el nombre, color, ícono y permisos específicos
                        </span>
                      </div>
                    </div>
                  </div>

                  {roleFormError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                      {roleFormError}
                    </div>
                  )}

                  <form onSubmit={handleCreateRoleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nombre del Rol:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Coordinador de Tesis, Asistente de Cátedra, etc."
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Descripción de Funciones:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Responsable de revisión de protocolos y asesoría de titulación"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Color and Icon Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Color del Distintivo:
                        </label>
                        <select
                          value={newRoleColor}
                          onChange={(e) => setNewRoleColor(e.target.value as RoleDefinition['badgeColor'])}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 font-semibold"
                        >
                          <option value="indigo">Índigo (Académico / Semillero)</option>
                          <option value="teal">Teal (Laboratorio / Prácticas)</option>
                          <option value="emerald">Esmeralda (Tutorías / Aprobado)</option>
                          <option value="purple">Morado (Gestión / Administración)</option>
                          <option value="amber">Ámbar (Docencia / Cátedra)</option>
                          <option value="cyan">Cian (Auditoría / Ética)</option>
                          <option value="rose">Rosa (Delegatura / Estudiantil)</option>
                          <option value="blue">Azul (Estudiante UCV)</option>
                          <option value="red">Rojo (Institucional / Fundador)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Ícono Representativo:
                        </label>
                        <select
                          value={newRoleIcon}
                          onChange={(e) => setNewRoleIcon(e.target.value as RoleDefinition['iconName'])}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500/50 font-semibold"
                        >
                          <option value="award">Medalla / Reconocimiento</option>
                          <option value="flask">Matraz (Investigación / Laboratorio)</option>
                          <option value="graduation-cap">Birrete (Docencia / Cátedra)</option>
                          <option value="shield">Escudo (Seguridad / Moderación)</option>
                          <option value="scale">Balanza (Ética / Integridad)</option>
                          <option value="book-open">Libro Abierto (Tutor / Apuntes)</option>
                          <option value="user-check">Usuario Verificado (Delegado / Alumno)</option>
                          <option value="crown">Corona (Fundador / Dirección)</option>
                        </select>
                      </div>
                    </div>

                    {/* Permissions Matrix */}
                    <div className="pt-2 border-t border-slate-200">
                      <span className="block font-bold text-slate-800 mb-2">
                        Permisos y Facultades del Rol:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.canPublish}
                            onChange={(e) =>
                              setNewRolePermissions((prev) => ({ ...prev, canPublish: e.target.checked }))
                            }
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <div>
                            <strong className="block text-slate-800 text-[11px]">Publicar Recursos</strong>
                            <span className="text-[10px] text-slate-500">Materiales y tutorías</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.canAccessAdminPanel}
                            onChange={(e) =>
                              setNewRolePermissions((prev) => ({ ...prev, canAccessAdminPanel: e.target.checked }))
                            }
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <div>
                            <strong className="block text-slate-800 text-[11px]">Acceso a Panel Admin</strong>
                            <span className="text-[10px] text-slate-500">Monitoreo del sistema</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.canManageUsers}
                            onChange={(e) =>
                              setNewRolePermissions((prev) => ({ ...prev, canManageUsers: e.target.checked }))
                            }
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <div>
                            <strong className="block text-slate-800 text-[11px]">Crear y Editar Usuarios</strong>
                            <span className="text-[10px] text-slate-500">Altas y contraseñas</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.canAuditAI}
                            onChange={(e) =>
                              setNewRolePermissions((prev) => ({ ...prev, canAuditAI: e.target.checked }))
                            }
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <div>
                            <strong className="block text-slate-800 text-[11px]">Auditoría IA Gemini</strong>
                            <span className="text-[10px] text-slate-500">Revisión anti-plagio</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.canModeratePublications}
                            onChange={(e) =>
                              setNewRolePermissions((prev) => ({ ...prev, canModeratePublications: e.target.checked }))
                            }
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <div>
                            <strong className="block text-slate-800 text-[11px]">Moderar Contenidos</strong>
                            <span className="text-[10px] text-slate-500">Destacar o pausar</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.canExportData}
                            onChange={(e) =>
                              setNewRolePermissions((prev) => ({ ...prev, canExportData: e.target.checked }))
                            }
                            className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                          />
                          <div>
                            <strong className="block text-slate-800 text-[11px]">Exportar Reportes</strong>
                            <span className="text-[10px] text-slate-500">Descarga de métricas</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateRoleForm(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Guardar y Activar Rol
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Roles Directory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const assignedUsers = users.filter((u) => u.role === role.id);
                  return (
                    <div
                      key={role.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          {renderRoleBadge(role.id)}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              role.isSystem
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {role.isSystem ? 'Sistema UCV' : 'Personalizado'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {role.description}
                        </p>

                        {/* Permissions Chips */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Permisos Activos:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.canPublish && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                                ✓ Publicar
                              </span>
                            )}
                            {role.permissions.canAccessAdminPanel && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold border border-purple-200">
                                ✓ Panel Admin
                              </span>
                            )}
                            {role.permissions.canManageUsers && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-200">
                                ✓ Crear Usuarios
                              </span>
                            )}
                            {role.permissions.canManageRoles && (
                              <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-semibold border border-red-200">
                                ✓ Crear Roles
                              </span>
                            )}
                            {role.permissions.canAuditAI && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-200">
                                ✓ Auditoría IA
                              </span>
                            )}
                            {role.permissions.canModeratePublications && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                                ✓ Moderar
                              </span>
                            )}
                            {role.permissions.canExportData && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                                ✓ Exportar
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer: User count & Delete custom role */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {assignedUsers.length} {assignedUsers.length === 1 ? 'usuario' : 'usuarios'}
                        </span>

                        {!role.isSystem && canManageRoles && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar el rol "${role.name}"? Los usuarios que lo tengan volverán a Estudiante.`)) {
                                deleteRole(role.id);
                                setToastMessage(`Rol "${role.name}" eliminado.`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
