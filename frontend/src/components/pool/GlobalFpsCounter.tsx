import React, { useEffect, useRef } from 'react';

interface GlobalFpsCounterProps {
  show?: boolean;
  onToggle?: () => void;
}

export const GlobalFpsCounter: React.FC<GlobalFpsCounterProps> = ({
  show = true,
  onToggle,
}) => {
  const fpsTextRef = useRef<HTMLSpanElement | null>(null);
  const fpsDotRef = useRef<HTMLSpanElement | null>(null);
  const fpsFramesRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      fpsFramesRef.current++;
      const elapsed = now - fpsLastTimeRef.current;

      if (elapsed >= 350) {
        const fps = Math.round((fpsFramesRef.current * 1000) / elapsed);
        fpsFramesRef.current = 0;
        fpsLastTimeRef.current = now;

        if (fpsTextRef.current) {
          fpsTextRef.current.textContent = `${fps} FPS`;
          if (fps >= 50) {
            fpsTextRef.current.className = 'text-emerald-400 font-mono font-black text-xs tracking-wider';
            if (fpsDotRef.current) {
              fpsDotRef.current.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#22c55e]';
            }
          } else if (fps >= 30) {
            fpsTextRef.current.className = 'text-amber-400 font-mono font-black text-xs tracking-wider';
            if (fpsDotRef.current) {
              fpsDotRef.current.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]';
            }
          } else {
            fpsTextRef.current.className = 'text-rose-500 font-mono font-black text-xs tracking-wider';
            if (fpsDotRef.current) {
              fpsDotRef.current.className = 'w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#ef4444]';
            }
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      title="Taxa de Quadros por Segundo (FPS). Fixo na tela. Clique para alternar ou use as Opções."
      className="fixed top-2 right-2 sm:top-3 sm:right-3 z-[9999] select-none flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0e0717]/90 border-2 border-[#0b0710] shadow-[0_4px_12px_rgba(0,0,0,0.85)] backdrop-blur-sm cursor-pointer hover:border-[#3ec1d3] hover:scale-105 active:scale-95 transition-all font-cacapa"
    >
      <span
        ref={fpsDotRef}
        className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#22c55e]"
      />
      <span
        ref={fpsTextRef}
        className="text-emerald-400 font-mono font-black text-xs tracking-wider"
      >
        60 FPS
      </span>
    </button>
  );
};
