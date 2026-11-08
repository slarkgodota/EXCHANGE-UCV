/**
 * Carga three.js (motor 3D) solo cuando se va a mostrar una escena 3D.
 * En GitHub Pages config.js apunta a la copia incluida (vendor/three); si no, se usa jsDelivr.
 */
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';

let lib: Promise<any> | null = null;

export function loadThree(): Promise<any> {
  if (!lib) {
    const cfg = ((window as any).EXCHANGE_CONFIG || {}) as { threeUrl?: string };
    const url = new URL(cfg.threeUrl || CDN, document.baseURI).href;
    lib = import(/* @vite-ignore */ url).catch((e) => {
      lib = null;
      throw e;
    });
  }
  return lib;
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
