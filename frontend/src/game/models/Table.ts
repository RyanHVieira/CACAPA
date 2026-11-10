import { Ball } from './Ball';

export interface Pocket {
  id: number;
  x: number;
  y: number;
  radius: number;
  isSide: boolean;
  isCorner: boolean;
  name: string;
}

export interface Cushion {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  normalX: number;
  normalY: number;
}

// Felt colors per table (matching prototype FEL array)
export const FELT_COLORS = [
  '#1f7a52', // Table 0: Boteco do Zé
  '#1f6a44', // Table 1: Clube do Bairro
  '#7a2a45', // Table 2: Salão VIP
  '#2a2f3a', // Table 3: Mesa do Chefão
  '#1f9aa8', // Table 4: Sinuca da Praia
  '#5a2a8a', // Table 5: Cassino Neon
  '#1f5f7a', // Table 6: Bar do Pescador
  '#33378a', // Table 7: Cobertura 77
  '#1f3a7a', // Table 8: Salão Imperial
  '#4a2a7a', // Table 9: Mesa do Destino
];

// Wood and pocket colors per table
const POCKET_THEMES = [
  ['#8a5a1a', '#d9a441', '#7a4a12'], // 0
  ['#3a2a14', '#2f7a44', '#1d4a2a'], // 1
  ['#6a4010', '#f2c230', '#a8741a'], // 2
  ['#14141a', '#4a4a56', '#2a2a32'], // 3
  ['#2a6a88', '#5fa8c4', '#2a6a88'], // 4
  ['#4a0f5a', '#ff4bd8', '#8a1fa0'], // 5
  ['#a8231a', '#ffffff', '#d6322a'], // 6
  ['#2a2a3a', '#b9a4ff', '#5a4a9a'], // 7
  ['#6a4010', '#ffd96a', '#d98410'], // 8
  ['#1c0f3a', '#9b4dff', '#4a2a8a'], // 9
];

const OD = '#0b0710';

export class Table {
  public width: number = 1040;
  public height: number = 560;
  public railSize: number = 42;
  public pocketRadius: number = 29;
  public sidePocketRadius: number = 27;

  public pockets: Pocket[] = [];
  public cushions: Cushion[] = [];

  // Table bounds
  public minX: number;
  public maxX: number;
  public minY: number;
  public maxY: number;

  constructor() {
    this.minX = this.railSize;
    this.maxX = this.width - this.railSize;
    this.minY = this.railSize;
    this.maxY = this.height - this.railSize;

    this.initPockets();
    this.initCushions();
  }

  private initPockets(): void {
    const r = this.pocketRadius;
    const sr = this.sidePocketRadius;
    const cornerOffset = this.railSize;
    const sideTopY = this.minY - 2;
    const sideBottomY = this.maxY + 2;
    const midX = this.width / 2;

    this.pockets = [
      { id: 1, x: cornerOffset, y: cornerOffset, radius: r, isSide: false, isCorner: true, name: 'Superior Esquerda' },
      { id: 2, x: midX, y: sideTopY, radius: sr, isSide: true, isCorner: false, name: 'Meio Superior' },
      { id: 3, x: this.maxX, y: cornerOffset, radius: r, isSide: false, isCorner: true, name: 'Superior Direita' },
      { id: 4, x: cornerOffset, y: this.maxY, radius: r, isSide: false, isCorner: true, name: 'Inferior Esquerda' },
      { id: 5, x: midX, y: sideBottomY, radius: sr, isSide: true, isCorner: false, name: 'Meio Inferior' },
      { id: 6, x: this.maxX, y: this.maxY, radius: r, isSide: false, isCorner: true, name: 'Inferior Direita' },
    ];
  }

  private initCushions(): void {
    const cut = 24; // bevel distance near pockets
    const sideCut = 26;
    const midX = this.width / 2;

    this.cushions = [
      // Top Left
      {
        x1: this.minX + cut,
        y1: this.minY,
        x2: midX - sideCut,
        y2: this.minY,
        normalX: 0,
        normalY: 1,
      },
      // Top Right
      {
        x1: midX + sideCut,
        y1: this.minY,
        x2: this.maxX - cut,
        y2: this.minY,
        normalX: 0,
        normalY: 1,
      },
      // Bottom Left
      {
        x1: this.minX + cut,
        y1: this.maxY,
        x2: midX - sideCut,
        y2: this.maxY,
        normalX: 0,
        normalY: -1,
      },
      // Bottom Right
      {
        x1: midX + sideCut,
        y1: this.maxY,
        x2: this.maxX - cut,
        y2: this.maxY,
        normalX: 0,
        normalY: -1,
      },
      // Left
      {
        x1: this.minX,
        y1: this.minY + cut,
        x2: this.minX,
        y2: this.maxY - cut,
        normalX: 1,
        normalY: 0,
      },
      // Right
      {
        x1: this.maxX,
        y1: this.minY + cut,
        x2: this.maxX,
        y2: this.maxY - cut,
        normalX: -1,
        normalY: 0,
      },
    ];
  }

  checkPocket(ball: Ball): Pocket | null {
    if (ball.isPocketed || ball.isSinking) return null;

    for (const pocket of this.pockets) {
      const distSq = (ball.pos.x - pocket.x) ** 2 + (ball.pos.y - pocket.y) ** 2;
      const captureThreshold = (pocket.radius + ball.radius * 0.45) ** 2;
      if (distSq < captureThreshold) {
        return pocket;
      }
    }
    return null;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    tableIndex: number = 0,
    shakeAmount: number = 0,
    time: number = 0
  ): void {
    ctx.save();
    const frameRadius = 22;
    const tIdx = Math.max(0, tableIndex) % FELT_COLORS.length;
    const feltBase = FELT_COLORS[tIdx];
    const th = POCKET_THEMES[tIdx];

    // 1. Outer Dark Wooden Frame with dark border #0b0710 (matching prototype B)
    ctx.fillStyle = '#231109';
    this.roundRect(ctx, 0, 0, this.width, this.height, frameRadius);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = OD;
    ctx.stroke();

    // Wood Grain / Warm Rich Gradient
    const woodGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
    woodGrad.addColorStop(0, '#5a2912');
    woodGrad.addColorStop(0.3, '#78350f');
    woodGrad.addColorStop(0.7, '#8a3c10');
    woodGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = woodGrad;
    this.roundRect(ctx, 4, 4, this.width - 8, this.height - 8, frameRadius - 2);
    ctx.fill();

    // Inner Rail Cushion Bevel & Shadow
    ctx.strokeStyle = OD;
    ctx.lineWidth = 3;
    this.roundRect(
      ctx,
      this.railSize - 3,
      this.railSize - 3,
      this.width - (this.railSize - 3) * 2,
      this.height - (this.railSize - 3) * 2,
      8
    );
    ctx.stroke();

    // 2. Playfield Felt: Striped Tournament Cloth
    const playWidth = this.maxX - this.minX;
    const playHeight = this.maxY - this.minY;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.minX, this.minY, playWidth, playHeight);
    ctx.clip();

    // Base Felt Color per Ante
    ctx.fillStyle = feltBase;
    ctx.fillRect(this.minX, this.minY, playWidth, playHeight);

    // Subtle wide vertical stripes (matching prototype B: 40px wide rgba(255,255,255,.045))
    const stripeW = 40;
    for (let x = this.minX; x < this.maxX; x += stripeW * 2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
      ctx.fillRect(x, this.minY, stripeW, playHeight);
    }

    // Baulk line (head string at 25% of table width)
    const baulkX = this.minX + playWidth * 0.25;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(baulkX, this.minY);
    ctx.lineTo(baulkX, this.maxY);
    ctx.stroke();

    // Foot Spot for rack (white ring at 72%)
    const footSpotX = this.minX + playWidth * 0.72;
    ctx.beginPath();
    ctx.arc(footSpotX, this.height / 2, 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Atmospheric Lamp Light (center spotlight fading outwards)
    const lampGrad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      30,
      this.width / 2,
      this.height / 2,
      playWidth * 0.62
    );
    lampGrad.addColorStop(0, 'rgba(255, 200, 120, 0.15)');
    lampGrad.addColorStop(0.6, 'rgba(255, 200, 120, 0.04)');
    lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = lampGrad;
    ctx.fillRect(this.minX, this.minY, playWidth, playHeight);

    ctx.restore();

    // 3. Diamonds / Pearl Sights on Rails
    this.drawDiamondSights(ctx);

    // 4. Cushions with dark outline
    ctx.strokeStyle = OD;
    ctx.lineWidth = 4;
    for (const c of this.cushions) {
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();
    }

    // 5. Six Thematic Pockets with Gear Rim, 18 Brass Rivets & Crossed Mesh Net
    for (const p of this.pockets) {
      const r = p.radius;
      const ringR = r + 6.5;

      // Outer drop shadow
      const qGrad = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, ringR + 8);
      qGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      qGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, ringR + 8, 0, Math.PI * 2);
      ctx.fillStyle = qGrad;
      ctx.fill();

      // Outer and middle rings matching prototype
      ctx.beginPath();
      ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
      ctx.fillStyle = th[0];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = OD;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, ringR - 1.4, 0, Math.PI * 2);
      ctx.fillStyle = th[1];
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, ringR - 2.7, 0, Math.PI * 2);
      ctx.fillStyle = th[2];
      ctx.fill();

      // Thematic Pocket Rim Details per Stage (1:1 with Prototype B)
      const Z = tableIndex % 10;

      if (Z === 4) {
        // Table 4 (Praia): Shark teeth rim pointing inward
        const teethCount = 14;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = OD;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < teethCount; i++) {
          const an = (i * Math.PI * 2) / teethCount;
          const ln = 4.2 + Math.sin(time * 1.5 + i) * 0.8;
          const b1 = an - 0.12;
          const b2 = an + 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x + Math.cos(b1) * (ringR - 1.2), p.y + Math.sin(b1) * (ringR - 1.2));
          ctx.lineTo(p.x + Math.cos(b2) * (ringR - 1.2), p.y + Math.sin(b2) * (ringR - 1.2));
          ctx.lineTo(p.x + Math.cos(an) * (r - ln), p.y + Math.sin(an) * (r - ln));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else if (Z === 5) {
        // Table 5 (Cassino): Glowing neon dots flashing
        const bulbCount = 10;
        for (let i = 0; i < bulbCount; i++) {
          const an = (i * Math.PI * 2) / bulbCount;
          const nx = p.x + Math.cos(an) * (ringR - 2.2);
          const ny = p.y + Math.sin(an) * (ringR - 2.2);
          const isLit = (i + Math.floor(time * 3)) % 2 === 0;
          ctx.beginPath();
          ctx.arc(nx, ny, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = isLit ? '#ff5ae0' : '#ffd400';
          ctx.fill();
        }
      } else if (Z === 2 || Z === 8) {
        // Tables 2 & 8 (VIP & Imperial): Alternating Rubies & Sapphires
        const gemCount = 8;
        for (let i = 0; i < gemCount; i++) {
          const an = (i * Math.PI * 2) / gemCount;
          const nx = p.x + Math.cos(an) * (ringR - 2.2);
          const ny = p.y + Math.sin(an) * (ringR - 2.2);
          ctx.beginPath();
          ctx.arc(nx, ny, 2.0, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#d6322a' : '#2f86ff';
          ctx.fill();
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = OD;
          ctx.stroke();
        }
      } else if (Z === 9) {
        // Table 9 (Mesa do Destino): Spinning animated cosmic vortex
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r - 0.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(p.x, p.y);
        ctx.rotate(-time * 1.5);
        ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          for (let s = 0; s <= 1.0; s += 0.05) {
            const an = k * ((Math.PI * 2) / 3) + s * 4.4;
            const rd = r * (1 - s * 0.92);
            if (s === 0) ctx.moveTo(Math.cos(an) * rd, Math.sin(an) * rd);
            else ctx.lineTo(Math.cos(an) * rd, Math.sin(an) * rd);
          }
          ctx.strokeStyle = k % 2 === 0 ? '#9ff1ff' : '#d9b8ff';
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // Default / Tables 0, 1, 3, 6, 7: 18 Golden rivets along the outer rim
        const notches = 18;
        ctx.fillStyle = '#f2c230';
        ctx.strokeStyle = OD;
        ctx.lineWidth = 0.6;
        for (let i = 0; i < notches; i++) {
          const a = (i / notches) * Math.PI * 2;
          const nx = p.x + Math.cos(a) * (ringR - 2.4);
          const ny = p.y + Math.sin(a) * (ringR - 2.4);
          ctx.beginPath();
          ctx.arc(nx, ny, 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Dark Interior Void with Gradient
      const voidGrad = ctx.createRadialGradient(p.x - 2, p.y - 2, 1, p.x, p.y, r);
      voidGrad.addColorStop(0, '#1c1222');
      voidGrad.addColorStop(1, '#030206');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = voidGrad;
      ctx.fill();

      // Mesh Net pattern inside pocket
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r - 0.6, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = 'rgba(190, 125, 60, 0.45)';
      ctx.lineWidth = 0.9;
      for (let i = -r; i <= r; i += 4.2) {
        ctx.beginPath();
        ctx.moveTo(p.x + i - r, p.y - r);
        ctx.lineTo(p.x + i + r, p.y + r);
        ctx.moveTo(p.x + i + r, p.y - r);
        ctx.lineTo(p.x + i - r, p.y + r);
        ctx.stroke();
      }
      ctx.restore();

      // Specular highlight arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 2.9, 3.6, 4.5);
      ctx.stroke();
    }

    // 6. Ambient Table Props on Rails (Beer, Nuts, Chalk, Coffee, Martini, Dice...)
    this.drawRailProps(ctx, tableIndex, shakeAmount, time);

    ctx.restore();
  }

  // Draw authentic boteco props placed on the wooden rails that sway with table shake
  private drawRailProps(ctx: CanvasRenderingContext2D, tableIndex: number, shake: number, time: number): void {
    const px = Math.sin(time * 1.7) * shake * 2.5;
    const py = Math.cos(time * 1.3) * shake * 2.5;

    const Z = tableIndex % 10;
    // Six thematic slots per table matching Prototype AM[table].p
    let propTypes = ['beer', 'beer', 'nuts', 'chalk', 'cards', 'beer'];
    if (Z === 2 || Z === 7) {
      propTypes = ['martini', 'martini', 'chips', 'cash', 'martini', 'chips'];
    } else if (Z === 4) {
      propTypes = ['coco', 'shell', 'coco', 'shell', 'coco', 'shell'];
    } else if (Z === 5) {
      propTypes = ['chips', 'dice', 'cards', 'chips', 'dice', 'cards'];
    }

    const slots = [
      { x: this.minX + (this.maxX - this.minX) * 0.2, y: this.railSize / 2, type: propTypes[0] },
      { x: this.minX + (this.maxX - this.minX) * 0.75, y: this.railSize / 2, type: propTypes[1] },
      { x: this.minX + (this.maxX - this.minX) * 0.35, y: this.height - this.railSize / 2, type: propTypes[2] },
      { x: this.minX + (this.maxX - this.minX) * 0.82, y: this.height - this.railSize / 2, type: propTypes[3] },
      { x: this.railSize / 2, y: this.height / 2, type: propTypes[4] },
      { x: this.width - this.railSize / 2, y: this.height / 2, type: propTypes[5] },
    ];

    for (const slot of slots) {
      ctx.save();
      ctx.translate(slot.x, slot.y);

      // Ambient drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(2, 3, 9, 0, Math.PI * 2);
      ctx.fill();

      if (slot.type === 'beer') {
        // Beer mug with glass handle and amber beer
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#e8dcc0';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = OD;
        ctx.stroke();

        // Liquid sway
        const beerGrad = ctx.createRadialGradient(px - 1.5, py - 1.5, 0, px, py, 6);
        beerGrad.addColorStop(0, '#ffd35a');
        beerGrad.addColorStop(1, '#d98410');
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = beerGrad;
        ctx.fill();

        // Foam bubbles
        ctx.fillStyle = '#fff7de';
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Glass highlight arc
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 5.2, 3.5, 4.4);
        ctx.stroke();
      } else if (slot.type === 'nuts') {
        // Wood bowl of roasted peanuts
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#6b4226';
        ctx.fill();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = OD;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#3d2412';
        ctx.fill();

        const peanuts = [[-2, -2], [2, -3], [3, 1], [-2, 3], [0, 0]];
        for (const p of peanuts) {
          ctx.beginPath();
          ctx.ellipse(p[0], p[1], 2.2, 1.4, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#e0b070';
          ctx.fill();
          ctx.lineWidth = 0.7;
          ctx.strokeStyle = '#8a5a30';
          ctx.stroke();
        }
      } else if (slot.type === 'chalk') {
        // Blue cue chalk cube with tip indentation
        ctx.beginPath();
        ctx.roundRect(-5.5, -5.5, 11, 11, 2);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = OD;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(-4, -4, 8, 8, 1.5);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#1d4ed8';
        ctx.fill();
      } else if (slot.type === 'cards') {
        // Two playing cards on the rail
        ctx.save();
        ctx.rotate(0.3);
        ctx.beginPath();
        ctx.roundRect(-5, -7, 10, 14, 1.5);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = OD;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.rotate(-0.2);
        ctx.beginPath();
        ctx.roundRect(-5, -7, 10, 14, 1.5);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = OD;
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-1.5, -2, 3, 3);
        ctx.restore();
      } else if (slot.type === 'martini') {
        // Martini glass with olive
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = OD;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px * 0.5, py * 0.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#65a30d'; // Olive
        ctx.fill();
      } else if (slot.type === 'chips') {
        // Casino Poker Chip
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.strokeStyle = OD;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (slot.type === 'dice') {
        // Pair of Casino Dice
        ctx.beginPath();
        ctx.roundRect(-4.5, -4.5, 9, 9, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.strokeStyle = OD;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
      } else if (slot.type === 'coco') {
        // Green Coconut with straw
        ctx.beginPath();
        ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = OD;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(1, -2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#15803d';
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private drawDiamondSights(ctx: CanvasRenderingContext2D): void {
    const drawSight = (x: number, y: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f4ecd8';
      ctx.fill();
      ctx.strokeStyle = OD;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const yTop = this.railSize / 2;
    const yBottom = this.height - this.railSize / 2;
    const xLeft = this.railSize / 2;
    const xRight = this.width - this.railSize / 2;

    const playW = this.maxX - this.minX;
    const playH = this.maxY - this.minY;

    // Top and bottom sights (7 sights, center omitted for middle pocket)
    for (let i = 1; i <= 7; i++) {
      if (i === 4) continue;
      const x = this.minX + (playW * i) / 8;
      drawSight(x, yTop);
      drawSight(x, yBottom);
    }

    // Left and right sights (3 sights, center omitted)
    for (let j = 1; j <= 3; j++) {
      if (j === 2) continue;
      const y = this.minY + (playH * j) / 4;
      drawSight(xLeft, y);
      drawSight(xRight, y);
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
