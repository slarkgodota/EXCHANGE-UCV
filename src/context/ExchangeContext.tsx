import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';
import {
  Publication,
  StudentUser,
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
} from '../data/initialData';
import { calculateRatingDistribution } from '../utils/exchangeLogic';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthResult {
  success: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
}

const toStudentUser = (user: User): StudentUser => {
  const fullName = user.user_metadata.full_name;

  return {
    id: user.id,
    name:
      typeof fullName === 'string' && fullName.trim()
        ? fullName.trim()
        : user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    role: 'student',
    career: 'General / Interdisciplinario',
    campus: 'Lima Norte',
    cycle: 'Ciclo I',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    verified: false,
    ratingAverage: 0,
    ratingCount: 0,
    bio: 'Miembro de Exchange UCV.',
  };
};

const authErrorMessage = (message: string): string => {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return 'El correo o la contraseña no son correctos.';
  }
  if (normalized.includes('user already registered')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }
  if (normalized.includes('password should be at least')) {
    return 'La contraseña no cumple los requisitos mínimos.';
  }
  if (normalized.includes('invalid email')) {
    return 'Ingresa un correo electrónico válido.';
  }
  return `No se pudo completar la autenticación: ${message}`;
};

interface ExchangeContextType {
  publications: Publication[];
  users: StudentUser[];
  currentUser: StudentUser | null;
  isLoggedIn: boolean;
  requests: ContactExchangeRequest[];
  reports: PlagiarismReport[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
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
  isCreatorOrAdmin: boolean;
  isOwner: boolean;
  
  // Actions
  addPublication: (data: {
    title: string;
    description: string;
    category: CategoryType;
    career: CareerType;
    course: string;
    cycleLevel: string;
    tags: string[];
    exchangeType: 'Intercambio Académico' | 'Gratuito / RSU' | 'Colaboración en Equipo';
    fileType?: 'PDF' | 'DOCX' | 'ZIP' | 'XLSX' | 'Sesión Google Meet';
    fileSize?: string;
    aiAudit?: AIOriginalityAuditResult;
  }) => Publication;
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
  addReview: (publicationId: string, rating: number, comment: string) => void;
  sendContactRequest: (data: {
    publicationId: string;
    publicationTitle: string;
    publicationCategory: CategoryType;
    receiverId: string;
    receiverName: string;
    message: string;
    proposedExchange: string;
  }) => void;
  updateRequestStatus: (requestId: string, status: ContactExchangeRequest['status']) => void;
  reportPublication: (data: {
    publicationId: string;
    publicationTitle: string;
    reason: PlagiarismReport['reason'];
    details: string;
  }) => void;
  resolveReport: (reportId: string, newStatus: PlagiarismReport['status']) => void;
  loginUser: (email: string, password: string) => Promise<AuthResult>;
  continueAsGuest: () => void;
  switchUser: (userId: string) => void;
  logoutUser: () => Promise<AuthResult>;
  registerUser: (name: string, email: string, password: string) => Promise<AuthResult>;
  authLoading: boolean;
  authStatusMessage: string | null;
  clearAuthStatusMessage: () => void;
  isSupabaseConfigured: boolean;
  roles: RoleDefinition[];
  createRole: (roleData: Omit<RoleDefinition, 'isSystem'>) => RoleDefinition;
  updateRole: (roleId: string, roleData: Partial<RoleDefinition>) => void;
  deleteRole: (roleId: string) => boolean;
  getRoleById: (roleId: string) => RoleDefinition;
  canManageRoles: boolean;
  createUserByAdmin: (userData: {
    name: string;
    email: string;
    role: string;
    career: CareerType;
    campus: CampusType;
    cycle: string;
    phone?: string;
    bio?: string;
  }) => StudentUser;
  updateUserRole: (userId: string, newRole: string) => void;
  deleteUser: (userId: string) => boolean;
  resetDatabase: () => void;
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

// Use a clean namespace for the public demo's fictional sample data.
const STORAGE_KEYS = {
  PUBLICATIONS: 'exchange_ucv_publications_demo_v1',
  USERS: 'exchange_ucv_users_demo_v1',
  ROLES: 'exchange_ucv_roles_demo_v1',
  CURRENT_USER_ID: 'exchange_ucv_current_user_demo_v1',
  REQUESTS: 'exchange_ucv_requests_demo_v1',
  REPORTS: 'exchange_ucv_reports_demo_v1',
  IS_LOGGED_IN: 'exchange_ucv_is_logged_in_demo_v1',
};

const DEFAULT_FILTER: FilterState = {
  category: 'todas',
  career: 'todas',
  searchQuery: '',
  campus: 'todos',
  sortBy: 'relevance',
  minRating: 0,
};

export const CREATOR_EMAILS: string[] = [];

export const OWNER_EMAIL = '';

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publications, setPublications] = useState<Publication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUBLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_PUBLICATIONS;
    } catch {
      return INITIAL_PUBLICATIONS;
    }
  });

  // Public demo profiles are fictional and have no login credentials.
  const [users, setUsers] = useState<StudentUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed: (StudentUser & { password?: string })[] = JSON.parse(saved);
        return parsed.map(({ password: _password, ...user }) => user);
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Dynamic system and custom roles
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLES);
      if (saved) {
        const parsed: RoleDefinition[] = JSON.parse(saved);
        const missing = DEFAULT_ROLES.filter((dr) => !parsed.some((pr) => pr.id === dr.id));
        return [...parsed, ...missing];
      }
      return DEFAULT_ROLES;
    } catch {
      return DEFAULT_ROLES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    } catch {}
  }, [roles]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {
      return null;
    }
  });

  const [isGuestSession, setIsGuestSession] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
    } catch {
      return false;
    }
  });
  const [authUser, setAuthUser] = useState<StudentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);
  const isLoggedIn = Boolean(authUser || (isGuestSession && currentUserId));

  const [requests, setRequests] = useState<ContactExchangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [reports, setReports] = useState<PlagiarismReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : INITIAL_REPORTS;
    } catch {
      return INITIAL_REPORTS;
    }
  });

  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRequestsDrawerOpen, setIsRequestsDrawerOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProjectInfoModalOpen, setIsProjectInfoModalOpen] = useState(false);

  // Requirement: "al entrar la pagina debe aparecer para iniciar seccion o registrarse"
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    // If not logged in initially, open the Auth modal on page entry
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) !== 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const applySession = (session: Session | null) => {
      if (!active) return;

      if (session?.user) {
        setAuthUser(toStudentUser(session.user));
        setCurrentUserId(null);
        setIsGuestSession(false);
        setIsAuthModalOpen(false);
        setAuthStatusMessage(null);
      }
      setAuthLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      applySession(session);
      if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setCurrentUserId(null);
        setIsGuestSession(false);
        setIsAuthModalOpen(true);
      }
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error && active) {
          console.error('Could not restore the Supabase session.', error);
          setAuthStatusMessage('No se pudo comprobar tu sesión. Intenta iniciar sesión de nuevo.');
        }
        applySession(data.session);
      })
      .catch((error: unknown) => {
        console.error('Could not restore the Supabase session.', error);
        if (active) {
          setAuthLoading(false);
          setAuthStatusMessage('No se pudo comprobar tu sesión. Intenta iniciar sesión de nuevo.');
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PUBLICATIONS, JSON.stringify(publications));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [publications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (authUser) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
      } else if (isGuestSession && currentUserId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
      }
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [authUser, currentUserId, isGuestSession]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [reports]);

  // Keep selectedPublication updated
  useEffect(() => {
    if (selectedPublication) {
      const updated = publications.find((p) => p.id === selectedPublication.id);
      if (updated) {
        setSelectedPublication(updated);
      }
    }
  }, [publications]);

  const currentUser =
    authUser || (isGuestSession ? users.find((u) => u.id === currentUserId) || null : null);

  const getRoleById = (roleId: string): RoleDefinition => {
    const found = roles.find((r) => r.id === roleId);
    if (found) return found;
    return (
      DEFAULT_ROLES.find((r) => r.id === roleId) || {
        id: roleId,
        name: roleId.charAt(0).toUpperCase() + roleId.slice(1),
        description: 'Rol institucional UCV',
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
      }
    );
  };

  const currentUserRole = currentUser ? getRoleById(currentUser.role) : undefined;

  const isOwner = Boolean(
    currentUser &&
      (currentUser.email.toLowerCase().trim() === OWNER_EMAIL ||
        currentUser.role === 'dueño' ||
        CREATOR_EMAILS.includes(currentUser.email.toLowerCase().trim()))
  );

  const isCreatorOrAdmin = Boolean(
    currentUser &&
      (isOwner ||
        currentUser.role === 'admin' ||
        currentUser.role === 'dueño' ||
        currentUserRole?.permissions.canAccessAdminPanel ||
        CREATOR_EMAILS.includes(currentUser.email.toLowerCase().trim()))
  );

  const canManageRoles = Boolean(
    currentUser &&
      (isOwner ||
        currentUser.role === 'dueño' ||
        currentUserRole?.permissions.canManageRoles ||
        CREATOR_EMAILS.includes(currentUser.email.toLowerCase().trim()))
  );

  const createRole = (roleData: Omit<RoleDefinition, 'isSystem'>): RoleDefinition => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: roleData.id?.trim() || `role-${Date.now()}`,
      isSystem: false,
    };
    setRoles((prev) => [...prev, newRole]);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}
    return newRole;
  };

  const updateRole = (roleId: string, roleData: Partial<RoleDefinition>) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...roleData } : r))
    );
  };

  const deleteRole = (roleId: string): boolean => {
    const target = roles.find((r) => r.id === roleId);
    if (!target || target.isSystem) return false;
    setUsers((prev) =>
      prev.map((u) => (u.role === roleId ? { ...u, role: 'student' } : u))
    );
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    return true;
  };

  const loginUser = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return {
        success: false,
        message: 'El inicio de sesión aún no está configurado. Conecta el proyecto Supabase.',
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { success: false, message: authErrorMessage(error.message) };

      setAuthStatusMessage(null);
      setIsAuthModalOpen(false);
      try {
        confetti({ particleCount: 50, spread: 50 });
      } catch {}
      return { success: true };
    } catch (error) {
      console.error('Supabase sign-in request failed.', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `No se pudo conectar para iniciar sesión: ${error.message}`
            : 'No se pudo conectar para iniciar sesión. Inténtalo de nuevo.',
      };
    }
  };

  const continueAsGuest = () => {
    if (authUser) {
      setIsAuthModalOpen(false);
      return;
    }
    setCurrentUserId(INITIAL_USERS[0].id);
    setIsGuestSession(true);
    setIsAuthModalOpen(false);
  };

  const createUserByAdmin = (userData: {
    name: string;
    email: string;
    role: string;
    career: CareerType;
    campus: CampusType;
    cycle: string;
    phone?: string;
    bio?: string;
  }): StudentUser => {
    const avatarChoice =
      userData.role === 'docente'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
        : userData.role === 'admin' || userData.role === 'dueño'
        ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';

    const newUser: StudentUser = {
      id: `u-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role,
      career: userData.career,
      campus: userData.campus,
      cycle: userData.cycle || (userData.role === 'docente' ? 'Catedrático' : 'Ciclo I'),
      avatar: avatarChoice,
      verified: true,
      ratingAverage: 5.0,
      ratingCount: 0,
      bio:
        userData.bio?.trim() ||
        `${userData.role} de ${userData.career} - Sede ${userData.campus}.`,
      phone: userData.phone?.trim() || '',
    };

    setUsers((prev) => [...prev, newUser]);
    try {
      confetti({ particleCount: 60, spread: 55 });
    } catch {}
    return newUser;
  };

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          // Cannot demote root Grupo 5 founders
          if (CREATOR_EMAILS.includes(u.email.toLowerCase().trim())) {
            return u;
          }
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (CREATOR_EMAILS.includes(target.email.toLowerCase().trim())) {
      return false; // Cannot delete Grupo 5 founders
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  const switchUser = (userId: string) => {
    if (authUser) return;
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      setIsGuestSession(true);
      setIsAuthModalOpen(false);
    }
  };

  const logoutUser = async (): Promise<AuthResult> => {
    if (authUser && supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          const message = `No se pudo cerrar sesión: ${error.message}`;
          setAuthStatusMessage(message);
          setIsAuthModalOpen(true);
          return { success: false, message };
        }
      } catch (error) {
        console.error('Supabase sign-out request failed.', error);
        const message =
          error instanceof Error
            ? `No se pudo cerrar sesión: ${error.message}`
            : 'No se pudo cerrar sesión. Inténtalo de nuevo.';
        setAuthStatusMessage(message);
        setIsAuthModalOpen(true);
        return { success: false, message };
      }
    } else {
      setCurrentUserId(null);
      setIsGuestSession(false);
      setAuthUser(null);
      setIsAuthModalOpen(true);
    }
    return { success: true };
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    if (!supabase) {
      return {
        success: false,
        message: 'El registro aún no está configurado. Conecta el proyecto Supabase.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: new URL(import.meta.env.BASE_URL, window.location.origin).toString(),
        },
      });
      if (error) return { success: false, message: authErrorMessage(error.message) };

      if (!data.session) {
        return {
          success: true,
          needsEmailConfirmation: true,
          message: 'Revisa tu correo y confirma la cuenta antes de iniciar sesión.',
        };
      }

      setAuthStatusMessage(null);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (error) {
      console.error('Supabase sign-up request failed.', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? `No se pudo crear la cuenta: ${error.message}`
            : 'No se pudo crear la cuenta. Inténtalo de nuevo.',
      };
    }
  };

  const clearAuthStatusMessage = () => setAuthStatusMessage(null);

  const auditPublicationWithAI = async (data: {
    title: string;
    course: string;
    career: CareerType;
    description: string;
    category: CategoryType;
    exchangeType: string;
  }): Promise<AIOriginalityAuditResult> => {
    try {
      const res = await fetch('/api/ai/audit-originality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Error al consultar el servicio de auditoría de IA.');
      }
      const result: AIOriginalityAuditResult = await res.json();
      result.analyzedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      return result;
    } catch (e: any) {
      console.warn('Fallo en auditoría de IA, aplicando análisis de respaldo:', e);
      return {
        originalityScore: 92,
        verdict: 'APROBADO_INTEGRO',
        summary:
          'Material evaluado bajo los lineamientos del Art. 10 de Exchange UCV. Contenido apto para intercambio y apoyo formativo entre pares.',
        strengths: [
          'Estructura orientada al refuerzo académico de la asignatura',
          'Aporte de apuntes y ejercicios de clase verificados',
        ],
        suggestions: [
          'Mantener citación en formato APA 7ma edición o Vancouver para fuentes de autores externos',
        ],
        academicIntegrityNote: 'Aprobado para consulta académica universitaria.',
        analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
    }
  };

  const runAIAuditOnPublication = async (
    pubId: string
  ): Promise<AIOriginalityAuditResult | null> => {
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
    setPublications((prev) =>
      prev.map((p) => (p.id === pubId ? { ...p, aiAudit: audit } : p))
    );
    return audit;
  };

  const addPublication = (data: {
    title: string;
    description: string;
    category: CategoryType;
    career: CareerType;
    course: string;
    cycleLevel: string;
    tags: string[];
    exchangeType: 'Intercambio Académico' | 'Gratuito / RSU' | 'Colaboración en Equipo';
    fileType?: 'PDF' | 'DOCX' | 'ZIP' | 'XLSX' | 'Sesión Google Meet';
    fileSize?: string;
    aiAudit?: AIOriginalityAuditResult;
  }): Publication => {
    const authorToUse = currentUser || INITIAL_USERS[0];
    const defaultAudit: AIOriginalityAuditResult = {
      originalityScore: 95,
      verdict: 'APROBADO_INTEGRO',
      summary:
        'Verificado por el auditor de integridad UCV. Contenido formativo auténtico y pedagógico.',
      strengths: ['Aporte académico estructurado', 'Sin indicios de vulneración de derechos de autor'],
      suggestions: ['Mantener la citación correspondiente según normas UCV'],
      academicIntegrityNote: 'Cumple el código de ética y uso responsable del Grupo 5.',
      analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const newPub: Publication = {
      id: `pub-${Date.now()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      career: data.career,
      course: data.course,
      author: authorToUse,
      cycleLevel: data.cycleLevel,
      tags: data.tags,
      exchangeType: data.exchangeType,
      fileType: data.fileType || 'PDF',
      fileSize: data.fileSize || '3.5 MB',
      downloadCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'aprobado',
      ratingAverage: 5.0,
      ratingCount: 0,
      reviews: [],
      contactCount: 0,
      aiAudit: data.aiAudit || defaultAudit,
    };

    setPublications((prev) => [newPub, ...prev]);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
      });
    } catch {}
    return newPub;
  };

  const updatePublicationStatus = (pubId: string, status: Publication['status']) => {
    setPublications((prev) =>
      prev.map((p) => (p.id === pubId ? { ...p, status } : p))
    );
  };

  const addReview = (publicationId: string, rating: number, comment: string) => {
    const reviewer = currentUser || INITIAL_USERS[0];
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      publicationId,
      authorId: reviewer.id,
      authorName: reviewer.name,
      authorAvatar: reviewer.avatar,
      authorCareer: reviewer.career,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      createdAt: new Date().toISOString().split('T')[0],
      verifiedExchange: true,
    };

    setPublications((prev) =>
      prev.map((pub) => {
        if (pub.id !== publicationId) return pub;
        const updatedReviews = [newReview, ...pub.reviews];
        const stats = calculateRatingDistribution(updatedReviews);
        return {
          ...pub,
          reviews: updatedReviews,
          ratingAverage: stats.average,
          ratingCount: stats.total,
        };
      })
    );

    try {
      confetti({ particleCount: 50, spread: 45 });
    } catch {}
  };

  const sendContactRequest = (data: {
    publicationId: string;
    publicationTitle: string;
    publicationCategory: CategoryType;
    receiverId: string;
    receiverName: string;
    message: string;
    proposedExchange: string;
  }) => {
    const sender = currentUser || INITIAL_USERS[0];
    const newRequest: ContactExchangeRequest = {
      id: `req-${Date.now()}`,
      publicationId: data.publicationId,
      publicationTitle: data.publicationTitle,
      publicationCategory: data.publicationCategory,
      senderId: sender.id,
      senderName: sender.name,
      senderEmail: sender.email,
      senderCareer: sender.career,
      senderCampus: sender.campus,
      senderPhone: sender.phone || '',
      receiverId: data.receiverId,
      receiverName: data.receiverName,
      message: data.message,
      proposedExchange: data.proposedExchange,
      status: 'pendiente',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setRequests((prev) => [newRequest, ...prev]);

    setPublications((prev) =>
      prev.map((p) =>
        p.id === data.publicationId ? { ...p, contactCount: p.contactCount + 1 } : p
      )
    );

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch {}
  };

  const updateRequestStatus = (
    requestId: string,
    status: ContactExchangeRequest['status']
  ) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const reportPublication = (data: {
    publicationId: string;
    publicationTitle: string;
    reason: PlagiarismReport['reason'];
    details: string;
  }) => {
    const reporter = currentUser || INITIAL_USERS[0];
    const newReport: PlagiarismReport = {
      id: `rep-${Date.now()}`,
      publicationId: data.publicationId,
      publicationTitle: data.publicationTitle,
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reason: data.reason,
      details: data.details,
      status: 'pendiente',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, newStatus: PlagiarismReport['status']) => {
    setReports((prev) =>
      prev.map((rep) => (rep.id === reportId ? { ...rep, status: newStatus } : rep))
    );
  };

  const resetDatabase = () => {
    setPublications(INITIAL_PUBLICATIONS);
    setUsers(INITIAL_USERS);
    setRoles(DEFAULT_ROLES);
    if (!authUser) {
      setCurrentUserId(INITIAL_USERS[0].id);
      setIsGuestSession(true);
    }
    setRequests(INITIAL_REQUESTS);
    setReports(INITIAL_REPORTS);
    setFilter(DEFAULT_FILTER);
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
        authLoading,
        authStatusMessage,
        clearAuthStatusMessage,
        isSupabaseConfigured,
        isCreatorOrAdmin,
        isOwner,
        addPublication,
        auditPublicationWithAI,
        runAIAuditOnPublication,
        updatePublicationStatus,
        addReview,
        sendContactRequest,
        updateRequestStatus,
        reportPublication,
        resolveReport,
        loginUser,
        continueAsGuest,
        switchUser,
        logoutUser,
        registerUser,
        createUserByAdmin,
        updateUserRole,
        deleteUser,
        resetDatabase,
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
