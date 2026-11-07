import React, { useEffect, useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Brain,
  AlertTriangle,
  Info,
  Paperclip,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { CategoryType, CareerType, AttachmentMeta } from '../types/exchange';
import { validateNewPublication, isSafeHttpUrl } from '../utils/exchangeLogic';
import { CAREERS } from '../data/ucv';
import { ACCEPT_ATTR, MAX_FILES, MAX_FILE_MB, validateFile, formatBytes } from '../utils/fileStore';
import { INTENT_LABELS, RESOURCE_TYPES, DEFAULT_RESOURCE_TYPE, PublicationIntent, ResourceType } from '../data/catalog';


const ACCESS_OPTIONS = [
  { value: 'Gratuito / RSU', label: 'Gratis', hint: 'Cualquier usuario registrado puede descargar.' },
  { value: 'Intercambio Académico', label: 'Intercambio', hint: 'Ven solo las primeras hojas; todo y descarga cuando aceptas su solicitud.' },
  { value: 'Colaboración en Equipo', label: 'Equipo', hint: 'Ven las primeras hojas; todo y descarga solo para tu equipo.' },
] as const;

const RESPONSIBILITY_POINTS = [
  'El contenido es de mi autoría o tengo permiso para compartirlo, y cito las fuentes que uso.',
  'No comparto exámenes, evaluaciones o trabajos de otras personas para que sean copiados o presentados como propios.',
  'La información que publico es verídica y no ofende ni discrimina a nadie.',
  'No incluyo datos personales de terceros sin su autorización.',
  'Si ofrezco o pido ayuda, cumpliré lo que acuerde con la otra persona y respetaré las normas académicas de la universidad.',
];

export const CreatePublicationModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    addPublication,
    updatePublication,
    editingPublication,
    cancelEditPublication,
    setSelectedPublication,
    currentUser,
  } = useExchange();
  const editing = editingPublication;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('materiales');
  const [career, setCareer] = useState<CareerType>(currentUser?.career || 'Ingeniería Civil');
  const [course, setCourse] = useState('');
  const [cycleLevel, setCycleLevel] = useState('Ciclo V');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'DOCX' | 'ZIP' | 'XLSX' | 'Sesión Google Meet'>('PDF');
  const [exchangeType, setExchangeType] = useState<'Intercambio Académico' | 'Gratuito / RSU' | 'Colaboración en Equipo'>('Intercambio Académico');
  const [resourceUrl, setResourceUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [intent, setIntent] = useState<PublicationIntent>('ofrezco');
  const [resourceType, setResourceType] = useState<ResourceType>('Resumen');
  const [academicIntegrityChecked, setAcademicIntegrityChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existing, setExisting] = useState<AttachmentMeta[]>([]);

  // Al abrir: si se está editando, carga los datos de la publicación; si no, deja el formulario limpio.
  useEffect(() => {
    if (!isCreateModalOpen) return;
    const p = editingPublication;
    setErrorMsg(null);
    setFiles([]);
    setAcademicIntegrityChecked(false);
    if (p) {
      setTitle(p.title);
      setCategory(p.category);
      setCareer(p.career);
      setCourse(p.course);
      setCycleLevel(p.cycleLevel);
      setDescription(p.description);
      setTagsInput(p.tags.join(', '));
      setFileType(p.fileType || 'PDF');
      setExchangeType(p.exchangeType);
      setResourceUrl(p.resourceUrl || '');
      setIntent(p.intent || 'ofrezco');
      setResourceType(p.resourceType || DEFAULT_RESOURCE_TYPE[p.category]);
      setExisting(p.attachments || []);
    } else {
      setTitle('');
      setCategory('materiales');
      setCareer(currentUser?.career || 'Ingeniería Civil');
      setCourse('');
      setDescription('');
      setTagsInput('');
      setResourceUrl('');
      setIntent('ofrezco');
      setResourceType('Resumen');
      setExchangeType('Intercambio Académico');
      setExisting([]);
    }
  }, [isCreateModalOpen, editingPublication?.id]);

  if (!isCreateModalOpen) return null;

  const close = () => {
    if (editing) cancelEditPublication();
    else setIsCreateModalOpen(false);
  };
  const slots = MAX_FILES - existing.length;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    for (const f of incoming) {
      const err = validateFile(f);
      if (err) {
        setErrorMsg(err);
        return;
      }
    }
    const merged = [...files, ...incoming].slice(0, Math.max(0, slots));
    if (files.length + incoming.length > slots) setErrorMsg(`Puedes adjuntar hasta ${MAX_FILES} archivos en total.`);
    else setErrorMsg(null);
    setFiles(merged);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validateNewPublication({
      title,
      description,
      course,
      career,
      category,
      academicIntegrityChecked,
    });

    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    if (resourceUrl.trim() && !isSafeHttpUrl(resourceUrl.trim())) {
      setErrorMsg('El enlace debe empezar con https:// (por ejemplo, un enlace de Google Drive u OneDrive).');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSaving(true);
    const payload = {
      files,
      title: title.trim(),
      description: description.trim(),
      category,
      career,
      course: course.trim(),
      cycleLevel,
      tags: tags.length > 0 ? tags : [course.trim()],
      exchangeType,
      fileType,
      resourceUrl: resourceUrl.trim() || undefined,
      intent,
      resourceType,
    };
    let created;
    try {
      created = editing
        ? await updatePublication(editing.id, { ...payload, keepAttachmentIds: existing.map((a) => a.id) })
        : await addPublication(payload);
    } catch {
      created = null;
    }
    setIsSaving(false);
    if (!created) {
      setErrorMsg(editing ? 'No se pudieron guardar los cambios. Revisa tu conexión e inténtalo de nuevo.' : 'No se pudo publicar. Inicia sesión e inténtalo de nuevo.');
      return;
    }
    if (editing) {
      setIsCreateModalOpen(false);
      setSelectedPublication(created);
      return;
    }

    // Reset and close
    setFiles([]);
    setTitle('');
    setDescription('');
    setCourse('');
    setTagsInput('');
    setResourceUrl('');
    setIntent('ofrezco');
    setAcademicIntegrityChecked(false);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-600 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img
                src="/assets/logo_ucv_alt.png"
                alt="UCV"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-base">{editing ? 'Editar publicación' : 'Nueva Publicación en Exchange UCV'}</h2>
              <p className="text-[11px] text-red-100">
                {editing ? 'Corrige lo que necesites y guarda los cambios' : 'Comparte apuntes, tutorías o convoca investigadores en todas las sedes del Perú'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Selecciona la Sección:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setCategory('materiales'); setResourceType(DEFAULT_RESOURCE_TYPE.materiales); }}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  category === 'materiales'
                    ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Materiales Académicos
                <p className="text-[10px] font-normal text-slate-500 mt-0.5">Apuntes, resúmenes, guías</p>
              </button>

              <button
                type="button"
                onClick={() => { setCategory('conocimientos'); setResourceType(DEFAULT_RESOURCE_TYPE.conocimientos); }}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  category === 'conocimientos'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Conocimientos
                <p className="text-[10px] font-normal text-slate-500 mt-0.5">Tutorías y asesorías 1 a 1</p>
              </button>

              <button
                type="button"
                onClick={() => { setCategory('investigacion'); setResourceType(DEFAULT_RESOURCE_TYPE.investigacion); }}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  category === 'investigacion'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Investigación
                <p className="text-[10px] font-normal text-slate-500 mt-0.5">Semilleros, tesis, proyectos</p>
              </button>
            </div>
          </div>

          {/* Ofrezco / Busco (sección 8 del proyecto) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. ¿Qué quieres hacer?
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs" role="radiogroup">
              {(['ofrezco', 'busco'] as PublicationIntent[]).map((i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={intent === i}
                  onClick={() => setIntent(i)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    intent === i ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-bold">{INTENT_LABELS[category][i].label}</span>
                  <span className={`block text-[11px] mt-0.5 ${intent === i ? 'text-slate-300' : 'text-slate-500'}`}>
                    {INTENT_LABELS[category][i].hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="pub-rtype" className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de recurso:
            </label>
            <select
              id="pub-rtype"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título de la publicación:
            </label>
            <input
              type="text"
              placeholder="Ej. Apuntes de Cálculo Integral y Resumen de Fórmulas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              required
            />
          </div>

          {/* Career & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carrera Profesional UCV:
              </label>
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value as CareerType)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                {CAREERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asignatura / Curso:
              </label>
              <input
                type="text"
                placeholder="Ej. Estructuras I, Suelos, Derecho Civil..."
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                required
              />
            </div>
          </div>

          {/* Cycle & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nivel / Ciclo:
              </label>
              <select
                value={cycleLevel}
                onChange={(e) => setCycleLevel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Ciclo I - II">Ciclo I - II</option>
                <option value="Ciclo III - IV">Ciclo III - IV</option>
                <option value="Ciclo V - VI">Ciclo V - VI</option>
                <option value="Ciclo VII - VIII">Ciclo VII - VIII</option>
                <option value="Ciclo IX - X">Ciclo IX - X</option>
                <option value="Todos los ciclos">Todos los ciclos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modalidad / Formato:
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="PDF">Documento PDF</option>
                <option value="DOCX">Documento Word (.docx)</option>
                <option value="ZIP">Archivo Comprimido (.zip)</option>
                <option value="XLSX">Hoja de Cálculo Excel (.xlsx)</option>
                <option value="Sesión Google Meet">Sesión Online (Google Meet)</option>
              </select>
            </div>

          </div>

          {/* Archivos adjuntos */}
          <div className="space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">Archivos adjuntos</span>
            {existing.length > 0 && (
              <ul className="space-y-1.5" aria-label="Archivos ya publicados">
                {existing.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                    <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="flex-1 truncate font-medium text-slate-800">{a.name}</span>
                    <span className="text-slate-400">{formatBytes(a.size)}</span>
                    <button type="button" onClick={() => setExisting(existing.filter((x) => x.id !== a.id))} className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label={`Quitar ${a.name}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {slots > 0 && (
            <label
              htmlFor="pub-files"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="flex flex-col items-center justify-center gap-1 p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-red-400 hover:bg-red-50/40 text-center cursor-pointer transition"
            >
              <Upload className="w-6 h-6 text-red-500" />
              <span className="text-sm font-semibold text-slate-800">Arrastra tus archivos o haz clic para elegir</span>
              <span className="text-[11px] text-slate-500">PDF, imágenes, Word, PowerPoint, Excel, ZIP · hasta {MAX_FILES} archivos de {MAX_FILE_MB} MB</span>
              <input id="pub-files" type="file" multiple accept={ACCEPT_ATTR} className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            </label>
            )}
            {files.length > 0 && (
              <ul className="space-y-1.5">
                {files.map((f, i) => (
                  <li key={f.name + i} className="view-enter flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <FileText className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="flex-1 truncate font-medium text-slate-800">{f.name}</span>
                    <span className="text-slate-400">{formatBytes(f.size)}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label={`Quitar ${f.name}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">¿Cómo se accede a tus archivos?</span>
              <div className="grid sm:grid-cols-3 gap-2 text-xs" role="radiogroup">
                {ACCESS_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={exchangeType === o.value}
                    onClick={() => setExchangeType(o.value)}
                    className={`p-3 rounded-xl border text-left transition ${exchangeType === o.value ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className="block font-bold">{o.label}</span>
                    <span className={`block text-[11px] mt-0.5 ${exchangeType === o.value ? 'text-slate-300' : 'text-slate-500'}`}>{o.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resource link */}
          <div>
            <label htmlFor="pub-url" className="block text-xs font-semibold text-slate-700 mb-1">
              O comparte un enlace <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="pub-url"
              type="url"
              inputMode="url"
              placeholder="https://drive.google.com/… o enlace de Google Meet"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Útil para archivos grandes o sesiones en línea (Drive, OneDrive, Meet).
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción completa del contenido:
            </label>
            <textarea
              rows={4}
              placeholder="Explica detalladamente qué temas cubre, cómo está organizado, qué ejercicios o asesoría incluye..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Etiquetas (separadas por coma):
            </label>
            <input
              type="text"
              placeholder="Ej. cálculo, fórmulas, parcial, civil moyobamba"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
          </div>

          {/* Declaración de responsabilidad */}
          <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wider text-slate-700">Declaración de responsabilidad</legend>
            <p className="text-xs text-slate-600">{editing ? 'Al guardar los cambios, declaro que:' : 'Al publicar, declaro que:'}</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {RESPONSIBILITY_POINTS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <label htmlFor="integrity-check" className="flex items-start gap-2.5 pt-2 border-t border-slate-200 cursor-pointer">
              <input
                id="integrity-check"
                type="checkbox"
                checked={academicIntegrityChecked}
                onChange={(e) => setAcademicIntegrityChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-red-600"
              />
              <span className="text-xs font-semibold text-slate-900">
                Me hago responsable de lo que publico y acepto que los administradores pueden ocultar o eliminar esta
                publicación si incumple estas condiciones.
              </span>
            </label>
          </fieldset>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition-all"
            >
              {isSaving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
