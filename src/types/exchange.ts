export type CategoryType = 'conocimientos' | 'materiales' | 'investigacion';

import { CAREERS, CampusId } from '../data/ucv';
import { PublicationIntent, ResourceType } from '../data/catalog';

export type { PublicationIntent, ResourceType };

export type CareerType = (typeof CAREERS)[number];

export type CampusType = CampusId;

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
  /** URL de foto opcional. Si falta se muestran las iniciales. */
  avatar?: string;
  /** true solo para cuentas confirmadas por un administrador */
  verified: boolean;
  ratingAverage: number;
  ratingCount: number;
  bio: string;
  phone?: string;
  /** SHA-256(salt + contraseña). Nunca se guarda la contraseña en texto plano. */
  passwordHash: string;
  passwordSalt: string;
  createdAt?: string;
}

/** Datos públicos del autor que se copian en cada publicación (sin credenciales). */
export type PublicAuthor = Omit<StudentUser, 'passwordHash' | 'passwordSalt' | 'phone' | 'email'> & {
  email?: string;
};

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
  author: PublicAuthor;
  cycleLevel: string; // e.g. "Ciclo IV", "Ciclo VII", "Todos"
  tags: string[];
  exchangeType: 'Intercambio Académico' | 'Gratuito / RSU' | 'Colaboración en Equipo';
  fileType?: 'PDF' | 'DOCX' | 'ZIP' | 'XLSX' | 'Sesión Google Meet';
  fileSize?: string;
  /** ofrezco = ofrece ayuda / comparte; busco = solicita apoyo o material. Por defecto 'ofrezco'. */
  intent?: PublicationIntent;
  /** Tipo de recurso: resumen, apuntes, presentación, mapa conceptual… */
  resourceType?: ResourceType;
  /** Archivos adjuntos (guardados en IndexedDB con este id). */
  attachments?: AttachmentMeta[];
  /** Enlace al recurso (Google Drive, OneDrive, etc.). Opcional. */
  resourceUrl?: string;
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
  intent: 'todos' | PublicationIntent;
  resourceType: 'todos' | ResourceType;
  course: string;
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

export interface AttachmentMeta {
  id: string;
  name: string;
  size: number;
  type: string;
}
