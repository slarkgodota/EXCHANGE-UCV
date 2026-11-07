/**
 * Carga pdf.js solo cuando alguien abre la vista previa de un PDF.
 * Por defecto lo trae de cdnjs; en GitHub Pages config.js apunta a una copia local
 * (window.EXCHANGE_CONFIG.pdfjsUrl / pdfjsWorkerUrl) para no depender de otro sitio.
 */
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/';

let lib: Promise<any> | null = null;

export function loadPdfJs(): Promise<any> {
  if (!lib) {
    const cfg = ((window as any).EXCHANGE_CONFIG || {}) as { pdfjsUrl?: string; pdfjsWorkerUrl?: string };
    const url = new URL(cfg.pdfjsUrl || CDN + 'pdf.min.mjs', document.baseURI).href;
    const worker = new URL(cfg.pdfjsWorkerUrl || CDN + 'pdf.worker.min.mjs', document.baseURI).href;
    lib = import(/* @vite-ignore */ url)
      .then((m) => {
        m.GlobalWorkerOptions.workerSrc = worker;
        return m;
      })
      .catch((e) => {
        lib = null;
        throw e;
      });
  }
  return lib;
}

/** Máximo de páginas que se dibujan en la vista previa (para no trabar celulares). */
export const MAX_PREVIEW_PAGES = 40;
