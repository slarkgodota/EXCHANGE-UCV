import React, { useEffect, useState } from 'react';
import { Download, FileText, FileImage, Lock, Loader2 } from 'lucide-react';
import { Publication } from '../types/exchange';
import { useExchange } from '../context/ExchangeContext';
import { getFile, downloadBlob, formatBytes, extensionOf } from '../utils/fileStore';

const isImage = (name: string) => ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extensionOf(name));

const Thumb: React.FC<{ id: string; name: string }> = ({ id, name }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    getFile(id).then((b) => {
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
    <img src={url} alt={name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
  ) : (
    <span className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
      <FileImage className="w-5 h-5 text-slate-400" />
    </span>
  );
};

/** Lista de archivos adjuntos con descarga según el tipo de acceso. */
export const AttachmentList: React.FC<{ pub: Publication; onNeedRequest: () => void }> = ({ pub, onNeedRequest }) => {
  const { canDownload, openAuth, recordResourceOpen } = useExchange();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const files = pub.attachments || [];
  if (files.length === 0) return null;

  const access = canDownload(pub);
  const free = pub.exchangeType === 'Gratuito / RSU';

  const download = async (id: string, name: string) => {
    setBusy(id);
    setMsg(null);
    const blob = await getFile(id);
    if (!blob) {
      setBusy(null);
      setMsg('Este archivo no está disponible en este dispositivo.');
      return;
    }
    const res = await downloadBlob(blob, name);
    setBusy(null);
    if (res === 'saved') recordResourceOpen(pub.id);
    if (res === 'error') setMsg('No se pudo descargar el archivo.');
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">Archivos ({files.length})</h3>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${free ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {free ? 'Descarga gratuita' : 'Descarga por intercambio'}
        </span>
      </div>

      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white">
            {isImage(f.name) && access.allowed ? (
              <Thumb id={f.id} name={f.name} />
            ) : (
              <span className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-[10px] font-black uppercase">
                {extensionOf(f.name) || <FileText className="w-5 h-5" />}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{f.name}</p>
              <p className="text-xs text-slate-500">{formatBytes(f.size)}</p>
            </div>
            {access.allowed ? (
              <button
                type="button"
                onClick={() => download(f.id, f.name)}
                disabled={busy === f.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-bold transition"
              >
                {busy === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Descargar
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                <Lock className="w-3.5 h-3.5" /> Bloqueado
              </span>
            )}
          </li>
        ))}
      </ul>

      {!access.allowed && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
          <span>
            {access.reason === 'login' && 'Inicia sesión para descargar estos archivos.'}
            {access.reason === 'request' && 'Envía una solicitud de intercambio. Podrás descargar cuando el autor la acepte.'}
            {access.reason === 'pending' && 'Tu solicitud está pendiente. Podrás descargar cuando el autor la acepte.'}
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
    </section>
  );
};
