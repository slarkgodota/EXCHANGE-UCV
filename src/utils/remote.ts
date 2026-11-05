/**
 * Conexión con la base de datos compartida (Supabase).
 *
 * La URL y la clave pública se leen de `public/config.js`, así se pueden poner o
 * cambiar sin volver a compilar la página. Si están vacías, la página funciona como
 * antes: todo se guarda solo en el navegador.
 *
 * Se usa la API REST de Supabase directamente con fetch (no hace falta instalar nada).
 */

interface ExchangeConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

const cfg: ExchangeConfig = (typeof window !== 'undefined' && (window as any).EXCHANGE_CONFIG) || {};
const URL_BASE = (cfg.supabaseUrl || '').trim().replace(/\/+$/, '');
const KEY = (cfg.supabaseAnonKey || '').trim();

export const isRemoteEnabled = (): boolean => Boolean(URL_BASE && KEY);

export const BUCKET = 'adjuntos';

// Las claves nuevas (sb_publishable_…) no son JWT: van solo en "apikey".
// Las claves antiguas (eyJ…) se envían también como Authorization.
const headers = (extra: Record<string, string> = {}): Record<string, string> => ({
  apikey: KEY,
  ...(KEY.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {}),
  ...extra,
});

async function ok(res: Response) {
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const b = await res.json();
      msg = b.message || b.error || b.msg || msg;
    } catch {
      /* ignore */
    }
    throw new Error(`Base de datos: ${msg}`);
  }
  return res;
}

export interface RemoteRow {
  collection: string;
  id: string;
  data: any;
}

/** Trae todas las filas de la tabla `items` (todas las colecciones). */
export async function fetchAll(): Promise<RemoteRow[]> {
  const out: RemoteRow[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const res = await ok(
      await fetch(`${URL_BASE}/rest/v1/items?select=collection,id,data&order=collection.asc,id.asc`, {
        headers: headers({ Range: `${from}-${from + page - 1}`, 'Range-Unit': 'items' }),
      })
    );
    const rows: RemoteRow[] = await res.json();
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

export async function upsertRows(collection: string, items: { id: string }[]): Promise<void> {
  if (items.length === 0) return;
  const body = items.map((it) => ({ collection, id: it.id, data: it, updated_at: new Date().toISOString() }));
  await ok(
    await fetch(`${URL_BASE}/rest/v1/items?on_conflict=collection,id`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(body),
    })
  );
}

export async function deleteRows(collection: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const list = ids.map((i) => `"${i.replace(/"/g, '')}"`).join(',');
  await ok(
    await fetch(`${URL_BASE}/rest/v1/items?collection=eq.${encodeURIComponent(collection)}&id=in.(${encodeURIComponent(list)})`, {
      method: 'DELETE',
      headers: headers({ Prefer: 'return=minimal' }),
    })
  );
}

/** Llama a una función SQL (registro, inicio de sesión, cambio de contraseña). */
export async function rpc<T = any>(fn: string, args: Record<string, unknown>): Promise<T> {
  const res = await ok(
    await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(args),
    })
  );
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function uploadFile(path: string, blob: Blob): Promise<void> {
  await ok(
    await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': blob.type || 'application/octet-stream', 'x-upsert': 'true' }),
      body: blob,
    })
  );
}

export async function downloadFile(path: string): Promise<Blob> {
  const res = await ok(
    await fetch(`${URL_BASE}/storage/v1/object/public/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`)
  );
  return res.blob();
}

export async function removeFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ prefixes: paths }),
    });
  } catch {
    /* no es grave si el archivo queda */
  }
}

/** Nombre de archivo seguro para la ruta en el almacenamiento. */
export const safeName = (name: string) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
