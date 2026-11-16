import { pathFromPublicUrl } from './remote';

/**
 * Fotos de perfil y portadas.
 * La imagen se vuelve a dibujar en un canvas: así se recorta, se achica y se le quitan
 * los datos ocultos (ubicación GPS, cámara…). Nunca se guarda el archivo original.
 */

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const IMAGE_SPECS = {
  avatar: { w: 320, h: 320, quality: 0.86 },
  cover: { w: 1920, h: 800, quality: 0.84 },
} as const;
export type ImageKind = keyof typeof IMAGE_SPECS;

export function checkImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Usa una imagen JPG, PNG, WebP o GIF.';
  if (file.size > MAX_IMAGE_BYTES) return 'La imagen pesa más de 8 MB.';
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = url;
  });
}

/** Recorta tipo "cover" (centrado; `focusY` 0 = arriba, 1 = abajo) y comprime. */
export async function processImage(file: File, kind: ImageKind, focusY = 0.5): Promise<{ blob: Blob; dataUrl: string }> {
  const err = checkImageFile(file);
  if (err) throw new Error(err);
  const img = await loadImage(file);
  const { w, h, quality } = IMAGE_SPECS[kind];
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = Math.max(0, Math.min(img.naturalHeight - sh, (img.naturalHeight - sh) * focusY));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no puede procesar imágenes.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  const toBlob = (type: string) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));
  let blob = await toBlob('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg'); // Safari no exporta WebP
  if (!blob) throw new Error('No se pudo comprimir la imagen.');
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error('No se pudo leer la imagen.'));
    r.readAsDataURL(blob!);
  });
  return { blob, dataUrl };
}

/** Solo se muestran imágenes https o comprimidas por la app (data:image/…). */
export function safeImageSrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (/^data:image\/(webp|jpeg|png|gif);base64,/.test(src)) return src;
  if (/^https:\/\//i.test(src)) return src;
  if (pathFromPublicUrl(src)) return src; // nuestro almacenamiento (también en pruebas locales)
  if (/^\/?assets\//.test(src)) return src;
  return undefined;
}
