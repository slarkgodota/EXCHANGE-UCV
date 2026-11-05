import React from 'react';
import { useExchange } from '../context/ExchangeContext';

/** Enlace ORCID pequeño para poner al lado de un nombre: (orcid.org/0000-0000-0000-0000) */
export const Orcid: React.FC<{ orcid?: string; className?: string }> = ({ orcid, className = '' }) => {
  if (!orcid) return null;
  return (
    <a
      href={`https://orcid.org/${orcid}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`text-[11px] font-medium text-emerald-700 hover:underline whitespace-nowrap ${className}`}
      title="Ver perfil ORCID"
    >
      (orcid.org/{orcid})
    </a>
  );
};

/** Busca el ORCID de una persona por su id o correo entre los usuarios registrados. */
export const OrcidFor: React.FC<{ userId?: string; email?: string; className?: string }> = ({ userId, email, className }) => {
  const { users } = useExchange();
  const u = users.find((x) => (userId && x.id === userId) || (email && x.email.toLowerCase() === email.toLowerCase()));
  return <Orcid orcid={u?.orcid} className={className} />;
};

/** Valida el formato 0000-0000-0000-000X */
export const isValidOrcid = (v: string) => /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(v.trim());
