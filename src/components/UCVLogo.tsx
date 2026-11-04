import React from 'react';

interface UCVLogoProps {
  className?: string;
  variant?: 'full' | 'isotype' | 'badge' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const UCVLogo: React.FC<UCVLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const getSizeHeight = () => {
    switch (size) {
      case 'sm':
        return 'h-7';
      case 'lg':
        return 'h-12';
      case 'xl':
        return 'h-20';
      case 'md':
      default:
        return 'h-9';
    }
  };

  // Official high-resolution transparent UCV Isotype and Full Logo
  const isotypeImg = (
    <img
      src="/assets/logo_ucv_alt.png"
      alt="Escudo Oficial Universidad César Vallejo"
      className={`${getSizeHeight()} w-auto object-contain shrink-0 ${className}`}
      loading="eager"
    />
  );

  const fullLogoImg = (
    <img
      src="/assets/logo_ucv_oficial.png"
      alt="Logotipo Oficial Universidad César Vallejo"
      className={`${getSizeHeight()} w-auto object-contain shrink-0 ${className}`}
      loading="eager"
    />
  );

  if (variant === 'isotype') {
    return isotypeImg;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs ${className}`}>
        {isotypeImg}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#AB2A30] leading-tight">
            Universidad
          </span>
          <span className="text-xs font-bold text-[#14234b] leading-tight">
            César Vallejo
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'white') {
    return (
      <div className={`inline-flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-white/20 ${className}`}>
        {fullLogoImg}
      </div>
    );
  }

  // Default: Official full horizontal logo with isotype & text
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {fullLogoImg}
    </div>
  );
};
