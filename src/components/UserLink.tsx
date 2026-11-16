import React from 'react';
import { useExchange } from '../context/ExchangeContext';
import { goToProfile } from '../utils/router';

/** Nombre (o avatar) que abre el perfil público del usuario. Cierra el detalle si está abierto. */
export const UserLink: React.FC<{ userId?: string; className?: string; children: React.ReactNode; title?: string }> = ({
  userId,
  className = '',
  children,
  title,
}) => {
  const { users, setSelectedPublication, setIsAuthModalOpen } = useExchange();
  if (!userId || !users.some((u) => u.id === userId)) return <span className={className}>{children}</span>;
  const open = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPublication(null);
    setIsAuthModalOpen(false);
    goToProfile(userId);
  };
  return (
    <button
      type="button"
      onClick={open}
      title={title || 'Ver perfil'}
      className={`text-left hover:underline underline-offset-2 decoration-2 focus-visible:underline ${className}`}
    >
      {children}
    </button>
  );
};
