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
  t: number;
  speed: number;
  text: string;
  color: string;
  onArrive?: () => void;
}

const TWO_PI = Math.PI * 2;
const MAX_PARTICLES = 600; // limite para evitar crescimento descontrolado
const PARTICLE_GRAVITY = 0.18;
const PARTICLE_FADE_FRAMES = 20;
const POPUP_FONT = 'bold 15px Oswald, Impact, sans-serif';
const PILL_FONT = 'bold 13px Oswald, Impact, sans-serif';

export class ParticleSystem {
  public particles: SparkParticle[] = [];
  public popups: ScorePopup[] = [];
  public flyingPills: FlyingScorePill[] = [];
  public shake: number = 0;
  public freezeFrames: number = 0;
  public screenFlash: number = 0;

  public canvasWidth: number;
  public canvasHeight: number;

  // Pool de partículas: reaproveita objetos em vez de alocar/descartar (menos GC)
  private particlePool: SparkParticle[] = [];
  // Buffer reutilizável para callbacks de chegada das pills
  private arrivedCallbacks: (() => void)[] = [];

  constructor(canvasWidth: number = 1040, canvasHeight: number = 560) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  triggerFlash(intensity: number = 0.5): void {
    this.screenFlash = Math.max(this.screenFlash, intensity);
  }

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

  spark(x: number, y: number, count: number = 16, color: string = '#ffd36a'): void {
    const n = Math.min(count, MAX_PARTICLES - this.particles.length);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * TWO_PI;
      const speed = 1.5 + Math.random() * 4.5;
      const p: SparkParticle =
        this.particlePool.pop() ??
        { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 45, color: '', size: 0 };

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 1.2;
      p.life = 25 + Math.random() * 25;
      p.maxLife = 45;
      p.color = color;
      p.size = 2 + Math.random() * 3;
      this.particles.push(p);
    }
  }

  pop(x: number, y: number, text: string, color: string = '#f2b632', scale: number = 1.0): void {
    this.popups.push({ x, y, t: 0, maxT: 75, text, color, scale });
  }

  addShake(amount: number): void {
    this.shake = Math.min(1.5, Math.max(this.shake, amount));
  }

  triggerFreeze(frames: number = 3): void {
    this.freezeFrames = Math.max(this.freezeFrames, frames);
  }

  update(): void {
    // Decaimentos visuais continuam mesmo durante o freeze
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - 0.035);
    }
    if (this.screenFlash > 0) {
      this.screenFlash = Math.max(0, this.screenFlash - 0.045);
    }

    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      return;
    }

    // Partículas: atualiza e compacta no próprio array (sem filter/alocação)
    const ps = this.particles;
    let w = 0;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += PARTICLE_GRAVITY;
      p.life--;
      if (p.life > 0) {
        ps[w++] = p;
      } else {
        this.particlePool.push(p);
      }
    }
    ps.length = w;

    // Popups (compactação preserva a ordem de desenho)
    const pops = this.popups;
    w = 0;
    for (let i = 0; i < pops.length; i++) {
      const p = pops[i];
      p.t++;
      if (p.t < p.maxT) pops[w++] = p;
    }
    pops.length = w;

    // Pills: callbacks são adiados para depois da compactação,
    // assim um onArrive que crie novas pills não corrompe o array
    const pills = this.flyingPills;
    w = 0;
    for (let i = 0; i < pills.length; i++) {
      const pill = pills[i];
      pill.t += pill.speed;
      if (pill.t >= 1) {
        if (pill.onArrive) this.arrivedCallbacks.push(pill.onArrive);
      } else {
        pills[w++] = pill;
      }
    }
    pills.length = w;

    if (this.arrivedCallbacks.length > 0) {
      for (let i = 0; i < this.arrivedCallbacks.length; i++) this.arrivedCallbacks[i]();
      this.arrivedCallbacks.length = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Flash de tela (o decaimento agora acontece em update(), não no draw)
    if (this.screenFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 240, 200, ${this.screenFlash * 0.45})`;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.restore();
    }

    // Partículas: um único save/restore, fillStyle só muda quando a cor muda
    const ps = this.particles;
    if (ps.length > 0) {
      ctx.save();
      let lastColor = '';
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        ctx.globalAlpha = p.life >= PARTICLE_FADE_FRAMES ? 1 : Math.max(0, p.life / PARTICLE_FADE_FRAMES);
        if (p.color !== lastColor) {
          ctx.fillStyle = p.color;
          lastColor = p.color;
        }
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    for (const pill of this.flyingPills) {
      const u = pill.t;
      const inv = 1 - u;
      const midX = (pill.startX + pill.targetX) / 2;
      const curX = inv * inv * pill.startX + 2 * inv * u * midX + u * u * pill.targetX;
      const curY = inv * inv * pill.startY + 2 * inv * u * pill.controlY + u * u * pill.targetY;

      ctx.save();
      ctx.translate(curX, curY);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-26, -10, 56, 24, 12);
      ctx.fill();

      ctx.fillStyle = '#1b1226';
      ctx.strokeStyle = pill.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -12, 56, 24, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = PILL_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(pill.text, 0, 0);

      ctx.restore();
    }

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

      ctx.font = POPUP_FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineJoin = 'round';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0b0710';
      ctx.strokeText(p.text, 0, 0);

      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);

      ctx.restore();
    }
  }

  getShakeOffset(): { x: number; y: number } {
    if (this.shake <= 0) return { x: 0, y: 0 };
    const intensity = this.shake * this.shake * 16; // (8 * 2) já embutido
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
    };
  }

  clear(): void {
    // Devolve as partículas ao pool em vez de descartá-las
    for (const p of this.particles) this.particlePool.push(p);
    this.particles.length = 0;
    this.popups.length = 0;
    this.flyingPills.length = 0;
    this.arrivedCallbacks.length = 0;
    this.shake = 0;
    this.freezeFrames = 0;
    this.screenFlash = 0;
  }
}