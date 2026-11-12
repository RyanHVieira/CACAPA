import React, { useRef, useEffect } from 'react';
import { CueRenderer } from '../../game/cues/CueRenderer';

interface VerticalCueCanvasProps {
  cueId: string;
  height?: number;
  width?: number;
  className?: string;
  isUnlocked?: boolean;
}

export const VerticalCueCanvas: React.FC<VerticalCueCanvasProps> = ({
  cueId,
  height = 320,
  width = 90,
  className = '',
  isUnlocked = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let lastTick = 0;
    const FRAME_MS = 1000 / 30; // 30fps para preview do taco

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (document.hidden) return;
      if (now - lastTick < FRAME_MS - 1) return;
      lastTick = now;

      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dpr = 2;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Leve flutuação vertical orgânica (respiração)
      const bob = Math.sin(t) * 3;
      const cx = w / 2;

      // Sombra de contato no chão sob o calço do taco
      const floorY = h - 16;
      ctx.beginPath();
      ctx.ellipse(cx, floorY + 6, 18, 5.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();

      // Halo de luz ambiente vertical atrás do taco
      const haloGrad = ctx.createRadialGradient(cx, h / 2, 8, cx, h / 2, h * 0.45);
      if (cueId === 'maua') {
        haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else if (cueId === 'gelo') {
        haloGrad.addColorStop(0, 'rgba(165, 243, 252, 0.25)');
        haloGrad.addColorStop(1, 'rgba(165, 243, 252, 0)');
      } else if (cueId === 'magnata') {
        haloGrad.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
        haloGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      } else if (cueId === 'forte') {
        haloGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
        haloGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (cueId === 'trapaceiro') {
        haloGrad.addColorStop(0, 'rgba(192, 132, 252, 0.22)');
        haloGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
      } else {
        haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
        haloGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      }
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, w, h);

      // Comprimento do taco na escala vertical
      const stickLength = h - 36;
      const topY = 16 + bob;

      // Desenha o taco em pé: ponta para cima (+Y para baixo no rotate)
      ctx.save();
      ctx.translate(cx, topY);
      ctx.rotate(Math.PI / 2); // 90 graus: X se torna Y (de cima para baixo)

      // Se bloqueado, renderiza mais escuro
      if (!isUnlocked) {
        ctx.filter = 'brightness(0.4) grayscale(0.7)';
      }

      CueRenderer.drawCueStick(ctx, cueId, stickLength, 0);

      ctx.restore();

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [cueId, height, width, isUnlocked]);

  return (
    <canvas
      ref={canvasRef}
      width={width * 2}
      height={height * 2}
      style={{ width, height }}
      className={`select-none pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] ${className}`}
    />
  );
};
