import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Brain,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { CategoryType, CareerType, AIOriginalityAuditResult } from '../types/exchange';
import { validateNewPublication } from '../utils/exchangeLogic';
import { publicAsset } from '../utils/publicAsset';

const CAREERS: CareerType[] = [
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Medicina Humana',
  'Derecho',
  'Psicología',
  'Administración',
  'Arquitectura',
  'Contabilidad',
  'Ciencias de la Comunicación',
  'General / Interdisciplinario',
];

export const CreatePublicationModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    addPublication,
    currentUser,
    auditPublicationWithAI,
  } = useExchange();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('materiales');
  const [career, setCareer] = useState<CareerType>(currentUser?.career || 'Ingeniería Civil');
  const [course, setCourse] = useState('');
  const [cycleLevel, setCycleLevel] = useState('Ciclo V');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'DOCX' | 'ZIP' | 'XLSX' | 'Sesión Google Meet'>('PDF');
  const [exchangeType, setExchangeType] = useState<'Intercambio Académico' | 'Gratuito / RSU' | 'Colaboración en Equipo'>('Intercambio Académico');
  const [academicIntegrityChecked, setAcademicIntegrityChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI Originality Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AIOriginalityAuditResult | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  if (!isCreateModalOpen) return null;

  const handleRunAIAudit = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Por favor ingresa al menos el título y la descripción para que la IA evalúe la originalidad.');
      return;
    }
    setErrorMsg(null);
    setAuditError(null);
    setIsAuditing(true);
    try {
      const res = await auditPublicationWithAI({
        title: title.trim(),
        course: course.trim() || 'Curso General',
        career,
        description: description.trim(),
        category,
        exchangeType,
      });
      setAuditResult(res);
      // Auto-check the integrity declaration if the result is approved
      if (res.verdict === 'APROBADO_INTEGRO') {
        setAcademicIntegrityChecked(true);
      }
    } catch (e: any) {
      setAuditError('No se pudo completar la auditoría con IA. Podrás publicar y auditarlo más tarde.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    addPublication({
      title: title.trim(),
      description: description.trim(),
      category,
      career,
      course: course.trim(),
      cycleLevel,
      tags: tags.length > 0 ? tags : [course.trim()],
      exchangeType,
      fileType,
      fileSize: fileType === 'Sesión Google Meet' ? 'Online' : '4.2 MB',
      aiAudit: auditResult || undefined,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setCourse('');
    setTagsInput('');
    setAuditResult(null);
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
                src={publicAsset('assets/logo_ucv_alt.png')}
                alt="UCV"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-base">Nueva Publicación en Exchange UCV</h2>
              <p className="text-[11px] text-red-100">
                Comparte apuntes, tutorías o convoca investigadores en todas las sedes del Perú
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(false)}
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
                onClick={() => setCategory('materiales')}
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
                onClick={() => setCategory('conocimientos')}
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
                onClick={() => setCategory('investigacion')}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Intercambio:
              </label>
              <select
                value={exchangeType}
                onChange={(e) => setExchangeType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Intercambio Académico">Intercambio Académico</option>
                <option value="Gratuito / RSU">Gratuito / RSU</option>
                <option value="Colaboración en Equipo">Colaboración en Equipo</option>
              </select>
            </div>
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

          {/* AI Originality & Academic Integrity Audit Section */}
          <div className="bg-gradient-to-br from-slate-900 to-[#19223c] rounded-2xl p-4 text-white space-y-3 border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-red-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-100">
                    Auditoría de Originalidad con IA (Gemini 3.8 Flash)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300">
                  Verifica preventivamente que tu material cumpla con el Art. 10 de Integridad de la UCV antes de publicar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunAIAudit}
                disabled={isAuditing}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Auditando con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{auditResult ? 'Re-analizar Originalidad' : 'Analizar Originalidad con IA'}</span>
                  </>
                )}
              </button>
            </div>

            {auditError && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{auditError}</span>
              </div>
            )}

            {auditResult && (
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-700/80 space-y-3 animate-fadeIn text-xs">
                {/* Score and Verdict Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-400 font-display">
                        {auditResult.originalityScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Originalidad estimada</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      auditResult.verdict === 'APROBADO_INTEGRO'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : auditResult.verdict === 'REQUIERE_CITACION'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {auditResult.verdict === 'APROBADO_INTEGRO'
                      ? 'Aprobado Íntegro'
                      : auditResult.verdict === 'REQUIERE_CITACION'
                      ? 'Requiere Citas Formato UCV'
                      : 'Posible Riesgo de Similitud'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(5, auditResult.originalityScore))}%` }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {auditResult.summary}
                </p>

                {/* Strengths & Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="font-bold text-emerald-400 block">Fortalezas Académicas:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {auditResult.strengths.slice(0, 2).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="font-bold text-amber-300 block">Recomendaciones Éticas:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {auditResult.suggestions.slice(0, 2).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{auditResult.academicIntegrityNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* Anti-plagiarism Declaration (Section 10 of PDF) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-start gap-3">
              <input
                id="integrity-check"
                type="checkbox"
                checked={academicIntegrityChecked}
                onChange={(e) => setAcademicIntegrityChecked(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
              />
              <label htmlFor="integrity-check" className="text-xs text-amber-900 leading-relaxed">
                <strong>Declaración de Integridad y Derechos de Autor UCV:</strong> Declaro que este material o propuesta es de mi autoría o legítimo para intercambio formativo, y no promueve el plagio ni la copia indebida, conforme a las políticas del proyecto Exchange UCV Grupo 5.
              </label>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition-all"
            >
              Publicar Inmediatamente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
