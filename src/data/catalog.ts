/**
 * Opciones del catálogo según el documento del proyecto (secciones 7 y 8 del PDF).
 */

/** "Ofrecer ayuda … o solicitar apoyo para aprender" (sección 8). */
export const INTENTS = ['ofrezco', 'busco'] as const;
export type PublicationIntent = (typeof INTENTS)[number];

/** "Resúmenes, apuntes, presentaciones y mapas conceptuales" (sección 8) */
export const RESOURCE_TYPES = [
  'Resumen',
  'Apuntes',
  'Presentación',
  'Mapa conceptual',
  'Guía de estudio',
  'Ejercicios resueltos',
  'Asesoría / tutoría',
  'Proyecto de investigación',
  'Otro',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const INTENT_LABELS: Record<'materiales' | 'conocimientos' | 'investigacion', Record<PublicationIntent, { label: string; hint: string; badge: string }>> = {
  materiales: {
    ofrezco: { label: 'Comparto un material', hint: 'Subes o enlazas un recurso propio', badge: 'Comparte' },
    busco: { label: 'Busco un material', hint: 'Pides un resumen, apuntes o guía', badge: 'Busca' },
  },
  conocimientos: {
    ofrezco: { label: 'Ofrezco ayuda', hint: 'Enseñas un tema que dominas', badge: 'Ofrece ayuda' },
    busco: { label: 'Necesito apoyo', hint: 'Pides ayuda para aprender un tema', badge: 'Pide apoyo' },
  },
  investigacion: {
    ofrezco: { label: 'Tengo un proyecto', hint: 'Buscas compañeros para tu idea', badge: 'Busca integrantes' },
    busco: { label: 'Quiero unirme', hint: 'Buscas un equipo al cual sumarte', badge: 'Quiere unirse' },
  },
};

export const DEFAULT_RESOURCE_TYPE: Record<'materiales' | 'conocimientos' | 'investigacion', ResourceType> = {
  materiales: 'Resumen',
  conocimientos: 'Asesoría / tutoría',
  investigacion: 'Proyecto de investigación',
};

/** Los 5 pasos de "¿Cómo funcionaría?" (sección 7 del PDF) */
export const HOW_IT_WORKS = [
  { title: 'Ingresar', text: 'Consulta las publicaciones disponibles, incluso sin cuenta.' },
  { title: 'Buscar', text: 'Filtra por carrera, curso, tema o tipo de recurso.' },
  { title: 'Publicar', text: 'Ofrece ayuda, comparte un material propio o busca compañeros para investigar.' },
  { title: 'Contactar', text: 'Envía una solicitud a quien publicó la oferta.' },
  { title: 'Coordinar', text: 'Acuerden cómo realizar el intercambio, respetando las normas académicas.' },
] as const;
