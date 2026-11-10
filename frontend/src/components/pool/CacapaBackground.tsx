// Caçapa Background - 1:1 clone of prototype artistic style
// Uses per-table themed scenes + CRT effects + fluid swirling plasma animation

import React, { useRef, useEffect } from 'react';
import { createSceneRenderer } from '../../game/scenes/SceneRenderer';
import { CRTEffects } from './CRTEffects';

interface CacapaBackgroundProps {
  tableIndex?: number;
  shake?: { x: number; y: number };
}

export const CacapaBackground: React.FC<CacapaBackgroundProps> = ({
  tableIndex = 0,
  shake = { x: 0, y: 0 },
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ReturnType<typeof createSceneRenderer> | null>(null);

  // Initialize renderer
  useEffect(() => {
    rendererRef.current = createSceneRenderer(tableIndex);
  }, [tableIndex]);

  // Update renderer state
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setTable(tableIndex);
      rendererRef.current.setShake(shake.x, shake.y);
    }
  }, [tableIndex, shake.x, shake.y]);

  // Main 60fps animation loop (fluid continuous time advancement)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let t = 0;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      if (!rendererRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Advance time smoothly for fluid Caçapa plasma swirl & ambient scene motion
      t += 0.018;
      rendererRef.current.setTime(t);

      // Render stretched and centered across entire viewport
      rendererRef.current.render(ctx, canvasRef.current.width, canvasRef.current.height);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full">
      {/* 1. Fluid Animated Scene Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* 2. CRT Scanlines, Vignette & Chromatic Aberration */}
      <CRTEffects enabled={true} intensity={1.0} />
    </div>
  );
};
