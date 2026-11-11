import React, { useRef, useEffect, useState } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { Card } from '../../game/cards/Card';
import { BallRackModal } from './BallRackModal';
import { PAL } from '../../game/config/gameConfig';
import { draw3DBall, createPreviewMatrix } from '../../game/models/Ball';
import { BallCanvasPreview } from './BallCanvasPreview';

interface CacapaShopProps {
  engine: CacapaPoolEngine;
  onNextRound: () => void;
  onUpdate: () => void;
  onOpenMenu?: () => void;
}

const getJokerBottleTheme = (card: Card) => {
  const id = card.id.toLowerCase();
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

// Silhueta geométrica clássica da Garrafa de Vidro da Loja (BP)
const BP = new Path2D();
BP.moveTo(-22, 0);
BP.lineTo(-24, -20);
BP.bezierCurveTo(-38, -45, -38, -95, -36, -115);
BP.bezierCurveTo(-35, -135, -20, -150, -10.5, -165);
BP.lineTo(-10.5, -180);
BP.lineTo(-13.5, -181);
BP.lineTo(-13.5, -188);
BP.lineTo(13.5, -188);
BP.lineTo(13.5, -181);
BP.lineTo(10.5, -180);
BP.lineTo(10.5, -165);
BP.bezierCurveTo(20, -150, 35, -135, 36, -115);
BP.bezierCurveTo(38, -95, 38, -45, 24, -20);
BP.lineTo(22, 0);
BP.closePath();

// --- SISTEMA PROCEDURAL DO CENÁRIO DO BOTECO (CANVAS 2D) ---

interface ShelfBottleType {
  w: number;
  h: number;
  nw: number;
  nh: number;
  sh: number;
  bel: number;
  lv: number;
}

const BT: ShelfBottleType[] = [
  { w: 10, h: 48, nw: 3.5, nh: 15, sh: 8, bel: 0, lv: 0.75 },  // Vinho
  { w: 12, h: 42, nw: 4.5, nh: 11, sh: 6, bel: 1, lv: 0.65 },  // Uísque
  { w: 14, h: 38, nw: 3.8, nh: 13, sh: 10, bel: 2, lv: 0.82 }, // Bojuda
  { w: 8,  h: 52, nw: 3.0, nh: 17, sh: 7, bel: 0, lv: 0.70 },  // Slim
  { w: 13, h: 36, nw: 4.2, nh: 9,  sh: 5, bel: 1, lv: 0.60 },  // Decanter com rolha
  { w: 11, h: 45, nw: 4.0, nh: 13, sh: 8, bel: 0, lv: 0.80 }   // Rum
];

const LIQ_COLORS = [
  '#38bdf8', '#fb7185', '#4ade80', '#ca8a04', '#c084fc',
  '#ea580c', '#facc15', '#a3e635', '#f43f5e', '#3b82f6'
];

const GLASS_COLORS = [
  'rgba(205, 236, 226, 0.35)',
  'rgba(255, 232, 160, 0.35)',
  'rgba(180, 220, 240, 0.35)',
  'rgba(220, 240, 210, 0.35)',
  'rgba(230, 210, 240, 0.35)',
  'rgba(240, 240, 240, 0.30)'
];

const LABEL_COLORS = ['#f4ecd8', '#ffffff', '#fff7ed', '#fefce8', '#f1f5f9'];
const SEAL_COLORS = ['#dc2626', '#d97706', '#2563eb', '#16a34a', '#7e22ce'];

function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getShelfBottlePath(bt: ShelfBottleType): Path2D {
  const p = new Path2D();
  const w = bt.w;
  const nw = bt.nw;
  const bodyH = bt.h - bt.sh;
  const totalH = bt.h + bt.nh;

  p.moveTo(-w, 0);
  if (bt.bel > 0) {
    p.bezierCurveTo(-w - bt.bel * 2, -bodyH * 0.4, -w - bt.bel * 1.5, -bodyH * 0.8, -w, -bodyH);
  } else {
    p.lineTo(-w, -bodyH);
  }
  p.bezierCurveTo(-w, -bodyH - bt.sh * 0.5, -nw * 1.4, -bt.h, -nw, -bt.h);
  p.lineTo(-nw, -totalH);
  p.lineTo(-nw - 1.5, -totalH - 1);
  p.lineTo(nw + 1.5, -totalH - 1);
  p.lineTo(nw, -totalH);
  p.lineTo(nw, -bt.h);
  p.bezierCurveTo(nw * 1.4, -bt.h, w, -bodyH - bt.sh * 0.5, w, -bodyH);
  if (bt.bel > 0) {
    p.bezierCurveTo(w + bt.bel * 1.5, -bodyH * 0.8, w + bt.bel * 2, -bodyH * 0.4, w, 0);
  } else {
    p.lineTo(w, 0);
  }
  p.closePath();
  return p;
}

function drawShelfGlass(g: CanvasRenderingContext2D, x: number, y0: number, isWine: boolean) {
  g.save();
  g.translate(x, y0);
  if (isWine) {
    g.fillStyle = 'rgba(255, 255, 255, 0.3)';
    g.fillRect(-4, -1, 8, 1.5);
    g.fillRect(-0.8, -9, 1.6, 8);
    g.beginPath();
    g.arc(0, -14, 5, 0, Math.PI);
    g.lineTo(5, -17);
    g.lineTo(-5, -17);
    g.closePath();
    g.fillStyle = 'rgba(205, 236, 226, 0.28)';
    g.fill();
    g.beginPath();
    g.arc(0, -14, 4, 0, Math.PI);
    g.fillStyle = '#831843';
    g.fill();
    g.strokeStyle = '#0b0710';
    g.lineWidth = 0.9;
    g.stroke();
  } else {
    g.fillStyle = 'rgba(255, 255, 255, 0.28)';
    g.fillRect(-5, -16, 10, 16);
    g.fillStyle = '#ea580c';
    g.fillRect(-4, -10, 8, 9);
    g.fillStyle = 'rgba(255, 255, 255, 0.45)';
    g.fillRect(-4, -15, 1.5, 14);
    g.strokeStyle = '#0b0710';
    g.lineWidth = 0.9;
    g.strokeRect(-5, -16, 10, 16);
  }
  g.restore();
}

function drawShelfBottle(
  g: CanvasRenderingContext2D,
  x: number,
  y0: number,
  bt: ShelfBottleType,
  s: number,
  colLiq: string,
  colVidro: string,
  colRot: string,
  colLac: string
) {
  g.save();
  g.translate(x, y0);
  g.scale(s, s);

  g.fillStyle = 'rgba(0, 0, 0, 0.45)';
  g.beginPath();
  g.ellipse(0, 0, bt.w * 0.9, 2.5, 0, 0, Math.PI * 2);
  g.fill();

  const p = getShelfBottlePath(bt);
  const totalH = bt.h + bt.nh;

  g.save();
  g.clip(p);

  const gl = g.createLinearGradient(-bt.w, 0, bt.w, 0);
  gl.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
  gl.addColorStop(0.3, colVidro);
  gl.addColorStop(0.7, colVidro);
  gl.addColorStop(1.0, 'rgba(0, 0, 0, 0.35)');
  g.fillStyle = gl;
  g.fillRect(-bt.w * 1.5, -totalH - 5, bt.w * 3, totalH + 10);

  const ly = -bt.h * bt.lv;
  const lGrad = g.createLinearGradient(-bt.w, 0, bt.w, 0);
  lGrad.addColorStop(0.0, colLiq);
  lGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
  lGrad.addColorStop(0.5, colLiq);
  lGrad.addColorStop(1.0, '#100518');
  g.fillStyle = colLiq;
  g.fillRect(-bt.w * 1.5, ly, bt.w * 3, -ly);
  g.fillStyle = lGrad;
  g.fillRect(-bt.w * 1.5, ly, bt.w * 3, -ly);

  g.fillStyle = 'rgba(255, 255, 255, 0.45)';
  g.beginPath();
  g.ellipse(0, ly, bt.w * 0.85, 2.0, 0, 0, Math.PI * 2);
  g.fill();

  const rotH = bt.h * 0.32;
  const rotY = -bt.h * 0.62;
  g.fillStyle = colRot;
  g.fillRect(-bt.w * 0.85, rotY, bt.w * 1.7, rotH);
  g.fillStyle = '#0b0710';
  g.fillRect(-bt.w * 0.7, rotY + rotH * 0.45, bt.w * 1.4, 1.2);

  g.fillStyle = 'rgba(255, 255, 255, 0.38)';
  g.fillRect(-bt.w * 0.65, -bt.h + 2, 2.2, bt.h - 4);
  g.fillStyle = 'rgba(0, 0, 0, 0.22)';
  g.fillRect(bt.w * 0.55, -bt.h + 2, bt.w * 0.35, bt.h - 4);

  g.fillStyle = colLac;
  g.fillRect(-bt.nw - 0.8, -totalH - 2, (bt.nw + 0.8) * 2, bt.nh * 0.6);

  g.restore();

  g.strokeStyle = '#0b0710';
  g.lineWidth = 1.1;
  g.stroke(p);

  g.restore();
}

function buildBar(tableIndex: number): HTMLCanvasElement {
  const seed = tableIndex * 977 + 13;
  const rnd = createPRNG(seed);
  const palTable = (PAL[tableIndex % PAL.length] && PAL[tableIndex % PAL.length][0]) || [240, 160, 50];

  const wlcCanvas = document.createElement('canvas');
  wlcCanvas.width = 1920;
  wlcCanvas.height = 1080;
  const wlc = wlcCanvas.getContext('2d');
  if (!wlc) return wlcCanvas;
  wlc.setTransform(2, 0, 0, 2, 0, 0);

  const bgcCanvas = document.createElement('canvas');
  bgcCanvas.width = 1920;
  bgcCanvas.height = 1080;
  const bgc = bgcCanvas.getContext('2d');
  if (!bgc) return bgcCanvas;
  bgc.setTransform(2, 0, 0, 2, 0, 0);

  // 1. Parede de tijolos (0–262)
  wlc.fillStyle = '#1c0b08';
  wlc.fillRect(0, 0, 960, 262);

  const rowH = 14, bW = 34;
  for (let y = 0; y < 262; y += rowH) {
    const rowIdx = Math.floor(y / rowH);
    const xOff = (rowIdx % 2 === 1) ? -17 : 0;
    for (let x = xOff; x < 960 + bW; x += bW) {
      const br = 0.78 + rnd() * 0.40;
      wlc.fillStyle = `rgb(${Math.round(100 * br)}, ${Math.round(46 * br)}, ${Math.round(32 * br)})`;
      wlc.fillRect(x + 1, y + 1, 32, 12);

      wlc.fillStyle = 'rgba(255, 170, 110, 0.07)';
      wlc.fillRect(x + 1, y + 1, 32, 2);
      wlc.fillStyle = 'rgba(0, 0, 0, 0.18)';
      wlc.fillRect(x + 1, y + 11, 32, 2);
    }
  }

  // 2. Prateleiras e garrafas
  const shelfYList = [140, 224];
  for (const y0 of shelfYList) {
    wlc.fillStyle = 'rgba(0, 0, 0, 0.45)';
    wlc.fillRect(24, y0 + 13, 912, 10);

    const gr = wlc.createLinearGradient(0, y0, 0, y0 + 13);
    gr.addColorStop(0.00, '#b98242');
    gr.addColorStop(0.36, '#8a5a26');
    gr.addColorStop(0.38, '#6a4018');
    gr.addColorStop(1.00, '#35190a');
    wlc.fillStyle = gr;
    wlc.fillRect(20, y0, 920, 13);

    wlc.fillStyle = 'rgba(255, 235, 190, 0.35)';
    wlc.fillRect(20, y0, 920, 1.4);

    for (let vi = 0; vi < 3; vi++) {
      wlc.strokeStyle = 'rgba(40, 15, 5, 0.15)';
      wlc.lineWidth = 1;
      wlc.beginPath();
      const vy = y0 + 3 + vi * 3.5;
      wlc.moveTo(20, vy);
      for (let px = 20; px <= 940; px += 40) {
        wlc.lineTo(px, vy + Math.sin(px * 0.02 + vi) * 1.5);
      }
      wlc.stroke();
    }

    wlc.fillStyle = '#3a1c0a';
    const corbels = [110, 330, 560, 790];
    for (const mx of corbels) {
      wlc.beginPath();
      wlc.moveTo(mx - 7, y0 + 13);
      wlc.lineTo(mx + 7, y0 + 13);
      wlc.lineTo(mx, y0 + 34);
      wlc.closePath();
      wlc.fill();
    }

    let sx = 36;
    while (sx < 920) {
      const roll = rnd();
      if (roll < 0.10) {
        sx += 14 + rnd() * 16;
      } else if (roll < 0.26) {
        drawShelfGlass(wlc, sx, y0, rnd() > 0.5);
        sx += 16 + rnd() * 8;
      } else {
        const bt = BT[Math.floor(rnd() * BT.length)];
        const s = 0.88 + rnd() * 0.17;
        const colLiq = LIQ_COLORS[Math.floor(rnd() * LIQ_COLORS.length)];
        const colVidro = GLASS_COLORS[Math.floor(rnd() * GLASS_COLORS.length)];
        const colRot = LABEL_COLORS[Math.floor(rnd() * LABEL_COLORS.length)];
        const colLac = SEAL_COLORS[Math.floor(rnd() * SEAL_COLORS.length)];

        drawShelfBottle(wlc, sx + bt.w * s, y0, bt, s, colLiq, colVidro, colRot, colLac);
        sx += (bt.w * 2 * s) + 4 + rnd() * 6;
      }
    }
  }

  // 4. Penumbra na parede
  wlc.fillStyle = 'rgba(8, 3, 2, 0.60)';
  wlc.fillRect(0, 0, 960, 262);

  // 5. Luz LED
  wlc.save();
  wlc.globalCompositeOperation = 'lighter';
  for (const y0 of shelfYList) {
    const lg = wlc.createLinearGradient(0, y0 + 13, 0, y0 + 58);
    lg.addColorStop(0.0, 'rgba(255, 190, 100, 0.34)');
    lg.addColorStop(1.0, 'rgba(255, 190, 100, 0.00)');
    wlc.fillStyle = lg;
    wlc.fillRect(20, y0 + 13, 920, 45);

    wlc.fillStyle = 'rgba(255, 226, 160, 0.55)';
    wlc.fillRect(20, y0 + 13, 920, 1.6);
  }

  const ceilLight = wlc.createRadialGradient(480, 140, 20, 480, 140, 470);
  ceilLight.addColorStop(0.0, 'rgba(255, 200, 120, 0.18)');
  ceilLight.addColorStop(1.0, 'transparent');
  wlc.fillStyle = ceilLight;
  wlc.fillRect(0, 0, 960, 262);
  wlc.restore();

  // 6. Lambri (258–324)
  const lamGr = wlc.createLinearGradient(0, 258, 0, 324);
  lamGr.addColorStop(0, '#4a2410');
  lamGr.addColorStop(1, '#2a1208');
  wlc.fillStyle = lamGr;
  wlc.fillRect(0, 258, 960, 66);

  for (let px = 6; px < 950; px += 40) {
    const pbr = 0.90 + rnd() * 0.20;
    wlc.fillStyle = `rgb(${Math.round(62 * pbr)}, ${Math.round(30 * pbr)}, ${Math.round(14 * pbr)})`;
    wlc.fillRect(px, 270, 36, 46);

    wlc.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    wlc.strokeRect(px + 4, 274, 28, 38);
    wlc.strokeStyle = 'rgba(255, 200, 140, 0.25)';
    wlc.strokeRect(px + 5, 275, 28, 38);
  }

  const corGr = wlc.createLinearGradient(0, 254, 0, 266);
  corGr.addColorStop(0.0, '#c08a42');
  corGr.addColorStop(0.5, '#9a6528');
  corGr.addColorStop(1.0, '#4a2810');
  wlc.fillStyle = corGr;
  wlc.fillRect(0, 254, 960, 12);
  wlc.fillStyle = 'rgba(255, 240, 190, 0.35)';
  wlc.fillRect(0, 254, 960, 1.4);
  wlc.fillStyle = 'rgba(0, 0, 0, 0.45)';
  wlc.fillRect(0, 266, 960, 10);

  wlc.fillStyle = '#2a1208';
  wlc.fillRect(0, 316, 960, 8);
  wlc.fillStyle = 'rgba(255, 200, 120, 0.15)';
  wlc.fillRect(0, 316, 960, 1.2);

  // 7. Gradiente de oclusão vertical
  const ov = wlc.createLinearGradient(0, 0, 0, 262);
  ov.addColorStop(0.0, 'rgba(0, 0, 0, 0.50)');
  ov.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
  ov.addColorStop(1.0, 'rgba(0, 0, 0, 0.40)');
  wlc.fillStyle = ov;
  wlc.fillRect(0, 0, 960, 262);

  // 8. Transferência com blur para BGC (DOF)
  bgc.save();
  bgc.filter = 'blur(6px)';
  bgc.drawImage(wlcCanvas, 0, 0, 960, 540);
  bgc.restore();

  bgc.filter = 'none';

  // 9. Borda de latão (324–338)
  const brass = bgc.createLinearGradient(0, 324, 0, 338);
  brass.addColorStop(0.00, '#fbe08a');
  brass.addColorStop(0.35, '#c99a3a');
  brass.addColorStop(0.42, '#5a3418');
  brass.addColorStop(1.00, '#26110a');
  bgc.fillStyle = brass;
  bgc.fillRect(0, 324, 960, 14);

  bgc.fillStyle = 'rgba(0, 0, 0, 0.65)';
  bgc.fillRect(0, 337, 960, 1.5);

  // 10. Tampo de madeira em perspectiva (338–540)
  let cy = 338;
  let boardIdx = 0;
  while (cy < 540) {
    const bh = Math.round(15 + boardIdx * 2.6);
    const br = 0.85 + rnd() * 0.30;
    bgc.fillStyle = `rgb(${Math.round(150 * br)}, ${Math.round(80 * br)}, ${Math.round(30 * br)})`;
    bgc.fillRect(0, cy, 960, bh);

    bgc.fillStyle = 'rgba(255, 230, 180, 0.18)';
    bgc.fillRect(0, cy, 960, 1.4);
    bgc.fillStyle = 'rgba(0, 0, 0, 0.42)';
    bgc.fillRect(0, cy + bh - 1.6, 960, 1.6);

    for (let v = 0; v < 7; v++) {
      bgc.strokeStyle = 'rgba(40, 15, 5, 0.12)';
      bgc.lineWidth = 1;
      bgc.beginPath();
      const vy = cy + (v / 7) * bh;
      bgc.moveTo(0, vy);
      for (let x = 0; x <= 960; x += 40) {
        bgc.lineTo(x, vy + Math.sin(x * 0.02 + v) * 1.8);
      }
      bgc.stroke();
    }

    bgc.fillStyle = 'rgba(0, 0, 0, 0.35)';
    bgc.fillRect(180 + (boardIdx * 137) % 600, cy, 1.5, bh);
    bgc.fillRect(520 + (boardIdx * 193) % 400, cy, 1.5, bh);

    if (rnd() < 0.30) {
      const kx = 100 + rnd() * 760;
      const ky = cy + bh * 0.5;
      for (let nr = 6; nr >= 2; nr -= 2) {
        bgc.strokeStyle = 'rgba(30, 10, 5, 0.25)';
        bgc.beginPath();
        bgc.ellipse(kx, ky, nr * 1.8, nr * 0.9, rnd() * 0.5, 0, Math.PI * 2);
        bgc.stroke();
      }
    }

    cy += bh;
    boardIdx++;
  }

  // 11. Iluminação do balcão (lighter)
  bgc.save();
  bgc.globalCompositeOperation = 'lighter';

  const radLight = bgc.createRadialGradient(480, 392, 20, 480, 392, 400);
  radLight.addColorStop(0.0, 'rgba(255, 210, 130, 0.45)');
  radLight.addColorStop(1.0, 'rgba(255, 210, 130, 0.00)');
  bgc.fillStyle = radLight;
  bgc.fillRect(0, 338, 960, 202);

  const envGrad = bgc.createRadialGradient(480, 540, 10, 480, 540, 360);
  envGrad.addColorStop(0.0, `rgba(${palTable[0]}, ${palTable[1]}, ${palTable[2]}, 0.14)`);
  envGrad.addColorStop(1.0, 'transparent');
  bgc.fillStyle = envGrad;
  bgc.fillRect(0, 338, 960, 202);

  bgc.restore();

  // 12. Acabamento e vinheta
  const topDark = bgc.createLinearGradient(0, 338, 0, 540);
  topDark.addColorStop(0.0, 'rgba(0, 0, 0, 0.00)');
  topDark.addColorStop(1.0, 'rgba(0, 0, 0, 0.18)');
  bgc.fillStyle = topDark;
  bgc.fillRect(0, 338, 960, 202);

  bgc.fillStyle = 'rgba(0, 0, 0, 0.35)';
  bgc.fillRect(0, 338, 960, 3);

  const vig = bgc.createRadialGradient(480, 270, 220, 480, 270, 640);
  vig.addColorStop(0.0, 'transparent');
  vig.addColorStop(1.0, 'rgba(0, 0, 0, 0.40)');
  bgc.fillStyle = vig;
  bgc.fillRect(0, 0, 960, 540);

  return bgcCanvas;
}

interface UIElement {
  x: number;
  y: number;
  w: number;
  h: number;
  f: () => void;
  id?: string;
}

export const CacapaShop: React.FC<CacapaShopProps> = ({
  engine,
  onNextRound,
  onUpdate,
  onOpenMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isBallRackOpen, setIsBallRackOpen] = useState(false);
  const [replaceOfferIndex, setReplaceOfferIndex] = useState<number | null>(null);

  const engineRef = useRef(engine);
  engineRef.current = engine;
  const onNextRoundRef = useRef(onNextRound);
  onNextRoundRef.current = onNextRound;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onOpenMenuRef = useRef(onOpenMenu);
  onOpenMenuRef.current = onOpenMenu;

  const openReplaceModalRef = useRef<(index: number) => void>(() => {});
  openReplaceModalRef.current = (idx: number) => setReplaceOfferIndex(idx);

    const uiRef = useRef<UIElement[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

    const toastRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });
  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTableRef = useRef<number>(-1);

  const sellConfirmRef = useRef<{ index: number; expireTime: number }>({ index: -1, expireTime: 0 });
  const bottleAnimRef = useRef<Record<number, { l: number; s: number; r: number }>>({});
  const draggedJokerRef = useRef<{ index: number; startX: number; startY: number } | null>(null);
  const shopScaleRef = useRef<number>(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width || window.innerWidth);
      const h = Math.round(rect.height || window.innerHeight);
      if (w > 0 && h > 0) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const updateMouse = (e: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const isIn = (box: { x: number; y: number; w: number; h: number }) => {
      const m = mouseRef.current;
      return m.x >= box.x && m.x <= box.x + box.w && m.y >= box.y && m.y <= box.y + box.h;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateMouse(e);
      if (draggedJokerRef.current !== null) {
        canvas.style.cursor = 'grabbing';
        return;
      }
      const isOverInteractive = uiRef.current.some(isIn);
      canvas.style.cursor = isOverInteractive ? 'pointer' : 'default';
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      updateMouse(e);
      const hit = [...uiRef.current].reverse().find(isIn);
      if (hit) {
        hit.f();
        return;
      }

      // Se clicou sobre um coringa no topo (fora do botão de venda), inicia o arrasto
      const eng = engineRef.current;
      const scale = shopScaleRef.current;
      const rect = canvas.getBoundingClientRect();
      const W = Math.round(rect.width || window.innerWidth);
      const H = Math.round(rect.height || window.innerHeight);
      const cardW = Math.round(76 * scale);
      const cardH = Math.round(102 * scale);
      const startX = Math.max(20, Math.round(W * 0.025));
      const startY = Math.max(12, Math.round(H * 0.02));
      const gap = Math.round(cardW + 12 * scale);

      for (let i = 0; i < eng.ownedJokers.length; i++) {
        const cx = startX + i * gap;
        const cardBox = { x: cx, y: startY, w: cardW, h: cardH };
        if (isIn(cardBox)) {
          draggedJokerRef.current = { index: i, startX: mouseRef.current.x, startY: mouseRef.current.y };
          canvas.style.cursor = 'grabbing';
          break;
        }
      }
    };

    const handlePointerUp = () => {
      if (draggedJokerRef.current !== null) {
        const fromIdx = draggedJokerRef.current.index;
        const eng = engineRef.current;
        const scale = shopScaleRef.current;
        const rect = canvas.getBoundingClientRect();
        const W = Math.round(rect.width || window.innerWidth);
        const H = Math.round(rect.height || window.innerHeight);
        const cardW = Math.round(76 * scale);
        const cardH = Math.round(102 * scale);
        const startX = Math.max(20, Math.round(W * 0.025));
        const startY = Math.max(12, Math.round(H * 0.02));
        const gap = Math.round(cardW + 12 * scale);

        for (let j = 0; j < 5; j++) {
          const cx = startX + j * gap;
          const targetBox = { x: cx - 12, y: startY - 10, w: cardW + 24, h: cardH + 20 };
          if (isIn(targetBox) && j !== fromIdx && j < eng.ownedJokers.length) {
            const ok = eng.reorderJokers(fromIdx, j);
            if (ok) {
              toastRef.current = { text: 'Coringa reposicionado!', time: timeRef.current + 80 };
              onUpdateRef.current();
            }
            break;
          }
        }
        draggedJokerRef.current = null;
        canvas.style.cursor = 'default';
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.x = -200;
      mouseRef.current.y = -200;
      draggedJokerRef.current = null;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

        const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const eng = engineRef.current;

      const rect = canvas.getBoundingClientRect();
      const W = Math.round(rect.width || window.innerWidth);
      const H = Math.round(rect.height || window.innerHeight);

      const s = Math.min(W / 960, H / 580);
      const scale = Math.max(1.0, Math.min(1.5, s));
      shopScaleRef.current = scale;

      const counterY = Math.max(
        Math.round(H * 0.50),
        Math.min(Math.round(H * 0.58), H - Math.round(230 * scale))
      );

            const ui: UIElement[] = [];
      ctx.clearRect(0, 0, W, H);

      // Fundo Procedural do Boteco (pré-renderizado em 2x offscreen com DOF na parede)
      const currentTable = eng.tableIndex || 0;
      if (!barCanvasRef.current || lastTableRef.current !== currentTable) {
        barCanvasRef.current = buildBar(currentTable);
        lastTableRef.current = currentTable;
      }

      if (barCanvasRef.current) {
        ctx.drawImage(barCanvasRef.current, 0, 0, W, H);
      } else {
        ctx.fillStyle = '#1c0b08';
        ctx.fillRect(0, 0, W, H);
      }

                        const drawButton = (
        bx: number,
        by: number,
        bw: number,
        bh: number,
        label: string,
        col: string,
        isEnabled: boolean,
        onClick: () => void
      ) => {
        const box = { x: bx, y: by, w: bw, h: bh };
        const hv = isEnabled && isIn(box);

        ctx.save();
        ctx.translate(bx + bw / 2, by + bh / 2 + (hv ? Math.sin(t * 0.15) * 1.5 : 0));
        if (hv) ctx.scale(1.04, 1.04);

                ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(-bw / 2 + 2, -bh / 2 + 4, bw, bh, 10);
        ctx.fill();

                ctx.fillStyle = isEnabled ? col : '#4b5563';
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 10);
        ctx.fill();

                ctx.lineWidth = 3;
        ctx.strokeStyle = '#0b0710';
        ctx.stroke();

                if (isEnabled) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.beginPath();
          ctx.roundRect(-bw / 2 + 2, -bh / 2 + 2, bw - 4, bh * 0.45, 8);
          ctx.fill();
        }

                ctx.font = `700 ${Math.round(bh * 0.44)}px Oswald, sans-serif`;
        ctx.fillStyle = isEnabled ? '#0b0710' : '#9ca3af';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 1);
        ctx.restore();

        if (isEnabled) {
          ui.push({ x: bx, y: by, w: bw, h: bh, f: onClick });
        }
      };

      const maxJokers = 5;
      const cardW = Math.round(76 * scale);
      const cardH = Math.round(102 * scale);
      const startX = Math.max(20, Math.round(W * 0.025));
      const startY = Math.max(12, Math.round(H * 0.02));
      const gap = Math.round(cardW + 12 * scale);

      let hoveredJokerTip: Card | null = null;
      let hoveredSellBtnInfo: string | null = null;

      for (let i = 0; i < maxJokers; i++) {
        const cx = startX + i * gap;
        const cy = startY;
        const jCard = eng.ownedJokers[i];

        if (!jCard) {
          ctx.fillStyle = 'rgba(45, 20, 10, 0.45)';
          ctx.beginPath();
          ctx.roundRect(cx, cy, cardW, cardH, 10);
          ctx.fill();

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = `700 ${Math.round(12 * scale)}px Oswald, sans-serif`;
          ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(`SLOT ${i + 1}`, cx + cardW / 2, cy + cardH / 2);
          continue;
        }

        const cardBox = { x: cx, y: cy, w: cardW, h: cardH };
        const isCardHover = isIn(cardBox);
        if (isCardHover) hoveredJokerTip = jCard;

        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(cx + 3, cy + 5, cardW, cardH, 10);
        ctx.fill();

        ctx.fillStyle = '#fffdf5';
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 10);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = jCard.rarity === 'Lendária' ? '#ffd700' : '#0b0710';
        ctx.stroke();

        ctx.font = `${Math.round(30 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(jCard.icon || '🃏', cx + cardW / 2, cy + Math.round(40 * scale));

        ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#1b1226';
        ctx.textAlign = 'center';
        ctx.fillText(jCard.name, cx + cardW / 2, cy + Math.round(78 * scale), cardW - 8);

        // Botões de reposicionamento rápido (◀ e ▶) no topo do Coringa
        if (isCardHover && eng.ownedJokers.length > 1) {
          if (i > 0) {
            const leftBtnBox = { x: cx + 2, y: cy + 2, w: Math.round(20 * scale), h: Math.round(18 * scale) };
            drawButton(leftBtnBox.x, leftBtnBox.y, leftBtnBox.w, leftBtnBox.h, '◀', '#3b82f6', true, () => {
              eng.reorderJokers(i, i - 1);
              onUpdateRef.current();
            });
          }
          if (i < eng.ownedJokers.length - 1) {
            const rightBtnBox = { x: cx + cardW - Math.round(22 * scale), y: cy + 2, w: Math.round(20 * scale), h: Math.round(18 * scale) };
            drawButton(rightBtnBox.x, rightBtnBox.y, rightBtnBox.w, rightBtnBox.h, '▶', '#3b82f6', true, () => {
              eng.reorderJokers(i, i + 1);
              onUpdateRef.current();
            });
          }
        }

        const sellVal = Math.max(1, Math.floor(jCard.cost * 0.75));
        const btnBox = { x: cx, y: cy + cardH + Math.round(5 * scale), w: cardW, h: Math.round(26 * scale) };
        if (isIn(btnBox) || isCardHover) {
          hoveredSellBtnInfo = 'Vender curinga: 75% do valor • Arraste ou use ◀ ▶ para mudar a ordem';
        }
        const isArmed = sellConfirmRef.current.index === i && t < sellConfirmRef.current.expireTime;
        const btnCol = isArmed ? '#ef4444' : '#f59e0b';
        const btnTxt = isArmed ? 'CONFIRMAR?' : `VENDER $${sellVal}`;

        drawButton(btnBox.x, btnBox.y, btnBox.w, btnBox.h, btnTxt, btnCol, true, () => {
          if (isArmed) {
            sellConfirmRef.current = { index: -1, expireTime: 0 };
            const res = eng.sellJoker(i);
            toastRef.current = { text: `Vendido por $${res.value}!`, time: t + 90 };
            onUpdateRef.current();
          } else {
            sellConfirmRef.current = { index: i, expireTime: t + 150 };
          }
        });
      }

      // Slot de Consumível do jogador no cabeçalho da loja (1 slot)
      const consSlotX = startX + maxJokers * gap + Math.round(14 * scale);
      const consItem = eng.ownedConsumable;

      if (!consItem) {
        ctx.fillStyle = 'rgba(20, 30, 40, 0.45)';
        ctx.beginPath();
        ctx.roundRect(consSlotX, startY, cardW, cardH, 10);
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('CONSUMÍVEL', consSlotX + cardW / 2, startY + Math.round(44 * scale));
        ctx.font = `700 ${Math.round(10 * scale)}px Oswald, sans-serif`;
        ctx.fillText('(0 / 1)', consSlotX + cardW / 2, startY + Math.round(62 * scale));
      } else {
        const hitBox = { x: consSlotX, y: startY, w: cardW, h: cardH };
        if (isIn(hitBox)) {
          hoveredJokerTip = {
            id: consItem.id,
            name: consItem.name,
            description: consItem.description,
            rarity: consItem.rarity,
            cost: consItem.cost,
            icon: consItem.icon,
          } as Card;
        }

        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(consSlotX + 3, startY + 5, cardW, cardH, 10);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(consSlotX, startY, cardW, cardH, 10);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = consItem.rarity === 'Lendário' ? '#c084fc' : consItem.rarity === 'Raro' ? '#f59e0b' : '#38bdf8';
        ctx.stroke();

        ctx.font = `${Math.round(30 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(consItem.icon, consSlotX + cardW / 2, startY + Math.round(38 * scale));

        ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(consItem.name, consSlotX + cardW / 2, startY + Math.round(74 * scale), cardW - 8);

        const btnSellW = cardW;
        const btnSellH = Math.round(24 * scale);
        const btnSellY = startY + cardH + Math.round(8 * scale);
        const isArmed = sellConfirmRef.current.index === 999 && t < sellConfirmRef.current.expireTime;

        drawButton(
          consSlotX,
          btnSellY,
          btnSellW,
          btnSellH,
          isArmed ? 'CONFIRMAR?' : `VENDER $${consItem.sellValue}`,
          isArmed ? '#ef4444' : '#b45309',
          true,
          () => {
            if (isArmed) {
              sellConfirmRef.current = { index: -1, expireTime: 0 };
              const res = eng.sellConsumable();
              toastRef.current = { text: res.message, time: t + 90 };
              onUpdateRef.current();
            } else {
              sellConfirmRef.current = { index: 999, expireTime: t + 150 };
            }
          }
        );
      }

      if (hoveredSellBtnInfo) {
        ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'left';
        ctx.fillText(
          hoveredSellBtnInfo,
          startX,
          startY + cardH + Math.round(44 * scale)
        );
      }

      const rightMargin = Math.max(20, Math.round(W * 0.025));

      const neonX = Math.round(W - Math.max(280 * scale, W * 0.30));
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      ctx.font = `700 ${Math.round(38 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('LOJA DO BOTECO', neonX, startY + Math.round(34 * scale));

      ctx.font = `700 ${Math.round(13.5 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.fillText('OPEN BAR • CAÇAPA ROGUELIKE', neonX, startY + Math.round(58 * scale));
      ctx.restore();

      ctx.save();
      ctx.shadowColor = '#ca8a04';
      ctx.shadowBlur = 14;
      ctx.font = `700 ${Math.round(42 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'right';
      ctx.fillText(`$${eng.money}`, W - rightMargin, startY + Math.round(36 * scale));
      ctx.restore();

      if (onOpenMenuRef.current) {
        const menuW = Math.round(82 * scale);
        const menuH = Math.round(34 * scale);
        drawButton(
          W - rightMargin - menuW,
          startY + Math.round(48 * scale),
          menuW,
          menuH,
          '≡ MENU',
          '#f59e0b',
          true,
          () => {
            onOpenMenuRef.current?.();
          }
        );
      }

                        const yBase = counterY + Math.round(75 * scale);
      let activeTooltip: {
        x: number;
        y: number;
        title: string;
        desc: string;
        cost: number;
        canAfford: boolean;
        col: string;
      } | null = null;

      const drawCoaster = (cx: number, cy: number, cost: number, canAfford: boolean) => {
        const cRadiusX = Math.round(42 * scale);
        const cRadiusY = Math.round(15 * scale);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy + 4, cRadiusX + 2, cRadiusY + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fffdf0';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX, cRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX - 4 * scale, cRadiusY - 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = `700 ${Math.round(18 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = canAfford ? '#854d0e' : '#dc2626';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${cost}`, cx, cy + 1);
      };

      const drawSoldCoaster = (cx: number, cy: number) => {
        const cRadiusX = Math.round(42 * scale);
        const cRadiusY = Math.round(15 * scale);

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX, cRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `700 ${Math.round(14 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VENDIDO', cx, cy + 1);
      };

      const cardStock = eng.shopManager.cardStock;
      const bGap = Math.min(130 * scale, (W * 0.42) / 4);
      const bCenterX = (W / 2) - (W * 0.23);
      const bottleXList = [0, 1, 2, 3].map((i) => Math.round(bCenterX + (i - 1.5) * bGap));


      for (let i = 0; i < 4; i++) {
        const bx = bottleXList[i];
        const card = cardStock[i];

        if (!card) {
          drawSoldCoaster(bx, yBase + Math.round(30 * scale));
          continue;
        }

        const hitBox = {
          x: bx - Math.round(44 * scale),
          y: yBase - Math.round(200 * scale),
          w: Math.round(88 * scale),
          h: Math.round(225 * scale),
        };
        const isHover = isIn(hitBox);
        const canAfford = eng.money >= card.cost;
        const theme = getJokerBottleTheme(card);
        const isLegendary = card.rarity === 'Lendária' || (card.rarity as string)?.toLowerCase().includes('lend');

        if (isHover) {
          activeTooltip = {
            x: bx,
            y: yBase - Math.round(210 * scale),
            title: `Garrafa Coringa: ${card.name}`,
            desc: `${card.description} • ${card.rarity.toUpperCase()}`,
            cost: card.cost,
            canAfford,
            col: isLegendary ? '#ffd700' : '#facc15',
          };
        }

        // Suavização exponencial do Hover (Inércia e balanço)
        if (!bottleAnimRef.current[i]) {
          bottleAnimRef.current[i] = { l: 0, s: 1.0, r: 0 };
        }
        const k = bottleAnimRef.current[i];
        const targetL = isHover ? -14 : 0;
        const targetS = isHover ? 1.05 : 1.0;
        const targetR = isHover ? Math.sin(t * 0.2) * 0.025 : 0;
        k.l += (targetL - k.l) * 0.2;
        k.s += (targetS - k.s) * 0.2;
        k.r += (targetR - k.r) * 0.2;

        // 1. Sombra de contato e projeção cáustica do líquido no balcão
        ctx.save();
        ctx.translate(bx + 6 * scale, yBase + 3 * scale);
        ctx.beginPath();
        ctx.ellipse(0, 0, 44 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(11, 7, 16, 0.45)';
        ctx.fill();

        ctx.scale(1, 0.28);
        const caust = ctx.createRadialGradient(0, 0, 4 * scale, 0, 0, 48 * scale);
        caust.addColorStop(0, theme.top);
        caust.addColorStop(1, 'transparent');
        ctx.fillStyle = caust;
        ctx.beginPath();
        ctx.arc(0, 0, 48 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Halo traseiro (para lendárias ou no hover)
        if (isLegendary || isHover) {
          ctx.save();
          ctx.translate(bx, yBase + k.l * scale - 95 * scale);
          const haloR = isLegendary ? 75 * scale : 58 * scale;
          const halo = ctx.createRadialGradient(0, 0, 8 * scale, 0, 0, haloR);
          if (isLegendary) {
            halo.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
            halo.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
            halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
          } else {
            halo.addColorStop(0, theme.glow);
            halo.addColorStop(1, 'transparent');
          }
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(0, 0, haloR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 3. Matriz do objeto da Garrafa
        ctx.save();
        ctx.translate(bx, yBase + k.l * scale);
        ctx.rotate(k.r);
        ctx.scale(scale * k.s, scale * k.s);

        if (!canAfford) {
          ctx.globalAlpha = 0.85;
        }

        // 4. MÁSCARA DO VIDRO (Clip com BP)
        ctx.save();
        ctx.clip(BP);

        // 4a. Vidro translúcido cilíndrico (gradiente horizontal de 4 paradas)
        const glass = ctx.createLinearGradient(-36, 0, 36, 0);
        if (isLegendary) {
          glass.addColorStop(0.00, 'rgba(255, 232, 160, 0.55)');
          glass.addColorStop(0.28, 'rgba(255, 232, 160, 0.30)');
          glass.addColorStop(0.65, 'rgba(255, 232, 160, 0.22)');
          glass.addColorStop(1.00, 'rgba(255, 232, 160, 0.55)');
        } else {
          glass.addColorStop(0.00, 'rgba(205, 236, 226, 0.50)');
          glass.addColorStop(0.28, 'rgba(205, 236, 226, 0.28)');
          glass.addColorStop(0.65, 'rgba(205, 236, 226, 0.20)');
          glass.addColorStop(1.00, 'rgba(205, 236, 226, 0.50)');
        }
        ctx.fillStyle = glass;
        ctx.fillRect(-45, -200, 90, 210);

        // 4b. Fundo espesso de vidro (punt)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, -6, 22, 6, 0, 0, Math.PI);
        ctx.fill();

        // 4c. Líquido dinâmico com ondulação na superfície
        const ph = (card.cost || 5) * 1.7 + i * 1.3;
        const ly = -118 + Math.sin(t * 0.05 + ph) * 1.5;

        const liq = ctx.createLinearGradient(-36, 0, 36, 0);
        liq.addColorStop(0.0, theme.bottom);
        liq.addColorStop(0.3, theme.top);
        liq.addColorStop(0.7, theme.bottom);
        liq.addColorStop(1.0, '#100518');
        ctx.fillStyle = liq;
        ctx.fillRect(-45, ly, 90, -ly);

        const vGrad = ctx.createLinearGradient(0, ly, 0, 0);
        vGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        vGrad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(-45, ly, 90, -ly);

        // 4d. Menisco da superfície do líquido
        ctx.save();
        ctx.translate(0, ly);
        ctx.rotate(Math.sin(t * 0.04 + ph) * 0.035);
        ctx.beginPath();
        ctx.ellipse(0, 0, 27, 3.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = theme.top;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // 4e. 6 Bolhas subindo
        for (let b = 0; b < 6; b++) {
          const by = -((t * 0.45 + b * 20) % (-ly - 8));
          const bbx = Math.sin(b * 3.1 + t * 0.015) * (16 + b);
          const alpha = Math.max(0, 1 + by / (-ly));
          ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * alpha})`;
          ctx.beginPath();
          ctx.arc(bbx, by, 1.2 + (b % 2) * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4f. RÓTULO CILÍNDRICO EM 3 FAIXAS (Projeção Senoidal)
        const R0 = 33;
        const hf = (k.s - 1.0) / 0.05;
        const TH = (0.42 + 0.14 * hf) * Math.sin(t * 0.022 + ph);
        const SE = [-28, -9.5, 9.5, 28];

        for (let sIdx = 0; sIdx < 3; sIdx++) {
          const s0 = SE[sIdx];
          const s1 = SE[sIdx + 1];
          const x0 = R0 * Math.sin(Math.min(1.5, Math.max(-1.5, s0 / R0 + TH)));
          const x1 = R0 * Math.sin(Math.min(1.5, Math.max(-1.5, s1 / R0 + TH)));
          if (x1 <= x0) continue;

          const sc = (x1 - x0 + 0.5) / (s1 - s0);

          ctx.save();
          ctx.beginPath();
          ctx.rect(x0 - 0.25, -95, (x1 - x0) + 0.5, 58);
          ctx.clip();

          ctx.translate(x0, -95);
          ctx.scale(sc, 1);
          ctx.translate(-s0, 0);

          // Fundo de papel do rótulo
          ctx.fillStyle = '#f4ecd8';
          ctx.fillRect(s0, 0, s1 - s0, 58);

          // Bloco do Coringa
          ctx.fillStyle = '#1b1226';
          ctx.fillRect(-23, 4, 46, 50);

          if (isLegendary) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-23, 4, 46, 50);
          }

          // Ícone
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(card.icon || '🃏', 0, 24);

          // Nome do Coringa
          ctx.font = '700 9.5px Oswald, sans-serif';
          ctx.fillStyle = isLegendary ? '#ffd700' : '#fef08a';
          ctx.fillText(card.name, 0, 44, 44);

          // Escurecimento Lambert nas bordas do cilindro
          const midAngle = ((s0 + s1) * 0.5) / R0 + TH;
          const shadowAlpha = (1 - Math.cos(midAngle)) * 0.70;
          ctx.fillStyle = `rgba(11, 7, 16, ${Math.max(0, shadowAlpha)})`;
          ctx.fillRect(s0, 0, s1 - s0, 58);

          ctx.restore();
        }

        // Delimitação lateral das bordas do papel
        const lx0 = R0 * Math.sin(Math.min(1.5, Math.max(-1.5, SE[0] / R0 + TH)));
        const lx1 = R0 * Math.sin(Math.min(1.5, Math.max(-1.5, SE[3] / R0 + TH)));
        ctx.strokeStyle = '#0b0710';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lx0, -95); ctx.lineTo(lx0, -37);
        ctx.moveTo(lx1, -95); ctx.lineTo(lx1, -37);
        ctx.stroke();

        // 4g. Reflexos especulares brancos com paralaxe
        const hs = TH * 1.6;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
        ctx.fillRect(-24 + hs, -120, 5, 88);

        // Brilho no gargalo
        ctx.fillRect(-7, -170, 3, 45);

        // Rim light sutil na borda direita
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(28, -115, 2.5, 85);

        ctx.restore(); // Fecha o clip(BP)

        // 5. Espessura interna da parede de vidro
        ctx.save();
        ctx.scale(0.88, 0.97);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.8;
        ctx.stroke(BP);
        ctx.restore();

        // 6. Rolha de cortiça
        ctx.fillStyle = isLegendary ? '#d97706' : '#b07d4b';
        ctx.beginPath();
        ctx.roundRect(-8, -198, 16, 12, 2);
        ctx.fill();
        ctx.strokeStyle = '#0b0710';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Textura da cortiça
        ctx.strokeStyle = 'rgba(11, 7, 16, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, -193); ctx.lineTo(4, -193);
        ctx.moveTo(-3, -190); ctx.lineTo(6, -190);
        ctx.stroke();

        // Colarinho no gargalo se lendário
        if (isLegendary) {
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(-10.5, -174, 21, 6);
          ctx.strokeStyle = '#0b0710';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-10.5, -174, 21, 6);
        }

        // 7. Contorno cartoon externo grosso
        ctx.strokeStyle = '#0b0710';
        ctx.lineWidth = 3.2;
        ctx.stroke(BP);

        // 8. Selo flutuante de lendário
        if (isLegendary) {
          ctx.font = '700 9.5px Oswald, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffd700';
          ctx.strokeStyle = '#0b0710';
          ctx.lineWidth = 2.5;
          ctx.strokeText('★ LENDÁRIO', 0, -208);
          ctx.fillText('★ LENDÁRIO', 0, -208);
        }

        ctx.restore(); // Fecha transform da garrafa

        drawCoaster(bx, yBase + Math.round(30 * scale), card.cost, canAfford);

        ui.push({
          x: hitBox.x,
          y: hitBox.y,
          w: hitBox.w,
          h: hitBox.h,
          f: () => {
            const res = eng.buyShopCard(i);
            toastRef.current = { text: res.message, time: t + 90 };
            onUpdateRef.current();
          },
        });
      }

      // --- CONSUMÍVEIS (PETISCOS & UTILITÁRIOS) NO BALCÃO CENTRAL ---
      const consStock = eng.shopManager.consumableStock;
      const consGap = Math.min(96 * scale, W * 0.095);
      const consXList = [Math.round(W / 2 - consGap * 0.55), Math.round(W / 2 + consGap * 0.55)];

      for (let i = 0; i < 2; i++) {
        const cx = consXList[i];
        const item = consStock[i];

        if (!item) {
          drawSoldCoaster(cx, yBase + Math.round(30 * scale));
          continue;
        }

        const hitBox = {
          x: cx - Math.round(40 * scale),
          y: yBase - Math.round(110 * scale),
          w: Math.round(80 * scale),
          h: Math.round(155 * scale),
        };
        const isHover = isIn(hitBox);
        const canAfford = eng.money >= item.cost;

        const rarityCol = item.rarity === 'Lendário'
          ? '#c084fc'
          : item.rarity === 'Raro'
          ? '#f59e0b'
          : item.rarity === 'Incomum'
          ? '#38bdf8'
          : '#9fb4a8';

        if (isHover) {
          activeTooltip = {
            x: cx,
            y: yBase - Math.round(130 * scale),
            title: `Consumível: ${item.name}`,
            desc: `[${item.rarity.toUpperCase()}] ${item.description}`,
            cost: item.cost,
            canAfford,
            col: rarityCol,
          };
        }

        const lift = isHover ? -10 * scale : 0;
        const bob = Math.sin(t * 0.08 + i * 2) * 3 * scale;

        // 1. Sombra do pratinho/item
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cx, yBase + 10 * scale, 34 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bandejinha/Pratinho de bar
        ctx.fillStyle = '#261810';
        ctx.beginPath();
        ctx.ellipse(cx, yBase - 2 * scale, 32 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rarityCol;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // 3. Rótulo da raridade
        ctx.font = `700 ${Math.round(10.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = rarityCol;
        ctx.textAlign = 'center';
        ctx.fillText(item.rarity.toUpperCase(), cx, yBase - Math.round(76 * scale) + lift);

        // 4. Nome
        ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(item.name, cx, yBase - Math.round(62 * scale) + lift);

        // 5. Ícone do consumível
        ctx.font = `${Math.round(38 * scale)}px sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, cx, yBase - Math.round(32 * scale) + lift + bob);

        ctx.restore();

        // 6. Porta-copo com o preço
        drawCoaster(cx, yBase + Math.round(30 * scale), item.cost, canAfford);

        ui.push({
          x: hitBox.x,
          y: hitBox.y,
          w: hitBox.w,
          h: hitBox.h,
          f: () => {
            if (!canAfford) {
              toastRef.current = { text: 'Dinheiro insuficiente!', time: t + 90 };
              return;
            }
            if (eng.ownedConsumable !== null) {
              toastRef.current = { text: 'Slot cheio! Use ou venda seu consumível primeiro.', time: t + 100 };
              return;
            }
            const res = eng.buyShopConsumable(i);
            toastRef.current = { text: res.message, time: t + 90 };
            onUpdateRef.current();
          },
        });
      }

      const ballStock = eng.shopManager.ballStock;
      const ballGap = Math.min(140 * scale, (W * 0.38) / 3);
      const ballCenterX = (W / 2) + (W * 0.23);
      const ballXList = [0, 1, 2].map((i) => Math.round(ballCenterX + (i - 1) * ballGap));

      for (let i = 0; i < 3; i++) {
        const bx = ballXList[i];
        const offer = ballStock[i];

        if (!offer) {
          drawSoldCoaster(bx, yBase + Math.round(30 * scale));
          continue;
        }

        const hitBox = {
          x: bx - Math.round(44 * scale),
          y: yBase - Math.round(120 * scale),
          w: Math.round(88 * scale),
          h: Math.round(165 * scale),
        };
        const isHover = isIn(hitBox);
        const canAfford = eng.money >= offer.price;

        const hasEnh = offer.hasEnhancement && offer.enhancement !== null;
        const rarityCol = offer.rarity === 'Lendária'
          ? '#c084fc'
          : offer.rarity === 'Rara'
          ? '#f59e0b'
          : offer.rarity === 'Incomum'
          ? '#38bdf8'
          : '#9fb4a8';

        if (isHover) {
          activeTooltip = {
            x: bx,
            y: yBase - Math.round(135 * scale),
            title: hasEnh
              ? `Bola #${offer.ballNumber} (${offer.isStripe ? 'Listrada' : 'Lisa'}) • ${offer.enhancement!.name}`
              : `Bola #${offer.ballNumber} (${offer.isStripe ? 'Listrada' : 'Lisa'}) • Bola Normal`,
            desc: hasEnh
              ? `[${offer.rarity || 'Modificada'}] ${offer.enhancement!.description} • Clique para substituir uma bola!`
              : `Bola comum sem modificador • Preço: $${offer.price} • Clique para substituir uma bola!`,
            cost: offer.price,
            canAfford,
            col: hasEnh ? rarityCol : '#ffd700',
          };
        }

        const lift = isHover ? -12 * scale : 0;
        const itemHoverScale = isHover ? 1.08 : 1.0;

        ctx.save();
        const bSpot = ctx.createRadialGradient(bx, yBase + 10, 4, bx, yBase + 10, Math.round(40 * scale));
        bSpot.addColorStop(0, 'rgba(255, 220, 130, 0.4)');
        bSpot.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = bSpot;
        ctx.beginPath();
        ctx.ellipse(bx, yBase + 10, 36 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx + 4 * scale, yBase + 4 * scale, 30 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bx, yBase + lift);
        ctx.scale(scale * itemHoverScale, scale * itemHoverScale);

        if (hasEnh) {
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(offer.enhancement!.icon, 0, -84);

          // Rótulo da raridade
          ctx.font = '700 11px Oswald, sans-serif';
          ctx.fillStyle = rarityCol;
          ctx.fillText(offer.rarity?.toUpperCase() || 'MOD', 0, -104);
        }

        const ballY = -48;
        const r = 30;

        // Animação e modelo 3D idêntico ao ball.ts com inclinação suave voltada para o jogador
        const tiltX = 0.22 + Math.sin(t * 0.03 + i * 1.5) * 0.08 + (isHover ? 0.05 : 0);
        const tiltY = -0.14 + Math.cos(t * 0.025 + i * 1.2) * 0.08;
        const spin = Math.sin(t * 0.02 + i * 2.0) * 0.06 + (isHover ? Math.sin(t * 0.08) * 0.04 : 0);

        const M = createPreviewMatrix(tiltX, tiltY, spin);

        ctx.save();
        ctx.translate(0, ballY);

        draw3DBall(
          ctx,
          {
            number: offer.ballNumber,
            isStripe: offer.isStripe,
            enhancement: offer.enhancement,
            M,
          },
          r,
          {
            shadow: true,
            shadowOffsetX: 2,
            shadowOffsetY: 4,
            res: 2.2,
          }
        );

        ctx.restore();

        ctx.restore();

        drawCoaster(bx, yBase + Math.round(30 * scale), offer.price, canAfford);

        ui.push({
          x: hitBox.x,
          y: hitBox.y,
          w: hitBox.w,
          h: hitBox.h,
          f: () => {
            if (!canAfford) {
              toastRef.current = { text: 'Dinheiro insuficiente!', time: t + 90 };
              return;
            }
            openReplaceModalRef.current(i);
          },
        });
      }

      const btnH = Math.round(56 * scale);
      const btnY = H - btnH - Math.round(18 * scale);
      const rerollCost = eng.shopManager.currentRerollCost;
      const canReroll = eng.money >= rerollCost;

      const trocarW = Math.round(230 * scale);
      const nextW = Math.round(240 * scale);
      const centerBtnX = W / 2;

      const trocarX = centerBtnX - trocarW - Math.round(12 * scale);
      drawButton(
        trocarX,
        btnY,
        trocarW,
        btnH,
        `TROCAR $${rerollCost}`,
        '#f59e0b',
        canReroll,
        () => {
          const res = eng.rerollShop();
          toastRef.current = { text: res.message, time: t + 90 };
          onUpdateRef.current();
        }
      );

      if (isIn({ x: trocarX, y: btnY, w: trocarW, h: btnH })) {
        ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('cada troca custa $1 a mais', trocarX + trocarW / 2, btnY + btnH + Math.round(14 * scale));
      }

      const nextX = centerBtnX + Math.round(12 * scale);
      drawButton(
        nextX,
        btnY,
        nextW,
        btnH,
        'PRÓXIMA MESA',
        '#06b6d4',
        true,
        () => {
          onNextRoundRef.current();
        }
      );

      const boxW = Math.round(200 * scale);
      drawButton(
        startX,
        btnY,
        boxW,
        btnH,
        '📦 CAIXA DE BOLAS',
        '#7e22ce',
        true,
        () => {
          setIsBallRackOpen(true);
        }
      );

      if (toastRef.current.text && t < toastRef.current.time) {
        const fade = Math.min(1, (toastRef.current.time - t) / 20);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        const toastW = Math.round(360 * scale);
        const toastH = Math.round(48 * scale);
        ctx.roundRect(W / 2 - toastW / 2, counterY - Math.round(65 * scale), toastW, toastH, 12);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();

        ctx.font = `700 ${Math.round(16 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(toastRef.current.text, W / 2, counterY - Math.round(41 * scale));
        ctx.restore();
      }

      // Se houver um coringa sendo arrastado, desenha-o sob o cursor com inclinação e sombra
      if (draggedJokerRef.current !== null) {
        const dragIdx = draggedJokerRef.current.index;
        const dragCard = eng.ownedJokers[dragIdx];
        if (dragCard) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(0.06);
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = 18;

          ctx.fillStyle = '#fffdf5';
          ctx.beginPath();
          ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ffd700';
          ctx.stroke();

          ctx.font = `${Math.round(30 * scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(dragCard.icon || '🃏', 0, -cardH / 2 + Math.round(40 * scale));

          ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
          ctx.fillStyle = '#1b1226';
          ctx.fillText(dragCard.name, 0, -cardH / 2 + Math.round(78 * scale), cardW - 8);

          ctx.restore();
        }
      }

      const tipToShow =
        draggedJokerRef.current !== null
          ? null
          : (activeTooltip ||
            (hoveredJokerTip
              ? {
                  x: mouseRef.current.x,
                  y: mouseRef.current.y,
                  title: `Coringa Ativo: ${hoveredJokerTip.name}`,
                  desc: `${hoveredJokerTip.description} • ${hoveredJokerTip.rarity.toUpperCase()}`,
                  cost: Math.max(1, Math.floor(hoveredJokerTip.cost * 0.75)),
                  canAfford: true,
                  col: '#ffd700',
                }
              : null));

      if (tipToShow) {
        const ttW = Math.round(340 * scale);
        const ttH = Math.round(96 * scale);
        const tx = Math.min(Math.max(tipToShow.x, ttW / 2 + 10), W - ttW / 2 - 10);
        const ty = Math.max(tipToShow.y - Math.round(55 * scale), ttH / 2 + 10);

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#261208';
        ctx.strokeStyle = tipToShow.col;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(tx - ttW / 2, ty - ttH / 2, ttW, ttH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = `700 ${Math.round(16 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = tipToShow.col;
        ctx.textAlign = 'center';
        ctx.fillText(tipToShow.title, tx, ty - Math.round(18 * scale));

        ctx.font = `600 ${Math.round(12.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tipToShow.desc, tx, ty + Math.round(4 * scale), ttW - 24);

        ctx.font = `700 ${Math.round(12.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = tipToShow.canAfford ? '#86efac' : '#f87171';
        ctx.fillText(
          tipToShow.canAfford
            ? `Clique para Comprar ($${tipToShow.cost})`
            : `Sem dinheiro suficiente ($${tipToShow.cost})`,
          tx,
          ty + Math.round(28 * scale)
        );
        ctx.restore();
      }

            uiRef.current = ui;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-h-screen overflow-hidden flex items-center justify-center bg-[#080406] relative select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block filter contrast-[1.12] saturate-[1.25]"
      />
      {/* Overlay CRT com scanlines e vinheta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.22) 50%), radial-gradient(circle at 50% 50%, transparent 68%, rgba(0, 0, 0, 0.42) 100%)',
          backgroundSize: '100% 4px, 100% 100%',
        }}
      />
      <BallRackModal
        isOpen={isBallRackOpen}
        onClose={() => setIsBallRackOpen(false)}
        engine={engine}
        onUpdate={onUpdate}
      />

      {/* Modal de Substituição de Bola no Deck */}
      {replaceOfferIndex !== null && (() => {
        const offer = engine.shopManager.ballStock[replaceOfferIndex];
        if (!offer) return null;
        const deckBalls = engine.deck && engine.deck.length > 0
          ? engine.deck
          : [1, 2, 3, 4, 5, 8, 9, 10, 11, 12].map((num) => ({
              id: `deck-${num}`,
              number: num,
              isStripe: num >= 9,
              enhancement: engine.ballDeck.get(num) || null,
            }));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl xl:max-w-6xl bg-[#1b2427] border-[5px] border-[#0b0710] rounded-3xl p-6 sm:p-8 shadow-[0_10px_0_rgba(0,0,0,0.6)] relative max-h-[94vh] overflow-y-auto font-cacapa select-none">
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-[#0b0710] pb-4 mb-5">
                <div>
                  <span className="text-sm sm:text-base uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
                    Caçapa • Oficina de Bolas
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 cacapa-stroke mt-0.5">
                    <span>🔄</span> SUBSTITUIR BOLA NO SEU DECK
                  </h3>
                  <p className="text-sm sm:text-base text-[#9fb4a8] mt-1 cacapa-stroke-sm">
                    Escolha qual bola do seu deck será descartada para dar lugar à nova bola comprada
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#12181a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] px-4 py-2 rounded-2xl font-black text-[#f2b632] text-base sm:text-lg cacapa-stroke-sm">
                    ${engine.money}
                  </div>
                  <button
                    onClick={() => setReplaceOfferIndex(null)}
                    className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-4 py-2 rounded-2xl text-sm sm:text-base font-black cursor-pointer transition-all active:scale-95 cacapa-stroke-sm"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>

              {/* Offer Banner Preview */}
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#12181a] border-[3px] border-[#f2b632] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_0_rgba(0,0,0,0.45)]">
                <div className="flex items-center gap-4">
                  {/* Ball Graphic */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <BallCanvasPreview
                      number={offer.ballNumber}
                      isStripe={offer.isStripe}
                      enhancement={offer.enhancement}
                      size={76}
                      animate={true}
                    />
                    {offer.enhancement && (
                      <div className="absolute top-0 right-0 text-base z-20 drop-shadow">
                        {offer.enhancement.icon}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm uppercase font-black tracking-wider text-[#38bdf8] flex items-center gap-2">
                      <span>Nova Bola a Adicionar (${offer.price}):</span>
                      {offer.hasEnhancement && offer.rarity && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-950"
                          style={{
                            backgroundColor:
                              offer.rarity === 'Lendária'
                                ? '#c084fc'
                                : offer.rarity === 'Rara'
                                ? '#f59e0b'
                                : offer.rarity === 'Incomum'
                                ? '#38bdf8'
                                : '#9fb4a8',
                          }}
                        >
                          {offer.rarity}
                        </span>
                      )}
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-black text-[#f2b632] cacapa-stroke mt-0.5">
                      Bola #{offer.ballNumber} ({offer.isStripe ? 'Listrada' : 'Lisa'}) •{' '}
                      {offer.enhancement ? offer.enhancement.name : 'Bola Normal'}
                    </h4>
                    <p className="text-sm sm:text-base text-[#f4ecd8] mt-1 cacapa-stroke-sm">
                      {offer.enhancement
                        ? offer.enhancement.description
                        : 'Bola comum sem modificador para ajustar seu deck.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-4 py-2 rounded-xl bg-[#22c55e]/20 border-2 border-[#22c55e] text-[#4ade80] font-black text-sm sm:text-base uppercase tracking-wider block">
                    Preço: ${offer.price}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider cacapa-stroke-sm flex items-center gap-2">
                  <span>🎱</span> Selecione a Bola do Seu Deck para Substituir:
                </span>
                <span className="text-xs sm:text-sm text-[#9fb4a8] font-medium">
                  A bola escolhida será descartada e substituída pela nova bola
                </span>
              </div>

              {/* Deck Balls Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
                {deckBalls.map((deckBall, idx) => {
                  const currentEnh = deckBall.enhancement;
                  const isStripe = deckBall.isStripe;

                  return (
                    <div
                      key={deckBall.id || `replace-deck-ball-${idx}`}
                      onClick={() => {
                        const res = engine.buyAndReplaceShopBall(replaceOfferIndex, idx);
                        toastRef.current = { text: res.message, time: timeRef.current + 90 };
                        setReplaceOfferIndex(null);
                        onUpdate();
                      }}
                      className="group p-3.5 sm:p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#12181a] hover:border-[#f2b632] hover:bg-[#3a2a4a] flex flex-col items-center justify-between text-center relative transition-all cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.45)] hover:scale-102 active:scale-95"
                    >
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 border border-[#0b0710] bg-[#0b0710] text-[#9fb4a8] group-hover:text-[#f2b632]">
                        Deck Slot #{idx + 1}
                      </span>

                      <div className="relative my-2 flex items-center justify-center">
                        <BallCanvasPreview
                          number={deckBall.number}
                          isStripe={isStripe}
                          enhancement={currentEnh}
                          size={68}
                          animate={false}
                        />
                        {currentEnh && (
                          <div className="absolute top-0 right-0 text-sm sm:text-base z-20 drop-shadow">
                            {currentEnh.icon}
                          </div>
                        )}
                      </div>

                      <div className="mt-1 w-full">
                        <span className="text-xs sm:text-sm font-bold text-[#9fb4a8] block">
                          Bola #{deckBall.number} {isStripe ? '(Listrada)' : '(Lisa)'}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-black block mt-0.5 truncate max-w-full cacapa-stroke-sm ${
                            currentEnh ? 'text-[#f2b632]' : 'text-white'
                          }`}
                        >
                          {currentEnh ? currentEnh.name : 'Normal'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="mt-3 w-full py-1.5 px-2 rounded-xl bg-[#e0392b] group-hover:bg-[#22c55e] border-2 border-[#0b0710] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all cacapa-stroke-sm shadow-[0_2px_0_rgba(0,0,0,0.4)]"
                      >
                        Substituir
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t-2 border-[#0b0710] flex justify-end">
                <button
                  onClick={() => setReplaceOfferIndex(null)}
                  className="px-6 py-2.5 rounded-2xl bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black text-sm sm:text-base hover:border-[#f2b632] transition-all cursor-pointer cacapa-stroke-sm"
                >
                  Cancelar Compra
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
