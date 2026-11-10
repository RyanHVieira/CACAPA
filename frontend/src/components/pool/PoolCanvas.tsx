import React, { useRef, useEffect, useCallback } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { Ball } from '../../game/models/Ball';
import { Vector2D } from '../../game/models/Vector2D';

interface PoolCanvasProps {
  engine: CacapaPoolEngine;
  onShotFired?: () => void;
  onTableHeightChange?: (height: number) => void;
}

export const PoolCanvas: React.FC<PoolCanvasProps> = ({
  engine,
  onShotFired,
  onTableHeightChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const powerFillBarRef = useRef<HTMLDivElement | null>(null);

  // Refs for high-frequency 60fps animation without React re-render overhead
  const isChargingRef = useRef<boolean>(false);
  const chargeTimeRef = useRef<number>(0);
  const currentPowerRef = useRef<number>(0);
  const isRisingRef = useRef<boolean>(true);
  const aimAngleRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const tallyProgressRef = useRef<number>(0);
  const lastScoreRef = useRef<number>(0);

  // Helper to convert screen coordinates to canvas coordinate space (1040 x 520)
  const getCanvasCoords = useCallback((clientX: number, clientY: number): Vector2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return new Vector2D(
      (clientX - rect.left) * scaleX,
      (clientY - rect.top) * scaleY
    );
  }, []);

  // Update aim direction towards pointer (works anywhere on screen, even while charging!)
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

  // Start charging power
  const startCharging = useCallback(() => {
    if (engine.state !== 'AIMING' || !engine.cueBall || isChargingRef.current) return;
    isChargingRef.current = true;
    chargeTimeRef.current = 0;
    currentPowerRef.current = 0;
    isRisingRef.current = true;
  }, [engine]);

  // Release and fire the shot
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

  // Mouse / Touch handlers on canvas (starts charging)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return; // Left click only
    updateAim(e.clientX, e.clientY);
    startCharging();
  };

  // Global window listeners: track mouse outside the table, even while charging!
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
      if (isChargingRef.current) {
        e.preventDefault();
        isChargingRef.current = false;
        currentPowerRef.current = 0;
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
  }, [updateAim, releaseShot]);

  // Keyboard shortcut: Spacebar holds to charge, releases to shoot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && engine.state === 'AIMING') {
        e.preventDefault();
        startCharging();
      } else if (e.code === 'Escape' && isChargingRef.current) {
        // Cancel shot
        isChargingRef.current = false;
        currentPowerRef.current = 0;
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

  // Authentic Caçapa Center Tally Animation (~0.8s)
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

      // FICHAS Box (Blue)
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

      // MULT Box (Red)
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

      // Center Cross
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

    // Golden Ring Explosion
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

    // Total flying score
    if (progress >= 0.5) {
      const total = chips * mult;
      const targetX = -cx + 120; // Towards HUD
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

  // Trajectory raycast calculation
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

    // 1. Check ball collisions along ray
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

    // 2. Check table cushion bounds if no ball hit or cushion is closer
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

  // Main 60FPS animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      timeRef.current += 0.016;
      const time = timeRef.current;
      const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      // 1. Hit-stop freeze frames
      if (engine.particleSystem.freezeFrames > 0) {
        engine.particleSystem.freezeFrames--;
      } else {
        engine.update(dt);
      }

      // 2. Handle power oscillation while holding (0 -> 100 -> 0 -> 100 ...)
      if (isChargingRef.current && engine.state === 'AIMING') {
        const chargeCycleSpeed = 1.2;
        chargeTimeRef.current += dt * chargeCycleSpeed;

        const cycle = chargeTimeRef.current % 2;
        const currentP = cycle < 1 ? cycle : 2 - cycle;
        currentPowerRef.current = currentP;
        isRisingRef.current = cycle < 1;
      }

      // Check if scoring tally should trigger
      if (engine.currentScore !== lastScoreRef.current) {
        lastScoreRef.current = engine.currentScore;
        tallyProgressRef.current = 1.0; // trigger center tally
      }

      // 3. Render Table with Screen Shake
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const shake = engine.particleSystem.getShakeOffset();
      ctx.save();
      ctx.translate(shake.x, shake.y);

      // Draw table with table index, shake, and time for rail props liquid sway
      engine.table.draw(ctx, engine.ante - 1, engine.particleSystem.shake, time);

      const cueP = isChargingRef.current ? currentPowerRef.current : 0;
      const currentAngle = aimAngleRef.current;

      // 4. Render Trajectory Guideline if aiming
      if (engine.state === 'AIMING' && engine.cueBall && !engine.cueBall.isPocketed) {
        const trajectory = calculateAimTrajectory(
          engine.cueBall.pos,
          currentAngle,
          engine.balls,
          engine.table
        );

        ctx.save();

        // Dotted aim line with animated dash offset
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

        // Ghost ball at impact
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.arc(trajectory.hitPos.x, trajectory.hitPos.y, engine.cueBall.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Target ball deflection line
        if (trajectory.hitBall && trajectory.deflectionDir) {
          const arrowLen = 35 + cueP * 25;
          const targetStart = trajectory.hitBall.pos;
          const targetEnd = targetStart.add(trajectory.deflectionDir.mult(arrowLen));

          ctx.beginPath();
          ctx.moveTo(targetStart.x, targetStart.y);
          ctx.lineTo(targetEnd.x, targetEnd.y);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Arrowhead
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

      // 5. Render Balls
      for (const ball of engine.balls) {
        ball.draw(ctx);
      }

      // 6. Render Cue Stick (1:1 with prototype stick: #0b0710 dark outline, wood body, blue chalk tip)
      if (engine.state === 'AIMING' && engine.cueBall && !engine.cueBall.isPocketed) {
        ctx.save();
        ctx.translate(engine.cueBall.pos.x, engine.cueBall.pos.y);
        ctx.rotate(currentAngle + Math.PI);

        const cuePullBack = 12 + cueP * 75;
        ctx.translate(engine.cueBall.radius + cuePullBack, 0);

        ctx.lineCap = 'round';

        // Outer dark stroke #0b0710 (9px)
        ctx.strokeStyle = '#0b0710';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(280, 0);
        ctx.stroke();

        // Inner wood body #e8c48a (5px)
        ctx.strokeStyle = '#e8c48a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(280, 0);
        ctx.stroke();

        // Dark butt wrap (150 to 280)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(280, 0);
        ctx.stroke();

        // Blue chalk tip #4aa3ff (8px)
        ctx.strokeStyle = '#4aa3ff';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();

        ctx.restore();
      }

      // 7. Update Real-Time Caçapa Power Bar beneath the table
      if (powerFillBarRef.current) {
        if (cueP > 0) {
          powerFillBarRef.current.style.width = `${Math.min(100, Math.max(1, cueP * 100))}%`;
          powerFillBarRef.current.style.backgroundColor = `hsl(${120 - cueP * 120}, 85%, 52%)`;
        } else {
          powerFillBarRef.current.style.width = '0%';
        }
      }

      // 8. Render Particles and Floating Score Popups
      engine.particleSystem.draw(ctx);

      // 9. Center Tally Score Animation (FICHAS × MULT collision)
      if (tallyProgressRef.current > 0 && engine.lastChips > 0 && engine.lastMult > 0) {
        tallyProgressRef.current -= 0.022;
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

      ctx.restore(); // Restore shake translation

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Report table canvas height to parent for 1:1 HUD Y-alignment
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
      className="relative w-full h-full max-h-full flex flex-col items-center justify-center select-none py-1 gap-1"
    >
      {/* 1. Main Table Canvas - Perfectly Scaled & Centered (Tamanho original com zoom completo) */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1040}
          height={560}
          onPointerDown={handlePointerDown}
          className="max-w-full max-h-full w-auto h-auto aspect-[1040/560] object-contain block cursor-crosshair touch-none rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.75)]"
        />
      </div>

      {/* 2. Recessed Caçapa Power Bar cleanly located UNDER the table */}
      <div className="w-[85%] max-w-[850px] h-3 sm:h-3.5 bg-[#1b1226] border-2 border-[#0b0710] rounded-full p-0.5 flex-shrink-0 relative overflow-hidden">
        <div
          ref={powerFillBarRef}
          className="h-full rounded-full transition-none"
          style={{ width: '0%', backgroundColor: '#22c55e' }}
        />
      </div>
    </div>
  );
};
