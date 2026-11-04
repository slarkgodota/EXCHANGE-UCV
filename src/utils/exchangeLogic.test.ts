import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRatingDistribution,
  filterPublications,
  validateNewPublication,
  calculateAdminMetrics,
  validateAdminCreateUser,
  canModifyRole,
  isSafeHttpUrl,
} from './exchangeLogic';
import { Publication, Review, StudentUser, FilterState } from '../types/exchange';

const mockAuthor: StudentUser = {
  id: 'u-1',
  name: 'Michael Jefferson Delgado Cerdán',
  email: 'mdelgadoc@ucvvirtual.edu.pe',
  role: 'student',
  career: 'Ingeniería Civil',
  campus: 'Moyobamba',
  cycle: 'Ciclo VIII',
  orcid: '0009-0004-9087-2490',
  verified: true,
  ratingAverage: 0,
  ratingCount: 0,
  bio: 'Prueba unitaria',
  passwordHash: 'x',
  passwordSalt: 'y',
};

const sampleReviews: Review[] = [
  {
    id: 'r1',
    publicationId: 'p1',
    authorId: 'u2',
    authorName: 'José Roly Gonzalez',
    authorCareer: 'Ingeniería Civil',
    rating: 5,
    comment: 'Excelente resumen, fórmulas muy claras.',
    createdAt: '2026-10-15',
    verifiedExchange: true,
  },
  {
    id: 'r2',
    publicationId: 'p1',
    authorId: 'u3',
    authorName: 'Michael Grandez Acosta',
    authorCareer: 'Ingeniería Civil',
    rating: 4,
    comment: 'Muy bien estructurado, me ayudó en el examen.',
    createdAt: '2026-10-18',
    verifiedExchange: true,
  },
];

const samplePub: Publication = {
  id: 'p1',
  title: 'Apuntes de Cálculo Integral y Estructuras',
  description: 'Resumen completo de fórmulas de integración múltiple y análisis matricial.',
  category: 'materiales',
  career: 'Ingeniería Civil',
  course: 'Estructuras I',
  author: mockAuthor,
  cycleLevel: 'Ciclo V',
  tags: ['estructuras', 'calculo', 'formulas'],
  exchangeType: 'Intercambio Académico',
  downloadCount: 45,
  createdAt: '2026-10-10',
  status: 'aprobado',
  ratingAverage: 4.5,
  ratingCount: 2,
  reviews: sampleReviews,
  contactCount: 6,
};

test('calculateRatingDistribution calculates correct average and counts', () => {
  const result = calculateRatingDistribution(sampleReviews);
  assert.equal(result.total, 2);
  assert.equal(result.average, 4.5);
  assert.equal(result.distribution[5], 1);
  assert.equal(result.distribution[4], 1);
  assert.equal(result.percentages[5], 50);
  assert.equal(result.percentages[4], 50);
});

test('calculateRatingDistribution handles empty reviews safely', () => {
  const result = calculateRatingDistribution([]);
  assert.equal(result.total, 0);
  assert.equal(result.average, 0);
});

test('filterPublications filters by category and career', () => {
  const filter: FilterState = {
    category: 'materiales',
    career: 'Ingeniería Civil',
    searchQuery: '',
    campus: 'todos',
    intent: 'todos',
    resourceType: 'todos',
    course: '',
    sortBy: 'relevance',
    minRating: 0,
  };

  const filtered = filterPublications([samplePub], filter);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'p1');

  // Filter with mismatched career
  const mismatchFilter: FilterState = {
    ...filter,
    career: 'Derecho',
  };
  const filteredMismatch = filterPublications([samplePub], mismatchFilter);
  assert.equal(filteredMismatch.length, 0);
});

test('filterPublications filters by search term', () => {
  const filter: FilterState = {
    category: 'todas',
    career: 'todas',
    searchQuery: 'Estructuras',
    campus: 'todos',
    intent: 'todos',
    resourceType: 'todos',
    course: '',
    sortBy: 'relevance',
    minRating: 0,
  };
  const filtered = filterPublications([samplePub], filter);
  assert.equal(filtered.length, 1);

  const noMatch: FilterState = {
    ...filter,
    searchQuery: 'Farmacología Inexistente',
  };
  assert.equal(filterPublications([samplePub], noMatch).length, 0);
});

test('validateNewPublication enforces required fields and integrity declaration', () => {
  const invalid = validateNewPublication({
    title: 'Abc',
    description: 'Corta',
    course: 'Fis',
    career: 'Ingeniería Civil',
    category: 'materiales',
    academicIntegrityChecked: false,
  });
  assert.notEqual(invalid, null);

  const valid = validateNewPublication({
    title: 'Apuntes de Mecánica de Fluidos',
    description: 'Guía completa con ejercicios resueltos y problemas de examen paso a paso.',
    course: 'Mecánica de Fluidos',
    career: 'Ingeniería Civil',
    category: 'materiales',
    academicIntegrityChecked: true,
  });
  assert.equal(valid, null);
});

test('calculateAdminMetrics aggregates stats correctly', () => {
  const metrics = calculateAdminMetrics([samplePub], [mockAuthor], [], []);
  assert.equal(metrics.totalPublications, 1);
  assert.equal(metrics.totalUsers, 1);
  assert.equal(metrics.materialsCount, 1);
  assert.equal(metrics.knowledgeCount, 0);
  assert.equal(metrics.researchCount, 0);
  assert.equal(metrics.averageSatisfaction, 4.5);
});

test('validateAdminCreateUser validates name, email format, unique email, and required fields', () => {
  const existingEmails = ['mdelgadoc@ucvvirtual.edu.pe', 'jgonzalezg@ucvvirtual.edu.pe'];

  // Test duplicate email
  const duplicateErr = validateAdminCreateUser({
    name: 'Carlos Ruiz',
    email: 'mdelgadoc@ucvvirtual.edu.pe',
    role: 'student',
    career: 'Derecho',
    campus: 'Los Olivos',
    password: 'Clave2026x',
    existingEmails,
  });
  assert.equal(duplicateErr, 'Este correo institucional ya se encuentra registrado en el padrón.');

  // Test invalid email
  const invalidEmailErr = validateAdminCreateUser({
    name: 'Carlos Ruiz',
    email: 'correo_sin_arroba',
    role: 'student',
    career: 'Derecho',
    campus: 'Los Olivos',
    password: 'Clave2026x',
    existingEmails,
  });
  assert.equal(invalidEmailErr, 'Por favor ingresa un correo electrónico válido.');

  // Test valid data
  const validUser = validateAdminCreateUser({
    name: 'Dra. María Elena Ramos',
    email: 'mramos@ucv.edu.pe',
    role: 'docente',
    career: 'Medicina Humana',
    campus: 'Trujillo',
    password: 'Clave2026x',
    existingEmails,
  });
  assert.equal(validUser, null);
});

test('canModifyRole prevents revoking Grupo 5 creators but allows modifying other users', () => {
  const rootCreators = [
    'mdelgadoc@ucvvirtual.edu.pe',
    'jgonzalezg@ucvvirtual.edu.pe',
    'mgrandeza@ucvvirtual.edu.pe',
  ];

  assert.equal(canModifyRole('mdelgadoc@ucvvirtual.edu.pe', rootCreators), false);
  assert.equal(canModifyRole('jgonzalezg@ucvvirtual.edu.pe', rootCreators), false);
  assert.equal(canModifyRole('mgrandeza@ucvvirtual.edu.pe', rootCreators), false);

  // Other users can have their roles modified (promoted/demoted)
  assert.equal(canModifyRole('estudiante_nuevo@ucvvirtual.edu.pe', rootCreators), true);
  assert.equal(canModifyRole('docente_tutor@ucv.edu.pe', rootCreators), true);
});


test('validateAdminCreateUser exige contraseña inicial segura', () => {
  const err = validateAdminCreateUser({
    name: 'Ana Torres',
    email: 'ana@ucvvirtual.edu.pe',
    role: 'student',
    career: 'Derecho',
    campus: 'Piura',
    password: 'corta',
    existingEmails: [],
  });
  assert.match(err || '', /contraseña/);
});

test('calculateAdminMetrics no inventa satisfacción sin reseñas', () => {
  const metrics = calculateAdminMetrics([], [mockAuthor], [], []);
  assert.equal(metrics.averageSatisfaction, 0);
});

test('isSafeHttpUrl bloquea esquemas peligrosos', () => {
  assert.equal(isSafeHttpUrl('https://drive.google.com/file/d/abc'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('no es url'), false);
});

test('filterPublications filtra por ofrece/busca, tipo de recurso y curso (sección 7 del PDF)', () => {
  const base: FilterState = { category: 'todas', career: 'todas', searchQuery: '', campus: 'todos', intent: 'todos', resourceType: 'todos', course: '', sortBy: 'newest', minRating: 0 };
  const busca = { ...samplePub, id: 'p2', intent: 'busco' as const, resourceType: 'Mapa conceptual' as const, course: 'Física II' };
  const list = [{ ...samplePub, resourceType: 'Resumen' as const }, busca];
  assert.equal(filterPublications(list, { ...base, intent: 'busco' }).length, 1);
  assert.equal(filterPublications(list, { ...base, intent: 'ofrezco' })[0].id, samplePub.id);
  assert.equal(filterPublications(list, { ...base, resourceType: 'Mapa conceptual' })[0].id, 'p2');
  assert.equal(filterPublications(list, { ...base, course: 'fisica' })[0].id, 'p2');
});
