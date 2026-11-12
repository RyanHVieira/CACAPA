import React, { useRef, useEffect } from 'react';
import { draw3DBall, createPreviewMatrix, type BallRenderable, type BallEnhancementLike } from '../../game/models/Ball';

interface BallCanvasPreviewProps {
  number: number;
  isStripe?: boolean;
  enhancement?: BallEnhancementLike;
  size?: number;
  className?: string;
  animate?: boolean;
  shadow?: boolean;
}

export const BallCanvasPreview: React.FC<BallCanvasPreviewProps> = ({
  number,
  isStripe,
  enhancement,
  size = 64,
  className = '',
  animate = false,
  shadow = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = Math.random() * 100;
    let lastTick = 0;
    const FRAME_MS = 1000 / 30; // 30fps para preview de bola animada

    const render = (now: number) => {
      if (animate) {
        animId = requestAnimationFrame(render);
        if (document.hidden) return;
        if (now - lastTick < FRAME_MS - 1) return;
        lastTick = now;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const r = (canvas.width * 0.40);
      const tiltX = animate ? 0.22 + Math.sin(t * 0.03) * 0.08 : 0.22;
      const tiltY = animate ? -0.14 + Math.cos(t * 0.025) * 0.08 : -0.14;
      const spin = animate ? Math.sin(t * 0.02) * 0.06 : 0;

      const M = createPreviewMatrix(tiltX, tiltY, spin);

      const ballData: BallRenderable = {
        number,
        isStripe: number === 8 ? false : (isStripe ?? (number >= 9 && number <= 15)),
        enhancement,
        M,
      };

      draw3DBall(ctx, ballData, r, {
        shadow,
        shadowOffsetX: 2,
        shadowOffsetY: 3,
        res: 1.5,
      });

      ctx.restore();

      if (animate) {
        t += 1;
      }
    };

    if (animate) {
      animId = requestAnimationFrame(render);
    } else {
      render(0);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [number, isStripe, enhancement, size, animate, shadow]);

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(size * 2)}
      height={Math.round(size * 2)}
      style={{ width: size, height: size }}
      className={`shrink-0 select-none ${className}`}
    />
  );
};
