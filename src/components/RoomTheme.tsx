import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DoorOpen, LogOut, SkipForward } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { ROOM_BY_ID, RoomId } from '../data/rooms';
import { ROOM_THEMES, themeVars, activeRoomFor, Motif } from '../data/roomThemes';
import { RoomCanvas } from './RoomCanvas';

/* ───────────────────────── Fondo animado de cada cuarto ───────────────────────── */

type Ctx = CanvasRenderingContext2D;
interface MotifState { [k: string]: any }

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function gearPath(c: Ctx, x: number, y: number, r: number, teeth: number, ang: number) {
  c.beginPath();
  for (let i = 0; i <= teeth * 2; i++) {
    const a = ang + (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 1.16 : r;
    const a2 = a + Math.PI / (teeth * 2);
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    c.lineTo(x + Math.cos(a2) * rr, y + Math.sin(a2) * rr);
  }
  c.closePath();
  c.moveTo(x + r * 0.35, y);
  c.arc(x, y, r * 0.35, 0, Math.PI * 2);
}

function hexagon(c: Ctx, x: number, y: number, r: number, ang: number) {
  c.beginPath();
  for (let i = 0; i <= 6; i++) {
    const a = ang + (i / 6) * Math.PI * 2;
    i ? c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
}

/** Partículas genéricas que suben/bajan. */
function particles(st: MotifState, w: number, h: number, n: number, up = true) {
  if (!st.p || st.pw !== w) {
    st.pw = w;
    st.p = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), v: rand(12, 40), s: rand(0.6, 1.4), ph: rand(0, 6), r: rand(0, 6) }));
  }
  return (dt: number) =>
    st.p.forEach((p: any) => {
      p.y += (up ? -1 : 1) * p.v * dt;
      if (up && p.y < -40) { p.y = h + 40; p.x = rand(0, w); }
      if (!up && p.y > h + 40) { p.y = -40; p.x = rand(0, w); }
    });
}

const MOTIFS: Record<Motif, (c: Ctx, w: number, h: number, t: number, dt: number, col: { a: string; b: string }, st: MotifState) => void> = {
  law: (c, w, h, t, dt, col, st) => {
    // balanza grande que se balancea + columnas + polvo dorado
    const s = Math.min(w, h) / 420;
    c.save(); c.translate(w * 0.84, h * 0.92); c.scale(s, s); c.strokeStyle = col.a; c.lineWidth = 3; c.lineCap = 'round';
    c.strokeRect(-60, -8, 120, 8); c.beginPath(); c.moveTo(0, -8); c.lineTo(0, -230); c.stroke();
    const ang = Math.sin(t * 0.7) * 0.12;
    c.save(); c.translate(0, -230); c.rotate(ang);
    c.beginPath(); c.moveTo(-130, 0); c.lineTo(130, 0); c.stroke();
    for (const sx of [-130, 130]) {
      c.save(); c.translate(sx, 0); c.rotate(-ang);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, 90); c.moveTo(0, 0); c.lineTo(40, 90); c.stroke();
      c.beginPath(); c.ellipse(0, 92, 46, 12, 0, 0, Math.PI); c.stroke();
      c.restore();
    }
    c.restore(); c.restore();
    for (const x of [w * 0.04, w * 0.12]) {
      c.strokeStyle = col.a; c.lineWidth = 2;
      c.strokeRect(x - 26, h * 0.3, 52, 14); c.strokeRect(x - 26, h - 30, 52, 14);
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x + i * 8, h * 0.3 + 14); c.lineTo(x + i * 8, h - 30); c.stroke(); }
    }
    particles(st, w, h, 40)(dt);
    c.fillStyle = col.b;
    st.p.forEach((p: any) => { c.globalAlpha = 0.6; c.beginPath(); c.arc(p.x + Math.sin(t + p.ph) * 10, p.y, 1.6 * p.s, 0, 7); c.fill(); });
    c.globalAlpha = 1;
  },
  blueprint: (c, w, h, t, _dt, col) => {
    c.strokeStyle = col.a; c.globalAlpha = 0.35; c.lineWidth = 1;
    for (let x = 0; x < w; x += 28) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 28) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 0.8; c.lineWidth = 1.5;
    for (let x = 0; x < w; x += 140) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 140) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 1;
    // grúa
    const bx = w * 0.88, by = h, H = Math.min(h * 0.7, 520);
    c.lineWidth = 2.5; c.strokeStyle = col.a;
    c.strokeRect(bx - 12, by - H, 24, H);
    for (let y = by - H; y < by; y += 24) { c.beginPath(); c.moveTo(bx - 12, y); c.lineTo(bx + 12, y + 24); c.stroke(); }
    const L = 260 * Math.cos(Math.sin(t * 0.35) * 0.9);
    c.beginPath(); c.moveTo(bx - 90, by - H); c.lineTo(bx - L, by - H); c.moveTo(bx, by - H); c.lineTo(bx + 70, by - H); c.stroke();
    const hookX = bx - L * (0.55 + Math.sin(t * 0.5) * 0.25), hookY = by - H + 120 + Math.sin(t * 0.8) * 50;
    c.beginPath(); c.moveTo(hookX, by - H); c.lineTo(hookX, hookY); c.stroke(); c.strokeRect(hookX - 30, hookY, 60, 10);
    // franja de seguridad arriba
    c.save(); c.globalAlpha = 0.9;
    for (let x = -20; x < w + 20; x += 24) { c.fillStyle = col.b; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 12, 0); c.lineTo(x, 8); c.lineTo(x - 12, 8); c.fill(); }
    c.restore();
  },
  code: (c, w, h, t, dt, col, st) => {
    const fs = 15, cols = Math.ceil(w / 20);
    if (!st.cols || st.cols.length !== cols) st.cols = Array.from({ length: cols }, () => ({ y: rand(-h, h), v: rand(40, 120), chars: [] as string[] }));
    const CH = '01{}<>/=;()[]ABCDEF$#+*';
    c.font = `${fs}px monospace`;
    st.cols.forEach((col0: any, i: number) => {
      col0.y += col0.v * dt;
      if (col0.y - 14 * fs > h) { col0.y = rand(-200, 0); col0.v = rand(40, 120); }
      for (let k = 0; k < 14; k++) {
        const y = col0.y - k * fs;
        if (y < -fs || y > h + fs) continue;
        c.globalAlpha = k === 0 ? 1 : 0.75 * (1 - k / 14);
        c.fillStyle = k === 0 ? col.b : col.a;
        c.fillText(CH[(i * 7 + k * 13 + Math.floor(t * 6 + k)) % CH.length], i * 20 + 3, y);
      }
    });
    c.globalAlpha = 1;
  },
  gears: (c, w, h, t, _dt, col) => {
    c.lineWidth = 3;
    c.strokeStyle = col.a; gearPath(c, w * 0.06, h * 0.88, 90, 14, t * 0.4); c.stroke();
    c.strokeStyle = col.b; gearPath(c, w * 0.06 + 160, h * 0.88 - 40, 58, 10, -t * 0.62); c.stroke();
    c.strokeStyle = col.a; gearPath(c, w * 0.94, h * 0.28, 110, 16, -t * 0.3); c.stroke();
    c.strokeStyle = col.b; gearPath(c, w * 0.94 - 175, h * 0.28 + 60, 64, 10, t * 0.52); c.stroke();
    // cinta transportadora abajo
    c.strokeStyle = col.a; c.lineWidth = 2; c.strokeRect(w * 0.25, h - 34, w * 0.5, 14);
    for (let i = 0; i < 6; i++) { const x = w * 0.25 + ((t * 40 + i * (w * 0.5 / 6)) % (w * 0.5)); c.strokeRect(x, h - 62, 26, 26); }
  },
  drafting: (c, w, h, t, _dt, col) => {
    c.strokeStyle = col.a; c.globalAlpha = 0.25; c.lineWidth = 1;
    for (let x = 0; x < w; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 20) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 1; c.lineWidth = 2;
    const k = (t % 12) / 9;
    const shapes: [number, () => void][] = [
      [900, () => { c.moveTo(w * 0.72, h * 0.75); c.lineTo(w * 0.72, h * 0.45); c.lineTo(w * 0.82, h * 0.35); c.lineTo(w * 0.92, h * 0.45); c.lineTo(w * 0.92, h * 0.75); c.closePath(); }],
      [700, () => { c.rect(w * 0.76, h * 0.55, w * 0.05, h * 0.2); }],
      [600, () => { c.arc(w * 0.12, h * 0.3, 70, 0, Math.PI * 2); }],
      [500, () => { c.moveTo(w * 0.02, h * 0.92); c.lineTo(w * 0.3, h * 0.92); c.moveTo(w * 0.02, h * 0.9); c.lineTo(w * 0.02, h * 0.94); c.moveTo(w * 0.3, h * 0.9); c.lineTo(w * 0.3, h * 0.94); }],
    ];
    shapes.forEach(([len, f], i) => {
      const p = Math.min(1, Math.max(0, k * shapes.length - i));
      c.setLineDash([len, len]); c.lineDashOffset = len * (1 - p);
      c.strokeStyle = i % 2 ? col.b : col.a; c.beginPath(); f(); c.stroke();
    });
    c.setLineDash([]);
  },
  ecg: (c, w, h, t, dt, col, st) => {
    const beat = (x: number) => { const k = ((x % 1) + 1) % 1; if (k > 0.15 && k < 0.18) return -0.2; if (k >= 0.18 && k < 0.22) return 1; if (k >= 0.22 && k < 0.26) return -0.35; if (k > 0.4 && k < 0.55) return Math.sin(((k - 0.4) / 0.15) * Math.PI) * 0.2; return 0; };
    for (const [yy, amp, sp] of [[0.62, 90, 1], [0.86, 40, 1.4]] as const) {
      c.strokeStyle = yy > 0.8 ? col.b : col.a; c.lineWidth = yy > 0.8 ? 1.5 : 2.5; c.beginPath();
      for (let x = 0; x < w; x += 3) { const y = h * yy - beat(x / 320 - t * 0.9 * sp) * amp; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
    }
    particles(st, w, h, 18)(dt * 0.5);
    c.strokeStyle = col.a; c.lineWidth = 3;
    st.p.forEach((p: any) => { const s = 7 * p.s; c.beginPath(); c.moveTo(p.x - s, p.y); c.lineTo(p.x + s, p.y); c.moveTo(p.x, p.y - s); c.lineTo(p.x, p.y + s); c.stroke(); });
  },
  care: (c, w, h, t, dt, col, st) => {
    particles(st, w, h, 26)(dt);
    st.p.forEach((p: any, i: number) => {
      const x = p.x + Math.sin(t * 0.8 + p.ph) * 18, y = p.y, s = 9 * p.s;
      if (i % 2) { c.fillStyle = col.b; c.fillRect(x - s, y - s / 3, s * 2, s / 1.5); c.fillRect(x - s / 3, y - s, s / 1.5, s * 2); }
      else { c.fillStyle = col.a; c.beginPath(); c.moveTo(x, y + s); c.bezierCurveTo(x - s * 2, y - s * 0.4, x - s * 0.6, y - s * 1.6, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.6, y - s * 1.6, x + s * 2, y - s * 0.4, x, y + s); c.fill(); }
    });
  },
  mind: (c, w, h, t, _dt, col) => {
    for (let i = 0; i < 6; i++) {
      const x = w * (0.15 + 0.7 * ((Math.sin(t * 0.07 + i * 1.7) + 1) / 2)), y = h * (0.2 + 0.6 * ((Math.cos(t * 0.05 + i * 2.3) + 1) / 2));
      const r = 120 + i * 30;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, i % 2 ? col.b : col.a); g.addColorStop(1, 'transparent');
      c.globalAlpha = 0.35; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
    c.globalAlpha = 1; c.strokeStyle = col.a; c.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const k = (t * 0.25 + i / 3) % 1; c.globalAlpha = 1 - k; c.beginPath(); c.arc(w * 0.85, h * 0.75, 40 + k * 260, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
  },
  charts: (c, w, h, t, _dt, col) => {
    const n = Math.ceil(w / 70);
    for (let i = 0; i < n; i++) {
      const bh = (0.12 + 0.3 * ((i % 7) / 7)) * h * (0.75 + Math.sin(t * 0.8 + i) * 0.25);
      c.fillStyle = i % 3 === 0 ? col.b : col.a; c.globalAlpha = 0.55; c.fillRect(i * 70 + 12, h - bh, 40, bh);
    }
    c.globalAlpha = 1; c.strokeStyle = col.b; c.lineWidth = 3; c.beginPath();
    const pts = Array.from({ length: 9 }, (_, i) => [w * (0.05 + i * 0.11), h * (0.8 - i * 0.07 + (i % 2 ? 0.05 : -0.02))]);
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    const k = (t * 0.15) % 1, idx = Math.floor(k * 8), f = k * 8 - idx;
    const [x1, y1] = pts[idx], [x2, y2] = pts[idx + 1];
    c.fillStyle = col.b; c.beginPath(); c.arc(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 7, 0, 7); c.fill();
  },
  numbers: (c, w, h, t, dt, col, st) => {
    particles(st, w, h, 34, false)(dt);
    c.font = 'bold 22px monospace';
    st.p.forEach((p: any, i: number) => {
      if (i % 4 === 0) { c.strokeStyle = col.b; c.lineWidth = 2.5; c.beginPath(); c.ellipse(p.x, p.y, 13 * Math.abs(Math.cos(t * 2 + p.ph)) + 2, 13, 0, 0, 7); c.stroke(); }
      else { c.fillStyle = i % 3 ? col.a : col.b; c.fillText(['S/', '0', '1', '%', '9', '=', '+', '$', '7'][i % 9], p.x, p.y); }
    });
    c.strokeStyle = col.a; c.globalAlpha = 0.3; c.lineWidth = 1;
    for (let y = 60; y < h; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.globalAlpha = 1;
  },
  studio: (c, w, h, t, _dt, col) => {
    for (const [x0, sp, ph] of [[0.12, 0.5, 0], [0.88, 0.42, 2]] as const) {
      const ang = Math.PI / 2 + Math.sin(t * sp + ph) * 0.5, x = w * x0;
      const g = c.createRadialGradient(x, -20, 0, x, -20, h * 1.1);
      g.addColorStop(0, col.b); g.addColorStop(1, 'transparent');
      c.fillStyle = g; c.globalAlpha = 0.55; c.beginPath(); c.moveTo(x, -20);
      c.lineTo(x + Math.cos(ang - 0.22) * h * 1.2, Math.sin(ang - 0.22) * h * 1.2); c.lineTo(x + Math.cos(ang + 0.22) * h * 1.2, Math.sin(ang + 0.22) * h * 1.2); c.fill();
    }
    c.globalAlpha = 1; c.fillStyle = col.a;
    for (const x of [0, w - 26]) { c.globalAlpha = 0.7; c.fillRect(x, 0, 26, h); c.globalAlpha = 1; for (let y = ((t * 60) % 40) - 40; y < h; y += 40) c.clearRect(x + 7, y, 12, 22); }
  },
  chalk: (c, w, h, t, _dt, col, st) => {
    if (!st.d || st.dw !== w) { st.dw = w; st.d = ['ABC', '2 + 3 = 5', 'π', '★', 'a² + b² = c²', '✏', '¡Hola!', '1, 2, 3', '♥', '√16 = 4'].map((s, i) => ({ s, x: rand(0.03, 0.9) * w, y: rand(0.15, 0.95) * h, r: rand(-0.25, 0.25), z: rand(22, 40), ph: i })); }
    c.font = '30px "Chalkboard SE", "Comic Sans MS", cursive';
    st.d.forEach((d: any, i: number) => {
      c.save(); c.translate(d.x + Math.sin(t * 0.3 + d.ph) * 14, d.y + Math.cos(t * 0.25 + d.ph) * 10); c.rotate(d.r);
      c.font = `${d.z}px "Chalkboard SE", "Comic Sans MS", cursive`; c.fillStyle = i % 3 ? col.a : col.b; c.fillText(d.s, 0, 0); c.restore();
    });
  },
  bubbles: (c, w, h, t, dt, col, st) => {
    particles(st, w, h, 16)(dt * 0.8);
    st.p.forEach((p: any, i: number) => {
      const x = p.x + Math.sin(t * 0.6 + p.ph) * 20, y = p.y, bw = 70 * p.s, bh = 42 * p.s;
      c.strokeStyle = i % 2 ? col.b : col.a; c.fillStyle = c.strokeStyle; c.lineWidth = 2.5;
      c.beginPath(); (c as any).roundRect ? (c as any).roundRect(x - bw / 2, y - bh / 2, bw, bh, 14) : c.rect(x - bw / 2, y - bh / 2, bw, bh);
      c.moveTo(x - bw * 0.2, y + bh / 2); c.lineTo(x - bw * 0.32, y + bh / 2 + 14); c.lineTo(x - bw * 0.05, y + bh / 2); c.stroke();
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.arc(x + k * 12 * p.s, y, 3.5 * p.s, 0, 7); c.fill(); }
    });
  },
  books: (c, w, h, t, dt, col, st) => {
    particles(st, w, h, 18, false)(dt * 0.5);
    st.p.forEach((p: any, i: number) => {
      c.save(); c.translate(p.x + Math.sin(t * 0.5 + p.ph) * 30, p.y); c.rotate(Math.sin(t * 0.7 + p.ph) * 0.6);
      c.strokeStyle = i % 2 ? col.b : col.a; c.lineWidth = 2;
      if (i % 3 === 0) { c.strokeRect(-20, -14, 40, 28); c.beginPath(); c.moveTo(0, -14); c.lineTo(0, 14); c.stroke(); }
      else { c.strokeRect(-12, -16, 24, 32); for (let k = -8; k <= 8; k += 6) { c.beginPath(); c.moveTo(-7, k); c.lineTo(7, k); c.stroke(); } }
      c.restore();
    });
    // estante abajo
    let x = 0, k = 0;
    while (x < w) { const bw = 14 + ((k * 7) % 12), bh = 50 + ((k * 13) % 40); c.globalAlpha = 0.6; c.fillStyle = k % 3 ? col.a : col.b; c.fillRect(x, h - bh, bw - 3, bh); x += bw; k++; }
    c.globalAlpha = 1;
  },
  molecules: (c, w, h, t, dt, col, st) => {
    const mols: [number, number, number][] = [[0.1, 0.3, 1], [0.9, 0.25, -1], [0.82, 0.8, 1], [0.18, 0.82, -1]];
    mols.forEach(([x, y, dir], i) => {
      const cx = w * x, cy = h * y, a = t * 0.3 * dir;
      c.strokeStyle = i % 2 ? col.b : col.a; c.lineWidth = 2.5; hexagon(c, cx, cy, 46, a); c.stroke();
      for (let k = 0; k < 6; k += 2) { const aa = a + (k / 6) * Math.PI * 2; const x1 = cx + Math.cos(aa) * 46, y1 = cy + Math.sin(aa) * 46; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + Math.cos(aa) * 34, y1 + Math.sin(aa) * 34); c.stroke(); c.beginPath(); c.arc(x1 + Math.cos(aa) * 40, y1 + Math.sin(aa) * 40, 6, 0, 7); c.stroke(); }
    });
    particles(st, w, h, 30)(dt);
    c.strokeStyle = col.a; c.lineWidth = 1.5;
    st.p.forEach((p: any) => { c.beginPath(); c.arc(p.x, p.y, 4 * p.s, 0, 7); c.stroke(); });
  },
};

const RoomBackdrop: React.FC<{ room: RoomId; colors: { a: string; b: string }; opacity: number }> = ({ room, colors, opacity }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const c = cv.getContext('2d');
    if (!c) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const st: MotifState = {};
    let w = 0, h = 0, raf = 0, last = performance.now(), t = 0, skip = false;
    const resize = () => {
      w = cv.width = window.innerWidth;
      h = cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const col = colors;
    const draw = MOTIFS[ROOM_THEMES[room].motif];
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      skip = !skip;
      if (skip && !reduce) return; // ~30 fps es suficiente para el fondo
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      t += dt;
      c.clearRect(0, 0, w, h);
      draw(c, w, h, t, dt, col, st);
      if (reduce) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [room]);
  return <canvas ref={ref} aria-hidden className="room-backdrop" style={{ opacity }} />;
};

/* ───────────────────────── Animación de "entrar al cuarto" ───────────────────────── */

const ENTER_MS = 2600;

const EnterOverlay: React.FC<{ room: RoomId; onDone: () => void }> = ({ room, onDone }) => {
  const meta = ROOM_BY_ID[room];
  const th = ROOM_THEMES[room];
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setLeaving(true), ENTER_MS - 550);
    const b = window.setTimeout(onDone, ENTER_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [room]);
  return (
    <div
      className={`room-enter fixed inset-0 z-[90] flex flex-col items-center justify-center text-white ${leaving ? 'is-leaving' : ''}`}
      style={{ background: `radial-gradient(120% 90% at 50% 30%, ${th.hero[1]}, ${th.hero[0]})` }}
      role="dialog"
      aria-label={`Entrando a ${meta.place}`}
      onClick={onDone}
    >
      <div className="relative w-full max-w-3xl aspect-[16/10] max-h-[62vh]">
        <RoomCanvas room={room} flyIn interactive={false} className="absolute inset-0" />
      </div>
      <p className="room-enter-kicker mt-2 text-xs font-bold uppercase tracking-[0.3em] text-white/70">Entrando a</p>
      <h2 className="room-enter-title mt-1 text-4xl sm:text-5xl font-bold text-center px-4" style={{ fontFamily: th.font }}>
        {meta.place}
      </h2>
      <p className="room-enter-kicker mt-2 text-sm text-white/80 text-center px-6">{meta.tagline}</p>
      <button type="button" onClick={onDone} className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold">
        <SkipForward className="w-3.5 h-3.5" /> Saltar
      </button>
    </div>
  );
};

/* ───────────────────────── Controlador ───────────────────────── */

/**
 * Cuando la persona elige una carrera o categoría (o la busca), TODA la página
 * se convierte en ese cuarto: colores, letras, fondo animado, portada y pie.
 */
export const RoomTheme: React.FC = () => {
  const { filter, setFilter } = useExchange();
  const [room, setRoom] = useState<RoomId | null>(null);
  const [entering, setEntering] = useState<RoomId | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const first = useRef(true);

  // Cuarto según el filtro (la búsqueda espera un poco para no cambiar en cada tecla)
  useEffect(() => {
    const target = activeRoomFor(filter);
    const wait = filter.searchQuery && target ? 700 : 0;
    const id = window.setTimeout(() => setRoom(target), wait);
    return () => window.clearTimeout(id);
  }, [filter.searchQuery, filter.career, filter.category]);

  // Seguir el modo claro/oscuro
  useEffect(() => {
    const mo = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  // Aplicar el tema a <html> (antes de pintar, para que no parpadee)
  useLayoutEffect(() => {
    const root = document.documentElement;
    const prev = root.dataset.room;
    if (room) {
      root.dataset.room = room;
      const vars = themeVars(room, dark);
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    } else {
      delete root.dataset.room;
    }
    if (!first.current && room && room !== prev) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) setEntering(room);
    }
    if (!first.current && !room && prev) {
      root.classList.add('theme-anim');
      window.setTimeout(() => root.classList.remove('theme-anim'), 400);
    }
    first.current = false;
  }, [room, dark]);

  useEffect(() => () => {
    delete document.documentElement.dataset.room;
  }, []);

  const exit = () => setFilter((prev) => ({ ...prev, career: 'todas', category: 'todas', searchQuery: '' }));

  return (
    <>
      {room && (() => {
        const v = themeVars(room, dark);
        return <RoomBackdrop key={room + (dark ? '-d' : '-l')} room={room} colors={{ a: v['--r-motif'], b: v['--r-accent2'] }} opacity={Number(v['--r-motif-op'])} />;
      })()}
      {room && (
        <div className="room-bar fixed left-3 bottom-3 sm:left-5 sm:bottom-5 z-40 flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full shadow-xl text-white text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, var(--r-hero-1), var(--r-hero-2))' }}>
          <DoorOpen className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[42vw] sm:max-w-none">Estás en: {ROOM_BY_ID[room].place}</span>
          <button type="button" onClick={exit} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/30">
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      )}
      {entering && <EnterOverlay key={entering} room={entering} onDone={() => setEntering(null)} />}
    </>
  );
};
