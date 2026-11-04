/**
 * Almacén de archivos adjuntos en IndexedDB (admite archivos de varios MB,
 * a diferencia de localStorage). Si IndexedDB no está disponible se usa memoria.
 */

const DB_NAME = 'exchange_ucv_files';
const STORE = 'files';

export const MAX_FILE_MB = 10;
export const MAX_FILES = 3;
export const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'docx', 'pptx', 'xlsx', 'zip', 'txt', 'csv'];
export const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => '.' + e).join(',');

const memory = new Map<string, Blob>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        if (!db) return resolve(undefined);
        try {
          const r = run(db.transaction(STORE, mode).objectStore(STORE));
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        } catch (e) {
          reject(e);
        }
      })
  );
}

export async function putFile(id: string, blob: Blob): Promise<void> {
  memory.set(id, blob);
  try {
    await tx('readwrite', (s) => s.put(blob, id));
  } catch (e) {
    console.warn('No se pudo guardar el archivo en IndexedDB; queda solo en memoria.', e);
  }
}

export async function getFile(id: string): Promise<Blob | undefined> {
  if (memory.has(id)) return memory.get(id);
  try {
    const b = await tx<Blob>('readonly', (s) => s.get(id) as IDBRequest<Blob>);
    if (b) memory.set(id, b);
    return b;
  } catch {
    return undefined;
  }
}

export async function deleteFile(id: string): Promise<void> {
  memory.delete(id);
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}

export async function clearFiles(): Promise<void> {
  memory.clear();
  try {
    await tx('readwrite', (s) => s.clear());
  } catch {
    /* ignore */
  }
}

export function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function validateFile(f: File): string | null {
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(f.name))) {
    return `"${f.name}": formato no permitido. Usa PDF, imagen, Word, PowerPoint, Excel, ZIP, TXT o CSV.`;
  }
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `"${f.name}" supera los ${MAX_FILE_MB} MB.`;
  if (f.size === 0) return `"${f.name}" está vacío.`;
  return null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Descarga un archivo. Dentro de un visor que bloquea descargas directas usa la
 * capacidad "downloads" del visor; en un navegador normal usa un enlace temporal.
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<'saved' | 'declined' | 'error'> {
  const w = window as any;
  if (w.claude?.use) {
    try {
      const dl = await w.claude.use('downloads');
      if (dl) {
        await dl.save({ filename, data: blob });
        return 'saved';
      }
    } catch (e: any) {
      if (e?.code === 'declined') return 'declined';
    }
  }
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return 'saved';
  } catch {
    return 'error';
  }
}
