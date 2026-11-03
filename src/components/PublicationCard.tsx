import React from 'react';
import {
  Star,
  Download,
  MessageSquare,
  BadgeCheck,
  ShieldCheck,
  FileText,
  Video,
  FileCode,
  Layers,
  ArrowUpRight,
  Send,
  Building,
} from 'lucide-react';
import { Publication } from '../types/exchange';
import { useExchange } from '../context/ExchangeContext';

interface PublicationCardProps {
  publication: Publication;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({ publication }) => {
  const { setSelectedPublication, setIsContactModalOpen } = useExchange();

  const getCategoryStyles = () => {
    switch (publication.category) {
      case 'materiales':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Material de Estudio',
        };
      case 'conocimientos':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Tutoría / Asesoría',
        };
      case 'investigacion':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Equipo de Investigación',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          label: 'Académico',
        };
    }
  };

  const getFileIcon = () => {
    if (publication.fileType === 'Sesión Google Meet') {
      return <Video className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (publication.fileType === 'ZIP') {
      return <FileCode className="w-3.5 h-3.5 text-amber-600" />;
    }
    return <FileText className="w-3.5 h-3.5 text-rose-600" />;
  };

  const catStyle = getCategoryStyles();

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 card-3d-hover flex flex-col justify-between overflow-hidden">
      {/* Top Banner accent if featured */}
      {publication.status === 'destacado' && (
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-bold tracking-wider uppercase py-1 px-4 text-center">
          ★ Publicación Destacada UCV
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Badges row: Category + Career */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${catStyle.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
            {catStyle.label}
          </span>

          <div className="flex items-center gap-1.5">
            {publication.aiAudit && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                title={`Auditoría IA UCV: ${publication.aiAudit.originalityScore}% original`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{publication.aiAudit.originalityScore}% IA</span>
              </span>
            )}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {publication.cycleLevel}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => setSelectedPublication(publication)}
          className="font-bold text-slate-900 text-base group-hover:text-red-700 transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
        >
          {publication.title}
        </h3>

        {/* Course & Career info */}
        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700">{publication.career}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 truncate">{publication.course}</span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 flex-1">
          {publication.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {publication.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/60"
            >
              #{tag}
            </span>
          ))}
          {publication.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 px-1 py-0.5">
              +{publication.tags.length - 3}
            </span>
          )}
        </div>

        {/* 5-Star Rating & Reviews summary */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(publication.ratingAverage)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800 ml-1">
              {publication.ratingAverage.toFixed(1)}
            </span>
            <span className="text-[11px] text-slate-400">
              ({publication.ratingCount || publication.reviews.length})
            </span>
          </div>

          {/* Stats: Downloads / Views */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              {getFileIcon()}
              {publication.fileType || 'Doc'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-0.5">
              <Download className="w-3 h-3 text-slate-400" />
              {publication.downloadCount}
            </span>
          </div>
        </div>

        {/* Author information (Real UCV Student / Docente) */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={publication.author.avatar}
              alt={publication.author.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {publication.author.name}
                </span>
                {publication.author.verified && (
                  <span title="Estudiante UCV Verificado">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                Sede {publication.author.campus}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            {publication.exchangeType === 'Intercambio Académico' ? 'Intercambio' : 'Colaborativo'}
          </span>
        </div>
      </div>

      {/* Action Footer: Mercado Libre / Fiverr style buttons */}
      <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSelectedPublication(publication)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          Ver y Opinar
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPublication(publication);
            setIsContactModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-sm shadow-red-600/20 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Contactar
        </button>
      </div>
    </div>
  );
};
