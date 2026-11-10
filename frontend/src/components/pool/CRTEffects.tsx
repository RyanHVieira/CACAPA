// CRT Effects - 1:1 clone of prototype style.css CRT effects
// Includes animated scanlines, vignette, curvature, chromatic aberration

import React, { useRef, useEffect } from 'react';

interface CRTEffectsProps {
  enabled?: boolean;
  intensity?: number;
}

export const CRTEffects: React.FC<CRTEffectsProps> = ({
  enabled = true,
  intensity = 1.0
}) => {
  const scanlineRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const chromaticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    // Animate scanline opacity (matching prototype @keyframes fl)
    let frame = 0;
    const animateScanlines = () => {
      if (!scanlineRef.current) return;
      frame++;
      // Prototype: 0.14s cycle, opacity varies between ~0.5 and 0.82
      const cycle = (frame % 9) / 9; // ~0.15s at 60fps
      const opacity = 0.5 + 0.32 * Math.sin(cycle * Math.PI * 2);
      scanlineRef.current.style.opacity = `${opacity * intensity}`;
      requestAnimationFrame(animateScanlines);
    };

    animateScanlines();
  }, [enabled, intensity]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. Animated Scanlines (matching prototype #w::before) */}
      <div
        ref={scanlineRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, ${0.3 * intensity}) 0px,
              rgba(0, 0, 0, ${0.3 * intensity}) 1px,
              transparent 1px,
              transparent 3px
            )
          `,
          backgroundSize: '100% 3px',
          animation: 'scanline-flicker 0.14s infinite',
        }}
      />

      {/* 2. CRT Vignette & Curvature (matching prototype #w::after) */}
      <div
        ref={vignetteRef}
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse at center,
              transparent 50%,
              rgba(0, 0, 0, ${0.7 * intensity}) 100%
            ),
            linear-gradient(
              90deg,
              rgba(255, 0, 60, ${0.05 * intensity}),
              transparent 30%,
              transparent 70%,
              rgba(0, 200, 255, ${0.06 * intensity})
            )
          `,
          boxShadow: 'inset 0 0 70px rgba(0, 0, 0, 0.8)',
        }}
      />

      {/* 3. Chromatic Aberration (subtle RGB shift on edges) */}
      <div
        ref={chromaticRef}
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(255, 0, 0, ${0.02 * intensity}) 0%,
              transparent 10%,
              transparent 90%,
              rgba(0, 0, 255, ${0.02 * intensity}) 100%
            )
          `,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* 4. Screen curvature border (matching prototype border-radius 3%/5% and box-shadow) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: '3% / 5%',
          boxShadow: `
            0 0 0 3px #000,
            0 0 70px #000 inset,
            inset 0 0 100px rgba(0,0,0,0.85),
            inset 0 0 160px rgba(0,0,0,0.6)
          `,
        }}
      />

      {/* 5. Subtle noise/grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
          `,
          mixBlendMode: 'overlay',
        }}
      />

      <style>{`
        @keyframes scanline-flicker {
          0% { opacity: 0.5; }
          50% { opacity: 0.82; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Canvas-based CRT shader for more authentic effect (WebGL-style but using 2D canvas)
export const CRTShader: React.FC<{
  enabled?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  time: number;
  intensity?: number;
}> = ({
  enabled = true,
  canvasRef,
  time,
  intensity = 1.0
}) => {
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const shaderCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const shaderCanvas = shaderCanvasRef.current;
    if (!shaderCanvas) return;

    // Create offscreen canvas for CRT post-processing
    shaderCanvas.width = canvas.width;
    shaderCanvas.height = canvas.height;
    const ctx = shaderCanvas.getContext('2d');
    if (!ctx) return;
    shaderCtxRef.current = ctx;

    let animId: number;
    const render = () => {
      if (!shaderCtxRef.current || !canvasRef.current) return;

      const src = canvasRef.current;
      const dst = shaderCtxRef.current;
      const w = src.width;
      const h = src.height;

      // Clear
      dst.clearRect(0, 0, w, h);

      // 1. Draw source with slight scale for curvature
      dst.save();
      dst.scale(1.02, 1.02);
      dst.translate(-w * 0.01, -h * 0.01);
      dst.drawImage(src, 0, 0);
      dst.restore();

      // 2. Scanlines
      dst.fillStyle = `rgba(0, 0, 0, ${0.15 * intensity})`;
      for (let y = 0; y < h; y += 3) {
        const flicker = 0.5 + 0.32 * Math.sin(time * 0.14 * 60 + y * 0.1);
        dst.globalAlpha = flicker * intensity * 0.3;
        dst.fillRect(0, y, w, 1);
      }
      dst.globalAlpha = 1;

      // 3. Vignette
      const vignetteGrad = dst.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.6);
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(1, `rgba(0,0,0,${0.8 * intensity})`);
      dst.fillStyle = vignetteGrad;
      dst.fillRect(0, 0, w, h);

      // 4. Chromatic aberration (RGB channel shift)
      dst.globalCompositeOperation = 'screen';
      dst.filter = 'blur(0.5px)';

      // Red channel shift right
      dst.save();
      dst.translate(1 * intensity, 0);
      dst.globalAlpha = 0.03 * intensity;
      dst.drawImage(src, 0, 0);
      dst.restore();

      // Blue channel shift left
      dst.save();
      dst.translate(-1 * intensity, 0);
      dst.globalAlpha = 0.03 * intensity;
      dst.drawImage(src, 0, 0);
      dst.restore();

      dst.filter = 'none';
      dst.globalCompositeOperation = 'source-over';

      // 5. Contrast & saturation boost (matching prototype filter: contrast(1.12) saturate(1.25))
      dst.filter = `contrast(${1.12 * intensity}) saturate(${1.25 * intensity})`;
      dst.drawImage(src, 0, 0);
      dst.filter = 'none';

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [enabled, canvasRef, time, intensity]);

  return (
    <canvas
      ref={shaderCanvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-40"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};