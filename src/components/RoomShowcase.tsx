import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';
import { ROOMS, ROOM_BY_ID, RoomId, roomForCareer } from '../data/rooms';
import { RoomCanvas } from './RoomCanvas';
import { activeRoomFor } from '../data/roomThemes';

const AUTO_MS = 7000;

/** Portada: los cuartos 3D van cambiando solos; se puede elegir uno y saltar al catálogo de esa carrera. */
export const HeroRooms: React.FC = () => {
  const { currentUser, setFilter, filter } = useExchange();
  const inside = activeRoomFor(filter);
  const order = useMemo<RoomId[]>(() => {
    const mine = inside ?? roomForCareer(currentUser?.career);
    const ids = ROOMS.map((r) => r.id);
    return mine ? [mine, ...ids.filter((i) => i !== mine)] : ids;
  }, [currentUser?.career, inside]);
  const [idx, setIdx] = useState(0);
  // Al entrar a otro cuarto, el carrusel empieza por ese cuarto
  useEffect(() => setIdx(0), [inside]);
  const [pausedUntil, setPausedUntil] = useState(0);
  const room = order[idx % order.length];
  const meta = ROOM_BY_ID[room];

  useEffect(() => {
    const wait = Math.max(AUTO_MS, pausedUntil - Date.now());
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % order.length), wait);
    return () => window.clearTimeout(id);
  }, [idx, pausedUntil, order.length]);

  const choose = (r: RoomId) => {
    setIdx(order.indexOf(r));
    setPausedUntil(Date.now() + 20000);
  };

  const explore = () => {
    setFilter((prev) => ({
      ...prev,
      searchQuery: '',
      career: meta.career ?? 'todas',
      category: meta.category ?? 'todas',
    }));
    goTo('catalogo');
  };

  return (
    <div className="reveal-3 min-w-0">
      <div
        className="relative aspect-[4/3] rounded-[2rem] overflow-hidden ring-1 ring-white/15 shadow-2xl shadow-black/40 transition-[background] duration-700"
        style={{ background: `radial-gradient(120% 90% at 70% 20%, ${meta.bg[1]}, ${meta.bg[0]})` }}
      >
        <RoomCanvas room={room} lift={0.24} zoom={1.12} className="absolute inset-0" />
        <span key={room + '-bar'} className="room-progress absolute top-0 left-0 h-1 bg-white/70" style={{ animationDuration: `${AUTO_MS}ms` }} />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur text-[11px] font-bold tracking-wide uppercase">{meta.label}</span>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-black/75 via-black/30 to-transparent text-left">
          <p key={room} className="room-title font-display text-xl sm:text-2xl font-bold">{meta.place}</p>
          <p className="text-xs sm:text-sm text-white/80 mt-0.5 max-w-sm">{meta.tagline}</p>
          <button
            type="button"
            onClick={explore}
            className="group mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-red-500 hover:text-white transition"
          >
            Explorar {meta.label}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Cuartos por carrera">
        {order.map((r) => (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={r === room}
            onClick={() => choose(r)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${
              r === room ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/15'
            }`}
          >
            {ROOM_BY_ID[r].label}
          </button>
        ))}
      </div>
    </div>
  );
};

/** Catálogo: el cuarto cambia según lo que la persona busca o filtra. */
export const RoomBanner: React.FC<{ room: RoomId | null; count: number }> = ({ room: active, count }) => {
  const room: RoomId = active ?? 'biblioteca';
  const meta = active
    ? ROOM_BY_ID[room]
    : { ...ROOM_BY_ID.biblioteca, label: 'Todas las carreras', place: 'Catálogo general', tagline: 'Elige una carrera o categoría y toda la página se convertirá en su cuarto.' };
  return (
    <section
      className="on-dark relative h-60 sm:h-72 rounded-3xl overflow-hidden text-white transition-[background] duration-700"
      style={{ background: `radial-gradient(130% 120% at 80% 30%, ${meta.bg[1]}, ${meta.bg[0]})` }}
      aria-label={`Estás en: ${meta.place}`}
    >
      <RoomCanvas room={room} align="right" className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t sm:bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-8 max-w-md pointer-events-none">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Estás en</p>
        <h2 key={room} className="room-title font-display text-3xl sm:text-4xl font-bold leading-tight">{meta.place}</h2>
        <p className="text-sm text-white/80 mt-1">{meta.tagline}</p>
        <p className="mt-3 self-start inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold">
          {meta.label} · {count} {count === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>
    </section>
  );
};

/** Fila de "puertas": entrar al cuarto de cada carrera o categoría desde el catálogo. */
export const RoomPicker: React.FC<{ active: RoomId | null }> = ({ active }) => {
  const { setFilter } = useExchange();
  const enter = (r: RoomId) => {
    const m = ROOM_BY_ID[r];
    setFilter((prev) => ({ ...prev, searchQuery: '', career: m.career ?? 'todas', category: m.category ?? 'todas' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Entra a un cuarto</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="list">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="listitem"
            onClick={() => enter(r.id)}
            aria-pressed={active === r.id}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              active === r.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-200 hover:border-red-500 hover:text-red-700'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${r.bg[0]}, ${r.bg[1]})` }} />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};
