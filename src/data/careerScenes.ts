import type { CareerType, CategoryType } from '../types/exchange';

/**
 * Datos de cada carrera (y de cada sección del catálogo): nombre, carrera,
 * palabras clave y colores. La ilustración animada está en
 * src/components/CareerIllustration.tsx y los emblemas 3D del Inicio en src/three/emblems3d.ts.
 */
export type SceneId =
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

export interface SceneMeta {
  id: SceneId;
  label: string; // nombre corto (chip)
  place: string; // lugar de la escena
  tagline: string;
  career?: CareerType; // carrera que abre en el catálogo
  category?: CategoryType; // o sección
  keywords: string[]; // palabras (sin tildes) que activan la carrera al buscar
  bg: [string, string]; // degradado de fondo detrás de la escena
}

export const SCENES: SceneMeta[] = [
  {
    id: 'derecho',
    label: 'Derecho',
    place: 'Palacio de Justicia',
    tagline: 'Leyes, casos y jurisprudencia: aquí se defiende la justicia.',
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
    bg: ['#3a2a10', '#a16207'],
  },
  {
    id: 'sistemas',
    label: 'Ing. de Sistemas',
    place: 'Centro de datos',
    tagline: 'Servidores, redes y código conectando al mundo.',
    career: 'Ingeniería de Sistemas',
    keywords: ['sistemas', 'software', 'programa', 'codigo', 'informatica', 'computacion', 'base de datos', 'redes', 'java', 'python', 'web', 'algoritm', 'datos', 'ciberseguridad', 'inteligencia artificial', 'desarrollo web', 'desarrollo de software'],
    bg: ['#0b1023', '#312e81'],
  },
  {
    id: 'industrial',
    label: 'Ing. Industrial',
    place: 'Planta industrial',
    tagline: 'Procesos, calidad y logística en movimiento.',
    career: 'Ingeniería Industrial',
    keywords: ['industrial', 'produccion', 'procesos', 'manufactura', 'logistica', 'calidad', 'operaciones', 'mantenimiento', 'seguridad industrial', 'planta', 'lean', 'ergonomia'],
    bg: ['#1f2933', '#52606d'],
  },
  {
    id: 'arquitectura',
    label: 'Arquitectura',
    place: 'Ciudad en diseño',
    tagline: 'Edificios y espacios que nacen de un plano.',
    career: 'Arquitectura',
    keywords: ['arquitect', 'maqueta', 'urbanis', 'autocad', 'revit', 'croquis', 'paisajismo', 'diseno arquitectonico', 'taller de diseno'],
    bg: ['#2d2a26', '#78716c'],
  },
  {
    id: 'medicina',
    label: 'Medicina',
    place: 'Hospital',
    tagline: 'Diagnóstico, cirugía y un corazón que no deja de latir.',
    career: 'Medicina Humana',
    keywords: ['medicina', 'medico', 'anatomia', 'fisiologia', 'cardio', 'cirugia', 'farmacolog', 'patologia', 'clinica', 'diagnostico', 'histologia', 'semiologia', 'microbiolog'],
    bg: ['#0f3b38', '#0f766e'],
  },
  {
    id: 'enfermeria',
    label: 'Enfermería',
    place: 'Centro de salud',
    tagline: 'Cuidado del paciente, turno a turno.',
    career: 'Enfermería',
    keywords: ['enfermeria', 'enfermer', 'cuidado', 'paciente', 'triaje', 'primeros auxilios', 'inyectable', 'salud publica', 'signos vitales'],
    bg: ['#0c2d48', '#2563eb'],
  },
  {
    id: 'psicologia',
    label: 'Psicología',
    place: 'Parque del bienestar',
    tagline: 'Mente, conducta y emociones en equilibrio.',
    career: 'Psicología',
    keywords: ['psicolog', 'mente', 'conducta', 'terapia', 'emocion', 'cognitiv', 'neuro', 'personalidad', 'salud mental', 'test psicologico'],
    bg: ['#2e1f47', '#7c3aed'],
  },
  {
    id: 'administracion',
    label: 'Administración',
    place: 'Distrito empresarial',
    tagline: 'Estrategia, marketing y números que suben.',
    career: 'Administración',
    keywords: ['administracion', 'gestion', 'empresa', 'marketing', 'negocio', 'gerencia', 'emprend', 'recursos humanos', 'estrategia', 'liderazgo', 'ventas'],
    bg: ['#102a43', '#334e68'],
  },
  {
    id: 'contabilidad',
    label: 'Contabilidad',
    place: 'Banco y finanzas',
    tagline: 'Balances, tributos y cada sol en su lugar.',
    career: 'Contabilidad',
    keywords: ['contab', 'finanza', 'tributa', 'impuesto', 'costos', 'auditoria', 'presupuesto', 'balance', 'sunat', 'economia', 'matematica financiera', 'excel'],
    bg: ['#14331f', '#15803d'],
  },
  {
    id: 'comunicacion',
    label: 'Comunicación',
    place: 'Estación de TV y radio',
    tagline: 'Señal en vivo: luces, cámara y ¡al aire!',
    career: 'Ciencias de la Comunicación',
    keywords: ['comunicacion', 'periodis', 'audiovisual', 'radio', 'television', 'publicidad', 'fotografia', 'video', 'redes sociales', 'guion', 'cine', 'locucion'],
    bg: ['#1a1a1f', '#be123c'],
  },
  {
    id: 'educacion',
    label: 'Educación',
    place: 'Colegio',
    tagline: 'Pizarra, libros y ganas de enseñar.',
    career: 'Educación',
    keywords: ['educacion', 'pedagog', 'docencia', 'didactica', 'aprendizaje', 'ensenanza', 'inicial', 'primaria', 'curriculo', 'aula', 'evaluacion educativa'],
    bg: ['#3d2b12', '#b45309'],
  },
  {
    id: 'tutoria',
    label: 'Conocimientos',
    place: 'Plaza de tutorías',
    tagline: 'Enseña lo que dominas y aprende lo que te falta.',
    category: 'conocimientos',
    keywords: ['tutoria', 'asesoria', 'refuerzo', 'clases particulares', 'ayuda en'],
    bg: ['#172554', '#1d4ed8'],
  },
  {
    id: 'biblioteca',
    label: 'Materiales',
    place: 'Gran biblioteca',
    tagline: 'Resúmenes, apuntes y presentaciones de todas las carreras.',
    category: 'materiales',
    keywords: ['biblioteca', 'libro', 'resumen', 'apuntes', 'separata', 'material'],
    bg: ['#0a1430', '#14234b'],
  },
  {
    id: 'investigacion',
    label: 'Investigación',
    place: 'Campus de investigación',
    tagline: 'Ideas, experimentos y equipos para tu tesis.',
    category: 'investigacion',
    keywords: ['investigacion', 'tesis', 'laboratorio', 'quimica', 'biologia', 'ciencia', 'experimento', 'metodologia', 'articulo cientifico', 'proyecto de investigacion'],
    bg: ['#052e2b', '#0f766e'],
  },
];

export const SCENE_BY_ID: Record<SceneId, SceneMeta> = Object.fromEntries(SCENES.map((r) => [r.id, r])) as Record<SceneId, SceneMeta>;

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

/** Puntaje de cada carrera según el texto (cada palabra clave que empieza una palabra suma). */
export function scoreText(text: string): { id: SceneId; score: number } | null {
  const hay = norm(text);
  if (hay.trim().length < 3) return null;
  let best: { id: SceneId; score: number } | null = null;
  for (const r of SCENES) {
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

export function sceneForCareer(career?: string): SceneId | null {
  const r = SCENES.find((x) => x.career && x.career === career);
  return r ? r.id : null;
}

/** Elige la escena para lo que la persona está buscando en el catálogo. */
export function pickScene(f: { searchQuery?: string; career?: string; category?: string; course?: string }): SceneId {
  const byText = scoreText(f.searchQuery || '');
  if (byText) return byText.id;
  const byCareer = f.career && f.career !== 'todas' ? sceneForCareer(f.career) : null;
  if (byCareer) return byCareer;
  const byCourse = scoreText(f.course || '');
  if (byCourse) return byCourse.id;
  if (f.category === 'conocimientos') return 'tutoria';
  if (f.category === 'investigacion') return 'investigacion';
  return 'biblioteca';
}
