import { StudentUser, Publication, ContactExchangeRequest, PlagiarismReport, RoleDefinition } from '../types/exchange';

/**
 * Datos iniciales.
 *
 * Solo se incluyen las cuentas de los tres autores reales del proyecto (según el
 * documento PROYECTO_EXCHANGE_UCV_GRUPO_5.pdf, UCV Moyobamba, 2026). No hay
 * publicaciones, reseñas, solicitudes ni reportes de ejemplo: todo lo que aparece en
 * el catálogo lo crean usuarios reales. El material de referencia está en
 * src/data/library.ts (Biblioteca).
 *
 * Contraseña inicial de los administradores: ver README (cámbiala al primer ingreso
 * desde "Mi cuenta"). Aquí solo se guarda el hash.
 */
export const ADMIN_EMAIL = 'admin@exchangeucv.pe';

export const INITIAL_USERS: StudentUser[] = [
  {
    id: 'u-admin',
    name: 'Administrador Exchange UCV',
    email: ADMIN_EMAIL,
    role: 'admin',
    career: 'General / Interdisciplinario',
    campus: 'Moyobamba',
    cycle: '',
    verified: true,
    ratingAverage: 0,
    ratingCount: 0,
    bio: 'Cuenta de administración de la plataforma.',
    passwordSalt: '23128bc2385d01f7a8deea28f3026ca0',
    passwordHash: '56fc4560ef96c1c80e191d58fbc01598bb1fe796d11d0627201b6323bc719adf',
  },
  {
    id: 'u-delgado',
    name: 'Michael Jefferson Delgado Cerdán',
    email: 'mdelgadoc@ucvvirtual.edu.pe',
    role: 'dueño',
    career: 'Ingeniería Civil',
    campus: 'Moyobamba',
    cycle: '',
    orcid: '0009-0004-9087-2490',
    verified: true,
    ratingAverage: 0,
    ratingCount: 0,
    bio: 'Coautor de Exchange UCV (Grupo 5). Escuela Profesional de Ingeniería Civil, UCV Moyobamba.',
    passwordSalt: '736d567c66355bf3a6522bae53a26955',
    passwordHash: 'ffcba6e867462d35d08f21024860868f4fa14fd3eda97078617fc12bfcba1b81',
  },
  {
    id: 'u-gonzalez',
    name: 'José Roly Gonzalez Guevara',
    email: 'jgonzalezg@ucvvirtual.edu.pe',
    role: 'dueño',
    career: 'Ingeniería Civil',
    campus: 'Moyobamba',
    cycle: '',
    orcid: '0009-0008-6874-4045',
    verified: true,
    ratingAverage: 0,
    ratingCount: 0,
    bio: 'Coautor de Exchange UCV (Grupo 5). Escuela Profesional de Ingeniería Civil, UCV Moyobamba.',
    passwordSalt: 'ac5c6bb083b20f821b1034b065c261ad',
    passwordHash: 'bcbf80c2d551eb2bad1ed70e059609c497fcba7260d909cd0fb6514ef9d62b39',
  },
  {
    id: 'u-grandez',
    name: 'Michael Cristofer Grandez Acosta',
    email: 'mgrandeza@ucvvirtual.edu.pe',
    role: 'dueño',
    career: 'Ingeniería Civil',
    campus: 'Moyobamba',
    cycle: '',
    orcid: '0009-0004-9770-9557',
    verified: true,
    ratingAverage: 0,
    ratingCount: 0,
    bio: 'Coautor de Exchange UCV (Grupo 5). Escuela Profesional de Ingeniería Civil, UCV Moyobamba.',
    passwordSalt: 'ed945c81881c2e8e16c04fe7336ccab6',
    passwordHash: '4ae1a02fd5070624a829bd06acb89b763df0018d7911bcfa5710e91b3b0649ad',
  },
];

export const INITIAL_PUBLICATIONS: Publication[] = [];

export const INITIAL_REQUESTS: ContactExchangeRequest[] = [];

export const INITIAL_REPORTS: PlagiarismReport[] = [];

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'dueño',
    name: 'Dueño / Fundador (Grupo 5)',
    description: 'Autor del proyecto Exchange UCV. Acceso irrestricto, control total del sistema, auditoría de ética y creador de nuevos roles.',
    badgeColor: 'red',
    iconName: 'crown',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: true,
      canManageUsers: true,
      canManageRoles: true,
      canAuditAI: true,
      canModeratePublications: true,
      canExportData: true,
    },
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Supervisión operativa, gestión de catálogo, atención de reportes de plagio y alta de usuarios institucionales.',
    badgeColor: 'purple',
    iconName: 'shield',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: true,
      canManageUsers: true,
      canManageRoles: true,
      canAuditAI: true,
      canModeratePublications: true,
      canExportData: true,
    },
  },
  {
    id: 'docente',
    name: 'Profesor / Docente',
    description: 'Profesor universitario con facultades de validación pedagógica, publicación de guías de cátedra y asesoría académica.',
    badgeColor: 'amber',
    iconName: 'graduation-cap',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: true,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: true,
      canModeratePublications: true,
      canExportData: false,
    },
  },
  {
    id: 'investigador',
    name: 'Investigador / Semillero RSU',
    description: 'Líder o integrante de grupos de investigación formativa y proyectos de Responsabilidad Social Universitaria.',
    badgeColor: 'indigo',
    iconName: 'flask',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: false,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: true,
      canModeratePublications: false,
      canExportData: false,
    },
  },
  {
    id: 'jefe_practicas',
    name: 'Jefe de Prácticas / Asistente de Laboratorio',
    description: 'Encargado de talleres prácticos, protocolos de ensayo y asistencia a catedráticos en laboratorios de ingeniería.',
    badgeColor: 'teal',
    iconName: 'award',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: false,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: true,
      canModeratePublications: false,
      canExportData: false,
    },
  },
  {
    id: 'delegado',
    name: 'Delegado de Ciclo / Escuela',
    description: 'Representante estudiantil oficial de aula, encargado de convocar grupos de estudio y enlace con la dirección de escuela.',
    badgeColor: 'rose',
    iconName: 'user-check',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: false,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: false,
      canModeratePublications: false,
      canExportData: false,
    },
  },
  {
    id: 'tutor_par',
    name: 'Tutor Par / Estudiante Mentor',
    description: 'Estudiante destacado de ciclos avanzados que brinda tutorías solidarias y resolución de consultas a alumnos de ciclos menores.',
    badgeColor: 'emerald',
    iconName: 'book-open',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: false,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: false,
      canModeratePublications: false,
      canExportData: false,
    },
  },
  {
    id: 'auditor_etica',
    name: 'Auditor de Integridad y Ética',
    description: 'Miembro del comité de ética para revisión de reportes y supervisión contra el fraude o plagio según el Art. 10.',
    badgeColor: 'cyan',
    iconName: 'scale',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: true,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: true,
      canModeratePublications: true,
      canExportData: true,
    },
  },
  {
    id: 'student',
    name: 'Estudiante',
    description: 'Estudiante verificado con acceso al catálogo, descarga de apuntes y solicitud de intercambios colaborativos.',
    badgeColor: 'blue',
    iconName: 'user-check',
    isSystem: true,
    permissions: {
      canPublish: true,
      canAccessAdminPanel: false,
      canManageUsers: false,
      canManageRoles: false,
      canAuditAI: false,
      canModeratePublications: false,
      canExportData: false,
    },
  },
];
