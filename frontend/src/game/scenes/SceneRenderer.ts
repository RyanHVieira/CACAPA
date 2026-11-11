
import { SCENE_PALETTES, drawCircle, createRadialGradient } from './TableScenes';

const W = 1040;
const H = 520;
const OD = '#0b0710';

export class SceneRenderer {
  private tableIndex: number;
  private time: number = 0;
  private shakeX: number = 0;
  private shakeY: number = 0;
  private lowResCanvas: HTMLCanvasElement;
  private lowResCtx: CanvasRenderingContext2D;
  private lowResWidth = 96;
  private lowResHeight = 54;

  constructor(tableIndex: number = 0) {
    this.tableIndex = tableIndex;
    this.lowResCanvas = document.createElement('canvas');
    this.lowResCanvas.width = this.lowResWidth;
    this.lowResCanvas.height = this.lowResHeight;
    this.lowResCtx = this.lowResCanvas.getContext('2d')!;
  }

  setTable(index: number): void {
    this.tableIndex = index;
  }

  setTime(time: number): void {
    this.time = time;
  }

  setShake(x: number, y: number): void {
    this.shakeX = x;
    this.shakeY = y;
  }

    private renderSwirl(): void {
    const palette = SCENE_PALETTES[this.tableIndex];
    const ctx = this.lowResCtx;
    const w = this.lowResWidth;
    const h = this.lowResHeight;
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    let ptr = 0;
    const t = this.time;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let u = ((x - w / 2) / h) * 3;
        let v = ((y - h / 2) / h) * 3;
        const dist = Math.hypot(u, v);
        const a = Math.atan2(v, u) + t * 0.15 + dist * 0.8;
        u = dist * Math.cos(a);
        v = dist * Math.sin(a);
        for (let i = 1; i < 5; i++) {
          u += (0.6 / i) * Math.sin(i * v + t * 0.4 + 0.3 * i);
          v += (0.6 / i) * Math.cos(i * u + t * 0.4 + 0.3 * i);
        }

                const k = Math.round((0.5 + 0.5 * Math.sin(u + v)) * 5) / 5;
        const n = 0.5 + 0.5 * Math.sin(u - v * 1.3);

        const r = palette.dark[0] * (1 - k) + (palette.mid[0] * (1 - n) + palette.light[0] * n) * k;
        const g = palette.dark[1] * (1 - k) + (palette.mid[1] * (1 - n) + palette.light[1] * n) * k;
        const b = palette.dark[2] * (1 - k) + (palette.mid[2] * (1 - n) + palette.light[2] * n) * k;

        data[ptr] = r | 0;
        data[ptr + 1] = g | 0;
        data[ptr + 2] = b | 0;
        data[ptr + 3] = 255;
        ptr += 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

    private renderSceneDecorations(ctx: CanvasRenderingContext2D): void {
    const t = this.time;
    const Z = this.tableIndex;
    const pc = SCENE_PALETTES[Z].dark;
    const dk = `rgb(${(pc[0] * 0.8) | 0},${(pc[1] * 0.8) | 0},${(pc[2] * 0.8) | 0})`;

    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);

        const bub = (co: string, n: number) => {
      ctx.strokeStyle = co;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < n; i++) {
        const y = H + 10 - ((t * (0.3 + (i % 4) * 0.12) + i * 61) % (H + 20));
        const x = ((i * 97.3) % W) + Math.sin(t * 0.03 + i) * 6;
        ctx.globalAlpha = 0.5;
        drawCircle(ctx, x, y, 2 + (i % 4), undefined, co);
        ctx.globalAlpha = 1;
      }
    };

    const dust = (co: string, n: number, sp: number) => {
      ctx.fillStyle = co;
      for (let i = 0; i < n; i++) {
        const x = (i * 131.7 + t * sp * (0.5 + (i % 3) * 0.3)) % W;
        const y = (i * 71.3 + Math.sin(t * 0.02 + i) * 14) % H;
        ctx.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 0.04 + i));
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
    };

    const wire = (y: number, sg: number, f: (x: number, y: number, i: number) => void) => {
      ctx.strokeStyle = OD;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, y);
      ctx.quadraticCurveTo(W / 2, y + 2 * sg, W + 5, y);
      ctx.stroke();
      for (let i = 1; i < 20; i++) {
        const u = i / 20;
        f(u * W, y + 4 * sg * u * (1 - u), i);
      }
    };

    const sky = (wc: string, sd: number) => {
      for (let i = 0; i < 22; i++) {
        const x = i * 44 - 6;
        const h = 26 + ((i * 37 + sd) % 7) * 9;
        ctx.fillStyle = dk;
        ctx.fillRect(x, 126 - h, 40, h);
        ctx.fillStyle = wc;
        for (let j = 0; j < h / 9; j++) {
          for (let k = 0; k < 3; k++) {
            if ((i * 3 + j * 5 + k * 7 + sd) % 4 < 1) {
              ctx.fillRect(x + 6 + k * 11, 126 - h + 5 + j * 9, 4, 4);
            }
          }
        }
      }
    };

    const tri = (x: number, w: number, h: number, co: string) => {
      ctx.fillStyle = co;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + w, 0);
      ctx.lineTo(x + w * 0.2 - h * 0.5, 130);
      ctx.lineTo(x - h * 0.5, 130);
      ctx.fill();
    };

    const ci = (
      x: number,
      y: number,
      r: number,
      fill?: string | CanvasGradient | CanvasPattern,
      stroke?: string,
      lw: number = 1.5
    ) => {
      drawCircle(ctx, x, y, r, fill, stroke, lw);
    };

        if (Z === 0) {
      bub('#ffd36a', 24);
      for (let k = 0; k < 19; k++) {
        const x = k * 52 + 14;
        const h = 24 + ((k * 7) % 3) * 9;
        ctx.fillStyle = dk;
        ctx.fillRect(x, 126 - h, 12, h);
        ctx.fillRect(x + 3, 126 - h - 9, 6, 10);
      }
      wire(8, 26, (x, y, i) => {
        const co = (i + ((t / 20) | 0)) % 3 ? '#ffd36a' : '#ff8fd0';
        ctx.shadowColor = co;
        ctx.shadowBlur = 10;
        ci(x, y + 5, 3.5, co);
        ctx.shadowBlur = 0;
      });
    } else if (Z === 1) {
      wire(10, 22, (x, y, i) => {
        const colors = ['#f2c230', '#fff2c0', '#8dff9a', '#e86fb0'];
        ctx.fillStyle = colors[i % 4];
        ctx.strokeStyle = OD;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 9, y);
        ctx.lineTo(x + 9, y);
        ctx.lineTo(x, y + 22 + Math.sin(t * 0.05 + i) * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      dust('#fff', 34, 0.25);
    } else if (Z === 2) {
      ctx.fillStyle = '#8a1a34';
      ctx.fillRect(0, 0, W, 6);
      for (let k = 0; k < 12; k++) {
        const x = k * 80;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.quadraticCurveTo(x + 40, 58, x + 80, 0);
        ctx.fill();
        ctx.strokeStyle = '#f2c230';
        ctx.lineWidth = 2;
        ctx.stroke();
        ci(x, 8, 3, '#f2c230');
      }
      dust('#ffe08a', 40, 0.15);
    } else if (Z === 3) {
      for (let k = 0; k < 14; k++) {
        tri(k * 90 + ((t * 0.3) % 90), 40, 100, 'rgba(255,70,60,.09)');
      }
      sky('#d6322a', 3);
      for (let i = 0; i < 6; i++) {
        const q = (t * 0.4 + i * 40) % 110;
        ci(
          120 + i * 160 + Math.sin(t * 0.02 + i) * 12,
          118 - q,
          10 + q / 5,
          'rgba(190,190,200,.1)'
        );
      }
    } else if (Z === 4) {
      const sg = createRadialGradient(ctx, 234, 76, 70, [
        [0, 'rgba(255,235,150,.9)'],
        [1, 'rgba(255,200,100,0)'],
      ]);
      ci(234, 76, 70, sg);
      ctx.strokeStyle = 'rgba(255,230,140,.5)';
      ctx.lineWidth = 3;
      for (let k = 0; k < 12; k++) {
        const a = k * 0.5236 + t * 0.004;
        ctx.beginPath();
        ctx.moveTo(234 + Math.cos(a) * 27, 76 + Math.sin(a) * 27);
        ctx.lineTo(234 + Math.cos(a) * 38, 76 + Math.sin(a) * 38);
        ctx.stroke();
      }
      ci(234, 76, 21, '#ffe27a', OD, 2);
      ctx.fillStyle = 'rgba(20,150,200,.6)';
      ctx.fillRect(0, 100, W, 30);
      ctx.lineWidth = 2;
      for (let w = 0; w < 3; w++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.5 - w * 0.12})`;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 6) {
          const y = 104 + w * 8 + Math.sin(x * 0.05 + t * 0.05 + w * 2) * 2;
          if (x) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const x = ((t * 0.5 + i * 340) % 1100) - 70;
        const y = 36 + i * 16 + Math.sin(t * 0.05 + i) * 4;
        ctx.strokeStyle = OD;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.quadraticCurveTo(x - 4, y - 7, x, y);
        ctx.quadraticCurveTo(x + 4, y - 7, x + 8, y);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(946, -8);
      for (let i = 0; i < 6; i++) {
        const a = 1.6 + i * 0.28 + Math.sin(t * 0.025 + i) * 0.05;
        const L = 95;
        const ex = Math.cos(a) * L;
        const ey = Math.sin(a) * L;
        ctx.lineCap = 'round';
        ctx.strokeStyle = OD;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(ex * 0.5, ey * 0.5 - 14, ex, ey);
        ctx.stroke();
        ctx.strokeStyle = '#2f9a4a';
        ctx.lineWidth = 6;
        ctx.stroke();
      }
      ctx.restore();
    } else if (Z === 5) {
      const spotlights: [number, string, number][] = [
        [170, 'rgba(255,90,230,.14)', 0],
        [800, 'rgba(255,243,90,.12)', 2],
      ];
      for (const [x, co, ph] of spotlights) {
        const a = Math.PI / 2 + Math.sin(t * 0.02 + ph) * 0.5;
        ctx.fillStyle = co;
        ctx.beginPath();
        ctx.moveTo(x, -10);
        ctx.lineTo(x + Math.cos(a - 0.12) * 600, -10 + Math.sin(a - 0.12) * 600);
        ctx.lineTo(x + Math.cos(a + 0.12) * 600, -10 + Math.sin(a + 0.12) * 600);
        ctx.fill();
      }
      ctx.save();
      ctx.strokeStyle = '#3ec1d3';
      ctx.shadowColor = '#3ec1d3';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const x = k * 24;
        const y = 116 + (k % 2 ? -8 : 8);
        if (k) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      dust('#fff35a', 30, 0.4);
    } else if (Z === 6) {
      for (let k = 0; k < 7; k++) {
        tri(
          k * 150 + Math.sin(t * 0.01 + k) * 30,
          40,
          60 + Math.sin(t * 0.013 + k) * 30,
          'rgba(170,235,255,.09)'
        );
      }
      bub('#aaf0ff', 32);
      ctx.globalAlpha = 0.65;
      for (let i = 0; i < 5; i++) {
        const x = ((t * 0.5 * (1 + (i % 3) * 0.3) + i * 230) % 1100) - 80;
        const y = 30 + i * 20;
        ctx.fillStyle = dk;
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 5, 0, 0, Math.PI * 2);
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x - 20, y - 6);
        ctx.lineTo(x - 20, y + 6);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(200,245,255,.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y = 8 + Math.sin(x * 0.04 + t * 0.05) * 2;
        if (x) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    } else if (Z === 7) {
      sky('#ffd36a', 7);
      ci(234, 64, 19, '#f3eeff', OD, 2);
      ci(228, 58, 4, 'rgba(150,140,190,.5)');
      ci(240, 70, 3, 'rgba(150,140,190,.5)');
      dust('#fff', 40, 0.05);
    } else if (Z === 8) {
      for (let k = 0; k < 9; k++) {
        const x = k * 120 + 10;
        ctx.beginPath();
        ctx.moveTo(x, 126);
        ctx.lineTo(x, 64);
        ctx.arc(x + 50, 64, 50, Math.PI, 0);
        ctx.lineTo(x + 100, 126);
        ctx.closePath();
        ctx.fillStyle = dk;
        ctx.fill();
        ctx.fillStyle = 'rgba(255,200,100,.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,210,100,.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      dust('#ffe08a', 36, 0.2);
    } else {
      for (let i = 0; i < 26; i++) {
        const x = (i * 173.3) % W;
        const y = (i * 59.7) % 130;
        const z = 1 + 1.8 * (0.5 + 0.5 * Math.sin(t * 0.05 + i));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 0.05 + i);
        ctx.beginPath();
        ctx.moveTo(x - z, y);
        ctx.lineTo(x + z, y);
        ctx.moveTo(x, y - z);
        ctx.lineTo(x, y + z);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(200,160,255,.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(480, 84, 320, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 3; k++) {
        const a = t * 0.01 + k * 2.1;
        ci(480 + Math.cos(a) * 320, 84 + Math.sin(a) * 22, 5, '#ffd36a', OD, 1.5);
      }
      dust('#d9b8ff', 30, 0.15);
    }

    ctx.restore();
  }

    render(ctx: CanvasRenderingContext2D, targetW?: number, targetH?: number): void {
    const destW = targetW || ctx.canvas.width || W;
    const destH = targetH || ctx.canvas.height || H;

        this.renderSwirl();

        ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.lowResCanvas, 0, 0, destW, destH);
    ctx.restore();

        ctx.save();
    const scaleX = destW / W;
    const scaleY = destH / H;
    ctx.scale(scaleX, scaleY);
    this.renderSceneDecorations(ctx);
    ctx.restore();
  }
}

export function createSceneRenderer(tableIndex: number = 0): SceneRenderer {
  return new SceneRenderer(tableIndex);
}