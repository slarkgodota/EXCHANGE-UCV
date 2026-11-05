import React from 'react';
import { X, BookOpen, GraduationCap, Award, ExternalLink, CheckCircle, FileText } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const ProjectInfoModal: React.FC = () => {
  const { isProjectInfoModalOpen, setIsProjectInfoModalOpen } = useExchange();

  if (!isProjectInfoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-700 via-rose-700 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
              <img
                src="/assets/logo_ucv_alt.png"
                alt="Escudo UCV"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-base">Ficha del Proyecto: Exchange UCV</h3>
              <p className="text-[11px] text-red-200">
                Grupo 5 • Escuela Profesional de Ingeniería Civil • UCV Moyobamba (2026)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProjectInfoModalOpen(false)}
            className="p-1 rounded-full text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Institutional Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider">
              Universidad César Vallejo
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Facultad de Ingeniería Civil • Escuela Profesional de Ingeniería Civil
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>
                <strong>Línea de Investigación:</strong>
                <p>Educación y Calidad Educativa</p>
              </div>
              <div>
                <strong>Línea de RSU:</strong>
                <p>Apoyo a la reducción de brechas y carencias en la educación en todos sus niveles</p>
              </div>
            </div>
          </div>

          {/* Authors List */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              Equipo de Autores e Investigadores:
            </h5>
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900">DELGADO CERDÁN, Michael Jefferson</strong>{' '}
                <a href="https://orcid.org/0009-0004-9087-2490" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline text-[11px] whitespace-nowrap">
                  (orcid.org/0009-0004-9087-2490)
                </a>
                <span className="block"><span className="text-slate-500 text-[11px]">Estudiante de Ingeniería Civil</span></span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900">GONZALEZ GUEVARA, José Roly</strong>{' '}
                <a href="https://orcid.org/0009-0008-6874-4045" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline text-[11px] whitespace-nowrap">
                  (orcid.org/0009-0008-6874-4045)
                </a>
                <span className="block"><span className="text-slate-500 text-[11px]">Estudiante de Ingeniería Civil</span></span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-900">GRANDEZ ACOSTA, Michael Cristofer</strong>{' '}
                <a href="https://orcid.org/0009-0004-9770-9557" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline text-[11px] whitespace-nowrap">
                  (orcid.org/0009-0004-9770-9557)
                </a>
                <span className="block"><span className="text-slate-500 text-[11px]">Estudiante de Ingeniería Civil</span></span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <strong className="text-amber-950">Docente Asesor: Ing. Alex Tongo Silva</strong>{' '}
                <a href="https://orcid.org/0000-0001-5503-3692" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline text-[11px] whitespace-nowrap">
                  (orcid.org/0000-0001-5503-3692)
                </a>
                <span className="block"><span className="text-amber-800 text-[11px]">Docente del curso</span></span>
              </div>
            </div>
          </div>

          {/* 3 Core Problems solved */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              Los 3 problemas identificados
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <strong className="text-rose-900 block mb-1">1. Materiales de Estudio</strong>
                <p className="text-[11px] text-rose-800">
                  Resúmenes, apuntes, mapas conceptuales y fórmulas organizados por carrera y ciclo.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <strong className="text-blue-900 block mb-1">2. Conocimientos</strong>
                <p className="text-[11px] text-blue-800">
                  Estudiantes con dominio en temas asesoran a compañeros que necesitan reforzamiento.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <strong className="text-emerald-900 block mb-1">3. Equipos de Investigación</strong>
                <p className="text-[11px] text-emerald-800">
                  Espacio para encontrar colaboradores con habilidades afines para proyectos y tesis.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            <strong>Aclaración del proyecto:</strong> Exchange UCV es un prototipo inicial elaborado por estudiantes. No está
            integrado a Trilce ni es una herramienta oficial de la Universidad César Vallejo. El siguiente paso propuesto es
            validar la idea con encuestas a estudiantes de distintas carreras.
          </div>

          {/* Original PDF download link */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Documento PDF Original: <strong>PROYECTO_EXCHANGE_UCV__GRUPO_5.pdf</strong></span>
            </div>
            <a
              href="/docs/PROYECTO_EXCHANGE_UCV_GRUPO_5.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-red-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              Ver PDF
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setIsProjectInfoModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
