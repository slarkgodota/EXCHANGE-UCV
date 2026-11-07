import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Loader2, Eye, Lock, AlertCircle } from 'lucide-react';
import { AttachmentMeta } from '../types/exchange';
import { getAttachmentBlob, downloadBlob, extensionOf, formatBytes } from '../utils/fileStore';
import { loadPdfJs, MAX_PREVIEW_PAGES } from '../utils/pdfPreview';

export const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const TEXT_EXT = ['txt', 'csv'];
export const canPreview = (name: string) => {
  const e = extensionOf(name);
  return e === 'pdf' || IMAGE_EXT.includes(e) || TEXT_EXT.includes(e);
};

/** Hojas que se ven claras cuando el archivo es por intercambio y aún no se aceptó la solicitud. */
export const CLEAR_PAGES = 2;
/** Hojas borrosas que se muestran después de las claras (el resto solo se cuenta). */
const BLURRED_PAGES_SHOWN = 3;
/** En una imagen o un PDF de 1 hoja, qué parte de arriba se ve clara. */
const CLEAR_FRACTION = 0.4;
/** Líneas visibles de un .txt / .csv. */
const CLEAR_LINES = 25;

const block = (e: { preventDefault: () => void }) => e.preventDefault();

/**
 * Borra de verdad una zona del canvas: la reduce a muy pocos píxeles y la vuelve a agrandar con desenfoque.
 * Así el contenido original de esa zona ya no existe en la página (no se puede "quitar" el borroso).
 */
function censor(canvas: HTMLCanvasElement, fromY: number) {
  const w = canvas.width;
  const h = canvas.height - fromY;
  if (h <= 0) return;
  const ctx = canvas.getContext('2d')!;
  const tiny = document.createElement('canvas');
  tiny.width = Math.max(8, Math.round(w / 28));
  tiny.height = Math.max(8, Math.round(h / 28));
  tiny.getContext('2d')!.drawImage(canvas, 0, fromY, w, h, 0, 0, tiny.width, tiny.height);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, fromY, w, h);
  ctx.filter = 'blur(10px)';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, 0, fromY, w, h);
  ctx.restore();
}

/** Marca de agua repetida encima del contenido cuando solo se permite ver. */
const Watermark: React.FC<{ label: string }> = ({ label }) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='200'><text x='170' y='110' text-anchor='middle' transform='rotate(-24 170 100)' font-family='Arial,sans-serif' font-size='17' font-weight='900' letter-spacing='2' fill='rgba(15,23,42,0.14)'>${label.toUpperCase()}</text></svg>`;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
      style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundRepeat: 'repeat' }}
    />
  );
};

/** Aviso que va encima de una parte censurada. */
const LockedBadge: React.FC<{ text?: string }> = ({ text = 'Contenido bloqueado' }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <span className="inline-flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-slate-950/85 text-white text-center shadow-xl">
      <Lock className="w-5 h-5 text-amber-300" />
      <span className="text-sm font-bold">{text}</span>
      <span className="text-[11px] text-slate-300">Se desbloquea cuando el autor acepta tu solicitud de intercambio</span>
    </span>
  </div>
);

type PageItem = { n: number; canvas: HTMLCanvasElement; locked: boolean; partial: boolean };

const CanvasHost: React.FC<{ canvas: HTMLCanvasElement }> = ({ canvas }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.appendChild(canvas);
    return () => {
      canvas.remove();
    };
  }, [canvas]);
  return <div ref={ref} />;
};

const PdfPages: React.FC<{ blob: Blob; limited: boolean; onError: (m: string) => void }> = ({ blob, limited, onError }) => {
  const box = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [toRender, setToRender] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let doc: any = null;
    setPages([]);
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = new Uint8Array(await blob.arrayBuffer());
        doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
        const n = doc.numPages as number;
        setTotal(n);
        // Con intercambio sin aceptar: 1–2 hojas claras + unas pocas borrosas.
        const clear = limited ? Math.min(CLEAR_PAGES, n) : Math.min(n, MAX_PREVIEW_PAGES);
        const count = limited ? Math.min(n, clear + BLURRED_PAGES_SHOWN) : clear;
        setToRender(count);
        const width = Math.min((box.current?.clientWidth || 800) - 8, 1000);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let i = 1; i <= count; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const locked = limited && i > clear;
          // Las hojas bloqueadas se dibujan a muy baja resolución: aunque alguien quite el borroso, no hay nada legible.
          const scale = locked ? (90 / base.width) : (width / base.width) * ratio;
          const vp = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(vp.width);
          canvas.height = Math.round(vp.height);
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
          let out = canvas;
          let partial = false;
          if (locked) {
            out = document.createElement('canvas');
            out.width = Math.round(width);
            out.height = Math.round((width * canvas.height) / canvas.width);
            const ctx = out.getContext('2d')!;
            ctx.filter = 'blur(12px)';
            ctx.drawImage(canvas, 0, 0, out.width, out.height);
          } else if (limited && n === 1) {
            // Un PDF de una sola hoja: se ve la parte de arriba y el resto censurado.
            censor(canvas, Math.round(canvas.height * CLEAR_FRACTION));
            partial = true;
          }
          out.style.width = '100%';
          out.className = 'block bg-white shadow-md rounded-sm';
          out.setAttribute('aria-label', locked ? `Página ${i} (bloqueada)` : `Página ${i}`);
          out.oncontextmenu = (e) => e.preventDefault();
          if (cancelled) return;
          setPages((prev) => [...prev, { n: i, canvas: out, locked, partial }]);
        }
      } catch (e) {
        console.warn('Vista previa PDF', e);
        if (!cancelled) onError('No se pudo mostrar la vista previa de este PDF.');
      }
    })();
    return () => {
      cancelled = true;
      doc?.destroy?.();
    };
  }, [blob, limited]);

  const shownClear = pages.filter((p) => !p.locked).length;
  const hiddenRest = total !== null && limited ? total - Math.min(total, CLEAR_PAGES + BLURRED_PAGES_SHOWN) : 0;

  return (
    <div ref={box}>
      {limited && total !== null && total > 1 && (
        <p className="mb-3 text-center text-xs font-semibold text-amber-200">
          Vista previa: se ven {Math.min(CLEAR_PAGES, total)} de {total} hojas. El resto está bloqueado hasta que el autor acepte el intercambio.
        </p>
      )}
      <div className="flex flex-col gap-4 items-stretch">
        {pages.map((p) => (
          <div key={p.n} className="relative">
            <CanvasHost canvas={p.canvas} />
            {p.locked && <LockedBadge text={`Hoja ${p.n} bloqueada`} />}
            {p.partial && (
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-8" style={{ top: `${CLEAR_FRACTION * 100}%` }}>
                <LockedBadge text="Resto de la hoja bloqueado" />
              </div>
            )}
            {!p.locked && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/70 text-white">Hoja {p.n}{total ? ` de ${total}` : ''}</span>}
          </div>
        ))}
      </div>
      {pages.length < toRender && (
        <p className="mt-4 text-center text-xs text-slate-300 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando hoja {pages.length + 1}…
        </p>
      )}
      {limited && hiddenRest > 0 && pages.length === toRender && (
        <div className="mt-4 p-5 rounded-2xl bg-white/10 border border-white/15 text-center text-white">
          <Lock className="w-5 h-5 text-amber-300 mx-auto mb-1" />
          <p className="text-sm font-bold">+{hiddenRest} hojas más bloqueadas</p>
          <p className="text-[11px] text-slate-300">Solicita el intercambio para ver el documento completo.</p>
        </div>
      )}
      {!limited && total !== null && total > MAX_PREVIEW_PAGES && shownClear === MAX_PREVIEW_PAGES && (
        <p className="mt-4 text-center text-xs text-slate-300">
          La vista previa muestra las primeras {MAX_PREVIEW_PAGES} de {total} hojas. Descarga el archivo para verlo completo.
        </p>
      )}
    </div>
  );
};

/** Imagen: completa si se puede descargar; si no, la parte de abajo sale censurada. */
const ImagePreview: React.FC<{ blob: Blob; limited: boolean; name: string; onError: (m: string) => void }> = ({ blob, limited, name, onError }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let alive = true;
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const max = 1600;
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      if (limited) censor(c, Math.round(c.height * CLEAR_FRACTION));
      c.className = 'block mx-auto max-w-full h-auto max-h-[80vh] rounded-lg bg-white';
      c.setAttribute('aria-label', name);
      c.oncontextmenu = (e) => e.preventDefault();
      setCanvas(c);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (alive) onError('No se pudo mostrar esta imagen.');
    };
    img.src = url;
    return () => {
      alive = false;
    };
  }, [blob, limited]);
  if (!canvas) return null;
  return (
    <div className="relative w-fit mx-auto">
      <CanvasHost canvas={canvas} />
      {limited && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center" style={{ top: `${CLEAR_FRACTION * 100}%` }}>
          <LockedBadge text="Imagen parcialmente bloqueada" />
        </div>
      )}
    </div>
  );
};

/** Texto: unas líneas visibles y el resto reemplazado por relleno borroso (el texto real no se pone en la página). */
const TextPreview: React.FC<{ text: string; limited: boolean }> = ({ text, limited }) => {
  const lines = text.split(/\r?\n/);
  if (!limited || lines.length <= CLEAR_LINES) {
    if (limited && lines.length > 3) {
      const cut = Math.max(2, Math.floor(lines.length / 2));
      return <TextSplit visible={lines.slice(0, cut)} hidden={lines.slice(cut)} />;
    }
    return <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed bg-white text-slate-800 p-5 rounded-lg font-mono">{text}</pre>;
  }
  return <TextSplit visible={lines.slice(0, CLEAR_LINES)} hidden={lines.slice(CLEAR_LINES, CLEAR_LINES + 18)} more={lines.length - CLEAR_LINES} />;
};

const TextSplit: React.FC<{ visible: string[]; hidden: string[]; more?: number }> = ({ visible, hidden, more }) => {
  const filler = hidden.map((l) => l.replace(/[^\s]/g, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]));
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-800 px-5 pt-5 font-mono">{visible.join('\n')}</pre>
      <div className="relative">
        <pre aria-hidden className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-800 px-5 pb-5 font-mono blur-[5px] select-none min-h-[160px]">{filler.join('\n')}</pre>
        <LockedBadge text={more ? `${more} líneas bloqueadas` : 'Resto del archivo bloqueado'} />
      </div>
    </div>
  );
};

/**
 * Visor de archivos. Si `allowDownload` es falso (publicación por intercambio sin solicitud aceptada)
 * se ven solo las primeras hojas; el resto sale borroso/bloqueado, sin botón de descarga y con marca de agua.
 */
export const FileViewer: React.FC<{
  file: AttachmentMeta;
  allowDownload: boolean;
  onClose: () => void;
  onDownloaded?: () => void;
}> = ({ file, allowDownload, onClose, onDownloaded }) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const ext = extensionOf(file.name);
  const viewOnly = !allowDownload;

  useEffect(() => {
    let alive = true;
    getAttachmentBlob(file).then(async (b) => {
      if (!alive) return;
      if (!b) {
        setError('No se pudo obtener el archivo. Revisa tu conexión e inténtalo otra vez.');
        return;
      }
      setBlob(b);
      if (TEXT_EXT.includes(ext)) {
        const t = await b.text();
        if (alive) setText(t.length > 100000 ? t.slice(0, 100000) + '\n…' : t);
      }
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Evita Ctrl+S / Ctrl+P mientras se ve un archivo que no se puede descargar.
      if (viewOnly && (e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      window.removeEventListener('keydown', onKey);
    };
  }, [file.id]);

  const download = async () => {
    if (!blob) return;
    setSaving(true);
    const res = await downloadBlob(blob, file.name);
    setSaving(false);
    if (res === 'saved') onDownloaded?.();
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-sm flex flex-col animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${file.name}`}
      onContextMenu={viewOnly ? block : undefined}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-slate-950 text-white">
        <Eye className="w-4 h-4 text-red-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{file.name}</p>
          <p className="text-[11px] text-slate-400">
            {formatBytes(file.size)} · {viewOnly ? 'Vista previa parcial' : 'Puedes descargar este archivo'}
          </p>
        </div>
        {viewOnly ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
            <Lock className="w-3.5 h-3.5" /> Completo y descarga al aceptar el intercambio
          </span>
        ) : (
          <button
            type="button"
            onClick={download}
            disabled={!blob || saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-slate-900 hover:bg-red-600 hover:text-white disabled:opacity-60 text-xs font-bold transition"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Descargar
          </button>
        )}
        <button type="button" onClick={onClose} aria-label="Cerrar vista previa" className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div
          className={`relative mx-auto max-w-4xl ${viewOnly ? 'select-none' : ''}`}
          onDragStart={viewOnly ? block : undefined}
          onCopy={viewOnly ? block : undefined}
        >
          {error ? (
            <div className="mx-auto max-w-md mt-10 p-5 rounded-2xl bg-white text-center text-sm text-slate-700">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              {error}
            </div>
          ) : !blob ? (
            <p className="mt-16 text-center text-sm text-slate-300 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Abriendo archivo…
            </p>
          ) : ext === 'pdf' ? (
            <PdfPages blob={blob} limited={viewOnly} onError={setError} />
          ) : IMAGE_EXT.includes(ext) ? (
            <ImagePreview blob={blob} limited={viewOnly} name={file.name} onError={setError} />
          ) : text !== null ? (
            <TextPreview text={text} limited={viewOnly} />
          ) : (
            <div className="mx-auto max-w-md mt-10 p-5 rounded-2xl bg-white text-center text-sm text-slate-700">
              La vista previa no está disponible para archivos .{ext}.
            </div>
          )}
          {viewOnly && blob && !error && <Watermark label="Vista previa · Exchange UCV" />}
        </div>
      </div>
    </div>
  );
};
