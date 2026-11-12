import React, { useRef, useEffect } from 'react';
import type { Card } from '../../game/cards/Card';

export const adjustHex = (hex: string, amount: number): string => {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const getJokerBottleTheme = (card: Card) => {
  const id = (card.id || '').toLowerCase();
  const name = (card.name || '').toLowerCase();

  // 1. Giz Azul (Blue Chalk) - Azul piscina / giz elétrico de bilhar
  if (id.includes('chalk') || id === 'giz' || name.includes('giz')) {
    return { top: '#38bdf8', bottom: '#0284c7', glow: 'rgba(56, 189, 248, 0.85)' };
  }

  // 2. Coringa Groselha (Groselha) - Xarope doce de groselha clássico de boteco
  if (id.includes('groselha') || name.includes('groselha')) {
    return { top: '#fb7185', bottom: '#9f1239', glow: 'rgba(251, 113, 133, 0.85)' };
  }

  // 3. Saco de Fichas (Billiard / Fichas) - Verde feltro de mesa de sinuca
  if (id.includes('billiard') || name.includes('fichas') || name.includes('bilhar')) {
    return { top: '#4ade80', bottom: '#15803d', glow: 'rgba(74, 222, 128, 0.85)' };
  }

  // 4. Coringa Fiel (Jolly Joker) - Vermelho carmesim / bordô teatral de coringa
  if (id.includes('jolly') || name.includes('fiel')) {
    return { top: '#f43f5e', bottom: '#881337', glow: 'rgba(244, 63, 94, 0.85)' };
  }

  // 5. Oito da Sorte / Bola Oito (Lucky Eight / 8-Ball) - Índigo místico / oráculo cósmico
  if (id.includes('eight') || id === 'b8' || name.includes('oito')) {
    return { top: '#a78bfa', bottom: '#312e81', glow: 'rgba(167, 139, 250, 0.85)' };
  }

  // 6. Mira Laser (Telescope) - Feixe laser vermelho neon cyber
  if (id.includes('telescope') || name.includes('laser') || name.includes('mira')) {
    return { top: '#ff3366', bottom: '#990026', glow: 'rgba(255, 51, 102, 0.9)' };
  }

  // 7. Caçapa de Ouro (Golden Pocket) - Ouro líquido âmbar cintilante
  if (id.includes('golden_pocket') || name.includes('caçapa de ouro')) {
    return { top: '#fef08a', bottom: '#ca8a04', glow: 'rgba(254, 240, 138, 0.9)' };
  }

  // 8. Barão do Feltro (Baron) - Veludo nobre púrpura e ametista imperial
  if (id.includes('baron') || name.includes('barão')) {
    return { top: '#d8b4fe', bottom: '#581c87', glow: 'rgba(216, 180, 254, 0.85)' };
  }

  // 9. Dueto Perfeito / Dobradinha (Duet) - Turquesa elétrico / água-marinha em harmonia
  if (id.includes('duet') || id === 'dob' || name.includes('dueto') || name.includes('dobradinha')) {
    return { top: '#2dd4bf', bottom: '#0f766e', glow: 'rgba(45, 212, 191, 0.85)' };
  }

  // 10. Touro Financeiro (Bull) - Conhaque âmbar defumado / cobre de Wall Street
  if (id.includes('bull') || name.includes('touro')) {
    return { top: '#fb923c', bottom: '#9a3412', glow: 'rgba(251, 146, 60, 0.85)' };
  }

  // 11. Lisas de Aço (Solid Steel) - Amarelo metálico brilhante das bolas lisas (1-7)
  if (id.includes('solid_steel') || name.includes('lisas de aço')) {
    return { top: '#fef08a', bottom: '#eab308', glow: 'rgba(254, 240, 138, 0.85)' };
  }

  // 12. Listradas em Chamas (Burning Stripes) - Magma vulcânico e labaredas ardentes
  if (id.includes('burning') || name.includes('chamas')) {
    return { top: '#ff7a1f', bottom: '#b91c1c', glow: 'rgba(255, 122, 31, 0.9)' };
  }

  // 13. O Bruxo da Sinuca (Wizard Cue) - Lendário: Elixir arcano magenta e estrelas violetas
  if (id.includes('wizard') || name.includes('bruxo')) {
    return { top: '#e879f9', bottom: '#6b21a8', glow: 'rgba(232, 121, 249, 0.95)' };
  }

  // 14. Garimpeiro de Ouro (Gold Digger) - Ouro bruto de pepita e mel âmbar mineral
  if (id.includes('digger') || name.includes('garimpeiro')) {
    return { top: '#facc15', bottom: '#78350f', glow: 'rgba(250, 204, 21, 0.85)' };
  }

  // 15. Tabelinha (tab) - Ciano lago tropical
  if (id === 'tab' || name.includes('tabelinha')) {
    return { top: '#67e8f9', bottom: '#0e7490', glow: 'rgba(103, 232, 249, 0.85)' };
  }

  // 16. Mão Firme (mao) - Verde menta equilibrado
  if (id === 'mao' || name.includes('mão firme')) {
    return { top: '#86efac', bottom: '#15803d', glow: 'rgba(134, 239, 172, 0.85)' };
  }

  // 17. Banqueiro / Banco Central (bnk, bcc) - Ouro da reserva bancária
  if (id === 'bnk' || id === 'bcc' || name.includes('banco') || name.includes('banqueiro')) {
    return { top: '#fde047', bottom: '#a16207', glow: 'rgba(253, 224, 71, 0.85)' };
  }

  // 18. Abertura (pri) - Rosa chiclete / orquídea vibrante
  if (id === 'pri' || name.includes('abertura')) {
    return { top: '#f472b6', bottom: '#9d174d', glow: 'rgba(244, 114, 182, 0.85)' };
  }

  // 19. Trinca (tri) - Roxo elétrico púrpura
  if (id === 'tri' || name.includes('trinca')) {
    return { top: '#c084fc', bottom: '#6b21a8', glow: 'rgba(192, 132, 252, 0.85)' };
  }

  // 20. Taco Liso / Faxina (lis, fax) - Jade esmeralda limpa
  if (id === 'lis' || id === 'fax' || name.includes('taco liso') || name.includes('faxina')) {
    return { top: '#5eead4', bottom: '#0f766e', glow: 'rgba(94, 234, 212, 0.85)' };
  }

  // 21. Cofrinho (cof) - Âmbar dourado de moedas
  if (id === 'cof' || name.includes('cofrinho')) {
    return { top: '#fed7aa', bottom: '#b45309', glow: 'rgba(254, 215, 170, 0.85)' };
  }

  // 22. Quina (qui) - Verde escuro de quina de mesa
  if (id === 'qui' || name.includes('quina')) {
    return { top: '#4ade80', bottom: '#14532d', glow: 'rgba(74, 222, 128, 0.85)' };
  }

  // 23. Lateral (lat) - Âmbar mel lateral
  if (id === 'lat' || name.includes('lateral')) {
    return { top: '#fde68a', bottom: '#d97706', glow: 'rgba(253, 230, 138, 0.85)' };
  }

  // 24. Par ou Ímpar (par) - Vermelho cassino / aposta
  if (id === 'par' || name.includes('par ou ímpar')) {
    return { top: '#f87171', bottom: '#991b1b', glow: 'rgba(248, 113, 113, 0.85)' };
  }

  // 25. Listradas (lsd) - Azul cobalto náutico
  if (id === 'lsd' || name.includes('listradas')) {
    return { top: '#60a5fa', bottom: '#1e3a8a', glow: 'rgba(96, 165, 250, 0.85)' };
  }

  // 26. Relógio (rel) - Bronze antigo / uísque carvalho
  if (id === 'rel' || name.includes('relógio')) {
    return { top: '#d97706', bottom: '#451a03', glow: 'rgba(217, 119, 6, 0.85)' };
  }

  // 27. Sabor (sabor) - Curaçao Blue / licor azul brilhante
  if (id === 'sabor' || name.includes('sabor')) {
    return { top: '#7dd3fc', bottom: '#0369a1', glow: 'rgba(125, 211, 252, 0.9)' };
  }

  // 28. Lendárias do config:
  if (id === 'rei' || name.includes('rei da mesa')) {
    return { top: '#d8b4fe', bottom: '#4c1d95', glow: 'rgba(216, 180, 254, 0.95)' };
  }
  if (id === 'mid' || name.includes('midas')) {
    return { top: '#fde047', bottom: '#854d0e', glow: 'rgba(253, 224, 71, 0.95)' };
  }
  if (id === 'cho' || name.includes('chuva')) {
    return { top: '#60a5fa', bottom: '#1d4ed8', glow: 'rgba(96, 165, 250, 0.95)' };
  }
  if (id === 'inf' || name.includes('infinito')) {
    return { top: '#34d399', bottom: '#064e3b', glow: 'rgba(52, 211, 153, 0.95)' };
  }
  if (id === 'cmb' || id === 'cer' || name.includes('combo') || name.includes('cerco')) {
    return { top: '#f87171', bottom: '#7f1d1d', glow: 'rgba(248, 113, 113, 0.95)' };
  }
  if (id === 'sup' || name.includes('supernova')) {
    return { top: '#fed7aa', bottom: '#c2410c', glow: 'rgba(254, 215, 170, 0.95)' };
  }
  if (id === 'nec' || name.includes('necronomicon')) {
    return { top: '#86efac', bottom: '#14532d', glow: 'rgba(134, 239, 172, 0.95)' };
  }
  if (id === 'aln' || name.includes('all in')) {
    return { top: '#ef4444', bottom: '#450a0a', glow: 'rgba(239, 68, 68, 0.95)' };
  }

  // 29. Tarôs (Tarot cards):
  if (id.includes('tarot') || (card as unknown as { type?: string }).type === 'Tarot') {
    if (id.includes('empress') || name.includes('imperatriz')) {
      return { top: '#f472b6', bottom: '#831843', glow: 'rgba(244, 114, 182, 0.85)' };
    }
    if (id.includes('magician') || name.includes('mago')) {
      return { top: '#c084fc', bottom: '#581c87', glow: 'rgba(192, 132, 252, 0.85)' };
    }
    if (id.includes('chariot') || name.includes('carro')) {
      return { top: '#94a3b8', bottom: '#334155', glow: 'rgba(148, 163, 184, 0.85)' };
    }
    if (id.includes('hermit') || name.includes('eremita')) {
      return { top: '#60a5fa', bottom: '#1e3a8a', glow: 'rgba(96, 165, 250, 0.85)' };
    }
    if (id.includes('fool') || name.includes('louco')) {
      return { top: '#f43f5e', bottom: '#4c1d95', glow: 'rgba(244, 63, 94, 0.85)' };
    }
    if (id.includes('wheel') || name.includes('roda')) {
      return { top: '#fbbf24', bottom: '#b45309', glow: 'rgba(251, 191, 36, 0.85)' };
    }
    return { top: '#d8b4fe', bottom: '#7e22ce', glow: 'rgba(216, 180, 254, 0.85)' };
  }

  // 30. Se o card possui cor explícita (como CacapaJokerCard.color):
  const explicitColor = (card as unknown as { color?: string }).color;
  if (typeof explicitColor === 'string' && explicitColor.startsWith('#')) {
    return {
      top: adjustHex(explicitColor, 50),
      bottom: adjustHex(explicitColor, -45),
      glow: explicitColor,
    };
  }

  // Fallback padrão: Cerveja / licor âmbar clássico de bar
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

export const BOTTLE_PATH = createBottlePath();

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
export const Q = 2; // qualidade do sprite (px por unidade lógica)
export const SW = 160, SH = 260; // tamanho lógico do sprite
export const OX = 80, OY = 235; // origem (base da garrafa) dentro do sprite

export const makeSprite = (draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement('canvas');
  c.width = SW * Q;
  c.height = SH * Q;
  const g = c.getContext('2d')!;
  g.scale(Q, Q);
  g.translate(OX, OY);
  draw(g);
  return c;
};

export const backCache = new Map<boolean, HTMLCanvasElement>();
export const getBack = (legendary: boolean) => {
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

export const frontCache = new Map<boolean, HTMLCanvasElement>();
export const getFront = (legendary: boolean) => {
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
export const glowCache = new Map<string, HTMLCanvasElement>();
export const getGlow = (shadow: string, stroke: string, blur: number) => {
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
export const LW = 56, LH = 58;
export const labelCache = new Map<string, HTMLCanvasElement>();
export const getLabel = (icon: string, name: string, legendary: boolean) => {
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
/* Função pura de desenho de Garrafa Coringa para uso em qualquer Canvas */
/* ------------------------------------------------------------------ */
export interface DrawBottleOptions {
  rot?: number;
  floatY?: number;
  isHovered?: boolean;
  isActivating?: boolean;
  isDragging?: boolean;
  dimmed?: boolean;
  phase?: number;
  t?: number;
}

export const drawBottle = (
  ctx: CanvasRenderingContext2D,
  card: Card,
  x: number,
  baseY: number,
  scale: number,
  opts: DrawBottleOptions = {}
) => {
  const theme = getJokerBottleTheme(card);
  const isLegendary =
    card.rarity === 'Lendária' ||
    (card.rarity as string)?.toLowerCase().includes('lend') ||
    card.edition !== 'Base';

  const t = opts.t !== undefined ? opts.t : (performance.now() / 1000) * 2.1;
  const ph = opts.phase ?? ((card.cost || 5) * 1.7);
  const hov = !!opts.isHovered;
  const act = !!opts.isActivating;
  const drag = !!opts.isDragging;

  const floatY = (opts.floatY ?? 0) + (hov ? -4 : act ? -8 : 0);
  const rot = (opts.rot ?? 0) + (hov && !drag ? Math.sin(t * 3 + ph) * 0.03 : 0);

  // 1. Glow (sprite em cache)
  if (isLegendary || hov || act || drag) {
    const blur = act ? 30 : drag ? 24 : hov ? 20 : 12;
    const glow = getGlow(
      isLegendary ? '#ffd700' : theme.glow,
      isLegendary ? 'rgba(255, 215, 0, 0.6)' : theme.glow,
      blur
    );
    ctx.save();
    ctx.translate(x, baseY + floatY);
    ctx.rotate(rot);
    ctx.scale(scale, scale);
    ctx.drawImage(glow, -OX, -OY, SW, SH);
    ctx.restore();
  }

  // 2. Base da Garrafa com transform
  ctx.save();
  ctx.translate(x, baseY + floatY);
  ctx.rotate(rot);
  ctx.scale(scale, scale);

  if (opts.dimmed) {
    ctx.globalAlpha = 0.85;
  }

  // 3. Sombra + Vidro traseiro
  const back = getBack(isLegendary);
  ctx.drawImage(back, -OX, -OY, SW, SH);

  // 4. Conteúdo dinâmico com clip único
  ctx.save();
  ctx.clip(BOTTLE_PATH);

  // Líquido temático
  const ly = -118 + Math.sin(t * 1.5 + ph) * 1.5;
  const liq = ctx.createLinearGradient(-36, 0, 36, 0);
  liq.addColorStop(0.0, theme.bottom);
  liq.addColorStop(0.3, theme.top);
  liq.addColorStop(0.7, theme.bottom);
  liq.addColorStop(1.0, '#100518');
  ctx.fillStyle = liq;
  ctx.fillRect(-45, ly, 90, -ly);

  const vGrad = ctx.createLinearGradient(0, -118, 0, 0);
  vGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  vGrad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(-45, ly, 90, -ly);

  // Menisco
  ctx.save();
  ctx.translate(0, ly);
  ctx.rotate(Math.sin(t * 1.2 + ph) * 0.035);
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
    const yb = -((t * 15 + b * 22 + ph * 10) % (-ly - 8));
    const xb = Math.sin(b * 3.1 + t * 0.8 + ph) * (14 + b);
    ctx.globalAlpha = 0.45 * Math.max(0, 1 + yb / -ly);
    ctx.beginPath();
    ctx.arc(xb, yb, 1.2 + (b % 2) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Rótulo cilíndrico
  const TH = 0.3 * Math.sin(t * 0.6 + ph);
  const label = getLabel(card.icon || '🃏', card.name, isLegendary);
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

  ctx.restore(); // Fecha clip

  // 5. Vidro frontal + rolha + colarinho + selo
  const front = getFront(isLegendary);
  ctx.drawImage(front, -OX, -OY, SW, SH);

  ctx.restore();
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

export const R0 = 33;
export const SE = [-28, -9.5, 9.5, 28];
export const clampAngle = (a: number) => Math.min(1.5, Math.max(-1.5, a));

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

    const phase = Math.random() * 50;

    const W = canvas.width;
    const H = canvas.height;
    const scale = (H * 0.88) / 215;
    const bx = W / 2;
    const by = H * 0.94;

    const draw = (sec: number) => {
      const { isHovered: hov, isActivating: act } = stateRef.current;
      ctx.clearRect(0, 0, W, H);
      drawBottle(ctx, card, bx, by, scale, {
        isHovered: hov,
        isActivating: act,
        phase,
        t: sec * 2.1,
      });
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
        const legendary = card.rarity === 'Lendária' || card.edition !== 'Base';
        getBack(legendary);
        getFront(legendary);
        getLabel(card.icon || '🃏', card.name, legendary);
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