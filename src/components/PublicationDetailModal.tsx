import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Share2,
  AlertTriangle,
  BadgeCheck,
  Send,
  Building,
  Calendar,
  FileText,
  Video,
  FileCode,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Lock,
  Brain,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { calculateRatingDistribution } from '../utils/exchangeLogic';
import { publicAsset } from '../utils/publicAsset';

export const PublicationDetailModal: React.FC = () => {
  const {
    selectedPublication,
    setSelectedPublication,
    setIsContactModalOpen,
    addReview,
    reportPublication,
    currentUser,
    runAIAuditOnPublication,
  } = useExchange();

  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');
  const [isAuditingLive, setIsAuditingLive] = useState<boolean>(false);
  
  // Plagiarism report toggle
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<'plagio' | 'material_inapropiado' | 'informacion_falsa' | 'otro'>('plagio');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<string>('');

  // Download simulation
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!selectedPublication) return null;

  const pub = selectedPublication;
  const ratingData = calculateRatingDistribution(pub.reviews);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsSubmittingReview(true);
    addReview(pub.id, ratingInput, commentInput.trim());
    setCommentInput('');
    setIsSubmittingReview(false);
    setReviewSuccessMsg('¡Gracias por tu valoración! Tu opinión ayuda a la comunidad UCV.');
    setTimeout(() => setReviewSuccessMsg(''), 4000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;

    reportPublication({
      publicationId: pub.id,
      publicationTitle: pub.title,
      reason: reportReason,
      details: reportDetails.trim(),
    });
    setReportSuccess('Reporte guardado en esta demostración local.');
    setShowReportForm(false);
    setReportDetails('');
    setTimeout(() => setReportSuccess(''), 5000);
  };

  const handleDownloadSim = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleLiveAIAudit = async () => {
    if (!pub) return;
    setIsAuditingLive(true);
    try {
      await runAIAuditOnPublication(pub.id);
    } finally {
      setIsAuditingLive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img
              src={publicAsset('assets/logo_ucv_alt.png')}
              alt="UCV"
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Universidad César Vallejo • Ficha Académica Nacional
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReportForm(!showReportForm)}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
              title="Reportar según normas de integridad y derechos de autor UCV"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Reportar irregularidad
            </button>

            <button
              type="button"
              onClick={() => setSelectedPublication(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8 divide-y divide-slate-100">
          {/* Top section: Title, Tags & Main info */}
          <div className="space-y-4">
            {reportSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {reportSuccess}
              </div>
            )}

            {/* Plagiarism report inline drawer */}
            {showReportForm && (
              <form
                onSubmit={handleReportSubmit}
                className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs space-y-3"
              >
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Módulo de Integridad y Derechos de Autor (Artículo 10 del Proyecto)
                </div>
                <p className="text-red-700 text-[11px]">
                  Los materiales en Exchange UCV deben servir para aprender, no para plagio ni copias no autorizadas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Motivo:</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as any)}
                      className="w-full bg-white border border-red-300 rounded-lg p-2 text-xs"
                    >
                      <option value="plagio">Posible plagio o copia de trabajo</option>
                      <option value="material_inapropiado">Material inapropiado o spam</option>
                      <option value="informacion_falsa">Datos de autor falsificados</option>
                      <option value="otro">Otro incumplimiento ético</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Detalles / Evidencia:</label>
                    <input
                      type="text"
                      placeholder="Explica brevemente la razón..."
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      className="w-full bg-white border border-red-300 rounded-lg p-2 text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                  >
                    Enviar Reporte a Moderación
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                {pub.category === 'materiales'
                  ? 'Material Académico'
                  : pub.category === 'conocimientos'
                  ? 'Intercambio de Conocimientos'
                  : 'Equipo de Investigación'}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {pub.career}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                {pub.cycleLevel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {pub.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4 text-slate-400" />
                Curso: <strong className="text-slate-800 ml-1">{pub.course}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Publicado el: <span className="text-slate-800 ml-1">{pub.createdAt}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4 text-slate-400" />
                Intercambios & descargas: <strong className="text-slate-800 ml-1">{pub.downloadCount}</strong>
              </span>
            </div>

            {/* Description */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-sm text-slate-700 leading-relaxed space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Descripción y Contenido Académico:
              </h4>
              <p className="whitespace-pre-line">{pub.description}</p>
            </div>

            {/* Action Bar (Download + Contact student) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadSim}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all"
              >
                <Download className="w-4 h-4 text-red-400" />
                {downloadSuccess
                  ? '¡Descargado con éxito!'
                  : `Descargar Recurso (${pub.fileType || 'PDF'} • ${pub.fileSize || 'Digital'})`}
              </button>

              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                Solicitar Intercambio / Contactar a {pub.author.name.split(' ')[0]}
              </button>
            </div>
          </div>

          {/* Author Card & Credential Info */}
          <div className="pt-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Datos del Publicador (Comunidad UCV)
            </h3>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={pub.author.avatar}
                  alt={pub.author.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{pub.author.name}</h4>
                    {pub.author.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verificado UCV
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {pub.author.career} • Sede {pub.author.campus} ({pub.author.cycle})
                  </p>
                  <p className="text-xs text-slate-500 italic max-w-lg">{pub.author.bio}</p>
                </div>
              </div>

              {pub.author.orcid && (
                <a
                  href={`https://orcid.org/${pub.author.orcid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold shrink-0 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ORCID: {pub.author.orcid}
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>
              )}
            </div>
          </div>

          {/* AI ORIGINALITY & ACADEMIC INTEGRITY AUDIT (GEMINI 3.8 FLASH) */}
          <div className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Auditoría de Originalidad e Integridad Académica (Gemini 3.8 Flash)
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Evaluación inteligente de aporte pedagógico y prevención de plagio conforme al Art. 10 de Exchange UCV.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLiveAIAudit}
                disabled={isAuditingLive}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                {isAuditingLive ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    <span>Auditando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{pub.aiAudit ? 'Re-auditar con IA' : 'Auditar con IA Ahora'}</span>
                  </>
                )}
              </button>
            </div>

            {pub.aiAudit ? (
              <div className="bg-gradient-to-br from-slate-900 via-[#131b34] to-[#250d15] text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-400 font-display">
                      {pub.aiAudit.originalityScore}%
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Originalidad & Aporte Formativo
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {pub.aiAudit.analyzedAt ? `Auditado el ${pub.aiAudit.analyzedAt}` : 'Certificado oficial UCV'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      pub.aiAudit.verdict === 'APROBADO_INTEGRO'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : pub.aiAudit.verdict === 'REQUIERE_CITACION'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {pub.aiAudit.verdict === 'APROBADO_INTEGRO'
                      ? 'Aprobado Íntegro'
                      : pub.aiAudit.verdict === 'REQUIERE_CITACION'
                      ? 'Requiere Citas Adicionales'
                      : 'Revisión por Similitud'}
                  </span>
                </div>

                {/* Gauge bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(5, pub.aiAudit.originalityScore))}%` }}
                  />
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {pub.aiAudit.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 block text-xs">Fortalezas del Material:</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      {pub.aiAudit.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 block text-xs">Recomendaciones Éticas:</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                      {pub.aiAudit.suggestions.map((sug, idx) => (
                        <li key={idx}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {pub.aiAudit.academicIntegrityNote}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">Auditoría IA UCV Grupo 5</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-slate-400" />
                  Este material aún no ha sido auditado con el modelo de IA.
                </span>
                <button
                  type="button"
                  onClick={handleLiveAIAudit}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Ejecutar Auditoría Ahora
                </button>
              </div>
            )}
          </div>

          {/* 5-STAR RATING & REVIEWS TABLE (Requested by User) */}
          <div className="pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Tabla de Valoración de 5 Estrellas
                </h3>
                <p className="text-xs text-slate-500">
                  Opiniones y calificaciones reales de estudiantes que accedieron a este material o asesoría.
                </p>
              </div>

              <span className="text-xs px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold">
                {ratingData.total} {ratingData.total === 1 ? 'opinión registrada' : 'opiniones registradas'}
              </span>
            </div>

            {/* Rating Breakdown Grid */}
            <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/90 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Overall Score */}
              <div className="md:col-span-4 text-center md:border-r md:border-slate-200 md:pr-6 space-y-2">
                <div className="text-5xl font-black text-slate-900 font-display">
                  {ratingData.average.toFixed(1)}
                </div>
                <div className="flex justify-center text-amber-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(ratingData.average)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Promedio de {ratingData.total} valoraciones verificadas
                </p>
              </div>

              {/* 5-Star Distribution Table */}
              <div className="md:col-span-8 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingData.distribution[stars] || 0;
                  const pct = ratingData.percentages[stars] || 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <div className="w-16 font-semibold text-slate-700 flex items-center gap-1">
                        <span>{stars}</span>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </div>

                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="w-14 text-right font-medium text-slate-500">
                        {count} ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Submission Form */}
            <form
              onSubmit={handleSubmitReview}
              className="bg-white p-5 rounded-2xl border-2 border-dashed border-slate-200 space-y-3"
            >
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                Dejar tu opinión y valorar este recurso como {currentUser?.name || 'Estudiante UCV'}
              </h4>

              {reviewSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {reviewSuccessMsg}
                </div>
              )}

              {/* Star selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Tu calificación:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= ratingInput
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600">{ratingInput} de 5 estrellas</span>
              </div>

              {/* Comment text */}
              <div>
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Escribe tu opinión académica sobre este material o cómo te ayudó en tus estudios..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Tu valoración se publicará con tu cuenta estudiantil UCV.
                </span>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-colors"
                >
                  Publicar Valoración 5★
                </button>
              </div>
            </form>

            {/* List of Student Comments */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 text-sm">
                Comentarios de Estudiantes ({pub.reviews.length})
              </h4>

              {pub.reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                  Aún no hay valoraciones para este recurso. ¡Sé el primero en calificarlo!
                </div>
              ) : (
                pub.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {rev.authorAvatar ? (
                          <img
                            src={rev.authorAvatar}
                            alt={rev.authorName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center">
                            {rev.authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">
                              {rev.authorName}
                            </span>
                            {rev.verifiedExchange && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                                Intercambio Verificado
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {rev.authorCareer} • {rev.createdAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pl-9 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>ID de recurso: {pub.id}</span>
          <button
            type="button"
            onClick={() => setSelectedPublication(null)}
            className="font-semibold text-slate-700 hover:text-red-700"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
