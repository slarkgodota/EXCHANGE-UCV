import React, { useEffect, useState } from 'react';
import { X, Plus, Check, Lock } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { CoverPicker, AvatarPicker } from './ImagePickers';
import { isValidOrcid } from './Orcid';
import { CAREERS, UCV_CAMPUSES } from '../data/ucv';
import { CYCLES, PROFILE_ACCENTS, PROFILE_LIMITS, cleanInterests, normalizeLink } from '../data/profile';
import type { CampusType, CareerType } from '../types/exchange';

const label = 'block text-xs font-bold text-slate-700 mb-1.5';
const input = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400';

/** Modal "Editar perfil": foto, portada, datos, intereses, enlaces y color. */
export const EditProfileModal: React.FC = () => {
  const { isProfileEditorOpen, setIsProfileEditorOpen, currentUser, updateProfile, removeProfileImage } = useExchange();
  const open = isProfileEditorOpen && !!currentUser;

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [career, setCareer] = useState<CareerType>(CAREERS[0]);
  const [campus, setCampus] = useState<CampusType>(UCV_CAMPUSES[0].id);
  const [cycle, setCycle] = useState('');
  const [orcid, setOrcid] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestDraft, setInterestDraft] = useState('');
  const [links, setLinks] = useState<string[]>(['', '', '']);
  const [accent, setAccent] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgError, setImgError] = useState<string | null>(null);

  // Cargar los datos actuales cada vez que se abre
  useEffect(() => {
    if (!open || !currentUser) return;
    setName(currentUser.name);
    setBio(currentUser.bio || '');
    setCareer(currentUser.career);
    setCampus(currentUser.campus);
    setCycle(currentUser.cycle || '');
    setOrcid(currentUser.orcid || '');
    setPhone(currentUser.phone || '');
    setInterests(currentUser.interests || []);
    setInterestDraft('');
    const l = currentUser.links || [];
    setLinks([l[0] || '', l[1] || '', l[2] || '']);
    setAccent(currentUser.accent);
    setErrors({});
    setImgError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!open || !currentUser) return null;

  const close = () => setIsProfileEditorOpen(false);

  const addInterest = () => {
    const parts = interestDraft.split(',');
    setInterests((prev) => cleanInterests([...prev, ...parts]));
    setInterestDraft('');
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const n = name.replace(/\s+/g, ' ').trim();
    if (n.length < 3) errs.name = 'Escribe tu nombre (mínimo 3 letras).';
    if (n.length > PROFILE_LIMITS.name) errs.name = `Máximo ${PROFILE_LIMITS.name} caracteres.`;
    if (bio.length > PROFILE_LIMITS.bio) errs.bio = `Máximo ${PROFILE_LIMITS.bio} caracteres.`;
    const o = orcid.trim().replace(/^https?:\/\/(www\.)?orcid\.org\//, '');
    if (o && !isValidOrcid(o)) errs.orcid = 'El ORCID tiene la forma 0000-0000-0000-0000.';
    const p = phone.trim();
    if (p && !/^\+?[\d\s-]{6,20}$/.test(p)) errs.phone = 'Escribe solo números (puede empezar con +).';
    const cleanLinks: string[] = [];
    links.forEach((raw, i) => {
      if (!raw.trim()) return;
      const ok = normalizeLink(raw);
      if (!ok) errs[`link${i}`] = 'Enlace no válido (debe ser una página web).';
      else if (!cleanLinks.includes(ok)) cleanLinks.push(ok);
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const finalInterests = cleanInterests([...interests, ...interestDraft.split(',')]);
    updateProfile({
      name: n,
      bio: bio.trim(),
      career,
      campus,
      cycle,
      orcid: o || undefined,
      phone: p || undefined,
      interests: finalInterests.length ? finalInterests : undefined,
      links: cleanLinks.length ? cleanLinks : undefined,
      accent,
    });
    close();
  };

  const previewUser = { ...currentUser, accent, career };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 animate-fadeIn" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <form
        onSubmit={save}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 id="edit-profile-title" className="font-display text-lg font-bold text-slate-900">Editar perfil</h2>
          <button type="button" onClick={close} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          {/* Portada + foto: se toca, se elige la imagen y se guarda sola */}
          <CoverPicker user={previewUser} onError={setImgError} className="h-48 sm:h-60" />

          <div className="relative z-10 px-5 sm:px-6 -mt-12 flex items-start gap-4">
            <AvatarPicker user={{ name: name || currentUser.name, avatar: currentUser.avatar }} onError={setImgError} />
            <div className="pt-14 text-xs text-slate-500 space-y-1">
              <p>Toca la portada o tu foto para cambiarlas. Se guardan solas.</p>
              {currentUser.avatar && (
                <button type="button" onClick={() => removeProfileImage('avatar')} className="font-semibold text-slate-600 hover:text-red-700 underline underline-offset-2">Quitar foto</button>
              )}
            </div>
          </div>
          {imgError && <p role="alert" className="mx-5 sm:mx-6 mt-3 p-2.5 rounded-xl text-xs bg-red-50 border border-red-200 text-red-800">{imgError}</p>}

          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <label htmlFor="ep-name" className={label}>Nombre completo</label>
              <input id="ep-name" value={name} maxLength={PROFILE_LIMITS.name} onChange={(e) => setName(e.target.value)} className={input} autoComplete="name" />
              {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="ep-bio" className={label}>
                Biografía <span className="font-normal text-slate-400">({bio.length}/{PROFILE_LIMITS.bio})</span>
              </label>
              <textarea id="ep-bio" value={bio} maxLength={PROFILE_LIMITS.bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Cuéntales a los demás qué estudias, en qué puedes ayudar y qué te interesa." className={`${input} resize-none`} />
              {errors.bio && <p className="mt-1 text-xs text-red-700">{errors.bio}</p>}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="ep-career" className={label}>Carrera</label>
                <select id="ep-career" value={career} onChange={(e) => setCareer(e.target.value as CareerType)} className={input}>
                  {CAREERS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ep-cycle" className={label}>Ciclo</label>
                <select id="ep-cycle" value={cycle} onChange={(e) => setCycle(e.target.value)} className={input}>
                  {!CYCLES.includes(cycle) && <option value={cycle}>{cycle || '—'}</option>}
                  {CYCLES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="ep-campus" className={label}>Campus</label>
                <select id="ep-campus" value={campus} onChange={(e) => setCampus(e.target.value as CampusType)} className={input}>
                  {UCV_CAMPUSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ep-orcid" className={label}>ORCID <span className="font-normal text-slate-400">(opcional)</span></label>
                <input id="ep-orcid" value={orcid} onChange={(e) => setOrcid(e.target.value)} placeholder="0000-0000-0000-0000" className={input} />
                {errors.orcid && <p className="mt-1 text-xs text-red-700">{errors.orcid}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="ep-interest" className={label}>
                Intereses y habilidades <span className="font-normal text-slate-400">({interests.length}/{PROFILE_LIMITS.interests})</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="ep-interest"
                  value={interestDraft}
                  onChange={(e) => setInterestDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                  disabled={interests.length >= PROFILE_LIMITS.interests}
                  maxLength={PROFILE_LIMITS.interest}
                  placeholder="Ej.: AutoCAD, Cálculo, Investigación"
                  className={input}
                />
                <button type="button" onClick={addInterest} disabled={!interestDraft.trim() || interests.length >= PROFILE_LIMITS.interests} className="shrink-0 inline-flex items-center gap-1 px-3.5 rounded-xl bg-slate-900 disabled:opacity-40 text-white text-xs font-bold">
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              {interests.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {interests.map((t) => (
                    <li key={t} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {t}
                      <button type="button" onClick={() => setInterests((prev) => prev.filter((x) => x !== t))} className="p-0.5 rounded-full hover:bg-slate-200" aria-label={`Quitar ${t}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <span className={label}>Enlaces <span className="font-normal text-slate-400">(LinkedIn, GitHub, portafolio… hasta 3)</span></span>
              <div className="space-y-2">
                {links.map((l, i) => (
                  <div key={i}>
                    <input
                      aria-label={`Enlace ${i + 1}`}
                      value={l}
                      onChange={(e) => setLinks((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                      placeholder={['linkedin.com/in/tu-nombre', 'github.com/tu-usuario', 'tu-portafolio.com'][i]}
                      inputMode="url"
                      className={input}
                    />
                    {errors[`link${i}`] && <p className="mt-1 text-xs text-red-700">{errors[`link${i}`]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className={label}>Color del perfil</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color del perfil">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!accent}
                  onClick={() => setAccent(undefined)}
                  className={`h-9 px-3 rounded-full text-xs font-semibold border transition ${!accent ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-700 hover:border-slate-400'}`}
                >
                  Color de mi carrera
                </button>
                {PROFILE_ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={accent === a.id}
                    aria-label={a.label}
                    title={a.label}
                    onClick={() => setAccent(a.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ring-offset-2 ${accent === a.id ? 'ring-2 ring-slate-900' : 'hover:scale-110'}`}
                    style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
                  >
                    {accent === a.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label htmlFor="ep-phone" className={label}>
                Celular <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input id="ep-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="9XX XXX XXX" className={input} />
              <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" /> No aparece en tu perfil: solo se comparte cuando aceptas un intercambio.</p>
              {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-white">
          <button type="button" onClick={close} className="px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700">Cancelar</button>
          <button type="submit" className="px-5 py-2.5 rounded-full text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25">Guardar cambios</button>
        </div>
      </form>
    </div>
  );
};
