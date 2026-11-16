import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  MapPin,
  Pencil,
  Share2,
  Check,
  Link2,
  Trophy,
  Star,
  FileText,
  Repeat,
  MessageSquare,
  Sparkles,
  ImageOff,
  UserX,
  Plus,
  Lock,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { Avatar } from './Avatar';
import { Orcid } from './Orcid';
import { LevelBadge, LevelProgress } from './LevelBadge';
import { PublicationCard } from './PublicationCard';
import { getCampusLabel } from '../data/ucv';
import { accentById, linkLabel } from '../data/profile';
import { CAREER_THEMES } from '../data/careerThemes';
import { sceneForCareer } from '../data/careerScenes';
import { safeImageSrc } from '../utils/imageTools';
import { PERIODS, parseWhen } from '../utils/levels';
import { goTo, profileUrl } from '../utils/router';
import type { CategoryType, StudentUser } from '../types/exchange';

/** Colores del perfil: los que eligió la persona, o los de su carrera. */
export function profileColors(u: Pick<StudentUser, 'accent' | 'career'>): { from: string; to: string } {
  const chosen = accentById(u.accent);
  if (chosen) return { from: chosen.from, to: chosen.to };
  const scene = sceneForCareer(u.career);
  const th = scene ? CAREER_THEMES[scene] : null;
  return th ? { from: th.accent, to: th.hero[0] } : { from: '#c8102e', to: '#7f1d1d' };
}

export const ProfileCover: React.FC<{ user: Pick<StudentUser, 'cover' | 'accent' | 'career' | 'name'>; className?: string; preview?: string; focusY?: number }> = ({
  user,
  className = '',
  preview,
  focusY = 0.5,
}) => {
  const src = preview || safeImageSrc(user.cover);
  const c = profileColors(user);
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
      {src ? (
        <img src={src} alt={`Portada de ${user.name}`} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `50% ${focusY * 100}%` }} />
      ) : (
        <>
          <div aria-hidden className="absolute -right-16 -top-20 w-72 h-72 rounded-full bg-white/10" />
          <div aria-hidden className="absolute right-24 -bottom-24 w-56 h-56 rounded-full bg-white/10" />
          <svg aria-hidden className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
            <defs>
              <pattern id="pc-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pc-dots)" />
          </svg>
        </>
      )}
    </div>
  );
};

const CAT_FILTERS: { id: 'todas' | CategoryType; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'conocimientos', label: 'Conocimientos' },
  { id: 'materiales', label: 'Materiales' },
  { id: 'investigacion', label: 'Investigación' },
];

type Sort = 'recientes' | 'valoradas' | 'descargas';

function memberSince(createdAt?: string): string | null {
  const t = parseWhen(createdAt);
  if (Number.isNaN(t)) return null;
  return new Date(t).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

const Stat: React.FC<{ icon: React.ReactNode; value: React.ReactNode; label: string }> = ({ icon, value, label }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">{icon}{label}</div>
    <p className="font-display text-xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export const ProfileView: React.FC<{ userId: string }> = ({ userId }) => {
  const {
    users,
    publications,
    currentUser,
    isCreatorOrAdmin,
    getUserLevel,
    getRanking,
    getRoleById,
    setIsProfileEditorOpen,
    setIsCreateModalOpen,
    removeProfileImage,
  } = useExchange();
  const user = users.find((u) => u.id === userId);
  const [cat, setCat] = useState<'todas' | CategoryType>('todas');
  const [sort, setSort] = useState<Sort>('recientes');
  const [copied, setCopied] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<'avatar' | 'cover' | null>(null);

  const isMe = !!currentUser && currentUser.id === userId;
  const canModerate = isCreatorOrAdmin && !isMe;

  const pubs = useMemo(() => {
    const mine = publications.filter(
      (p) => p.author.id === userId && (isMe || isCreatorOrAdmin || (p.status !== 'reportado' && p.status !== 'en_revision'))
    );
    const when = (s?: string) => {
      const t = parseWhen(s);
      return Number.isNaN(t) ? 0 : t;
    };
    const sorted = [...mine].sort((a, b) =>
      sort === 'valoradas'
        ? b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount
        : sort === 'descargas'
          ? b.downloadCount - a.downloadCount
          : when(b.createdAt) - when(a.createdAt) || (a.id < b.id ? 1 : -1)
    );
    return sorted;
  }, [publications, userId, isMe, isCreatorOrAdmin, sort]);

  if (!user) {
    return (
      <div className="text-center py-24">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <UserX className="w-7 h-7" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mt-5">Perfil no encontrado</h1>
        <p className="text-slate-500 mt-2">Puede que la cuenta se haya eliminado o que el enlace esté incompleto.</p>
        <button type="button" onClick={() => goTo('ranking')} className="mt-6 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold">
          Ver el ranking
        </button>
      </div>
    );
  }

  const info = getUserLevel(user.id);
  const filtered = cat === 'todas' ? pubs : pubs.filter((p) => p.category === cat);
  const counts = Object.fromEntries(CAT_FILTERS.map((c) => [c.id, c.id === 'todas' ? pubs.length : pubs.filter((p) => p.category === c.id).length]));
  const since = memberSince(user.createdAt);
  const role = getRoleById(user.role);
  const colors = profileColors(user);
  const firstName = user.name.split(' ')[0];

  const share = async () => {
    const url = profileUrl(user.id);
    try {
      if (navigator.share) await navigator.share({ title: `${user.name} · Exchange UCV`, url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* cancelado */
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <section className="reveal-1 rounded-3xl border border-slate-200 bg-white overflow-hidden" aria-label={`Perfil de ${user.name}`}>
        <ProfileCover user={user} className="h-36 sm:h-56" />
        <div className="px-5 sm:px-8 pb-6">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16">
            <Avatar name={user.name} src={user.avatar} size="2xl" className="relative z-10 ring-4 ring-white shadow-xl" />
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 break-words">{user.name}</h1>
                {user.verified && <BadgeCheck className="w-6 h-6 text-blue-600 shrink-0" aria-label="Cuenta verificada" />}
                {user.role !== 'student' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">{role.name}</span>
                )}
              </div>
              <Orcid orcid={user.orcid} className="block mt-0.5" />
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-1">
              {isMe && (
                <button
                  type="button"
                  onClick={() => setIsProfileEditorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg transition hover:-translate-y-px"
                  style={{ background: colors.from }}
                >
                  <Pencil className="w-4 h-4" /> Editar perfil
                </button>
              )}
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 text-sm font-semibold transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Enlace copiado' : 'Compartir'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-400" /> {user.career}{user.cycle ? ` · ${user.cycle}` : ''}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {getCampusLabel(user.campus)}</span>
            {since && <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" /> Miembro desde {since}</span>}
          </div>

          {user.bio ? (
            <p className="mt-4 text-slate-700 whitespace-pre-line max-w-3xl">{user.bio}</p>
          ) : isMe ? (
            <button type="button" onClick={() => setIsProfileEditorOpen(true)} className="mt-4 text-sm text-slate-500 hover:text-slate-800 underline underline-offset-2">
              Agrega una biografía para que los demás te conozcan
            </button>
          ) : null}

          {(user.interests?.length || 0) > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Intereses">
              {user.interests!.map((t) => (
                <li key={t} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{t}</li>
              ))}
            </ul>
          )}

          {(user.links?.length || 0) > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Enlaces">
              {user.links!.filter((l) => /^https?:\/\//i.test(l)).map((l) => (
                <li key={l}>
                  <a href={l} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:border-slate-400 text-slate-700 transition">
                    <Link2 className="w-3.5 h-3.5" /> {linkLabel(l)}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {canModerate && (user.avatar || user.cover) && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Moderación</span>
              {(['avatar', 'cover'] as const).filter((k) => user[k]).map((k) =>
                confirmRemove === k ? (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className="text-slate-600">¿Quitar la {k === 'avatar' ? 'foto' : 'portada'}?</span>
                    <button type="button" onClick={() => { removeProfileImage(k, user.id); setConfirmRemove(null); }} className="px-2.5 py-1 rounded-full bg-red-600 text-white font-bold">Sí, quitar</button>
                    <button type="button" onClick={() => setConfirmRemove(null)} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">Cancelar</button>
                  </span>
                ) : (
                  <button key={k} type="button" onClick={() => setConfirmRemove(k)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-700">
                    <ImageOff className="w-3.5 h-3.5" /> Quitar {k === 'avatar' ? 'foto' : 'portada'}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Columna lateral */}
        <aside className="reveal-2 space-y-4 lg:sticky lg:top-24">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">Nivel</h2>
              <span className="text-xs font-bold text-slate-500">{info.xp.toLocaleString('es-PE')} EXP</span>
            </div>
            <LevelBadge info={info} className="text-xs px-2 py-1" />
            <LevelProgress info={info} />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Stat icon={<FileText className="w-3.5 h-3.5" />} value={info.stats.publications} label="Publicaciones" />
              <Stat
                icon={<Star className="w-3.5 h-3.5" />}
                value={info.stats.ratingsReceived ? <span className="inline-flex items-center gap-1">{info.stats.avgRating}<Star className="w-4 h-4 fill-amber-400 text-amber-400" /></span> : '—'}
                label="Valoración"
              />
              <Stat icon={<Repeat className="w-3.5 h-3.5" />} value={info.stats.exchanges} label="Intercambios" />
              <Stat icon={<MessageSquare className="w-3.5 h-3.5" />} value={info.stats.reviewsWritten} label="Reseñas hechas" />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" /> Ranking</h2>
            <ul className="mt-3 space-y-2">
              {PERIODS.map((p) => {
                const list = getRanking(p.id);
                const e = list.find((x) => x.userId === user.id);
                return (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-600">{p.label}</span>
                    {e ? (
                      <span className="font-bold text-slate-900">
                        #{e.rank} <span className="font-normal text-xs text-slate-500">de {list.length}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Sin EXP aún</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => goTo('ranking')} className="mt-3 text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2">
              Ver ranking completo
            </button>
          </section>

          {info.breakdown.length > 0 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> De dónde sale su EXP</h2>
              <ul className="mt-3 space-y-1.5 text-xs">
                {info.breakdown.map((b) => (
                  <li key={b.label} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">{b.label}</span>
                    <span className="font-bold text-emerald-700">+{b.xp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Publicaciones */}
        <section className="reveal-3 min-w-0 space-y-4" aria-labelledby="perfil-pubs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="perfil-pubs" className="font-display text-2xl font-bold text-slate-900">
              {isMe ? 'Mis publicaciones' : `Publicaciones de ${firstName}`} <span className="text-slate-400 font-semibold">({pubs.length})</span>
            </h2>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Ordenar
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700">
                <option value="recientes">Más recientes</option>
                <option value="valoradas">Mejor valoradas</option>
                <option value="descargas">Más vistas</option>
              </select>
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Filtrar por categoría">
            {CAT_FILTERS.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  cat === c.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                {c.label} <span className={cat === c.id ? 'text-white/70' : 'text-slate-400'}>{counts[c.id]}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-14 px-6 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500">
                {pubs.length === 0
                  ? isMe
                    ? 'Aún no publicas nada. Comparte tu primer material y empieza a ganar EXP.'
                    : `${firstName} aún no ha publicado.`
                  : 'No hay publicaciones en esta categoría.'}
              </p>
              {isMe && pubs.length === 0 && (
                <button type="button" onClick={() => setIsCreateModalOpen(true)} className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
                  <Plus className="w-4 h-4" /> Publicar
                </button>
              )}
            </div>
          ) : (
            <div key={cat + sort} className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
              {filtered.map((p, i) => (
                <div key={p.id} className="relative min-w-0">
                  {(p.status === 'reportado' || p.status === 'en_revision') && (
                    <span className="absolute -top-2 right-4 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                      <Lock className="w-3 h-3" /> Solo lo ves tú{isCreatorOrAdmin && !isMe ? ' y los admins' : ''}
                    </span>
                  )}
                  <PublicationCard publication={p} index={i} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
