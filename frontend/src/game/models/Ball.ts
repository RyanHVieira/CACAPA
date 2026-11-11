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

const SETZ = 0.82;
export function settleBall(ball: Ball, snap: boolean = false): boolean {
  if (ball.isPocketed || ball.isCue) return true;
  const [x, y, z] = ball.M[2];
  if (z >= SETZ - 0.002) return true;

  const sp = ball.speed;
  if (!snap && sp > 0.9) return false;

  const cl = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const rem = Math.acos(cl(z, -1, 1)) - Math.acos(SETZ);
  const k = snap ? 1 : 0.13 * Math.pow(cl(1 - sp / 0.9, 0, 1), 1.3);
  const st = snap ? rem : Math.min(rem, Math.max(rem * k, 0.005));
  const n = Math.hypot(x, y);
  const ax = n < 1e-4 ? 1 : y / n;
  const ay = n < 1e-4 ? 0 : -x / n;
  ball.M = rotM(ball.M, ax * st, ay * st, 0);
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

  constructor(id: number, number: number, x: number, y: number, radius: number = 17) {
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
    if (this.enhancement?.id === 'pel') return true;
    return !this.isStriped;
  }

  get isStripe(): boolean {
    if (this.enhancement?.id === 'pel') return true;
    return this.isStriped;
  }

  get speed(): number {
    return this.vel.mag();
  }

  applyImpulse(ix: number, iy: number): void {
    this.vel.x += ix;
    this.vel.y += iy;
  }

  update(friction: number, dt: number): void {
        if (this.isSinking) {
      if (this.targetPocketPos) {
        this.pos.x += (this.targetPocketPos.x - this.pos.x) * 0.16;
        this.pos.y += (this.targetPocketPos.y - this.pos.y) * 0.16;
      }
      this.sinkScale = Math.max(0, this.sinkScale - 0.09 * (dt * 60));
      this.sinkOpacity = Math.max(0, this.sinkOpacity - 0.09 * (dt * 60));
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

        const rollSpeedX = (-this.vel.y * (dt * 60)) / this.radius;
    const rollSpeedY = (this.vel.x * (dt * 60)) / this.radius;
    if (Math.abs(rollSpeedX) > 1e-5 || Math.abs(rollSpeedY) > 1e-5) {
      this.M = rotM(this.M, rollSpeedX, rollSpeedY, 0);
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
      this.vel.set(0, 0);
      if (pocketX !== undefined && pocketY !== undefined) {
        this.targetPocketPos = { x: pocketX, y: pocketY };
      }
    }
  }

  resetPosition(x: number, y: number): void {
    this.pos.set(x, y);
    this.vel.set(0, 0);
    this.isPocketed = false;
    this.isSinking = false;
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

    const r = this.radius;

    // 1. Sombra cartoon projetada no feltro
    ctx.beginPath();
    ctx.ellipse(2.5, 3.5, r, r * 0.92, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fill();

    // 2. Efeito de enhancement (se houver)
    if (this.enhancement) {
      this.enhancement.drawEffect(ctx, this);
    }

    // 3. Cor base da bola
    let baseColor = this.color;
    if (this.enhancement) {
      if (this.enhancement.id === 'sap') baseColor = '#5fae3a';
      else if (this.enhancement.id === 'hoq') baseColor = '#f0ecde';
      else if (this.enhancement.id === 'bco') baseColor = '#ece6d8';
      else if (this.enhancement.id === 'gri') baseColor = '#18141e';
      else if (this.enhancement.id === 'lem') baseColor = '#deac38';
      else if (this.enhancement.id === 'jaw') baseColor = '#142864';
    }

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);

    if (this.isStripe) {
      // Base branca
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Faixa colorida rotacionada em 3D
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.clip();

      const [sx, sy, sz] = this.M[1];
      const stripeAngle = Math.atan2(sy, sx);
      ctx.rotate(stripeAngle);
      const stripeThickness = r * (0.95 * Math.abs(sz) + 0.45);
      ctx.fillStyle = baseColor;
      ctx.fillRect(-r, -stripeThickness / 2, r * 2, stripeThickness);
      ctx.restore();
    } else {
      ctx.fillStyle = baseColor;
      ctx.fill();
    }

    // 4. Círculo branco do número (cartoon plano) e número
    if (!this.isCue) {
      const [px, py, pz] = this.M[2];
      if (pz > 0.35) {
        ctx.save();
        const numAlpha = Math.min(1, Math.max(0, (pz - 0.35) * 4));
        ctx.globalAlpha *= numAlpha;
        ctx.translate(px * r, py * r);

        const a = Math.atan2(py, px);
        ctx.rotate(a);
        ctx.scale(pz, 1);
        ctx.rotate(-a);

        // Círculo branco do número (sem borda preta)
        const badgeR = r * 0.48;
        ctx.beginPath();
        ctx.arc(0, 0, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Número em fonte Oswald / Impact bold
        ctx.fillStyle = '#0b0710';
        ctx.font = `700 ${Math.round(r * 0.68)}px Oswald, Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const displayText = this.enhancement?.id === '67' ? '67' : this.number.toString();
        ctx.fillText(displayText, 0, 0.6);

        if (this.number === 6 || this.number === 9) {
          ctx.fillRect(-2.5, 4.2, 5, 1.3);
        }
        ctx.restore();
      }
    } else {
      const dots = [this.M[0], this.M[1], this.M[2]];
      for (const d of dots) {
        if (d[2] > 0.1) {
          ctx.beginPath();
          ctx.arc(d[0] * r * 0.72, d[1] * r * 0.72, 1.8 * Math.max(0.4, d[2]), 0, Math.PI * 2);
          ctx.fillStyle = '#d6322a';
          ctx.fill();
        }
      }
    }

    // 6. Borda preta grossa externa estilo cartoon Balatro
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#0b0710';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
