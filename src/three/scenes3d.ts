/**
 * Escenas 3D al aire libre de cada carrera (Derecho: Palacio de Justicia, Ing. Civil: obra, Medicina: hospital…).
 * Cada escena está sobre una "isla" flotante con cielo, nubes, árboles y animaciones propias.
 */
import type { SceneId } from '../data/careerScenes';
import { makeKit, Kit, Built } from './kit';

type Island = 'grass' | 'plaza' | 'concrete' | 'sand' | 'tile' | 'dark';

function island(k: Kit, kind: Island, color: string) {
  const { T, M, MT, mesh, canvasTex, shade, rnd } = k;
  const tex = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = color;
    c.fillRect(0, 0, w, h);
    if (kind === 'grass') {
      for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(0,${60 + rnd() * 60},0,${rnd() * 0.12})`; c.fillRect(rnd() * w, rnd() * h, 3, 5); }
    } else if (kind === 'plaza' || kind === 'tile' || kind === 'dark') {
      c.strokeStyle = shade(color, kind === 'dark' ? 0.08 : -0.1); c.lineWidth = 3;
      const s = kind === 'tile' ? 48 : 64;
      for (let i = 0; i <= w; i += s) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
    } else {
      for (let i = 0; i < 1000; i++) { c.fillStyle = `rgba(0,0,0,${rnd() * 0.08})`; c.fillRect(rnd() * w, rnd() * h, 3, 3); }
    }
  }).t;
  const side = M(kind === 'grass' ? '#4d7c0f' : shade(color, -0.2));
  const top = MT(tex);
  const slab = mesh(new T.CylinderGeometry(6.2, 6.0, 0.45, 48), [side, top, side]);
  slab.position.y = -0.225;
  // parte de abajo de la isla (tierra y rocas)
  const earth = M('#7c5a3a', { flat: true });
  const under = mesh(new T.ConeGeometry(6.0, 2.6, 12), earth);
  under.rotation.x = Math.PI;
  under.position.y = -0.45 - 1.3;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rnd();
    const r = mesh(new T.DodecahedronGeometry(0.5 + rnd() * 0.4, 0), M('#8b6b4a', { flat: true }));
    r.position.set(Math.cos(a) * 4.2, -1.0 - rnd() * 0.8, Math.sin(a) * 4.2);
  }
}

/** Camino de piedra o asfalto. */
function path(k: Kit, w: number, d: number, color: string, x = 0, z = 0, ry = 0) {
  const p = k.box(k.root, w, 0.03, d, k.M(color), x, 0, z);
  p.rotation.y = ry;
  return p;
}

function columnsFacade(k: Kit, p: any, w: number, colH: number, n: number, stone: string, sign?: string, signColor = '#1f2937') {
  const { box, cyl, M, mesh, T, plane, MT, text } = k;
  const sm = M(stone);
  for (let i = 0; i < 3; i++) box(p, w + 1.2 - i * 0.35, 0.18, 2.2 - i * 0.3, sm, 0, i * 0.18, 0.3 - i * 0.12);
  const base = 0.54;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i / (n - 1)) * w;
    cyl(p, 0.17, 0.2, colH, M(stone, { flat: true }), x, base, 0.55, 14);
    box(p, 0.5, 0.12, 0.5, sm, x, base + colH, 0.55);
  }
  box(p, w + 0.7, 0.5, 1.0, sm, 0, base + colH + 0.12, 0.45);
  const tri = new T.Shape();
  tri.moveTo(-(w + 0.7) / 2, 0); tri.lineTo((w + 0.7) / 2, 0); tri.lineTo(0, 0.9); tri.closePath();
  const ped = mesh(new T.ExtrudeGeometry(tri, { depth: 1.0, bevelEnabled: false }), sm, p);
  ped.position.set(0, base + colH + 0.62, -0.05);
  box(p, w + 0.4, colH + 0.4, 1.6, M(k.shade(stone, -0.06)), 0, base, -0.9);
  if (sign) plane(p, w * 0.8, 0.32, MT(text([sign], { bg: stone, fg: signColor, font: 'bold 46px Georgia, serif', w: 768, h: 96 })), 0, base + colH + 0.37, 0.96);
}

export function buildScene(T: any, id: SceneId, opts: { shadows: boolean }): Built {
  const k = makeKit(T, { shadows: opts.shadows, seed: id });
  const { M, MT, mesh, box, cyl, sph, cone, group, prop, canvasTex, plane, text, spin, bob, tree, cloud, lampPost, bench, building, dust, ticks, rnd, light, root } = k;

  const SCENES: Record<SceneId, () => void> = {
    /* DERECHO: Palacio de Justicia con columnas, balanza gigante y martillo de juez */
    derecho: () => {
      island(k, 'plaza', '#ddd3c2');
      path(k, 2.2, 6, '#c9bca6', 0, 2.6);
      const pj = prop(0, -2.4);
      columnsFacade(k, pj, 5.2, 2.6, 6, '#f1ebe0', 'PALACIO DE JUSTICIA', '#7a2e2e');
      // balanza gigante en pedestal
      const sc = prop(-3.4, 1.4);
      box(sc, 1.1, 0.9, 1.1, M('#e7e0d2'), 0, 0, 0);
      const gold = M('#d4a017', { m: 0.85, r: 0.3 });
      cyl(sc, 0.06, 0.06, 2.0, gold, 0, 0.9, 0, 10);
      const beam = group(sc, 0, 2.9, 0);
      box(beam, 2.0, 0.08, 0.08, gold, 0, -0.04, 0);
      sph(beam, 0.12, gold, 0, 0.05, 0, 12);
      const pans: any[] = [];
      for (const sx of [-1, 1]) {
        const hang = group(beam, sx * 0.95, 0, 0);
        box(hang, 0.02, 0.8, 0.02, gold, 0, -0.8, 0);
        cyl(hang, 0.34, 0.24, 0.08, gold, 0, -0.88, 0);
        pans.push(hang);
      }
      ticks.push((t) => { const a = Math.sin(t * 1.0) * 0.16; beam.rotation.z = a; pans.forEach((p) => (p.rotation.z = -a)); });
      // martillo de juez gigante
      const gv = prop(3.3, 1.6, -0.5);
      cyl(gv, 0.55, 0.6, 0.25, M('#5a3418'), 0, 0, 0, 24);
      const gav = group(gv, -0.9, 0.5, 0);
      box(gav, 1.3, 0.12, 0.12, M('#6b3f1f'), 0.65, -0.06, 0);
      const head = mesh(new T.CylinderGeometry(0.22, 0.22, 0.75, 18), M('#7c4a1e'), gav);
      head.rotation.x = Math.PI / 2; head.position.set(1.35, 0, 0);
      ticks.push((t) => { const q = t % 2.4; gav.rotation.z = q < 0.15 ? 0.7 - (q / 0.15) * 0.75 : q < 0.35 ? -0.05 + ((q - 0.15) / 0.2) * 0.75 : 0.7; });
      // libro de leyes
      const bk = prop(2.4, 3.6, 0.4);
      box(bk, 1.0, 0.28, 0.75, M('#7a2e2e'), 0, 0, 0);
      box(bk, 0.94, 0.22, 0.7, M('#fef3c7'), 0.04, 0.03, 0);
      plane(bk, 0.6, 0.3, MT(text(['LEY'], { bg: '#7a2e2e', fg: '#fcd34d', font: 'bold 80px Georgia', w: 256, h: 128 })), 0, 0.29, 0, 0).rotation.x = -Math.PI / 2;
      for (const x of [-1.6, 1.6]) lampPost(root, x, 1.2);
      tree(root, -4.6, -1.0, 1.0, 'pine'); tree(root, 4.6, -1.2, 1.1, 'pine'); tree(root, -4.2, 3.4, 0.9); tree(root, 4.4, 3.6, 0.8);
      cloud(-3, 6.2, -3, 1.0); cloud(3.5, 5.6, -1.5, 0.8);
      dust('#fde68a', 40);
      light.sunColor = '#ffe8c2';
    },

    /* ING. CIVIL: edificio que se construye piso por piso, grúa torre, mixer y conos */
    civil: () => {
      island(k, 'sand', '#c9a66b');
      path(k, 11, 1.4, '#4b5563', 0, 3.6);
      for (let x = -5; x < 5; x += 1.2) box(root, 0.6, 0.035, 0.08, M('#facc15'), x, 0, 3.6);
      // edificio en construcción
      const bd = prop(0.6, -1.6);
      const floors: any[] = [];
      for (let f = 0; f < 6; f++) {
        const g = group(bd, 0, f * 0.75, 0);
        box(g, 3.2, 0.12, 2.4, M('#9ca3af'), 0, 0, 0);
        for (const x of [-1.45, -0.48, 0.48, 1.45]) for (const z of [-1.05, 1.05]) box(g, 0.14, 0.63, 0.14, M('#a8a29e'), x, 0.12, z);
        if (f < 3) box(g, 3.0, 0.5, 0.04, M('#93c5fd', { op: 0.6 }), 0, 0.15, 1.08);
        floors.push(g);
      }
      ticks.push((t) => { const q = (t % 10) / 8; floors.forEach((g, i) => { const s = Math.min(1, Math.max(0.001, (q * floors.length - i) * 1.8)); g.scale.set(1, (t % 10) > 9.3 ? 0.001 : s, 1); g.visible = s > 0.01 && (t % 10) <= 9.3; }); });
      // grúa torre
      const cr = prop(-3.6, -2.6);
      const yel = M('#f2b705', { r: 0.6 });
      box(cr, 0.8, 0.3, 0.8, M('#6b7280'), 0, 0, 0);
      box(cr, 0.3, 6.0, 0.3, yel, 0, 0.3, 0);
      for (let y = 0.6; y < 6.2; y += 0.5) box(cr, 0.34, 0.05, 0.34, M('#c99400'), 0, y, 0);
      const jib = group(cr, 0, 6.3, 0);
      box(jib, 5.2, 0.2, 0.22, yel, 1.9, 0, 0);
      box(jib, 1.5, 0.2, 0.22, yel, -1.0, 0, 0);
      box(jib, 0.6, 0.5, 0.5, M('#374151'), -1.6, -0.25, 0);
      box(jib, 0.45, 0.45, 0.45, M('#e5e7eb'), 0.3, -0.5, 0.25);
      const trolley = group(jib, 3, 0, 0);
      const cable = box(trolley, 0.02, 1, 0.02, M('#111'), 0, -1, 0);
      const hook = group(trolley, 0, -2, 0);
      box(hook, 1.2, 0.12, 0.14, M('#c2410c'), 0, -0.12, 0);
      ticks.push((t) => { jib.rotation.y = Math.sin(t * 0.3) * 1.1 - 0.7; const L = 2 + Math.sin(t * 0.7) * 1.0; hook.position.y = -L; cable.scale.y = L; cable.position.y = -L; trolley.position.x = 2.6 + Math.sin(t * 0.45) * 1.0; });
      // camión mixer recorriendo la pista
      const mx = prop(0, 3.6);
      const truck = group(mx, 0, 0, 0);
      box(truck, 0.9, 0.8, 0.9, M('#dc2626'), 1.0, 0.25, 0);
      box(truck, 0.5, 0.35, 0.86, M('#bfdbfe', { op: 0.85 }), 1.2, 0.65, 0);
      box(truck, 2.2, 0.25, 0.9, M('#374151'), -0.3, 0.25, 0);
      for (const x of [-1.0, -0.1, 1.0]) for (const z of [-0.45, 0.45]) { const w = mesh(new T.CylinderGeometry(0.22, 0.22, 0.14, 14), M('#111827'), truck); w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z); }
      const drum = group(truck, -0.4, 1.0, 0);
      drum.rotation.z = Math.PI / 2 - 0.3;
      const dr = mesh(new T.CylinderGeometry(0.38, 0.55, 1.5, 12), M('#f59e0b', { flat: true }), drum);
      spin(dr, 2.5, 'y');
      ticks.push((t) => { const x = Math.sin(t * 0.35) * 3.4; truck.position.x = x; truck.rotation.y = Math.cos(t * 0.35) > 0 ? 0 : Math.PI; });
      // vigas, conos y casco
      const st = prop(3.6, 0.6, 0.4);
      for (let i = 0; i < 3; i++) { const g = group(st, 0, i * 0.3, 0); box(g, 2.4, 0.05, 0.3, M('#9ca3af', { m: 0.7, r: 0.4 }), 0, 0, 0); box(g, 2.4, 0.18, 0.05, M('#9ca3af', { m: 0.7, r: 0.4 }), 0, 0.05, 0); box(g, 2.4, 0.05, 0.3, M('#9ca3af', { m: 0.7, r: 0.4 }), 0, 0.23, 0); }
      for (const [x, z] of [[-1.8, 2.6], [1.6, 2.6], [4.6, 2.4], [-4.6, 2.2]]) { const c = prop(x, z); box(c, 0.5, 0.05, 0.5, M('#f97316'), 0, 0, 0); cone(c, 0.22, 0.75, M('#f97316'), 0, 0.05, 0); cyl(c, 0.11, 0.14, 0.12, M('#f8fafc'), 0, 0.38, 0); }
      const hat = prop(-1.6, 1.0, 0, 0);
      mesh(new T.SphereGeometry(0.4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#facc15', { r: 0.4 }), hat).position.y = 0.05;
      cyl(hat, 0.55, 0.55, 0.05, M('#facc15', { r: 0.4 }), 0, 0, 0, 24);
      cloud(2.5, 6.6, -3.5, 0.9);
      dust('#e7d3a8', 60);
      light.sunColor = '#fff1d6';
    },

    /* ING. DE SISTEMAS: centro de datos con servidores, pantalla de código, antena y red de datos */
    sistemas: () => {
      island(k, 'dark', '#1e2440');
      light.hemi = 0.8; light.sun = 1.0; light.sky = '#8ea2ff'; light.sunColor = '#c7d2fe';
      const dc = prop(0, -2.4);
      const b = building(dc, 0, 0, 4.4, 2.2, 2.2, '#1e293b', '#22d3ee');
      void b;
      box(dc, 4.5, 0.08, 2.3, M('#22d3ee', { e: '#22d3ee', ei: 2 }), 0, 2.2, 0);
      // pantalla gigante con código
      const code = ['function conectar(red) {', '  const nodos = red.map(n => n.id);', '  enviar(paquete, nodos);', '}', 'SELECT * FROM estudiantes;', 'git push origin main ✓', 'while (true) aprender();', 'const exp = pub * 25;'];
      const scr = canvasTex(512, 288, () => {});
      let sc = 0, acc = 0;
      const draw = () => scr.redraw((c, w, h) => { c.fillStyle = '#0b1020'; c.fillRect(0, 0, w, h); c.font = '22px monospace'; for (let i = 0; i < 10; i++) { c.fillStyle = ['#22d3ee', '#a5b4fc', '#86efac', '#fca5a5', '#e2e8f0'][(i + sc) % 5]; c.fillText(code[(i + sc) % code.length], 16, 30 + i * 26); } });
      draw();
      ticks.push((_t, dt) => { acc += dt; if (acc > 0.4) { acc = 0; sc++; draw(); } });
      const bb = prop(-3.4, 0.2, 0.7);
      cyl(bb, 0.08, 0.08, 1.4, M('#334155', { m: 0.6 }), 0, 0, 0, 8);
      box(bb, 2.4, 1.45, 0.12, M('#111827'), 0, 1.4, 0);
      plane(bb, 2.25, 1.3, MT(scr.t, { e: true }), 0, 2.125, 0.065);
      // racks de servidores al aire libre
      const leds: any[] = [];
      for (const x of [1.6, 2.6, 3.6]) {
        const rk = prop(x, 0.6, -0.3);
        box(rk, 0.8, 2.4, 0.8, M('#0f172a', { m: 0.5, r: 0.4 }), 0, 0, 0);
        for (let r = 0; r < 6; r++) for (let i = 0; i < 3; i++) leds.push(box(rk, 0.07, 0.07, 0.02, M(i === 2 ? '#38bdf8' : '#22c55e', { e: i === 2 ? '#38bdf8' : '#22c55e', ei: 2.5 }), -0.2 + i * 0.15, 0.3 + r * 0.35, 0.41));
      }
      ticks.push((t) => leds.forEach((l, i) => (l.visible = Math.sin(t * (3 + (i % 5)) + i * 1.7) > -0.3)));
      // antena con luz y antena parabólica
      const an = prop(-4.4, -2.6);
      for (let i = 0; i < 4; i++) { const l = box(an, 0.06, 4.6, 0.06, M('#94a3b8', { m: 0.6 }), (i % 2 ? 1 : -1) * 0.25, 0, (i < 2 ? 1 : -1) * 0.25); l.rotation.z = (i % 2 ? -1 : 1) * 0.05; }
      const beacon = sph(an, 0.12, M('#ef4444', { e: '#ef4444', ei: 3 }), 0, 4.7, 0, 10);
      ticks.push((t) => (beacon.visible = Math.sin(t * 4) > 0));
      const dish = prop(4.3, -2.6);
      cyl(dish, 0.1, 0.14, 0.9, M('#94a3b8', { m: 0.6 }), 0, 0, 0, 8);
      const dg = group(dish, 0, 1.0, 0);
      const d = mesh(new T.SphereGeometry(0.75, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3.2), M('#e2e8f0', { side: true, m: 0.4 }), dg);
      d.rotation.x = -Math.PI / 2.4;
      spin(dg, 0.5, 'y');
      // red de datos flotando con pulsos
      const net = prop(0, 0.8, 0, 3.6);
      const nodes: number[][] = [[-2.2, 0.2, 0.4], [-0.8, 0.8, -0.6], [0.6, 0.3, 0.8], [2.0, 0.9, -0.2], [0.2, 1.4, 0.1]];
      nodes.forEach(([x, y, z]) => sph(net, 0.14, M('#22d3ee', { e: '#22d3ee', ei: 1.5 }), x, y, z, 12));
      const links = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 3], [0, 2]];
      links.forEach(([a, b2]) => { const A = new T.Vector3(...nodes[a]), B = new T.Vector3(...nodes[b2]); const len = A.distanceTo(B); const l = mesh(new T.CylinderGeometry(0.015, 0.015, len, 6), M('#a5b4fc', { op: 0.6 }), net); l.position.copy(A.clone().add(B).multiplyScalar(0.5)); l.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize()); });
      const pulses = links.map(() => sph(net, 0.06, M('#f0abfc', { e: '#f0abfc', ei: 2 }), 0, 0, 0, 8));
      ticks.push((t) => pulses.forEach((p, i) => { const [a, b2] = links[i]; const q = (t * 0.6 + i * 0.27) % 1; p.position.set(nodes[a][0] + (nodes[b2][0] - nodes[a][0]) * q, nodes[a][1] + (nodes[b2][1] - nodes[a][1]) * q, nodes[a][2] + (nodes[b2][2] - nodes[a][2]) * q); }));
      bob(net, 0.15, 0.8);
      tree(root, -1.6, 3.6, 0.8, 'pine'); tree(root, 1.8, 4.0, 0.9, 'pine');
      dust('#67e8f9', 70);
    },

    /* ING. INDUSTRIAL: fábrica con chimeneas humeando, engranajes, cinta transportadora y montacargas */
    industrial: () => {
      island(k, 'concrete', '#9ca3af');
      path(k, 11, 1.2, '#4b5563', 0, 3.4);
      const fc = prop(-0.6, -2.4);
      box(fc, 5.0, 2.0, 2.4, M('#d6d3d1'), 0, 0, 0);
      for (let i = 0; i < 4; i++) { const tri = new T.Shape(); tri.moveTo(0, 0); tri.lineTo(1.25, 0); tri.lineTo(1.25, 0.7); tri.closePath(); const r = mesh(new T.ExtrudeGeometry(tri, { depth: 2.4, bevelEnabled: false }), M('#78716c'), fc); r.position.set(-2.5 + i * 1.25, 2.0, -1.2); }
      for (let i = 0; i < 4; i++) box(fc, 0.8, 0.9, 0.04, M('#93c5fd', { op: 0.75 }), -1.85 + i * 1.25, 0.6, 1.21);
      box(fc, 1.0, 1.3, 0.05, M('#f59e0b'), 2.0, 0, 1.22);
      // chimeneas con humo
      const smoke: any[] = [];
      for (const [x, z] of [[1.6, -3.4], [2.6, -3.0]]) {
        const ch = prop(x, z);
        cyl(ch, 0.28, 0.36, 3.8, M('#b91c1c'), 0, 0, 0, 14);
        cyl(ch, 0.3, 0.3, 0.25, M('#f8fafc'), 0, 3.0, 0, 14);
        for (let i = 0; i < 6; i++) { const s = sph(root, 0.3, M('#e5e7eb', { op: 0.7, r: 1 }), x, 4, z, 10); s.castShadow = false; smoke.push({ s, x, z, ph: i / 6 }); }
      }
      ticks.push((t) => smoke.forEach((o) => { const q = (t * 0.25 + o.ph) % 1; o.s.position.set(o.x + q * 0.8, 3.9 + q * 2.4, o.z); o.s.scale.setScalar(0.6 + q * 1.6); o.s.material.opacity = 0.65 * (1 - q); }));
      // engranajes en la fachada
      const gear = (r: number, teeth: number, color: string) => { const g = new T.Group(); const m = M(color, { m: 0.75, r: 0.35 }); const core = mesh(new T.CylinderGeometry(r, r, 0.2, 28), m, g); core.rotation.x = Math.PI / 2; for (let i = 0; i < teeth; i++) { const a = (i / teeth) * Math.PI * 2; const tt = mesh(new T.BoxGeometry(0.18, 0.2, 0.2), m, g); tt.position.set(Math.cos(a) * (r + 0.08), Math.sin(a) * (r + 0.08), 0); tt.rotation.z = a; } return g; };
      const g1 = gear(0.55, 12, '#6b7280'); g1.position.set(-1.4, 1.3, 1.3); fc.add(g1);
      const g2 = gear(0.38, 9, '#f59e0b'); g2.position.set(-0.55, 1.05, 1.3); fc.add(g2);
      ticks.push((_t, dt) => { g1.rotation.z += dt * 0.7; g2.rotation.z -= dt * 1.0; });
      // cinta transportadora
      const cv = prop(0.4, 1.0);
      box(cv, 5.0, 0.1, 0.8, M('#1f2937', { r: 0.9 }), 0, 0.7, 0);
      for (const x of [-2.2, 0, 2.2]) for (const z of [-0.32, 0.32]) box(cv, 0.08, 0.7, 0.08, M('#f59e0b'), x, 0, z);
      const boxes: any[] = [];
      for (let i = 0; i < 4; i++) boxes.push(box(cv, 0.45, 0.4, 0.45, M('#c08a4f'), 0, 0.8, 0));
      ticks.push((t) => boxes.forEach((b2, i) => (b2.position.x = ((t * 0.6 + i * 1.25) % 5) - 2.5)));
      // montacargas
      const fl = prop(0, 3.4);
      const fk = group(fl, 0, 0, 0);
      box(fk, 1.0, 0.6, 0.7, M('#f59e0b'), 0, 0.2, 0);
      box(fk, 0.5, 0.6, 0.6, M('#1f2937', { op: 0.5 }), -0.1, 0.8, 0);
      box(fk, 0.06, 1.5, 0.5, M('#374151'), 0.55, 0.15, 0);
      box(fk, 0.7, 0.05, 0.4, M('#374151'), 0.9, 0.3, 0);
      box(fk, 0.5, 0.4, 0.4, M('#c08a4f'), 0.85, 0.35, 0);
      for (const x of [-0.3, 0.35]) for (const z of [-0.36, 0.36]) { const w = mesh(new T.CylinderGeometry(0.17, 0.17, 0.12, 12), M('#111827'), fk); w.rotation.x = Math.PI / 2; w.position.set(x, 0.17, z); }
      ticks.push((t) => { fk.position.x = Math.sin(t * 0.4) * 3.6; fk.rotation.y = Math.cos(t * 0.4) > 0 ? 0 : Math.PI; });
      // tanques
      for (const [x, z] of [[-4.4, 0.2], [-4.2, 1.6]]) { const tk = prop(x, z); cyl(tk, 0.6, 0.6, 2.0, M('#e5e7eb', { m: 0.6, r: 0.35 }), 0, 0, 0, 20); sph(tk, 0.6, M('#e5e7eb', { m: 0.6, r: 0.35 }), 0, 2.0, 0, 16); }
      cloud(-2, 6.6, -3.6, 0.9);
      dust('#f5f5f4', 50);
    },

    /* ARQUITECTURA: ciudad moderna que se levanta, edificio en "boceto" y parque */
    arquitectura: () => {
      island(k, 'plaza', '#e7e5e4');
      path(k, 1.4, 11, '#d6d3d1', 0.3, 0, 0);
      const city = prop(0, -1.2);
      const blds: { g: any; h: number; ph: number }[] = [];
      const spots = [[-3.6, -2.6, 1.3, 1.1], [-2.0, -3.4, 1.0, 1.0], [-3.4, -0.4, 1.0, 1.4], [2.2, -3.2, 1.4, 1.2], [3.8, -1.8, 1.0, 1.0], [2.0, -1.0, 1.1, 1.1], [3.6, 0.6, 1.2, 1.0]];
      const walls = ['#f5f5f4', '#e7e5e4', '#cbd5e1', '#d6d3d1', '#fafaf9'];
      spots.forEach(([x, z, w, d], i) => { const h = 1.5 + rnd() * 3.2; const g = building(city, x, z, w, h, d, walls[i % walls.length], i % 2 ? '#7dd3fc' : '#a5b4fc'); blds.push({ g, h, ph: i * 0.35 }); });
      ticks.push((t) => blds.forEach((b2) => { const q = (t % 12) - b2.ph; const s = (t % 12) > 11.2 ? Math.max(0.02, 1 - ((t % 12) - 11.2) * 1.2) : Math.min(1, Math.max(0.02, q / 1.5)); b2.g.scale.y = s; }));
      // edificio en boceto (alambre) que gira
      const sk = prop(-0.2, -3.0, 0, 0);
      const wire = mesh(new T.BoxGeometry(1.4, 4.2, 1.4, 3, 6, 3), new T.MeshBasicMaterial({ color: '#0f172a', wireframe: true, transparent: true, opacity: 0.55 }), sk);
      wire.position.y = 2.1;
      spin(sk, 0.35, 'y');
      // compás gigante
      const cp = prop(-2.8, 2.6, 0.5);
      const leg1 = box(cp, 0.08, 1.8, 0.08, M('#9ca3af', { m: 0.8, r: 0.3 }), -0.3, 0, 0); leg1.rotation.z = -0.18;
      const leg2 = box(cp, 0.08, 1.8, 0.08, M('#9ca3af', { m: 0.8, r: 0.3 }), 0.3, 0, 0); leg2.rotation.z = 0.18;
      sph(cp, 0.12, M('#57534e', { m: 0.6 }), 0, 1.8, 0, 10);
      ticks.push((t) => (cp.rotation.y = 0.5 + Math.sin(t * 0.6) * 0.6));
      // plano en el piso
      plane(root, 2.2, 1.4, MT(canvasTex(512, 320, (c, w, h) => { c.fillStyle = '#1e4fa3'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 4; c.strokeRect(50, 50, 220, 170); c.strokeRect(290, 110, 160, 110); c.beginPath(); c.arc(370, 165, 34, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.font = 'bold 26px Arial'; c.fillText('PLANTA 1:100', 50, 280); }).t), 2.4, 0.02, 2.8).rotation.x = -Math.PI / 2;
      for (const [x, z] of [[-4.4, 3.2], [4.6, 3.0], [-1.4, 4.4], [1.8, 4.6]]) tree(root, x, z, 0.8);
      bench(root, 1.4, 1.8, -Math.PI / 2);
      cloud(-2.5, 6.4, -2.5, 0.9); cloud(3.5, 6.0, 0.5, 0.7);
      dust('#ffffff', 30);
    },

    /* MEDICINA: hospital con cruz roja, ambulancia recorriendo y corazón latiendo */
    medicina: () => {
      island(k, 'grass', '#7fb069');
      const road = path(k, 11, 1.3, '#4b5563', 0, 3.5); void road;
      const hp = prop(0, -2.2);
      building(hp, 0, 0, 5.2, 3.0, 2.4, '#f8fafc', '#93c5fd');
      box(hp, 1.6, 1.2, 0.6, M('#e2e8f0'), 0, 0, 1.45);
      box(hp, 1.8, 0.12, 0.9, M('#14b8a6'), 0, 1.2, 1.5);
      plane(hp, 2.6, 0.45, MT(text(['HOSPITAL'], { bg: '#14b8a6', fg: '#ffffff', font: 'bold 70px Arial', w: 512, h: 96 })), 0, 2.65, 1.21);
      // cruz en el techo
      const cr = group(hp, 0, 3.05, 0);
      const red = M('#dc2626', { e: '#dc2626', ei: 0.4 });
      box(cr, 1.0, 0.32, 0.18, red, 0, 0.5, 0); box(cr, 0.32, 1.0, 0.18, red, 0, 0.16, 0);
      spin(cr, 0.6, 'y');
      ticks.push((t) => (red.emissiveIntensity = 0.3 + Math.sin(t * 2.5) * 0.3));
      // ambulancia
      const am = prop(0, 3.5);
      const amb = group(am, 0, 0, 0);
      box(amb, 1.8, 0.9, 0.85, M('#ffffff'), -0.2, 0.25, 0);
      box(amb, 0.7, 0.65, 0.85, M('#ffffff'), 0.95, 0.25, 0);
      box(amb, 0.3, 0.35, 0.8, M('#bfdbfe', { op: 0.85 }), 1.15, 0.55, 0);
      box(amb, 1.82, 0.14, 0.87, M('#dc2626'), -0.2, 0.55, 0);
      const lr = box(amb, 0.18, 0.12, 0.3, M('#ef4444', { e: '#ef4444', ei: 3 }), 0.1, 1.15, -0.18);
      const lb = box(amb, 0.18, 0.12, 0.3, M('#3b82f6', { e: '#3b82f6', ei: 3 }), 0.1, 1.15, 0.18);
      for (const x of [-0.8, 0.85]) for (const z of [-0.43, 0.43]) { const w = mesh(new T.CylinderGeometry(0.2, 0.2, 0.14, 14), M('#111827'), amb); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, z); }
      ticks.push((t) => { amb.position.x = Math.sin(t * 0.45) * 3.4; amb.rotation.y = Math.cos(t * 0.45) > 0 ? 0 : Math.PI; const on = Math.sin(t * 10) > 0; lr.visible = on; lb.visible = !on; });
      // corazón flotante
      const hs = new T.Shape();
      hs.moveTo(0, 0.25); hs.bezierCurveTo(0, 0.5, -0.45, 0.55, -0.45, 0.2); hs.bezierCurveTo(-0.45, -0.05, -0.15, -0.25, 0, -0.45); hs.bezierCurveTo(0.15, -0.25, 0.45, -0.05, 0.45, 0.2); hs.bezierCurveTo(0.45, 0.55, 0, 0.5, 0, 0.25);
      const heartG = prop(-3.4, 1.0, 0, 3.0);
      const heart = mesh(new T.ExtrudeGeometry(hs, { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 4 }), M('#e11d48', { r: 0.35, e: '#7f1d1d', ei: 0.4 }), heartG);
      heart.position.z = -0.12;
      ticks.push((t) => { const q = (t * 1.2) % 1; const s = 1 + (q < 0.12 ? Math.sin((q / 0.12) * Math.PI) * 0.18 : q > 0.2 && q < 0.32 ? Math.sin(((q - 0.2) / 0.12) * Math.PI) * 0.1 : 0); heartG.scale.setScalar(1.7 * s); heartG.rotation.y = t * 0.6; });
      // letrero con electrocardiograma
      const ecg = canvasTex(512, 200, () => {});
      let et = 0, ea = 0;
      const beat = (x: number) => { const q = ((x % 1) + 1) % 1; if (q > 0.15 && q < 0.18) return -0.15; if (q >= 0.18 && q < 0.22) return 0.9; if (q >= 0.22 && q < 0.26) return -0.3; if (q > 0.4 && q < 0.55) return Math.sin(((q - 0.4) / 0.15) * Math.PI) * 0.2; return 0; };
      ticks.push((_t, dt) => { et += dt; ea += dt; if (ea < 0.05) return; ea = 0; ecg.redraw((c, w, h) => { c.fillStyle = '#04120f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#22c55e'; c.lineWidth = 5; c.beginPath(); for (let x = 0; x < w; x += 3) { const y = h * 0.6 - beat(et * 1.2 - (w - x) / 220) * 90; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }); });
      const sg = prop(3.6, 1.0, -0.6);
      cyl(sg, 0.06, 0.06, 1.3, M('#64748b', { m: 0.6 }), 0, 0, 0, 8);
      box(sg, 1.7, 0.75, 0.1, M('#0f172a'), 0, 1.3, 0);
      plane(sg, 1.6, 0.65, MT(ecg.t, { e: true }), 0, 1.675, 0.055);
      for (const [x, z] of [[-4.6, -1.0], [4.6, -1.2], [-4.4, 2.0], [4.0, 4.4]]) tree(root, x, z, 0.9);
      cloud(-2.5, 6.4, -3.5, 1.0); cloud(3, 6.0, -2, 0.7);
      dust('#ccfbf1', 30);
    },

    /* ENFERMERÍA: centro de salud con cruz azul, botiquín gigante, silla de ruedas y suero */
    enfermeria: () => {
      island(k, 'grass', '#86b96b');
      path(k, 1.6, 6, '#e5e7eb', 0, 2.8);
      const cs = prop(0, -2.2);
      building(cs, 0, 0, 4.4, 2.2, 2.2, '#eff6ff', '#bfdbfe');
      box(cs, 1.8, 0.1, 1.0, M('#2563eb'), 0, 1.3, 1.5);
      for (const x of [-0.8, 0.8]) box(cs, 0.08, 1.3, 0.08, M('#94a3b8'), x, 0, 1.9);
      plane(cs, 2.6, 0.42, MT(text(['CENTRO DE SALUD'], { bg: '#2563eb', fg: '#ffffff', font: 'bold 56px Arial', w: 640, h: 100 })), 0, 1.85, 1.11);
      const crs = group(cs, 1.9, 2.25, 0.6);
      cyl(crs, 0.5, 0.5, 0.1, M('#ffffff'), 0, 0, 0, 28).rotation.x = Math.PI / 2;
      const blue = M('#1d4ed8', { e: '#1d4ed8', ei: 0.3 });
      box(crs, 0.6, 0.2, 0.08, blue, 0, -0.1, 0.06); box(crs, 0.2, 0.6, 0.08, blue, 0, -0.3, 0.06);
      // botiquín gigante flotando
      const kit2 = prop(-3.2, 1.2, 0.4, 2.2);
      box(kit2, 1.4, 1.0, 0.6, M('#dc2626', { r: 0.5 }), 0, 0, 0);
      box(kit2, 0.5, 0.15, 0.2, M('#7f1d1d'), 0, 1.0, 0);
      box(kit2, 0.6, 0.18, 0.04, M('#ffffff'), 0, 0.41, 0.31); box(kit2, 0.18, 0.6, 0.04, M('#ffffff'), 0, 0.2, 0.31);
      bob(kit2, 0.2, 1.1);
      spin(kit2, 0.4, 'y');
      // suero
      const iv = prop(2.6, 0.8);
      cyl(iv, 0.3, 0.3, 0.05, M('#64748b', { m: 0.6 }), 0, 0, 0);
      cyl(iv, 0.03, 0.03, 2.6, M('#cbd5e1', { m: 0.8, r: 0.3 }), 0, 0.05, 0, 8);
      box(iv, 0.5, 0.03, 0.03, M('#cbd5e1', { m: 0.8 }), 0, 2.6, 0);
      box(iv, 0.3, 0.5, 0.12, M('#bae6fd', { op: 0.6 }), 0.18, 2.05, 0);
      const drop = sph(iv, 0.03, M('#38bdf8', { e: '#38bdf8', ei: 0.6 }), 0.18, 1.85, 0, 8);
      ticks.push((t) => { const q = (t * 1.4) % 1; drop.position.y = 1.85 - q * 0.2; drop.scale.setScalar(q < 0.85 ? 1 : 0.01); });
      // silla de ruedas paseando
      const wc = prop(0, 2.8);
      const ch = group(wc, 0, 0, 0);
      for (const sz of [-0.38, 0.38]) { const w = mesh(new T.TorusGeometry(0.38, 0.04, 8, 24), M('#475569', { m: 0.7 }), ch); w.position.set(0, 0.42, sz); w.rotation.y = Math.PI / 2; }
      box(ch, 0.7, 0.09, 0.7, M('#1e3a8a'), 0, 0.56, 0); box(ch, 0.09, 0.7, 0.7, M('#1e3a8a'), 0, 0.56, -0.32);
      ticks.push((t) => { ch.position.z = Math.sin(t * 0.5) * 1.8; ch.rotation.y = Math.cos(t * 0.5) > 0 ? Math.PI / 2 : -Math.PI / 2; });
      // corazón con anillos de pulso
      const hg = prop(3.6, -0.8, 0, 3.0);
      const pink = M('#f43f5e', { e: '#9f1239', ei: 0.3 });
      sph(hg, 0.32, pink, -0.18, 0, 0, 14); sph(hg, 0.32, pink, 0.18, 0, 0, 14);
      const tip = mesh(new T.ConeGeometry(0.45, 0.6, 16), pink, hg); tip.rotation.z = Math.PI; tip.position.y = -0.32;
      const rings: any[] = [];
      for (let i = 0; i < 2; i++) { const r = mesh(new T.TorusGeometry(0.6, 0.02, 6, 40), M('#fda4af', { op: 0.6 }), hg); rings.push(r); }
      ticks.push((t) => { hg.scale.setScalar(1 + Math.max(0, Math.sin(t * 6)) * 0.08); rings.forEach((r, i) => { const q = (t * 0.6 + i / 2) % 1; r.scale.setScalar(0.8 + q * 1.4); r.material.opacity = 0.6 * (1 - q); }); });
      bench(root, -2.2, 3.6, 0.3);
      for (const [x, z] of [[-4.6, -0.6], [4.6, 2.0], [-4.0, 3.6], [4.4, -2.6]]) tree(root, x, z, 0.9);
      cloud(-2.5, 6.2, -3, 0.9);
      dust('#dbeafe', 30);
    },

    /* PSICOLOGÍA: parque tranquilo con laguna, cerebro flotando, mariposas y piedras zen */
    psicologia: () => {
      island(k, 'grass', '#9ccc65');
      const pond = cyl(root, 2.0, 2.0, 0.04, M('#60a5fa', { r: 0.2, m: 0.1 }), 1.6, 0, 0.8, 40);
      pond.receiveShadow = true;
      const ripples: any[] = [];
      for (let i = 0; i < 3; i++) { const r = mesh(new T.TorusGeometry(0.5, 0.02, 6, 40), M('#dbeafe', { op: 0.7 }), root); r.rotation.x = Math.PI / 2; r.position.set(1.6, 0.06, 0.8); ripples.push(r); }
      ticks.push((t) => ripples.forEach((r, i) => { const q = (t * 0.3 + i / 3) % 1; r.scale.setScalar(0.4 + q * 3.2); r.material.opacity = 0.7 * (1 - q); }));
      // cerebro flotante con ondas
      const br = prop(-1.6, -0.6, 0, 3.4);
      const pinkM = M('#f9a8d4', { r: 0.5, e: '#be185d', ei: 0.15 });
      for (let i = 0; i < 48; i++) { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1); const r = 0.6; sph(br, 0.18 + rnd() * 0.08, pinkM, Math.sin(v) * Math.cos(u) * r * 1.25, Math.cos(v) * r * 0.8, Math.sin(v) * Math.sin(u) * r, 10); }
      const rings: any[] = [];
      for (let i = 0; i < 3; i++) { const r = mesh(new T.TorusGeometry(1.1, 0.015, 6, 48), M('#c4b5fd', { e: '#a78bfa', ei: 1, op: 0.6 }), br); r.rotation.x = Math.PI / 2; rings.push(r); }
      ticks.push((t) => { br.rotation.y = t * 0.4; br.position.y = 3.4 + Math.sin(t * 1.1) * 0.2; rings.forEach((r, i) => { const q = (t * 0.45 + i / 3) % 1; r.scale.setScalar(0.8 + q * 1.4); r.material.opacity = 0.6 * (1 - q); }); });
      // mariposas
      for (let i = 0; i < 3; i++) {
        const bf = group(root, 0, 2, 0);
        const wm = M(['#f472b6', '#a78bfa', '#fbbf24'][i], { side: true });
        const wl = mesh(new T.PlaneGeometry(0.3, 0.22), wm, bf), wr = mesh(new T.PlaneGeometry(0.3, 0.22), wm, bf);
        wl.position.x = -0.15; wr.position.x = 0.15;
        const ph = i * 2.1, r = 2.4 + i * 0.6;
        ticks.push((t) => { const a = t * 0.5 + ph; bf.position.set(Math.cos(a) * r, 1.6 + Math.sin(t * 1.3 + ph) * 0.5, Math.sin(a) * r); bf.rotation.y = -a; const f = Math.sin(t * 14 + ph) * 0.9; wl.rotation.y = f; wr.rotation.y = -f; });
      }
      // piedras zen, banca y flores
      const zen = prop(-3.6, 2.6);
      [0.5, 0.4, 0.3, 0.2].reduce((y, r) => { const s = sph(zen, r, M('#78716c', { flat: true }), 0, y + r * 0.7, 0, 10); s.scale.y = 0.55; return y + r * 1.1; }, 0);
      bench(root, 1.6, -2.6, 0.2);
      for (let i = 0; i < 18; i++) { const a = rnd() * Math.PI * 2, r = 3.6 + rnd() * 1.6; sph(root, 0.09, M(['#f472b6', '#fbbf24', '#a78bfa', '#ffffff'][i % 4]), Math.cos(a) * r, 0.12, Math.sin(a) * r, 8); }
      for (const [x, z] of [[-4.4, -1.8], [-2.8, -3.8], [4.2, -2.4], [4.6, 2.6], [-1.0, 4.4]]) tree(root, x, z, 1.0);
      cloud(2.5, 6.2, -3.5, 1.0); cloud(-3.5, 5.8, -2, 0.7);
      dust('#f5d0fe', 40);
    },

    /* ADMINISTRACIÓN: distrito empresarial con rascacielos, gráfico de barras gigante y globo terráqueo */
    administracion: () => {
      island(k, 'plaza', '#cbd5e1');
      const dt0 = prop(0, -2.8);
      building(dt0, -3.0, 0, 1.4, 5.2, 1.4, '#1e3a8a', '#93c5fd');
      building(dt0, -1.3, -0.3, 1.2, 4.0, 1.2, '#334155', '#bae6fd');
      building(dt0, 2.8, 0, 1.5, 4.6, 1.4, '#0f172a', '#7dd3fc');
      building(dt0, 1.1, -0.4, 1.0, 3.2, 1.0, '#475569', '#e0f2fe');
      // barras gigantes
      const ch = prop(-1.0, 1.0);
      const bars: any[] = [];
      const bc = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];
      for (let i = 0; i < 5; i++) bars.push(box(ch, 0.5, 1, 0.5, M(bc[i], { r: 0.5 }), -1.3 + i * 0.65, 0, 0));
      ticks.push((t) => bars.forEach((b2, i) => { const h = 0.4 + (i + 1) * 0.45 * (0.75 + Math.sin(t * 0.9 + i) * 0.25); b2.scale.y = h; b2.position.y = h / 2; }));
      const arrow = group(ch, 0, 3.4, 0.4);
      const ar = box(arrow, 3.0, 0.1, 0.1, M('#16a34a', { e: '#16a34a', ei: 0.6 }), 0, 0, 0); ar.rotation.z = 0.35;
      const head = cone(arrow, 0.22, 0.45, M('#16a34a', { e: '#16a34a', ei: 0.6 }), 1.42, 0.35, 0); head.rotation.z = -Math.PI / 2 + 0.35;
      bob(arrow, 0.12, 1.2);
      // globo terráqueo
      const gl = prop(3.0, 1.8);
      cyl(gl, 0.45, 0.55, 0.3, M('#334155'), 0, 0, 0);
      cyl(gl, 0.05, 0.05, 0.8, M('#c9a227', { m: 0.8 }), 0, 0.3, 0, 8);
      const globe = group(gl, 0, 1.75, 0); globe.rotation.z = 0.4;
      sph(globe, 0.7, M('#3b82f6', { r: 0.4 }), 0, 0, 0, 24);
      mesh(new T.SphereGeometry(0.71, 14, 9), new T.MeshStandardMaterial({ color: '#22c55e', wireframe: true }), globe);
      spin(globe, 0.6, 'y');
      // maletín
      const bc2 = prop(-3.6, 2.8, 0.5);
      box(bc2, 1.1, 0.75, 0.32, M('#7c2d12'), 0, 0, 0); box(bc2, 0.4, 0.14, 0.08, M('#451a03'), 0, 0.75, 0);
      for (const [x, z] of [[-4.6, 0.4], [4.6, -0.2], [0.6, 4.4]]) tree(root, x, z, 0.8);
      lampPost(root, 1.6, 3.4); lampPost(root, -1.8, 3.6);
      cloud(-2.5, 6.8, -3.5, 0.9);
      dust('#e0f2fe', 30);
    },

    /* CONTABILIDAD: banco con columnas, monedas que se apilan, calculadora y gráfico circular */
    contabilidad: () => {
      island(k, 'plaza', '#d9e3d5');
      const bk = prop(0, -2.4);
      columnsFacade(k, bk, 4.2, 2.0, 5, '#eef2ec', 'BANCO · FINANZAS', '#166534');
      // monedas
      const cs = prop(2.8, 1.4);
      const coin = M('#eab308', { m: 0.9, r: 0.25 });
      const stacks: any[][] = [];
      for (let s = 0; s < 3; s++) { const arr: any[] = []; for (let i = 0; i < 12; i++) arr.push(cyl(cs, 0.34, 0.34, 0.09, coin, s * 0.8 - 0.8, i * 0.095, (s % 2) * 0.4, 24)); stacks.push(arr); }
      ticks.push((t) => stacks.forEach((arr, s) => { const q = ((t * 0.5 + s * 0.4) % 4) / 3; arr.forEach((c, i) => (c.visible = i < Math.ceil(q * arr.length))); }));
      const flying = cyl(cs, 0.34, 0.34, 0.09, coin, 0, 2.6, 0, 24);
      ticks.push((t) => { flying.rotation.x = t * 4; flying.position.y = 2.6 + Math.sin(t * 1.5) * 0.3; });
      // calculadora gigante
      const calc = prop(-2.8, 1.6, 0.5);
      const body = group(calc, 0, 0, 0); body.rotation.x = -0.5;
      box(body, 1.4, 0.2, 1.8, M('#1f2937', { r: 0.5 }), 0, 0.3, 0);
      const disp = canvasTex(256, 64, () => {});
      let num = 0, nacc = 0;
      ticks.push((_t, dt) => { nacc += dt; if (nacc > 0.5) { nacc = 0; num = (num + 1234.5) % 99999; disp.redraw((c, w, h) => { c.fillStyle = '#a3e635'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a2e05'; c.font = 'bold 42px monospace'; c.textAlign = 'right'; c.fillText('S/ ' + num.toFixed(2), w - 10, 47); }); } });
      plane(body, 1.1, 0.3, MT(disp.t, { e: true }), 0, 0.505, -0.6).rotation.x = -Math.PI / 2;
      for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 4; c2++) box(body, 0.22, 0.08, 0.22, M(c2 === 3 ? '#f97316' : '#e5e7eb'), -0.42 + c2 * 0.28, 0.5, -0.15 + r * 0.28);
      // gráfico circular
      const pie = prop(0, 1.4, 0, 3.4);
      const pc = ['#16a34a', '#eab308', '#2563eb', '#dc2626']; const parts = [0.4, 0.25, 0.2, 0.15];
      let a0 = 0;
      parts.forEach((p, i) => { const g = mesh(new T.CylinderGeometry(0.9, 0.9, 0.3, 32, 1, false, a0, p * Math.PI * 2), M(pc[i], { r: 0.5 }), pie); const mid = a0 + p * Math.PI; if (i === 0) g.position.set(Math.sin(mid) * 0.12, 0, Math.cos(mid) * 0.12); a0 += p * Math.PI * 2; });
      pie.rotation.x = 0.5;
      ticks.push((t) => { pie.rotation.y = t * 0.5; pie.position.y = 3.4 + Math.sin(t) * 0.15; });
      // alcancía
      const pig = prop(1.0, 3.6, -0.4);
      const pm = M('#f9a8d4', { r: 0.5 });
      const pb = sph(pig, 0.55, pm, 0, 0.6, 0, 20); pb.scale.set(1.25, 1, 1);
      const sn = mesh(new T.CylinderGeometry(0.16, 0.16, 0.12, 16), M('#f472b6'), pig); sn.rotation.z = Math.PI / 2; sn.position.set(0.7, 0.6, 0);
      for (const sx of [-0.35, 0.35]) for (const sz of [-0.25, 0.25]) cyl(pig, 0.08, 0.08, 0.2, pm, sx, 0, sz, 10);
      box(pig, 0.3, 0.02, 0.05, M('#831843'), 0, 1.15, 0);
      for (const [x, z] of [[-4.6, -0.6], [4.6, -0.8], [-4.0, 3.6]]) tree(root, x, z, 0.85);
      cloud(2.5, 6.6, -3.5, 0.9);
      dust('#fef9c3', 30);
    },

    /* COMUNICACIÓN: torre de transmisión con ondas, unidad móvil, cámara gigante y pantalla EN VIVO */
    comunicacion: () => {
      island(k, 'concrete', '#a8a29e');
      light.sunColor = '#ffe4e6';
      // torre de antena con ondas
      const tw = prop(-3.2, -2.4);
      for (let i = 0; i < 4; i++) { const l = box(tw, 0.07, 5.6, 0.07, M('#dc2626'), (i % 2 ? 1 : -1) * 0.3, 0, (i < 2 ? 1 : -1) * 0.3); l.rotation.z = (i % 2 ? -1 : 1) * 0.05; }
      for (let y = 0.6; y < 5.6; y += 0.6) box(tw, 0.66, 0.05, 0.66, M(Math.round(y / 0.6) % 2 ? '#dc2626' : '#f8fafc'), 0, y, 0);
      const bl = sph(tw, 0.12, M('#ef4444', { e: '#ef4444', ei: 3 }), 0, 5.75, 0, 10);
      const waves: any[] = [];
      for (let i = 0; i < 3; i++) { const r = mesh(new T.TorusGeometry(0.5, 0.025, 6, 40), M('#fda4af', { e: '#fb7185', ei: 1, op: 0.6 }), tw); r.position.y = 5.75; r.rotation.x = Math.PI / 2; waves.push(r); }
      ticks.push((t) => { bl.visible = Math.sin(t * 4) > 0; waves.forEach((r, i) => { const q = (t * 0.5 + i / 3) % 1; r.scale.setScalar(0.5 + q * 4); r.material.opacity = 0.7 * (1 - q); }); });
      // pantalla EN VIVO
      const sc = prop(1.2, -3.0);
      cyl(sc, 0.08, 0.08, 1.6, M('#334155'), -1.3, 0, 0, 8); cyl(sc, 0.08, 0.08, 1.6, M('#334155'), 1.3, 0, 0, 8);
      box(sc, 3.0, 1.7, 0.15, M('#111827'), 0, 1.6, 0);
      const live = canvasTex(512, 288, () => {});
      let la = 0;
      ticks.push((t, dt) => { la += dt; if (la < 0.25) return; la = 0; live.redraw((c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#9f1239'); g.addColorStop(1, '#1e1b4b'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = Math.sin(t * 3) > 0 ? '#ef4444' : '#7f1d1d'; c.beginPath(); c.arc(50, 50, 16, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 40px Arial'; c.fillText('EN VIVO', 80, 64); c.font = 'bold 30px Arial'; c.fillText('Noticias UCV', 30, 200); c.fillRect(30, 220, ((t * 60) % 450), 8); }); });
      plane(sc, 2.85, 1.55, MT(live.t, { e: true }), 0, 2.45, 0.08);
      // cámara gigante en trípode
      const cam = prop(2.2, 1.6, -2.4);
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const l = box(cam, 0.06, 1.7, 0.06, M('#111'), Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3); l.rotation.z = Math.cos(a) * 0.2; l.rotation.x = -Math.sin(a) * 0.2; }
      const head = group(cam, 0, 1.7, 0);
      box(head, 0.6, 0.55, 1.0, M('#1f2937', { m: 0.4 }), 0, 0, 0);
      const lens = mesh(new T.CylinderGeometry(0.2, 0.26, 0.5, 18), M('#0f172a', { m: 0.6, r: 0.3 }), head); lens.rotation.x = Math.PI / 2; lens.position.set(0, 0.27, 0.7);
      sph(head, 0.06, M('#ef4444', { e: '#ef4444', ei: 3 }), 0.25, 0.5, 0.3, 8);
      ticks.push((t) => (head.rotation.y = Math.sin(t * 0.5) * 0.4));
      // unidad móvil
      const van = prop(-1.0, 2.8, 0.2);
      box(van, 2.2, 1.0, 1.0, M('#f8fafc'), 0, 0.25, 0);
      box(van, 2.22, 0.2, 1.02, M('#be123c'), 0, 0.7, 0);
      for (const x of [-0.7, 0.7]) for (const z of [-0.5, 0.5]) { const w = mesh(new T.CylinderGeometry(0.2, 0.2, 0.14, 14), M('#111827'), van); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, z); }
      const dg = group(van, 0.4, 1.3, 0);
      const dish = mesh(new T.SphereGeometry(0.45, 18, 8, 0, Math.PI * 2, 0, Math.PI / 3.2), M('#e2e8f0', { side: true, m: 0.4 }), dg); dish.rotation.x = -Math.PI / 2.6;
      spin(dg, 0.6, 'y');
      // micrófono
      const mic = prop(3.8, -0.6);
      cyl(mic, 0.3, 0.3, 0.05, M('#111'), 0, 0, 0);
      cyl(mic, 0.03, 0.03, 1.6, M('#9ca3af', { m: 0.8 }), 0, 0.05, 0, 8);
      sph(mic, 0.18, M('#374151', { m: 0.5, r: 0.5 }), 0, 1.8, 0, 14);
      cloud(2.5, 6.6, -3.6, 0.8);
      dust('#fda4af', 40);
    },

    /* EDUCACIÓN: colegio con torre de reloj, juegos, lápiz gigante, libros y cubos de letras */
    educacion: () => {
      island(k, 'grass', '#a3c96b');
      path(k, 1.6, 6, '#e7d3a8', 0, 2.8);
      const sc = prop(0, -2.4);
      building(sc, 0, 0, 5.0, 2.2, 2.2, '#fbbf24', '#fef3c7', '#b45309');
      box(sc, 1.3, 1.6, 1.3, M('#f59e0b'), 0, 2.2, 0);
      const roof = mesh(new T.ConeGeometry(1.05, 1.0, 4), M('#b91c1c', { flat: true }), sc); roof.position.set(0, 4.3, 0); roof.rotation.y = Math.PI / 4;
      const clk = group(sc, 0, 3.0, 0.66);
      cyl(clk, 0.45, 0.45, 0.06, M('#ffffff'), 0, -0.03, 0, 28).rotation.x = Math.PI / 2;
      const hh = group(clk, 0, 0, 0.05); box(hh, 0.05, 0.28, 0.02, M('#111'), 0, 0, 0);
      const mh = group(clk, 0, 0, 0.06); box(mh, 0.035, 0.38, 0.02, M('#dc2626'), 0, 0, 0);
      ticks.push((t) => { mh.rotation.z = -t * 1.2; hh.rotation.z = -t * 0.1; });
      plane(sc, 2.2, 0.4, MT(text(['COLEGIO'], { bg: '#b45309', fg: '#ffffff', font: 'bold 64px Arial', w: 512, h: 96 })), 0, 1.75, 1.11);
      // columpio
      const sw = prop(-3.4, 0.8, 0.4);
      for (const sx of [-0.9, 0.9]) { const l1 = box(sw, 0.08, 2.2, 0.08, M('#2563eb'), sx, 0, -0.4); l1.rotation.x = 0.2; const l2 = box(sw, 0.08, 2.2, 0.08, M('#2563eb'), sx, 0, 0.4); l2.rotation.x = -0.2; }
      box(sw, 2.0, 0.08, 0.08, M('#2563eb'), 0, 2.1, 0);
      const seat = group(sw, 0, 2.1, 0);
      box(seat, 0.02, 1.4, 0.02, M('#111'), -0.25, -1.4, 0); box(seat, 0.02, 1.4, 0.02, M('#111'), 0.25, -1.4, 0);
      box(seat, 0.6, 0.06, 0.3, M('#dc2626'), 0, -1.46, 0);
      ticks.push((t) => (seat.rotation.x = Math.sin(t * 1.6) * 0.6));
      // lápiz gigante
      const pen = prop(3.0, 0.8, 0, 0.4);
      const pg = group(pen, 0, 0, 0); pg.rotation.z = 0.5;
      cyl(pg, 0.2, 0.2, 2.2, M('#facc15', { flat: true }), 0, 0, 0, 6);
      cyl(pg, 0.2, 0.2, 0.25, M('#f9a8d4'), 0, 2.2, 0, 6);
      const tipc = mesh(new T.ConeGeometry(0.2, 0.45, 6), M('#e7c9a0'), pg); tipc.rotation.z = Math.PI; tipc.position.y = -0.22;
      bob(pen, 0.15, 1.1);
      // libros y manzana
      const bks = prop(1.8, 3.0, 0.3);
      ['#dc2626', '#2563eb', '#16a34a'].forEach((c, i) => box(bks, 1.0 - i * 0.08, 0.2, 0.7, M(c), 0, i * 0.2, 0));
      sph(bks, 0.2, M('#dc2626', { r: 0.4 }), 0, 0.8, 0, 16);
      cyl(bks, 0.02, 0.02, 0.15, M('#3f2a14'), 0, 0.98, 0, 6);
      // cubos de letras
      const blocks = prop(-1.8, 3.2);
      ['A', 'B', 'C'].forEach((L, i) => { const m = MT(text([L], { bg: ['#fde68a', '#bfdbfe', '#fecaca'][i], fg: '#1f2937', font: 'bold 150px Arial', w: 256, h: 256 })); const b2 = box(blocks, 0.6, 0.6, 0.6, m, i === 2 ? 0.3 : i * 0.66 - 0.33, i === 2 ? 0.6 : 0, 0); if (i === 2) ticks.push((t) => (b2.position.y = 0.6 + 0.3 + Math.abs(Math.sin(t * 2)) * 0.35)); });
      for (const [x, z] of [[-4.6, -1.2], [4.6, -1.0], [4.4, 3.2]]) tree(root, x, z, 0.9);
      cloud(-2.5, 6.6, -3.4, 0.9); cloud(3.4, 6.2, -1.4, 0.7);
      dust('#fff7ed', 30);
    },

    /* CONOCIMIENTOS (tutorías): plaza con mesa redonda bajo sombrilla, burbujas de conversación y foco de ideas */
    tutoria: () => {
      island(k, 'grass', '#93c47d');
      const pl = prop(0.4, 0.4);
      cyl(pl, 2.6, 2.6, 0.04, M('#e5e7eb'), 0, 0, 0, 40);
      cyl(pl, 1.2, 1.2, 0.08, M('#f8fafc'), 0, 0.95, 0, 32);
      cyl(pl, 0.1, 0.14, 0.95, M('#475569', { m: 0.5 }), 0, 0, 0, 10);
      cyl(pl, 0.05, 0.05, 2.6, M('#94a3b8'), 0, 1.0, 0, 8);
      const umb = mesh(new T.ConeGeometry(2.0, 0.6, 8, 1, true), M('#2563eb', { side: true }), pl); umb.position.y = 3.6;
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; const c = group(pl, Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7, -a - Math.PI / 2); box(c, 0.7, 0.1, 0.7, M(['#2563eb', '#dc2626', '#16a34a', '#f59e0b'][i]), 0, 0.6, 0); box(c, 0.7, 0.8, 0.1, M(['#2563eb', '#dc2626', '#16a34a', '#f59e0b'][i]), 0, 0.6, -0.3); for (const sx of [-0.28, 0.28]) for (const sz of [-0.28, 0.28]) box(c, 0.06, 0.6, 0.06, M('#334155'), sx, 0, sz); }
      box(pl, 0.6, 0.04, 0.4, M('#9ca3af', { m: 0.7 }), -0.3, 1.03, 0.2);
      for (let i = 0; i < 3; i++) box(pl, 0.45, 0.07, 0.32, M(['#dc2626', '#2563eb', '#16a34a'][i]), 0.4, 1.03 + i * 0.07, 0);
      // burbujas
      const bub = (x: number, y: number, z: number, color: string, ph: number) => { const g = group(root, x, y, z); props.push(g); const s = sph(g, 0.45, M(color, { r: 0.4 }), 0, 0, 0, 20); s.scale.set(1.3, 0.9, 0.5); const tail = mesh(new T.ConeGeometry(0.12, 0.3, 8), M(color, { r: 0.4 }), g); tail.position.set(-0.3, -0.42, 0); tail.rotation.z = 2.6; for (let i = -1; i <= 1; i++) sph(g, 0.06, M('#ffffff', { e: '#ffffff', ei: 0.4 }), i * 0.2, 0, 0.24, 8); bob(g, 0.18, 1.1, ph); ticks.push((t) => (g.rotation.y = Math.sin(t * 0.8 + ph) * 0.4)); };
      const props = k.props;
      bub(-2.8, 3.0, -0.6, '#3b82f6', 0); bub(3.2, 3.4, -1.2, '#ef4444', 1.6); bub(2.6, 2.6, 2.4, '#22c55e', 3.1);
      // foco de ideas
      const bulb = prop(0.4, 0.4, 0, 4.6);
      const glass = sph(bulb, 0.4, M('#fde047', { e: '#facc15', ei: 1.2, op: 0.9 }), 0, 0, 0, 20);
      cyl(bulb, 0.17, 0.17, 0.3, M('#9ca3af', { m: 0.8 }), 0, -0.58, 0, 14);
      ticks.push((t) => (glass.material.emissiveIntensity = 0.8 + Math.sin(t * 2.4) * 0.5));
      for (const [x, z] of [[-4.4, -2.0], [4.4, -2.4], [-4.0, 3.4], [4.2, 3.0], [0.4, -4.6]]) tree(root, x, z, 1.0);
      bench(root, -3.4, 0.8, Math.PI / 2); lampPost(root, 3.6, 0.6);
      cloud(-2.5, 6.6, -3.4, 0.9);
      dust('#dbeafe', 30);
    },

    /* MATERIALES: gran biblioteca con columnas, libro gigante con páginas que pasan y libros volando */
    biblioteca: () => {
      island(k, 'plaza', '#d6cbb8');
      path(k, 2.0, 6, '#c2b59b', 0, 2.8);
      const lb = prop(0, -2.4);
      columnsFacade(k, lb, 5.0, 2.4, 6, '#efe7d8', 'BIBLIOTECA', '#7c2d12');
      const dome = mesh(new T.SphereGeometry(1.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M('#c9a227', { m: 0.6, r: 0.35 }), lb);
      dome.position.set(0, 3.6, -0.9);
      // libro gigante abierto
      const bk = prop(-2.6, 1.6, 0.5);
      box(bk, 0.5, 0.5, 0.5, M('#7c4a1e'), 0, 0, 0);
      const open = group(bk, 0, 0.6, 0);
      open.rotation.x = -0.35;
      box(open, 1.2, 0.06, 1.5, M('#7c2d12'), -0.6, 0, 0); box(open, 1.2, 0.06, 1.5, M('#7c2d12'), 0.6, 0, 0);
      box(open, 1.1, 0.08, 1.4, M('#fefce8'), -0.57, 0.04, 0); box(open, 1.1, 0.08, 1.4, M('#fefce8'), 0.57, 0.04, 0);
      const page = group(open, 0, 0.13, 0);
      const pg = box(page, 1.08, 0.015, 1.36, M('#fffbeb', { side: true }), 0.55, 0, 0);
      void pg;
      ticks.push((t) => { const q = (t * 0.4) % 1; page.rotation.z = q < 0.6 ? (q / 0.6) * Math.PI : Math.PI; page.visible = q < 0.95; });
      // libros volando
      const pal = ['#b91c1c', '#1e3a8a', '#065f46', '#92400e', '#6b21a8', '#be185d'];
      for (let i = 0; i < 6; i++) {
        const g = group(root, 0, 0, 0);
        const col = M(pal[i]), paper = M('#fefce8');
        const l = group(g, 0, 0, 0), r = group(g, 0, 0, 0);
        box(l, 0.42, 0.04, 0.6, col, -0.21, 0, 0); box(l, 0.38, 0.03, 0.56, paper, -0.2, 0.04, 0);
        box(r, 0.42, 0.04, 0.6, col, 0.21, 0, 0); box(r, 0.38, 0.03, 0.56, paper, 0.2, 0.04, 0);
        const rr = 2.2 + (i % 3) * 0.7, sp = 0.25 + i * 0.03, ph = i * 1.05, y0 = 3.0 + (i % 3) * 0.6;
        ticks.push((tt) => { const a = tt * sp + ph; g.position.set(Math.cos(a) * rr, y0 + Math.sin(tt * 1.3 + ph) * 0.2, Math.sin(a) * rr); g.rotation.y = -a; const f = Math.sin(tt * 3 + ph) * 0.35 + 0.45; l.rotation.z = f; r.rotation.z = -f; });
      }
      for (const x of [-1.6, 1.6]) lampPost(root, x, 1.6);
      bench(root, 2.6, 2.2, -0.4);
      for (const [x, z] of [[-4.6, -0.6], [4.6, -0.8], [4.2, 3.4], [-4.2, 3.6]]) tree(root, x, z, 0.9, 'pine');
      cloud(3, 6.8, -3.4, 0.9);
      dust('#fde68a', 40);
    },

    /* INVESTIGACIÓN: observatorio, torre de ADN girando, matraces burbujeando y moléculas */
    investigacion: () => {
      island(k, 'grass', '#8fbf7a');
      path(k, 1.6, 6, '#d1d5db', 0.4, 2.8);
      // observatorio
      const ob = prop(-2.6, -2.4);
      cyl(ob, 1.3, 1.3, 1.8, M('#f1f5f9'), 0, 0, 0, 28);
      const domeG = group(ob, 0, 1.8, 0);
      mesh(new T.SphereGeometry(1.3, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M('#cbd5e1', { m: 0.6, r: 0.35 }), domeG);
      box(domeG, 0.4, 1.3, 1.4, M('#0f172a'), 0, 0, 0.0).position.set(0, 0.6, 0.55);
      const tele = mesh(new T.CylinderGeometry(0.12, 0.16, 1.6, 12), M('#334155', { m: 0.6 }), domeG); tele.position.set(0, 1.0, 0.7); tele.rotation.x = 0.8;
      spin(domeG, 0.25, 'y');
      // laboratorio
      const lab = prop(2.0, -2.6);
      building(lab, 0, 0, 3.2, 2.0, 2.0, '#e0f2f1', '#99f6e4');
      plane(lab, 2.2, 0.38, MT(text(['LABORATORIO'], { bg: '#0d9488', fg: '#ffffff', font: 'bold 56px Arial', w: 512, h: 96 })), 0, 1.6, 1.01);
      // torre de ADN
      const dna = prop(0.6, 0.6, 0, 0.3);
      const ca = M('#14b8a6', { e: '#0d9488', ei: 0.4 }), cb = M('#f472b6', { e: '#db2777', ei: 0.4 }), link = M('#e2e8f0');
      for (let i = 0; i < 20; i++) { const a = i * 0.55, y = i * 0.22; const x1 = Math.cos(a) * 0.6, z1 = Math.sin(a) * 0.6; sph(dna, 0.12, ca, x1, y, z1, 12); sph(dna, 0.12, cb, -x1, y, -z1, 12); const l = mesh(new T.CylinderGeometry(0.025, 0.025, 1.2, 6), link, dna); l.position.set(0, y, 0); l.rotation.z = Math.PI / 2; l.rotation.y = -a; }
      spin(dna, 0.6, 'y');
      // matraces gigantes
      const flask = (x: number, z: number, color: string, ph: number) => { const g = prop(x, z); const glass = M('#e0f2fe', { op: 0.35, r: 0.1 }); const bodyM = mesh(new T.ConeGeometry(0.6, 1.0, 24, 1, true), glass, g); bodyM.position.y = 0.5; cyl(g, 0.14, 0.14, 0.55, glass, 0, 0.88, 0, 14); const liq = mesh(new T.ConeGeometry(0.52, 0.6, 24), M(color, { e: color, ei: 0.45, op: 0.85 }), g); liq.position.y = 0.3; const bubs: any[] = []; for (let i = 0; i < 6; i++) bubs.push(sph(g, 0.05 + rnd() * 0.04, M('#ffffff', { op: 0.7 }), (rnd() - 0.5) * 0.4, 0, (rnd() - 0.5) * 0.4, 8)); ticks.push((t) => bubs.forEach((b2, i) => { const q = (t * 0.6 + i / 6 + ph) % 1; b2.position.y = 0.08 + q * 1.8; b2.position.x = Math.sin(q * 8 + i) * 0.1 * (1 - q); b2.scale.setScalar(q > 0.9 ? 0.01 : 1); })); };
      flask(-3.4, 1.6, '#22c55e', 0); flask(3.4, 1.4, '#a855f7', 0.3); flask(2.4, 3.4, '#f97316', 0.6);
      // moléculas flotando
      const mol = prop(-1.6, 2.6, 0, 3.2);
      const atom = M('#38bdf8', { e: '#0284c7', ei: 0.3 });
      sph(mol, 0.25, M('#f43f5e'), 0, 0, 0, 14);
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; sph(mol, 0.16, atom, Math.cos(a) * 0.6, Math.sin(a) * 0.3, Math.sin(a) * 0.6, 12); const l = mesh(new T.CylinderGeometry(0.03, 0.03, 0.6, 6), link, mol); l.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.15, Math.sin(a) * 0.3); l.lookAt(0, 0, 0); l.rotateX(Math.PI / 2); }
      spin(mol, 0.8, 'y'); bob(mol, 0.2, 1.0);
      for (const [x, z] of [[-4.6, 0.0], [4.6, -0.4], [4.2, 3.8]]) tree(root, x, z, 0.85);
      cloud(-2.5, 6.8, -3.6, 0.9);
      dust('#ccfbf1', 40);
    },
  };

  (SCENES[id] || SCENES.biblioteca)();
  return k.built();
}
