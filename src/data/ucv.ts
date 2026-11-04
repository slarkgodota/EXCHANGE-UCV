/**
 * Información institucional de la Universidad César Vallejo (UCV).
 *
 * Fuentes (consultadas en noviembre de 2026):
 *  - Campus: https://www.ucv.edu.pe/en/campus-ucv
 *  - Centros de información / bibliotecas y horarios: https://www.ucv.edu.pe/en/information-centers
 *  - Fundación y sede central: https://en.wikipedia.org/wiki/C%C3%A9sar_Vallejo_University
 *  - Licenciamiento SUNEDU (Res. 077-2019-SUNEDU/CD, 6 años):
 *    https://andina.pe/ingles/noticia-sunedu-otorga-licenciamiento-a-universidad-cesar-vallejo-norma-legal-y-graficos-755220.aspx
 *
 * Exchange UCV es un prototipo estudiantil (Grupo 5). No es una herramienta oficial
 * de la universidad. Verifica siempre los datos vigentes en ucv.edu.pe.
 */

export const CAMPUS_IDS = [
  'Trujillo',
  'Chepén',
  'Los Olivos',
  'San Juan de Lurigancho',
  'Ate',
  'Callao',
  'Chiclayo',
  'Piura',
  'Chimbote',
  'Huaraz',
  'Tarapoto',
  'Moyobamba',
] as const;

export type CampusId = (typeof CAMPUS_IDS)[number];

export interface CampusInfo {
  id: CampusId;
  /** Nombre como lo usa la universidad */
  label: string;
  city: string;
  region: string;
  /** Dirección solo cuando la página oficial la publica */
  address?: string;
  /** Horario de la biblioteca física según ucv.edu.pe */
  libraryHours: { weekdays: string; saturday?: string; sunday?: string; note?: string }[];
  isHeadquarters?: boolean;
}

export const UCV_CAMPUSES: CampusInfo[] = [
  {
    id: 'Trujillo',
    label: 'Trujillo',
    city: 'Trujillo',
    region: 'La Libertad',
    address: 'Av. Víctor Larco 1770',
    isHeadquarters: true,
    libraryHours: [
      { weekdays: '7:00 a. m. – 9:00 p. m.', saturday: '7:00 a. m. – 1:00 p. m.' },
      {
        note: 'Local Moche',
        weekdays: 'L–J 8:00 a. m. – 1:00 p. m. y 2:00 – 5:30 p. m.; V hasta 5:00 p. m.',
        saturday: '9:00 a. m. – 12:00 m.',
      },
    ],
  },
  {
    id: 'Chepén',
    label: 'Chepén',
    city: 'Chepén',
    region: 'La Libertad',
    address: 'Carretera Panamericana Norte Km 695',
    libraryHours: [{ weekdays: '7:30 a. m. – 9:50 p. m.', saturday: '7:30 a. m. – 6:00 p. m.' }],
  },
  {
    id: 'Los Olivos',
    label: 'Lima Norte (Los Olivos)',
    city: 'Lima',
    region: 'Lima',
    libraryHours: [
      { note: 'Lima Norte', weekdays: '7:00 a. m. – 11:00 p. m.', saturday: '7:00 a. m. – 7:00 p. m.', sunday: '8:00 a. m. – 5:00 p. m.' },
      { note: 'San Andrés', weekdays: '7:00 a. m. – 11:00 p. m.', saturday: '7:00 a. m. – 7:00 p. m.' },
    ],
  },
  {
    id: 'San Juan de Lurigancho',
    label: 'Lima Este (San Juan de Lurigancho)',
    city: 'Lima',
    region: 'Lima',
    libraryHours: [
      { weekdays: '8:00 a. m. – 10:00 p. m.', saturday: '8:00 a. m. – 5:00 p. m.', sunday: '8:00 a. m. – 1:00 p. m.' },
    ],
  },
  {
    id: 'Ate',
    label: 'Lima Ate',
    city: 'Lima',
    region: 'Lima',
    libraryHours: [{ weekdays: '7:30 a. m. – 10:30 p. m.' }],
  },
  {
    id: 'Callao',
    label: 'Callao',
    city: 'Callao',
    region: 'Callao',
    libraryHours: [{ weekdays: '7:00 a. m. – 10:30 p. m.', saturday: '8:00 a. m. – 9:00 p. m.' }],
  },
  {
    id: 'Chiclayo',
    label: 'Chiclayo',
    city: 'Chiclayo',
    region: 'Lambayeque',
    libraryHours: [
      { weekdays: '8:00 a. m. – 10:30 p. m.', saturday: '9:00 a. m. – 7:00 p. m.', sunday: '9:00 a. m. – 1:00 p. m.' },
    ],
  },
  {
    id: 'Piura',
    label: 'Piura',
    city: 'Piura',
    region: 'Piura',
    libraryHours: [{ weekdays: '7:30 a. m. – 10:00 p. m.', saturday: '8:00 a. m. – 8:00 p. m.' }],
  },
  {
    id: 'Chimbote',
    label: 'Chimbote',
    city: 'Chimbote',
    region: 'Áncash',
    libraryHours: [
      { weekdays: '7:30 a. m. – 8:00 p. m.', saturday: '8:00 a. m. – 6:00 p. m.' },
      { note: 'Local Panamericana', weekdays: '7:30 a. m. – 8:00 p. m.', saturday: '8:00 a. m. – 6:00 p. m.' },
    ],
  },
  {
    id: 'Huaraz',
    label: 'Huaraz',
    city: 'Huaraz',
    region: 'Áncash',
    libraryHours: [{ note: 'Locales Palmira y Pinar (lunes a sábado)', weekdays: '8:00 a. m. – 9:30 p. m.' }],
  },
  {
    id: 'Tarapoto',
    label: 'Tarapoto',
    city: 'Tarapoto',
    region: 'San Martín',
    libraryHours: [{ weekdays: '7:30 a. m. – 10:30 p. m.', saturday: '8:00 a. m. – 1:00 p. m.' }],
  },
  {
    id: 'Moyobamba',
    label: 'Moyobamba',
    city: 'Moyobamba',
    region: 'San Martín',
    libraryHours: [{ weekdays: '8:00 a. m. – 10:00 p. m.', saturday: '8:00 a. m. – 1:00 p. m.' }],
  },
];

export const getCampusLabel = (id: string): string =>
  UCV_CAMPUSES.find((c) => c.id === id)?.label ?? id;

export const UCV_FACTS = {
  founded: '12 de noviembre de 1991',
  founder: 'César Acuña Peralta',
  headquarters: 'Trujillo (La Libertad)',
  campusCount: UCV_CAMPUSES.length,
  regionCount: new Set(UCV_CAMPUSES.map((c) => c.region)).size,
  licensing: {
    resolution: 'Resolución N.° 077-2019-SUNEDU/CD',
    year: 2019,
    years: 6,
    note: 'Licencia institucional otorgada por SUNEDU en junio de 2019 por seis años. Consulta su estado vigente en el portal de SUNEDU.',
    checkUrl: 'https://enlinea.sunedu.gob.pe/',
  },
  contact: {
    phone: '(01) 202-4342',
    libraryEmail: 'biblioteca@ucv.edu.pe',
    trainingEmail: 'd.centrodeinformacion@ucv.edu.pe',
    whatsapp: 'https://wa.me/5112024342',
  },
  virtualLibraryHours: 'Sala Zoom de la biblioteca virtual: L–V 7:00 a. m. – 6:00 p. m.; sábados 8:00 a. m. – 1:00 p. m.',
  officialSite: 'https://www.ucv.edu.pe/',
  campusPage: 'https://www.ucv.edu.pe/en/campus-ucv',
  libraryPage: 'https://www.ucv.edu.pe/en/information-centers',
} as const;

/** Carreras disponibles para filtrar publicaciones. */
export const CAREERS = [
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Arquitectura',
  'Medicina Humana',
  'Enfermería',
  'Psicología',
  'Derecho',
  'Administración',
  'Contabilidad',
  'Ciencias de la Comunicación',
  'Educación',
  'General / Interdisciplinario',
] as const;
