import { Ball } from '../models/Ball';
import { Table, type Pocket } from '../models/Table';
import type { ParticleSystem } from './ParticleSystem';

export interface ShotPhysicsEvents {
  pocketedBalls: { ball: Ball; pocket: Pocket }[];
  cushionHits: number;
  cueFirstHitBall: Ball | null;
  scratch: boolean;
  maxVelocity: number;
  totalBallCollisions: number;
}

const POCKET_MOUTH_MARGIN = 22; // folga da "boca" da caçapa nas tabelas
const SUCTION_EXTRA_RADIUS = 36;
const SUCTION_STRENGTH = 1.25;
const SUCTION_DAMPING = 0.98;

function createEmptyEvents(): ShotPhysicsEvents {
  return {
    pocketedBalls: [],
    cushionHits: 0,
    cueFirstHitBall: null,
    scratch: false,
    maxVelocity: 0,
    totalBallCollisions: 0,
  };
}

export class PhysicsEngine {
  public table: Table;
  public balls: Ball[] = [];
  public friction: number = 0.988;
  public restitution: number = 0.95;
  public cushionRestitution: number = 0.85;
  public subSteps: number = 8;
  public particles?: ParticleSystem;

  public onBallHit?: (speed: number) => void;
  public onCushionHit?: (speed: number) => void;
  public onPocketBall?: (ball: Ball, pocket: Pocket) => void;

  private activeShotEvents: ShotPhysicsEvents = createEmptyEvents();

  // Buffer reutilizável de bolas ativas (evita checar isPocketed/isSinking por par)
  private activeBalls: Ball[] = [];

  constructor(table: Table, balls: Ball[] = []) {
    this.table = table;
    this.balls = balls;
  }

  setBalls(balls: Ball[]): void {
    this.balls = balls;
  }

  resetShotTracker(): void {
    this.activeShotEvents = createEmptyEvents();
  }

  getShotEvents(): ShotPhysicsEvents {
    return { ...this.activeShotEvents };
  }

  areAllBallsStopped(): boolean {
    for (const b of this.balls) {
      if (b.isSinking) return false;
      if (!b.isPocketed && b.vel.magSq() > 0.035) return false;
    }
    return true;
  }

  update(dt: number): void {
    const subDt = dt / this.subSteps;
    const events = this.activeShotEvents;
    const balls = this.balls;

    for (let step = 0; step < this.subSteps; step++) {
      for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        ball.update(this.friction, subDt);
        const speed = ball.speed; // lido uma vez só (pode ser getter com sqrt)
        if (speed > events.maxVelocity) events.maxVelocity = speed;
      }

      this.resolveBallCollisions();
      this.resolveCushionCollisions();
      this.checkPockets();
    }
  }

  private resolveBallCollisions(): void {
    // Monta a lista de bolas ativas uma vez por sub-step
    const active = this.activeBalls;
    active.length = 0;
    for (let i = 0; i < this.balls.length; i++) {
      const b = this.balls[i];
      if (!b.isPocketed && !b.isSinking) active.push(b);
    }

    const count = active.length;
    const particles = this.particles;
    const events = this.activeShotEvents;

    for (let i = 0; i < count; i++) {
      const b1 = active[i];

      for (let j = i + 1; j < count; j++) {
        const b2 = active[j];

        const dx = b2.pos.x - b1.pos.x;
        const minDist = b1.radius + b2.radius;

        // Rejeição rápida por eixo antes de calcular a distância
        if (dx > minDist || dx < -minDist) continue;
        const dy = b2.pos.y - b1.pos.y;
        if (dy > minDist || dy < -minDist) continue;

        const distSq = dx * dx + dy * dy;
        if (distSq >= minDist * minDist || distSq <= 0.0001) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        // Separa as bolas sobrepostas
        const overlap = 0.5 * (minDist - dist);
        b1.pos.x -= nx * overlap;
        b1.pos.y -= ny * overlap;
        b2.pos.x += nx * overlap;
        b2.pos.y += ny * overlap;

        // Impulso (massas iguais): projeção da velocidade relativa na normal
        const p = nx * (b1.vel.x - b2.vel.x) + ny * (b1.vel.y - b2.vel.y);
        if (p <= 0) continue;

        const impulse = p * this.restitution;
        b1.vel.x -= impulse * nx;
        b1.vel.y -= impulse * ny;
        b2.vel.x += impulse * nx;
        b2.vel.y += impulse * ny;

        events.totalBallCollisions++;

        if (!events.cueFirstHitBall) {
          if (b1.isCue) events.cueFirstHitBall = b2;
          else if (b2.isCue) events.cueFirstHitBall = b1;
        }

        // Propagação de "possessão"
        if (b1.isPossessed !== b2.isPossessed) {
          const target = b1.isPossessed ? b2 : b1;
          if (!target.isCue && !target.isPocketed) {
            target.isPossessed = true;
            if (particles) {
              particles.spark(target.pos.x, target.pos.y, 10, '#7dff6a');
              particles.pop(target.pos.x, target.pos.y - 20, 'POSSUÍDA', '#7dff6a', 0.8);
            }
          }
        }

        if (particles) {
          if (p > 1.8) {
            particles.spark((b1.pos.x + b2.pos.x) / 2, (b1.pos.y + b2.pos.y) / 2, 5, '#ffffff');
            particles.addShake(0.12);
          }
          if (p > 3.5) {
            particles.triggerFreeze(2);
            particles.addShake(0.25);
          }
        }

        if (p > 0.4 && this.onBallHit) {
          this.onBallHit(p);
        }
      }
    }
  }

  private resolveCushionCollisions(): void {
    const table = this.table;
    const minX = table.minX;
    const maxX = table.maxX;
    const minY = table.minY;
    const maxY = table.maxY;
    const midX = table.width / 2;

    // Limites dos trechos de tabela (fora da boca das caçapas) calculados uma vez
    const sideYMin = minY + POCKET_MOUTH_MARGIN;
    const sideYMax = maxY - POCKET_MOUTH_MARGIN;
    const leftSegMin = minX + POCKET_MOUTH_MARGIN;
    const leftSegMax = midX - POCKET_MOUTH_MARGIN;
    const rightSegMin = midX + POCKET_MOUTH_MARGIN;
    const rightSegMax = maxX - POCKET_MOUTH_MARGIN;

    const balls = this.balls;
    const e = this.cushionRestitution;

    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      if (ball.isPocketed || ball.isSinking) continue;

      const r = ball.radius;
      const pos = ball.pos;

      // Laterais esquerda/direita
      if (pos.x - r < minX) {
        if (pos.y > sideYMin && pos.y < sideYMax) {
          pos.x = minX + r;
          ball.vel.x = -ball.vel.x * e;
          ball.sidesHitMask |= 4;
          this.handleCushionHit(ball);
        }
      } else if (pos.x + r > maxX) {
        if (pos.y > sideYMin && pos.y < sideYMax) {
          pos.x = maxX - r;
          ball.vel.x = -ball.vel.x * e;
          ball.sidesHitMask |= 8;
          this.handleCushionHit(ball);
        }
      }

      // Topo/base
      const top = pos.y - r < minY;
      const bottom = !top && pos.y + r > maxY;
      if (top || bottom) {
        const x = pos.x;
        const inSegment =
          (x > leftSegMin && x < leftSegMax) || (x > rightSegMin && x < rightSegMax);
        if (inSegment) {
          if (top) {
            pos.y = minY + r;
            ball.sidesHitMask |= 1;
          } else {
            pos.y = maxY - r;
            ball.sidesHitMask |= 2;
          }
          ball.vel.y = -ball.vel.y * e;
          this.handleCushionHit(ball);
        }
      }
    }
  }

  private handleCushionHit(ball: Ball): void {
    ball.cushionBounces++;
    if (ball.isCue) {
      this.activeShotEvents.cushionHits++;
    }
    const speed = ball.speed;
    if (speed > 0.5 && this.onCushionHit) {
      this.onCushionHit(speed);
    }
  }

  private checkPockets(): void {
    const pockets = this.table.pockets;
    const particles = this.particles;
    const events = this.activeShotEvents;
    const balls = this.balls;

    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      if (ball.isPocketed || ball.isSinking) continue;

      // Sucção: apenas para bolas numeradas (a bola branca não deve ser puxada pela caçapa)
      if (!ball.isCue) {
        const bx = ball.pos.x;
        const by = ball.pos.y;
        for (let k = 0; k < pockets.length; k++) {
          const pocket = pockets[k];
          const dx = pocket.x - bx;
          const dy = pocket.y - by;
          const distSq = dx * dx + dy * dy;
          const suctionRadius = pocket.radius + SUCTION_EXTRA_RADIUS;

          if (distSq < suctionRadius * suctionRadius && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const pull = SUCTION_STRENGTH * Math.pow(1 - dist / suctionRadius, 1.4);
            ball.vel.x = (ball.vel.x + (dx / dist) * pull) * SUCTION_DAMPING;
            ball.vel.y = (ball.vel.y + (dy / dist) * pull) * SUCTION_DAMPING;
          }
        }
      }

      const pocket = this.table.checkPocket(ball);
      if (!pocket) continue;

      ball.pocket(pocket.x, pocket.y);

      if (ball.isCue) {
        events.scratch = true;
        if (particles) {
          particles.pop(pocket.x, pocket.y - 25, 'FALTA: BRANCA!', '#ff4b3a', 1.2);
          particles.addShake(0.45);
        }
      } else {
        events.pocketedBalls.push({ ball, pocket });
        if (particles) {
          particles.spark(pocket.x, pocket.y, 16, ball.color);
          particles.addShake(0.25);
          particles.triggerFreeze(3);
          particles.pop(pocket.x - 12, pocket.y - 24, `+${ball.baseChips}`, '#4aa3ff', 1.0);
          if (ball.cushionBounces > 0) {
            particles.pop(pocket.x, pocket.y - 42, 'TABELA!', '#3ec1d3', 0.9);
          }
          if (ball.enhancement?.popupText) {
            particles.pop(pocket.x, pocket.y - 60, ball.enhancement.popupText, ball.enhancement.color, 0.9);
          }
        }
      }

      if (this.onPocketBall) {
        this.onPocketBall(ball, pocket);
      }
    }
  }
}