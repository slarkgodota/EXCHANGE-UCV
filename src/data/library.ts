/**
 * Biblioteca de Exchange UCV.
 *
 * Recursos reales y de acceso público. Cada entrada enlaza a la fuente original:
 * Exchange UCV no aloja ni redistribuye estos documentos.
 * Las guías de estudio son orientaciones del Grupo 5 para encontrar información en
 * fuentes oficiales; no reemplazan el sílabo ni las indicaciones del docente.
 */

export type LibrarySection =
  | 'ucv'
  | 'repositorios'
  | 'normativa'
  | 'investigacion'
  | 'guias';

export interface LibraryResource {
  id: string;
  section: LibrarySection;
  title: string;
  provider: string;
  description: string;
  url?: string;
  tags: string[];
  /** Solo para guías de estudio */
  topics?: string[];
  references?: { label: string; url?: string }[];
}

export const LIBRARY_SECTIONS: { id: LibrarySection; label: string; description: string }[] = [
  { id: 'ucv', label: 'Servicios UCV', description: 'Catálogo, repositorio y atención de la biblioteca de la universidad.' },
  { id: 'repositorios', label: 'Repositorios abiertos', description: 'Tesis, artículos y revistas peruanas y latinoamericanas de libre acceso.' },
  { id: 'normativa', label: 'Normativa técnica', description: 'Reglamentos y normas oficiales del Perú usados en ingeniería y arquitectura.' },
  { id: 'investigacion', label: 'Investigación y citación', description: 'Herramientas para tesis, citas y perfiles de investigador.' },
  { id: 'guias', label: 'Guías de estudio', description: 'Rutas de estudio por curso con fuentes oficiales y gratuitas.' },
];

export const LIBRARY_RESOURCES: LibraryResource[] = [
  // ───────────── Servicios UCV ─────────────
  {
    id: 'ucv-catalogo',
    section: 'ucv',
    title: 'Catálogo de la Biblioteca UCV',
    provider: 'Universidad César Vallejo',
    description:
      'Buscador del fondo bibliográfico de la UCV: libros impresos, tesis y revistas disponibles en las bibliotecas de cada campus.',
    url: 'https://cibookucv.com/',
    tags: ['Catálogo', 'Libros', 'Préstamo'],
  },
  {
    id: 'ucv-repositorio',
    section: 'ucv',
    title: 'Repositorio Digital Institucional UCV',
    provider: 'Universidad César Vallejo',
    description:
      'Tesis de pregrado y posgrado, trabajos de investigación y producción académica de la UCV en acceso abierto. Útil para revisar antecedentes de tu tema.',
    url: 'https://repositorio.ucv.edu.pe/',
    tags: ['Tesis', 'Antecedentes', 'Acceso abierto'],
  },
  {
    id: 'ucv-myloft',
    section: 'ucv',
    title: 'MyLOFT UCV – Biblioteca virtual',
    provider: 'Universidad César Vallejo',
    description:
      'Acceso a los recursos de la biblioteca virtual con tu cuenta institucional y a la sala Zoom de atención con un especialista (L–V 7:00 a. m. – 6:00 p. m.; sábados 8:00 a. m. – 1:00 p. m.).',
    url: 'https://app.myloft.xyz/user/login',
    tags: ['Biblioteca virtual', 'Bases de datos', 'Asesoría'],
  },
  {
    id: 'ucv-centros-info',
    section: 'ucv',
    title: 'Centros de Información UCV',
    provider: 'Universidad César Vallejo',
    description:
      'Servicios de la biblioteca física y virtual, capacitaciones en recursos bibliográficos y horarios por campus. Correo: biblioteca@ucv.edu.pe · WhatsApp: (01) 202-4342.',
    url: 'https://www.ucv.edu.pe/en/information-centers',
    tags: ['Horarios', 'Capacitación', 'Contacto'],
  },

  // ───────────── Repositorios abiertos ─────────────
  {
    id: 'alicia',
    section: 'repositorios',
    title: 'ALICIA – Acceso Libre a Información Científica',
    provider: 'CONCYTEC',
    description:
      'Repositorio nacional que reúne en un solo buscador la producción científica de universidades e instituciones peruanas, incluidas las tesis registradas en RENATI.',
    url: 'https://alicia.concytec.gob.pe/',
    tags: ['Perú', 'Tesis', 'Artículos'],
  },
  {
    id: 'renati',
    section: 'repositorios',
    title: 'RENATI – Registro Nacional de Trabajos de Investigación',
    provider: 'SUNEDU',
    description:
      'Registro oficial de tesis y trabajos de investigación para optar grados y títulos en el Perú. Sirve para verificar que tu tema no esté duplicado.',
    url: 'https://renati.sunedu.gob.pe/',
    tags: ['Tesis', 'Grados y títulos'],
  },
  {
    id: 'scielo-peru',
    section: 'repositorios',
    title: 'SciELO Perú',
    provider: 'SciELO',
    description: 'Revistas científicas peruanas arbitradas con texto completo gratuito en ciencias, salud, ingeniería y sociales.',
    url: 'https://www.scielo.org.pe/',
    tags: ['Revistas', 'Artículos', 'Acceso abierto'],
  },
  {
    id: 'la-referencia',
    section: 'repositorios',
    title: 'LA Referencia',
    provider: 'Red Federada de Repositorios de América Latina',
    description: 'Buscador regional de tesis y artículos de acceso abierto de repositorios latinoamericanos, incluido el Perú.',
    url: 'https://www.lareferencia.info/',
    tags: ['Latinoamérica', 'Tesis'],
  },
  {
    id: 'doaj',
    section: 'repositorios',
    title: 'DOAJ – Directory of Open Access Journals',
    provider: 'DOAJ',
    description: 'Directorio internacional de revistas de acceso abierto revisadas por pares. Filtra por idioma español.',
    url: 'https://doaj.org/',
    tags: ['Internacional', 'Revistas'],
  },
  {
    id: 'bnp',
    section: 'repositorios',
    title: 'Biblioteca Nacional del Perú',
    provider: 'BNP',
    description: 'Catálogo y servicios digitales de la Biblioteca Nacional, con colecciones históricas y bibliografía peruana.',
    url: 'https://www.bnp.gob.pe/',
    tags: ['Perú', 'Catálogo'],
  },

  // ───────────── Normativa técnica ─────────────
  {
    id: 'rne',
    section: 'normativa',
    title: 'Reglamento Nacional de Edificaciones (RNE)',
    provider: 'Ministerio de Vivienda, Construcción y Saneamiento',
    description:
      'Normas técnicas obligatorias para diseño y construcción en el Perú: E.020 Cargas, E.030 Diseño Sismorresistente, E.050 Suelos y Cimentaciones, E.060 Concreto Armado, entre otras. Revisa siempre la versión vigente y sus modificatorias en el portal del ministerio.',
    url: 'https://www.gob.pe/vivienda',
    tags: ['Ingeniería Civil', 'Arquitectura', 'Normas E'],
  },
  {
    id: 'el-peruano',
    section: 'normativa',
    title: 'Normas Legales – Diario Oficial El Peruano',
    provider: 'Editora Perú',
    description: 'Buscador oficial de normas publicadas (resoluciones ministeriales, decretos supremos). Úsalo para confirmar modificaciones recientes del RNE.',
    url: 'https://busquedas.elperuano.pe/',
    tags: ['Legislación', 'Derecho', 'Normas'],
  },
  {
    id: 'inacal',
    section: 'normativa',
    title: 'Normas Técnicas Peruanas (NTP) – INACAL',
    provider: 'Instituto Nacional de Calidad',
    description: 'Entidad que aprueba las NTP, por ejemplo las de ensayos de agregados, concreto y suelos usadas en laboratorio.',
    url: 'https://www.gob.pe/inacal',
    tags: ['NTP', 'Laboratorio', 'Calidad'],
  },

  // ───────────── Investigación y citación ─────────────
  {
    id: 'apa7',
    section: 'investigacion',
    title: 'Normas APA 7.ª edición',
    provider: 'American Psychological Association',
    description: 'Guía oficial de citas y referencias en estilo APA, el más usado en trabajos de investigación de la UCV.',
    url: 'https://apastyle.apa.org/',
    tags: ['Citas', 'Referencias', 'Redacción'],
  },
  {
    id: 'cti-vitae',
    section: 'investigacion',
    title: 'CTI Vitae – Hojas de vida de investigadores',
    provider: 'CONCYTEC',
    description: 'Registro nacional de investigadores. Crea tu perfil y vincúlalo con tu ORCID para participar en semilleros y proyectos.',
    url: 'https://ctivitae.concytec.gob.pe/',
    tags: ['Investigador', 'CONCYTEC'],
  },
  {
    id: 'orcid',
    section: 'investigacion',
    title: 'ORCID – Identificador de investigador',
    provider: 'ORCID',
    description: 'Identificador digital gratuito y permanente para tus publicaciones. Los autores de Exchange UCV lo usan en su proyecto.',
    url: 'https://orcid.org/',
    tags: ['Identificador', 'Autoría'],
  },
  {
    id: 'scholar',
    section: 'investigacion',
    title: 'Google Académico',
    provider: 'Google',
    description: 'Buscador de literatura científica. Combínalo con el repositorio UCV y ALICIA para reunir antecedentes nacionales e internacionales.',
    url: 'https://scholar.google.com/',
    tags: ['Búsqueda', 'Antecedentes'],
  },

  // ───────────── Guías de estudio ─────────────
  {
    id: 'guia-calculo',
    section: 'guias',
    title: 'Guía: Cálculo Integral',
    provider: 'Biblioteca Exchange UCV',
    description: 'Ruta de estudio para los primeros ciclos de ingeniería con un libro de texto gratuito en español.',
    tags: ['Cálculo II', 'Ingeniería', 'Ciclos II–IV'],
    topics: [
      'Integración por partes y sustitución trigonométrica',
      'Fracciones parciales e integrales impropias',
      'Áreas, volúmenes de revolución y longitud de arco',
      'Centroides y momentos de inercia',
    ],
    references: [
      { label: 'OpenStax – Cálculo, volumen 2 (español, gratuito)', url: 'https://openstax.org/books/c%C3%A1lculo-volumen-2/pages/prefacio' },
      { label: 'OpenStax – Cálculo, volumen 1 (español, gratuito)', url: 'https://openstax.org/books/c%C3%A1lculo-volumen-1' },
    ],
  },
  {
    id: 'guia-suelos',
    section: 'guias',
    title: 'Guía: Mecánica de Suelos y ensayos de laboratorio',
    provider: 'Biblioteca Exchange UCV',
    description: 'Qué estudiar antes de tus prácticas de laboratorio y qué norma revisar en cada caso.',
    tags: ['Mecánica de Suelos', 'Ingeniería Civil', 'Laboratorio'],
    topics: [
      'Clasificación SUCS y AASHTO',
      'Granulometría por tamizado',
      'Límites de Atterberg (líquido y plástico)',
      'Ensayo Proctor modificado y CBR',
      'Capacidad portante y cimentaciones superficiales',
    ],
    references: [
      { label: 'RNE – Norma E.050 Suelos y Cimentaciones (Ministerio de Vivienda)', url: 'https://www.gob.pe/vivienda' },
      { label: 'Normas Técnicas Peruanas de ensayos de suelos (INACAL)', url: 'https://www.gob.pe/inacal' },
      { label: 'Tesis de referencia en el Repositorio UCV', url: 'https://repositorio.ucv.edu.pe/' },
    ],
  },
  {
    id: 'guia-topografia',
    section: 'guias',
    title: 'Guía: Topografía',
    provider: 'Biblioteca Exchange UCV',
    description: 'Conceptos clave para levantamientos con estación total y GNSS.',
    tags: ['Topografía', 'Ingeniería Civil', 'Ciclos III–IV'],
    topics: [
      'Poligonales abiertas y cerradas; compensación de errores',
      'Coordenadas UTM y sistema WGS84',
      'Nivelación y curvas de nivel',
      'Modelos digitales del terreno',
    ],
    references: [
      { label: 'Tesis y trabajos de topografía en ALICIA', url: 'https://alicia.concytec.gob.pe/' },
      { label: 'Catálogo de la Biblioteca UCV', url: 'https://cibookucv.com/' },
    ],
  },
  {
    id: 'guia-concreto',
    section: 'guias',
    title: 'Guía: Tecnología del Concreto',
    provider: 'Biblioteca Exchange UCV',
    description: 'Diseño de mezclas y control de calidad del concreto en laboratorio.',
    tags: ['Concreto', 'Ingeniería Civil', 'Materiales'],
    topics: [
      'Propiedades de agregados y cemento',
      'Diseño de mezclas (método ACI 211)',
      'Asentamiento (cono de Abrams)',
      'Resistencia a la compresión a 7, 14 y 28 días',
    ],
    references: [
      { label: 'RNE – Norma E.060 Concreto Armado (Ministerio de Vivienda)', url: 'https://www.gob.pe/vivienda' },
      { label: 'NTP de concreto y agregados (INACAL)', url: 'https://www.gob.pe/inacal' },
    ],
  },
  {
    id: 'guia-metodologia',
    section: 'guias',
    title: 'Guía: Metodología de la Investigación',
    provider: 'Biblioteca Exchange UCV',
    description: 'Pasos para armar tu proyecto de investigación o tesis con fuentes confiables y citas correctas.',
    tags: ['Tesis', 'Metodología', 'Todas las carreras'],
    topics: [
      'Planteamiento del problema y objetivos',
      'Matriz de consistencia y operacionalización de variables',
      'Búsqueda de antecedentes nacionales e internacionales',
      'Citas y referencias en APA 7 para evitar similitud indebida',
    ],
    references: [
      { label: 'Repositorio Digital UCV', url: 'https://repositorio.ucv.edu.pe/' },
      { label: 'ALICIA – CONCYTEC', url: 'https://alicia.concytec.gob.pe/' },
      { label: 'Normas APA 7.ª edición', url: 'https://apastyle.apa.org/' },
    ],
  },
  {
    id: 'guia-equipos',
    section: 'guias',
    title: 'Guía: Formar un equipo de investigación',
    provider: 'Biblioteca Exchange UCV',
    description: 'Cómo usar la sección Investigación de Exchange UCV para encontrar compañeros con habilidades complementarias.',
    tags: ['Investigación', 'Trabajo en equipo', 'RSU'],
    topics: [
      'Define el tema, la línea de investigación y los roles que necesitas',
      'Publica tu convocatoria indicando carrera, ciclo y campus',
      'Registra a los integrantes en ORCID y CTI Vitae',
      'Acuerda la autoría y la distribución de tareas desde el inicio',
    ],
    references: [
      { label: 'ORCID', url: 'https://orcid.org/' },
      { label: 'CTI Vitae – CONCYTEC', url: 'https://ctivitae.concytec.gob.pe/' },
    ],
  },
];
