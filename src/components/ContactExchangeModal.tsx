import React, { useState } from 'react';
import { X, Send, User, MessageSquare, ArrowLeftRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { getCampusLabel } from '../data/ucv';

export const ContactExchangeModal: React.FC = () => {
  const {
    isContactModalOpen,
    setIsContactModalOpen,
    selectedPublication,
    sendContactRequest,
    currentUser,
    setIsRequestsDrawerOpen,
  } = useExchange();

  const [message, setMessage] = useState('');
  const [proposedExchange, setProposedExchange] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isContactModalOpen || !selectedPublication) return null;

  const pub = selectedPublication;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setError(null);
    const res = sendContactRequest({
      publicationId: pub.id,
      publicationTitle: pub.title,
      publicationCategory: pub.category,
      receiverId: pub.author.id,
      receiverName: pub.author.name,
      message: message.trim(),
      proposedExchange: proposedExchange.trim() || 'Sin propuesta específica',
    });
    if (!res.ok) {
      setError(res.error || 'No se pudo enviar la solicitud.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsContactModalOpen(false);
      setMessage('');
      setProposedExchange('');
      setIsRequestsDrawerOpen(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="font-bold text-sm">Coordinar Intercambio Académico</h3>
              <p className="text-[11px] text-slate-300">Conectar con compañero de la UCV</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsContactModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">¡Solicitud Enviada con Éxito!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              La solicitud quedó registrada para <strong>{pub.author.name}</strong>. Verás su respuesta en tu bandeja de solicitudes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">{error}</div>
            )}
            {/* Target Publication summary card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recurso seleccionado:</span>
              <p className="font-bold text-slate-900 text-xs line-clamp-1">{pub.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span>Destinatario: <strong>{pub.author.name}</strong></span>
                <span>•</span>
                <span>{getCampusLabel(pub.author.campus)}</span>
              </div>
            </div>

            {/* What you offer in exchange */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ¿Qué ofreces a cambio o cómo coordinarás?
              </label>
              <input
                type="text"
                placeholder="Ej. Apuntes de Topografía, tutoría en cálculo, o ayuda en biblioteca..."
                value={proposedExchange}
                onChange={(e) => setProposedExchange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500/40 focus:outline-none"
              />
            </div>

            {/* Custom message */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mensaje personalizado:
              </label>
              <textarea
                rows={3}
                placeholder="Hola, me interesa tu material/asesoría para el curso de... ¿Podemos coordinar los detalles por WhatsApp o correo institucional?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500/40 focus:outline-none"
                required
              />
            </div>

            {/* Sender identity note */}
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-[11px] text-red-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Se enviará con tu identidad verificada: <strong>{currentUser?.name || 'Estudiante UCV'}</strong> ({currentUser?.email || 'estudiante@ucvvirtual.edu.pe'}).
              </span>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-600/30 hover:from-red-500 hover:to-rose-500 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Solicitud
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
