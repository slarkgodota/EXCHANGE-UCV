/**
 * Kit de piezas 3D (three.js) para las escenas de las carreras y el desfile del Inicio.
 * Todo se arma con figuras simples (cajas, cilindros, esferas) para que cargue rápido.
 */

export type Tick = (t: number, dt: number) => void;

export interface SceneLight {
  sky?: string;
  ground?: string;
  hemi?: number;
  sun?: number;
  sunColor?: string;
}

export interface Built {
  root: any;
  props: any[]; // grupos que aparecen uno por uno en la intro
  ticks: Tick[];
  light: SceneLight;
  dispose: () => void;
}

export function seeded(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

type MO = { r?: number; m?: number; e?: string; ei?: number; op?: number; flat?: boolean; side?: boolean };

export function makeKit(T: any, opts: { shadows: boolean; seed: string }) {
  const root = new T.Group();
  const ticks: Tick[] = [];
  const props: any[] = [];
  const textures: any[] = [];
  const mats = new Map<string, any>();
  const light: SceneLight = {};
  const rnd = seeded(opts.seed);

  const shade = (hex: string, l: number) => {
    const c = new T.Color(hex);
    c.offsetHSL(0, 0, l);
    return '#' + c.getHexString();
  };
  const M = (color: string, o: MO = {}) => {
    const key = color + JSON.stringify(o);
    if (mats.has(key)) return mats.get(key);
    const m = new T.MeshStandardMaterial({ color, roughness: o.r ?? 0.8, metalness: o.m ?? 0.02, flatShading: o.flat ?? false });
    if (o.e) {
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
  /** Material con textura dibujada (letreros, pantallas, ventanas). */
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
  /** Caja apoyada en y (su base queda en y). */
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
  const cone = (p: any, r: number, h: number, mat: any, x = 0, y = 0, z = 0, seg = 16) => {
    const m = mesh(new T.ConeGeometry(r, h, seg), mat, p);
    m.position.set(x, y + h / 2, z);
    return m;
  };
  const group = (p: any = root, x = 0, y = 0, z = 0, ry = 0) => {
    const g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    p.add(g);
    return g;
  };
  /** Objeto principal de la escena: aparece con animación en la intro. */
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
  const text = (lines: string[], o: { bg?: string; fg?: string; font?: string; w?: number; h?: number } = {}) =>
    canvasTex(o.w ?? 512, o.h ?? 256, (c, w, h) => {
      c.fillStyle = o.bg ?? '#ffffff';
      c.fillRect(0, 0, w, h);
      c.fillStyle = o.fg ?? '#111827';
      c.font = o.font ?? 'bold 54px Arial, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const lh = h / (lines.length + 1);
      lines.forEach((l, i) => c.fillText(l, w / 2, lh * (i + 1)));
    }).t;
  const spin = (o: any, speed = 0.5, axis: 'x' | 'y' | 'z' = 'y') => ticks.push((_t, dt) => (o.rotation[axis] += speed * dt));
  const bob = (o: any, amp = 0.15, speed = 1.2, phase = 0) => {
    const y0 = o.position.y;
    ticks.push((t) => (o.position.y = y0 + Math.sin(t * speed + phase) * amp));
  };

  /* ───────── piezas de exterior ───────── */
  const tree = (p: any, x: number, z: number, s = 1, kind: 'round' | 'pine' = 'round') => {
    const g = group(p, x, 0, z);
    g.scale.setScalar(s);
    cyl(g, 0.12, 0.16, 0.9, M('#7c4a1e'), 0, 0, 0, 8);
    if (kind === 'pine') {
      cone(g, 0.75, 1.2, M('#2f6b3a', { flat: true }), 0, 0.7, 0, 8);
      cone(g, 0.55, 1.0, M('#357a42', { flat: true }), 0, 1.4, 0, 8);
    } else {
      const lm = M(['#3f8f3a', '#4d9c45', '#3a7d3a'][Math.floor(rnd() * 3)], { flat: true });
      const a = mesh(new T.IcosahedronGeometry(0.75, 0), lm, g);
      a.position.y = 1.55;
      const b = mesh(new T.IcosahedronGeometry(0.5, 0), lm, g);
      b.position.set(0.35, 1.25, 0.2);
    }
    const ph = rnd() * 6;
    ticks.push((t) => (g.rotation.z = Math.sin(t * 1.1 + ph) * 0.025));
    return g;
  };
  const cloud = (x: number, y: number, z: number, s = 1) => {
    const g = group(root, x, y, z);
    g.scale.setScalar(s);
    const cm = M('#ffffff', { r: 1, e: '#ffffff', ei: 0.15 });
    for (let i = 0; i < 4; i++) {
      const c = mesh(new T.IcosahedronGeometry(0.5 + rnd() * 0.3, 1), cm, g);
      c.position.set(i * 0.55 - 0.8, rnd() * 0.25, rnd() * 0.3);
      c.castShadow = false;
    }
    const sp = 0.15 + rnd() * 0.15;
    ticks.push((t) => (g.position.x = x + Math.sin(t * sp) * 1.2));
    return g;
  };
  const lampPost = (p: any, x: number, z: number, glow = '#ffe2a8') => {
    const g = group(p, x, 0, z);
    cyl(g, 0.06, 0.08, 2.2, M('#334155', { m: 0.5 }), 0, 0, 0, 8);
    sph(g, 0.16, M(glow, { e: glow, ei: 1.6 }), 0, 2.3, 0, 10);
    return g;
  };
  const bench = (p: any, x: number, z: number, ry = 0) => {
    const g = group(p, x, 0, z, ry);
    box(g, 1.2, 0.08, 0.4, M('#92400e'), 0, 0.45, 0);
    box(g, 1.2, 0.35, 0.06, M('#92400e'), 0, 0.55, -0.18);
    for (const sx of [-0.5, 0.5]) box(g, 0.06, 0.45, 0.35, M('#334155'), sx, 0, 0);
    return g;
  };
  /** Textura de fachada con ventanas. */
  const windowsTex = (wall: string, glass: string, cols: number, rows: number, lit = 0.3) =>
    canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = wall;
      c.fillRect(0, 0, w, h);
      const cw = w / cols, rh = h / rows;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
          c.fillStyle = rnd() < lit ? '#fde68a' : glass;
          c.fillRect(i * cw + cw * 0.18, j * rh + rh * 0.2, cw * 0.64, rh * 0.58);
        }
    }).t;
  /** Edificio con ventanas en sus caras visibles. */
  const building = (p: any, x: number, z: number, w: number, h: number, d: number, wall: string, glass = '#93c5fd', roof?: string) => {
    const g = group(p, x, 0, z);
    const tex = windowsTex(wall, glass, Math.max(2, Math.round(w * 2)), Math.max(2, Math.round(h * 1.6)));
    const side = MT(tex);
    const top = M(roof ?? shade(wall, -0.12));
    const b = mesh(new T.BoxGeometry(w, h, d), [side, side, top, top, side, side], g);
    b.position.y = h / 2;
    return g;
  };
  const dust = (color: string, n = 50, area = 9, height = 5) => {
    const geo = new T.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const speed: number[] = [];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * area;
      pos[i * 3 + 1] = rnd() * height;
      pos[i * 3 + 2] = (rnd() - 0.5) * area;
      speed.push(0.08 + rnd() * 0.2);
    }
    geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    const pts = new T.Points(geo, new T.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 0.6, depthWrite: false }));
    root.add(pts);
    ticks.push((_t, dt) => {
      const a = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < n; i++) {
        a[i * 3 + 1] += speed[i] * dt;
        if (a[i * 3 + 1] > height) a[i * 3 + 1] = 0;
      }
      geo.attributes.position.needsUpdate = true;
    });
  };

  const dispose = () => {
    root.traverse((o: any) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: any) => m.dispose());
    });
    mats.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return {
    T, root, ticks, props, light, rnd, shade, M, MT, mesh, box, cyl, sph, cone, group, prop, canvasTex, plane, text,
    spin, bob, tree, cloud, lampPost, bench, building, windowsTex, dust, dispose,
    built: (): Built => ({ root, props, ticks, light, dispose }),
  };
}

export type Kit = ReturnType<typeof makeKit>;
