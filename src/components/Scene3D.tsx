import React, { useEffect, useRef, useState } from 'react';
import { loadThree, webglAvailable } from '../three/loader';
import type { Built } from '../three/kit';

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);
const easeOutBack = (k: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export type SceneFactory = (T: any, opts: { shadows: boolean }) => Built;

interface Engine {
  T: any; renderer: any; scene: any; camera: any; hemi: any; sun: any;
  built: Built | null; t: number; intro: number;
  pointer: { x: number; y: number; tx: number; ty: number };
  w: number; h: number;
}

/**
 * Lienzo 3D reutilizable.
 * - view "iso": escena de carrera vista desde arriba en diagonal, entra girando y sus objetos aparecen uno por uno.
 * - view "front": vista de frente (desfile del Inicio).
 * Se pausa fuera de pantalla, respeta "reducir movimiento" y, sin WebGL, muestra solo el fondo.
 */
export const Scene3D: React.FC<{
  sceneKey: string;
  factory: SceneFactory;
  view?: 'iso' | 'front';
  align?: 'center' | 'right';
  lift?: number;
  zoom?: number;
  className?: string;
  interactive?: boolean;
  fallback?: React.ReactNode;
}> = ({ sceneKey, factory, view = 'iso', align = 'center', lift = 0, zoom = 1, className = '', interactive = true, fallback }) => {
  const host = useRef<HTMLDivElement>(null);
  const eng = useRef<Engine | null>(null);
  const cfg = useRef({ view, align, lift, zoom, factory });
  cfg.current = { view, align, lift, zoom, factory };
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>(() => (webglAvailable() ? 'loading' : 'failed'));
  const [fading, setFading] = useState(false);

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
        const camera = new T.PerspectiveCamera(30, 1, 0.1, 160);
        const hemi = new T.HemisphereLight('#ffffff', '#8b7355', 1.15);
        scene.add(hemi);
        const sun = new T.DirectionalLight('#fff4e0', 2.3);
        sun.position.set(7, 12, 8);
        sun.castShadow = !small;
        sun.shadow.mapSize.set(1024, 1024);
        Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10 });
        sun.shadow.bias = -0.0006;
        sun.shadow.normalBias = 0.03;
        scene.add(sun);
        scene.add(sun.target);
        const e: Engine = { T, renderer, scene, camera, hemi, sun, built: null, t: 0, intro: 0, pointer: { x: 0, y: 0, tx: 0, ty: 0 }, w: 1, h: 1 };
        eng.current = e;

        const frame = () => {
          const { view: v, align: al, lift: lf, zoom: zm } = cfg.current;
          const w = e.w, h = e.h, aspect = w / h;
          camera.aspect = aspect;
          const tanV = Math.tan((camera.fov * Math.PI) / 360);
          if (v === 'front') {
            // altura visible ~5.6 (personajes de 2.1 + edificio); en pantallas angostas un poco más lejos
            const H = (aspect < 1.2 ? 6.4 : 5.6) / zm;
            const dist = H / 2 / tanV;
            camera.position.set(0, 2.8, dist);
            camera.lookAt(0, 1.75, 0);
            camera.clearViewOffset();
          } else {
            const right = al === 'right' && aspect > 2.0;
            const lift = al === 'right' && !right ? Math.max(lf, 0.34) : lf;
            const rw = right ? 0.62 : 1, rh = 1 - lift;
            const fit = 7.4 / zm;
            const dist = Math.max(fit / (tanV * rh), fit / (tanV * aspect * rw));
            const d = { x: 1, y: 0.62, z: 1 };
            const len = Math.hypot(d.x, d.y, d.z);
            camera.position.set((d.x / len) * dist, (d.y / len) * dist + 1.2, (d.z / len) * dist);
            camera.lookAt(0, 1.6, 0);
            const cx = right ? 1 - rw : 0, cy = lift;
            if (cx || cy) camera.setViewOffset(w, h, (-cx * w) / 2, (cy * h) / 2, w, h);
            else camera.clearViewOffset();
          }
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
          const dt = Math.min(0.1, (now - last) / 1000);
          last = now;
          if (!visible || !e.built) return;
          if (reduce) {
            if (staticFrames > 2) return;
            staticFrames++;
          }
          e.t += reduce ? 2.5 : dt;
          e.intro += dt;
          const b = e.built;
          e.pointer.x += (e.pointer.tx - e.pointer.x) * 0.06;
          e.pointer.y += (e.pointer.ty - e.pointer.y) * 0.06;
          if (cfg.current.view === 'iso') {
            const k = reduce ? 1 : easeOutCubic(clamp(e.intro / 1.3));
            const sway = reduce ? 0 : Math.sin(e.t * 0.2) * 0.12;
            b.root.rotation.y = (1 - k) * -0.9 + sway + e.pointer.x * 0.25;
            b.root.position.y = (1 - k) * -1.2 + (reduce ? 0 : Math.sin(e.t * 0.6) * 0.08);
            b.root.scale.setScalar(0.82 + 0.18 * k);
            b.props.forEach((p, i) => p.scale.setScalar(Math.max(0.001, reduce ? 1 : easeOutBack(clamp((e.intro - 0.35 - i * 0.06) / 0.45)))));
          } else {
            b.root.rotation.y = e.pointer.x * 0.06;
          }
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

  // Cambiar de escena (con un pequeño desvanecido)
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
      const b = cfg.current.factory(e.T, { shadows: !small });
      if (cfg.current.view === 'iso') b.props.forEach((p) => p.scale.setScalar(0.001));
      e.scene.add(b.root);
      e.hemi.intensity = b.light.hemi ?? 1.15;
      e.hemi.color.set(b.light.sky ?? '#ffffff');
      e.hemi.groundColor.set(b.light.ground ?? '#8b7355');
      e.sun.intensity = b.light.sun ?? 2.3;
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
  }, [sceneKey, status]);

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
      className={`scene3d ${className}`}
      style={{ opacity: fading || status === 'loading' ? 0 : 1, transition: 'opacity 220ms ease' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-scene={sceneKey}
      data-status={status}
    >
      {status === 'failed' && fallback}
    </div>
  );
};
