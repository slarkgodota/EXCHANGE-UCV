/**
 * Desfile del Inicio: profesionales de la UCV (uno por carrera) caminan por el campus;
 * cuando cada uno llega al centro se voltea y saluda.
 */
import { makeKit, Built, Kit } from './kit';
import type { CareerType } from '../types/exchange';

type Acc = 'briefcase' | 'plans' | 'laptop' | 'wrench' | 'model' | 'clipboard' | 'notebook' | 'tablet' | 'calculator' | 'mic' | 'book' | 'none';

export interface Professional {
  career: CareerType;
  title: string; // "Abogada", "Ingeniero civil"…
  phrase: string;
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'bun' | 'curly';
  top: string;
  bottom: string;
  coat?: string; // bata o saco largo
  vest?: string; // chaleco de seguridad
  helmet?: string;
  tie?: string;
  nurseCap?: boolean;
  stethoscope?: boolean;
  glasses?: boolean;
  acc: Acc;
}

export const PROFESSIONALS: Professional[] = [
  { career: 'Derecho', title: 'Abogada', phrase: 'Defiende la justicia', skin: '#c68863', hair: '#1f1410', hairStyle: 'long', top: '#1f2937', bottom: '#1f2937', tie: '#7a2e2e', acc: 'briefcase' },
  { career: 'Ingeniería Civil', title: 'Ingeniero civil', phrase: 'Construye el Perú', skin: '#a8714f', hair: '#2b1d14', hairStyle: 'short', top: '#3b82f6', bottom: '#1e3a8a', vest: '#f97316', helmet: '#facc15', acc: 'plans' },
  { career: 'Ingeniería de Sistemas', title: 'Ingeniera de sistemas', phrase: 'Programa el futuro', skin: '#e0b48f', hair: '#3b2416', hairStyle: 'bun', top: '#4f46e5', bottom: '#111827', glasses: true, acc: 'laptop' },
  { career: 'Ingeniería Industrial', title: 'Ingeniero industrial', phrase: 'Mejora cada proceso', skin: '#8d5a3b', hair: '#111', hairStyle: 'short', top: '#1d4ed8', bottom: '#1d4ed8', helmet: '#f8fafc', acc: 'wrench' },
  { career: 'Arquitectura', title: 'Arquitecta', phrase: 'Diseña ciudades', skin: '#f1c9a5', hair: '#7c4a1e', hairStyle: 'bun', top: '#111827', bottom: '#d6c7a1', acc: 'model' },
  { career: 'Medicina Humana', title: 'Médico', phrase: 'Cuida la vida', skin: '#c68863', hair: '#1a1a1a', hairStyle: 'short', top: '#14b8a6', bottom: '#0f766e', coat: '#f8fafc', stethoscope: true, acc: 'clipboard' },
  { career: 'Enfermería', title: 'Enfermera', phrase: 'Acompaña al paciente', skin: '#a8714f', hair: '#1f1410', hairStyle: 'curly', top: '#7dd3fc', bottom: '#7dd3fc', nurseCap: true, acc: 'clipboard' },
  { career: 'Psicología', title: 'Psicólogo', phrase: 'Escucha y orienta', skin: '#e0b48f', hair: '#5b3a1e', hairStyle: 'curly', top: '#7c3aed', bottom: '#374151', glasses: true, acc: 'notebook' },
  { career: 'Administración', title: 'Administradora', phrase: 'Lidera empresas', skin: '#8d5a3b', hair: '#0f0a08', hairStyle: 'long', top: '#1e3a8a', bottom: '#1e3a8a', acc: 'tablet' },
  { career: 'Contabilidad', title: 'Contador', phrase: 'Ordena las finanzas', skin: '#f1c9a5', hair: '#2b1d14', hairStyle: 'short', top: '#475569', bottom: '#334155', tie: '#15803d', acc: 'calculator' },
  { career: 'Ciencias de la Comunicación', title: 'Comunicadora', phrase: 'Cuenta historias', skin: '#c68863', hair: '#7c2d12', hairStyle: 'long', top: '#be123c', bottom: '#111827', acc: 'mic' },
  { career: 'Educación', title: 'Docente', phrase: 'Enseña con pasión', skin: '#a8714f', hair: '#3b2416', hairStyle: 'short', top: '#d97706', bottom: '#57534e', glasses: true, acc: 'book' },
];

interface Rig {
  g: any; body: any; legL: any; legR: any; armL: any; armR: any; head: any;
}

function person(k: Kit, p: Professional): Rig {
  const { T, M, box, sph, cyl, group, mesh } = k;
  const g = group(k.root, 0, 0, 0);
  const body = group(g, 0, 0, 0);
  const skin = M(p.skin, { r: 0.7 });
  const shoe = M('#1f2937');
  const legM = M(p.bottom);
  const mkLeg = (x: number) => {
    const leg = group(body, x, 0.92, 0);
    box(leg, 0.22, 0.86, 0.24, legM, 0, -0.86, 0);
    box(leg, 0.24, 0.12, 0.34, shoe, 0, -0.92, 0.04);
    return leg;
  };
  const legL = mkLeg(-0.14), legR = mkLeg(0.14);
  // torso
  box(body, 0.62, 0.74, 0.34, M(p.top), 0, 0.9, 0);
  if (p.coat) box(body, 0.68, 1.12, 0.4, M(p.coat), 0, 0.52, -0.01);
  if (p.coat) box(body, 0.2, 0.7, 0.02, M(p.top), 0, 0.92, 0.21);
  if (p.vest) {
    box(body, 0.66, 0.6, 0.38, M(p.vest), 0, 1.0, 0);
    for (const y of [1.15, 1.35]) box(body, 0.67, 0.05, 0.39, M('#fde047', { e: '#fde047', ei: 0.3 }), 0, y, 0);
  }
  if (p.tie) box(body, 0.08, 0.42, 0.02, M(p.tie), 0, 1.18, 0.18);
  // brazos
  const mkArm = (x: number) => {
    const arm = group(body, x, 1.58, 0);
    box(arm, 0.17, 0.62, 0.19, M(p.coat ?? p.top), 0, -0.62, 0);
    sph(arm, 0.1, skin, 0, -0.68, 0, 10);
    return arm;
  };
  const armL = mkArm(-0.4), armR = mkArm(0.4);
  // cabeza
  const head = group(body, 0, 1.64, 0);
  cyl(head, 0.09, 0.09, 0.1, skin, 0, 0, 0, 10);
  sph(head, 0.27, skin, 0, 0.33, 0, 20);
  const eye = M('#111827');
  for (const sx of [-0.09, 0.09]) sph(head, 0.035, eye, sx, 0.36, 0.25, 8);
  const smile = mesh(new T.TorusGeometry(0.07, 0.015, 6, 12, Math.PI), M('#7f1d1d'), head);
  smile.position.set(0, 0.25, 0.25); smile.rotation.z = Math.PI;
  if (p.glasses) for (const sx of [-0.09, 0.09]) { const r = mesh(new T.TorusGeometry(0.06, 0.012, 6, 16), M('#111827'), head); r.position.set(sx, 0.36, 0.265); }
  const hairM = M(p.hair, { r: 0.9 });
  if (!p.helmet) {
    const cap = mesh(new T.SphereGeometry(0.29, 18, 10, 0, Math.PI * 2, 0, Math.PI / 1.9), hairM, head);
    cap.position.set(0, 0.36, -0.02);
    if (p.hairStyle === 'long') box(head, 0.5, 0.55, 0.16, hairM, 0, 0.0, -0.2);
    if (p.hairStyle === 'bun') sph(head, 0.13, hairM, 0, 0.62, -0.16, 12);
    if (p.hairStyle === 'curly') for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; sph(head, 0.1, hairM, Math.cos(a) * 0.22, 0.52 + Math.sin(i) * 0.04, Math.sin(a) * 0.22 - 0.03, 8); }
  } else {
    const hm = M(p.helmet, { r: 0.4 });
    const h = mesh(new T.SphereGeometry(0.31, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), hm, head); h.position.y = 0.4;
    cyl(head, 0.38, 0.38, 0.04, hm, 0, 0.4, 0.04, 20);
  }
  if (p.nurseCap) {
    box(head, 0.32, 0.12, 0.2, M('#ffffff'), 0, 0.6, 0.02);
    box(head, 0.08, 0.03, 0.01, M('#dc2626'), 0, 0.665, 0.125); box(head, 0.03, 0.08, 0.01, M('#dc2626'), 0, 0.64, 0.125);
  }
  if (p.stethoscope) {
    const st = mesh(new T.TorusGeometry(0.2, 0.025, 6, 20, Math.PI), M('#111827'), body);
    st.position.set(0, 1.5, 0.19); st.rotation.z = Math.PI;
    sph(body, 0.05, M('#cbd5e1', { m: 0.8 }), 0.12, 1.2, 0.21, 8);
  }
  // accesorio en la mano derecha
  const hand = group(armR, 0, -0.72, 0.05);
  const A: Record<Acc, () => void> = {
    briefcase: () => { box(hand, 0.42, 0.3, 0.12, M('#7c2d12'), 0, -0.36, 0); box(hand, 0.14, 0.06, 0.04, M('#451a03'), 0, -0.08, 0); },
    plans: () => { const r = mesh(new T.CylinderGeometry(0.06, 0.06, 0.7, 10), M('#bfdbfe'), hand); r.rotation.x = Math.PI / 2; r.position.set(0, -0.02, 0.15); },
    laptop: () => { box(hand, 0.5, 0.04, 0.36, M('#9ca3af', { m: 0.7 }), 0, -0.05, 0.12); box(hand, 0.5, 0.32, 0.03, M('#1e293b', { e: '#4f46e5', ei: 0.4 }), 0, -0.02, -0.06); },
    wrench: () => { box(hand, 0.06, 0.45, 0.04, M('#9ca3af', { m: 0.8, r: 0.3 }), 0, -0.45, 0); const t = mesh(new T.TorusGeometry(0.07, 0.025, 6, 12, Math.PI * 1.5), M('#9ca3af', { m: 0.8, r: 0.3 }), hand); t.position.set(0, -0.5, 0); },
    model: () => { box(hand, 0.4, 0.04, 0.3, M('#a3b18a'), 0, 0.0, 0.15); box(hand, 0.1, 0.3, 0.1, M('#fafaf9'), -0.1, 0.04, 0.15); box(hand, 0.1, 0.18, 0.1, M('#fafaf9'), 0.08, 0.04, 0.12); },
    clipboard: () => { box(hand, 0.3, 0.4, 0.03, M('#92400e'), 0, -0.25, 0.08); box(hand, 0.24, 0.3, 0.01, M('#ffffff'), 0, -0.22, 0.1); },
    notebook: () => { box(hand, 0.28, 0.36, 0.04, M('#7c3aed'), 0, -0.24, 0.08); },
    tablet: () => { box(hand, 0.32, 0.44, 0.03, M('#111827'), 0, -0.26, 0.08); box(hand, 0.28, 0.38, 0.01, M('#38bdf8', { e: '#38bdf8', ei: 0.6 }), 0, -0.23, 0.1); },
    calculator: () => { box(hand, 0.22, 0.32, 0.05, M('#1f2937'), 0, -0.2, 0.08); box(hand, 0.18, 0.07, 0.01, M('#a3e635', { e: '#a3e635', ei: 0.5 }), 0, -0.08, 0.11); },
    mic: () => { cyl(hand, 0.03, 0.03, 0.3, M('#111'), 0, -0.05, 0.08, 8); sph(hand, 0.08, M('#4b5563', { m: 0.5 }), 0, 0.3, 0.08, 10); box(hand, 0.12, 0.08, 0.1, M('#be123c'), 0, 0.12, 0.08); },
    book: () => { box(hand, 0.34, 0.42, 0.08, M('#15803d'), 0, -0.26, 0.08); box(hand, 0.3, 0.38, 0.09, M('#fefce8'), 0.02, -0.24, 0.08); },
    none: () => {},
  };
  A[p.acc]();
  return { g, body, legL, legR, armL, armR, head };
}

/** Campus de fondo: edificio de la universidad, letrero UCV, árboles, faroles y banderines. */
function campus(k: Kit) {
  const { M, MT, box, group, building, text, plane, tree, lampPost, cloud, mesh, T, canvasTex } = k;
  // piso de la plaza
  const tiles = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#e7e5e4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d6d3d1'; c.lineWidth = 3; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }).t;
  tiles.wrapS = tiles.wrapT = T.RepeatWrapping; tiles.repeat.set(8, 1.5);
  const ground = mesh(new T.BoxGeometry(44, 0.2, 7), [M('#a8a29e'), M('#a8a29e'), MT(tiles), M('#a8a29e'), M('#a8a29e'), M('#a8a29e')]);
  ground.position.set(0, -0.1, 0.5);
  box(k.root, 44, 0.12, 4, M('#86b96b'), 0, -0.06, -4.5);
  // edificio principal
  const bd = group(k.root, 0, 0, -5.4);
  building(bd, 0, 0, 13, 3.6, 2.4, '#f5f5f4', '#bfdbfe', '#a8a29e');
  box(bd, 13.1, 0.35, 2.5, M('#c8102e'), 0, 3.6, 0);
  building(bd, -9.5, 0.6, 5, 2.6, 2.2, '#e7e5e4', '#bfdbfe');
  building(bd, 9.5, 0.6, 5, 2.6, 2.2, '#e7e5e4', '#bfdbfe');
  const sign = group(bd, 0, 3.95, 1.0);
  box(sign, 4.2, 1.0, 0.2, M('#ffffff'), 0, 0, 0);
  plane(sign, 4.0, 0.9, MT(text(['UNIVERSIDAD CÉSAR VALLEJO'], { bg: '#ffffff', fg: '#c8102e', font: 'bold 54px Arial', w: 1024, h: 230 })), 0, 0.5, 0.11);
  // puerta en arco
  box(bd, 2.2, 2.2, 0.1, M('#7c2d12'), 0, 0, 1.22);
  // banderines rojos
  for (const x of [-7.5, -4.5, 4.5, 7.5]) {
    const f = group(k.root, x, 0, -2.6);
    k.cyl(f, 0.04, 0.04, 3.2, M('#94a3b8', { m: 0.6 }), 0, 0, 0, 8);
    const flag = box(f, 0.7, 1.2, 0.03, M('#c8102e', { side: true }), 0.37, 1.8, 0);
    const ph = x;
    k.ticks.push((t) => (flag.rotation.y = Math.sin(t * 2 + ph) * 0.25));
  }
  for (const x of [-12, -6, 6, 12]) tree(k.root, x, -3.2, 1.1);
  for (const x of [-10, -2.6, 2.6, 10]) lampPost(k.root, x, -2.2);
  cloud(-8, 6.5, -8, 1.3); cloud(6, 7.2, -9, 1.6); cloud(14, 6.4, -8, 1.1); cloud(-15, 7.0, -9, 1.2);
}

export function buildParade(T: any, opts: { shadows: boolean; onFocus?: (i: number, visible: boolean) => void }): Built {
  const k = makeKit(T, { shadows: opts.shadows, seed: 'parade' });
  campus(k);
  const SP = 2.4;
  const N = PROFESSIONALS.length;
  const W = N * SP;
  const rigs = PROFESSIONALS.map((p) => person(k, p));
  const WALK = 1.5, PAUSE = 2.8, CYCLE = WALK + PAUSE;
  let lastFocus = -1, lastVis = false;
  const ease = (q: number) => (q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2);

  k.ticks.push((t) => {
    const step = Math.floor(t / CYCLE);
    const ph = t - step * CYCLE;
    const walking = ph < WALK;
    const q = walking ? ease(ph / WALK) : 1;
    const offset = step + q; // cuántos lugares avanzó la fila
    let focus = -1;
    rigs.forEach((r, i) => {
      let x = ((i - offset) * SP) % W;
      if (x < -W / 2) x += W;
      if (x > W / 2) x -= W;
      r.g.position.x = x;
      const center = Math.abs(x) < SP / 2;
      if (center && !walking) focus = i;
      // caminar
      const sw = walking ? Math.sin((ph / WALK) * Math.PI * 4) : 0;
      r.legL.rotation.x = sw * 0.55;
      r.legR.rotation.x = -sw * 0.55;
      r.armR.rotation.x = walking ? sw * 0.45 : 0;
      r.body.position.y = walking ? Math.abs(sw) * 0.06 : 0;
      // mirar hacia donde camina (izquierda) o hacia la cámara en la pausa
      const pq = walking ? 0 : Math.min(1, (ph - WALK) / 0.35) * (ph > CYCLE - 0.35 ? (CYCLE - ph) / 0.35 : 1);
      const face = -Math.PI / 2;
      r.g.rotation.y = face + (0 - face) * (center ? pq : pq * 0.55);
      // saludo del que está al centro
      if (center && !walking) {
        const wq = Math.min(1, (ph - WALK) / 0.3);
        r.armL.rotation.z = -2.5 * wq;
        r.armL.rotation.x = 0;
        r.armL.rotation.y = Math.sin(t * 9) * 0.35 * wq;
        r.head.rotation.z = Math.sin(t * 3) * 0.08;
      } else {
        r.armL.rotation.z = 0;
        r.armL.rotation.y = 0;
        r.armL.rotation.x = walking ? -sw * 0.45 : 0;
        r.head.rotation.z = 0;
      }
    });
    const vis = focus >= 0;
    if (opts.onFocus && (focus !== lastFocus || vis !== lastVis)) {
      if (vis) lastFocus = focus;
      lastVis = vis;
      opts.onFocus(vis ? focus : lastFocus, vis);
    }
  });
  k.light.sunColor = '#fff4e0';
  return k.built();
}
