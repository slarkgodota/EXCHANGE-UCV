// Configuración de la base de datos compartida (Supabase).
// Supabase → Project Settings → API. Usa SOLO la clave pública (publishable / anon).
// Nunca pongas aquí la clave "service_role" ni la clave secreta.
window.EXCHANGE_CONFIG = {
  supabaseUrl: 'https://gunidbodtkfzzkymfauu.supabase.co',
  supabaseAnonKey: 'sb_publishable_b5XIebqq5F4xTq-Jj1MXRA_9CnFCOIx',
  // Visor de PDF (pdf.js) incluido en la página para la vista previa de archivos.
  pdfjsUrl: 'vendor/pdfjs/pdf.mjs',
  pdfjsWorkerUrl: 'vendor/pdfjs/pdf.worker.mjs',
  // Motor 3D (three.js) para los cuartos de cada carrera.
  threeUrl: 'vendor/three/three.module.min.js',
};
