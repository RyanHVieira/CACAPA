import React, { useRef, useEffect } from 'react';
import type { Card } from '../../game/cards/Card';

export const getJokerBottleTheme = (card: Card) => {
  const id = card.id?.toLowerCase() || '';
  if (id.includes('blue') || id.includes('chalk')) {
    return { top: '#38bdf8', bottom: '#0284c7', glow: 'rgba(56, 189, 248, 0.75)' };
  }
  if (id.includes('groselha')) {
    return { top: '#fb7185', bottom: '#e11d48', glow: 'rgba(251, 113, 133, 0.75)' };
  }
  if (id.includes('billiard') || id.includes('green')) {
    return { top: '#4ade80', bottom: '#16a34a', glow: 'rgba(74, 222, 128, 0.75)' };
  }
  if (id.includes('eight') || id.includes('oito')) {
    return { top: '#a5b4fc', bottom: '#4338ca', glow: 'rgba(165, 180, 252, 0.75)' };
  }
  if (id.includes('gold') || id.includes('pocket') || id.includes('digger')) {
    return { top: '#fef08a', bottom: '#ca8a04', glow: 'rgba(254, 240, 138, 0.85)' };
  }
  if (id.includes('baron') || id.includes('tarot')) {
    return { top: '#d8b4fe', bottom: '#7e22ce', glow: 'rgba(216, 180, 254, 0.75)' };
  }
  if (id.includes('bull') || id.includes('burning')) {
    return { top: '#fdba74', bottom: '#ea580c', glow: 'rgba(253, 186, 116, 0.75)' };
  }
  return { top: '#fcd34d', bottom: '#b45309', glow: 'rgba(252, 211, 77, 0.75)' };
};

// Silhueta clássica da Garrafa da Loja (BP)
export const createBottlePath = (): Path2D => {
  const p = new Path2D();
  p.moveTo(-22, 0);
  p.lineTo(-24, -20);
  p.bezierCurveTo(-38, -45, -38, -95, -36, -115);
  p.bezierCurveTo(-35, -135, -20, -150, -10.5, -165);
  p.lineTo(-10.5, -180);
  p.lineTo(-13.5, -181);
  p.lineTo(-13.5, -188);
  p.lineTo(13.5, -188);
  p.lineTo(13.5, -181);
  p.lineTo(10.5, -180);
  p.lineTo(10.5, -165);
  p.bezierCurveTo(20, -150, 35, -135, 36, -115);
  p.bezierCurveTo(38, -95, 38, -45, 24, -20);
  p.lineTo(22, 0);
  p.closePath();
  return p;
};

const BOTTLE_PATH = createBottlePath();

/* ------------------------------------------------------------------ */
/* Ticker compartilhado: 1 único rAF para TODAS as garrafas            */
/* ------------------------------------------------------------------ */
interface Sub {
  draw: (sec: number) => void;
  visible: boolean;
}
const subs = new Set<Sub>();
let rafId = 0;
let lastTick = 0;
const FRAME_MS = 1000 / 30; // 30fps é suficiente p/ animação sutil

const tick = (now: number) => {
  rafId = requestAnimationFrame(tick);
  if (document.hidden || now - lastTick < FRAME_MS - 1) return;
  lastTick = now;
  const sec = now / 1000;
  subs.forEach((s) => s.visible && s.draw(sec));
};

const subscribe = (s: Sub) => {
  subs.add(s);
  if (subs.size === 1) rafId = requestAnimationFrame(tick);
  return () => {
    subs.delete(s);
    if (subs.size === 0) cancelAnimationFrame(rafId);
  };
};

/* ------------------------------------------------------------------ */
/* Sprites estáticos em cache (renderizados 1x, desenhados N vezes)    */
/* ------------------------------------------------------------------ */
const Q = 2; // qualidade do sprite (px por unidade lógica)
const SW = 160, SH = 260; // tamanho lógico do sprite
const OX = 80, OY = 235; // origem (base da garrafa) dentro do sprite

const makeSprite = (draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = SW * Q;
  c.height = SH * Q;
  const g = c.getContext('2d')!;
  g.scale(Q, Q);
  g.translate(OX, OY);
  draw(g);
  return c;
};

const backCache = new Map<boolean, HTMLCanvasElement>();
const getBack = (legendary: boolean) => {
  let s = backCache.get(legendary);
  if (s) return s;
  s = makeSprite((g) => {
    // Sombra na base
    g.beginPath();
    g.ellipse(0, 4, 30, 8, 0, 0, Math.PI * 2);
    g.fillStyle = 'rgba(0, 0, 0, 0.45)';
    g.fill();

    g.save();
    g.clip(BOTTLE_PATH);

    // Vidro translúcido
    const glass = g.createLinearGradient(-36, 0, 36, 0);
    const c = legendary ? '255, 232, 160' : '205, 236, 226';
    const a = legendary ? [0.55, 0.3, 0.22, 0.55] : [0.5, 0.28, 0.2, 0.5];
    glass.addColorStop(0.0, `rgba(${c}, ${a[0]})`);
    glass.addColorStop(0.28, `rgba(${c}, ${a[1]})`);
    glass.addColorStop(0.65, `rgba(${c}, ${a[2]})`);
    glass.addColorStop(1.0, `rgba(${c}, ${a[3]})`);
    g.fillStyle = glass;
    g.fillRect(-45, -200, 90, 210);

    // Fundo espesso (punt)
    g.fillStyle = 'rgba(255, 255, 255, 0.18)';
    g.beginPath();
    g.ellipse(0, -6, 22, 6, 0, 0, Math.PI);
    g.fill();

    g.restore();
  });
  backCache.set(legendary, s);
  return s;
};

const frontCache = new Map<boolean, HTMLCanvasElement>();
const getFront = (legendary: boolean) => {
  let s = frontCache.get(legendary);
  if (s) return s;
  s = makeSprite((g) => {
    // Parede de vidro interna
    g.save();
    g.scale(0.88, 0.97);
    g.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    g.lineWidth = 1.8;
    g.stroke(BOTTLE_PATH);
    g.restore();

    // Rolha
    g.fillStyle = legendary ? '#d97706' : '#b07d4b';
    g.beginPath();
    g.roundRect(-8, -198, 16, 12, 2);
    g.fill();
    g.strokeStyle = '#0b0710';
    g.lineWidth = 2.2;
    g.stroke();

    g.strokeStyle = 'rgba(11, 7, 16, 0.35)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(-5, -193);
    g.lineTo(4, -193);
    g.moveTo(-3, -190);
    g.lineTo(6, -190);
    g.stroke();

    // Colarinho dourado
    if (legendary) {
      g.fillStyle = '#ffd700';
      g.fillRect(-10.5, -174, 21, 6);
      g.strokeStyle = '#0b0710';
      g.lineWidth = 1.5;
      g.strokeRect(-10.5, -174, 21, 6);
    }

    // Contorno cartoon
    g.strokeStyle = '#0b0710';
    g.lineWidth = 3.2;
    g.stroke(BOTTLE_PATH);

    // Selo lendário
    if (legendary) {
      g.font = '700 9px Oswald, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#ffd700';
      g.strokeStyle = '#0b0710';
      g.lineWidth = 2.5;
      g.strokeText('★ LENDÁRIO', 0, -208);
      g.fillText('★ LENDÁRIO', 0, -208);
    }
  });
  frontCache.set(legendary, s);
  return s;
};

// Brilho (o shadowBlur caro acontece UMA vez, não a cada frame)
const glowCache = new Map<string, HTMLCanvasElement>();
const getGlow = (shadow: string, stroke: string, blur: number) => {
  const key = `${shadow}|${stroke}|${blur}`;
  let s = glowCache.get(key);
  if (s) return s;
  s = makeSprite((g) => {
    g.shadowColor = shadow;
    g.shadowBlur = blur * Q; // shadowBlur não é afetado pelo scale()
    g.strokeStyle = stroke;
    g.lineWidth = 3;
    g.stroke(BOTTLE_PATH);
  });
  glowCache.set(key, s);
  return s;
};

// Textura "plana" do rótulo (ícone + nome), fatiada depois com drawImage
const LW = 56, LH = 58;
const labelCache = new Map<string, HTMLCanvasElement>();
const getLabel = (icon: string, name: string, legendary: boolean) => {
  const key = `${icon}|${name}|${legendary}`;
  let c = labelCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = LW * Q;
  c.height = LH * Q;
  const g = c.getContext('2d')!;
  g.scale(Q, Q);
  g.translate(LW / 2, 0); // s = -28 → x = 0

  g.fillStyle = '#f4ecd8';
  g.fillRect(-28, 0, 56, 58);

  g.fillStyle = '#1b1226';
  g.fillRect(-23, 4, 46, 50);

  if (legendary) {
    g.strokeStyle = '#ffd700';
    g.lineWidth = 1.2;
    g.strokeRect(-23, 4, 46, 50);
  }

  g.font = '22px sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(icon, 0, 24);

  g.font = '700 9px Oswald, sans-serif';
  g.fillStyle = legendary ? '#ffd700' : '#fef08a';
  g.fillText(name, 0, 44, 44);

  labelCache.set(key, c);
  return c;
};

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
interface JokerBottleCanvasProps {
  card: Card;
  width?: number;
  height?: number;
  isHovered?: boolean;
  isActivating?: boolean;
  className?: string;
}

const R0 = 33;
const SE = [-28, -9.5, 9.5, 28];
const clampAngle = (a: number) => Math.min(1.5, Math.max(-1.5, a));

export const JokerBottleCanvas: React.FC<JokerBottleCanvasProps> = ({
  card,
  width = 80,
  height = 120,
  isHovered = false,
  isActivating = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // hover/ativação via ref: mudar isso NÃO reinicia o loop
  const stateRef = useRef({ isHovered, isActivating });
  stateRef.current = { isHovered, isActivating };

  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = getJokerBottleTheme(card);
    const legendary = card.rarity === 'Lendária' || card.edition !== 'Base';
    const phase = Math.random() * 50;

    const W = canvas.width;
    const H = canvas.height;
    const scale = (H * 0.88) / 215;
    const bx = W / 2;
    const by = H * 0.94;

    // Gradientes criados UMA vez
    const liq = ctx.createLinearGradient(-36, 0, 36, 0);
    liq.addColorStop(0.0, theme.bottom);
    liq.addColorStop(0.3, theme.top);
    liq.addColorStop(0.7, theme.bottom);
    liq.addColorStop(1.0, '#100518');

    const vGrad = ctx.createLinearGradient(0, -118, 0, 0);
    vGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    vGrad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');

    let back: HTMLCanvasElement;
    let front: HTMLCanvasElement;
    let label: HTMLCanvasElement;

    const draw = (sec: number) => {
      const t = phase + sec * 2.1; // ≈ mesma velocidade do t += 0.035 @60fps
      const { isHovered: hov, isActivating: act } = stateRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.save();

      const floatY = hov ? -4 : act ? -8 : 0;
      const wobble = hov ? Math.sin(t * 3) * 0.03 : 0;
      ctx.translate(bx, by + floatY);
      ctx.rotate(wobble);
      ctx.scale(scale, scale);

      // Glow (sprite pronto)
      if (legendary || hov || act) {
        const blur = act ? 30 : hov ? 20 : 12;
        const glow = getGlow(
          legendary ? '#ffd700' : theme.glow,
          legendary ? 'rgba(255, 215, 0, 0.6)' : theme.glow,
          blur
        );
        ctx.drawImage(glow, -OX, -OY, SW, SH);
      }

      // Sombra + vidro (sprite pronto)
      ctx.drawImage(back, -OX, -OY, SW, SH);

      // ---- Conteúdo dinâmico (único clip por frame) ----
      ctx.save();
      ctx.clip(BOTTLE_PATH);

      // Líquido
      const ly = -118 + Math.sin(t * 1.5) * 1.5;
      ctx.fillStyle = liq;
      ctx.fillRect(-45, ly, 90, -ly);
      ctx.fillStyle = vGrad;
      ctx.fillRect(-45, ly, 90, -ly);

      // Menisco
      ctx.save();
      ctx.translate(0, ly);
      ctx.rotate(Math.sin(t * 1.2) * 0.035);
      ctx.beginPath();
      ctx.ellipse(0, 0, 27, 3.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme.top;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Bolhas
      ctx.fillStyle = '#fff';
      for (let b = 0; b < 5; b++) {
        const yb = -((t * 15 + b * 22) % (-ly - 8));
        const xb = Math.sin(b * 3.1 + t * 0.8) * (14 + b);
        ctx.globalAlpha = 0.45 * Math.max(0, 1 + yb / -ly);
        ctx.beginPath();
        ctx.arc(xb, yb, 1.2 + (b % 2) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Rótulo cilíndrico: fatias via drawImage (sem texto, sem clip, sem scale)
      const TH = 0.3 * Math.sin(t * 0.6);
      ctx.fillStyle = '#0b0710';
      for (let i = 0; i < 3; i++) {
        const s0 = SE[i];
        const s1 = SE[i + 1];
        const x0 = R0 * Math.sin(clampAngle(s0 / R0 + TH));
        const x1 = R0 * Math.sin(clampAngle(s1 / R0 + TH));
        if (x1 <= x0) continue;

        const dx = x0 - 0.25;
        const dw = x1 - x0 + 0.5;
        ctx.drawImage(label, (s0 + 28) * Q, 0, (s1 - s0) * Q, LH * Q, dx, -95, dw, 58);

        const mid = ((s0 + s1) * 0.5) / R0 + TH;
        ctx.globalAlpha = Math.max(0, (1 - Math.cos(mid)) * 0.7);
        ctx.fillRect(dx, -95, dw, 58);
        ctx.globalAlpha = 1;
      }

      // Bordas do papel
      const lx0 = R0 * Math.sin(clampAngle(SE[0] / R0 + TH));
      const lx1 = R0 * Math.sin(clampAngle(SE[3] / R0 + TH));
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lx0, -95);
      ctx.lineTo(lx0, -37);
      ctx.moveTo(lx1, -95);
      ctx.lineTo(lx1, -37);
      ctx.stroke();

      // Reflexos
      const hs = TH * 1.6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
      ctx.fillRect(-24 + hs, -120, 5, 88);
      ctx.fillRect(-7, -170, 3, 45);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(28, -115, 2.5, 85);

      ctx.restore(); // fecha clip

      // Parede interna, rolha, colarinho, contorno, selo (sprite pronto)
      ctx.drawImage(front, -OX, -OY, SW, SH);

      ctx.restore();
    };

    const sub: Sub = { draw, visible: true };

    // Só desenha quando está na tela
    const io = new IntersectionObserver(([e]) => {
      sub.visible = e.isIntersecting;
    });
    io.observe(canvas);

    let cancelled = false;
    let unsub = () => {};

    // Garante que a fonte Oswald carregou antes de "assar" o rótulo
    Promise.resolve(document.fonts?.load('700 9px Oswald'))
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        back = getBack(legendary);
        front = getFront(legendary);
        label = getLabel(card.icon || '🃏', card.name, legendary);
        unsub = subscribe(sub);
      });

    return () => {
      cancelled = true;
      io.disconnect();
      unsub();
    };
  }, [card.id, card.name, card.icon, card.rarity, card.edition, width, height, dpr]);

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(width * dpr)}
      height={Math.round(height * dpr)}
      style={{ width: `${width}px`, height: `${height}px` }}
      // removido drop-shadow CSS: filtro em canvas animado re-rasteriza todo frame
      className={`select-none pointer-events-none ${className}`}
    />
  );
};