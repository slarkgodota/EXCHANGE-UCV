import React, { useState } from 'react';
import { Star } from 'lucide-react';

const SIZES = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

/** Muestra una valoración de 0 a 5 estrellas (admite medias por redondeo). */
export const StarDisplay: React.FC<{ value: number; count?: number; size?: keyof typeof SIZES; showValue?: boolean }> = ({
  value,
  count,
  size = 'sm',
  showValue = true,
}) => (
  <span className="inline-flex items-center gap-1" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${SIZES[size]} ${s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </span>
    {showValue &&
      (count && count > 0 ? (
        <span className="text-xs text-slate-600">
          <strong className="text-slate-900">{value.toFixed(1)}</strong> ({count})
        </span>
      ) : (
        <span className="text-xs text-slate-400">Sin valoraciones</span>
      ))}
  </span>
);

/** Selector interactivo de 1 a 5 estrellas. */
export const StarInput: React.FC<{ value: number; onChange: (v: number) => void; size?: keyof typeof SIZES; label?: string }> = ({
  value,
  onChange,
  size = 'md',
  label = 'Tu valoración',
}) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="inline-flex items-center" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} estrella${s > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(s)}
          onClick={() => onChange(s)}
          className="p-0.5 transition-transform hover:scale-125 active:scale-95"
        >
          <Star className={`${SIZES[size]} transition-colors ${s <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </span>
  );
};
