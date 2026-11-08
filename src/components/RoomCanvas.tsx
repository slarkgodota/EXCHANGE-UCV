import React, { useEffect, useRef, useState } from 'react';
import { RoomId, ROOM_BY_ID } from '../data/rooms';
import { loadThree, webglAvailable } from '../three/loader';
import { buildRoom, BuiltRoom } from '../three/rooms3d';

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);
const easeOutBack = (k: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

interface Engine {
  T: any;
  renderer: any;
  scene: any;
  camera: any;
  hemi: any;
  sun: any;
  built: BuiltRoom | null;
  t: number;
  intro: number;
  pointer: { x: number; y: number; tx: number; ty: number };
  w: number;
  h: number;
}

/**
 * Lienzo 3D que muestra un cuarto. Al cambiar `room`, el cuarto actual se desvanece y el nuevo
 * entra girando con sus objetos apareciendo uno por uno (como un video corto).
 * - Se pausa cuando no está en pantalla.
 * - Si el navegador no tiene WebGL, muestra un fondo con el nombre del cuarto.
 * - Respeta "reducir movimiento" del sistema.
 */
export const RoomCanvas: React.FC<{ room: RoomId; align?: 'center' | 'right'; lift?: number; zoom?: number; className?: string; interactive?: boolean }> = ({
  room,
  align = 'center',
  lift = 0,
  zoom = 1,
  className = '',
  interactive = true,
}) => {
  const liftRef = useRef(lift);
  liftRef.current = lift;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const host = useRef<HTMLDivElement>(null);
  const eng = useRef<Engine | null>(null);
  const alignRef = useRef(align);
  alignRef.current = align;
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(() => (webglAvailable() ? 'loading' : 'failed'));
  const [fading, setFading] = useState(false);
  const meta = ROOM_BY_ID[room];

  // Motor: se crea una vez por lienzo
  useEffect(() => {
    if (status === 'failed') return;
    let disposed = false;
    let raf = 0;
    let visible = true;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const small = window.matchMedia?.('(max-width: 640px)').matches;

    loadThree()
      .then((T) => {
        if (disposed || !host.current) return;
        const renderer = new T.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.shadowMap.enabled = !small;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        renderer.setClearColor(0x000000, 0);
        const cv = renderer.domElement;
        cv.style.width = '100%';
        cv.style.height = '100%';
        cv.style.display = 'block';
        cv.setAttribute('aria-hidden', 'true');
        host.current.appendChild(cv);

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(30, 1, 0.1, 120);
        const hemi = new T.HemisphereLight('#ffffff', '#8b7355', 1.1);
        scene.add(hemi);
        const sun = new T.DirectionalLight('#fff4e0', 2.2);
        sun.position.set(7, 12, 8);
        sun.castShadow = !small;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -8;
        sun.shadow.camera.right = 8;
        sun.shadow.camera.top = 8;
        sun.shadow.camera.bottom = -8;
        sun.shadow.bias = -0.0006;
        sun.shadow.normalBias = 0.03;
        scene.add(sun);
        scene.add(sun.target);

        const e: Engine = { T, renderer, scene, camera, hemi, sun, built: null, t: 0, intro: 0, pointer: { x: 0, y: 0, tx: 0, ty: 0 }, w: 1, h: 1 };
        eng.current = e;

        const frame = () => {
          const w = e.w, h = e.h;
          const aspect = w / h;
          // Zona libre donde debe caber el cuarto: a la derecha del texto (catálogo)
          // o encima del texto (portada, "lift").
          // En pantallas angostas (celular) el cuarto va encima del texto en vez de a la derecha.
          const right = alignRef.current === 'right' && aspect > 2.0;
          const lift = alignRef.current === 'right' && !right ? Math.max(liftRef.current, 0.34) : liftRef.current;
          const rw = right ? 0.62 : 1;
          const rh = 1 - lift;
          camera.aspect = aspect;
          const fit = 6.9 / zoomRef.current;
          const tanV = Math.tan((camera.fov * Math.PI) / 360);
          const dist = Math.max(fit / (tanV * rh), fit / (tanV * aspect * rw));
          const dir = { x: 1, y: 0.78, z: 1 };
          const len = Math.hypot(dir.x, dir.y, dir.z);
          camera.position.set((dir.x / len) * dist, (dir.y / len) * dist + 1.4, (dir.z / len) * dist);
          camera.lookAt(0, 1.6, 0);
          // Desplaza la imagen (sin zoom) para centrar el cuarto en esa zona
          const cx = right ? 1 - rw : 0;
          const cy = lift;
          if (cx || cy) camera.setViewOffset(w, h, (-cx * w) / 2, (cy * h) / 2, w, h);
          else camera.clearViewOffset();
          camera.updateProjectionMatrix();
        };
        const resize = () => {
          if (!host.current) return;
          const r = host.current.getBoundingClientRect();
          e.w = Math.max(1, r.width);
          e.h = Math.max(1, r.height);
          renderer.setSize(e.w, e.h, false);
          frame();
        };
        resize();
        ro = new ResizeObserver(resize);
        ro.observe(host.current);
        io = new IntersectionObserver((ents) => (visible = ents[0]?.isIntersecting ?? true));
        io.observe(host.current);

        let last = performance.now();
        let staticFrames = 0;
        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          if (!visible || !e.built) return;
          if (reduce) {
            if (staticFrames > 2) return;
            staticFrames++;
          }
          e.t += reduce ? 2.5 : dt;
          e.intro += dt;
          const b = e.built;
          // intro: el cuarto entra girando y los objetos aparecen uno por uno
          const k = reduce ? 1 : easeOutCubic(clamp(e.intro / 1.3));
          e.pointer.x += (e.pointer.tx - e.pointer.x) * 0.06;
          e.pointer.y += (e.pointer.ty - e.pointer.y) * 0.06;
          const sway = reduce ? 0 : Math.sin(e.t * 0.22) * 0.1;
          b.root.rotation.y = (1 - k) * -0.9 + sway + e.pointer.x * 0.22;
          b.root.rotation.x = e.pointer.y * 0.05;
          b.root.position.y = (1 - k) * -1.2;
          b.root.scale.setScalar(0.82 + 0.18 * k);
          b.props.forEach((p, i) => {
            const s = reduce ? 1 : easeOutBack(clamp((e.intro - 0.35 - i * 0.06) / 0.45));
            p.scale.setScalar(Math.max(0.001, s));
          });
          for (const f of b.ticks) f(e.t, reduce ? 0 : dt);
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);
        setStatus('ready');
      })
      .catch((err) => {
        console.warn('No se pudo cargar el motor 3D', err);
        if (!disposed) setStatus('failed');
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      const e = eng.current;
      if (e) {
        e.built?.dispose();
        e.renderer.dispose();
        e.renderer.forceContextLoss?.();
        e.renderer.domElement.remove();
      }
      eng.current = null;
    };
  }, []);

  // Cambio de cuarto con desvanecido + intro
  useEffect(() => {
    if (status !== 'ready' || !eng.current) return;
    const e = eng.current;
    const swap = () => {
      if (!eng.current) return;
      if (e.built) {
        e.scene.remove(e.built.root);
        e.built.dispose();
      }
      const small = window.matchMedia?.('(max-width: 640px)').matches;
      const b = buildRoom(e.T, room, { shadows: !small });
      b.props.forEach((p) => p.scale.setScalar(0.001));
      e.scene.add(b.root);
      e.hemi.intensity = b.light.hemi ?? 1.1;
      e.hemi.color.set(b.light.sky ?? '#ffffff');
      e.hemi.groundColor.set(b.light.ground ?? '#8b7355');
      e.sun.intensity = b.light.sun ?? 2.2;
      e.sun.color.set(b.light.sunColor ?? '#fff4e0');
      e.built = b;
      e.t = 0;
      e.intro = 0;
      setFading(false);
    };
    if (!e.built) {
      swap();
      return;
    }
    setFading(true);
    const id = window.setTimeout(swap, 220);
    return () => window.clearTimeout(id);
  }, [room, status]);

  const onMove = (ev: { clientX: number; clientY: number }) => {
    if (!interactive || !eng.current || !host.current) return;
    const r = host.current.getBoundingClientRect();
    eng.current.pointer.tx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
    eng.current.pointer.ty = ((ev.clientY - r.top) / r.height - 0.5) * 2;
  };
  const onLeave = () => {
    if (eng.current) {
      eng.current.pointer.tx = 0;
      eng.current.pointer.ty = 0;
    }
  };

  return (
    <div
      ref={host}
      className={`room-canvas ${className}`}
      style={{ opacity: fading || status === 'loading' ? 0 : 1, transition: 'opacity 220ms ease' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-room={room}
      data-status={status}
    >
      {status === 'failed' && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-center p-6">
          <div>
            <p className="font-display text-3xl font-bold">{meta.label}</p>
            <p className="text-sm mt-1">{meta.place}</p>
          </div>
        </div>
      )}
    </div>
  );
};
