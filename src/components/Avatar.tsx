import React from 'react';
import { getInitials } from '../utils/security';
import { safeImageSrc } from '../utils/imageTools';

const PALETTE = [
  'bg-red-100 text-red-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-800',
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 sm:w-32 sm:h-32 text-4xl',
};

interface AvatarProps {
  name: string;
  src?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Foto del usuario si existe; si no, sus iniciales. Nunca usa fotos de stock. */
export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'sm', className = '' }) => {
  const [broken, setBroken] = React.useState(false);
  const safe = broken ? undefined : safeImageSrc(src);
  if (safe) {
    return (
      <img
        src={safe}
        loading="lazy"
        onError={() => setBroken(true)}
        alt={name}
        className={`${SIZES[size]} rounded-full object-cover border border-white shadow-xs shrink-0 ${className}`}
      />
    );
  }
  return (
    <span
      aria-label={name}
      className={`${SIZES[size]} ${colorFor(name)} rounded-full font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {getInitials(name)}
    </span>
  );
};
