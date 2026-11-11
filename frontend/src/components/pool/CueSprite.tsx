import React, { useEffect, useRef } from 'react';
import { CueRenderer } from '../../game/cues/CueRenderer';

interface CueSpriteProps {
  cueId: string;
  className?: string;
  width?: number;
  height?: number;
}

export const CueSprite: React.FC<CueSpriteProps> = ({
  cueId,
  className = '',
  width = 280,
  height = 28,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Escala para renderização nítida (Retina / High DPI)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    // Centraliza verticalmente e deixa margem para a ponta e calço
    const padX = 6;
    const drawLen = width - padX * 2;
    ctx.translate(padX, height / 2);
    CueRenderer.drawCueStick(ctx, cueId, drawLen, 0);
    ctx.restore();
  }, [cueId, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`select-none pointer-events-none drop-shadow-md ${className}`}
    />
  );
};
