import React, { useState } from 'react';
import { CornerDownRight, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { Publication, Review } from '../types/exchange';
import { LevelBadge } from './LevelBadge';

const when = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Respuestas debajo de un comentario + caja para responder. */
export const ReviewReplies: React.FC<{ pub: Publication; review: Review }> = ({ pub, review }) => {
  const { replies, addReply, deleteReply, currentUser, isCreatorOrAdmin, openAuth } = useExchange();
  const list = replies.filter((r) => r.reviewId === review.id);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addReply(pub.id, review.id, text);
    if (!res.ok) {
      setError(res.error || 'No se pudo enviar.');
      return;
    }
    setText('');
    setError(null);
    setOpen(false);
  };

  return (
    <div className="pl-9 space-y-2">
      {list.length > 0 && (
        <ul className="space-y-2 border-l-2 border-slate-100 pl-3">
          {list.map((r) => {
            const isPubAuthor = r.authorId === pub.author.id;
            const canDelete = currentUser && (r.authorId === currentUser.id || isCreatorOrAdmin);
            return (
              <li key={r.id} className="text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-800">{r.authorName}</span>
                  {isPubAuthor && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Autor</span>}
                  <LevelBadge userId={r.authorId} showName={false} />
                  <span className="text-[10px] text-slate-400">{when(r.createdAt)}</span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmId === r.id) deleteReply(r.id);
                        else setConfirmId(r.id);
                      }}
                      onBlur={() => setConfirmId(null)}
                      className={`ml-auto inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${confirmId === r.id ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-red-600'}`}
                      aria-label="Eliminar respuesta"
                    >
                      <Trash2 className="w-3 h-3" /> {confirmId === r.id ? '¿Eliminar?' : ''}
                    </button>
                  )}
                </div>
                <p className="mt-0.5 pl-5 text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{r.text}</p>
              </li>
            );
          })}
        </ul>
      )}

      {open ? (
        <form onSubmit={send} className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={2}
            autoFocus
            placeholder={`Responder a ${review.authorName}…`}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
            aria-label={`Responder a ${review.authorName}`}
          />
          {error && <p className="text-[11px] text-red-700">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <span className="mr-auto text-[10px] text-slate-400">{text.length}/500</span>
            <button type="button" onClick={() => { setOpen(false); setError(null); }} className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-600 text-white text-xs font-bold">
              <Send className="w-3.5 h-3.5" /> Responder
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => (currentUser ? setOpen(true) : openAuth('login'))}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-700"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Responder{list.length > 0 ? ` (${list.length})` : ''}
        </button>
      )}
    </div>
  );
};
