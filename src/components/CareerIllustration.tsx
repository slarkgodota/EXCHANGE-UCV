import React from 'react';
import {
  Scale, Gavel, Landmark, Scroll, FileText, HardHat, Construction, Building2, Ruler, Hammer, Code, Cpu, Server, Database, Wifi,
  Factory, Cog, Package, Truck, Wrench, DraftingCompass, Building, PenTool, Shapes, Stethoscope, HeartPulse, Hospital, Pill, Microscope,
  HeartHandshake, Syringe, Thermometer, Bandage, Ambulance, Brain, Smile, MessagesSquare, Sparkles, Leaf, Briefcase, TrendingUp, Target,
  Users, Handshake, Calculator, Coins, Receipt, PiggyBank, Wallet, Mic, Video, Radio, Camera, Megaphone, GraduationCap, BookOpen, Pencil,
  Apple, Presentation, Lightbulb, Library, BookMarked, NotebookPen, FlaskConical, Dna, Atom, Telescope,
} from 'lucide-react';
import type { SceneId } from '../data/careerScenes';
import { CAREER_THEMES } from '../data/careerThemes';

type Viz = 'progress' | 'bars' | 'line' | 'ecg' | 'code' | 'pie' | 'wave' | 'blueprint';
type Icon = React.FC<{ className?: string; strokeWidth?: number }>;

interface Ill {
  main: Icon;
  chips: Icon[];
  card: { title: string; sub: string; viz: Viz };
}

const ILL: Record<SceneId, Ill> = {
  derecho: { main: Scale, chips: [Gavel, Landmark, Scroll, FileText], card: { title: 'Expediente 2026-014', sub: 'Audiencia programada', viz: 'progress' } },
  civil: { main: HardHat, chips: [Construction, Building2, Ruler, Hammer], card: { title: 'Avance de obra', sub: 'Piso 6 de 8', viz: 'bars' } },
  sistemas: { main: Code, chips: [Cpu, Server, Database, Wifi], card: { title: 'deploy.ts', sub: 'Compilación exitosa', viz: 'code' } },
  industrial: { main: Factory, chips: [Cog, Package, Truck, Wrench], card: { title: 'Eficiencia de línea', sub: '92 % · +4 %', viz: 'line' } },
  arquitectura: { main: DraftingCompass, chips: [Building, Ruler, PenTool, Shapes], card: { title: 'Plano A-101', sub: 'Escala 1:100', viz: 'blueprint' } },
  medicina: { main: Stethoscope, chips: [HeartPulse, Hospital, Pill, Microscope], card: { title: 'Ritmo cardiaco', sub: '72 lpm · normal', viz: 'ecg' } },
  enfermeria: { main: HeartHandshake, chips: [Syringe, Thermometer, Bandage, Ambulance], card: { title: 'Signos vitales', sub: 'Paciente estable', viz: 'ecg' } },
  psicologia: { main: Brain, chips: [Smile, MessagesSquare, Sparkles, Leaf], card: { title: 'Bienestar', sub: 'Sesión 3 de 8', viz: 'progress' } },
  administracion: { main: Briefcase, chips: [TrendingUp, Target, Users, Handshake], card: { title: 'Ventas del trimestre', sub: '+32 %', viz: 'bars' } },
  contabilidad: { main: Calculator, chips: [Coins, Receipt, PiggyBank, Wallet], card: { title: 'Balance general', sub: 'S/ 128 450', viz: 'pie' } },
  comunicacion: { main: Mic, chips: [Video, Radio, Camera, Megaphone], card: { title: 'En vivo', sub: '12,4 mil oyentes', viz: 'wave' } },
  educacion: { main: GraduationCap, chips: [BookOpen, Pencil, Apple, Presentation], card: { title: 'Clase de hoy', sub: 'Matemática · 3.er grado', viz: 'progress' } },
  tutoria: { main: MessagesSquare, chips: [Lightbulb, Users, BookOpen, Presentation], card: { title: 'Tutoría', sub: 'Cálculo I · 18:00', viz: 'progress' } },
  biblioteca: { main: Library, chips: [BookOpen, BookMarked, FileText, NotebookPen], card: { title: 'Nuevos apuntes', sub: '+24 esta semana', viz: 'bars' } },
  investigacion: { main: FlaskConical, chips: [Microscope, Dna, Atom, Telescope], card: { title: 'Proyecto de tesis', sub: 'Fase 2 · Experimentos', viz: 'line' } },
};

const VizSvg: React.FC<{ kind: Viz; a: string; b: string }> = ({ kind, a, b }) => {
  const common = { viewBox: '0 0 160 56', className: 'w-full h-14', 'aria-hidden': true } as const;
  switch (kind) {
    case 'progress':
      return (
        <svg {...common}>
          {[0.82, 0.58, 0.36].map((w, i) => (
            <g key={i}>
              <rect x="0" y={6 + i * 17} width="160" height="8" rx="4" fill="#e2e8f0" />
              <rect className="ill-grow-x" style={{ animationDelay: `${0.4 + i * 0.2}s` }} x="0" y={6 + i * 17} width={160 * w} height="8" rx="4" fill={i === 0 ? a : b} />
            </g>
          ))}
        </svg>
      );
    case 'bars':
      return (
        <svg {...common}>
          {[0.35, 0.5, 0.42, 0.68, 0.6, 0.9].map((h, i) => (
            <rect key={i} className="ill-grow-y" style={{ animationDelay: `${0.3 + i * 0.1}s` }} x={6 + i * 26} y={56 - h * 52} width="16" height={h * 52} rx="3" fill={i === 5 ? a : b} />
          ))}
        </svg>
      );
    case 'line':
      return (
        <svg {...common}>
          <path d="M0 46 L26 38 L52 42 L78 26 L104 30 L130 14 L160 8 L160 56 L0 56 Z" fill={b} opacity="0.18" />
          <path className="ill-stroke" d="M0 46 L26 38 L52 42 L78 26 L104 30 L130 14 L160 8" fill="none" stroke={a} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="160" cy="8" r="4" fill={a} className="ill-pop" style={{ animationDelay: '1.4s' }} />
        </svg>
      );
    case 'ecg':
      return (
        <svg {...common}>
          <g className="ill-ecg">
            {[0, 160].map((x) => (
              <path key={x} transform={`translate(${x} 0)`} d="M0 32 L30 32 L38 26 L44 32 L54 32 L60 8 L66 50 L72 32 L96 32 L104 24 L112 32 L160 32" fill="none" stroke={a} strokeWidth="2.5" strokeLinejoin="round" />
            ))}
          </g>
        </svg>
      );
    case 'code':
      return (
        <svg {...common}>
          {[[0, 0.72, a], [12, 0.5, b], [12, 0.62, '#94a3b8'], [0, 0.34, a]].map(([x, w, c], i) => (
            <rect key={i} className="ill-grow-x" style={{ animationDelay: `${0.3 + i * 0.35}s` }} x={x as number} y={4 + i * 13} width={(160 - (x as number)) * (w as number)} height="7" rx="3.5" fill={c as string} />
          ))}
          <rect className="ill-blink" x="64" y="43" width="3" height="10" fill={a} />
        </svg>
      );
    case 'pie':
      return (
        <svg {...common}>
          <g transform="translate(28 28)">
            <g className="ill-spin-slow">
              <circle r="20" fill="none" stroke="#e2e8f0" strokeWidth="9" />
              <circle r="20" fill="none" stroke={a} strokeWidth="9" strokeDasharray="70 126" />
              <circle r="20" fill="none" stroke={b} strokeWidth="9" strokeDasharray="34 126" strokeDashoffset="-70" />
            </g>
          </g>
          {[[a, 0.8], [b, 0.55], ['#94a3b8', 0.35]].map(([c, w], i) => (
            <g key={i}>
              <circle cx="66" cy={12 + i * 16} r="4" fill={c as string} />
              <rect className="ill-grow-x" style={{ animationDelay: `${0.3 + i * 0.15}s` }} x="76" y={9 + i * 16} width={84 * (w as number)} height="6" rx="3" fill="#cbd5e1" />
            </g>
          ))}
        </svg>
      );
    case 'wave':
      return (
        <svg {...common}>
          {Array.from({ length: 20 }).map((_, i) => (
            <rect key={i} className="ill-wave" style={{ animationDelay: `${(i % 7) * 0.12}s` }} x={2 + i * 8} y="8" width="4" height="40" rx="2" fill={i % 3 ? b : a} />
          ))}
        </svg>
      );
    case 'blueprint':
      return (
        <svg {...common}>
          <rect x="0" y="0" width="160" height="56" rx="6" fill="#1e3a8a" />
          <g stroke="#ffffff" strokeWidth="1.6" fill="none" className="ill-stroke">
            <rect x="12" y="10" width="62" height="36" />
            <rect x="74" y="20" width="40" height="26" />
            <path d="M12 10 L43 2 L74 10" />
            <circle cx="132" cy="30" r="12" />
          </g>
        </svg>
      );
  }
};

/** Ilustración plana animada de la carrera (estilo web moderna). */
export const CareerIllustration: React.FC<{ scene: SceneId }> = ({ scene }) => {
  const ill = ILL[scene];
  const th = CAREER_THEMES[scene];
  const a = th.accent;
  const b = th.accent2;
  const Main = ill.main;
  // fichas sobre la órbita (centro 29 % / 47 %)
  const chipPos = [
    { left: '3%', top: '11.7%' },
    { left: '44%', top: '11.7%' },
    { left: '3%', top: '62.7%' },
    { left: '44%', top: '62.7%' },
  ];
  return (
    <div key={scene} className="ill-stage" aria-hidden>
      {/* formas de fondo */}
      <div className="ill-blob" style={{ left: '8%', top: '6%', width: '52%', paddingTop: '52%', background: `${b}33` }} />
      <div className="ill-blob ill-blob-2" style={{ right: '2%', top: '-6%', width: '28%', paddingTop: '28%', background: '#ffffff14', borderRadius: '28%' }} />
      <svg className="ill-dots" viewBox="0 0 100 60" preserveAspectRatio="none">
        <defs>
          <pattern id={`dots-${scene}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="#ffffff" opacity="0.35" />
          </pattern>
        </defs>
        <rect x="55" y="30" width="45" height="30" fill={`url(#dots-${scene})`} />
      </svg>
      {/* órbita + icono principal */}
      <svg className="ill-orbit" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="2 3" />
      </svg>
      <div className="ill-badge" style={{ boxShadow: `0 20px 60px -20px ${a}` }}>
        <span className="ill-badge-inner" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
          <Main className="ill-draw w-[52%] h-[52%] text-white" strokeWidth={1.6} />
        </span>
      </div>
      {ill.chips.map((C, i) => (
        <div key={i} className="ill-chip" style={{ ...chipPos[i], color: i % 2 ? b : a, animationDelay: `${0.5 + i * 0.12}s, ${i * 0.6}s` }}>
          <C className="w-[55%] h-[55%]" strokeWidth={2} />
        </div>
      ))}
      {/* tarjeta con datos */}
      <div className="ill-card">
        <div className="flex items-center gap-2">
          <span className="ill-card-dot" style={{ background: a }} />
          <p className="ill-card-title">{ill.card.title}</p>
        </div>
        <p className="ill-card-sub">{ill.card.sub}</p>
        <VizSvg kind={ill.card.viz} a={a} b={b} />
      </div>
    </div>
  );
};
