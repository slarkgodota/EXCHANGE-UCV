import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Publication,
  StudentUser,
  PublicAuthor,
  Review,
  ContactExchangeRequest,
  PlagiarismReport,
  FilterState,
  CategoryType,
  CareerType,
  CampusType,
  AIOriginalityAuditResult,
  RoleDefinition,
} from '../types/exchange';
import {
  INITIAL_USERS,
  INITIAL_PUBLICATIONS,
  INITIAL_REQUESTS,
  INITIAL_REPORTS,
  DEFAULT_ROLES,
  ADMIN_EMAIL,
} from '../data/initialData';
import { calculateRatingDistribution } from '../utils/exchangeLogic';
import { putFile, deleteFile, clearFiles } from '../utils/fileStore';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  validateRegistration,
} from '../utils/security';

export type AuthMode = 'login' | 'register';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  career: CareerType;
  campus: CampusType;
  cycle: string;
  phone?: string;
  acceptedTerms: boolean;
}

export interface NewPublicationInput {
  title: string;
  description: string;
  category: CategoryType;
  career: CareerType;
  course: string;
  cycleLevel: string;
  tags: string[];
  exchangeType: Publication['exchangeType'];
  fileType?: Publication['fileType'];
  intent: NonNullable<Publication['intent']>;
  resourceType: NonNullable<Publication['resourceType']>;
  resourceUrl?: string;
  aiAudit?: AIOriginalityAuditResult;
  files?: File[];
}

interface ExchangeContextType {
  publications: Publication[];
  users: StudentUser[];
  currentUser: StudentUser | null;
  isLoggedIn: boolean;
  requests: ContactExchangeRequest[];
  reports: PlagiarismReport[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;
  selectedPublication: Publication | null;
  setSelectedPublication: (pub: Publication | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  isRequestsDrawerOpen: boolean;
  setIsRequestsDrawerOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isProjectInfoModalOpen: boolean;
  setIsProjectInfoModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  isCreatorOrAdmin: boolean;
  isOwner: boolean;

  addPublication: (data: NewPublicationInput) => Promise<Publication | null>;
  /** ¿Puede el usuario actual descargar los adjuntos? (gratuito, o intercambio aceptado) */
  canDownload: (pub: Publication) => { allowed: boolean; reason?: 'login' | 'request' | 'pending' };
  auditPublicationWithAI: (data: {
    title: string;
    course: string;
    career: CareerType;
    description: string;
    category: CategoryType;
    exchangeType: string;
  }) => Promise<AIOriginalityAuditResult>;
  runAIAuditOnPublication: (pubId: string) => Promise<AIOriginalityAuditResult | null>;
  updatePublicationStatus: (pubId: string, status: Publication['status']) => void;
  deletePublication: (pubId: string) => void;
  recordResourceOpen: (pubId: string) => void;
  addReview: (publicationId: string, rating: number, comment: string) => ActionResult;
  sendContactRequest: (data: {
    publicationId: string;
    publicationTitle: string;
    publicationCategory: CategoryType;
    receiverId: string;
    receiverName: string;
    message: string;
    proposedExchange: string;
  }) => ActionResult;
  updateRequestStatus: (requestId: string, status: ContactExchangeRequest['status']) => void;
  reportPublication: (data: {
    publicationId: string;
    publicationTitle: string;
    reason: PlagiarismReport['reason'];
    details: string;
  }) => ActionResult;
  resolveReport: (reportId: string, newStatus: PlagiarismReport['status']) => void;

  loginUser: (email: string, password: string) => ActionResult;
  logoutUser: () => void;
  registerUser: (data: RegisterInput) => ActionResult;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;
  updateProfile: (data: Partial<Pick<StudentUser, 'name' | 'career' | 'campus' | 'cycle' | 'phone' | 'bio' | 'orcid'>>) => void;

  roles: RoleDefinition[];
  createRole: (roleData: Omit<RoleDefinition, 'isSystem'>) => RoleDefinition;
  updateRole: (roleId: string, roleData: Partial<RoleDefinition>) => void;
  deleteRole: (roleId: string) => boolean;
  getRoleById: (roleId: string) => RoleDefinition;
  canManageRoles: boolean;
  createUserByAdmin: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    career: CareerType;
    campus: CampusType;
    cycle: string;
    phone?: string;
    bio?: string;
  }) => StudentUser;
  updateUserRole: (userId: string, newRole: string) => void;
  setUserVerified: (userId: string, verified: boolean) => void;
  deleteUser: (userId: string) => boolean;
  resetDatabase: () => void;
  libraryRatings: LibraryRatings;
  activity: ActivityEntry[];
  rateLibraryResource: (resourceId: string, stars: number) => ActionResult;
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

// v5: contraseñas con hash y sin datos de demostración. Las claves v4 (con datos
// ficticios) se ignoran a propósito.
const STORAGE_KEYS = {
  PUBLICATIONS: 'exchange_ucv_publications_v5',
  USERS: 'exchange_ucv_users_v5',
  ROLES: 'exchange_ucv_roles_v5',
  CURRENT_USER_ID: 'exchange_ucv_current_user_v5',
  REQUESTS: 'exchange_ucv_requests_v5',
  REPORTS: 'exchange_ucv_reports_v5',
  LIBRARY_RATINGS: 'exchange_ucv_library_ratings_v5',
  ACTIVITY: 'exchange_ucv_activity_v5',
};

export type ActivityType =
  | 'registro'
  | 'inicio_sesion'
  | 'cierre_sesion'
  | 'publicacion'
  | 'publicacion_eliminada'
  | 'resena'
  | 'solicitud'
  | 'solicitud_respondida'
  | 'reporte'
  | 'cambio_rol'
  | 'cuenta_creada_admin'
  | 'cuenta_eliminada'
  | 'moderacion';

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  type: ActivityType;
  actorName: string;
  actorEmail: string;
  detail: string;
}

const MAX_ACTIVITY = 2000;

/** recurso de biblioteca → { usuario → estrellas (1-5) } */
export type LibraryRatings = Record<string, Record<string, number>>;

export const DEFAULT_FILTER: FilterState = {
  category: 'todas',
  career: 'todas',
  searchQuery: '',
  campus: 'todos',
  intent: 'todos',
  resourceType: 'todos',
  course: '',
  sortBy: 'newest',
  minRating: 0,
};

/** Autores del proyecto (Grupo 5). Sus cuentas no se pueden eliminar ni degradar. */
export const CREATOR_EMAILS = [
  ADMIN_EMAIL,
  'mdelgadoc@ucvvirtual.edu.pe',
  'jgonzalezg@ucvvirtual.edu.pe',
  'mgrandeza@ucvvirtual.edu.pe',
];

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}

const now = () => new Date().toISOString().replace('T', ' ').substring(0, 16);
const today = () => new Date().toISOString().split('T')[0];
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const celebrate = (opts: Record<string, unknown> = {}) => {
  try {
    confetti({ particleCount: 60, spread: 55, ...opts });
  } catch {
    /* confetti es decorativo */
  }
};

export function toPublicAuthor(u: StudentUser): PublicAuthor {
  const { passwordHash, passwordSalt, phone, email, ...rest } = u;
  return rest;
}

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publications, setPublications] = useState<Publication[]>(() =>
    loadJSON(STORAGE_KEYS.PUBLICATIONS, INITIAL_PUBLICATIONS)
  );

  const [users, setUsers] = useState<StudentUser[]>(() => {
    const saved = loadJSON<StudentUser[]>(STORAGE_KEYS.USERS, []);
    const valid = saved.filter((u) => u && u.email && u.passwordHash && u.passwordSalt);
    // Las cuentas de los autores siempre existen
    const missingFounders = INITIAL_USERS.filter(
      (f) => !valid.some((u) => u.email.toLowerCase() === f.email.toLowerCase())
    );
    return [...missingFounders, ...valid];
  });

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = loadJSON<RoleDefinition[]>(STORAGE_KEYS.ROLES, []);
    const missing = DEFAULT_ROLES.filter((dr) => !saved.some((pr) => pr.id === dr.id));
    return [...saved, ...missing];
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {
      return null;
    }
  });

  const [requests, setRequests] = useState<ContactExchangeRequest[]>(() =>
    loadJSON(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS)
  );
  const [reports, setReports] = useState<PlagiarismReport[]>(() =>
    loadJSON(STORAGE_KEYS.REPORTS, INITIAL_REPORTS)
  );

  const [libraryRatings, setLibraryRatings] = useState<LibraryRatings>(() =>
    loadJSON(STORAGE_KEYS.LIBRARY_RATINGS, {})
  );
  useEffect(() => saveJSON(STORAGE_KEYS.LIBRARY_RATINGS, libraryRatings), [libraryRatings]);

  const [activity, setActivity] = useState<ActivityEntry[]>(() => loadJSON(STORAGE_KEYS.ACTIVITY, []));
  useEffect(() => saveJSON(STORAGE_KEYS.ACTIVITY, activity), [activity]);
  /** Registra un evento en el historial del panel de administración. */
  const log = (type: ActivityType, detail: string, actor?: { name: string; email: string } | null) => {
    const who = actor === undefined ? currentUserRef.current : actor;
    setActivity((prev) =>
      [
        { id: newId('act'), at: new Date().toISOString(), type, actorName: who?.name || 'Invitado', actorEmail: who?.email || '', detail },
        ...prev,
      ].slice(0, MAX_ACTIVITY)
    );
  };

  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [selectedPublication, setSelectedPublicationState] = useState<Publication | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRequestsDrawerOpen, setIsRequestsDrawerOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProjectInfoModalOpen, setIsProjectInfoModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const currentUserRef = { current: currentUser };
  const isLoggedIn = Boolean(currentUser);

  // Al entrar a la página sin sesión se muestra el acceso (iniciar sesión o registrarse)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !currentUser);

  useEffect(() => saveJSON(STORAGE_KEYS.PUBLICATIONS, publications), [publications]);
  useEffect(() => saveJSON(STORAGE_KEYS.USERS, users), [users]);
  useEffect(() => saveJSON(STORAGE_KEYS.ROLES, roles), [roles]);
  useEffect(() => saveJSON(STORAGE_KEYS.REQUESTS, requests), [requests]);
  useEffect(() => saveJSON(STORAGE_KEYS.REPORTS, reports), [reports]);
  useEffect(() => {
    try {
      if (currentUserId) localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {
      /* ignore */
    }
  }, [currentUserId]);

  // Mantener sincronizada la publicación abierta en el modal
  const setSelectedPublication = (pub: Publication | null) => setSelectedPublicationState(pub);
  useEffect(() => {
    if (!selectedPublication) return;
    const updated = publications.find((p) => p.id === selectedPublication.id);
    setSelectedPublicationState(updated || null);
  }, [publications]);

  const openAuth = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const resetFilter = () => setFilter(DEFAULT_FILTER);

  // ───────────── Roles y permisos ─────────────
  const getRoleById = (roleId: string): RoleDefinition => {
    const found = roles.find((r) => r.id === roleId) || DEFAULT_ROLES.find((r) => r.id === roleId);
    if (found) return found;
    return {
      id: roleId,
      name: roleId.charAt(0).toUpperCase() + roleId.slice(1),
      description: 'Rol personalizado',
      badgeColor: 'blue',
      iconName: 'user-check',
      isSystem: false,
      permissions: {
        canPublish: true,
        canAccessAdminPanel: false,
        canManageUsers: false,
        canManageRoles: false,
        canAuditAI: false,
        canModeratePublications: false,
        canExportData: false,
      },
    };
  };

  const currentRole = currentUser ? getRoleById(currentUser.role) : undefined;
  const isFounder = Boolean(
    currentUser && CREATOR_EMAILS.includes(currentUser.email.toLowerCase().trim())
  );
  const isOwner = Boolean(currentUser && (isFounder || currentUser.role === 'dueño'));
  const isCreatorOrAdmin = Boolean(
    currentUser && (isOwner || currentRole?.permissions.canAccessAdminPanel)
  );
  const canManageRoles = Boolean(currentUser && (isOwner || currentRole?.permissions.canManageRoles));

  const createRole = (roleData: Omit<RoleDefinition, 'isSystem'>): RoleDefinition => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: roleData.id?.trim() || newId('role'),
      isSystem: false,
    };
    setRoles((prev) => [...prev, newRole]);
    celebrate({ particleCount: 40 });
    return newRole;
  };

  const updateRole = (roleId: string, roleData: Partial<RoleDefinition>) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, ...roleData } : r)));
  };

  const deleteRole = (roleId: string): boolean => {
    const target = roles.find((r) => r.id === roleId);
    if (!target || target.isSystem) return false;
    setUsers((prev) => prev.map((u) => (u.role === roleId ? { ...u, role: 'student' } : u)));
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    return true;
  };

  // ───────────── Autenticación ─────────────
  const loginUser = (email: string, password: string): ActionResult => {
    const target = email.toLowerCase().trim();
    const found = users.find((u) => u.email.toLowerCase().trim() === target);
    if (!found || !verifyPassword(password, found.passwordSalt, found.passwordHash)) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    setCurrentUserId(found.id);
    log('inicio_sesion', 'Inició sesión', found);
    setIsAuthModalOpen(false);
    celebrate({ particleCount: 40 });
    return { ok: true };
  };

  const registerUser = (data: RegisterInput): ActionResult => {
    const error = validateRegistration({
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      existingEmails: users.map((u) => u.email),
      acceptedTerms: data.acceptedTerms,
    });
    if (error) return { ok: false, error };

    const salt = generateSalt();
    const newUser: StudentUser = {
      id: newId('u'),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'student',
      career: data.career,
      campus: data.campus,
      cycle: data.cycle,
      phone: data.phone?.trim() || undefined,
      verified: false,
      ratingAverage: 0,
      ratingCount: 0,
      bio: '',
      passwordSalt: salt,
      passwordHash: hashPassword(data.password, salt),
      createdAt: today(),
    };

    setUsers((prev) => [...prev, newUser]);
    log('registro', `Nueva cuenta · ${newUser.career} · ${newUser.campus}${newUser.phone ? ' · ' + newUser.phone : ''}`, newUser);
    setCurrentUserId(newUser.id);
    setIsAuthModalOpen(false);
    celebrate({ particleCount: 80, origin: { y: 0.6 } });
    return { ok: true };
  };

  const logoutUser = () => {
    if (currentUser) log('cierre_sesion', 'Cerró sesión');
    setCurrentUserId(null);
    setIsRequestsDrawerOpen(false);
    setIsAdminModalOpen(false);
    openAuth('login');
  };

  const changePassword = (currentPassword: string, newPassword: string): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Inicia sesión primero.' };
    if (!verifyPassword(currentPassword, currentUser.passwordSalt, currentUser.passwordHash)) {
      return { ok: false, error: 'La contraseña actual no es correcta.' };
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return { ok: false, error: 'La nueva contraseña debe tener 8+ caracteres con letras y números.' };
    }
    const salt = generateSalt();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, passwordSalt: salt, passwordHash: hashPassword(newPassword, salt) }
          : u
      )
    );
    return { ok: true };
  };

  const updateProfile: ExchangeContextType['updateProfile'] = (data) => {
    if (!currentUser) return;
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u)));
  };

  // ───────────── Gestión de usuarios (admin) ─────────────
  const createUserByAdmin: ExchangeContextType['createUserByAdmin'] = (userData) => {
    const salt = generateSalt();
    const newUser: StudentUser = {
      id: newId('u'),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordSalt: salt,
      passwordHash: hashPassword(userData.password, salt),
      role: userData.role,
      career: userData.career,
      campus: userData.campus,
      cycle: userData.cycle,
      verified: true,
      ratingAverage: 0,
      ratingCount: 0,
      bio: userData.bio?.trim() || '',
      phone: userData.phone?.trim() || undefined,
      createdAt: today(),
    };
    setUsers((prev) => [...prev, newUser]);
    log('cuenta_creada_admin', `Creó la cuenta de ${newUser.name} (${newUser.email}) con rol ${getRoleById(newUser.role).name}`);
    celebrate();
    return newUser;
  };

  const isProtected = (u: StudentUser) => CREATOR_EMAILS.includes(u.email.toLowerCase().trim());

  const updateUserRole = (userId: string, newRole: string) => {
    const t = users.find((u) => u.id === userId);
    if (t && !isProtected(t)) log('cambio_rol', `${t.name}: ${getRoleById(t.role).name} → ${getRoleById(newRole).name}`);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId && !isProtected(u) ? { ...u, role: newRole } : u))
    );
  };

  const setUserVerified = (userId: string, verified: boolean) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified } : u)));
  };

  const deleteUser = (userId: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target || isProtected(target) || target.id === currentUserId) return false;
    log('cuenta_eliminada', `Eliminó la cuenta de ${target.name} (${target.email})`);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  // ───────────── Auditoría con IA ─────────────
  const auditPublicationWithAI: ExchangeContextType['auditPublicationWithAI'] = async (data) => {
    const res = await fetch('/api/ai/audit-originality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.error || 'El servicio de auditoría con IA no está disponible.');
    }
    return { ...(body as AIOriginalityAuditResult), analyzedAt: now() };
  };

  const runAIAuditOnPublication = async (pubId: string) => {
    const pub = publications.find((p) => p.id === pubId);
    if (!pub) return null;
    const audit = await auditPublicationWithAI({
      title: pub.title,
      course: pub.course,
      career: pub.career,
      description: pub.description,
      category: pub.category,
      exchangeType: pub.exchangeType,
    });
    setPublications((prev) => prev.map((p) => (p.id === pubId ? { ...p, aiAudit: audit } : p)));
    return audit;
  };

  // ───────────── Publicaciones ─────────────
  const addPublication = async (data: NewPublicationInput): Promise<Publication | null> => {
    if (!currentUser) return null;
    const attachments: { id: string; name: string; size: number; type: string }[] = [];
    for (const f of data.files || []) {
      const id = newId('file');
      await putFile(id, f);
      attachments.push({ id, name: f.name, size: f.size, type: f.type });
    }
    const newPub: Publication = {
      attachments,
      id: newId('pub'),
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      career: data.career,
      course: data.course.trim(),
      author: toPublicAuthor(currentUser),
      cycleLevel: data.cycleLevel,
      tags: data.tags,
      exchangeType: data.exchangeType,
      fileType: data.fileType,
      intent: data.intent,
      resourceType: data.resourceType,
      resourceUrl: data.resourceUrl?.trim() || undefined,
      downloadCount: 0,
      createdAt: today(),
      status: 'aprobado',
      ratingAverage: 0,
      ratingCount: 0,
      reviews: [],
      contactCount: 0,
      aiAudit: data.aiAudit,
    };
    setPublications((prev) => [newPub, ...prev]);
    log('publicacion', `Publicó "${newPub.title}" (${newPub.category}, ${newPub.exchangeType}${attachments.length ? `, ${attachments.length} archivo(s)` : ''})`);
    celebrate({ particleCount: 80 });
    return newPub;
  };

  const updatePublicationStatus = (pubId: string, status: Publication['status']) => {
    const up = publications.find((p) => p.id === pubId);
    if (up && up.status !== status) log('moderacion', `"${up.title}": ${up.status} → ${status}`);
    setPublications((prev) => prev.map((p) => (p.id === pubId ? { ...p, status } : p)));
  };

  const deletePublication = (pubId: string) => {
    const dp = publications.find((p) => p.id === pubId);
    if (dp) log('publicacion_eliminada', `Eliminó "${dp.title}" de ${dp.author.name}`);
    publications.find((p) => p.id === pubId)?.attachments?.forEach((a) => deleteFile(a.id));
    setPublications((prev) => prev.filter((p) => p.id !== pubId));
    setSelectedPublicationState((prev) => (prev?.id === pubId ? null : prev));
  };

  const canDownload: ExchangeContextType['canDownload'] = (pub) => {
    if (!currentUser) return { allowed: false, reason: 'login' };
    if (pub.author.id === currentUser.id || isCreatorOrAdmin) return { allowed: true };
    if (pub.exchangeType === 'Gratuito / RSU') return { allowed: true };
    const mine = requests.filter((r) => r.publicationId === pub.id && r.senderId === currentUser.id);
    if (mine.some((r) => r.status === 'aceptada' || r.status === 'completada')) return { allowed: true };
    if (mine.some((r) => r.status === 'pendiente')) return { allowed: false, reason: 'pending' };
    return { allowed: false, reason: 'request' };
  };

  const recordResourceOpen = (pubId: string) => {
    setPublications((prev) =>
      prev.map((p) => (p.id === pubId ? { ...p, downloadCount: p.downloadCount + 1 } : p))
    );
  };

  const addReview = (publicationId: string, rating: number, comment: string): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Inicia sesión para dejar una reseña.' };
    const pub = publications.find((p) => p.id === publicationId);
    if (!pub) return { ok: false, error: 'La publicación ya no existe.' };
    if (pub.author.id === currentUser.id) {
      return { ok: false, error: 'No puedes calificar tu propia publicación.' };
    }
    if (pub.reviews.some((r) => r.authorId === currentUser.id)) {
      return { ok: false, error: 'Ya dejaste una reseña en esta publicación.' };
    }
    const hadExchange = requests.some(
      (r) =>
        r.publicationId === publicationId &&
        r.senderId === currentUser.id &&
        (r.status === 'aceptada' || r.status === 'completada')
    );
    const newReview: Review = {
      id: newId('rev'),
      publicationId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorCareer: currentUser.career,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      comment: comment.trim(),
      createdAt: today(),
      verifiedExchange: hadExchange,
    };
    setPublications((prev) =>
      prev.map((p) => {
        if (p.id !== publicationId) return p;
        const reviews = [newReview, ...p.reviews];
        const stats = calculateRatingDistribution(reviews);
        return { ...p, reviews, ratingAverage: stats.average, ratingCount: stats.total };
      })
    );
    log('resena', `Valoró "${pub.title}" con ${newReview.rating} estrella(s)`);
    celebrate({ particleCount: 40 });
    return { ok: true };
  };

  // ───────────── Solicitudes de intercambio ─────────────
  const sendContactRequest: ExchangeContextType['sendContactRequest'] = (data) => {
    if (!currentUser) return { ok: false, error: 'Inicia sesión para enviar solicitudes.' };
    if (data.receiverId === currentUser.id) {
      return { ok: false, error: 'Esta publicación es tuya.' };
    }
    if (publications.find((p) => p.id === data.publicationId)?.exchangeType === 'Gratuito / RSU') {
      return { ok: false, error: 'Esta publicación es gratuita: puedes descargarla sin solicitar intercambio.' };
    }
    const duplicate = requests.some(
      (r) =>
        r.publicationId === data.publicationId &&
        r.senderId === currentUser.id &&
        r.status === 'pendiente'
    );
    if (duplicate) return { ok: false, error: 'Ya tienes una solicitud pendiente para esta publicación.' };

    const newRequest: ContactExchangeRequest = {
      id: newId('req'),
      ...data,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderCareer: currentUser.career,
      senderCampus: currentUser.campus,
      senderPhone: currentUser.phone || '',
      status: 'pendiente',
      createdAt: now(),
    };
    setRequests((prev) => [newRequest, ...prev]);
    log('solicitud', `Solicitó intercambio de "${data.publicationTitle}" a ${data.receiverName}`);
    setPublications((prev) =>
      prev.map((p) => (p.id === data.publicationId ? { ...p, contactCount: p.contactCount + 1 } : p))
    );
    celebrate({ particleCount: 40 });
    return { ok: true };
  };

  const updateRequestStatus = (requestId: string, status: ContactExchangeRequest['status']) => {
    const rq = requests.find((r) => r.id === requestId);
    if (rq) log('solicitud_respondida', `Solicitud de ${rq.senderName} sobre "${rq.publicationTitle}": ${status}`);
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));
  };

  // ───────────── Reportes ─────────────
  const reportPublication: ExchangeContextType['reportPublication'] = (data) => {
    if (!currentUser) return { ok: false, error: 'Inicia sesión para reportar.' };
    const newReport: PlagiarismReport = {
      id: newId('rep'),
      ...data,
      reporterName: currentUser.name,
      reporterEmail: currentUser.email,
      status: 'pendiente',
      createdAt: now(),
    };
    setReports((prev) => [newReport, ...prev]);
    log('reporte', `Reportó "${data.publicationTitle}" (${data.reason})`);
    return { ok: true };
  };

  const resolveReport = (reportId: string, newStatus: PlagiarismReport['status']) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
  };

  const rateLibraryResource = (resourceId: string, stars: number): ActionResult => {
    if (!currentUser) return { ok: false, error: 'Inicia sesión para valorar.' };
    const value = Math.min(5, Math.max(1, Math.round(stars)));
    setLibraryRatings((prev) => ({ ...prev, [resourceId]: { ...(prev[resourceId] || {}), [currentUser.id]: value } }));
    return { ok: true };
  };

  const resetDatabase = () => {
    setLibraryRatings({});
    setActivity([]);
    clearFiles();
    setPublications(INITIAL_PUBLICATIONS);
    setUsers(INITIAL_USERS);
    setRoles(DEFAULT_ROLES);
    setRequests(INITIAL_REQUESTS);
    setReports(INITIAL_REPORTS);
    setFilter(DEFAULT_FILTER);
    setCurrentUserId(null);
    setIsAdminModalOpen(false);
    openAuth('login');
  };

  return (
    <ExchangeContext.Provider
      value={{
        publications,
        users,
        currentUser,
        isLoggedIn,
        requests,
        reports,
        roles,
        createRole,
        updateRole,
        deleteRole,
        getRoleById,
        canManageRoles,
        filter,
        setFilter,
        resetFilter,
        selectedPublication,
        setSelectedPublication,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isContactModalOpen,
        setIsContactModalOpen,
        isRequestsDrawerOpen,
        setIsRequestsDrawerOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isProjectInfoModalOpen,
        setIsProjectInfoModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        openAuth,
        isCreatorOrAdmin,
        isOwner,
        addPublication,
        canDownload,
        auditPublicationWithAI,
        runAIAuditOnPublication,
        updatePublicationStatus,
        deletePublication,
        recordResourceOpen,
        addReview,
        sendContactRequest,
        updateRequestStatus,
        reportPublication,
        resolveReport,
        loginUser,
        logoutUser,
        registerUser,
        changePassword,
        updateProfile,
        createUserByAdmin,
        updateUserRole,
        setUserVerified,
        deleteUser,
        resetDatabase,
        libraryRatings,
        activity,
        rateLibraryResource,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  );
};

export function useExchange() {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error('useExchange must be used within an ExchangeProvider');
  }
  return context;
}
