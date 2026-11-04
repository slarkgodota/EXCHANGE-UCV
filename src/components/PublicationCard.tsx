import React from 'react';
import { ArrowUpRight, BadgeCheck, Paperclip } from 'lucide-react';
import { Publication } from '../types/exchange';
import { useExchange } from '../context/ExchangeContext';
import { Avatar } from './Avatar';
import { StarDisplay } from './StarRating';
import { getCampusLabel } from '../data/ucv';
import { INTENT_LABELS } from '../data/catalog';

const CAT = {
  materiales: { label: 'Materiales', cls: 'bg-red-50 text-red-700' },
  conocimientos: { label: 'Conocimientos', cls: 'bg-blue-50 text-blue-700' },
  investigacion: { label: 'Investigación', cls: 'bg-emerald-50 text-emerald-700' },
};

export const PublicationCard: React.FC<{ publication: Publication; index?: number }> = ({ publication: p, index = 0 }) => {
  const { setSelectedPublication } = useExchange();
  const intent = p.intent || 'ofrezco';
  const cat = CAT[p.category];

  return (
    <article
      style={{ '--i': index } as React.CSSProperties}
      className="lift group relative min-w-0 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col cursor-pointer"
      onClick={() => setSelectedPublication(p)}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cat.cls}`}>{cat.label}</span>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${intent === 'busco' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
          {INTENT_LABELS[p.category][intent].badge}
        </span>
        {p.status === 'destacado' && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-950">★ Destacado</span>}
      </div>

      <h3 className="font-display text-lg font-bold text-slate-900 leading-snug mt-4 group-hover:text-red-700 transition-colors">{p.title}</h3>
      <p className="text-xs text-slate-500 mt-1">
        {p.course}
        {p.resourceType ? ` · ${p.resourceType}` : ''}
      </p>
      <p className="text-sm text-slate-600 mt-3 line-clamp-2 flex-1">{p.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <StarDisplay value={p.ratingAverage} count={p.ratingCount} />
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${p.exchangeType === 'Gratuito / RSU' ? 'text-emerald-700' : 'text-amber-700'}`}>
          {(p.attachments?.length || 0) > 0 && (
            <>
              <Paperclip className="w-3.5 h-3.5" /> {p.attachments!.length} ·
            </>
          )}
          {p.exchangeType === 'Gratuito / RSU' ? 'Gratis' : p.exchangeType === 'Colaboración en Equipo' ? 'Equipo' : 'Intercambio'}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={p.author.name} src={p.author.avatar} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1">
              {p.author.name}
              {p.author.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{getCampusLabel(p.author.campus)}</p>
          </div>
        </div>
        <span className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-red-600 group-hover:text-white text-slate-600 flex items-center justify-center transition shrink-0">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
};
