import type { CareerType, CategoryType } from '../types/exchange';

/**
 * Cuartos 3D: uno por carrera y uno por sección del catálogo.
 * Este archivo solo tiene los datos (nombre, carrera, palabras clave y colores);
 * los modelos 3D están en src/three/rooms3d.ts.
 */
export type RoomId =
  | 'derecho'
  | 'civil'
  | 'sistemas'
  | 'industrial'
  | 'arquitectura'
  | 'medicina'
  | 'enfermeria'
  | 'psicologia'
  | 'administracion'
  | 'contabilidad'
  | 'comunicacion'
  | 'educacion'
  | 'biblioteca'
  | 'tutoria'
  | 'investigacion';

export interface RoomMeta {
  id: RoomId;
  label: string; // nombre corto (chip)
  place: string; // qué cuarto es
  tagline: string;
  career?: CareerType; // carrera que abre en el catálogo
  category?: CategoryType; // o sección
  keywords: string[]; // palabras (sin tildes) que activan el cuarto al buscar
  bg: [string, string]; // degradado de fondo detrás del cuarto
}

export const ROOMS: RoomMeta[] = [
  {
    id: 'derecho',
    label: 'Derecho',
    place: 'Despacho jurídico',
    tagline: 'Códigos, casos y jurisprudencia: aquí se prepara la defensa.',
    career: 'Derecho',
    keywords: ['derecho', 'abogad', 'juridic', 'penal', 'constitucional', 'procesal', 'notarial', 'ley', 'leyes', 'legal', 'tribunal', 'juez', 'jurisprudencia', 'criminolog', 'litigio', 'codigo civil', 'derechos humanos'],
    bg: ['#3b1d1d', '#7a2e2e'],
  },
  {
    id: 'civil',
    label: 'Ing. Civil',
    place: 'Obra en construcción',
    tagline: 'Concreto, estructuras y topografía: construimos el Perú.',
    career: 'Ingeniería Civil',
    keywords: ['ingenieria civil', 'civil', 'concreto', 'estructur', 'suelo', 'topograf', 'hidraul', 'construc', 'puente', 'carretera', 'vias', 'estatica', 'resistencia de materiales', 'edificacion', 'sismo', 'cimentacion', 'obra', 'mecanica de suelos'],
    bg: ['#3a2a10', '#b7791f'],
  },
  {
    id: 'sistemas',
    label: 'Ing. de Sistemas',
    place: 'Laboratorio de cómputo',
    tagline: 'Código, redes y datos funcionando las 24 horas.',
    career: 'Ingeniería de Sistemas',
    keywords: ['sistemas', 'software', 'programa', 'codigo', 'informatica', 'computacion', 'base de datos', 'redes', 'java', 'python', 'web', 'algoritm', 'datos', 'ciberseguridad', 'inteligencia artificial', 'desarrollo web', 'desarrollo de software'],
    bg: ['#0b1023', '#312e81'],
  },
  {
    id: 'industrial',
    label: 'Ing. Industrial',
    place: 'Planta de producción',
    tagline: 'Procesos, calidad y logística en movimiento.',
    career: 'Ingeniería Industrial',
    keywords: ['industrial', 'produccion', 'procesos', 'manufactura', 'logistica', 'calidad', 'operaciones', 'mantenimiento', 'seguridad industrial', 'planta', 'lean', 'ergonomia'],
    bg: ['#1f2933', '#52606d'],
  },
  {
    id: 'arquitectura',
    label: 'Arquitectura',
    place: 'Taller de diseño',
    tagline: 'Maquetas, planos y ciudades que nacen en una mesa.',
    career: 'Arquitectura',
    keywords: ['arquitect', 'maqueta', 'urbanis', 'autocad', 'revit', 'croquis', 'paisajismo', 'diseno arquitectonico', 'taller de diseno'],
    bg: ['#2d2a26', '#a8a29e'],
  },
  {
    id: 'medicina',
    label: 'Medicina',
    place: 'Consultorio médico',
    tagline: 'Anatomía, diagnóstico y un corazón que no deja de latir.',
    career: 'Medicina Humana',
    keywords: ['medicina', 'medico', 'anatomia', 'fisiologia', 'cardio', 'cirugia', 'farmacolog', 'patologia', 'clinica', 'diagnostico', 'histologia', 'semiologia', 'microbiolog'],
    bg: ['#0f3b38', '#14b8a6'],
  },
  {
    id: 'enfermeria',
    label: 'Enfermería',
    place: 'Sala de hospital',
    tagline: 'Cuidado del paciente, turno a turno.',
    career: 'Enfermería',
    keywords: ['enfermeria', 'enfermer', 'cuidado', 'paciente', 'triaje', 'primeros auxilios', 'inyectable', 'salud publica', 'signos vitales'],
    bg: ['#0c2d48', '#3b82f6'],
  },
  {
    id: 'psicologia',
    label: 'Psicología',
    place: 'Consultorio de psicología',
    tagline: 'Mente, conducta y emociones en un espacio tranquilo.',
    career: 'Psicología',
    keywords: ['psicolog', 'mente', 'conducta', 'terapia', 'emocion', 'cognitiv', 'neuro', 'personalidad', 'salud mental', 'test psicologico'],
    bg: ['#2e1f47', '#8b5cf6'],
  },
  {
    id: 'administracion',
    label: 'Administración',
    place: 'Oficina gerencial',
    tagline: 'Estrategia, marketing y números que suben.',
    career: 'Administración',
    keywords: ['administracion', 'gestion', 'empresa', 'marketing', 'negocio', 'gerencia', 'emprend', 'recursos humanos', 'estrategia', 'liderazgo', 'ventas'],
    bg: ['#102a43', '#334e68'],
  },
  {
    id: 'contabilidad',
    label: 'Contabilidad',
    place: 'Estudio contable',
    tagline: 'Balances, tributos y cada sol en su lugar.',
    career: 'Contabilidad',
    keywords: ['contab', 'finanza', 'tributa', 'impuesto', 'costos', 'auditoria', 'presupuesto', 'balance', 'sunat', 'economia', 'matematica financiera', 'excel'],
    bg: ['#14331f', '#15803d'],
  },
  {
    id: 'comunicacion',
    label: 'Comunicación',
    place: 'Set de televisión',
    tagline: 'Luces, cámara y… ¡al aire!',
    career: 'Ciencias de la Comunicación',
    keywords: ['comunicacion', 'periodis', 'audiovisual', 'radio', 'television', 'publicidad', 'fotografia', 'video', 'redes sociales', 'guion', 'cine', 'locucion'],
    bg: ['#1a1a1f', '#be123c'],
  },
  {
    id: 'educacion',
    label: 'Educación',
    place: 'Aula de clases',
    tagline: 'Pizarra, tiza y ganas de enseñar.',
    career: 'Educación',
    keywords: ['educacion', 'pedagog', 'docencia', 'didactica', 'aprendizaje', 'ensenanza', 'inicial', 'primaria', 'curriculo', 'aula', 'evaluacion educativa'],
    bg: ['#3d2b12', '#d97706'],
  },
  {
    id: 'tutoria',
    label: 'Conocimientos',
    place: 'Sala de tutorías',
    tagline: 'Enseña lo que dominas y aprende lo que te falta.',
    category: 'conocimientos',
    keywords: ['tutoria', 'asesoria', 'refuerzo', 'clases particulares', 'ayuda en'],
    bg: ['#172554', '#2563eb'],
  },
  {
    id: 'biblioteca',
    label: 'Materiales',
    place: 'Biblioteca Exchange UCV',
    tagline: 'Resúmenes, apuntes y presentaciones de todas las carreras.',
    category: 'materiales',
    keywords: ['biblioteca', 'libro', 'resumen', 'apuntes', 'separata', 'material'],
    bg: ['#0a1430', '#14234b'],
  },
  {
    id: 'investigacion',
    label: 'Investigación',
    place: 'Laboratorio de investigación',
    tagline: 'Ideas, experimentos y equipos para tu tesis.',
    category: 'investigacion',
    keywords: ['investigacion', 'tesis', 'laboratorio', 'quimica', 'biologia', 'ciencia', 'experimento', 'metodologia', 'articulo cientifico', 'proyecto de investigacion'],
    bg: ['#052e2b', '#0d9488'],
  },
];

export const ROOM_BY_ID: Record<RoomId, RoomMeta> = Object.fromEntries(ROOMS.map((r) => [r.id, r])) as Record<RoomId, RoomMeta>;

const norm = (s: string) =>
  ' ' +
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() +
  ' ';

/** Puntaje de cada cuarto según el texto (cada palabra clave que empieza una palabra suma). */
export function scoreText(text: string): { id: RoomId; score: number } | null {
  const hay = norm(text);
  if (hay.trim().length < 3) return null;
  let best: { id: RoomId; score: number } | null = null;
  for (const r of ROOMS) {
    let score = 0;
    r.keywords.forEach((k, i) => {
      // la primera palabra es el nombre de la carrera/sección: vale más
      if (hay.includes(' ' + k)) score += (k.includes(' ') ? 3 : k.length >= 6 ? 2 : 1) + (i === 0 ? 2 : 0);
    });
    // "derecho civil" es Derecho, no Ingeniería Civil
    if (r.id === 'civil' && hay.includes(' derecho')) score = 0;
    if (score > 0 && (!best || score > best.score)) best = { id: r.id, score };
  }
  return best;
}

export function roomForCareer(career?: string): RoomId | null {
  const r = ROOMS.find((x) => x.career && x.career === career);
  return r ? r.id : null;
}

/** Elige el cuarto para lo que la persona está buscando en el catálogo. */
export function pickRoom(f: { searchQuery?: string; career?: string; category?: string; course?: string }): RoomId {
  const byText = scoreText(f.searchQuery || '');
  if (byText) return byText.id;
  const byCareer = f.career && f.career !== 'todas' ? roomForCareer(f.career) : null;
  if (byCareer) return byCareer;
  const byCourse = scoreText(f.course || '');
  if (byCourse) return byCourse.id;
  if (f.category === 'conocimientos') return 'tutoria';
  if (f.category === 'investigacion') return 'investigacion';
  return 'biblioteca';
}
