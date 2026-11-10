// Particle & Juice Effects System (1:1 with prototype CAÇAPA)
// Handles screen shake, hit-stop freeze frames, spark particles, and floating score pops

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  t: number;
  maxT: number;
  text: string;
  color: string;
  scale: number;
}

export interface FlyingScorePill {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  controlY: number;
  t: number; // 0 to 1
  speed: number;
  text: string;
  color: string;
  onArrive?: () => void;
}

export class ParticleSystem {
  public particles: SparkParticle[] = [];
  public popups: ScorePopup[] = [];
  public flyingPills: FlyingScorePill[] = [];
  public shake: number = 0;
  public freezeFrames: number = 0;
  public screenFlash: number = 0; // 0 to 1

  // Flash screen with bright warm glow on big combos
  triggerFlash(intensity: number = 0.5): void {
    this.screenFlash = Math.max(this.screenFlash, intensity);
  }

  // Spawn flying score pill that travels from pocket to left HUD
  spawnFlyingPill(
    startX: number,
    startY: number,
    text: string,
    color: string = '#f2b632',
    onArrive?: () => void
  ): void {
    this.flyingPills.push({
      startX,
      startY,
      targetX: -30,
      targetY: 240,
      controlY: Math.min(startY, 240) - 80,
      t: 0,
      speed: 0.028,
      text,
      color,
      onArrive,
    });
  }

  // Add spark burst at impact or pocket point
  spark(x: number, y: number, count: number = 16, color: string = '#ffd36a'): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 25 + Math.random() * 25,
        maxLife: 45,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  // Add floating text popup (e.g. +60, ×1.5, FALTA!)
  pop(x: number, y: number, text: string, color: string = '#f2b632', scale: number = 1.0): void {
    this.popups.push({
      x,
      y,
      t: 0,
      maxT: 75,
      text,
      color,
      scale,
    });
  }

  // Trigger screen shake with decay
  addShake(amount: number): void {
    this.shake = Math.min(1.5, Math.max(this.shake, amount));
  }

  // Freeze frames / hit-stop for visceral impact feel
  triggerFreeze(frames: number = 3): void {
    this.freezeFrames = Math.max(this.freezeFrames, frames);
  }

  update(): void {
    // Decay shake
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - 0.035);
    }

    // Freeze frames pause physics
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      return;
    }

    // Update spark particles
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // Update floating popups
    for (const p of this.popups) {
      p.t++;
    }
    this.popups = this.popups.filter((p) => p.t < p.maxT);

    // Update flying score pills travelling from pocket to left HUD
    for (const pill of this.flyingPills) {
      pill.t += pill.speed;
      if (pill.t >= 1) {
        if (pill.onArrive) pill.onArrive();
      }
    }
    this.flyingPills = this.flyingPills.filter((pill) => pill.t < 1);
  }

  // Draw all active sparks, flying pills and popups to canvas
  draw(ctx: CanvasRenderingContext2D): void {
    // 0. Screen Flash on big combos
    if (this.screenFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 240, 200, ${this.screenFlash * 0.45})`;
      ctx.fillRect(0, 0, 1040, 560);
      ctx.restore();
      this.screenFlash = Math.max(0, this.screenFlash - 0.045);
    }

    // 1. Draw Sparks
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / 20));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }

    // 2. Draw Flying Score Pills (Authentic Caçapa +N Flying from Pocket to HUD)
    for (const pill of this.flyingPills) {
      const u = pill.t;
      // Quadratic Bezier interpolation with upward control arc
      const curX = (1 - u) * (1 - u) * pill.startX + 2 * (1 - u) * u * ((pill.startX + pill.targetX) / 2) + u * u * pill.targetX;
      const curY = (1 - u) * (1 - u) * pill.startY + 2 * (1 - u) * u * pill.controlY + u * u * pill.targetY;

      ctx.save();
      ctx.translate(curX, curY);

      // Pill Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-26, -10, 56, 24, 12);
      ctx.fill();

      // Pill Background & Stroke
      ctx.fillStyle = '#1b1226';
      ctx.strokeStyle = pill.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -12, 56, 24, 12);
      ctx.fill();
      ctx.stroke();

      // Pill Text
      ctx.font = 'bold 13px Oswald, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(pill.text, 0, 0);

      ctx.restore();
    }

    // 3. Draw Floating Score Popups with wobble and bounce
    for (const p of this.popups) {
      const t = p.t;
      const alpha = t > 55 ? Math.max(0, (75 - t) / 20) : 1.0;
      const yOffset = t * 0.75;
      const wobble = Math.sin(t * 0.35) * 0.12 * Math.max(0, 1 - t / 25);
      const bounce = p.scale * (1 + Math.max(0, 0.8 - t * 0.07));

      ctx.save();
      ctx.translate(p.x, p.y - yOffset);
      ctx.rotate(wobble);
      ctx.scale(bounce, bounce);
      ctx.globalAlpha = alpha;

      ctx.font = 'bold 15px Oswald, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dark outline for punchy arcade text
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0b0710';
      ctx.strokeText(p.text, 0, 0);

      // Glow fill
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);

      ctx.restore();
    }
  }

  // Get current shake transform offset
  getShakeOffset(): { x: number; y: number } {
    if (this.shake <= 0) return { x: 0, y: 0 };
    const intensity = this.shake * this.shake * 8;
    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2,
    };
  }

  clear(): void {
    this.particles = [];
    this.popups = [];
    this.flyingPills = [];
    this.shake = 0;
    this.freezeFrames = 0;
    this.screenFlash = 0;
  }
}
