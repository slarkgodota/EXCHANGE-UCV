export type CategoryType = 'conocimientos' | 'materiales' | 'investigacion';

export type CareerType =
  | 'Ingeniería Civil'
  | 'Ingeniería de Sistemas'
  | 'Medicina Humana'
  | 'Derecho'
  | 'Psicología'
  | 'Administración'
  | 'Arquitectura'
  | 'Contabilidad'
  | 'Ciencias de la Comunicación'
  | 'General / Interdisciplinario';

export type CampusType =
  | 'Lima Norte'
  | 'Lima Este'
  | 'Lima Ate'
  | 'Callao'
  | 'Trujillo'
  | 'Piura'
  | 'Chiclayo'
  | 'Tarapoto'
  | 'Moyobamba'
  | 'Chimbote'
  | 'Huaraz'
  | 'Chepén'
  | 'Arequipa';

export interface RolePermission {
  canPublish: boolean;
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canAuditAI: boolean;
  canModeratePublications: boolean;
  canExportData: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  badgeColor: 'red' | 'purple' | 'amber' | 'blue' | 'emerald' | 'indigo' | 'rose' | 'teal' | 'cyan';
  iconName: 'crown' | 'shield' | 'graduation-cap' | 'flask' | 'award' | 'user-check' | 'book-open' | 'scale';
  isSystem: boolean;
  permissions: RolePermission;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  career: CareerType;
  campus: CampusType;
  cycle: string;
  orcid?: string;
  avatar: string;
  verified: boolean;
  ratingAverage: number;
  ratingCount: number;
  bio: string;
  phone?: string;
}

export interface Review {
  id: string;
  publicationId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorCareer: CareerType;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verifiedExchange: boolean;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  career: CareerType;
  course: string;
  author: StudentUser;
  cycleLevel: string; // e.g. "Ciclo IV", "Ciclo VII", "Todos"
  tags: string[];
  exchangeType: 'Intercambio Académico' | 'Gratuito / RSU' | 'Colaboración en Equipo';
  fileType?: 'PDF' | 'DOCX' | 'ZIP' | 'XLSX' | 'Sesión Google Meet';
  fileSize?: string;
  downloadCount: number;
  createdAt: string;
  status: 'aprobado' | 'en_revision' | 'destacado' | 'reportado';
  ratingAverage: number;
  ratingCount: number;
  reviews: Review[];
  contactCount: number;
  aiAudit?: AIOriginalityAuditResult;
}

export interface AIOriginalityAuditResult {
  originalityScore: number; // 0 to 100
  verdict: 'APROBADO_INTEGRO' | 'REQUIERE_CITACION' | 'RIESGO_SIMILITUD';
  summary: string;
  strengths: string[];
  suggestions: string[];
  academicIntegrityNote: string;
  analyzedAt?: string;
}

export interface ContactExchangeRequest {
  id: string;
  publicationId: string;
  publicationTitle: string;
  publicationCategory: CategoryType;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderCareer: CareerType;
  senderCampus: CampusType;
  senderPhone: string;
  receiverId: string;
  receiverName: string;
  message: string;
  proposedExchange: string; // What the student offers in return (e.g. Apuntes de Física, tutoría en cálculo, etc.)
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'completada';
  createdAt: string;
}

export interface PlagiarismReport {
  id: string;
  publicationId: string;
  publicationTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: 'plagio' | 'material_inapropiado' | 'informacion_falsa' | 'otro';
  details: string;
  status: 'pendiente' | 'investigando' | 'resuelto' | 'descartado';
  createdAt: string;
}

export interface FilterState {
  category: 'todas' | CategoryType;
  career: 'todas' | CareerType;
  searchQuery: string;
  campus: 'todos' | CampusType;
  sortBy: 'relevance' | 'rating' | 'newest' | 'downloads';
  minRating: number;
}

export interface AdminMetrics {
  totalUsers: number;
  totalPublications: number;
  totalExchanges: number;
  averageSatisfaction: number;
  pendingReports: number;
  materialsCount: number;
  knowledgeCount: number;
  researchCount: number;
}
