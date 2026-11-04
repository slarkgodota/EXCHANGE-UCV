import React, { useMemo, useState } from 'react';
import { ExternalLink, Search, ChevronDown } from 'lucide-react';
import { LIBRARY_RESOURCES, LIBRARY_SECTIONS, LibrarySection as SectionId, LibraryResource } from '../data/library';
import { useExchange } from '../context/ExchangeContext';
import { StarDisplay, StarInput } from './StarRating';
import { normalizeText } from '../utils/exchangeLogic';

const ResourceCard: React.FC<{ r: LibraryResource; index: number }> = ({ r, index }) => {
  const { libraryRatings, rateLibraryResource, currentUser, openAuth } = useExchange();
  const [expanded, setExpanded] = useState(false);
  const votes = Object.values(libraryRatings[r.id] || {});
  const avg = votes.length ? votes.reduce((a, b) => a + b, 0) / votes.length : 0;
  const mine = currentUser ? libraryRatings[r.id]?.[currentUser.id] || 0 : 0;

  return (
    <article
      style={{ '--i': index } as React.CSSProperties}
      className="lift min-w-0 break-words bg-white rounded-3xl border border-slate-200 p-6 flex flex-col"
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-red-600">{r.provider}</p>
      <h3 className="font-display text-lg font-bold text-slate-900 leading-snug mt-1">{r.title}</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-1">{r.description}</p>

      {r.topics && (
        <div className="mt-3">
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
            {expanded ? 'Ocultar temas' : `Ver ${r.topics.length} temas y fuentes`}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <div className="view-enter mt-2 space-y-3">
              <ul className="space-y-1 text-sm text-slate-700">
                {r.topics.map((t) => (
                  <li key={t} className="flex gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-red-500 shrink-0" />{t}</li>
                ))}
              </ul>
              <div className="space-y-1">
                {r.references?.map((ref) =>
                  ref.url ? (
                    <a key={ref.label} href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5 text-sm text-blue-700 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {ref.label}
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <StarDisplay value={avg} count={votes.length} />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {currentUser ? (
              <>
                <span>{mine ? 'Tu voto:' : 'Valorar:'}</span>
                <StarInput value={mine} onChange={(v) => rateLibraryResource(r.id, v)} size="sm" label={`Valorar ${r.title}`} />
              </>
            ) : (
              <button type="button" onClick={() => openAuth('login')} className="hover:text-red-600 underline">
                Inicia sesión para valorar
              </button>
            )}
          </div>
        </div>
        {r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 hover:bg-red-600 text-white transition"
          >
            Abrir <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </article>
  );
};

/** Vista Biblioteca */
export const LibrarySection: React.FC = () => {
  const [section, setSection] = useState<'todas' | SectionId>('todas');
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = normalizeText(query);
    return LIBRARY_RESOURCES.filter((r) => {
      if (section !== 'todas' && r.section !== section) return false;
      if (!q) return true;
      return normalizeText([r.title, r.provider, r.description, ...r.tags, ...(r.topics || [])].join(' ')).includes(q);
    });
  }, [section, query]);

  return (
    <div className="space-y-8">
      <header className="reveal-1 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Biblioteca</h1>
          <p className="text-slate-500 mt-2 max-w-lg">Recursos oficiales y gratuitos: biblioteca UCV, repositorios peruanos, normas técnicas y guías de estudio.</p>
        </div>
        <label className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            id="lib-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la biblioteca"
            className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-red-500/15 focus:border-red-400 focus:outline-none transition"
          />
        </label>
      </header>

      <div className="reveal-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist">
        {[{ id: 'todas' as const, label: 'Todo' }, ...LIBRARY_SECTIONS].map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            onClick={() => setSection(s.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              section === s.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-slate-500 py-16">No encontramos recursos para “{query}”.</p>
      ) : (
        <div key={section + query} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {items.map((r, i) => (
            <ResourceCard key={r.id} r={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
