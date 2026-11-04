import {
  Publication,
  Review,
  FilterState,
  AdminMetrics,
  StudentUser,
  ContactExchangeRequest,
  PlagiarismReport,
} from '../types/exchange';
import { EMAIL_REGEX } from './security';

/** Minúsculas y sin tildes, para que "calculo" encuentre "Cálculo". */
export function normalizeText(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Calculates average rating rounded to 1 decimal place,
 * along with the breakdown distribution count for 1 to 5 stars.
 */
export function calculateRatingDistribution(reviews: Review[]): {
  average: number;
  total: number;
  distribution: { [star: number]: number };
  percentages: { [star: number]: number };
} {
  const distribution: { [star: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const total = reviews.length;

  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution,
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  let sum = 0;
  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(review.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
    sum += review.rating;
  }

  const average = Math.round((sum / total) * 10) / 10;
  const percentages: { [star: number]: number } = {
    5: Math.round(((distribution[5] || 0) / total) * 100),
    4: Math.round(((distribution[4] || 0) / total) * 100),
    3: Math.round(((distribution[3] || 0) / total) * 100),
    2: Math.round(((distribution[2] || 0) / total) * 100),
    1: Math.round(((distribution[1] || 0) / total) * 100),
  };

  return { average, total, distribution, percentages };
}

/**
 * Filters and sorts publications according to user-selected criteria.
 */
export function filterPublications(
  publications: Publication[],
  filter: FilterState
): Publication[] {
  return publications
    .filter((pub) => {
      // Exclude reported or hidden items unless viewing all
      if (pub.status === 'reportado') {
        return false;
      }

      // Filter by category
      if (filter.category !== 'todas' && pub.category !== filter.category) {
        return false;
      }

      // Filter by career
      if (filter.career !== 'todas' && pub.career !== filter.career) {
        return false;
      }

      // Filter by campus
      if (filter.campus !== 'todos' && pub.author.campus !== filter.campus) {
        return false;
      }

      // Ofrece / busca (sección 8 del PDF)
      if (filter.intent && filter.intent !== 'todos' && (pub.intent || 'ofrezco') !== filter.intent) {
        return false;
      }

      // Tipo de recurso: resumen, apuntes, presentación, mapa conceptual…
      if (filter.resourceType && filter.resourceType !== 'todos' && pub.resourceType !== filter.resourceType) {
        return false;
      }

      // Curso
      if (filter.course && filter.course.trim() !== '') {
        const c = normalizeText(filter.course);
        if (!normalizeText(pub.course).includes(c)) return false;
      }

      // Filter by minimum rating
      if (filter.minRating > 0 && pub.ratingAverage < filter.minRating) {
        return false;
      }

      // Filter by search query (title, description, course, tags, author name)
      if (filter.searchQuery.trim() !== '') {
        const query = normalizeText(filter.searchQuery);
        const haystack = normalizeText(
          [pub.title, pub.description, pub.course, pub.author.name, pub.resourceType || '', ...pub.tags].join(' ')
        );
        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (filter.sortBy) {
        case 'rating':
          return b.ratingAverage - a.ratingAverage;
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'relevance':
        default: {
          // Destacados primero, luego mejor calificados, luego más recientes
          const scoreA = (a.status === 'destacado' ? 10 : 0) + a.ratingAverage * 2;
          const scoreB = (b.status === 'destacado' ? 10 : 0) + b.ratingAverage * 2;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      }
    });
}

/**
 * Validates new publication data. Returns null if valid, or an error string if invalid.
 */
export function validateNewPublication(data: {
  title: string;
  description: string;
  course: string;
  career: string;
  category: string;
  academicIntegrityChecked: boolean;
}): string | null {
  if (!data.title || data.title.trim().length < 5) {
    return 'El título debe tener al menos 5 caracteres.';
  }
  if (!data.course || data.course.trim().length < 3) {
    return 'Por favor ingresa el nombre de la asignatura o tema.';
  }
  if (!data.career) {
    return 'Debes seleccionar una carrera profesional de la UCV.';
  }
  if (!data.category) {
    return 'Debes seleccionar una sección o categoría.';
  }
  if (!data.description || data.description.trim().length < 20) {
    return 'La descripción debe tener al menos 20 caracteres para ser informativa.';
  }
  if (!data.academicIntegrityChecked) {
    return 'Marca la declaración de responsabilidad para poder publicar.';
  }
  return null;
}

/**
 * Calculates platform administrator metrics for monitoring and reporting.
 */
export function calculateAdminMetrics(
  publications: Publication[],
  users: StudentUser[],
  requests: ContactExchangeRequest[],
  reports: PlagiarismReport[]
): AdminMetrics {
  const activePubs = publications.filter((p) => p.status !== 'reportado');
  const materialsCount = activePubs.filter((p) => p.category === 'materiales').length;
  const knowledgeCount = activePubs.filter((p) => p.category === 'conocimientos').length;
  const researchCount = activePubs.filter((p) => p.category === 'investigacion').length;

  const totalReviews = activePubs.flatMap((p) => p.reviews);
  const avgSatisfaction =
    totalReviews.length > 0
      ? Math.round(
          (totalReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews.length) * 10
        ) / 10
      : 0;

  const pendingReports = reports.filter((r) => r.status === 'pendiente').length;

  return {
    totalUsers: users.length,
    totalPublications: activePubs.length,
    totalExchanges: requests.length,
    averageSatisfaction: avgSatisfaction,
    pendingReports,
    materialsCount,
    knowledgeCount,
    researchCount,
  };
}

/**
 * Validates new user creation data from the Admin Panel.
 */
export function validateAdminCreateUser(data: {
  name: string;
  email: string;
  role: string;
  career: string;
  campus: string;
  password: string;
  existingEmails: string[];
}): string | null {
  if (!data.password || data.password.length < 8 || !/[A-Za-z]/.test(data.password) || !/\d/.test(data.password)) {
    return 'La contraseña inicial debe tener al menos 8 caracteres con letras y números.';
  }
  if (!data.name || data.name.trim().length < 3) {
    return 'El nombre completo debe tener al menos 3 caracteres.';
  }
  const cleanEmail = data.email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return 'Por favor ingresa un correo electrónico válido.';
  }
  if (data.existingEmails.some((e) => e.toLowerCase().trim() === cleanEmail)) {
    return 'Este correo institucional ya se encuentra registrado en el padrón.';
  }
  if (!data.role) {
    return 'Debes asignar un rol (Estudiante, Docente o Administrador).';
  }
  if (!data.career) {
    return 'Debes seleccionar una carrera profesional.';
  }
  if (!data.campus) {
    return 'Debes seleccionar una sede de la UCV.';
  }
  return null;
}

/**
 * Checks whether an admin can modify/revoke the role of a given user.
 * Root Grupo 5 creators cannot have their admin credentials revoked.
 */
export function canModifyRole(targetUserEmail: string, rootCreatorEmails: string[]): boolean {
  const cleanTarget = targetUserEmail.toLowerCase().trim();
  return !rootCreatorEmails.some((e) => e.toLowerCase().trim() === cleanTarget);
}


/**
 * Solo permite enlaces http(s) para evitar esquemas peligrosos como javascript:.
 */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}
