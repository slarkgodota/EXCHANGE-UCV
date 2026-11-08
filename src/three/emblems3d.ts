/**
 * Inicio: "de universitario a profesional". Un birrete de graduación se transforma en el emblema
 * de cada carrera, hechos con materiales realistas (oro, acero, vidrio, cerámica) en un estudio de luz.
 */
import { makeKit, Built } from './kit';
import type { CareerType } from '../types/exchange';

export interface EmblemInfo {
  id: string;
  career?: CareerType;
  kicker: string;
  title: string;
  phrase: string;
  accent: string;
}

export const EMBLEMS: EmblemInfo[] = [
  { id: 'birrete', kicker: 'Universitarios UCV', title: 'De las aulas a tu profesión', phrase: 'Comparte, aprende y colabora con tu carrera', accent: '#c8102e' },
  { id: 'derecho', career: 'Derecho', kicker: 'Derecho', title: 'Abogados', phrase: 'Defienden la justicia y los derechos', accent: '#d4a24c' },
  { id: 'civil', career: 'Ingeniería Civil', kicker: 'Ingeniería Civil', title: 'Ingenieros civiles', phrase: 'Construyen el Perú', accent: '#f5b301' },
  { id: 'sistemas', career: 'Ingeniería de Sistemas', kicker: 'Ingeniería de Sistemas', title: 'Ingenieros de sistemas', phrase: 'Programan el futuro', accent: '#22d3ee' },
  { id: 'industrial', career: 'Ingeniería Industrial', kicker: 'Ingeniería Industrial', title: 'Ingenieros industriales', phrase: 'Optimizan cada proceso', accent: '#f97316' },
  { id: 'arquitectura', career: 'Arquitectura', kicker: 'Arquitectura', title: 'Arquitectos', phrase: 'Diseñan los espacios de la ciudad', accent: '#93c5fd' },
  { id: 'medicina', career: 'Medicina Humana', kicker: 'Medicina Humana', title: 'Médicos', phrase: 'Cuidan la vida', accent: '#f43f5e' },
  { id: 'enfermeria', career: 'Enfermería', kicker: 'Enfermería', title: 'Enfermeros', phrase: 'Acompañan a cada paciente', accent: '#60a5fa' },
  { id: 'psicologia', career: 'Psicología', kicker: 'Psicología', title: 'Psicólogos', phrase: 'Escuchan, comprenden y orientan', accent: '#a78bfa' },
  { id: 'administracion', career: 'Administración', kicker: 'Administración', title: 'Administradores', phrase: 'Lideran empresas que crecen', accent: '#3b82f6' },
  { id: 'contabilidad', career: 'Contabilidad', kicker: 'Contabilidad', title: 'Contadores', phrase: 'Ordenan las finanzas', accent: '#eab308' },
  { id: 'comunicacion', career: 'Ciencias de la Comunicación', kicker: 'Ciencias de la Comunicación', title: 'Comunicadores', phrase: 'Cuentan las historias del país', accent: '#fb7185' },
  { id: 'educacion', career: 'Educación', kicker: 'Educación', title: 'Docentes', phrase: 'Enseñan con pasión', accent: '#fbbf24' },
];

export interface EmblemControl {
  jump: (i: number) => void;
}

export function buildEmblems(T: any, opts: { shadows: boolean; onChange?: (i: number) => void; control?: EmblemControl }): Built {
  const k = makeKit(T, { shadows: false, seed: 'emblems' });
  const { root, ticks, canvasTex } = k;
  const own: any[] = [];
  const P = (o: any) => { const m = new T.MeshPhysicalMaterial(o); own.push(m); return m; };
  const GOLD = P({ color: '#e7b660', metalness: 1, roughness: 0.18, clearcoat: 0.4, clearcoatRoughness: 0.15, envMapIntensity: 1.4 });
  const STEEL = P({ color: '#e2e6ec', metalness: 1, roughness: 0.32, envMapIntensity: 1.8 });
  const DARK = P({ color: '#2a2f3a', metalness: 0.85, roughness: 0.3 });
  const SATIN = P({ color: '#15161a', roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 });
  const CERAMIC = P({ color: '#f8fafc', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 });
  const glass = (tint: string, att: string, dist = 1.2) => P({ color: tint, transmission: 1, roughness: 0.05, thickness: 0.9, ior: 1.45, attenuationColor: att, attenuationDistance: dist, clearcoat: 1, clearcoatRoughness: 0.04 });
  const glow = (c: string, i = 2.2) => P({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 });

  const M = (geo: any, mat: any, parent: any) => { const m = new T.Mesh(geo, mat); parent.add(m); return m; };
  const ext = (shape: any, depth: number, bevel = 0.04, segs = 5) => {
    const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: segs, curveSegments: 32 });
    g.center();
    return g;
  };
  const rrect = (w: number, h: number, r: number) => {
    const s = new T.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const lathe = (pts: [number, number][], seg = 64) => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), seg);
  const rod = (a: number[], b: number[], r: number, mat: any, parent: any) => {
    const A = new T.Vector3(...a), B = new T.Vector3(...b);
    const m = M(new T.CylinderGeometry(r, r, A.distanceTo(B), 10), mat, parent);
    m.position.copy(A.clone().add(B).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return m;
  };
  const heartShape = () => {
    const s = new T.Shape();
    s.moveTo(0, 0.5); s.bezierCurveTo(0, 1.0, -0.9, 1.1, -0.9, 0.4); s.bezierCurveTo(-0.9, -0.1, -0.3, -0.5, 0, -0.9);
    s.bezierCurveTo(0.3, -0.5, 0.9, -0.1, 0.9, 0.4); s.bezierCurveTo(0.9, 1.1, 0, 1.0, 0, 0.5);
    return s;
  };
  const gearShape = (r: number, teeth: number, hole: number) => {
    const s = new T.Shape();
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2, step = (Math.PI * 2) / teeth;
      const pts = [[a0, r], [a0 + step * 0.12, r * 1.16], [a0 + step * 0.42, r * 1.16], [a0 + step * 0.54, r], [a0 + step, r]];
      pts.forEach(([a, rr], j) => { const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i === 0 && j === 0 ? s.moveTo(x, y) : s.lineTo(x, y); });
    }
    const h = new T.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h);
    return s;
  };
  const tex = (w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => canvasTex(w, h, draw).t;

  /* ───────── emblemas ───────── */
  const E: Record<string, (g: any) => void> = {
    birrete: (g) => {
      const top = M(ext(rrect(2.3, 2.3, 0.06), 0.06, 0.02), SATIN, g);
      top.rotation.x = -Math.PI / 2; top.position.y = 0.42;
      M(lathe([[0, -0.32], [0.72, -0.32], [0.78, -0.08], [0.74, 0.38], [0, 0.38]]), SATIN, g);
      M(new T.SphereGeometry(0.09, 24, 16), GOLD, g).position.y = 0.5;
      const curve = new T.CatmullRomCurve3([new T.Vector3(0, 0.5, 0), new T.Vector3(0.8, 0.49, 0.8), new T.Vector3(1.12, 0.3, 1.12), new T.Vector3(1.15, -0.25, 1.15)]);
      M(new T.TubeGeometry(curve, 40, 0.022, 8), GOLD, g);
      const tas = M(new T.CylinderGeometry(0.03, 0.11, 0.42, 20), GOLD, g); tas.position.set(1.15, -0.45, 1.15);
      g.rotation.set(0.42, Math.PI / 4, 0);
      g.position.y = 0.05;
    },
    derecho: (g) => {
      M(lathe([[0, 0], [0.8, 0], [0.82, 0.08], [0.55, 0.16], [0.32, 0.3], [0.17, 0.42], [0, 0.42]]), GOLD, g).position.y = -1.3;
      M(new T.CylinderGeometry(0.055, 0.07, 2.25, 24), GOLD, g).position.y = -0.0;
      M(new T.SphereGeometry(0.13, 24, 16), GOLD, g).position.y = 1.2;
      const beam = new T.Group(); beam.position.y = 0.98; g.add(beam);
      const bar = M(new T.CapsuleGeometry(0.045, 2.05, 6, 16), GOLD, beam); bar.rotation.z = Math.PI / 2;
      M(new T.TorusGeometry(0.12, 0.035, 12, 32), GOLD, beam);
      const pans: any[] = [];
      for (const sx of [-1, 1]) {
        const hang = new T.Group(); hang.position.x = sx * 1.05; beam.add(hang);
        M(new T.SphereGeometry(0.06, 16, 12), GOLD, hang);
        for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; rod([0, 0, 0], [Math.cos(a) * 0.33, -0.9, Math.sin(a) * 0.33], 0.009, GOLD, hang); }
        M(lathe([[0, -0.08], [0.2, -0.07], [0.36, 0.0], [0.4, 0.06], [0.38, 0.065], [0.34, 0.01], [0.18, -0.04], [0, -0.05]]), GOLD, hang).position.y = -0.95;
        pans.push(hang);
      }
      ticks.push((t) => { const a = Math.sin(t * 0.9) * 0.12; beam.rotation.z = a; pans.forEach((p) => (p.rotation.z = -a)); });
    },
    civil: (g) => {
      const I = new T.Shape();
      const W = 0.9, H = 0.62, f = 0.1, w = 0.11;
      I.moveTo(-W / 2, -H / 2); I.lineTo(W / 2, -H / 2); I.lineTo(W / 2, -H / 2 + f); I.lineTo(w / 2, -H / 2 + f); I.lineTo(w / 2, H / 2 - f); I.lineTo(W / 2, H / 2 - f); I.lineTo(W / 2, H / 2); I.lineTo(-W / 2, H / 2); I.lineTo(-W / 2, H / 2 - f); I.lineTo(-w / 2, H / 2 - f); I.lineTo(-w / 2, -H / 2 + f); I.lineTo(-W / 2, -H / 2 + f); I.closePath();
      const beam = M(ext(I, 2.4, 0.015, 2), STEEL, g); beam.rotation.y = Math.PI / 2 - 0.55; beam.position.y = -0.98;
      const hat = new T.Group(); hat.position.set(0, -0.64, 0.05); g.add(hat);
      const yel = P({ color: '#f6b100', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
      // casco: cúpula alta + ala con visera adelante + cresta central
      M(lathe([[0, 1.08], [0.28, 1.05], [0.52, 0.95], [0.7, 0.76], [0.8, 0.5], [0.83, 0.22], [0.84, 0.08], [0, 0.08]]), yel, hat);
      const brim = M(new T.CylinderGeometry(0.98, 1.0, 0.05, 64), yel, hat); brim.scale.set(1, 1, 1.18); brim.position.set(0, 0.08, 0.14);
      const ridge = M(new T.TorusGeometry(0.66, 0.06, 12, 48, Math.PI * 0.9), yel, hat); ridge.rotation.y = Math.PI / 2; ridge.rotation.z = Math.PI * 0.05; ridge.position.y = 0.32;
      M(new T.TorusGeometry(0.8, 0.03, 10, 64), P({ color: '#1f2937', roughness: 0.5 }), hat).rotation.x = Math.PI / 2;
      g.rotation.set(0.22, 0.25, 0);
    },
    sistemas: (g) => {
      const body = M(ext(rrect(2.0, 2.0, 0.16), 0.2, 0.05), P({ color: '#0b1220', roughness: 0.25, metalness: 0.5, clearcoat: 1 }), g);
      void body;
      for (let s = 0; s < 4; s++) for (let i = 0; i < 7; i++) {
        const p = M(new T.BoxGeometry(0.09, 0.32, 0.06), GOLD, g);
        const o = -0.75 + i * 0.25;
        if (s === 0) p.position.set(o, 1.15, 0); else if (s === 1) p.position.set(o, -1.15, 0);
        else { p.rotation.z = Math.PI / 2; p.position.set(s === 2 ? 1.15 : -1.15, o, 0); }
      }
      const circuit = tex(512, 512, (c, w, h) => {
        c.fillStyle = '#020617'; c.fillRect(0, 0, w, h); c.strokeStyle = '#22d3ee'; c.lineWidth = 6; c.lineCap = 'round';
        const lines = [[40, 100, 200, 100, 240, 140], [40, 200, 160, 200], [40, 300, 180, 300, 220, 260], [40, 410, 210, 410], [472, 110, 320, 110], [472, 220, 340, 220, 300, 250], [472, 330, 320, 330], [472, 420, 300, 420, 270, 390], [150, 40, 150, 160], [360, 40, 360, 170], [250, 472, 250, 340], [140, 472, 140, 360]];
        lines.forEach((L) => { c.beginPath(); c.moveTo(L[0], L[1]); for (let i = 2; i < L.length; i += 2) c.lineTo(L[i], L[i + 1]); c.stroke(); c.fillStyle = '#67e8f9'; c.beginPath(); c.arc(L[0], L[1], 9, 0, 7); c.fill(); });
        c.fillStyle = '#0e7490'; c.fillRect(186, 186, 140, 140); c.strokeRect(186, 186, 140, 140);
      });
      const top = P({ map: circuit, emissive: '#ffffff', emissiveMap: circuit, emissiveIntensity: 1.2, roughness: 0.3, clearcoat: 1 });
      const face = M(new T.PlaneGeometry(1.55, 1.55), top, g); face.position.z = 0.152;
      const die = M(ext(rrect(0.5, 0.5, 0.05), 0.06, 0.02), glass('#a5f3fc', '#22d3ee', 0.5), g); die.position.z = 0.2;
      ticks.push((t) => (top.emissiveIntensity = 1.0 + Math.sin(t * 2.6) * 0.45));
      g.rotation.set(-0.25, 0.35, 0);
    },
    industrial: (g) => {
      const g1 = M(ext(gearShape(0.82, 14, 0.24), 0.26, 0.03, 3), STEEL, g); g1.position.set(-0.42, 0.32, 0);
      const g2 = M(ext(gearShape(0.52, 9, 0.16), 0.26, 0.03, 3), GOLD, g); g2.position.set(0.86, -0.5, 0.05);
      const h1 = M(new T.CylinderGeometry(0.2, 0.2, 0.4, 32), DARK, g); h1.rotation.x = Math.PI / 2; h1.position.copy(g1.position);
      const h2 = M(new T.CylinderGeometry(0.13, 0.13, 0.4, 32), DARK, g); h2.rotation.x = Math.PI / 2; h2.position.copy(g2.position);
      ticks.push((_t, dt) => { g1.rotation.z += dt * 0.5; g2.rotation.z -= dt * 0.5 * (14 / 9); });
      g.rotation.set(-0.15, 0.4, 0);
    },
    arquitectura: (g) => {
      const plinth = M(ext(rrect(1.7, 1.7, 0.12), 0.12, 0.03), CERAMIC, g); plinth.rotation.x = -Math.PI / 2; plinth.position.y = -1.3;
      M(new T.CylinderGeometry(0.16, 0.16, 2.45, 24), CERAMIC, g).position.y = -0.05;
      const gl = glass('#dbeafe', '#93c5fd', 2.0);
      const slabs: any[] = [];
      for (let i = 0; i < 12; i++) {
        const s = M(ext(rrect(1.05, 1.05, 0.14), 0.05, 0.015, 2), gl, g);
        s.rotation.x = -Math.PI / 2; s.position.y = -1.1 + i * 0.205;
        slabs.push(s);
      }
      ticks.push((t) => slabs.forEach((s, i) => (s.rotation.z = i * (0.07 + Math.sin(t * 0.5) * 0.02))));
      g.rotation.x = 0.12;
    },
    medicina: (g) => {
      const h = M(ext(heartShape(), 0.45, 0.14, 8), glass('#ffd1dc', '#e11d48', 0.55), g);
      const inner = M(ext(heartShape(), 0.2, 0.06, 4), glow('#f43f5e', 2.4), g); inner.scale.setScalar(0.42);
      const pts: any[] = [];
      for (let i = 0; i <= 160; i++) {
        const a = (i / 160) * Math.PI * 2; const q = ((a / (Math.PI * 2)) * 3) % 1;
        const y = q > 0.4 && q < 0.44 ? -0.12 : q >= 0.44 && q < 0.48 ? 0.42 : q >= 0.48 && q < 0.52 ? -0.18 : 0;
        pts.push(new T.Vector3(Math.cos(a) * 1.35, y, Math.sin(a) * 1.35));
      }
      const ring = M(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 320, 0.018, 6, true), glow('#fb7185', 2.6), g);
      ring.rotation.x = 0.35;
      ticks.push((t, dt) => { const q = (t * 1.15) % 1; const s = 1 + (q < 0.1 ? Math.sin((q / 0.1) * Math.PI) * 0.07 : q > 0.18 && q < 0.28 ? Math.sin(((q - 0.18) / 0.1) * Math.PI) * 0.04 : 0); h.scale.setScalar(s); inner.scale.setScalar(0.42 * s); ring.rotation.y += dt * 0.6; });
    },
    enfermeria: (g) => {
      const v = M(ext(rrect(0.66, 2.1, 0.2), 0.42, 0.08, 6), CERAMIC, g);
      const hz = M(ext(rrect(2.1, 0.66, 0.2), 0.42, 0.08, 6), CERAMIC, g);
      void v; void hz;
      const inset = glow('#3b82f6', 1.6);
      const iv = M(ext(rrect(0.2, 1.5, 0.08), 0.05, 0.01, 2), inset, g); iv.position.z = 0.26;
      const ih = M(ext(rrect(1.5, 0.2, 0.08), 0.05, 0.01, 2), inset, g); ih.position.z = 0.26;
      const ring = M(new T.TorusGeometry(1.45, 0.05, 24, 120), glass('#dbeafe', '#60a5fa', 1.5), g);
      ticks.push((t, dt) => { ring.rotation.x = 1.1 + Math.sin(t * 0.6) * 0.2; ring.rotation.y += dt * 0.5; inset.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.5; });
      g.rotation.set(-0.12, 0.3, 0);
    },
    psicologia: (g) => {
      const mat = P({ color: '#e4dcff', metalness: 1, roughness: 0.2, clearcoat: 0.6, envMapIntensity: 2.2, emissive: '#5b21b6', emissiveIntensity: 0.18 });
      const U = new T.Shape();
      U.moveTo(-0.86, 1.0); U.lineTo(-0.86, 0.2); U.absarc(0, 0.2, 0.86, Math.PI, Math.PI * 2, false); U.lineTo(0.86, 1.0); U.lineTo(0.68, 1.0); U.lineTo(0.68, 0.2); U.absarc(0, 0.2, 0.68, 0, Math.PI, true); U.lineTo(-0.68, 1.0); U.closePath();
      const parts = [U, rrect(0.2, 2.45, 0.04), rrect(0.75, 0.16, 0.05), rrect(0.36, 0.12, 0.04), rrect(0.36, 0.12, 0.04)];
      const pos = [[0, 0], [0, -0.07], [0, -1.27], [-0.77, 1.02], [0.77, 1.02]];
      parts.forEach((sh, i) => {
        const geo = new T.ExtrudeGeometry(sh, { depth: 0.28, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 4, curveSegments: 40 });
        geo.translate(0, 0, -0.14);
        const m = M(geo, mat, g);
        m.position.set(pos[i][0], pos[i][1], 0);
      });
      g.position.y = 0.08;
      const halo = M(new T.TorusGeometry(1.5, 0.012, 8, 120), glow('#c4b5fd', 2), g);
      ticks.push((t) => { halo.rotation.x = Math.PI / 2 + Math.sin(t * 0.7) * 0.3; halo.rotation.y = t * 0.3; });
    },
    administracion: (g) => {
      const base = M(ext(rrect(2.2, 1.0, 0.1), 0.12, 0.03), CERAMIC, g); base.rotation.x = -Math.PI / 2; base.position.y = -1.25;
      const gl = glass('#dbeafe', '#3b82f6', 0.9);
      const bars: any[] = [];
      [0.6, 1.0, 1.45, 1.95].forEach((hh, i) => {
        const geo = new T.ExtrudeGeometry(rrect(0.36, hh, 0.08), { depth: 0.36, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
        geo.translate(0, hh / 2, -0.18);
        const b = M(geo, gl, g); b.position.set(-0.75 + i * 0.5, -1.18, 0); bars.push(b);
      });
      const path = new T.CatmullRomCurve3([new T.Vector3(-1.0, -0.6, 0.35), new T.Vector3(-0.3, -0.2, 0.35), new T.Vector3(0.1, -0.35, 0.35), new T.Vector3(0.95, 0.75, 0.35)]);
      M(new T.TubeGeometry(path, 60, 0.045, 10), GOLD, g);
      const head = M(new T.ConeGeometry(0.13, 0.32, 24), GOLD, g); head.position.set(1.02, 0.85, 0.35); head.rotation.z = -0.65;
      ticks.push((t) => bars.forEach((b, i) => (b.scale.y = 0.92 + Math.sin(t * 1.2 + i * 0.7) * 0.08)));
      g.rotation.set(0.15, -0.35, 0);
    },
    contabilidad: (g) => {
      const coinGeo = lathe([[0, -0.07], [0.52, -0.07], [0.58, -0.04], [0.58, 0.04], [0.52, 0.07], [0.46, 0.07], [0.44, 0.05], [0, 0.05]]);
      for (let i = 0; i < 6; i++) { const c = M(coinGeo, GOLD, g); c.position.set(-0.75 + (i % 2) * 0.03, -1.15 + i * 0.145, (i % 3) * 0.02); c.rotation.y = i; }
      const bump = tex(256, 256, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 10; c.beginPath(); c.arc(w / 2, h / 2, 104, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.font = 'bold 120px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2); c.fillText('S/', 0, 6); });
      const faceM = P({ color: '#e7b660', metalness: 1, roughness: 0.22, bumpMap: bump, bumpScale: 3 });
      const big = M(new T.CylinderGeometry(0.85, 0.85, 0.14, 64), [GOLD, faceM, faceM], g);
      big.rotation.x = Math.PI / 2; big.position.set(0.45, 0.25, 0);
      ticks.push((t) => { big.rotation.z = Math.sin(t * 0.8) * 0.6; big.position.y = 0.25 + Math.sin(t * 1.3) * 0.06; });
    },
    comunicacion: (g) => {
      M(new T.CylinderGeometry(0.55, 0.62, 0.08, 48), DARK, g).position.y = -1.3;
      M(new T.CylinderGeometry(0.05, 0.05, 1.1, 16), STEEL, g).position.y = -0.72;
      const yoke = M(new T.TorusGeometry(0.58, 0.04, 12, 48, Math.PI), STEEL, g); yoke.rotation.z = Math.PI; yoke.position.y = 0.25;
      const body = M(new T.CylinderGeometry(0.3, 0.26, 0.75, 40), DARK, g); body.position.y = -0.1;
      M(new T.TorusGeometry(0.31, 0.03, 12, 48), GOLD, g).position.y = 0.28;
      const grill = new T.Group(); grill.position.y = 0.72; g.add(grill);
      M(new T.CapsuleGeometry(0.37, 0.5, 12, 32), P({ color: '#111318', roughness: 0.5, metalness: 0.4 }), grill);
      M(new T.CapsuleGeometry(0.4, 0.5, 14, 28), new T.MeshStandardMaterial({ color: '#d7dbe2', metalness: 1, roughness: 0.3, wireframe: true }), grill);
      const waves: any[] = [];
      for (let i = 0; i < 3; i++) { const wm = glow('#fb7185', 2.2); wm.transparent = true; wm.depthWrite = false; const w = M(new T.TorusGeometry(0.75, 0.012, 8, 96), wm, g); w.position.set(0, 0.72, -0.4); waves.push(w); }
      ticks.push((t) => waves.forEach((w, i) => { const q = (t * 0.45 + i / 3) % 1; w.scale.setScalar(0.7 + q * 1.4); w.material.opacity = 1 - q; }));
      g.rotation.x = 0.1;
    },
    educacion: (g) => {
      const cover = P({ color: '#7f1d1d', roughness: 0.55, clearcoat: 0.4 });
      const lines = tex(256, 512, (c, w, h) => { c.fillStyle = '#fbf7ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9c2b2'; for (let y = 60; y < h - 40; y += 22) c.fillRect(28, y, w - 56 - ((y * 7) % 60), 6); });
      const paper = P({ color: '#ffffff', map: lines, roughness: 0.75, side: T.DoubleSide });
      const page = (dir: number, lift: number) => {
        const geo = new T.PlaneGeometry(1.15, 1.55, 24, 1);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + 0.575; pos.setX(i, dir * x); pos.setZ(i, Math.sin((x / 1.15) * Math.PI * 0.9) * (0.22 + lift)); }
        geo.computeVertexNormals();
        const m = M(geo, paper, g); m.rotation.x = -Math.PI / 2; m.position.y = lift * 0.3;
        return m;
      };
      for (let i = 0; i < 4; i++) { page(-1, i * 0.03); page(1, i * 0.03); }
      const cv = M(ext(rrect(2.5, 1.7, 0.06), 0.05, 0.02), cover, g); cv.rotation.x = -Math.PI / 2; cv.position.y = -0.06;
      const rib = M(new T.BoxGeometry(0.06, 0.005, 1.1), GOLD, g); rib.position.set(0.12, 0.25, 0.55); rib.rotation.x = -0.4;
      const sparks: any[] = [];
      const sm = glow('#fde68a', 3);
      for (let i = 0; i < 14; i++) { const s = M(new T.SphereGeometry(0.035, 10, 8), sm, g); sparks.push({ s, x: (Math.random() - 0.5) * 1.6, z: (Math.random() - 0.5) * 0.9, ph: Math.random() }); }
      ticks.push((t) => sparks.forEach((o) => { const q = (t * 0.35 + o.ph) % 1; o.s.position.set(o.x * (1 - q * 0.4), 0.2 + q * 1.8, o.z); o.s.scale.setScalar(q > 0.85 ? (1 - q) * 6 : 1); }));
      g.rotation.set(0.55, -0.3, 0);
      g.position.y = -0.35;
    },
  };

  /* ───────── escenario: brillo, aro y polvo dorado ───────── */
  const glowTex = tex(256, 256, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const glowMat = new T.SpriteMaterial({ map: glowTex, color: '#c8102e', transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.55 });
  own.push(glowMat);
  const halo = new T.Sprite(glowMat); halo.scale.set(5.2, 5.2, 1); halo.position.z = -1.2; root.add(halo);
  const dustGeo = new T.BufferGeometry(); const N = 120; const dp = new Float32Array(N * 3); const ds: number[] = [];
  for (let i = 0; i < N; i++) { dp[i * 3] = (Math.random() - 0.5) * 7; dp[i * 3 + 1] = (Math.random() - 0.5) * 4.5; dp[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.8; ds.push(0.05 + Math.random() * 0.12); }
  dustGeo.setAttribute('position', new T.BufferAttribute(dp, 3));
  const dustMat = new T.PointsMaterial({ color: '#fcd34d', size: 0.035, transparent: true, opacity: 0.75, depthWrite: false, blending: T.AdditiveBlending });
  own.push(dustMat);
  root.add(new T.Points(dustGeo, dustMat));
  ticks.push((_t, dt) => { const a = dustGeo.attributes.position.array as Float32Array; for (let i = 0; i < N; i++) { a[i * 3 + 1] += ds[i] * dt; if (a[i * 3 + 1] > 2.3) a[i * 3 + 1] = -2.3; } dustGeo.attributes.position.needsUpdate = true; });
  // luces de contorno con el color de la carrera
  const rimL = new T.PointLight('#ffffff', 18, 12, 2); rimL.position.set(-3, 1.5, -2); root.add(rimL);
  const rimR = new T.PointLight('#ffffff', 12, 12, 2); rimR.position.set(3, -1, -1.5); root.add(rimR);
  const key = new T.SpotLight('#ffffff', 40, 20, 0.55, 0.6, 1.5); key.position.set(2.5, 4.5, 5); root.add(key); root.add(key.target);

  // destello de partículas en cada cambio
  const burstGeo = new T.BufferGeometry(); const BN = 90; const bp = new Float32Array(BN * 3); const bv: number[][] = [];
  for (let i = 0; i < BN; i++) { const a = Math.random() * Math.PI * 2, e = (Math.random() - 0.5) * 1.2; bv.push([Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)]); }
  burstGeo.setAttribute('position', new T.BufferAttribute(bp, 3));
  const burstMat = new T.PointsMaterial({ color: '#fde68a', size: 0.06, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
  own.push(burstMat);
  root.add(new T.Points(burstGeo, burstMat));

  const stage = new T.Group(); root.add(stage);
  const groups = EMBLEMS.map((e) => {
    const holder = new T.Group();
    const inner = new T.Group();
    holder.add(inner);
    (E[e.id] || E.birrete)(inner);
    holder.visible = false;
    stage.add(holder);
    return holder;
  });

  const SLOT = 3.9, IN = 0.8, OUT = 0.55;
  let base = 0; // tiempo de inicio de la secuencia (para saltar)
  let shown = -1;
  let tNow = 0;
  const accent = new T.Color();
  if (opts.control) opts.control.jump = (i: number) => { base = tNow - i * SLOT; };
  const easeOutBack = (q: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(q - 1, 3) + c1 * Math.pow(q - 1, 2); };

  ticks.push((t) => {
    tNow = t;
    const rel = Math.max(0, t - base);
    const idx = Math.floor(rel / SLOT) % EMBLEMS.length;
    const ph = rel % SLOT;
    if (idx !== shown) {
      if (shown >= 0) groups[shown].visible = false;
      shown = idx;
      groups[idx].visible = true;
      opts.onChange?.(idx);
    }
    const g = groups[idx];
    let s = 1, ry = 0;
    if (ph < IN) { const q = ph / IN; s = Math.max(0.001, easeOutBack(q)); ry = (1 - q) * -0.9; }
    else if (ph > SLOT - OUT) { const q = (ph - (SLOT - OUT)) / OUT; s = Math.max(0.001, 1 - q * q); ry = q * 0.9; }
    g.scale.setScalar(s);
    g.rotation.y = ry + Math.sin(t * 0.55) * 0.35;
    g.position.y = Math.sin(t * 1.1) * 0.06;
    // color del brillo y de las luces de contorno
    accent.set(EMBLEMS[idx].accent);
    glowMat.color.lerp(accent, 0.06);
    rimL.color.lerp(accent, 0.06);
    halo.material.opacity = 0.42 + Math.sin(t * 1.4) * 0.08;
    // destello al salir/entrar
    const bq = ph < 0.6 ? ph / 0.6 : -1;
    const arr = burstGeo.attributes.position.array as Float32Array;
    if (bq >= 0) {
      for (let i = 0; i < BN; i++) { const r = 0.4 + bq * 2.2; arr[i * 3] = bv[i][0] * r; arr[i * 3 + 1] = bv[i][1] * r; arr[i * 3 + 2] = bv[i][2] * r; }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = (1 - bq) * 0.9;
    } else burstMat.opacity = 0;
  });

  k.light.hemi = 0.35;
  k.light.sun = 1.4;
  const built = k.built();
  const baseDispose = built.dispose;
  built.dispose = () => { baseDispose(); own.forEach((m) => m.dispose()); };
  return built;
}
