/**
 * Cuartos 3D de Exchange UCV (uno por carrera / sección).
 * Todo está hecho con figuras simples de three.js (cajas, cilindros, esferas), sin modelos externos.
 * Cada cuarto es un "diorama": piso + 2 paredes vistas desde la esquina, con sus objetos y animaciones.
 */
import type { RoomId } from '../data/rooms';

type Tick = (t: number, dt: number) => void;

export interface RoomLight {
  sky?: string;
  ground?: string;
  hemi?: number;
  sun?: number;
  sunColor?: string;
}

export interface BuiltRoom {
  root: any;
  props: any[]; // grupos que "aparecen" uno por uno en la intro
  ticks: Tick[];
  light: RoomLight;
  dispose: () => void;
}

// Número pseudoaleatorio con semilla: el cuarto se ve igual cada vez.
function seeded(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function buildRoom(T: any, id: RoomId, opts: { shadows: boolean }): BuiltRoom {
  const root = new T.Group();
  const ticks: Tick[] = [];
  const props: any[] = [];
  const textures: any[] = [];
  const mats = new Map<string, any>();
  const rnd = seeded(id);
  const light: RoomLight = {};

  /* ───────────── utilidades ───────────── */
  const shade = (hex: string, l: number) => {
    const c = new T.Color(hex);
    c.offsetHSL(0, 0, l);
    return '#' + c.getHexString();
  };
  type MO = { r?: number; m?: number; e?: string; ei?: number; op?: number; flat?: boolean; side?: boolean; basic?: boolean };
  const M = (color: string, o: MO = {}) => {
    const key = color + JSON.stringify(o);
    if (mats.has(key)) return mats.get(key);
    let m: any;
    if (o.basic) m = new T.MeshBasicMaterial({ color });
    else m = new T.MeshStandardMaterial({ color, roughness: o.r ?? 0.8, metalness: o.m ?? 0.02, flatShading: o.flat ?? false });
    if (o.e && !o.basic) {
      m.emissive = new T.Color(o.e);
      m.emissiveIntensity = o.ei ?? 1;
    }
    if (o.op !== undefined) {
      m.transparent = true;
      m.opacity = o.op;
      m.depthWrite = o.op > 0.7;
    }
    if (o.side) m.side = T.DoubleSide;
    mats.set(key, m);
    return m;
  };
  const MT = (map: any, o: { e?: boolean; r?: number } = {}) => {
    const m = new T.MeshStandardMaterial({ map, roughness: o.r ?? 0.85 });
    if (o.e) {
      m.emissive = new T.Color('#ffffff');
      m.emissiveMap = map;
      m.emissiveIntensity = 0.9;
    }
    mats.set('tex' + mats.size, m);
    return m;
  };
  const mesh = (geo: any, mat: any, parent: any = root) => {
    const m = new T.Mesh(geo, mat);
    m.castShadow = opts.shadows;
    m.receiveShadow = opts.shadows;
    parent.add(m);
    return m;
  };
  /** Caja apoyada en y (la base queda en y). */
  const box = (p: any, w: number, h: number, d: number, mat: any, x = 0, y = 0, z = 0) => {
    const m = mesh(new T.BoxGeometry(w, h, d), mat, p);
    m.position.set(x, y + h / 2, z);
    return m;
  };
  const cyl = (p: any, rt: number, rb: number, h: number, mat: any, x = 0, y = 0, z = 0, seg = 20) => {
    const m = mesh(new T.CylinderGeometry(rt, rb, h, seg), mat, p);
    m.position.set(x, y + h / 2, z);
    return m;
  };
  const sph = (p: any, r: number, mat: any, x = 0, y = 0, z = 0, seg = 18) => {
    const m = mesh(new T.SphereGeometry(r, seg, Math.max(8, Math.round(seg * 0.7))), mat, p);
    m.position.set(x, y, z);
    return m;
  };
  const group = (p: any = root, x = 0, y = 0, z = 0, ry = 0) => {
    const g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    p.add(g);
    return g;
  };
  /** Objeto principal: aparece con animación en la intro. */
  const prop = (x: number, z: number, ry = 0, y = 0) => {
    const g = group(root, x, y, z, ry);
    props.push(g);
    return g;
  };
  const canvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d')!;
    draw(ctx, w, h);
    const t = new T.CanvasTexture(cv);
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    textures.push(t);
    return {
      t,
      redraw: (fn: (c: CanvasRenderingContext2D, w: number, h: number) => void) => {
        fn(ctx, w, h);
        t.needsUpdate = true;
      },
    };
  };
  const plane = (p: any, w: number, h: number, mat: any, x: number, y: number, z: number, ry = 0) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.receiveShadow = opts.shadows;
    p.add(m);
    return m;
  };
  /** Cuadro en una pared: 'back' (fondo, mira a +z) o 'left' (izquierda, mira a +x). u = posición a lo largo de la pared. */
  const wallArt = (wall: 'back' | 'left', u: number, v: number, w: number, h: number, mat: any, frame = '#3b2a1a') => {
    const g = wall === 'back' ? group(root, u, v, -4.86) : group(root, -4.86, v, u, Math.PI / 2);
    box(g, w + 0.16, h + 0.16, 0.06, M(frame), 0, -(h + 0.16) / 2, 0);
    plane(g, w, h, mat, 0, 0, 0.04);
    return g;
  };
  const text = (lines: string[], o: { bg?: string; fg?: string; font?: string; w?: number; h?: number; align?: CanvasTextAlign } = {}) =>
    canvasTex(o.w ?? 512, o.h ?? 256, (c, w, h) => {
      c.fillStyle = o.bg ?? '#ffffff';
      c.fillRect(0, 0, w, h);
      c.fillStyle = o.fg ?? '#111827';
      c.font = o.font ?? 'bold 54px Arial, sans-serif';
      c.textAlign = o.align ?? 'center';
      c.textBaseline = 'middle';
      const lh = h / (lines.length + 1);
      lines.forEach((l, i) => c.fillText(l, o.align === 'left' ? 30 : w / 2, lh * (i + 1)));
    }).t;

  /* ───────────── cuarto base ───────────── */
  const floorTex = (kind: 'wood' | 'tile' | 'plain' | 'concrete', color: string) =>
    canvasTex(512, 512, (c, w, h) => {
      c.fillStyle = color;
      c.fillRect(0, 0, w, h);
      if (kind === 'wood') {
        for (let i = 0; i < 8; i++) {
          c.fillStyle = shade(color, (rnd() - 0.5) * 0.08);
          c.fillRect(0, i * 64, w, 62);
          c.fillStyle = shade(color, -0.12);
          c.fillRect(0, i * 64 + 62, w, 2);
          c.fillRect(((i * 197) % 400) + 40, i * 64, 2, 62);
        }
      } else if (kind === 'tile') {
        c.strokeStyle = shade(color, -0.1);
        c.lineWidth = 3;
        for (let i = 0; i <= 8; i++) {
          c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke();
          c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke();
        }
      } else if (kind === 'concrete') {
        for (let i = 0; i < 900; i++) {
          c.fillStyle = `rgba(0,0,0,${rnd() * 0.07})`;
          c.fillRect(rnd() * w, rnd() * h, 3, 3);
        }
      }
    }).t;

  const shell = (s: { wall: string; wall2?: string; floor: string; kind?: 'wood' | 'tile' | 'plain' | 'concrete'; trim?: string; h?: number }) => {
    const H = s.h ?? 5.2;
    const side = M(shade(s.floor, -0.22));
    const top = MT(floorTex(s.kind ?? 'wood', s.floor));
    const slab = mesh(new T.BoxGeometry(10.3, 0.5, 10.3), [side, side, top, side, side, side]);
    slab.position.set(0.05, -0.25, 0.05);
    box(root, 10.3, H, 0.3, M(s.wall), 0.05, 0, -5.05);
    box(root, 0.3, H, 10.3, M(s.wall2 ?? shade(s.wall, -0.05)), -5.05, 0, 0.05);
    const trim = M(s.trim ?? shade(s.wall, -0.25));
    box(root, 10, 0.3, 0.08, trim, 0.1, 0, -4.88);
    box(root, 0.08, 0.3, 10, trim, -4.88, 0, 0.1);
    return H;
  };
  const windowLeft = (z: number, y = 2.2, w = 2.4, h = 1.8, glow = '#bfe3ff') => {
    const g = group(root, -4.86, y, z, Math.PI / 2);
    box(g, w + 0.2, h + 0.2, 0.08, M('#f8fafc'), 0, -(h + 0.2) / 2, 0);
    plane(g, w, h, M(glow, { e: glow, ei: 0.8 }), 0, 0, 0.05);
    box(g, 0.06, h, 0.04, M('#f8fafc'), 0, -h / 2, 0.08);
    box(g, w, 0.06, 0.04, M('#f8fafc'), 0, -0.03, 0.08);
  };
  const desk = (p: any, w = 2.6, d = 1.2, h = 1.15, top = '#8b5a2b', leg?: string) => {
    box(p, w, 0.12, d, M(top), 0, h - 0.12, 0);
    const lm = M(leg ?? shade(top, -0.15));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(p, 0.12, h - 0.12, 0.12, lm, sx * (w / 2 - 0.12), 0, sz * (d / 2 - 0.12));
    return h;
  };
  const chair = (p: any, x: number, z: number, ry: number, color: string, h = 0.7) => {
    const g = group(p, x, 0, z, ry);
    box(g, 0.85, 0.12, 0.85, M(color), 0, h, 0);
    box(g, 0.85, 1.0, 0.12, M(color), 0, h, -0.37);
    const lm = M('#2b2b2b', { m: 0.4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.08, h, 0.08, lm, sx * 0.34, 0, sz * 0.34);
    return g;
  };
  const bookRow = (p: any, x0: number, y: number, z: number, width: number, maxH: number, depth: number, palette: string[]) => {
    let x = x0;
    while (x < x0 + width - 0.12) {
      const bw = 0.1 + rnd() * 0.12;
      const bh = maxH * (0.62 + rnd() * 0.38);
      if (x + bw > x0 + width) break;
      const b = box(p, bw - 0.015, bh, depth * (0.75 + rnd() * 0.2), M(palette[Math.floor(rnd() * palette.length)]), x + bw / 2, y, z);
      if (rnd() < 0.08) b.rotation.z = 0.18;
      x += bw;
    }
  };
  const shelf = (p: any, w: number, h: number, d: number, color: string, rows: number, palette: string[]) => {
    const wm = M(color);
    box(p, 0.1, h, d, wm, -w / 2, 0, 0);
    box(p, 0.1, h, d, wm, w / 2, 0, 0);
    box(p, w, h, 0.06, M(shade(color, -0.1)), 0, 0, -d / 2 + 0.03);
    const gap = h / rows;
    for (let i = 0; i <= rows; i++) box(p, w, 0.08, d, wm, 0, Math.min(i * gap, h - 0.08), 0);
    for (let i = 0; i < rows; i++) bookRow(p, -w / 2 + 0.08, i * gap + 0.08, 0.02, w - 0.16, gap - 0.2, d - 0.1, palette);
  };
  const plant = (p: any, x: number, z: number, s = 1, pot = '#c2410c') => {
    const g = group(p, x, 0, z);
    g.scale.setScalar(s);
    cyl(g, 0.32, 0.24, 0.55, M(pot), 0, 0, 0);
    cyl(g, 0.05, 0.05, 0.6, M('#4d7c0f'), 0, 0.5, 0, 6);
    const leaf = M('#3f8f3a', { flat: true });
    const leaves: any[] = [];
    for (let i = 0; i < 5; i++) {
      const l = mesh(new T.IcosahedronGeometry(0.32 + rnd() * 0.12, 0), leaf, g);
      const a = (i / 5) * Math.PI * 2;
      l.position.set(Math.cos(a) * 0.22, 1.05 + rnd() * 0.35, Math.sin(a) * 0.22);
      leaves.push(l);
    }
    const ph = rnd() * 6;
    ticks.push((t) => (g.rotation.z = Math.sin(t * 1.3 + ph) * 0.03));
    return g;
  };
  const deskLamp = (p: any, x: number, y: number, z: number, shadeColor: string, glow = '#ffd58a', light = true) => {
    const g = group(p, x, y, z);
    cyl(g, 0.18, 0.2, 0.06, M('#222', { m: 0.6, r: 0.4 }), 0, 0, 0);
    cyl(g, 0.025, 0.025, 0.7, M('#c9a227', { m: 0.8, r: 0.3 }), 0, 0.05, 0, 8);
    const sh = mesh(new T.ConeGeometry(0.28, 0.3, 20, 1, true), M(shadeColor, { side: true }), g);
    sh.position.set(0, 0.85, 0);
    sph(g, 0.08, M(glow, { e: glow, ei: 2 }), 0, 0.76, 0, 10);
    if (light) {
      const pl = new T.PointLight(glow, 3, 4.5, 1.6);
      pl.position.set(0, 0.7, 0);
      g.add(pl);
    }
    return g;
  };
  const rug = (p: any, w: number, d: number, color: string, x: number, z: number, round = false) => {
    if (round) cyl(p, w / 2, w / 2, 0.03, M(color), x, 0, z, 40);
    else box(p, w, 0.03, d, M(color), x, 0, z);
  };
  const monitor = (p: any, x: number, y: number, z: number, ry: number, map: any, w = 1.1, h = 0.68) => {
    const g = group(p, x, y, z, ry);
    box(g, 0.3, 0.04, 0.22, M('#1f2937', { m: 0.5 }), 0, 0, 0);
    box(g, 0.06, 0.32, 0.06, M('#1f2937', { m: 0.5 }), 0, 0.04, -0.04);
    box(g, w + 0.08, h + 0.08, 0.06, M('#111827', { m: 0.3, r: 0.4 }), 0, 0.34, -0.06);
    plane(g, w, h, MT(map, { e: true }), 0, 0.34 + (h + 0.08) / 2, -0.025);
    return g;
  };
  const dust = (color: string, n = 70) => {
    const geo = new T.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const speed: number[] = [];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = -4.5 + rnd() * 9;
      pos[i * 3 + 1] = rnd() * 5;
      pos[i * 3 + 2] = -4.5 + rnd() * 9;
      speed.push(0.08 + rnd() * 0.2);
    }
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const pts = new T.Points(geo, new T.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
    root.add(pts);
    ticks.push((_t, dt) => {
      const a = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < n; i++) {
        a[i * 3 + 1] += speed[i] * dt;
        if (a[i * 3 + 1] > 5.2) a[i * 3 + 1] = 0;
      }
      geo.attributes.position.needsUpdate = true;
    });
  };
  const bob = (o: any, amp = 0.15, speed = 1.2, phase = 0) => {
    const y0 = o.position.y;
    ticks.push((t) => (o.position.y = y0 + Math.sin(t * speed + phase) * amp));
  };
  const spin = (o: any, speed = 0.5, axis: 'x' | 'y' | 'z' = 'y') => ticks.push((_t, dt) => (o.rotation[axis] += speed * dt));

  /* ───────────── cuartos ───────────── */
  const ROOMS: Record<RoomId, () => void> = {
    /* DERECHO: despacho con balanza, martillo de juez, columnas y biblioteca de códigos */
    derecho: () => {
      shell({ wall: '#efe4d0', wall2: '#e7d9c0', floor: '#6b4423', trim: '#5a3418' });
      // zócalo de madera
      box(root, 10, 1.6, 0.06, M('#6e3b22'), 0.1, 0, -4.86);
      box(root, 0.06, 1.6, 10, M('#6e3b22'), -4.86, 0, 0.1);
      rug(root, 5, 3.6, '#7a2e2e', 0.6, 0.8);
      const leather = ['#5b1a1a', '#7a2e2e', '#2f3e2f', '#3a2a1a', '#6b4f2a', '#1f2a44'];
      const s1 = prop(-1.4, -4.45);
      shelf(s1, 2.6, 4.2, 0.7, '#4a2c17', 5, leather);
      const s2 = prop(1.6, -4.45);
      shelf(s2, 2.6, 4.2, 0.7, '#4a2c17', 5, leather);
      // columnas griegas
      for (const z of [-2.2, 1.8]) {
        const c = prop(-4.3, z);
        box(c, 0.9, 0.25, 0.9, M('#f5f0e6'), 0, 0, 0);
        cyl(c, 0.3, 0.34, 3.7, M('#f5f0e6', { flat: true }), 0, 0.25, 0, 16);
        box(c, 0.9, 0.3, 0.9, M('#f5f0e6'), 0, 3.95, 0);
      }
      // escritorio
      const d = prop(0.7, 0.4);
      const h = desk(d, 3.2, 1.5, 1.2, '#5a3418');
      box(d, 1.2, 0.02, 0.8, M('#2f5d3a'), -0.3, h, 0.1); // vade verde
      deskLamp(d, -1.2, h, -0.4, '#1f7a4a', '#ffe2a8');
      // balanza de la justicia
      const sc = group(d, 0.9, h, -0.2);
      sc.scale.setScalar(1.45);
      const gold = M('#d4a017', { m: 0.85, r: 0.3 });
      cyl(sc, 0.22, 0.26, 0.08, gold, 0, 0, 0);
      cyl(sc, 0.035, 0.035, 1.1, gold, 0, 0.08, 0, 10);
      const beam = group(sc, 0, 1.18, 0);
      box(beam, 1.2, 0.05, 0.05, gold, 0, -0.025, 0);
      const pans: any[] = [];
      for (const sx of [-1, 1]) {
        const hang = group(beam, sx * 0.58, 0, 0);
        box(hang, 0.012, 0.5, 0.012, gold, 0, -0.5, 0);
        cyl(hang, 0.2, 0.14, 0.05, gold, 0, -0.55, 0);
        pans.push(hang);
      }
      ticks.push((t) => {
        const a = Math.sin(t * 1.1) * 0.16;
        beam.rotation.z = a;
        pans.forEach((p) => (p.rotation.z = -a));
      });
      // martillo de juez
      const block = group(d, 0.1, h, 0.45);
      cyl(block, 0.2, 0.22, 0.08, M('#3a2210'), 0, 0, 0);
      const gavel = group(block, -0.45, 0.14, 0);
      box(gavel, 0.55, 0.05, 0.05, M('#4a2c17'), 0.27, -0.025, 0);
      const head = cyl(gavel, 0.08, 0.08, 0.32, M('#5a3418'), 0.5, -0.16, 0);
      head.rotation.x = Math.PI / 2;
      head.position.y = 0;
      ticks.push((t) => {
        const k = t % 2.6;
        gavel.rotation.z = k < 0.15 ? 0.6 - (k / 0.15) * 0.6 : k < 0.3 ? ((k - 0.15) / 0.15) * 0.6 : 0.6;
      });
      chair(root, 0.7, -0.9, 0, '#5b1a1a', 0.75);
      // diploma
      wallArt('left', -0.2, 3.6, 1.6, 1.1, MT(text(['TÍTULO DE', 'ABOGADO'], { bg: '#fbf6e9', fg: '#5b1a1a', font: 'bold 50px Georgia, serif' })), '#8b6b2e');
      plant(root, 3.8, -3.8, 1.1);
      dust('#ffe9b5');
      light.sunColor = '#ffe8c2';
    },

    /* ING. CIVIL: obra con grúa torre, muro de ladrillos que se construye, vigas, conos y mezcladora */
    civil: () => {
      shell({ wall: '#c9c5bb', wall2: '#bdb8ad', floor: '#b08b57', kind: 'concrete', trim: '#8a8579' });
      wallArt('back', 1.6, 3.4, 2.6, 1.6, MT(canvasTex(512, 320, (c, w, h) => {
        c.fillStyle = '#1e4fa3'; c.fillRect(0, 0, w, h);
        c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1;
        for (let i = 0; i < w; i += 24) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); }
        for (let i = 0; i < h; i += 24) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
        c.strokeStyle = '#fff'; c.lineWidth = 4; c.strokeRect(60, 60, 240, 180); c.strokeRect(300, 120, 140, 120);
        c.beginPath(); c.moveTo(60, 60); c.lineTo(180, 20); c.lineTo(300, 60); c.stroke();
        c.fillStyle = '#fff'; c.font = 'bold 30px Arial'; c.fillText('PLANO ESTRUCTURAL', 60, 300);
      }).t), '#e5e7eb');
      // grúa torre
      const cr = prop(-3.3, -3.3);
      const yel = M('#f2b705', { r: 0.6 });
      box(cr, 0.9, 0.3, 0.9, M('#6b7280'), 0, 0, 0);
      box(cr, 0.32, 5.6, 0.32, yel, 0, 0.3, 0);
      for (let y = 0.6; y < 5.8; y += 0.55) box(cr, 0.36, 0.05, 0.36, M('#c99400'), 0, y, 0);
      const jib = group(cr, 0, 5.9, 0);
      box(jib, 5.2, 0.22, 0.24, yel, 1.7, 0, 0);
      box(jib, 1.6, 0.22, 0.24, yel, -1.1, 0, 0);
      box(jib, 0.6, 0.5, 0.5, M('#374151'), -1.7, -0.25, 0);
      box(jib, 0.4, 0.45, 0.4, M('#e5e7eb'), 0.3, -0.5, 0.3);
      const trolley = group(jib, 2.6, 0, 0);
      const cable = box(trolley, 0.02, 1, 0.02, M('#111'), 0, -1, 0);
      const hook = group(trolley, 0, -2, 0);
      box(hook, 0.9, 0.1, 0.1, M('#c2410c'), 0, -0.1, 0); // viga colgando
      ticks.push((t) => {
        jib.rotation.y = Math.sin(t * 0.35) * 0.9 - 0.5;
        const L = 1.6 + Math.sin(t * 0.8) * 0.7;
        hook.position.y = -L;
        cable.scale.y = L;
        cable.position.y = -L;
        trolley.position.x = 2.2 + Math.sin(t * 0.5) * 0.9;
      });
      // muro de ladrillos que se va construyendo
      const wall = prop(0.6, -3.6);
      const bricks: any[] = [];
      const bm = [M('#b45309'), M('#9a3412'), M('#c2410c')];
      for (let r = 0; r < 7; r++)
        for (let i = 0; i < 6; i++) {
          const b = box(wall, 0.5, 0.24, 0.3, bm[(r + i) % 3], -1.4 + i * 0.54 + (r % 2 ? 0.27 : 0), r * 0.26, 0);
          b.scale.setScalar(0.001);
          bricks.push(b);
        }
      ticks.push((t) => {
        const k = (t % 9) / 7;
        bricks.forEach((b, i) => {
          const s = Math.min(1, Math.max(0.001, (k * bricks.length - i) * 1.5));
          b.scale.setScalar(t % 9 > 8.4 ? Math.max(0.001, 1 - (t % 9 - 8.4) * 2) : s);
        });
      });
      // vigas de acero
      const st = prop(2.6, 1.6, 0.3);
      for (let i = 0; i < 3; i++) {
        const g = group(st, 0, i * 0.34, 0);
        box(g, 3.2, 0.06, 0.34, M('#9ca3af', { m: 0.7, r: 0.4 }), 0, 0, 0);
        box(g, 3.2, 0.2, 0.06, M('#9ca3af', { m: 0.7, r: 0.4 }), 0, 0.06, 0);
        box(g, 3.2, 0.06, 0.34, M('#9ca3af', { m: 0.7, r: 0.4 }), 0, 0.26, 0);
      }
      // conos
      for (const [x, z] of [[3.6, -1.2], [3.9, 0], [1.2, 3.8]]) {
        const c = prop(x, z);
        box(c, 0.6, 0.06, 0.6, M('#f97316'), 0, 0, 0);
        cyl(c, 0.04, 0.26, 0.9, M('#f97316'), 0, 0.06, 0);
        cyl(c, 0.13, 0.17, 0.14, M('#f8fafc'), 0, 0.45, 0);
      }
      // mezcladora de concreto
      const mx = prop(-1.6, 2.4, 0.6);
      box(mx, 1.4, 0.5, 0.8, M('#ea580c'), 0, 0.3, 0);
      for (const sx of [-0.5, 0.5]) { const w = cyl(mx, 0.3, 0.3, 0.12, M('#1f2937'), sx, 0, 0.45); w.rotation.x = Math.PI / 2; w.position.y = 0.3; }
      const drum = group(mx, 0, 1.25, 0);
      drum.rotation.z = 0.9;
      const dr = mesh(new T.CylinderGeometry(0.35, 0.55, 1.2, 14), M('#f59e0b', { flat: true }), drum);
      spin(dr, 2.2, 'y');
      // casco sobre mesa de planos
      const tb = prop(1.2, 1.2);
      const th = desk(tb, 1.8, 1.1, 1.05, '#d6b98c');
      plane(tb, 1.4, 0.8, MT(text(['N', '↑'], { bg: '#1e4fa3', fg: '#fff' })), 0, th + 0.005, 0, 0).rotation.x = -Math.PI / 2;
      const hat = group(tb, 0.4, th, 0.1);
      mesh(new T.SphereGeometry(0.28, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#facc15', { r: 0.4 }), hat).position.y = 0.04;
      cyl(hat, 0.38, 0.38, 0.04, M('#facc15', { r: 0.4 }), 0, 0, 0, 24);
      dust('#e7d3a8', 90);
      light.sunColor = '#fff1d6';
    },

    /* ING. DE SISTEMAS: laboratorio oscuro con monitores de código, rack de servidores y cubos de neón */
    sistemas: () => {
      shell({ wall: '#2c3560', wall2: '#262e54', floor: '#3a4268', kind: 'tile', trim: '#22d3ee' });
      light.hemi = 0.85;
      light.sun = 0.9;
      light.sky = '#8ea2ff';
      // tira LED
      box(root, 10, 0.06, 0.06, M('#22d3ee', { e: '#22d3ee', ei: 2 }), 0.1, 5.0, -4.85);
      box(root, 0.06, 0.06, 10, M('#a855f7', { e: '#a855f7', ei: 2 }), -4.85, 5.0, 0.1);
      const code = [
        'function intercambiar(a, b) {', '  if (!a.aceptado) return;', '  const doc = await bd.get(a.id);', '  for (const p of paginas) {',
        '    render(p, { blur: true });', '  }', '  return { ok: true };', '}', 'SELECT * FROM items', "  WHERE collection = 'users';",
        'git commit -m "nivel 7"', 'npm run build ✓', 'const exp = pub * 25 + estrellas;', 'while (estudiando) aprender();',
      ];
      const screens = [0, 1, 2].map((k) =>
        canvasTex(512, 320, () => {})
      );
      let scroll = 0;
      const drawScreens = () => {
        screens.forEach((s, k) =>
          s.redraw((c, w, h) => {
            c.fillStyle = '#0b1020'; c.fillRect(0, 0, w, h);
            c.font = '22px monospace';
            for (let i = 0; i < 12; i++) {
              const line = code[(i + scroll + k * 4) % code.length];
              c.fillStyle = ['#22d3ee', '#a5b4fc', '#86efac', '#fca5a5', '#e2e8f0'][(i + k + scroll) % 5];
              c.fillText(line, 16, 30 + i * 25);
            }
            c.fillStyle = '#22d3ee'; c.fillRect(16 + ((scroll * 37) % 300), 30 + 11 * 25 - 18, 12, 22);
          })
        );
      };
      drawScreens();
      let acc = 0;
      ticks.push((_t, dt) => {
        acc += dt;
        if (acc > 0.35) { acc = 0; scroll++; drawScreens(); }
      });
      const d = prop(0.8, -3.2);
      const h = desk(d, 3.6, 1.3, 1.15, '#111827', '#374151');
      monitor(d, -1.15, h, -0.2, 0.25, screens[0].t);
      monitor(d, 0, h, -0.3, 0, screens[1].t, 1.3, 0.78);
      monitor(d, 1.15, h, -0.2, -0.25, screens[2].t);
      box(d, 1.1, 0.04, 0.35, M('#1f2937', { e: '#a855f7', ei: 0.25 }), 0, h, 0.35);
      chair(root, 0.8, -1.7, Math.PI, '#7c3aed', 0.75);
      // rack de servidores
      const rk = prop(-3.9, -1.4);
      box(rk, 1.2, 4.2, 1.1, M('#0f172a', { m: 0.5, r: 0.4 }), 0, 0, 0);
      const leds: any[] = [];
      for (let r = 0; r < 9; r++) {
        box(rk, 1.0, 0.36, 0.04, M('#1e293b', { m: 0.4 }), 0, 0.2 + r * 0.44, 0.55);
        for (let i = 0; i < 4; i++) {
          const on = M('#22c55e', { e: '#22c55e', ei: 2.5 });
          const led = box(rk, 0.06, 0.06, 0.02, on, 0.25 + i * 0.1, 0.33 + r * 0.44, 0.58);
          leds.push(led);
        }
      }
      ticks.push((t) => leds.forEach((l, i) => (l.visible = Math.sin(t * (3 + (i % 5)) + i * 1.7) > -0.3)));
      // cubos flotantes
      const cubes = prop(2.4, 1.6);
      const cmats = [M('#22d3ee', { e: '#22d3ee', ei: 0.8, op: 0.85 }), M('#a855f7', { e: '#a855f7', ei: 0.8, op: 0.85 })];
      for (let i = 0; i < 5; i++) {
        const c = mesh(new T.BoxGeometry(0.45, 0.45, 0.45), cmats[i % 2], cubes);
        c.position.set((rnd() - 0.5) * 2.4, 1.5 + rnd() * 2.2, (rnd() - 0.5) * 2.4);
        spin(c, 0.6 + rnd(), 'y');
        spin(c, 0.4 + rnd() * 0.5, 'x');
        bob(c, 0.25, 1 + rnd(), rnd() * 6);
      }
      const ico = mesh(new T.IcosahedronGeometry(0.8, 0), new T.MeshBasicMaterial({ color: '#22d3ee', wireframe: true }), cubes);
      ico.position.set(0, 2.8, 0);
      spin(ico, 0.5, 'y');
      wallArt('left', 1.6, 3.4, 2.2, 1.2, MT(text(['</>', 'EXCHANGE UCV'], { bg: '#0b1020', fg: '#22d3ee', font: 'bold 60px monospace' }), { e: true }), '#312e81');
      dust('#67e8f9', 90);
    },

    /* ING. INDUSTRIAL: planta con engranajes girando, cinta transportadora y brazo robótico */
    industrial: () => {
      shell({ wall: '#d8d2c4', wall2: '#cfc8b8', floor: '#7c7f86', kind: 'concrete', trim: '#f59e0b' });
      // líneas de seguridad
      box(root, 9.4, 0.012, 0.12, M('#facc15'), 0.4, 0, -1.6);
      box(root, 9.4, 0.012, 0.12, M('#facc15'), 0.4, 0, 1.4);
      // engranajes en la pared
      const gearMesh = (r: number, teeth: number, color: string) => {
        const g = new T.Group();
        const m = M(color, { m: 0.75, r: 0.35 });
        const core = mesh(new T.CylinderGeometry(r, r, 0.25, 32), m, g);
        core.rotation.x = Math.PI / 2;
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * Math.PI * 2;
          const tt = mesh(new T.BoxGeometry(0.22, 0.26, 0.25), m, g);
          tt.position.set(Math.cos(a) * (r + 0.1), Math.sin(a) * (r + 0.1), 0);
          tt.rotation.z = a;
        }
        const hub = mesh(new T.CylinderGeometry(r * 0.25, r * 0.25, 0.3, 16), M('#374151', { m: 0.6 }), g);
        hub.rotation.x = Math.PI / 2;
        return g;
      };
      const gp = prop(0, -4.75);
      const g1 = gearMesh(0.9, 14, '#9ca3af'); g1.position.set(-1.6, 3.2, 0); gp.add(g1);
      const g2 = gearMesh(0.6, 10, '#f59e0b'); g2.position.set(-0.05, 2.45, 0); gp.add(g2);
      const g3 = gearMesh(0.75, 12, '#6b7280'); g3.position.set(1.45, 3.35, 0); gp.add(g3);
      ticks.push((_t, dt) => { g1.rotation.z += dt * 0.6; g2.rotation.z -= dt * 0.9; g3.rotation.z += dt * 0.72; });
      // cinta transportadora
      const cv = prop(0.6, 0.0);
      box(cv, 6.6, 0.12, 1.1, M('#1f2937', { r: 0.9 }), 0, 0.9, 0);
      for (let x = -3.1; x <= 3.1; x += 0.5) { const r = cyl(cv, 0.08, 0.08, 1.1, M('#6b7280', { m: 0.7 }), x, 0.9, 0, 10); r.rotation.x = Math.PI / 2; r.position.y = 0.92; }
      for (const x of [-3, 0, 3]) for (const z of [-0.45, 0.45]) box(cv, 0.1, 0.9, 0.1, M('#f59e0b'), x, 0, z);
      const boxes: any[] = [];
      for (let i = 0; i < 5; i++) boxes.push(box(cv, 0.55, 0.45, 0.55, M('#c08a4f'), 0, 1.02, 0));
      ticks.push((t) => boxes.forEach((b, i) => (b.position.x = (((t * 0.7 + i * 1.32) % 6.6) - 3.3))));
      // brazo robótico
      const arm = prop(2.9, 2.6);
      cyl(arm, 0.5, 0.6, 0.35, M('#f97316'), 0, 0, 0);
      const s1 = group(arm, 0, 0.35, 0);
      cyl(s1, 0.2, 0.2, 1.4, M('#f97316'), 0, 0, 0, 14);
      const s2 = group(s1, 0, 1.4, 0);
      sph(s2, 0.22, M('#374151', { m: 0.6 }), 0, 0, 0);
      const s3 = group(s2, 0, 0, 0);
      box(s3, 0.18, 0.18, 1.3, M('#f97316'), 0, -0.09, 0.65);
      box(s3, 0.3, 0.12, 0.12, M('#374151'), 0, -0.06, 1.3);
      ticks.push((t) => { s1.rotation.y = Math.sin(t * 0.7) * 1.2; s3.rotation.x = -0.5 + Math.sin(t * 1.1) * 0.35; });
      // pallet con cajas
      const pl = prop(-3.2, 2.8);
      box(pl, 1.6, 0.18, 1.6, M('#a16207'), 0, 0, 0);
      for (let i = 0; i < 4; i++) box(pl, 0.7, 0.6, 0.7, M(i % 2 ? '#b07a45' : '#c08a4f'), (i % 2) * 0.75 - 0.37, 0.18, Math.floor(i / 2) * 0.75 - 0.37);
      box(pl, 0.7, 0.6, 0.7, M('#c08a4f'), 0, 0.78, 0);
      wallArt('left', -2.4, 3.4, 1.4, 1.4, MT(text(['⚠', 'USE EPP'], { bg: '#facc15', fg: '#111' })), '#111');
      dust('#f5f5f4', 70);
    },

    /* ARQUITECTURA: taller con maqueta de ciudad que crece, mesa de dibujo y lámparas colgantes */
    arquitectura: () => {
      shell({ wall: '#f2efe9', wall2: '#e9e5dc', floor: '#d9b98c', trim: '#a8a29e' });
      windowLeft(1.5);
      // maqueta
      const mq = prop(0.6, 0.4);
      const th = desk(mq, 4.0, 2.4, 1.0, '#e7e5e4', '#78716c');
      box(mq, 3.7, 0.08, 2.1, M('#a3b18a'), 0, th, 0);
      const blds: { m: any; h: number; ph: number }[] = [];
      const wm = M('#fafaf9', { r: 0.6 });
      for (let i = 0; i < 12; i++) {
        const w = 0.35 + rnd() * 0.35, hgt = 0.4 + rnd() * 1.5;
        const b = box(mq, w, 1, w, wm, -1.5 + (i % 4) * 1.0 + rnd() * 0.2, th + 0.08, -0.7 + Math.floor(i / 4) * 0.7);
        blds.push({ m: b, h: hgt, ph: i * 0.25 });
      }
      for (let i = 0; i < 7; i++) sph(mq, 0.12, M('#4d7c0f', { flat: true }), -1.7 + rnd() * 3.4, th + 0.2, -0.9 + rnd() * 1.8, 6);
      ticks.push((t) => blds.forEach((b) => {
        const k = Math.min(1, Math.max(0.05, ((t % 10) - b.ph) / 1.4));
        const s = (t % 10) > 9.3 ? Math.max(0.05, 1 - ((t % 10) - 9.3) * 1.4) : k;
        b.m.scale.y = b.h * s;
        b.m.position.y = th + 0.08 + (b.h * s) / 2;
      }));
      // mesa de dibujo inclinada
      const dt0 = prop(-2.8, -3.2, 0.5);
      for (const sx of [-0.8, 0.8]) box(dt0, 0.08, 1.2, 0.08, M('#57534e'), sx, 0, 0);
      const board = group(dt0, 0, 1.25, 0);
      board.rotation.x = -0.55;
      box(board, 2.0, 0.06, 1.3, M('#f5f5f4'), 0, 0, 0);
      plane(board, 1.6, 1.0, MT(canvasTex(512, 320, (c, w, h) => {
        c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#334155'; c.lineWidth = 3;
        c.strokeRect(40, 40, 260, 200); c.beginPath(); c.moveTo(40, 40); c.lineTo(170, -10); c.lineTo(300, 40); c.stroke();
        c.strokeRect(320, 100, 150, 140); c.beginPath(); c.arc(395, 170, 40, 0, Math.PI * 2); c.stroke();
        c.fillStyle = '#334155'; c.font = 'bold 26px Arial'; c.fillText('PLANTA - ESC. 1:100', 40, 290);
      }).t), 0, 0.035, 0).rotation.x = -Math.PI / 2;
      deskLamp(dt0, 0.9, 1.3, -0.3, '#111827', '#fff4d6', false);
      // lámparas colgantes
      for (const x of [-0.6, 1.8]) {
        const lp = group(root, x, 5.2, 0.4);
        box(lp, 0.02, 1.4, 0.02, M('#111'), 0, -1.4, 0);
        const sh = mesh(new T.ConeGeometry(0.35, 0.35, 20, 1, true), M('#111827', { side: true }), lp);
        sh.position.y = -1.55;
        sph(lp, 0.09, M('#fff4d6', { e: '#fff4d6', ei: 2 }), 0, -1.68, 0, 10);
      }
      const pl = new T.PointLight('#fff4d6', 4, 6, 1.5);
      pl.position.set(0.6, 3.4, 0.4);
      root.add(pl);
      // planos enrollados
      const bin = prop(3.8, -3.8);
      cyl(bin, 0.35, 0.3, 0.9, M('#57534e'), 0, 0, 0);
      for (let i = 0; i < 5; i++) { const r = cyl(bin, 0.06, 0.06, 1.4, M(i % 2 ? '#e0f2fe' : '#fef3c7'), (rnd() - 0.5) * 0.3, 0.3, (rnd() - 0.5) * 0.3, 10); r.rotation.z = (rnd() - 0.5) * 0.3; }
      plant(root, 3.9, 3.6, 1.2, '#78716c');
      dust('#ffffff', 50);
    },

    /* MEDICINA: consultorio con monitor de electrocardiograma, corazón latiendo y camilla */
    medicina: () => {
      shell({ wall: '#e3f4f1', wall2: '#d5ede9', floor: '#cfd8dc', kind: 'tile', trim: '#14b8a6' });
      // camilla
      const bed = prop(-2.6, 0.6, Math.PI / 2);
      box(bed, 3.0, 0.7, 1.2, M('#cbd5e1', { m: 0.4 }), 0, 0.3, 0);
      for (const sx of [-1.35, 1.35]) for (const sz of [-0.5, 0.5]) box(bed, 0.08, 0.3, 0.08, M('#64748b', { m: 0.6 }), sx, 0, sz);
      box(bed, 3.0, 0.12, 1.2, M('#e0f2fe'), 0, 1.0, 0);
      const pil = box(bed, 0.7, 0.18, 1.0, M('#ffffff'), -1.05, 1.12, 0);
      pil.rotation.z = 0.12;
      // monitor ECG
      const ecg = canvasTex(512, 256, () => {});
      const pts: number[] = [];
      const beat = (x: number) => {
        const k = x % 1;
        if (k < 0.08) return Math.sin((k / 0.08) * Math.PI) * 0.08;
        if (k > 0.15 && k < 0.18) return -0.15;
        if (k >= 0.18 && k < 0.22) return 0.9;
        if (k >= 0.22 && k < 0.26) return -0.3;
        if (k > 0.4 && k < 0.55) return Math.sin(((k - 0.4) / 0.15) * Math.PI) * 0.2;
        return 0;
      };
      let ecgT = 0, ecgAcc = 0;
      ticks.push((_t, dt) => {
        ecgT += dt; ecgAcc += dt;
        if (ecgAcc < 0.05) return;
        ecgAcc = 0;
        ecg.redraw((c, w, h) => {
          c.fillStyle = '#04120f'; c.fillRect(0, 0, w, h);
          c.strokeStyle = 'rgba(34,197,94,0.15)';
          for (let i = 0; i < w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); }
          c.strokeStyle = '#22c55e'; c.lineWidth = 4; c.beginPath();
          for (let x = 0; x < 380; x += 2) { const y = h * 0.6 - beat(ecgT * 1.2 - (380 - x) / 220) * 110; x ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.stroke();
          c.fillStyle = '#22c55e'; c.font = 'bold 54px Arial'; c.fillText('72', 400, 110);
          c.font = '22px Arial'; c.fillText('LPM', 405, 140); c.fillStyle = '#38bdf8'; c.fillText('SpO2 98%', 390, 200);
        });
      });
      const mn = prop(-3.6, -3.4, 0.5);
      cyl(mn, 0.35, 0.4, 0.08, M('#475569', { m: 0.5 }), 0, 0, 0);
      cyl(mn, 0.05, 0.05, 2.1, M('#94a3b8', { m: 0.7 }), 0, 0.08, 0, 10);
      box(mn, 1.5, 0.95, 0.2, M('#1e293b', { m: 0.3 }), 0, 2.1, 0);
      plane(mn, 1.36, 0.8, MT(ecg.t, { e: true }), 0, 2.575, 0.105);
      void pts;
      // corazón flotante
      const hs = new T.Shape();
      hs.moveTo(0, 0.25);
      hs.bezierCurveTo(0, 0.5, -0.45, 0.55, -0.45, 0.2);
      hs.bezierCurveTo(-0.45, -0.05, -0.15, -0.25, 0, -0.45);
      hs.bezierCurveTo(0.15, -0.25, 0.45, -0.05, 0.45, 0.2);
      hs.bezierCurveTo(0.45, 0.55, 0, 0.5, 0, 0.25);
      const heartG = prop(1.6, 0.4, 0, 3.2);
      const heart = mesh(new T.ExtrudeGeometry(hs, { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 4 }), M('#e11d48', { r: 0.35, e: '#7f1d1d', ei: 0.4 }), heartG);
      heart.position.z = -0.12;
      ticks.push((t) => {
        const k = (t * 1.2) % 1;
        const s = 1 + (k < 0.12 ? Math.sin((k / 0.12) * Math.PI) * 0.18 : k > 0.2 && k < 0.32 ? Math.sin(((k - 0.2) / 0.12) * Math.PI) * 0.1 : 0);
        heartG.scale.setScalar(1.6 * s);
        heartG.rotation.y = t * 0.6;
      });
      // escritorio con estetoscopio
      const d = prop(1.8, -3.4);
      const h = desk(d, 2.6, 1.2, 1.1, '#f8fafc', '#94a3b8');
      const st = mesh(new T.TorusGeometry(0.28, 0.035, 8, 24, Math.PI * 1.6), M('#111827'), d);
      st.position.set(-0.4, h + 0.04, 0.1); st.rotation.x = -Math.PI / 2;
      cyl(d, 0.09, 0.09, 0.05, M('#cbd5e1', { m: 0.8, r: 0.3 }), -0.1, h, 0.35);
      chair(root, 1.8, -2.2, Math.PI, '#0f766e');
      // cruz verde
      const cross = M('#10b981', { e: '#10b981', ei: 0.6 });
      const cg = group(root, -4.84, 3.8, 1.8, Math.PI / 2);
      box(cg, 0.9, 0.3, 0.06, cross, 0, -0.15, 0);
      box(cg, 0.3, 0.9, 0.06, cross, 0, -0.45, 0);
      ticks.push((t) => (cross.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.3));
      wallArt('back', -0.6, 3.6, 1.0, 1.4, MT(text(['E', 'F P', 'T O Z', 'L P E D'], { bg: '#ffffff', fg: '#111', w: 256, h: 360, font: 'bold 52px Arial' })), '#e2e8f0');
      plant(root, 3.9, 3.4, 1.1, '#e2e8f0');
      dust('#ccfbf1', 50);
    },

    /* ENFERMERÍA: sala de hospital con cama, suero goteando, carrito de medicinas y silla de ruedas */
    enfermeria: () => {
      shell({ wall: '#e6f0fb', wall2: '#dbe8f7', floor: '#dfe6ee', kind: 'tile', trim: '#3b82f6' });
      windowLeft(-2.2, 2.4, 2.2, 1.6, '#dbeafe');
      // cama de hospital
      const bed = prop(0.4, -2.8);
      box(bed, 2.2, 0.6, 3.2, M('#e2e8f0', { m: 0.4 }), 0, 0.3, 0);
      box(bed, 2.2, 0.25, 3.2, M('#ffffff'), 0, 0.9, 0);
      box(bed, 2.25, 0.18, 2.0, M('#60a5fa'), 0, 1.06, 0.55);
      box(bed, 1.4, 0.2, 0.6, M('#ffffff'), 0, 1.1, -1.15);
      box(bed, 2.3, 1.3, 0.12, M('#94a3b8', { m: 0.5 }), 0, 0.3, -1.65);
      for (const sx of [-1.15, 1.15]) box(bed, 0.06, 0.4, 1.6, M('#94a3b8', { m: 0.6 }), sx, 1.15, 0.3);
      for (const sx of [-1, 1]) for (const sz of [-1.5, 1.5]) sph(bed, 0.1, M('#334155'), sx, 0.1, sz, 8);
      // suero
      const iv = prop(2.2, -3.6);
      cyl(iv, 0.35, 0.35, 0.05, M('#64748b', { m: 0.6 }), 0, 0, 0);
      cyl(iv, 0.03, 0.03, 3.6, M('#cbd5e1', { m: 0.8, r: 0.3 }), 0, 0.05, 0, 8);
      box(iv, 0.6, 0.03, 0.03, M('#cbd5e1', { m: 0.8 }), 0, 3.6, 0);
      box(iv, 0.36, 0.6, 0.14, M('#bae6fd', { op: 0.6 }), 0.22, 2.95, 0);
      cyl(iv, 0.06, 0.06, 0.22, M('#e0f2fe', { op: 0.5 }), 0.22, 2.5, 0, 10);
      const drop = sph(iv, 0.03, M('#38bdf8', { e: '#38bdf8', ei: 0.6 }), 0.22, 2.68, 0, 8);
      box(iv, 0.015, 1.4, 0.015, M('#e0f2fe', { op: 0.6 }), 0.22, 1.1, 0);
      ticks.push((t) => { const k = (t * 1.4) % 1; drop.position.y = 2.68 - k * 0.16; drop.scale.setScalar(k < 0.85 ? 1 : 0.01); });
      // carrito de medicinas
      const cart = prop(-3.2, -1.0, 0.4);
      box(cart, 1.3, 1.2, 0.8, M('#f8fafc'), 0, 0.15, 0);
      for (let i = 0; i < 3; i++) box(cart, 1.2, 0.34, 0.02, M(['#93c5fd', '#fca5a5', '#86efac'][i]), 0, 0.22 + i * 0.38, 0.41);
      for (const sx of [-0.55, 0.55]) for (const sz of [-0.3, 0.3]) sph(cart, 0.08, M('#334155'), sx, 0.08, sz, 8);
      for (let i = 0; i < 6; i++) { cyl(cart, 0.08, 0.08, 0.25, M(['#f97316', '#ffffff', '#3b82f6'][i % 3]), -0.45 + i * 0.18, 1.35, (rnd() - 0.5) * 0.4, 12); }
      // silla de ruedas
      const wc = prop(2.6, 1.8, -0.8);
      for (const sz of [-0.42, 0.42]) { const w = mesh(new T.TorusGeometry(0.42, 0.04, 8, 24), M('#475569', { m: 0.7 }), wc); w.position.set(0, 0.46, sz); }
      box(wc, 0.8, 0.1, 0.8, M('#1e3a8a'), 0.05, 0.62, 0);
      box(wc, 0.1, 0.8, 0.8, M('#1e3a8a'), -0.35, 0.62, 0);
      // cruz roja
      const cg = group(root, 1.2, 3.8, -4.84);
      cyl(cg, 0.55, 0.55, 0.05, M('#ffffff'), 0, -0.02, 0, 30).rotation.x = Math.PI / 2;
      const red = M('#dc2626', { e: '#dc2626', ei: 0.3 });
      box(cg, 0.7, 0.22, 0.06, red, 0, -0.11, 0.04);
      box(cg, 0.22, 0.7, 0.06, red, 0, -0.35, 0.04);
      wallArt('back', -2.6, 3.4, 1.4, 1.0, MT(text(['TURNO', 'NOCHE', '✓'], { bg: '#ffffff', fg: '#1e3a8a', font: 'bold 44px Arial' })), '#93c5fd');
      plant(root, -3.9, 3.8, 1.0, '#e2e8f0');
      dust('#dbeafe', 50);
    },

    /* PSICOLOGÍA: consultorio tranquilo con diván, sillón y un cerebro flotando */
    psicologia: () => {
      shell({ wall: '#ebe3f5', wall2: '#e2d7f0', floor: '#cbb8a0', trim: '#a78bfa' });
      windowLeft(2.0, 2.4, 2.0, 1.6, '#ede9fe');
      rug(root, 4.2, 4.2, '#c4b5fd', 0.6, 0.6, true);
      // diván
      const cv = prop(-1.9, -3.4);
      box(cv, 3.4, 0.55, 1.2, M('#7c3aed', { r: 0.9 }), 0, 0.2, 0);
      box(cv, 3.4, 0.9, 0.3, M('#6d28d9', { r: 0.9 }), 0, 0.5, -0.45);
      box(cv, 0.3, 0.7, 1.2, M('#6d28d9', { r: 0.9 }), -1.6, 0.5, 0);
      const pil = cyl(cv, 0.2, 0.2, 0.9, M('#f5f3ff'), -1.1, 0.75, 0.05, 14);
      pil.rotation.x = Math.PI / 2; pil.position.y = 0.95;
      for (const sx of [-1.5, 1.5]) box(cv, 0.12, 0.2, 0.12, M('#3b2a1a'), sx, 0, 0.45);
      // sillón
      const ac = prop(2.4, -1.0, -2.3);
      box(ac, 1.2, 0.55, 1.2, M('#a78bfa', { r: 0.9 }), 0, 0.2, 0);
      box(ac, 1.2, 1.0, 0.25, M('#8b5cf6', { r: 0.9 }), 0, 0.5, -0.5);
      for (const sx of [-0.55, 0.55]) box(ac, 0.2, 0.6, 1.2, M('#8b5cf6', { r: 0.9 }), sx, 0.5, 0);
      // mesa auxiliar
      const st = prop(0.6, -3.4);
      cyl(st, 0.4, 0.4, 0.06, M('#d6b98c'), 0, 0.85, 0, 24);
      cyl(st, 0.05, 0.05, 0.85, M('#3b2a1a'), 0, 0, 0, 8);
      box(st, 0.3, 0.2, 0.2, M('#ffffff'), -0.1, 0.91, 0);
      cyl(st, 0.07, 0.06, 0.2, M('#bae6fd', { op: 0.6 }), 0.18, 0.91, 0.1, 12);
      // cerebro flotante
      const br = prop(0.6, 0.6, 0, 3.0);
      const pink = M('#f9a8d4', { r: 0.5, e: '#be185d', ei: 0.15 });
      for (let i = 0; i < 46; i++) {
        const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1);
        const r = 0.55;
        const s = sph(br, 0.17 + rnd() * 0.08, pink, Math.sin(v) * Math.cos(u) * r * 1.25, Math.cos(v) * r * 0.8, Math.sin(v) * Math.sin(u) * r, 10);
        if (Math.abs(s.position.x) < 0.06) s.position.x += 0.08;
      }
      box(br, 0.02, 0.9, 1.1, M('#be185d', { op: 0.35 }), 0, -0.45, 0);
      ticks.push((t) => { br.rotation.y = t * 0.4; br.position.y = 3.0 + Math.sin(t * 1.2) * 0.18; });
      // ondas alrededor
      const rings: any[] = [];
      for (let i = 0; i < 3; i++) {
        const r = mesh(new T.TorusGeometry(1.0, 0.015, 6, 48), M('#c4b5fd', { e: '#a78bfa', ei: 1, op: 0.6 }), br);
        r.rotation.x = Math.PI / 2;
        rings.push(r);
      }
      ticks.push((t) => rings.forEach((r, i) => { const k = ((t * 0.5 + i / 3) % 1); r.scale.setScalar(0.8 + k * 1.4); r.material.opacity = 0.6 * (1 - k); }));
      // lámpara de pie
      const fl = prop(-4.1, 0.6);
      cyl(fl, 0.3, 0.3, 0.05, M('#3b2a1a'), 0, 0, 0);
      cyl(fl, 0.03, 0.03, 2.8, M('#3b2a1a'), 0, 0.05, 0, 8);
      cyl(fl, 0.3, 0.45, 0.5, M('#fef3c7', { e: '#fde68a', ei: 0.7 }), 0, 2.8, 0, 20);
      const pl = new T.PointLight('#fde68a', 3, 5, 1.6); pl.position.set(-4.1, 2.9, 0.6); root.add(pl);
      wallArt('back', 2.6, 3.4, 1.6, 1.2, MT(canvasTex(320, 240, (c, w, h) => {
        c.fillStyle = '#faf5ff'; c.fillRect(0, 0, w, h);
        [['#c4b5fd', 100, 120, 70], ['#f9a8d4', 200, 100, 55], ['#a7f3d0', 160, 170, 45]].forEach(([col, x, y, r]) => { c.fillStyle = col as string; c.beginPath(); c.arc(x as number, y as number, r as number, 0, 7); c.fill(); });
      }).t), '#6d28d9');
      plant(root, 3.9, 3.9, 1.3, '#a78bfa');
      dust('#f5d0fe', 60);
    },

    /* ADMINISTRACIÓN: oficina gerencial con gráfico de barras que sube, globo terráqueo y laptop */
    administracion: () => {
      shell({ wall: '#e3e8ef', wall2: '#d9e0ea', floor: '#8a6f55', trim: '#334e68' });
      windowLeft(-1.8, 2.4, 2.6, 2.0, '#cfe8ff');
      // pizarra con barras 3D
      const wb = prop(1.2, -4.75);
      box(wb, 3.6, 2.4, 0.08, M('#ffffff'), 0, 1.8, 0);
      box(wb, 3.7, 0.08, 0.2, M('#94a3b8', { m: 0.5 }), 0, 1.75, 0.05);
      const bars: any[] = [];
      const bc = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];
      for (let i = 0; i < 5; i++) bars.push(box(wb, 0.42, 1, 0.2, M(bc[i], { r: 0.5 }), -1.3 + i * 0.65, 2.0, 0.12));
      const arrow = group(wb, 0, 0, 0.25);
      const ar = box(arrow, 2.8, 0.06, 0.04, M('#16a34a', { e: '#16a34a', ei: 0.5 }), 0, 2.6, 0);
      ar.rotation.z = 0.32;
      ticks.push((t) => bars.forEach((b, i) => { const hgt = 0.3 + (i + 1) * 0.28 * (0.75 + Math.sin(t * 0.9 + i) * 0.25); b.scale.y = hgt; b.position.y = 2.0 + hgt / 2; }));
      // escritorio ejecutivo con laptop
      const d = prop(0.8, -0.6);
      const h = desk(d, 3.4, 1.5, 1.15, '#3b2f2a');
      const lap = group(d, 0, h, 0);
      box(lap, 0.9, 0.04, 0.6, M('#9ca3af', { m: 0.7, r: 0.3 }), 0, 0, 0.1);
      const scr = group(lap, 0, 0.04, -0.2);
      scr.rotation.x = -0.25;
      box(scr, 0.9, 0.58, 0.03, M('#9ca3af', { m: 0.7, r: 0.3 }), 0, 0, 0);
      plane(scr, 0.82, 0.5, MT(canvasTex(320, 200, (c, w, h2) => {
        c.fillStyle = '#0f172a'; c.fillRect(0, 0, w, h2); c.strokeStyle = '#22c55e'; c.lineWidth = 5; c.beginPath();
        [10, 150, 60, 120, 110, 100, 160, 70, 210, 80, 260, 30, 310, 20].reduce((_, v, i, a) => { if (i % 2 === 0) i ? c.lineTo(v, a[i + 1]) : c.moveTo(v, a[i + 1]); return 0; }, 0);
        c.stroke(); c.fillStyle = '#e2e8f0'; c.font = 'bold 26px Arial'; c.fillText('VENTAS +32%', 20, 185);
      }).t, { e: true }), 0, 0.29, 0.02);
      // maletín
      box(d, 0.7, 0.45, 0.2, M('#7c2d12'), 1.1, h, 0.2);
      chair(root, 0.8, -1.9, 0, '#111827', 0.75);
      // globo terráqueo
      const gl = prop(-3.4, -3.4);
      cyl(gl, 0.35, 0.4, 0.08, M('#3b2a1a'), 0, 0, 0);
      cyl(gl, 0.04, 0.04, 1.0, M('#c9a227', { m: 0.8 }), 0, 0.08, 0, 8);
      const globe = group(gl, 0, 1.55, 0);
      globe.rotation.z = 0.4;
      sph(globe, 0.48, M('#3b82f6', { r: 0.4 }), 0, 0, 0, 24);
      const land = mesh(new T.SphereGeometry(0.49, 12, 8), new T.MeshStandardMaterial({ color: '#22c55e', wireframe: true }), globe);
      void land;
      spin(globe, 0.6, 'y');
      plant(root, 3.8, -3.8, 1.3);
      plant(root, -3.9, 3.6, 1.0);
      dust('#e0f2fe', 50);
    },

    /* CONTABILIDAD: calculadora gigante, monedas que se apilan, gráfico circular girando y alcancía */
    contabilidad: () => {
      shell({ wall: '#e6efe6', wall2: '#dbe7db', floor: '#9c8468', trim: '#15803d' });
      const d = prop(0.6, -2.6);
      const h = desk(d, 3.6, 1.6, 1.1, '#e7e5e4', '#57534e');
      // calculadora
      const calc = group(d, -0.6, h, 0);
      calc.rotation.x = -0.12;
      box(calc, 1.1, 0.12, 1.4, M('#1f2937', { r: 0.5 }), 0, 0, 0);
      const disp = canvasTex(256, 64, () => {});
      let num = 0, nacc = 0;
      ticks.push((_t, dt) => { nacc += dt; if (nacc > 0.5) { nacc = 0; num = (num + 1234.5) % 99999; disp.redraw((c, w, hh) => { c.fillStyle = '#a3e635'; c.fillRect(0, 0, w, hh); c.fillStyle = '#1a2e05'; c.font = 'bold 44px monospace'; c.textAlign = 'right'; c.fillText('S/ ' + num.toFixed(2), w - 10, 48); }); } });
      const dm = plane(calc, 0.9, 0.24, MT(disp.t, { e: true }), 0, 0.125, -0.48);
      dm.rotation.x = -Math.PI / 2;
      for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 4; c2++) box(calc, 0.18, 0.06, 0.18, M(c2 === 3 ? '#f97316' : '#e5e7eb'), -0.33 + c2 * 0.22, 0.12, -0.15 + r * 0.22);
      // libros contables
      for (let i = 0; i < 3; i++) box(d, 0.8, 0.12, 1.0, M(['#166534', '#14532d', '#365314'][i]), 1.0, h + i * 0.12, 0.1);
      // monedas
      const cs = prop(2.6, 0.4);
      const coin = M('#eab308', { m: 0.9, r: 0.25 });
      const stacks: any[][] = [];
      for (let s = 0; s < 3; s++) {
        const arr: any[] = [];
        for (let i = 0; i < 9; i++) arr.push(cyl(cs, 0.26, 0.26, 0.07, coin, s * 0.62 - 0.6, i * 0.075, (s % 2) * 0.3, 24));
        stacks.push(arr);
      }
      ticks.push((t) => stacks.forEach((arr, s) => { const k = ((t * 0.6 + s * 0.4) % 4) / 3; arr.forEach((c, i) => (c.visible = i < Math.ceil(k * arr.length))); }));
      const flying = cyl(cs, 0.26, 0.26, 0.07, coin, 0, 2, 0, 24);
      ticks.push((t) => { flying.rotation.x = t * 4; flying.position.y = 2.2 + Math.sin(t * 1.5) * 0.3; });
      // gráfico circular
      const pie = prop(-1.6, 1.0, 0, 3.0);
      const pc = ['#16a34a', '#eab308', '#2563eb', '#dc2626'];
      const parts = [0.4, 0.25, 0.2, 0.15];
      let a0 = 0;
      parts.forEach((p, i) => {
        const g = mesh(new T.CylinderGeometry(0.9, 0.9, 0.3, 32, 1, false, a0, p * Math.PI * 2), M(pc[i], { r: 0.5 }), pie);
        const mid = a0 + p * Math.PI;
        if (i === 0) g.position.set(Math.sin(mid) * 0.12, 0, Math.cos(mid) * 0.12);
        a0 += p * Math.PI * 2;
      });
      pie.rotation.x = 0.5;
      ticks.push((t) => { pie.rotation.y = t * 0.5; pie.position.y = 3.0 + Math.sin(t) * 0.15; });
      // alcancía
      const pig = prop(-3.4, -1.0, 0.8);
      const pm = M('#f9a8d4', { r: 0.5 });
      const body = sph(pig, 0.55, pm, 0, 0.6, 0, 20);
      body.scale.set(1.25, 1, 1);
      const sn = cyl(pig, 0.16, 0.16, 0.12, M('#f472b6'), 0.7, 0.5, 0, 16);
      sn.rotation.z = Math.PI / 2; sn.position.y = 0.6;
      for (const sx of [-0.35, 0.35]) for (const sz of [-0.25, 0.25]) cyl(pig, 0.08, 0.08, 0.2, pm, sx, 0, sz, 10);
      for (const sz of [-0.2, 0.2]) { const e = mesh(new T.ConeGeometry(0.1, 0.18, 8), pm, pig); e.position.set(0.35, 1.12, sz); }
      box(pig, 0.3, 0.02, 0.05, M('#831843'), 0, 1.15, 0);
      // archivador
      const fc = prop(-3.9, -3.9);
      box(fc, 1.0, 2.2, 0.9, M('#94a3b8', { m: 0.5, r: 0.4 }), 0, 0, 0);
      for (let i = 0; i < 4; i++) box(fc, 0.3, 0.06, 0.04, M('#475569'), 0, 0.4 + i * 0.52, 0.46);
      wallArt('left', 1.8, 3.4, 1.8, 1.2, MT(text(['ACTIVO =', 'PASIVO + PATRIMONIO'], { bg: '#ffffff', fg: '#14532d', font: 'bold 40px Arial' })), '#15803d');
      dust('#fef9c3', 50);
    },

    /* COMUNICACIÓN: set de TV con cámara, focos, micrófono, claqueta y letrero "AL AIRE" */
    comunicacion: () => {
      shell({ wall: '#464655', wall2: '#3d3d4b', floor: '#5b5b66', kind: 'plain', trim: '#be123c' });
      light.hemi = 0.95;
      light.sun = 1.0;
      // fondo croma
      box(root, 5.0, 4.2, 0.05, M('#22a559', { r: 0.95 }), 0.6, 0, -4.84);
      // sillones de entrevista
      for (const [x, ry] of [[-0.6, 0.5], [1.8, -0.5]] as const) {
        const s = prop(x, -2.6, ry);
        box(s, 1.0, 0.5, 1.0, M('#e11d48', { r: 0.9 }), 0, 0.25, 0);
        box(s, 1.0, 0.9, 0.2, M('#be123c', { r: 0.9 }), 0, 0.5, -0.4);
      }
      // cámara en trípode
      const cam = prop(1.8, 2.2, -2.5);
      for (let i = 0; i < 3; i++) { const l = box(cam, 0.05, 1.6, 0.05, M('#111'), 0, 0, 0); l.rotation.z = 0.25; l.rotation.y = (i / 3) * Math.PI * 2; l.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.25, 0.78, Math.sin((i / 3) * Math.PI * 2) * 0.25); }
      const head = group(cam, 0, 1.6, 0);
      box(head, 0.5, 0.45, 0.9, M('#1f2937', { m: 0.4 }), 0, 0, 0);
      const lens = cyl(head, 0.16, 0.2, 0.4, M('#0f172a', { m: 0.6, r: 0.3 }), 0, 0.22, 0.6, 18);
      lens.rotation.x = Math.PI / 2; lens.position.set(0, 0.22, 0.6);
      sph(head, 0.05, M('#ef4444', { e: '#ef4444', ei: 3 }), 0.2, 0.42, 0.3, 8);
      ticks.push((t) => (head.rotation.y = Math.sin(t * 0.5) * 0.35));
      // focos con haz de luz
      for (const [x, z, ry] of [[-3.4, 1.0, 0.9], [3.6, -0.6, -0.9]] as const) {
        const f = prop(x, z, ry);
        cyl(f, 0.3, 0.3, 0.05, M('#111'), 0, 0, 0);
        cyl(f, 0.03, 0.03, 2.6, M('#111'), 0, 0.05, 0, 8);
        const lamp = group(f, 0, 2.7, 0);
        lamp.rotation.x = 0.7;
        cyl(lamp, 0.3, 0.25, 0.45, M('#374151', { m: 0.5 }), 0, -0.2, 0, 16);
        const beam = mesh(new T.ConeGeometry(1.4, 4.0, 24, 1, true), new T.MeshBasicMaterial({ color: '#fff7d6', transparent: true, opacity: 0.08, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending }), lamp);
        beam.position.y = -2.2;
        beam.castShadow = false;
        ticks.push((t) => (beam.material.opacity = 0.07 + Math.sin(t * 7 + x) * 0.01));
        const sl = new T.SpotLight('#fff7d6', 12, 10, 0.6, 0.5, 1.2);
        sl.position.set(0, 0, 0);
        sl.target.position.set(0, -4, 0);
        lamp.add(sl);
        lamp.add(sl.target);
      }
      // micrófono
      const mic = prop(0.6, -1.0);
      cyl(mic, 0.25, 0.25, 0.04, M('#111'), 0, 0, 0);
      cyl(mic, 0.025, 0.025, 1.5, M('#9ca3af', { m: 0.8 }), 0, 0.04, 0, 8);
      sph(mic, 0.12, M('#374151', { m: 0.5, r: 0.5 }), 0, 1.65, 0, 14);
      // claqueta
      const cl = prop(-2.4, 2.6, 0.4);
      box(cl, 1.0, 0.7, 0.06, M('#111827'), 0, 0, 0);
      plane(cl, 0.9, 0.5, MT(text(['ESCENA 5', 'TOMA 2'], { bg: '#111827', fg: '#fff', font: 'bold 50px Arial' })), 0, 0.33, 0.035);
      const top = group(cl, -0.5, 0.72, 0);
      box(top, 1.0, 0.14, 0.06, M('#f8fafc'), 0.5, 0, 0);
      ticks.push((t) => { const k = t % 3; top.rotation.z = k < 0.12 ? (k / 0.12) * 0.5 : k < 0.2 ? 0.5 - ((k - 0.12) / 0.08) * 0.5 : 0; });
      // letrero AL AIRE
      const onair = M('#ef4444', { e: '#ef4444', ei: 1.5 });
      const sign = group(root, -4.84, 4.0, 1.4, Math.PI / 2);
      box(sign, 1.8, 0.6, 0.08, M('#111'), 0, -0.3, 0);
      plane(sign, 1.6, 0.45, MT(text(['● AL AIRE'], { bg: '#7f1d1d', fg: '#fecaca', font: 'bold 70px Arial' }), { e: true }), 0, 0, 0.05);
      void onair;
      const sm = sign.children[1].material;
      ticks.push((t) => (sm.emissiveIntensity = Math.sin(t * 3) > 0 ? 1.2 : 0.3));
      dust('#fda4af', 70);
    },

    /* EDUCACIÓN: aula con pizarra, carpetas, reloj de pared que avanza y cubos de letras */
    educacion: () => {
      shell({ wall: '#f4ecd8', wall2: '#ebe1c8', floor: '#c49a6c', trim: '#92400e' });
      windowLeft(1.8, 2.4, 2.4, 1.8);
      // pizarra
      const bb = prop(0.4, -4.75);
      box(bb, 4.6, 2.3, 0.1, M('#7c4a1e'), 0, 1.5, 0);
      plane(bb, 4.4, 2.1, MT(canvasTex(800, 380, (c, w, h) => {
        c.fillStyle = '#1f4d3a'; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,255,255,0.92)'; c.font = '52px "Comic Sans MS", cursive';
        c.fillText('¡Hola, clase!', 40, 80); c.fillText('2 + 3 = 5', 60, 170); c.fillText('A  B  C', 480, 170);
        c.font = '40px "Comic Sans MS", cursive'; c.fillText('Hoy: Exchange UCV ✏', 40, 280); c.fillText('Tarea: compartir apuntes', 40, 340);
      }).t), 0, 2.65, 0.06);
      box(bb, 4.6, 0.08, 0.2, M('#7c4a1e'), 0, 1.45, 0.1);
      // escritorio del profesor con manzana
      const td = prop(2.4, -2.6, -0.3);
      const h = desk(td, 2.2, 1.1, 1.1, '#8b5a2b');
      const apple = sph(td, 0.17, M('#dc2626', { r: 0.4 }), -0.5, h + 0.16, 0.1, 16);
      cyl(td, 0.015, 0.015, 0.12, M('#3f2a14'), -0.5, h + 0.31, 0.1, 6);
      bob(apple, 0.0, 1);
      box(td, 0.5, 0.25, 0.35, M('#1d4ed8'), 0.4, h, 0);
      // carpetas de alumnos
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 2; c++) {
          const sd = prop(-1.6 + c * 2.0, 0.2 + r * 2.0);
          desk(sd, 1.3, 0.8, 0.95, '#d6a86b', '#4b5563');
          chair(sd, 0, 0.75, Math.PI, '#2563eb', 0.6);
          box(sd, 0.4, 0.04, 0.3, M('#ffffff'), -0.1, 0.95, 0);
        }
      // reloj
      const clk = group(root, -4.84, 4.0, -2.2, Math.PI / 2);
      cyl(clk, 0.45, 0.45, 0.06, M('#ffffff'), 0, 0, 0, 30).rotation.x = Math.PI / 2;
      const hh = group(clk, 0, 0, 0.06);
      box(hh, 0.04, 0.28, 0.02, M('#111'), 0, 0, 0);
      const mh = group(clk, 0, 0, 0.07);
      box(mh, 0.03, 0.38, 0.02, M('#dc2626'), 0, 0, 0);
      ticks.push((t) => { mh.rotation.z = -t * 1.2; hh.rotation.z = -t * 0.1; });
      // cubos de letras
      const blocks = prop(3.5, 2.6);
      ['A', 'B', 'C'].forEach((L, i) => {
        const m = MT(text([L], { bg: ['#fde68a', '#bfdbfe', '#fecaca'][i], fg: '#1f2937', font: 'bold 150px Arial', w: 256, h: 256 }));
        const b = box(blocks, 0.55, 0.55, 0.55, m, i === 2 ? 0.28 : i * 0.6 - 0.3, i === 2 ? 0.55 : 0, 0);
        b.rotation.y = rnd() * 0.5;
        if (i === 2) ticks.push((t) => (b.position.y = 0.55 + 0.275 + Math.abs(Math.sin(t * 2)) * 0.3));
      });
      // globo
      const gl = prop(-3.6, -3.4);
      cyl(gl, 0.3, 0.35, 0.06, M('#3b2a1a'), 0, 0, 0);
      cyl(gl, 0.03, 0.03, 0.8, M('#c9a227', { m: 0.8 }), 0, 0.06, 0, 8);
      const g = sph(gl, 0.4, M('#60a5fa'), 0, 1.25, 0, 20);
      g.rotation.z = 0.4;
      spin(g, 0.5, 'y');
      dust('#fff7ed', 50);
    },

    /* TUTORÍAS (Conocimientos): mesa redonda, burbujas de conversación y foco de ideas */
    tutoria: () => {
      shell({ wall: '#e8eefc', wall2: '#dde6fa', floor: '#b58d64', trim: '#2563eb' });
      windowLeft(-1.6, 2.4, 2.4, 1.8);
      rug(root, 4.6, 4.6, '#bfdbfe', 0.6, 0.6, true);
      const tb = prop(0.6, 0.6);
      cyl(tb, 1.2, 1.2, 0.1, M('#f8fafc'), 0, 1.0, 0, 36);
      cyl(tb, 0.12, 0.2, 1.0, M('#475569', { m: 0.5 }), 0, 0, 0, 12);
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; chair(tb, Math.cos(a) * 1.75, Math.sin(a) * 1.75, -a - Math.PI / 2, ['#2563eb', '#dc2626', '#16a34a', '#f59e0b'][i], 0.65); }
      // laptop y libros
      box(tb, 0.7, 0.04, 0.5, M('#9ca3af', { m: 0.7 }), -0.3, 1.1, 0.2);
      const scr = box(tb, 0.7, 0.45, 0.03, M('#1e3a8a', { e: '#1e40af', ei: 0.5 }), -0.3, 1.12, -0.05);
      scr.rotation.x = -0.25;
      for (let i = 0; i < 3; i++) box(tb, 0.5, 0.08, 0.36, M(['#dc2626', '#2563eb', '#16a34a'][i]), 0.45, 1.1 + i * 0.08, 0.1);
      // burbujas de conversación
      const bubbles = prop(0.6, 0.6, 0, 0);
      const bub = (x: number, y: number, z: number, color: string, ph: number) => {
        const g = group(bubbles, x, y, z);
        const s = sph(g, 0.42, M(color, { r: 0.4 }), 0, 0, 0, 20);
        s.scale.set(1.3, 0.9, 0.5);
        const tail = mesh(new T.ConeGeometry(0.12, 0.3, 8), M(color, { r: 0.4 }), g);
        tail.position.set(-0.28, -0.4, 0); tail.rotation.z = 2.6;
        for (let i = -1; i <= 1; i++) sph(g, 0.06, M('#ffffff', { e: '#ffffff', ei: 0.4 }), i * 0.18, 0, 0.22, 8);
        bob(g, 0.18, 1.1, ph);
        ticks.push((t) => (g.rotation.y = Math.sin(t * 0.8 + ph) * 0.4));
      };
      bub(-1.2, 2.6, 0.3, '#3b82f6', 0);
      bub(1.3, 3.0, -0.4, '#ef4444', 1.6);
      bub(0.2, 3.5, 1.0, '#22c55e', 3.1);
      // foco de idea
      const bulb = prop(0.6, 0.6, 0, 4.4);
      const glass = sph(bulb, 0.35, M('#fde047', { e: '#facc15', ei: 1.2, op: 0.9 }), 0, 0, 0, 20);
      cyl(bulb, 0.15, 0.15, 0.25, M('#9ca3af', { m: 0.8 }), 0, -0.5, 0, 14);
      const bl = new T.PointLight('#fde047', 4, 6, 1.5);
      bulb.add(bl);
      ticks.push((t) => { const k = 0.9 + Math.sin(t * 2.4) * 0.5; glass.material.emissiveIntensity = k; bl.intensity = 2 + k * 2; });
      wallArt('back', 1.6, 3.5, 2.6, 1.3, MT(text(['TUTORÍA', 'Cálculo · Física · Estática'], { bg: '#ffffff', fg: '#1e3a8a', font: 'bold 44px Arial' })), '#94a3b8');
      const s1 = prop(-3.9, -3.4);
      shelf(s1, 1.6, 3.0, 0.6, '#d6b98c', 3, ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#7c3aed']);
      plant(root, 3.9, 3.9, 1.2, '#2563eb');
      dust('#dbeafe', 50);
    },

    /* BIBLIOTECA (Materiales y por defecto): estantes altos, libros flotando y el emblema de Exchange UCV */
    biblioteca: () => {
      shell({ wall: '#2f4475', wall2: '#2a3d6b', floor: '#6b4630', trim: '#c9a227', h: 5.6 });
      light.hemi = 0.95;
      const pal = ['#b91c1c', '#1e3a8a', '#065f46', '#92400e', '#6b21a8', '#be185d', '#0f766e', '#a16207'];
      for (const x of [-2.6, 0.2, 3.0]) { const s = prop(x, -4.45); shelf(s, 2.7, 4.8, 0.7, '#5b3a1e', 6, pal); }
      for (const z of [-1.4, 1.5]) { const s = prop(-4.45, z, Math.PI / 2); shelf(s, 2.7, 4.8, 0.7, '#5b3a1e', 6, pal); }
      // escalera
      const lad = prop(1.6, -3.7, 0);
      lad.rotation.x = -0.25;
      for (const sx of [-0.35, 0.35]) box(lad, 0.07, 4.2, 0.07, M('#7c4a1e'), sx, 0, 0);
      for (let y = 0.4; y < 4.2; y += 0.5) box(lad, 0.7, 0.06, 0.08, M('#7c4a1e'), 0, y, 0);
      // mesa de lectura
      const t = prop(0.8, 1.2);
      const h = desk(t, 3.2, 1.6, 1.05, '#7c4a1e');
      deskLamp(t, -1.0, h, -0.3, '#166534', '#ffe2a8');
      deskLamp(t, 1.0, h, -0.3, '#166534', '#ffe2a8', false);
      const ob = group(t, 0, h, 0.1);
      box(ob, 0.5, 0.04, 0.7, M('#fefce8'), -0.26, 0, 0).rotation.z = 0.1;
      box(ob, 0.5, 0.04, 0.7, M('#fefce8'), 0.26, 0, 0).rotation.z = -0.1;
      chair(root, 0.0, 2.6, Math.PI, '#7f1d1d', 0.7);
      chair(root, 1.8, 2.6, Math.PI, '#7f1d1d', 0.7);
      // libros flotantes
      const fly = prop(0.8, 0.4, 0, 0);
      for (let i = 0; i < 6; i++) {
        const g = group(fly, 0, 0, 0);
        const col = M(pal[i % pal.length]);
        const page = M('#fefce8');
        const left = group(g, 0, 0, 0), right = group(g, 0, 0, 0);
        box(left, 0.42, 0.04, 0.6, col, -0.21, 0, 0);
        box(left, 0.38, 0.03, 0.56, page, -0.2, 0.04, 0);
        box(right, 0.42, 0.04, 0.6, col, 0.21, 0, 0);
        box(right, 0.38, 0.03, 0.56, page, 0.2, 0.04, 0);
        const r = 1.6 + (i % 3) * 0.5, sp = 0.25 + i * 0.03, ph = i * 1.05, y0 = 2.4 + (i % 3) * 0.55;
        ticks.push((tt) => {
          const a = tt * sp + ph;
          g.position.set(Math.cos(a) * r, y0 + Math.sin(tt * 1.3 + ph) * 0.2, Math.sin(a) * r);
          g.rotation.y = -a;
          const f = Math.sin(tt * 3 + ph) * 0.35 + 0.45;
          left.rotation.z = f; right.rotation.z = -f;
        });
      }
      // emblema hexagonal
      const em = prop(0.8, 0.4, 0, 4.4);
      const hex = mesh(new T.CylinderGeometry(0.55, 0.55, 0.14, 6), M('#dc2626', { r: 0.35, m: 0.3, e: '#7f1d1d', ei: 0.4 }), em);
      hex.rotation.x = Math.PI / 2;
      const inner = mesh(new T.CylinderGeometry(0.36, 0.36, 0.16, 6), M('#fbbf24', { m: 0.8, r: 0.3 }), em);
      inner.rotation.x = Math.PI / 2;
      ticks.push((tt) => { em.rotation.y = tt * 0.8; em.position.y = 4.4 + Math.sin(tt) * 0.12; });
      const pl = new T.PointLight('#fbbf24', 3, 5, 1.5); pl.position.set(0.8, 3.6, 0.4); root.add(pl);
      dust('#fde68a', 80);
    },

    /* INVESTIGACIÓN: laboratorio con matraces burbujeando, microscopio y ADN girando */
    investigacion: () => {
      shell({ wall: '#eef3f7', wall2: '#e3eaf0', floor: '#d0d7de', kind: 'tile', trim: '#0d9488' });
      // mesa de laboratorio
      const bench = prop(0.4, -4.0);
      box(bench, 6.8, 1.0, 1.4, M('#e2e8f0'), 0, 0, 0);
      box(bench, 7.0, 0.1, 1.5, M('#1f2937', { r: 0.4 }), 0, 1.0, 0);
      for (let i = 0; i < 5; i++) box(bench, 0.04, 0.04, 0.02, M('#64748b'), -2.6 + i * 1.3, 0.5, 0.71);
      const top = 1.1;
      // matraces con burbujas
      const flask = (x: number, color: string, ph: number) => {
        const g = group(bench, x, top, -0.1);
        const glass = M('#e0f2fe', { op: 0.35, r: 0.1 });
        const body = mesh(new T.ConeGeometry(0.42, 0.7, 24, 1, true), glass, g); body.position.y = 0.35;
        mesh(new T.CircleGeometry(0.42, 24), glass, g).rotation.x = -Math.PI / 2;
        cyl(g, 0.1, 0.1, 0.4, glass, 0, 0.62, 0, 14);
        const liq = mesh(new T.ConeGeometry(0.36, 0.42, 24), M(color, { e: color, ei: 0.45, op: 0.85 }), g); liq.position.y = 0.21;
        const bubs: any[] = [];
        for (let i = 0; i < 6; i++) bubs.push(sph(g, 0.035 + rnd() * 0.03, M('#ffffff', { op: 0.7 }), (rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3, 8));
        ticks.push((t) => bubs.forEach((b, i) => { const k = ((t * 0.6 + i / 6 + ph) % 1); b.position.y = 0.05 + k * 1.3; b.position.x = Math.sin(k * 8 + i) * 0.08 * (1 - k); b.visible = true; b.scale.setScalar(k > 0.9 ? 0.01 : 1); }));
        return g;
      };
      flask(-2.6, '#22c55e', 0);
      flask(-1.6, '#a855f7', 0.3);
      flask(2.6, '#f97316', 0.6);
      // tubos de ensayo
      const rack = group(bench, -0.5, top, 0.1);
      box(rack, 1.2, 0.08, 0.3, M('#f8fafc'), 0, 0.3, 0);
      box(rack, 1.2, 0.3, 0.05, M('#f8fafc'), 0, 0, -0.12);
      ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#ec4899'].forEach((c, i) => { cyl(rack, 0.06, 0.06, 0.55, M('#e0f2fe', { op: 0.4 }), -0.45 + i * 0.22, 0.05, 0, 10); cyl(rack, 0.05, 0.05, 0.3, M(c, { e: c, ei: 0.3 }), -0.45 + i * 0.22, 0.06, 0, 10); });
      // microscopio
      const ms = group(bench, 1.1, top, 0);
      box(ms, 0.55, 0.1, 0.7, M('#1f2937'), 0, 0, 0);
      const armM = M('#f8fafc', { r: 0.4 });
      box(ms, 0.14, 0.9, 0.14, armM, 0, 0.1, -0.25);
      const tube = cyl(ms, 0.09, 0.07, 0.7, M('#1f2937', { m: 0.5 }), 0, 0.7, -0.05, 14);
      tube.rotation.x = 0.35;
      box(ms, 0.4, 0.05, 0.35, M('#334155'), 0, 0.4, 0.05);
      // ADN
      const dna = prop(1.4, 1.2, 0, 0.6);
      const ca = M('#14b8a6', { e: '#0d9488', ei: 0.4 }), cb = M('#f472b6', { e: '#db2777', ei: 0.4 }), link = M('#e2e8f0');
      for (let i = 0; i < 18; i++) {
        const a = i * 0.55, y = i * 0.2;
        const x1 = Math.cos(a) * 0.55, z1 = Math.sin(a) * 0.55;
        sph(dna, 0.11, ca, x1, y, z1, 12);
        sph(dna, 0.11, cb, -x1, y, -z1, 12);
        const l = mesh(new T.CylinderGeometry(0.025, 0.025, 1.1, 6), link, dna);
        l.position.set(0, y, 0); l.rotation.z = Math.PI / 2; l.rotation.y = -a;
      }
      spin(dna, 0.6, 'y');
      // pizarra con fórmulas
      wallArt('left', 0.6, 3.5, 2.6, 1.4, MT(text(['C₆H₁₂O₆ + 6O₂', '→ 6CO₂ + 6H₂O', 'H₀: μ₁ = μ₂'], { bg: '#ffffff', fg: '#0f766e', font: 'bold 40px Arial' })), '#94a3b8');
      // banco
      for (const x of [-1.6, 2.2]) {
        const st = prop(x, -2.6);
        cyl(st, 0.3, 0.3, 0.08, M('#0d9488'), 0, 0.85, 0, 18);
        cyl(st, 0.04, 0.04, 0.85, M('#475569', { m: 0.6 }), 0, 0, 0, 8);
      }
      plant(root, -3.9, 3.8, 1.1, '#0d9488');
      dust('#ccfbf1', 60);
    },
  };

  (ROOMS[id] || ROOMS.biblioteca)();

  return {
    root,
    props,
    ticks,
    light,
    dispose: () => {
      root.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: any) => m.dispose());
      });
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
