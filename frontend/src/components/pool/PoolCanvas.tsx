import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { Ball } from '../../game/models/Ball';
import { Vector2D } from '../../game/models/Vector2D';
import { CueRenderer } from '../../game/cues/CueRenderer';
import { BallEnhancementCatalog } from '../../game/enhancements/BallEnhancement';

export const TABLE_PAD_X = 260;
export const TABLE_PAD_Y = 180;
export const CANVAS_WIDTH = 1040 + TABLE_PAD_X * 2; // 1560
export const CANVAS_HEIGHT = 560 + TABLE_PAD_Y * 2; // 920

interface PoolCanvasProps {
  engine: CacapaPoolEngine;
  zoom?: number;
  onShotFired?: () => void;
  onTableHeightChange?: (height: number) => void;
}

export const PoolCanvas: React.FC<PoolCanvasProps> = ({
  engine,
  zoom = 1.0,
  onShotFired,
  onTableHeightChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const powerFillBarRef = useRef<HTMLDivElement | null>(null);

    const isChargingRef = useRef<boolean>(false);
  const chargeTimeRef = useRef<number>(0);
  const currentPowerRef = useRef<number>(0);
  const isRisingRef = useRef<boolean>(true);
  const aimAngleRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const tallyProgressRef = useRef<number>(0);
  const lastScoreRef = useRef<number>(0);

  // Estado para o card de inspeção acionado SOMENTE com o botão direito na bola
  const [inspectedBall, setInspectedBall] = useState<{
    ball: Ball;
    x: number;
    y: number;
  } | null>(null);
  const inspectedBallRef = useRef<{ ball: Ball; x: number; y: number } | null>(null);

  useEffect(() => {
    inspectedBallRef.current = inspectedBall;
  }, [inspectedBall]);

    const getCanvasCoords = useCallback((clientX: number, clientY: number): Vector2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return new Vector2D(
      (clientX - rect.left) * scaleX - TABLE_PAD_X,
      (clientY - rect.top) * scaleY - TABLE_PAD_Y
    );
  }, []);

    const updateAim = useCallback(
    (clientX: number, clientY: number) => {
      if (engine.state !== 'AIMING' || !engine.cueBall) return;
      const coords = getCanvasCoords(clientX, clientY);
      if (coords && engine.cueBall) {
        const dx = coords.x - engine.cueBall.pos.x;
        const dy = coords.y - engine.cueBall.pos.y;
        aimAngleRef.current = Math.atan2(dy, dx);
      }
    },
    [engine, getCanvasCoords]
  );

    const startCharging = useCallback(() => {
    if (engine.state !== 'AIMING' || !engine.cueBall || isChargingRef.current) return;
    isChargingRef.current = true;
    chargeTimeRef.current = 0;
    currentPowerRef.current = 0;
    isRisingRef.current = true;
  }, [engine]);

    const releaseShot = useCallback(() => {
    if (!isChargingRef.current) return;
    isChargingRef.current = false;

    const shotPower = currentPowerRef.current;
    currentPowerRef.current = 0;

    if (shotPower > 0.02 && engine.state === 'AIMING') {
      const fired = engine.shoot(aimAngleRef.current, shotPower);
      if (fired && onShotFired) {
        onShotFired();
      }
    }
  }, [engine, onShotFired]);

  const getTooltipTransform = (x: number, y: number) => {
    const isNearTop = y < 190;
    const isNearLeft = x < 160;
    const isNearRight = x > (window.innerWidth || 1000) - 160;

    if (isNearTop) {
      if (isNearLeft) return 'translate(10px, 20px)';
      if (isNearRight) return 'translate(-100%, 20px)';
      return 'translate(-50%, 20px)';
    }

    if (isNearLeft) return 'translate(10px, -115%)';
    if (isNearRight) return 'translate(-100%, -115%)';
    return 'translate(-50%, -115%)';
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (inspectedBall) {
      setInspectedBall(null);
    }

    if (e.button !== 0 && e.pointerType === 'mouse') return;
    updateAim(e.clientX, e.clientY);
    startCharging();
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      updateAim(e.clientX, e.clientY);
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (e.button === 0 && isChargingRef.current) {
        releaseShot();
      }
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      // Se estava carregando tacada, botão direito cancela a tacada
      if (isChargingRef.current) {
        e.preventDefault();
        isChargingRef.current = false;
        currentPowerRef.current = 0;
        setInspectedBall(null);
        return;
      }

      const coords = getCanvasCoords(e.clientX, e.clientY);
      if (!coords || engine.areBallsMoving()) {
        if (inspectedBallRef.current) {
          e.preventDefault();
          setInspectedBall(null);
        }
        return;
      }

      // Procurar bola ativa sob o cursor do botão direito
      const hitBall = engine.balls.find(
        (b) =>
          !b.isPocketed &&
          !b.isSinking &&
          Math.hypot(coords.x - b.pos.x, coords.y - b.pos.y) <= b.radius + 8
      );

      if (hitBall) {
        e.preventDefault();
        setInspectedBall((prev) =>
          prev?.ball.id === hitBall.id
            ? null
            : {
                ball: hitBall,
                x: e.clientX,
                y: e.clientY,
              }
        );
      } else if (inspectedBallRef.current) {
        e.preventDefault();
        setInspectedBall(null);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('contextmenu', handleGlobalContextMenu);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [updateAim, releaseShot, engine, getCanvasCoords]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && engine.state === 'AIMING') {
        setInspectedBall(null);
        e.preventDefault();
        startCharging();
      } else if (e.code === 'Escape') {
        setInspectedBall(null);
        if (isChargingRef.current) {
          isChargingRef.current = false;
          currentPowerRef.current = 0;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isChargingRef.current) {
        e.preventDefault();
        releaseShot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, startCharging, releaseShot]);

    const renderCenterTally = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    chips: number,
    mult: number,
    progress: number
  ) => {
    const eb = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
    const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const cl = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

    const k1 = cl(progress / 0.35, 0, 1);
    const kMerge = eio(cl((progress - 0.35) / 0.25, 0, 1));
    const kRing = cl((progress - 0.5) / 0.3, 0, 1);
    const kFly = eio(cl((progress - 0.65) / 0.35, 0, 1));

    ctx.save();
    ctx.translate(cx, cy);

    if (progress < 0.65) {
      const s0 = Math.max(0.001, eb(k1)) * (1 + 0.12 * kMerge);
      const off = (1 - kMerge) * 90;
      const bs = 1 - 0.3 * kMerge;

            ctx.save();
      ctx.translate(-off, 0);
      ctx.scale(bs * s0, bs * s0);
      ctx.fillStyle = '#2f86ff';
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-60, -32, 120, 64, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px Oswald, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('FICHAS', 0, -18);

      ctx.font = 'bold 34px Oswald, Impact, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${chips}`, 0, 8);
      ctx.restore();

            ctx.save();
      ctx.translate(off, 0);
      ctx.scale(bs * s0, bs * s0);
      ctx.fillStyle = '#e0392b';
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-60, -32, 120, 64, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px Oswald, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('MULT', 0, -18);

      ctx.font = 'bold 34px Oswald, Impact, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${mult}`, 0, 8);
      ctx.restore();

            ctx.save();
      ctx.font = 'bold 38px Oswald, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffd36a';
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 3;
      ctx.strokeText('×', 0, 2);
      ctx.fillText('×', 0, 2);
      ctx.restore();
    }

        if (kRing > 0 && kRing < 1) {
      ctx.save();
      ctx.globalAlpha = 1 - kRing;
      ctx.strokeStyle = '#ffd36a';
      ctx.lineWidth = 6 * (1 - kRing) + 1;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + kRing * 110, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

        if (progress >= 0.5) {
      const total = chips * mult;
      const targetX = -cx + 120;
      const targetY = -cy + 220;
      const px = targetX * kFly;
      const py = targetY * kFly - 40 * Math.sin(Math.PI * kFly);
      const sc =
        progress < 0.75
          ? 0.8 + 0.6 * eb(cl((progress - 0.5) / 0.25, 0, 1))
          : 1.4 * (1 - kFly * 0.4);

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(sc, sc);
      ctx.font = 'bold 54px Oswald, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#0b0710';
      ctx.lineWidth = 5;
      ctx.strokeText(`+${total.toLocaleString()}`, 0, 0);
      ctx.fillStyle = '#ffd36a';
      ctx.fillText(`+${total.toLocaleString()}`, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  };

    const calculateAimTrajectory = (
    start: Vector2D,
    angle: number,
    balls: Ball[],
    table: typeof engine.table
  ) => {
    const dir = new Vector2D(Math.cos(angle), Math.sin(angle));
    let hitBall: Ball | null = null;
    let hitDist = 9999;
    let hitPos = start.add(dir.mult(hitDist));
    let deflectionDir: Vector2D | null = null;

        for (const b of balls) {
      if (b.isCue || b.isPocketed) continue;

      const toBall = b.pos.sub(start);
      const proj = toBall.dot(dir);

      if (proj > 0) {
        const perpDistSq = toBall.magSq() - proj * proj;
        const combinedR = b.radius * 2;
        if (perpDistSq < combinedR * combinedR) {
          const d = proj - Math.sqrt(combinedR * combinedR - perpDistSq);
          if (d > 0 && d < hitDist) {
            hitDist = d;
            hitBall = b;
            hitPos = start.add(dir.mult(hitDist));
            deflectionDir = b.pos.sub(hitPos).normalize();
          }
        }
      }
    }

        const checkCushionDist = () => {
      let cushionDist = 9999;
      let cushionHit: Vector2D | null = null;
      const r = engine.cueBall?.radius || 17;

      if (dir.x > 0) {
        const d = (table.maxX - start.x - r) / dir.x;
        if (d > 0 && d < cushionDist) {
          cushionDist = d;
          cushionHit = start.add(dir.mult(d));
        }
      } else if (dir.x < 0) {
        const d = (table.minX - start.x + r) / dir.x;
        if (d > 0 && d < cushionDist) {
          cushionDist = d;
          cushionHit = start.add(dir.mult(d));
        }
      }

      if (dir.y > 0) {
        const d = (table.maxY - start.y - r) / dir.y;
        if (d > 0 && d < cushionDist) {
          cushionDist = d;
          cushionHit = start.add(dir.mult(d));
        }
      } else if (dir.y < 0) {
        const d = (table.minY - start.y + r) / dir.y;
        if (d > 0 && d < cushionDist) {
          cushionDist = d;
          cushionHit = start.add(dir.mult(d));
        }
      }

      return { dist: cushionDist, hit: cushionHit };
    };

    const cHit = checkCushionDist();
    if (cHit.hit && cHit.dist < hitDist) {
      hitDist = cHit.dist;
      hitPos = cHit.hit;
      hitBall = null;
      deflectionDir = null;
    }

    return { hitPos, hitBall, deflectionDir };
  };

    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      if (document.hidden) {
        lastTime = currentTime;
        return;
      }

      timeRef.current += 0.016;
      const time = timeRef.current;
      const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;


            if (engine.particleSystem.freezeFrames > 0) {
        engine.particleSystem.freezeFrames--;
      } else {
        engine.update(dt);
      }

      if (inspectedBallRef.current && engine.areBallsMoving()) {
        inspectedBallRef.current = null;
        setInspectedBall(null);
      }

            if (isChargingRef.current && engine.state === 'AIMING') {
        const chargeCycleSpeed = engine.cueId === 'paciente' ? 0.6 : 1.2;
        chargeTimeRef.current += dt * chargeCycleSpeed;

        const cycle = chargeTimeRef.current % 2;
        const currentP = cycle < 1 ? cycle : 2 - cycle;
        currentPowerRef.current = currentP;
        isRisingRef.current = cycle < 1;
      }

            if (engine.currentScore !== lastScoreRef.current) {
        lastScoreRef.current = engine.currentScore;
        tallyProgressRef.current = 1.0;
      }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

      const shake = engine.particleSystem.getShakeOffset();
      ctx.save();
      ctx.translate(TABLE_PAD_X + shake.x, TABLE_PAD_Y + shake.y);

      // Sombra projetada da mesa no piso do salão
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, 10, engine.table.width, engine.table.height, 22);
      } else {
        ctx.rect(0, 10, engine.table.width, engine.table.height);
      }
      ctx.fill();
      ctx.restore();

            engine.table.draw(ctx, engine.ante - 1, engine.particleSystem.shake, time);

      const cueP = isChargingRef.current ? currentPowerRef.current : 0;
      const currentAngle = aimAngleRef.current;

            // Linha de mira / projeção da trajetória
      if (engine.state === 'AIMING' && engine.cueBall && !engine.cueBall.isPocketed) {
        const trajectory = calculateAimTrajectory(
          engine.cueBall.pos,
          currentAngle,
          engine.balls,
          engine.table
        );

        ctx.save();

                ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -time * 26;
        ctx.moveTo(engine.cueBall.pos.x, engine.cueBall.pos.y);
        ctx.lineTo(trajectory.hitPos.x, trajectory.hitPos.y);
        ctx.strokeStyle = isChargingRef.current
          ? `rgba(251, 191, 36, ${0.45 + cueP * 0.5})`
          : 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2 + cueP * 1.5;
        ctx.stroke();

                ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(trajectory.hitPos.x, trajectory.hitPos.y, engine.cueBall.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

                // Efeito causado na outra bola (seta e direção do impacto) - APENAS no Taco de Mauá!
        if (engine.cueId === 'maua' && trajectory.hitBall && trajectory.deflectionDir) {
          const arrowLen = 35 + cueP * 25;
          const targetStart = trajectory.hitBall.pos;
          const targetEnd = targetStart.add(trajectory.deflectionDir.mult(arrowLen));

          ctx.beginPath();
          ctx.moveTo(targetStart.x, targetStart.y);
          ctx.lineTo(targetEnd.x, targetEnd.y);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.stroke();

                    const headAngle = Math.atan2(trajectory.deflectionDir.y, trajectory.deflectionDir.x);
          ctx.beginPath();
          ctx.moveTo(targetEnd.x, targetEnd.y);
          ctx.lineTo(
            targetEnd.x - 8 * Math.cos(headAngle - Math.PI / 6),
            targetEnd.y - 8 * Math.sin(headAngle - Math.PI / 6)
          );
          ctx.lineTo(
            targetEnd.x - 8 * Math.cos(headAngle + Math.PI / 6),
            targetEnd.y - 8 * Math.sin(headAngle + Math.PI / 6)
          );
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
        }

        ctx.restore();
      }

            for (const ball of engine.balls) {
        ball.draw(ctx);
      }

            // Desenho do Taco
      if (engine.state === 'AIMING' && engine.cueBall && !engine.cueBall.isPocketed) {
        ctx.save();
        ctx.translate(engine.cueBall.pos.x, engine.cueBall.pos.y);
        ctx.rotate(currentAngle + Math.PI);

        const cuePullBack = 12 + cueP * 75;
        ctx.translate(engine.cueBall.radius + cuePullBack, 0);

        // Desenha o sprite customizado do taco equipado
        CueRenderer.drawCueStick(ctx, engine.cueId || 'iniciante', 280, 0);

        ctx.restore();
      }

            if (powerFillBarRef.current) {
        if (cueP > 0) {
          powerFillBarRef.current.style.width = `${Math.min(100, Math.max(1, cueP * 100))}%`;
          powerFillBarRef.current.style.backgroundColor = `hsl(${120 - cueP * 120}, 85%, 52%)`;
        } else {
          powerFillBarRef.current.style.width = '0%';
        }
      }

            engine.particleSystem.draw(ctx);

            if (tallyProgressRef.current > 0 && engine.lastChips > 0 && engine.lastMult > 0) {
        // Contagem e exibição da pontuação na tela em ritmo agradável (duração ~1.8s)
        tallyProgressRef.current -= 0.009;
        const progress = 1.0 - tallyProgressRef.current;
        renderCenterTally(
          ctx,
          engine.table.width / 2,
          engine.table.height / 2,
          engine.lastChips,
          engine.lastMult,
          progress
        );
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onTableHeightChange) return;

    let lastH = 0;
    const measureHeight = () => {
      const rect = canvas.getBoundingClientRect();
      const h = Math.round(rect.height);
      if (h > 50 && h !== lastH) {
        lastH = h;
        onTableHeightChange(h);
      }
    };

    measureHeight();
    const ro = new ResizeObserver(measureHeight);
    ro.observe(canvas);
    window.addEventListener('resize', measureHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureHeight);
    };
  }, [onTableHeightChange]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full max-h-full flex flex-col items-center justify-center select-none py-1 gap-1 overflow-visible"
    >
      {/* CARD DE INFORMAÇÕES DA BOLA (ACIONADO SOMENTE COM BOTÃO DIREITO NA BOLA) */}
      {inspectedBall && !isChargingRef.current && (
        <div
          style={{
            left: `${inspectedBall.x}px`,
            top: `${inspectedBall.y}px`,
            transform: getTooltipTransform(inspectedBall.x, inspectedBall.y),
          }}
          className="fixed z-[9990] select-none flex flex-col gap-2 p-3 rounded-2xl bg-[#140c1c]/95 border-[3px] border-[#0b0710] shadow-[0_12px_32px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-md min-w-[220px] max-w-[290px] font-cacapa animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header com mini prévia da bola, nome e botão fechar */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-[2.5px] border-[#0b0710] shadow-md flex-shrink-0"
                style={{
                  backgroundColor: inspectedBall.ball.isCue ? '#ffffff' : inspectedBall.ball.color,
                  color:
                    inspectedBall.ball.isCue ||
                    inspectedBall.ball.number === 1 ||
                    inspectedBall.ball.number === 9
                      ? '#0b0710'
                      : '#ffffff',
                }}
              >
                {inspectedBall.ball.isCue ? '⚪' : inspectedBall.ball.number}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-white font-black text-sm tracking-wide leading-tight truncate cacapa-stroke-sm">
                  {inspectedBall.ball.isCue
                    ? 'BOLA BRANCA'
                    : inspectedBall.ball.isEight
                    ? 'BOLA 8 (PRETA)'
                    : `BOLA ${inspectedBall.ball.number}`}
                </span>
                <span className="text-[10px] text-[#9ff1ff] font-bold uppercase tracking-wider leading-none">
                  {inspectedBall.ball.isCue
                    ? 'Tacadeira'
                    : inspectedBall.ball.isEight
                    ? 'Neutra (Preta)'
                    : inspectedBall.ball.isSolid
                    ? 'Bola Lisa (1 a 7)'
                    : 'Bola Listrada (9 a 15)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setInspectedBall(null)}
              className="w-6 h-6 rounded-lg bg-[#251733] hover:bg-[#3d2654] border border-[#0b0710] text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Valor da Bola em Fichas */}
          <div className="flex items-center justify-between bg-[#1f132b] px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
            <span className="text-xs text-[#9fb4a8] font-bold">Valor da Bola:</span>
            <span className="text-sm sm:text-base font-black text-[#ffd36a] cacapa-stroke-sm">
              {inspectedBall.ball.isCue
                ? '0 Fichas'
                : `+${inspectedBall.ball.isEight ? 60 : inspectedBall.ball.baseChips ?? (10 + inspectedBall.ball.number * 5)} Fichas`}
            </span>
          </div>

          {/* Aviso especial para bola branca */}
          {inspectedBall.ball.isCue && (
            <div className="text-[11px] text-[#ff5a4a] bg-[#ff3b30]/15 px-2.5 py-1.5 rounded-xl border border-[#ff3b30]/30 font-bold leading-tight">
              ⚠️ Não encaçape! Comete falta e perde tacada.
            </div>
          )}

          {/* Bônus de ouro se houver */}
          {inspectedBall.ball.goldBonus > 0 && (
            <div className="flex items-center justify-between bg-[#fbbf24]/15 px-3 py-1.5 rounded-xl border border-[#fbbf24]/30 text-[#fef08a] text-xs font-black">
              <span>Bônus em Dinheiro:</span>
              <span>+${inspectedBall.ball.goldBonus}</span>
            </div>
          )}

          {/* Modificadores */}
          {(() => {
            const mod =
              inspectedBall.ball.enhancement ||
              (engine.ballMods?.[inspectedBall.ball.number]
                ? BallEnhancementCatalog.getById(engine.ballMods[inspectedBall.ball.number])
                : null);

            if (mod) {
              return (
                <div
                  className="flex flex-col gap-1 p-2 rounded-xl border"
                  style={{
                    backgroundColor: `${mod.color || '#3ec1d3'}15`,
                    borderColor: `${mod.color || '#3ec1d3'}45`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{mod.icon || '✨'}</span>
                    <span
                      className="text-xs font-black uppercase tracking-wide leading-none truncate"
                      style={{ color: mod.color || '#3ec1d3' }}
                    >
                      {mod.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug font-sans font-medium">
                    {mod.description}
                  </p>
                </div>
              );
            }

            return (
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1 text-center">
                Sem modificadores ativos
              </div>
            );
          })()}

          {/* Dica de fechamento */}
          <div className="text-[9px] text-slate-400 font-medium text-center pt-0.5 border-t border-white/5">
            Clique com o botão direito, esquerdo ou Esc para fechar
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-visible">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          className="max-w-full max-h-full w-auto h-auto aspect-[1560/920] object-contain block cursor-crosshair touch-none transition-transform duration-100 ease-out"
        />
      </div>

            <div className="w-[85%] max-w-[850px] h-3 sm:h-3.5 bg-[#1b1226] border-2 border-[#0b0710] rounded-full p-0.5 flex-shrink-0 relative overflow-hidden z-20 shadow-md pointer-events-none">
        <div
          ref={powerFillBarRef}
          className="h-full rounded-full transition-none"
          style={{ width: '0%', backgroundColor: '#22c55e' }}
        />
      </div>
    </div>
  );
};
