import { Vector2D } from './Vector2D';
import type { BallEnhancement } from '../enhancements/BallEnhancement';

export type Mat3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export function rotM(M: Mat3, wx: number, wy: number, wz: number): Mat3 {
  const th = Math.hypot(wx, wy, wz);
  if (th < 1e-9) return M;

  const kx = wx / th;
  const ky = wy / th;
  const kz = wz / th;

  const c = Math.cos(th);
  const s = Math.sin(th);

  return M.map((v) => {
    const d = (kx * v[0] + ky * v[1] + kz * v[2]) * (1 - c);

    const cx = ky * v[2] - kz * v[1];
    const cy = kz * v[0] - kx * v[2];
    const cz = kx * v[1] - ky * v[0];

    return [
      v[0] * c + cx * s + kx * d,
      v[1] * c + cy * s + ky * d,
      v[2] * c + cz * s + kz * d,
    ];
  }) as Mat3;
}

export function initM(): Mat3 {
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  return rotM(
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    rnd(-0.7, 0.7),
    rnd(-0.7, 0.7),
    rnd(-0.5, 0.5)
  );
}

/**
 * Cria uma matriz de orientação estática ou animada ideal para pré-visualização,
 * garantindo que o disco com o número fique virado para a câmera com uma inclinação 3D elegante.
 */
export function createPreviewMatrix(tiltX: number = 0.22, tiltY: number = -0.14, spin: number = 0): Mat3 {
  const base: Mat3 = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  return rotM(base, tiltX, tiltY, spin);
}

const SETZ = 0.82;

export function settleBall(ball: Ball, snap: boolean = false): boolean {
  if (ball.isPocketed || ball.isCue) return true;

  const [x, y, z] = ball.M[2];

  if (z >= SETZ - 0.002) return true;

  const sp = ball.speed;

  if (!snap && sp > 0.9) return false;

  const cl = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const rem = Math.acos(cl(z, -1, 1)) - Math.acos(SETZ);

  const k = snap
    ? 1
    : 0.13 * Math.pow(cl(1 - sp / 0.9, 0, 1), 1.3);

  const st = snap
    ? rem
    : Math.min(rem, Math.max(rem * k, 0.004));

  const n = Math.hypot(x, y);

  const ax = n < 1e-4 ? 1 : y / n;
  const ay = n < 1e-4 ? 0 : -x / n;

  ball.M = rotM(ball.M, ax * st, ay * st, 0);
  ball.isDirty = true;

  return false;
}

export const BALL_COLORS: Record<number, string> = {
  0: '#ffffff',
  1: '#f2c230',
  2: '#2a52c9',
  3: '#d6322a',
  4: '#7a3bb0',
  5: '#ee7a1f',
  6: '#1f9a4a',
  7: '#8c2a2a',
  8: '#16121c',
  9: '#f2c230',
  10: '#2a52c9',
  11: '#d6322a',
  12: '#7a3bb0',
  13: '#ee7a1f',
  14: '#1f9a4a',
  15: '#8c2a2a',
};

// ---------------------------------------------------------------
// Textura esférica por pixel (igual ao protótipo HTML)
// ---------------------------------------------------------------

type TexBuf = { c: HTMLCanvasElement; x: CanvasRenderingContext2D; d: ImageData };

const texCache = new Map<number, TexBuf>();

function hexToRgb(h: string): [number, number, number] {
  h = h.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)) as [
    number,
    number,
    number
  ];
}

export type BallEnhancementLike = {
  id?: string;
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  drawEffect?: (ctx: CanvasRenderingContext2D, ball: any) => void;
} | null;

export interface BallRenderable {
  number: number;
  isCue?: boolean;
  isStripe?: boolean;
  M: Mat3;
  color?: string;
  enhancement?: BallEnhancementLike;
  radius?: number;
}

/**
 * Cada pixel da bola vira um ponto 3D (x, y, z) na esfera.
 * Esse ponto é levado para o referencial da bola usando as linhas de M,
 * e a cor sai de (lx, ly, lz):
 *  - faixa: |ly| > 0.55 fica branco (calotas), o meio mantém a cor;
 *  - número: lz > 0.745 vira o disco branco com anel escuro;
 *  - bola branca: branca pura sem pontos vermelhos.
 */
export function drawBallTexture(
  ctx: CanvasRenderingContext2D,
  ball: BallRenderable,
  r: number,
  baseColor: string,
  res: number = 3
): void {
  const N = Math.ceil((2 * r + 2) * res);

  let o = texCache.get(N);

  if (!o) {
    const c = document.createElement('canvas');
    c.width = c.height = N;

    const x = c.getContext('2d')!;

    o = { c, x, d: x.createImageData(N, N) };
    texCache.set(N, o);
  }

  const d = o.d.data;
  const [a0, a1, a2] = ball.M;
  const col = hexToRgb(baseColor);
  const half = N / 2;

  const isCue = !!ball.isCue;
  const isEight = ball.number === 8;
  const striped = !isCue && !isEight && (ball.isStripe ?? (ball.number >= 9 && ball.number <= 15));
  const hasNumber = !isCue;

  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5 - half) / res / r;
      const y = (j + 0.5 - half) / res / r;

      const r2 = x * x + y * y;
      const p = (j * N + i) * 4;

      if (r2 > 1.1) {
        d[p + 3] = 0;
        continue;
      }

      const sqrtR2 = Math.sqrt(r2);
      const z = Math.sqrt(Math.max(0, 1 - r2));

      // Ponto da esfera no referencial da bola.
      const _lx = a0[0] * x + a0[1] * y + a0[2] * z;
      void _lx;
      const ly = a1[0] * x + a1[1] * y + a1[2] * z;
      const lz = a2[0] * x + a2[1] * y + a2[2] * z;

      let c: [number, number, number] = col;

      if (isCue) {
        c = [255, 255, 255];
      } else if (striped && Math.abs(ly) > 0.55) {
        c = [255, 255, 255];
      }

      if (hasNumber && lz > 0.745) {
        c = lz < 0.765 ? [11, 7, 16] : [255, 255, 255];
      }

      const f = 0.86 + 0.14 * z;

      d[p] = c[0] * f;
      d[p + 1] = c[1] * f;
      d[p + 2] = c[2] * f;

      // Borda suavizada.
      const a = (1 - sqrtR2) * r * res + 0.5;
      d[p + 3] = Math.min(1, Math.max(0, a)) * 255;
    }
  }

  o.x.putImageData(o.d, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  const size = N / res;
  ctx.drawImage(o.c, -size / 2, -size / 2, size, size);

  ctx.restore();
}

/**
 * Número posicionado no ponto M[2] da esfera, achatado só na
 * direção radial (perspectiva) e mantido em pé.
 */
export function drawBallNumber(
  ctx: CanvasRenderingContext2D,
  ball: BallRenderable,
  r: number
): void {
  const [px, py, pz] = ball.M[2];

  if (pz <= 0.45) return;

  const k = r / 10.5; // o protótipo HTML usa R = 10.5
  const n = ball.number;
  const under = n === 6 || n === 9;
  const is67 = ball.enhancement?.id === '67';

  ctx.save();

  ctx.globalAlpha *= Math.min(1, Math.max(0, (pz - 0.45) * 5));

  ctx.translate(px * r, py * r);

  const a = Math.atan2(py, px);
  ctx.rotate(a);
  ctx.scale(pz, 1);
  ctx.rotate(-a);

  ctx.fillStyle = '#0b0710';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (is67) {
    ctx.font = `700 ${9 * k}px Oswald, Impact, sans-serif`;
    ctx.fillText('67', 0, 0.5 * k);
  } else if (n > 9) {
    ctx.font = `700 ${9.5 * k}px Oswald, Impact, sans-serif`;
    ctx.fillText(String(n), 0, 0.5 * k);
  } else {
    ctx.font = `700 ${12.5 * k}px Oswald, Impact, sans-serif`;
    ctx.fillText(String(n), 0, (under ? -0.9 : 0.5) * k);

    if (under) {
      ctx.fillRect(-2.5 * k, 4.5 * k, 5 * k, 1.3 * k);
    }
  }

  ctx.restore();
}

/**
 * Renderizador mestre da bola em pseudo-3D per-pixel.
 * Compatível tanto com a instância física de Ball quanto com prévias de UI (como Loja e Caixas).
 */
export function draw3DBall(
  ctx: CanvasRenderingContext2D,
  ball: BallRenderable,
  r: number,
  options?: {
    shadow?: boolean;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    res?: number;
  }
): void {
  // 1. Sombra projetada no feltro / chão.
  if (options?.shadow !== false) {
    const sx = options?.shadowOffsetX ?? 2.5;
    const sy = options?.shadowOffsetY ?? 3.5;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fill();
  }

  // 2. Efeitos dos enhancements.
  if (ball.enhancement && typeof ball.enhancement.drawEffect === 'function') {
    const proxyBall = (ball instanceof Ball ? ball : { ...ball, radius: r }) as Ball;
    ball.enhancement.drawEffect(ctx, proxyBall);
  }

  // 3. Cor base.
  let baseColor = ball.color || BALL_COLORS[ball.number] || '#ffffff';

  if (ball.number === 8) {
    baseColor = '#16121c';
  } else if (ball.enhancement) {
    if (ball.enhancement.id === 'sap') baseColor = '#5fae3a';
    else if (ball.enhancement.id === 'hoq') baseColor = '#f0ecde';
    else if (ball.enhancement.id === 'bco') baseColor = '#ece6d8';
    else if (ball.enhancement.id === 'gri') baseColor = '#18141e';
    else if (ball.enhancement.id === 'lem') baseColor = '#deac38';
    else if (ball.enhancement.id === 'jaw') baseColor = '#142864';
    else if (ball.enhancement.id === 'gold') baseColor = '#fbbf24';
    else if (ball.enhancement.id === 'silver') baseColor = '#cbd5e1';
  }

  // 4. Esfera (textura por pixel: faixa, disco do número, bola branca).
  drawBallTexture(ctx, ball, r, baseColor, options?.res ?? (r > 20 ? 2.2 : 3));

  // 5. Número com perspectiva.
  if (!ball.isCue) {
    drawBallNumber(ctx, ball, r);
  }

  // 6. Brilho especular pequeno.
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(-r * 0.29, -r * 0.33, r * 0.19, 0, Math.PI * 2);
  ctx.fill();

  // 7. Contorno externo estilo cartoon / Balatro.
  ctx.lineWidth = Math.max(1.2, r * 0.08);
  ctx.strokeStyle = '#0b0710';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // 8. Efeitos visuais e sobreposições (após a esfera para que sparkles fiquem visíveis)
  const enh = ball.enhancement;
  if (enh) {
    if (typeof enh.drawEffect === 'function') {
      const proxyBall = (ball instanceof Ball ? ball : { ...ball, radius: r }) as Ball;
      enh.drawEffect(ctx, proxyBall);
    } else if (enh.id === 'gold') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(r * 0.65, -r * 0.65, 2, 0, Math.PI * 2);
      ctx.arc(-r * 0.65, r * 0.65, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export class Ball {
  public id: number;
  public number: number;
  public pos: Vector2D;
  public vel: Vector2D;
  public radius: number;

  public isCue: boolean;
  public isEight: boolean;
  public color: string;

  public isPocketed: boolean = false;
  public isSinking: boolean = false;

  public sinkScale: number = 1.0;
  public sinkOpacity: number = 1.0;

  public targetPocketPos: { x: number; y: number } | null = null;

  public cushionBounces: number = 0;

  public baseChips: number;
  public goldBonus: number = 0;

  public isFoil: boolean = false;
  public isStriped: boolean = false;

  public enhancement: BallEnhancement | null = null;

  public M: Mat3;

  public distanceTraveled: number = 0;
  public sidesHitMask: number = 0;
  public isPossessed: boolean = false;

  public isDirty: boolean = true;
  private cachedCanvas: HTMLCanvasElement | null = null;
  private cachedCtx: CanvasRenderingContext2D | null = null;

  constructor(
    id: number,
    number: number,
    x: number,
    y: number,
    radius: number = 17
  ) {
    this.id = id;
    this.number = number;

    this.pos = new Vector2D(x, y);
    this.vel = new Vector2D(0, 0);

    this.radius = radius;

    this.isCue = number === 0;
    this.isEight = number === 8;

    this.color = BALL_COLORS[number] || '#ffffff';

    this.M = initM();

    if (this.isCue) {
      this.baseChips = 0;
    } else if (this.isEight) {
      this.baseChips = 60;
    } else {
      this.baseChips = 10 + number * 5;
    }

    settleBall(this, true);
  }

  get isSolid(): boolean {
    if (this.number === 8) return true;
    if (this.enhancement?.id === 'pel') return true;
    return !this.isStriped;
  }

  get isStripe(): boolean {
    if (this.number === 8) return false;
    if (this.enhancement?.id === 'pel') return true;
    return this.isStriped;
  }

  get speed(): number {
    return this.vel.mag();
  }

  applyImpulse(ix: number, iy: number): void {
    this.vel.x += ix;
    this.vel.y += iy;
    this.isDirty = true;
  }

  update(friction: number, dt: number): void {
    if (this.isSinking) {
      this.isDirty = true;
      if (this.targetPocketPos) {
        this.pos.x += (this.targetPocketPos.x - this.pos.x) * 0.28;
        this.pos.y += (this.targetPocketPos.y - this.pos.y) * 0.28;
      }

      this.sinkScale = Math.max(
        0,
        this.sinkScale - 0.075 * (dt * 60)
      );

      this.sinkOpacity = Math.max(
        0,
        this.sinkOpacity - 0.08 * (dt * 60)
      );

      if (this.sinkScale <= 0.03) {
        this.isSinking = false;
        this.isPocketed = true;
      }

      return;
    }

    if (this.isPocketed) return;

    const stepDist = this.vel.mag() * (dt * 60);

    this.pos.x += this.vel.x * (dt * 60);
    this.pos.y += this.vel.y * (dt * 60);

    this.distanceTraveled += stepDist;

    // Rotação física da esfera conforme seu deslocamento.
    const rollSpeedX = (-this.vel.y * (dt * 60)) / this.radius;
    const rollSpeedY = (this.vel.x * (dt * 60)) / this.radius;

    if (Math.abs(rollSpeedX) > 1e-5 || Math.abs(rollSpeedY) > 1e-5) {
      this.M = rotM(this.M, rollSpeedX, rollSpeedY, 0);
      this.isDirty = true;
    }

    settleBall(this, false);

    let effectiveFriction = friction;

    if (this.enhancement?.id === 'pel') {
      effectiveFriction = Math.pow(friction, 2.5);
    }

    if (this.vel.magSq() < 1.2) {
      effectiveFriction *= 0.96;
    }

    this.vel.x *= Math.pow(effectiveFriction, dt * 60);
    this.vel.y *= Math.pow(effectiveFriction, dt * 60);

    if (this.vel.magSq() < 0.02) {
      this.vel.set(0, 0);
    }
  }

  pocket(pocketX?: number, pocketY?: number): void {
    if (!this.isPocketed && !this.isSinking) {
      this.isSinking = true;
      this.isDirty = true;

      this.vel.set(0, 0);

      if (pocketX !== undefined && pocketY !== undefined) {
        this.targetPocketPos = {
          x: pocketX,
          y: pocketY,
        };
      }
    }
  }

  resetPosition(x: number, y: number): void {
    this.pos.set(x, y);
    this.vel.set(0, 0);

    this.isPocketed = false;
    this.isSinking = false;
    this.isDirty = true;

    this.sinkScale = 1.0;
    this.sinkOpacity = 1.0;

    this.targetPocketPos = null;

    this.cushionBounces = 0;
    this.distanceTraveled = 0;
    this.sidesHitMask = 0;

    settleBall(this, true);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.isPocketed) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    if (this.isSinking) {
      ctx.scale(this.sinkScale, this.sinkScale);
      ctx.globalAlpha = this.sinkOpacity;
    }

    // Se a bola estiver estacionária e sem afundar, reutiliza o sprite assado em cache
    const isStationary = !this.isSinking && this.vel.x === 0 && this.vel.y === 0;
    const padding = 12;
    const size = Math.ceil((this.radius + padding) * 2);

    if (isStationary && !this.isDirty && this.cachedCanvas) {
      ctx.drawImage(this.cachedCanvas, -size / 2, -size / 2);
      ctx.restore();
      return;
    }

    if (!this.cachedCanvas) {
      this.cachedCanvas = document.createElement('canvas');
      this.cachedCanvas.width = size;
      this.cachedCanvas.height = size;
      this.cachedCtx = this.cachedCanvas.getContext('2d');
    }

    if (isStationary && this.cachedCtx) {
      this.cachedCtx.clearRect(0, 0, size, size);
      this.cachedCtx.save();
      this.cachedCtx.translate(size / 2, size / 2);
      draw3DBall(this.cachedCtx, this, this.radius, {
        shadow: true,
        shadowOffsetX: 2.5,
        shadowOffsetY: 3.5,
        res: 2.5,
      });
      this.cachedCtx.restore();
      this.isDirty = false;
      ctx.drawImage(this.cachedCanvas, -size / 2, -size / 2);
    } else {
      draw3DBall(ctx, this, this.radius, {
        shadow: true,
        shadowOffsetX: 2.5,
        shadowOffsetY: 3.5,
        res: 2.0,
      });
    }

    ctx.restore();
  }
}