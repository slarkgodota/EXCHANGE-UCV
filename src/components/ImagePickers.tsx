import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { Avatar } from './Avatar';
import { ProfileCover } from './ProfileView';
import { checkImageFile, IMAGE_TYPES, ImageKind } from '../utils/imageTools';
import type { StudentUser } from '../types/exchange';

/** Sube la imagen apenas se elige (sin pasos extra) y avisa si algo falla. */
function useImageUpload(kind: ImageKind, onError?: (msg: string | null) => void) {
  const { uploadProfileImage } = useExchange();
  const [busy, setBusy] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    const err = checkImageFile(file);
    if (err) return onError?.(err);
    onError?.(null);
    setBusy(true);
    const res = await uploadProfileImage(kind, file);
    setBusy(false);
    if (!res.ok) onError?.(res.error || 'No se pudo subir la imagen. Inténtalo otra vez.');
  };
  return { busy, upload };
}

/**
 * Portada que se cambia con un solo toque: se toca (o se arrastra una foto encima),
 * se elige la imagen y se guarda sola.
 */
export const CoverPicker: React.FC<{
  user: Pick<StudentUser, 'cover' | 'accent' | 'career' | 'name'>;
  className?: string;
  onError?: (msg: string | null) => void;
}> = ({ user, className = '', onError }) => {
  const { removeProfileImage } = useExchange();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const { busy, upload } = useImageUpload('cover', onError);
  const hasCover = !!user.cover;

  return (
    <div
      className={`group relative ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(e.dataTransfer.files?.[0]);
      }}
    >
      <ProfileCover user={user} className="absolute inset-0" />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={hasCover ? 'Cambiar foto de portada' : 'Poner foto de portada'}
        className={`absolute inset-0 w-full flex items-center justify-center transition ${
          over ? 'bg-black/45' : hasCover ? 'bg-black/0 hover:bg-black/30' : 'bg-black/10 hover:bg-black/25'
        }`}
      >
        <span
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 text-white text-sm font-semibold backdrop-blur transition ${
            busy || over || !hasCover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
          }`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {busy ? 'Subiendo portada…' : over ? 'Suelta la foto aquí' : hasCover ? 'Cambiar portada' : 'Toca para poner una portada'}
        </span>
      </button>
      {/* En celulares no hay "pasar el mouse": este botón siempre se ve */}
      <div className="absolute right-3 top-3 flex gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow"
        >
          <Camera className="w-4 h-4" /> {hasCover ? 'Cambiar portada' : 'Poner portada'}
        </button>
        {hasCover && !busy && (
          <button
            type="button"
            onClick={() => removeProfileImage('cover')}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-red-700 shadow"
            aria-label="Quitar portada"
            title="Quitar portada"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        data-kind="cover"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
};

/** Foto de perfil con botón de cámara: se toca, se elige y se guarda sola. */
export const AvatarPicker: React.FC<{
  user: Pick<StudentUser, 'avatar' | 'name'>;
  size?: 'xl' | '2xl';
  className?: string;
  onError?: (msg: string | null) => void;
}> = ({ user, size = 'xl', className = '', onError }) => {
  const input = useRef<HTMLInputElement>(null);
  const { busy, upload } = useImageUpload('avatar', onError);
  return (
    <div className={`relative shrink-0 w-fit self-start ${className}`}>
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="block rounded-full" aria-label="Cambiar foto de perfil" title="Cambiar foto de perfil">
        <Avatar name={user.name} src={user.avatar} size={size} className="ring-4 ring-white shadow-xl bg-white" />
      </button>
      {busy && (
        <span className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </span>
      )}
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center shadow ring-2 ring-white"
        aria-label="Cambiar foto"
        title="Cambiar foto"
      >
        <Camera className="w-4 h-4" />
      </button>
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        data-kind="avatar"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
};
