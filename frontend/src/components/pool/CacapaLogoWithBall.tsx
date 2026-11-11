import React, { useEffect, useRef } from 'react';

interface CacapaLogoWithBallProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** PNG pixel art 200x62 com o vão no meio (coloque em /public). */
  logoSrc?: string;
}

// ---------------------------------------------------------------
// Constantes (mesmas do protótipo HTML)
// ---------------------------------------------------------------

// Canvas lógico; o desenho original é feito em coordenadas de 960x540
// com o centro da logo em x = 480, por isso o translate abaixo.
const VW = 560;
const VH = 190;
const OX = VW / 2 - 480;
const OY = 18;

const TTW = 200; // largura do PNG
const TTH = 62; // altura do PNG
const TTS = 2; // escala do pixel art
const TTX = 103; // centro da bola dentro do PNG
const TTY = 28;
const TTR = 24; // raio da bola em pixels do buffer
const TTB = TTR * 2;

const TKW = 264; // buffer dos tacos
const TKH = 90;

const D8 = [
  '.XXXXX.',
  'XXXXXXX',
  'XX...XX',
  'XX...XX',
  'XXXXXXX',
  '.XXXXX.',
  'XXXXXXX',
  'XX...XX',
  'XX...XX',
  'XXXXXXX',
  '.XXXXX.',
];

const q2 = (v: number) => Math.round(v * 2) / 2;

const ttWave = (i: number, T: number) =>
  3.5 * Math.sin(i * 0.075 - T * 0.06) +
  1.2 * Math.sin(i * 0.17 + T * 0.035) +
  3 * Math.sin(T * 0.03);

// ---------------------------------------------------------------
// Bola 8 pixel art girando (esfera sombreada pixel a pixel)
// ---------------------------------------------------------------

function renderBall8(img: ImageData, th: number): void {
  const d = img.data;

  const tl = 0.22;
  const ct = Math.cos(tl);
  const st = Math.sin(tl);
  const cs = Math.cos(th);
  const sn = Math.sin(th);

  const ll = Math.hypot(0.5, -0.62, 0.6);
  const LX = 0.5 / ll;
  const LY = -0.62 / ll;
  const LZ = 0.6 / ll;

  const hl = Math.hypot(LX, LY, LZ + 1);
  const HX = LX / hl;
  const HY = LY / hl;
  const HZ = (LZ + 1) / hl;

  const cell = 0.064;

  for (let j = 0; j < TTB; j++) {
    for (let i = 0; i < TTB; i++) {
      const o = (j * TTB + i) * 4;

      const x = (i + 0.5 - TTR) / TTR;
      const y = (j + 0.5 - TTR) / TTR;
      const d2 = x * x + y * y;

      if (d2 > 1) {
        d[o + 3] = 0;
        continue;
      }

      const z = Math.sqrt(1 - d2);
      const li = Math.max(0, x * LX + y * LY + z * LZ);
      const sp = x * HX + y * HY + z * HZ;

      let c: number[] = [0, 0, 0];

      if (d2 > 0.9) {
        c = [3, 4, 6]; // contorno
      } else {
        const y1 = y * ct + z * st;
        const z1 = -y * st + z * ct;

        const qx = x * cs - z1 * sn;
        const qz = x * sn + z1 * cs;
        const qy = y1;

        const front = qz > 0;
        const dx = front ? qx : -qx;

        if (qz !== 0 && qx * qx + qy * qy < 0.25) {
          // disco branco com o "8" em pixel art
          const col = Math.floor(dx / cell + 3.5);
          const row = Math.floor(qy / cell + 5.5);

          if (
            col >= 0 &&
            col < 7 &&
            row >= 0 &&
            row < 11 &&
            D8[row][col] === 'X'
          ) {
            c = [6, 6, 8];
          } else {
            c =
              li < 0.4
                ? [205, 196, 180]
                : li < 0.65
                ? [232, 226, 214]
                : [252, 250, 244];
          }
        } else {
          c =
            li < 0.25
              ? [4, 4, 6]
              : li < 0.5
              ? [12, 12, 15]
              : li < 0.75
              ? [24, 24, 29]
              : [38, 38, 44];
        }

        // reflexo de borda
        if (d2 > 0.6 && d2 < 0.84 && x * 0.6 - y * 0.8 > 0.55 && c[0] < 60) {
          c = [70, 74, 84];
        }

        // brilho especular
        if (sp > 0.985) c = [240, 244, 250];
        else if (sp > 0.95 && c[0] < 60) c = [150, 156, 170];
      }

      d[o] = c[0];
      d[o + 1] = c[1];
      d[o + 2] = c[2];
      d[o + 3] = 255;
    }
  }
}

// ---------------------------------------------------------------
// Tacos cruzados atrás da logo (baixa resolução = pixel art)
// ---------------------------------------------------------------

function drawStick(
  k: CanvasRenderingContext2D,
  a: number,
  sg: number,
  roll: number
): void {
  const L = 254;
  const N = 127;

  const hw = (t: number) => 1.7 + 2.3 * t;

  const col = (t: number) =>
    t < 0.025
      ? '#4aa3ff'
      : t < 0.055
      ? '#f4ecd8'
      : t < 0.6
      ? '#e8c48a'
      : t < 0.63
      ? '#f2b632'
      : t < 0.79
      ? '#3a2418'
      : t < 0.82
      ? '#d6322a'
      : t < 0.985
      ? '#3a2418'
      : '#0b0710';

  k.save();
  k.translate(TKW / 2, TKH / 2);
  k.rotate(a);

  // contorno escuro
  k.fillStyle = '#0b0710';
  k.beginPath();
  k.moveTo(L / 2 + 1.5, -hw(0) - 1.2);
  k.lineTo(-L / 2 - 1.5, -hw(1) - 1.2);
  k.lineTo(-L / 2 - 1.5, hw(1) + 1.2);
  k.lineTo(L / 2 + 1.5, hw(0) + 1.2);
  k.fill();

  const u = Math.sin(roll) * 0.55;

  for (let i = 0; i < N; i++) {
    const x0 = L / 2 - (i * L) / N;
    const x1 = L / 2 - ((i + 1) * L) / N - 0.4;

    const t0 = i / N;
    const t1 = (i + 1) / N;

    const h0 = hw(t0);
    const h1 = hw(t1);

    const q = (f0: number, f1: number, c: string) => {
      k.fillStyle = c;
      k.beginPath();
      k.moveTo(x0, sg * f0 * h0);
      k.lineTo(x1, sg * f0 * h1);
      k.lineTo(x1, sg * f1 * h1);
      k.lineTo(x0, sg * f1 * h0);
      k.fill();
    };

    q(-1, 1, col((t0 + t1) / 2));
    q(0.5, 1, 'rgba(0,0,0,.3)');
    q(
      Math.max(-1, u - 0.22),
      Math.min(1, u + 0.22),
      'rgba(255,255,255,.34)'
    );
  }

  k.restore();
}

// ---------------------------------------------------------------
// Componente
// ---------------------------------------------------------------

export const CacapaLogoWithBall: React.FC<CacapaLogoWithBallProps> = ({
  className = '',
  size = 'md',
  logoSrc = '/cacapa-logo.png',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxWidthClass =
    size === 'sm'
      ? 'max-w-[360px]'
      : size === 'md'
      ? 'max-w-[560px] sm:max-w-[680px]'
      : 'max-w-[680px] sm:max-w-[880px] md:max-w-[1040px]';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const g = canvas.getContext('2d');
    if (!g) return;

    // Backing store em 2x, como no protótipo.
    canvas.width = VW * 2;
    canvas.height = VH * 2;

    // Buffer da bola.
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = ballCanvas.height = TTB;
    const ballCtx = ballCanvas.getContext('2d')!;
    const ballData = ballCtx.createImageData(TTB, TTB);

    // Buffers dos tacos (cor e sombra).
    const tkC = document.createElement('canvas');
    const tkS = document.createElement('canvas');
    tkC.width = tkS.width = TKW;
    tkC.height = tkS.height = TKH;
    const tkx = tkC.getContext('2d', { willReadFrequently: true })!;
    const tks = tkS.getContext('2d')!;

    // Logo PNG e sua silhueta (para a sombra).
    const logo = new Image();
    let logoReady = false;
    let silhouette: HTMLCanvasElement | null = null;

    logo.onload = () => {
      const s = document.createElement('canvas');
      s.width = TTW;
      s.height = TTH;

      const k = s.getContext('2d')!;
      k.drawImage(logo, 0, 0);
      k.globalCompositeOperation = 'source-in';
      k.fillStyle = '#000';
      k.fillRect(0, 0, TTW, TTH);

      silhouette = s;
      logoReady = true;
    };

    logo.src = logoSrc;

    const renderSticks = (sw: number, T: number) => {
      tkx.clearRect(0, 0, TKW, TKH);

      const o = 0.06 * Math.sin(T * 0.025);
      const r = T * 0.04;

      drawStick(tkx, Math.PI + 0.25 + sw - o, -1, r + 2);
      drawStick(tkx, -0.25 - sw + o, 1, r);

      // alpha binário = pixel art sem bordas suaves
      const im = tkx.getImageData(0, 0, TKW, TKH);
      const d = im.data;

      for (let i = 3; i < d.length; i += 4) {
        d[i] = d[i] > 110 ? 255 : 0;
      }

      tkx.putImageData(im, 0, 0);

      tks.globalCompositeOperation = 'copy';
      tks.drawImage(tkC, 0, 0);
      tks.globalCompositeOperation = 'source-in';
      tks.fillStyle = '#000';
      tks.fillRect(0, 0, TKW, TKH);
    };

    let animId = 0;
    let startMs = 0;

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, canvas.width, canvas.height);

      if (!logoReady || !silhouette) return;

      if (!startMs) startMs = now;

      // T = frames de 60 fps desde a entrada (igual ao protótipo)
      const T = (now - startMs) / (1000 / 60);

      // Entrada com ease-out-back.
      const e = Math.min(1, T / 60);
      const c1 = 1.70158;
      const eb =
        1 + (c1 + 1) * Math.pow(e - 1, 3) + c1 * Math.pow(e - 1, 2);

      const ga = Math.min(1, e * 3);
      const dy = -(1 - eb) * 150;

      const x0 = 480 - (TTW * TTS) / 2;
      const y0 = 10 + dy;

      g.setTransform(2, 0, 0, 2, 0, 0);
      g.translate(OX, OY);

      // Halo escuro atrás da logo.
      g.save();
      g.translate(480, 78);
      g.scale(1, 0.4);

      const hg = g.createRadialGradient(0, 0, 0, 0, 0, 340);
      hg.addColorStop(0, 'rgba(10,4,18,.55)');
      hg.addColorStop(1, 'rgba(10,4,18,0)');

      g.globalAlpha = ga;
      g.fillStyle = hg;
      g.fillRect(-340, -340, 680, 680);
      g.restore();

      // Tacos cruzados.
      renderSticks((1 - eb) * 0.9, T);

      g.save();
      g.imageSmoothingEnabled = false;

      const kf = q2(2.4 * Math.sin(T * 0.03 - 0.7)) + dy * 0.4;
      const kx = 480 - TKW;
      const ky = 72 - TKH;

      g.globalAlpha = 0.35 * ga;
      g.drawImage(tkS, kx + 6, ky + 10 + kf, TKW * 2, TKH * 2);

      g.globalAlpha = ga;
      g.drawImage(tkC, kx, ky + kf, TKW * 2, TKH * 2);

      // Sombra da logo (coluna por coluna, com a mesma onda).
      g.globalAlpha = 0.38 * ga;

      for (let i = 0; i < TTW; i++) {
        g.drawImage(
          silhouette,
          i,
          0,
          1,
          TTH,
          x0 + i * TTS + 3,
          y0 + 6 + q2(ttWave(i, T)),
          TTS,
          TTH * TTS
        );
      }

      // Logo com sine warp.
      g.globalAlpha = ga;

      for (let i = 0; i < TTW; i++) {
        g.drawImage(
          logo,
          i,
          0,
          1,
          TTH,
          x0 + i * TTS,
          y0 + q2(ttWave(i, T)),
          TTS,
          TTH * TTS
        );
      }

      // Bola 8 girando no vão da logo.
      const bx = x0 + TTX * TTS;
      const by = y0 + TTY * TTS + q2(ttWave(TTX, T));

      g.globalAlpha = 0.35 * ga;
      g.fillStyle = '#000';
      g.beginPath();
      g.arc(bx + 4, by + 7, TTR * TTS, 0, Math.PI * 2);
      g.fill();

      g.globalAlpha = ga;

      renderBall8(ballData, T * 0.035);
      ballCtx.putImageData(ballData, 0, 0);

      g.drawImage(
        ballCanvas,
        bx - TTR * TTS,
        by - TTR * TTS,
        TTB * TTS,
        TTB * TTS
      );

      g.restore();
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [logoSrc]);

  return (
    <div
      className={`relative w-full ${maxWidthClass} mx-auto select-none ${className}`}
      style={{ aspectRatio: `${VW} / ${VH}` }}
    >
      <canvas
        ref={canvasRef}
        aria-label="CAÇAPA"
        role="img"
        className="block w-full h-full pointer-events-none"
      />
    </div>
  );
};
