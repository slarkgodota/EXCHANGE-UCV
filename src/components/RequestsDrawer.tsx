import React, { useState } from 'react';
import {
  X,
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Building,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const RequestsDrawer: React.FC = () => {
  const {
    isRequestsDrawerOpen,
    setIsRequestsDrawerOpen,
    requests,
    currentUser,
    updateRequestStatus,
  } = useExchange();

  const [activeTab, setActiveTab] = useState<'recibidas' | 'enviadas'>('recibidas');

  if (!isRequestsDrawerOpen) return null;

  const receivedRequests = currentUser
    ? requests.filter((r) => r.receiverId === currentUser.id)
    : [];
  const sentRequests = currentUser
    ? requests.filter((r) => r.senderId === currentUser.id)
    : [];

  const displayList = activeTab === 'recibidas' ? receivedRequests : sentRequests;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aceptada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Aceptada
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Completada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="font-bold text-base">Bandeja de Intercambios</h3>
              <p className="text-[11px] text-slate-300">Coordinación directa entre estudiantes UCV</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRequestsDrawerOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Recibidas / Enviadas */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('recibidas')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'recibidas'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Recibidas ({receivedRequests.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enviadas')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'enviadas'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            Enviadas ({sentRequests.length})
          </button>
        </div>

        {/* Requests List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {displayList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">No tienes solicitudes en esta sección.</p>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'recibidas'
                  ? 'Cuando otros compañeros soliciten tus materiales aparecerán aquí.'
                  : 'Explora el catálogo para contactar a compañeros de tu carrera.'}
              </p>
            </div>
          ) : (
            displayList.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-red-600 uppercase">
                      {req.publicationCategory}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {req.publicationTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400">{req.createdAt}</p>
                  </div>

                  {getStatusBadge(req.status)}
                </div>

                {/* Sender or Receiver details */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold">
                      {activeTab === 'recibidas' ? req.senderName : req.receiverName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Sede {req.senderCampus}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Propuesta: "{req.proposedExchange}"
                  </p>
                </div>

                {/* Message body */}
                <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800 text-[11px] mb-1">Mensaje:</p>
                  <p className="leading-relaxed">{req.message}</p>
                </div>

                {/* Contact info if accepted */}
                {req.status === 'aceptada' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Canales directos de contacto:
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Mail className="w-3 h-3" />
                      <span>{req.senderEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Phone className="w-3 h-3" />
                      <span>{req.senderPhone}</span>
                    </div>
                  </div>
                )}

                {/* Action buttons for receiver */}
                {activeTab === 'recibidas' && req.status === 'pendiente' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => updateRequestStatus(req.id, 'rechazada')}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Declinar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRequestStatus(req.id, 'aceptada')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      Aceptar Intercambio
                    </button>
                  </div>
                )}

                {activeTab === 'recibidas' && req.status === 'aceptada' && (
                  <button
                    type="button"
                    onClick={() => updateRequestStatus(req.id, 'completada')}
                    className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                  >
                    Marcar como Intercambio Realizado
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
