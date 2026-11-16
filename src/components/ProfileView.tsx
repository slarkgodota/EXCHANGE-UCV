import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ArrowLeft,
  Award,
  LogIn,
  Home,
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
import { PERIODS, parseWhen, Period } from '../utils/levels';
import { StarDisplay } from './StarRating';
import { UserLink } from './UserLink';
import { CoverPicker, AvatarPicker } from './ImagePickers';
import { goTo, goBack, profileUrl, setProfileTab, ProfileTab } from '../utils/router';
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
    <div className={`${/\babsolute\b/.test(className) ? '' : 'relative '}overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
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

const when = (s?: string) => {
  const t = parseWhen(s);
  return Number.isNaN(t) ? 0 : t;
};

function memberSince(createdAt?: string): string | null {
  const t = parseWhen(createdAt);
  if (Number.isNaN(t)) return null;
  return new Date(t).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

const dateText = (s?: string) => {
  const t = parseWhen(s);
  return Number.isNaN(t) ? '' : new Date(t).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const TAB_LABELS: Record<ProfileTab, string> = {
  publicaciones: 'Publicaciones',
  valoraciones: 'Valoraciones',
  logros: 'Logros',
  acerca: 'Acerca de',
};

interface Badge {
  id: string;
  label: string;
  hint: string;
  earned: boolean;
  icon: React.ReactNode;
}

/** Página completa del perfil (#perfil/<id>): tiene su propio encabezado, pestañas y botón Volver. */
export const ProfilePage: React.FC<{ userId: string; tab?: ProfileTab }> = ({ userId, tab = 'publicaciones' }) => {
  const {
    users,
    publications,
    currentUser,
    isLoggedIn,
    isCreatorOrAdmin,
    getUserLevel,
    getRanking,
    getRoleById,
    setIsProfileEditorOpen,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setSelectedPublication,
    openAuth,
    removeProfileImage,
  } = useExchange();
  const user = users.find((u) => u.id === userId);
  const [cat, setCat] = useState<'todas' | CategoryType>('todas');
  const [sort, setSort] = useState<Sort>('recientes');
  const [copied, setCopied] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<'avatar' | 'cover' | null>(null);
  const [compact, setCompact] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const isMe = !!currentUser && currentUser.id === userId;
  const canModerate = isCreatorOrAdmin && !isMe;

  // Al bajar, el encabezado muestra la foto y el nombre en pequeño
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [user?.id]);

  const pubs = useMemo(() => {
    const mine = publications.filter(
      (p) => p.author.id === userId && (isMe || isCreatorOrAdmin || (p.status !== 'reportado' && p.status !== 'en_revision'))
    );
    return [...mine].sort((a, b) =>
      sort === 'valoradas'
        ? b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount
        : sort === 'descargas'
          ? b.downloadCount - a.downloadCount
          : when(b.createdAt) - when(a.createdAt) || (a.id < b.id ? 1 : -1)
    );
  }, [publications, userId, isMe, isCreatorOrAdmin, sort]);

  const reviews = useMemo(
    () =>
      pubs
        .filter((p) => p.status !== 'reportado' && p.status !== 'en_revision')
        .flatMap((p) => (p.reviews || []).filter((r) => r.authorId !== userId).map((r) => ({ r, p })))
        .sort((a, b) => when(b.r.createdAt) - when(a.r.createdAt)),
    [pubs, userId]
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <ProfileTopBar onBack={goBack} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <UserX className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mt-5">Perfil no encontrado</h1>
          <p className="text-slate-500 mt-2">Puede que la cuenta se haya eliminado o que el enlace esté incompleto.</p>
          <button type="button" onClick={() => goTo('ranking')} className="mt-6 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold">
            Ver el ranking
          </button>
        </div>
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
  const rankOf = (p: Period) => {
    const list = getRanking(p);
    return { entry: list.find((x) => x.userId === user.id), total: list.length };
  };
  const ranks = { total: rankOf('total'), mes: rankOf('mes'), semana: rankOf('semana') };

  const badges: Badge[] = [
    { id: 'pub1', label: 'Primera publicación', hint: 'Publica tu primer aporte', earned: info.stats.publications >= 1, icon: <FileText className="w-5 h-5" /> },
    { id: 'pub5', label: 'Colaborador activo', hint: '5 publicaciones', earned: info.stats.publications >= 5, icon: <Sparkles className="w-5 h-5" /> },
    { id: 'star5', label: 'Aporte de 5 estrellas', hint: 'Una publicación con 5★ de promedio', earned: pubs.some((p) => p.ratingCount > 0 && p.ratingAverage >= 5), icon: <Star className="w-5 h-5" /> },
    { id: 'quality', label: 'Muy bien valorado', hint: 'Promedio de 4.5★ o más con 3 valoraciones', earned: info.stats.ratingsReceived >= 3 && info.stats.avgRating >= 4.5, icon: <Award className="w-5 h-5" /> },
    { id: 'featured', label: 'Destacado', hint: 'Que un admin destaque una publicación', earned: pubs.some((p) => p.status === 'destacado'), icon: <Trophy className="w-5 h-5" /> },
    { id: 'ex1', label: 'Primer intercambio', hint: 'Completa un intercambio', earned: info.stats.exchanges >= 1, icon: <Repeat className="w-5 h-5" /> },
    { id: 'ex5', label: 'Mentor', hint: '5 intercambios completados', earned: info.stats.exchanges >= 5, icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'rev5', label: 'Buen compañero', hint: 'Valora 5 publicaciones de otros', earned: info.stats.reviewsWritten >= 5, icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'topw', label: 'Top 3 de la semana', hint: 'Llega al podio semanal', earned: !!ranks.semana.entry && ranks.semana.entry.rank <= 3, icon: <Trophy className="w-5 h-5" /> },
    { id: 'topm', label: 'Top 3 del mes', hint: 'Llega al podio mensual', earned: !!ranks.mes.entry && ranks.mes.entry.rank <= 3, icon: <Trophy className="w-5 h-5" /> },
  ];
  const earned = badges.filter((b) => b.earned).length;

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

  const changeTab = (t: ProfileTab) => {
    setProfileTab(user.id, t);
    const top = tabsRef.current ? tabsRef.current.getBoundingClientRect().top + window.scrollY - 64 : 0;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
  };

  const tabCount: Partial<Record<ProfileTab, number>> = { publicaciones: pubs.length, valoraciones: reviews.length, logros: earned };

  return (
    <div className="min-h-screen flex flex-col profile-page">
      <ProfileTopBar
        onBack={goBack}
        title={
          <span className={`flex items-center gap-2 min-w-0 transition-all duration-300 ${compact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
            <Avatar name={user.name} src={user.avatar} size="xs" />
            <span className="font-bold text-sm text-slate-900 truncate">{user.name}</span>
          </span>
        }
        right={
          <>
            <button type="button" onClick={share} className="p-2 rounded-full text-slate-600 hover:bg-slate-100" aria-label="Compartir perfil" title={copied ? 'Enlace copiado' : 'Compartir'}>
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
            {isLoggedIn && currentUser ? (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className="rounded-full hover:ring-4 hover:ring-slate-100 transition" title="Mi cuenta">
                <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />
              </button>
            ) : (
              <button type="button" onClick={() => openAuth('login')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">
                <LogIn className="w-4 h-4" /> Ingresar
              </button>
            )}
          </>
        }
      />

      {/* Portada a todo lo ancho */}
      <div className="relative">
        {isMe ? (
          <CoverPicker user={user} onError={setImgError} className="h-60 sm:h-80 lg:h-[26rem]" />
        ) : (
          <ProfileCover user={user} className="h-60 sm:h-80 lg:h-[26rem]" />
        )}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
      </div>
      {imgError && (
        <div role="alert" className="max-w-5xl w-full mx-auto px-4 sm:px-6 mt-3">
          <p className="p-2.5 rounded-xl text-xs bg-red-50 border border-red-200 text-red-800">{imgError}</p>
        </div>
      )}

      <div ref={heroRef} className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 -mt-16 sm:-mt-20">
          {isMe ? (
            <AvatarPicker user={user} size="2xl" onError={setImgError} />
          ) : (
            <Avatar name={user.name} src={user.avatar} size="2xl" className="relative ring-4 ring-white shadow-xl bg-white" />
          )}
          <div className="flex-1 min-w-0 sm:pt-[5.75rem]">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 break-words">{user.name}</h1>
              {user.verified && <BadgeCheck className="w-7 h-7 text-blue-600 shrink-0" aria-label="Cuenta verificada" />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <LevelBadge info={info} className="text-xs px-2 py-1" />
              {user.role !== 'student' && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">{role.name}</span>}
              <Orcid orcid={user.orcid} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:pt-[6rem]">
            {isMe ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsProfileEditorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-sm font-bold shadow-lg transition hover:-translate-y-px"
                  style={{ background: colors.from }}
                >
                  <Pencil className="w-4 h-4" /> Editar perfil
                </button>
                <button type="button" onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Publicar
                </button>
              </>
            ) : (
              <button type="button" onClick={share} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white hover:border-slate-400 text-slate-700 text-sm font-semibold">
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />} {copied ? 'Enlace copiado' : 'Compartir perfil'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-400" /> {user.career}{user.cycle ? ` · ${user.cycle}` : ''}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {getCampusLabel(user.campus)}</span>
          {since && <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400" /> Miembro desde {since}</span>}
        </div>
        {user.bio && <p className="mt-3 text-slate-700 whitespace-pre-line max-w-3xl">{user.bio}</p>}

        {/* Números */}
        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { k: 'EXP', v: info.xp.toLocaleString('es-PE') },
            { k: 'Publicaciones', v: info.stats.publications },
            { k: 'Valoración', v: info.stats.ratingsReceived ? `${info.stats.avgRating} ★` : '—' },
            { k: 'Intercambios', v: info.stats.exchanges },
            { k: 'Ranking general', v: ranks.total.entry ? `#${ranks.total.entry.rank}` : '—' },
          ].map((x, i) => (
            <div key={x.k} className={`rounded-2xl bg-white border border-slate-200 px-4 py-3 ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <dt className="text-[11px] font-semibold text-slate-500">{x.k}</dt>
              <dd className="font-display text-xl font-bold text-slate-900">{x.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Pestañas */}
      <div ref={tabsRef} className="sticky top-16 z-30 mt-6 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label="Secciones del perfil">
            {(Object.keys(TAB_LABELS) as ProfileTab[]).map((t) => {
              const on = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => changeTab(t)}
                  className={`relative shrink-0 px-4 py-3.5 text-sm font-semibold transition ${on ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {TAB_LABELS[t]}
                  {tabCount[t] !== undefined && <span className="ml-1.5 text-xs text-slate-400">{tabCount[t]}</span>}
                  <span aria-hidden className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-all ${on ? 'opacity-100' : 'opacity-0'}`} style={{ background: colors.from }} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main key={tab} className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 view-enter">
        {tab === 'publicaciones' && (
          <section className="space-y-4" aria-label="Publicaciones">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {CAT_FILTERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={cat === c.id}
                    onClick={() => setCat(c.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      cat === c.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {c.label} <span className={cat === c.id ? 'text-white/70' : 'text-slate-400'}>{counts[c.id]}</span>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Ordenar
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-700">
                  <option value="recientes">Más recientes</option>
                  <option value="valoradas">Mejor valoradas</option>
                  <option value="descargas">Más vistas</option>
                </select>
              </label>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-14 px-6 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500">
                  {pubs.length === 0 ? (isMe ? 'Aún no publicas nada. Comparte tu primer material y empieza a ganar EXP.' : `${firstName} aún no ha publicado.`) : 'No hay publicaciones en esta categoría.'}
                </p>
                {isMe && pubs.length === 0 && (
                  <button type="button" onClick={() => setIsCreateModalOpen(true)} className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold">
                    <Plus className="w-4 h-4" /> Publicar
                  </button>
                )}
              </div>
            ) : (
              <div key={cat + sort} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
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
        )}

        {tab === 'valoraciones' && (
          <section aria-label="Valoraciones recibidas" className="space-y-3 max-w-3xl">
            <p className="text-sm text-slate-500">
              Lo que dicen otros estudiantes sobre las publicaciones de {isMe ? 'ti' : firstName}
              {info.stats.ratingsReceived > 0 && <> · promedio <strong className="text-slate-800">{info.stats.avgRating} ★</strong></>}
            </p>
            {reviews.length === 0 ? (
              <p className="text-center py-14 px-6 rounded-3xl border-2 border-dashed border-slate-200 text-slate-500">Todavía no hay valoraciones.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map(({ r, p }) => (
                  <li key={r.id} className="rounded-2xl bg-white border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={r.authorName} src={r.authorAvatar} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <UserLink userId={r.authorId} className="text-sm font-bold text-slate-900">{r.authorName}</UserLink>
                          <StarDisplay value={r.rating} size="sm" showValue={false} />
                          <span className="text-[11px] text-slate-500">{dateText(r.createdAt)}</span>
                        </div>
                        {r.comment && <p className="text-sm text-slate-700 mt-1">{r.comment}</p>}
                        <button type="button" onClick={() => setSelectedPublication(p)} className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 text-left">
                          En: {p.title}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'logros' && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <section aria-label="Insignias" className="space-y-3">
              <h2 className="font-display text-xl font-bold text-slate-900">Insignias <span className="text-slate-400 font-semibold text-base">{earned}/{badges.length}</span></h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((b) => (
                  <li key={b.id} className={`rounded-2xl border p-4 ${b.earned ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-200'}`} title={b.hint}>
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.earned ? 'text-white shadow' : 'bg-slate-200 text-slate-400'}`}
                      style={b.earned ? { background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` } : undefined}
                    >
                      {b.earned ? b.icon : <Lock className="w-4 h-4" />}
                    </span>
                    <p className={`mt-2 text-sm font-bold ${b.earned ? 'text-slate-900' : 'text-slate-500'}`}>{b.label}</p>
                    <p className="text-[11px] text-slate-500">{b.earned ? 'Conseguida' : b.hint}</p>
                  </li>
                ))}
              </ul>
            </section>
            <aside className="space-y-4">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Nivel</h2>
                  <span className="text-xs font-bold text-slate-500">{info.xp.toLocaleString('es-PE')} EXP</span>
                </div>
                <LevelBadge info={info} className="text-xs px-2 py-1" />
                <LevelProgress info={info} />
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" /> Ranking</h2>
                <ul className="mt-3 space-y-2">
                  {PERIODS.map((p) => {
                    const { entry, total } = ranks[p.id];
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-slate-600">{p.label}</span>
                        {entry ? (
                          <span className="font-bold text-slate-900">#{entry.rank} <span className="font-normal text-xs text-slate-500">de {total}</span></span>
                        ) : (
                          <span className="text-xs text-slate-500">Sin EXP aún</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <button type="button" onClick={() => goTo('ranking')} className="mt-3 text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2">Ver ranking completo</button>
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
          </div>
        )}

        {tab === 'acerca' && (
          <section aria-label="Acerca de" className="grid md:grid-cols-2 gap-5 max-w-4xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:col-span-2">
              <h2 className="text-sm font-bold text-slate-900">Biografía</h2>
              {user.bio ? (
                <p className="mt-2 text-slate-700 whitespace-pre-line">{user.bio}</p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  {isMe ? (
                    <button type="button" onClick={() => setIsProfileEditorOpen(true)} className="underline underline-offset-2 hover:text-slate-800">Agrega una biografía para que los demás te conozcan</button>
                  ) : (
                    `${firstName} todavía no escribió su biografía.`
                  )}
                </p>
              )}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-bold text-slate-900">Datos académicos</h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Carrera</dt><dd className="font-semibold text-slate-900 text-right">{user.career}</dd></div>
                {user.cycle && <div className="flex justify-between gap-3"><dt className="text-slate-500">Ciclo</dt><dd className="font-semibold text-slate-900">{user.cycle}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Campus</dt><dd className="font-semibold text-slate-900">{getCampusLabel(user.campus)}</dd></div>
                {user.orcid && <div className="flex justify-between gap-3"><dt className="text-slate-500">ORCID</dt><dd><Orcid orcid={user.orcid} /></dd></div>}
                {since && <div className="flex justify-between gap-3"><dt className="text-slate-500">Miembro desde</dt><dd className="font-semibold text-slate-900">{since}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Rol</dt><dd className="font-semibold text-slate-900">{role.name}</dd></div>
              </dl>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Intereses</h2>
                {(user.interests?.length || 0) > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Intereses">
                    {user.interests!.map((t) => (
                      <li key={t} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Sin intereses todavía.</p>
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Enlaces</h2>
                {(user.links?.length || 0) > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2" aria-label="Enlaces">
                    {user.links!.filter((l) => /^https?:\/\//i.test(l)).map((l) => (
                      <li key={l}>
                        <a href={l} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:border-slate-400 text-slate-700 transition">
                          <Link2 className="w-3.5 h-3.5" /> {linkLabel(l)}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Sin enlaces.</p>
                )}
              </div>
            </div>

            {canModerate && (user.avatar || user.cover) && (
              <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 flex flex-wrap items-center gap-2 text-xs">
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
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>Perfil de {user.name} en Exchange UCV</span>
          <span className="flex gap-4">
            <button type="button" onClick={() => goTo('inicio')} className="hover:text-slate-900">Inicio</button>
            <button type="button" onClick={() => goTo('catalogo')} className="hover:text-slate-900">Catálogo</button>
            <button type="button" onClick={() => goTo('ranking')} className="hover:text-slate-900">Ranking</button>
          </span>
        </div>
      </footer>
    </div>
  );
};

/** Barra superior propia de la página de perfil. */
const ProfileTopBar: React.FC<{ onBack: () => void; title?: React.ReactNode; right?: React.ReactNode }> = ({ onBack, title, right }) => (
  <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 pl-2 pr-3 py-2 rounded-full text-slate-700 hover:bg-slate-100 text-sm font-semibold shrink-0">
        <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Volver</span>
      </button>
      <button type="button" onClick={() => goTo('inicio')} className="hidden sm:flex items-center gap-2 shrink-0" aria-label="Exchange UCV, inicio" title="Ir al inicio">
        <img src="/assets/logo_ucv_alt.png" alt="" className="h-7 w-7 object-contain" />
        <span className="font-display font-bold text-slate-900 tracking-tight hidden md:inline">
          Exchange<span className="text-red-600">UCV</span>
        </span>
      </button>
      <div className="flex-1 min-w-0 flex justify-center">{title}</div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button type="button" onClick={() => goTo('inicio')} className="sm:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100" aria-label="Ir al inicio">
          <Home className="w-5 h-5" />
        </button>
        {right}
      </div>
    </div>
  </header>
);
