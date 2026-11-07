import React, { useEffect, useState } from 'react';
import { Download, FileText, FileImage, Lock, Loader2, Eye } from 'lucide-react';
import { AttachmentMeta, Publication } from '../types/exchange';
import { useExchange } from '../context/ExchangeContext';
import { getAttachmentBlob, downloadBlob, formatBytes, extensionOf } from '../utils/fileStore';
import { FileViewer, canPreview, IMAGE_EXT } from './FileViewer';

const isImage = (name: string) => IMAGE_EXT.includes(extensionOf(name));

const Thumb: React.FC<{ id: string; name: string; path?: string }> = ({ id, name, path }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    getAttachmentBlob({ id, path }).then((b) => {
      if (b) {
        u = URL.createObjectURL(b);
        setUrl(u);
      }
    });
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [id]);
  return url ? (
    <img src={url} alt={name} draggable={false} onContextMenu={(e) => e.preventDefault()} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
  ) : (
    <span className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
      <FileImage className="w-5 h-5 text-slate-400" />
    </span>
  );
};

/**
 * Lista de archivos adjuntos.
 * - Gratis: ver y descargar.
 * - Intercambio / Equipo: cualquiera con cuenta puede VER (vista previa), pero solo descarga
 *   cuando el autor acepta su solicitud.
 */
export const AttachmentList: React.FC<{ pub: Publication; onNeedRequest: () => void }> = ({ pub, onNeedRequest }) => {
  const { canDownload, openAuth, recordResourceOpen, isLoggedIn, currentUser, isCreatorOrAdmin } = useExchange();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AttachmentMeta | null>(null);
  const files = pub.attachments || [];
  if (files.length === 0) return null;

  const access = canDownload(pub);
  const free = pub.exchangeType === 'Gratuito / RSU';
  const isAuthor = Boolean(currentUser && pub.author.id === currentUser.id);
  // El autor y los administradores ven todo; se les avisa para que no se confundan.
  const privileged: 'autor' | 'administrador' | null = free ? null : isAuthor ? 'autor' : isCreatorOrAdmin ? 'administrador' : null;

  const download = async (f: AttachmentMeta) => {
    setBusy(f.id);
    setMsg(null);
    const blob = await getAttachmentBlob(f);
    if (!blob) {
      setBusy(null);
      setMsg('No se pudo obtener el archivo. Revisa tu conexión e inténtalo otra vez.');
      return;
    }
    const res = await downloadBlob(blob, f.name);
    setBusy(null);
    if (res === 'saved') recordResourceOpen(pub.id);
    if (res === 'error') setMsg('No se pudo descargar el archivo.');
  };

  const view = (f: AttachmentMeta) => {
    if (!isLoggedIn) {
      openAuth('login');
      return;
    }
    setViewing(f);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">Archivos ({files.length})</h3>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${free ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {free ? 'Descarga gratuita' : privileged ? 'Intercambio · tú ves todo' : access.allowed ? 'Intercambio aceptado' : 'Vista previa parcial · intercambio'}
        </span>
      </div>

      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white">
            {isImage(f.name) && access.allowed ? (
              <Thumb id={f.id} name={f.name} path={f.path} />
            ) : (
              <span className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-black uppercase">
                {extensionOf(f.name) || <FileText className="w-5 h-5" />}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{f.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
            </div>
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto sm:ml-auto">
              {canPreview(f.name) && (
                <button
                  type="button"
                  onClick={() => view(f)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-300 hover:border-red-500 hover:text-red-700 text-slate-800 text-xs font-bold transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
              )}
              {access.allowed ? (
                <button
                  type="button"
                  onClick={() => download(f)}
                  disabled={busy === f.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-bold transition"
                >
                  {busy === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Descargar
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400" title="La descarga se habilita cuando el autor acepta tu solicitud">
                  <Lock className="w-3.5 h-3.5" /> Descarga bloqueada
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {privileged && (
        <p className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
          Como {privileged === 'autor' ? 'autor' : 'administrador'} ves y descargas todo. Los demás solo ven las primeras hojas (el resto borroso) y no pueden descargar hasta que aceptes su solicitud. Usa <b>Ver → Ver como los demás</b> para comprobarlo.
        </p>
      )}
      {!access.allowed && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
          <span>
            {access.reason === 'login' && 'Inicia sesión para ver estos archivos.'}
            {access.reason === 'request' && 'Puedes ver solo las primeras hojas en vista previa; el resto está borroso y bloqueado. Para ver todo y descargar, envía una solicitud de intercambio y espera a que el autor la acepte.'}
            {access.reason === 'pending' && 'Puedes ver las primeras hojas en vista previa. Tu solicitud está pendiente: podrás ver todo y descargar cuando el autor la acepte.'}
          </span>
          {access.reason === 'login' && (
            <button type="button" onClick={() => openAuth('login')} className="font-bold text-amber-950 underline">Iniciar sesión</button>
          )}
          {access.reason === 'request' && (
            <button type="button" onClick={onNeedRequest} className="font-bold text-amber-950 underline">Solicitar intercambio</button>
          )}
        </div>
      )}
      {msg && <p className="text-xs text-red-700">{msg}</p>}

      {viewing && (
        <FileViewer
          file={viewing}
          allowDownload={access.allowed}
          privileged={privileged}
          onClose={() => setViewing(null)}
          onDownloaded={() => recordResourceOpen(pub.id)}
        />
      )}
    </section>
  );
};
