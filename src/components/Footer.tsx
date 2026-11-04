import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';

export const Footer: React.FC = () => {
  const { setIsProjectInfoModalOpen } = useExchange();

  return (
    <footer className="bg-[#0a1430] text-slate-400 mt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="font-display text-lg font-bold text-white">
            Exchange<span className="text-red-500">UCV</span>
          </p>
          <p className="mt-2 max-w-xs">Comparte, aprende y colabora con estudiantes de la Universidad César Vallejo.</p>
        </div>
        <nav className="flex flex-col gap-2" aria-label="Pie de página">
          <button type="button" onClick={() => goTo('catalogo')} className="text-left hover:text-white">Catálogo</button>
          <button type="button" onClick={() => goTo('biblioteca')} className="text-left hover:text-white">Biblioteca</button>
          <button type="button" onClick={() => goTo('sedes')} className="text-left hover:text-white">Sedes UCV</button>
          <button type="button" onClick={() => setIsProjectInfoModalOpen(true)} className="text-left hover:text-white">Sobre el proyecto</button>
        </nav>
        <div>
          <p className="text-white font-semibold">Grupo 5 · Ingeniería Civil · UCV Moyobamba</p>
          <p className="mt-2">Delgado Cerdán, M. J. · Gonzalez Guevara, J. R. · Grandez Acosta, M. C.</p>
          <p className="mt-1">Docente: Ing. Alex Tongo Silva</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs">
          © 2026 Exchange UCV · Comparte solo material propio o de libre acceso y cita tus fuentes.
        </p>
      </div>
    </footer>
  );
};
