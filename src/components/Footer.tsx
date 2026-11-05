import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { goTo } from '../utils/router';

const AUTHORS = [
  { name: 'DELGADO CERDÁN, Michael Jefferson', orcid: '0009-0004-9087-2490' },
  { name: 'GONZALEZ GUEVARA, José Roly', orcid: '0009-0008-6874-4045' },
  { name: 'GRANDEZ ACOSTA, Michael Cristofer', orcid: '0009-0004-9770-9557' },
  { name: 'Docente: Ing. Alex Tongo Silva', orcid: '0000-0001-5503-3692', docente: true },
];

export const Footer: React.FC = () => {
  const { setIsProjectInfoModalOpen, syncStatus } = useExchange();

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
          <ul className="mt-2 space-y-1.5">
            {AUTHORS.map((a) => (
              <li key={a.orcid}>
                <span className={a.docente ? 'text-amber-300' : 'text-slate-300'}>{a.name}</span>{' '}
                <a href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 hover:underline text-xs whitespace-nowrap">
                  (orcid.org/{a.orcid})
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs">
          © 2026 Exchange UCV · Comparte solo material propio o de libre acceso y cita tus fuentes.
          <span className="ml-3 inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'online' ? 'bg-emerald-400' : syncStatus === 'loading' ? 'bg-amber-400' : syncStatus === 'error' ? 'bg-red-500' : 'bg-slate-500'}`} />
            {syncStatus === 'online' ? 'Datos compartidos en línea' : syncStatus === 'loading' ? 'Conectando…' : syncStatus === 'error' ? 'Sin conexión con la base de datos' : 'Guardado en este navegador'}
          </span>
        </p>
      </div>
    </footer>
  );
};
