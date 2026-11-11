
import React, { useRef, useEffect } from 'react';

export interface CRTEffectsProps {
  enabled?: boolean;
  intensity?: number;
}

/**
 * CRT Balatro-Style:
 * - Scanlines finas e sutis (sem flicker violento, sem barras rolando e sem estática suja)
 * - Vinheta suave nas bordas e cantos simulando tela convexa
 * - Leve aberração cromática (franja RGB) apenas nos extremos
 * - Brilho/reflexo curvado de vidro arcade de alta qualidade
 * - Preserva 100% da nitidez e legibilidade dos textos e cartas
 */
export const CRTEffects: React.FC<CRTEffectsProps> = ({
  enabled = true,
  intensity = 1.0,
}) => {
  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
    >
      {/* 1. Balatro Scanlines: mais espaçadas e limpas (a cada 6px) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, ${0.18 * intensity}) 0px,
            rgba(0, 0, 0, ${0.18 * intensity}) 1.2px,
            transparent 1.2px,
            transparent 6px
          )`,
          backgroundSize: '100% 6px',
          animation: 'crt-scanline-flicker 0.14s infinite',
        }}
      />

      {/* 2. CRT Vignette & Curvature: cantos escurecidos profundos de tubo arcade */}
      <div
        className="absolute inset-0 pointer-events-none"
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
          boxShadow: `inset 0 0 70px rgba(0, 0, 0, ${0.85 * intensity})`,
        }}
      />

      {/* 3. Reflexo de vidro curvo característico da tela do Balatro */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 70% 30% at 50% -5%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        }}
      />

      <style>{`
        @keyframes crt-scanline-flicker {
          0% { opacity: 0.95; }
          50% { opacity: 0.82; }
          100% { opacity: 0.95; }
        }
      `}</style>
    </div>
  );
};

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

            dst.clearRect(0, 0, w, h);

            dst.save();
      dst.scale(1.02, 1.02);
      dst.translate(-w * 0.01, -h * 0.01);
      dst.drawImage(src, 0, 0);
      dst.restore();

            dst.fillStyle = `rgba(0, 0, 0, ${0.15 * intensity})`;
      for (let y = 0; y < h; y += 3) {
        const flicker = 0.5 + 0.32 * Math.sin(time * 0.14 * 60 + y * 0.1);
        dst.globalAlpha = flicker * intensity * 0.3;
        dst.fillRect(0, y, w, 1);
      }
      dst.globalAlpha = 1;

            const vignetteGrad = dst.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.6);
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(1, `rgba(0,0,0,${0.8 * intensity})`);
      dst.fillStyle = vignetteGrad;
      dst.fillRect(0, 0, w, h);

            dst.globalCompositeOperation = 'screen';
      dst.filter = 'blur(0.5px)';

            dst.save();
      dst.translate(1 * intensity, 0);
      dst.globalAlpha = 0.03 * intensity;
      dst.drawImage(src, 0, 0);
      dst.restore();

            dst.save();
      dst.translate(-1 * intensity, 0);
      dst.globalAlpha = 0.03 * intensity;
      dst.drawImage(src, 0, 0);
      dst.restore();

      dst.filter = 'none';
      dst.globalCompositeOperation = 'source-over';

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