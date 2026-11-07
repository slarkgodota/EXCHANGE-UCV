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

const block = (e: { preventDefault: () => void }) => e.preventDefault();

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

const PdfPages: React.FC<{ blob: Blob; onError: (m: string) => void }> = ({ blob, onError }) => {
  const box = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let doc: any = null;
    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const data = new Uint8Array(await blob.arrayBuffer());
        doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
        const total = Math.min(doc.numPages, MAX_PREVIEW_PAGES);
        setInfo({ done: 0, total: doc.numPages });
        const width = Math.min((box.current?.clientWidth || 800) - 8, 1000);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let i = 1; i <= total; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width;
          canvas.height = vp.height;
          canvas.style.width = '100%';
          canvas.className = 'block bg-white shadow-md rounded-sm';
          canvas.setAttribute('aria-label', `Página ${i}`);
          canvas.oncontextmenu = (e) => e.preventDefault();
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
          if (cancelled) return;
          box.current?.appendChild(canvas);
          setInfo({ done: i, total: doc.numPages });
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
  }, [blob]);

  return (
    <div>
      <div ref={box} className="flex flex-col gap-4 items-stretch" />
      {info && info.done < Math.min(info.total, MAX_PREVIEW_PAGES) && (
        <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando página {info.done + 1} de {info.total}…
        </p>
      )}
      {info && info.total > MAX_PREVIEW_PAGES && info.done === MAX_PREVIEW_PAGES && (
        <p className="mt-4 text-center text-xs text-slate-500">
          La vista previa muestra las primeras {MAX_PREVIEW_PAGES} de {info.total} páginas.
        </p>
      )}
    </div>
  );
};

/**
 * Visor de archivos. Si `allowDownload` es falso (publicación por intercambio sin solicitud aceptada)
 * se muestra solo la vista previa, sin botón de descarga, sin clic derecho y con marca de agua.
 */
export const FileViewer: React.FC<{
  file: AttachmentMeta;
  allowDownload: boolean;
  onClose: () => void;
  onDownloaded?: () => void;
}> = ({ file, allowDownload, onClose, onDownloaded }) => {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const ext = extensionOf(file.name);

  useEffect(() => {
    let url: string | null = null;
    let alive = true;
    getAttachmentBlob(file).then(async (b) => {
      if (!alive) return;
      if (!b) {
        setError('No se pudo obtener el archivo. Revisa tu conexión e inténtalo otra vez.');
        return;
      }
      setBlob(b);
      if (IMAGE_EXT.includes(ext)) {
        url = URL.createObjectURL(b);
        setImgUrl(url);
      } else if (TEXT_EXT.includes(ext)) {
        const t = await b.text();
        if (alive) setText(t.length > 100000 ? t.slice(0, 100000) + '\n…' : t);
      }
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // Evita Ctrl+S / Ctrl+P mientras se ve un archivo que no se puede descargar.
      if (!allowDownload && (e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      window.removeEventListener('keydown', onKey);
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id]);

  const download = async () => {
    if (!blob) return;
    setSaving(true);
    const res = await downloadBlob(blob, file.name);
    setSaving(false);
    if (res === 'saved') onDownloaded?.();
  };

  const viewOnly = !allowDownload;

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
            {formatBytes(file.size)} · {viewOnly ? 'Solo vista previa' : 'Puedes descargar este archivo'}
          </p>
        </div>
        {viewOnly ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
            <Lock className="w-3.5 h-3.5" /> Descarga al aceptar el intercambio
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
            <PdfPages blob={blob} onError={setError} />
          ) : imgUrl ? (
            <img src={imgUrl} alt={file.name} draggable={false} className="block mx-auto max-h-[80vh] w-auto max-w-full rounded-lg bg-white" />
          ) : text !== null ? (
            <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed bg-white text-slate-800 p-5 rounded-lg font-mono">{text}</pre>
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
