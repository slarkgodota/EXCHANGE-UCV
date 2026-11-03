import React from 'react';
import { ShieldCheck, BookOpen, GraduationCap, Award, Heart } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { UCVLogo } from './UCVLogo';
import { publicAsset } from '../utils/publicAsset';

export const Footer: React.FC = () => {
  const { setIsProjectInfoModalOpen, setIsAdminModalOpen, isCreatorOrAdmin } = useExchange();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800/80">
          {/* Col 1: Brand & University info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl shadow-sm">
                <img
                  src={publicAsset('assets/logo_ucv_oficial.png')}
                  alt="Universidad César Vallejo"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Plataforma digital universitaria para compartir conocimientos, intercambiar materiales académicos legítimos y formar equipos de investigación entre estudiantes de la Universidad César Vallejo en todas las sedes del Perú.
            </p>

            <div className="text-xs text-slate-400 space-y-1">
              <p><strong>Universidad:</strong> Universidad César Vallejo (UCV)</p>
              <p><strong>Cobertura:</strong> Red Nacional de Campus y Sedes en todo el Perú</p>
              <p><strong>Facultad de Origen del Proyecto:</strong> Ingeniería Civil (2026)</p>
            </div>
          </div>

          {/* Col 2: Investigation & Academic Lines */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Investigación y Responsabilidad Social (RSU)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-200 block">Línea de Investigación Institucional:</strong>
                <span className="text-slate-400">Educación y Calidad Educativa</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-200 block">Línea de Responsabilidad Social (RSU):</strong>
                <span className="text-slate-400">
                  Apoyo a la reducción de brechas y carencias en la educación en todos sus niveles
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Project information */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Sobre Exchange UCV
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              Prototipo académico para explorar el intercambio de materiales,
              tutorías entre pares y colaboración en proyectos de investigación.
              Los perfiles y publicaciones iniciales son datos ficticios.
            </p>
          </div>
        </div>

        {/* Section 10 Legal Notice & Copyright Statement */}
        <div className="pt-8 space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Política de Uso Responsable y Derechos de Autor (Sección 10 del Proyecto Exchange UCV)
            </div>
            <p>
              La plataforma protege los datos personales de la comunidad universitaria y promueve el aprendizaje colaborativo.
              Los recursos académicos compartidos deben servir estrictamente como material de estudio y consulta formativa, prohibiéndose el plagio o la copia no autorizada de evaluaciones y trabajos prácticos conforme a los reglamentos de ética académica de la Universidad César Vallejo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 pt-2">
            <div>
              <p className="font-semibold text-slate-300">
                © 2026 Exchange UCV - Grupo 5. Todos los derechos reservados.
              </p>
              <p className="text-[11px] text-slate-400">
                Universidad César Vallejo • Red de Sedes a Nivel Nacional (Perú).
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <button
                type="button"
                onClick={() => setIsProjectInfoModalOpen(true)}
                className="hover:text-white transition-colors"
              >
                Información del proyecto
              </button>
              {isCreatorOrAdmin && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(true)}
                    className="hover:text-white transition-colors text-red-400 font-semibold"
                  >
                    Auditoría y Monitoreo (Admin)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
