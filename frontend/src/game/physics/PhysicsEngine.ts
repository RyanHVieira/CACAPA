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

export class PhysicsEngine {
  public table: Table;
  public balls: Ball[] = [];
  public friction: number = 0.988;
  public restitution: number = 0.95;
  public cushionRestitution: number = 0.85;
  public subSteps: number = 8;
  public particles?: ParticleSystem;

  // Sound / effect event listeners
  public onBallHit?: (speed: number) => void;
  public onCushionHit?: (speed: number) => void;
  public onPocketBall?: (ball: Ball, pocket: Pocket) => void;

  // Active shot stats tracker
  private activeShotEvents: ShotPhysicsEvents = {
    pocketedBalls: [],
    cushionHits: 0,
    cueFirstHitBall: null,
    scratch: false,
    maxVelocity: 0,
    totalBallCollisions: 0,
  };

  constructor(table: Table, balls: Ball[] = []) {
    this.table = table;
    this.balls = balls;
  }

  setBalls(balls: Ball[]): void {
    this.balls = balls;
  }

  resetShotTracker(): void {
    this.activeShotEvents = {
      pocketedBalls: [],
      cushionHits: 0,
      cueFirstHitBall: null,
      scratch: false,
      maxVelocity: 0,
      totalBallCollisions: 0,
    };
  }

  getShotEvents(): ShotPhysicsEvents {
    return { ...this.activeShotEvents };
  }

  areAllBallsStopped(): boolean {
    for (const b of this.balls) {
      if (b.isSinking) return false;
      if (!b.isPocketed && b.vel.magSq() > 0.035) {
        return false;
      }
    }
    return true;
  }

  update(dt: number): void {
    const subDt = dt / this.subSteps;

    for (let step = 0; step < this.subSteps; step++) {
      // 1. Move and apply friction
      for (const ball of this.balls) {
        ball.update(this.friction, subDt);
        if (ball.speed > this.activeShotEvents.maxVelocity) {
          this.activeShotEvents.maxVelocity = ball.speed;
        }
      }

      // 2. Ball-to-ball collisions
      this.resolveBallCollisions();

      // 3. Table cushions
      this.resolveCushionCollisions();

      // 4. Pocket checks
      this.checkPockets();
    }
  }

  private resolveBallCollisions(): void {
    const count = this.balls.length;
    for (let i = 0; i < count; i++) {
      const b1 = this.balls[i];
      if (b1.isPocketed || b1.isSinking) continue;

      for (let j = i + 1; j < count; j++) {
        const b2 = this.balls[j];
        if (b2.isPocketed || b2.isSinking) continue;

        const dx = b2.pos.x - b1.pos.x;
        const dy = b2.pos.y - b1.pos.y;
        const distSq = dx * dx + dy * dy;
        const minDist = b1.radius + b2.radius;

        if (distSq < minDist * minDist && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;

          // Positional correction to prevent sticking
          const overlap = 0.5 * (minDist - dist);
          b1.pos.x -= nx * overlap;
          b1.pos.y -= ny * overlap;
          b2.pos.x += nx * overlap;
          b2.pos.y += ny * overlap;

          // Relative velocity
          const kx = b1.vel.x - b2.vel.x;
          const ky = b1.vel.y - b2.vel.y;
          const p = 2 * (nx * kx + ny * ky) / 2; // Equal mass = 1

          if (p > 0) {
            b1.vel.x -= p * nx * this.restitution;
            b1.vel.y -= p * ny * this.restitution;
            b2.vel.x += p * nx * this.restitution;
            b2.vel.y += p * ny * this.restitution;

            const impactSpeed = Math.abs(p);
            this.activeShotEvents.totalBallCollisions++;

            if (b1.isCue && !this.activeShotEvents.cueFirstHitBall) {
              this.activeShotEvents.cueFirstHitBall = b2;
            } else if (b2.isCue && !this.activeShotEvents.cueFirstHitBall) {
              this.activeShotEvents.cueFirstHitBall = b1;
            }

            // Necronomicon possession infection on contact
            if (b1.isPossessed !== b2.isPossessed) {
              const target = b1.isPossessed ? b2 : b1;
              if (!target.isCue && !target.isPocketed) {
                target.isPossessed = true;
                if (this.particles) {
                  this.particles.spark(target.pos.x, target.pos.y, 10, '#7dff6a');
                  this.particles.pop(target.pos.x, target.pos.y - 20, 'POSSUÍDA', '#7dff6a', 0.8);
                }
              }
            }

            // Visual juice: sparks and screen shake on hard hits
            if (this.particles) {
              if (impactSpeed > 1.8) {
                this.particles.spark((b1.pos.x + b2.pos.x) / 2, (b1.pos.y + b2.pos.y) / 2, 5, '#ffffff');
                this.particles.addShake(0.12);
              }
              if (impactSpeed > 3.5) {
                this.particles.triggerFreeze(2);
                this.particles.addShake(0.25);
              }
            }

            if (impactSpeed > 0.4 && this.onBallHit) {
              this.onBallHit(impactSpeed);
            }
          }
        }
      }
    }
  }

  private resolveCushionCollisions(): void {
    for (const ball of this.balls) {
      if (ball.isPocketed || ball.isSinking) continue;

      // Left cushion (mask 4)
      if (ball.pos.x - ball.radius < this.table.minX) {
        if (ball.pos.y > this.table.minY + 22 && ball.pos.y < this.table.maxY - 22) {
          ball.pos.x = this.table.minX + ball.radius;
          ball.vel.x = -ball.vel.x * this.cushionRestitution;
          ball.sidesHitMask |= 4;
          this.handleCushionHit(ball);
        }
      }
      // Right cushion (mask 8)
      else if (ball.pos.x + ball.radius > this.table.maxX) {
        if (ball.pos.y > this.table.minY + 22 && ball.pos.y < this.table.maxY - 22) {
          ball.pos.x = this.table.maxX - ball.radius;
          ball.vel.x = -ball.vel.x * this.cushionRestitution;
          ball.sidesHitMask |= 8;
          this.handleCushionHit(ball);
        }
      }

      // Top cushion (mask 1)
      if (ball.pos.y - ball.radius < this.table.minY) {
        const midX = this.table.width / 2;
        const inLeftSegment = ball.pos.x > this.table.minX + 22 && ball.pos.x < midX - 22;
        const inRightSegment = ball.pos.x > midX + 22 && ball.pos.x < this.table.maxX - 22;
        if (inLeftSegment || inRightSegment) {
          ball.pos.y = this.table.minY + ball.radius;
          ball.vel.y = -ball.vel.y * this.cushionRestitution;
          ball.sidesHitMask |= 1;
          this.handleCushionHit(ball);
        }
      }
      // Bottom cushion (mask 2)
      else if (ball.pos.y + ball.radius > this.table.maxY) {
        const midX = this.table.width / 2;
        const inLeftSegment = ball.pos.x > this.table.minX + 22 && ball.pos.x < midX - 22;
        const inRightSegment = ball.pos.x > midX + 22 && ball.pos.x < this.table.maxX - 22;
        if (inLeftSegment || inRightSegment) {
          ball.pos.y = this.table.maxY - ball.radius;
          ball.vel.y = -ball.vel.y * this.cushionRestitution;
          ball.sidesHitMask |= 2;
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
    if (ball.speed > 0.5 && this.onCushionHit) {
      this.onCushionHit(ball.speed);
    }
  }

  private checkPockets(): void {
    for (const ball of this.balls) {
      if (ball.isPocketed) continue;

      // 1. Smooth Gravitational Pocket Suction when approaching pocket mouth
      for (const pocket of this.table.pockets) {
        const dx = pocket.x - ball.pos.x;
        const dy = pocket.y - ball.pos.y;
        const dist = Math.hypot(dx, dy);

        // Suction influence zone
        const suctionRadius = pocket.radius + 22;
        if (dist < suctionRadius && dist > 1 && !ball.isSinking) {
          const factor = Math.pow(1 - dist / suctionRadius, 1.6);
          const pullStrength = 0.55 * factor;
          ball.vel.x += (dx / dist) * pullStrength;
          ball.vel.y += (dy / dist) * pullStrength;

          // Smooth curved funnel damping into pocket
          ball.vel.x *= 0.985;
          ball.vel.y *= 0.985;
        }
      }

      if (ball.isSinking) continue;

      // 2. Pocket Drop / Capture
      const pocket = this.table.checkPocket(ball);
      if (pocket) {
        ball.pocket(pocket.x, pocket.y);
        if (ball.isCue) {
          this.activeShotEvents.scratch = true;
          if (this.particles) {
            this.particles.pop(pocket.x, pocket.y - 25, 'FALTA: BRANCA!', '#ff4b3a', 1.2);
            this.particles.addShake(0.45);
          }
        } else {
          this.activeShotEvents.pocketedBalls.push({ ball, pocket });
          if (this.particles) {
            this.particles.spark(pocket.x, pocket.y, 16, ball.color);
            this.particles.addShake(0.25);
            this.particles.triggerFreeze(3);
            this.particles.pop(pocket.x - 12, pocket.y - 24, `+${ball.baseChips}`, '#4aa3ff', 1.0);
            if (ball.cushionBounces > 0) {
              this.particles.pop(pocket.x, pocket.y - 42, 'TABELA!', '#3ec1d3', 0.9);
            }
            if (ball.enhancement?.popupText) {
              this.particles.pop(pocket.x, pocket.y - 60, ball.enhancement.popupText, ball.enhancement.color, 0.9);
            }
          }
        }

        if (this.onPocketBall) {
          this.onPocketBall(ball, pocket);
        }
      }
    }
  }
}
