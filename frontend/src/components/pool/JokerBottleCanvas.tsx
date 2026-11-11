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

interface JokerBottleCanvasProps {
  card: Card;
  width?: number;
  height?: number;
  isHovered?: boolean;
  isActivating?: boolean;
  className?: string;
}

export const JokerBottleCanvas: React.FC<JokerBottleCanvasProps> = ({
  card,
  width = 80,
  height = 120,
  isHovered = false,
  isActivating = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = Math.random() * 50;

    const render = () => {
      t += 0.035;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const theme = getJokerBottleTheme(card);
      const isLegendary = card.rarity === 'Lendária' || card.edition !== 'Base';

      ctx.save();
      // O frasco tem altura total de ~210px do topo (-200) até a base (0).
      // Queremos que caiba centralizado em W e H.
      const scale = (H * 0.88) / 215;
      const bx = W / 2;
      const by = H * 0.94;

      // Leve flutuação e respiração quando hover ou ativação
      const floatY = isHovered ? -4 : isActivating ? -8 : 0;
      const wobble = isHovered ? Math.sin(t * 3) * 0.03 : 0;

      ctx.translate(bx, by + floatY);
      ctx.rotate(wobble);
      ctx.scale(scale, scale);

      // Sombra na base (Coaster sutil)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 4, 30, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();
      ctx.restore();

      // Brilho externo da Garrafa (Glow)
      if (isLegendary || isHovered || isActivating) {
        ctx.save();
        ctx.shadowColor = isLegendary ? '#ffd700' : theme.glow;
        ctx.shadowBlur = isActivating ? 30 : isHovered ? 20 : 12;
        ctx.strokeStyle = isLegendary ? 'rgba(255, 215, 0, 0.6)' : theme.glow;
        ctx.lineWidth = 3;
        ctx.stroke(BOTTLE_PATH);
        ctx.restore();
      }

      // Clip no corpo do vidro
      ctx.save();
      ctx.clip(BOTTLE_PATH);

      // Vidro translúcido cilíndrico
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

      // Fundo espesso de vidro (punt)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.ellipse(0, -6, 22, 6, 0, 0, Math.PI);
      ctx.fill();

      // Líquido dinâmico com ondulação na superfície
      const ly = -118 + Math.sin(t * 1.5) * 1.5;

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

      // Menisco da superfície do líquido
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

      // Bolhas subindo
      for (let b = 0; b < 5; b++) {
        const by = -((t * 15 + b * 22) % (-ly - 8));
        const bbx = Math.sin(b * 3.1 + t * 0.8) * (14 + b);
        const alpha = Math.max(0, 1 + by / (-ly));
        ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * alpha})`;
        ctx.beginPath();
        ctx.arc(bbx, by, 1.2 + (b % 2) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // RÓTULO CILÍNDRICO (Projeção Senoidal)
      const R0 = 33;
      const TH = 0.3 * Math.sin(t * 0.6);
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

        // Bloco escuro do Coringa
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
        ctx.font = '700 9px Oswald, sans-serif';
        ctx.fillStyle = isLegendary ? '#ffd700' : '#fef08a';
        ctx.fillText(card.name, 0, 44, 44);

        // Sombra cilíndrica Lambert
        const midAngle = ((s0 + s1) * 0.5) / R0 + TH;
        const shadowAlpha = (1 - Math.cos(midAngle)) * 0.70;
        ctx.fillStyle = `rgba(11, 7, 16, ${Math.max(0, shadowAlpha)})`;
        ctx.fillRect(s0, 0, s1 - s0, 58);

        ctx.restore();
      }

      // Bordas do papel
      const lx0 = R0 * Math.sin(Math.min(1.5, Math.max(-1.5, SE[0] / R0 + TH)));
      const lx1 = R0 * Math.sin(Math.min(1.5, Math.max(-1.5, SE[3] / R0 + TH)));
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lx0, -95);
      ctx.lineTo(lx0, -37);
      ctx.moveTo(lx1, -95);
      ctx.lineTo(lx1, -37);
      ctx.stroke();

      // Reflexos especulares de vidro
      const hs = TH * 1.6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
      ctx.fillRect(-24 + hs, -120, 5, 88);
      ctx.fillRect(-7, -170, 3, 45);

      // Rim light
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(28, -115, 2.5, 85);

      ctx.restore(); // Fecha clip

      // Parede de vidro interna
      ctx.save();
      ctx.scale(0.88, 0.97);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.8;
      ctx.stroke(BOTTLE_PATH);
      ctx.restore();

      // Rolha de cortiça
      ctx.fillStyle = isLegendary ? '#d97706' : '#b07d4b';
      ctx.beginPath();
      ctx.roundRect(-8, -198, 16, 12, 2);
      ctx.fill();
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Textura da rolha
      ctx.strokeStyle = 'rgba(11, 7, 16, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -193);
      ctx.lineTo(4, -193);
      ctx.moveTo(-3, -190);
      ctx.lineTo(6, -190);
      ctx.stroke();

      // Colarinho dourado no gargalo se lendário
      if (isLegendary) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-10.5, -174, 21, 6);
        ctx.strokeStyle = '#0b0710';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-10.5, -174, 21, 6);
      }

      // Contorno cartoon grosso externo
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 3.2;
      ctx.stroke(BOTTLE_PATH);

      // Selo de lendário flutuante
      if (isLegendary) {
        ctx.font = '700 9px Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#0b0710';
        ctx.lineWidth = 2.5;
        ctx.strokeText('★ LENDÁRIO', 0, -208);
        ctx.fillText('★ LENDÁRIO', 0, -208);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [card, isHovered, isActivating]);

  return (
    <canvas
      ref={canvasRef}
      width={width * 2}
      height={height * 2}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`select-none pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] ${className}`}
    />
  );
};
