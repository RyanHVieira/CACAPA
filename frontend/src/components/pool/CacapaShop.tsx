import React, { useRef, useEffect, useState } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { Card } from '../../game/cards/Card';
import { BallRackModal } from './BallRackModal';

interface CacapaShopProps {
  engine: CacapaPoolEngine;
  onNextRound: () => void;
  onUpdate: () => void;
  onOpenMenu?: () => void;
}

// Pool ball base colors for numbers 1 to 15
const BALL_COLORS: Record<number, { bg: string; isStripe: boolean }> = {
  1: { bg: '#eab308', isStripe: false },
  2: { bg: '#2563eb', isStripe: false },
  3: { bg: '#dc2626', isStripe: false },
  4: { bg: '#7e22ce', isStripe: false },
  5: { bg: '#ea580c', isStripe: false },
  6: { bg: '#16a34a', isStripe: false },
  7: { bg: '#831843', isStripe: false },
  8: { bg: '#0f172a', isStripe: false },
  9: { bg: '#eab308', isStripe: true },
  10: { bg: '#2563eb', isStripe: true },
  11: { bg: '#dc2626', isStripe: true },
  12: { bg: '#7e22ce', isStripe: true },
  13: { bg: '#ea580c', isStripe: true },
  14: { bg: '#16a34a', isStripe: true },
  15: { bg: '#831843', isStripe: true },
};

// Rich, jewel-toned liquid themes for Joker bottles
const getJokerBottleTheme = (card: Card) => {
  const id = card.id.toLowerCase();
  if (id.includes('blue') || id.includes('chalk')) {
    return { top: '#38bdf8', bottom: '#0284c7', glow: 'rgba(56, 189, 248, 0.75)' };
  }
  if (id.includes('groselha')) {
    return { top: '#fb7185', bottom: '#e11d48', glow: 'rgba(251, 113, 133, 0.75)' };
  }
  if (id.includes('billiard') || id.includes('green')) {
    return { top: '#4ade80', bottom: '#16a34a', glow: 'rgba(74, 222, 128, 0.75)' };
  }
  if (id.includes('eight') || id.includes('oito')) {
    return { top: '#a5b4fc', bottom: '#4338ca', glow: 'rgba(165, 180, 252, 0.75)' };
  }
  if (id.includes('gold') || id.includes('pocket') || id.includes('digger')) {
    return { top: '#fef08a', bottom: '#ca8a04', glow: 'rgba(254, 240, 138, 0.85)' };
  }
  if (id.includes('baron') || id.includes('tarot')) {
    return { top: '#d8b4fe', bottom: '#7e22ce', glow: 'rgba(216, 180, 254, 0.75)' };
  }
  if (id.includes('bull') || id.includes('burning')) {
    return { top: '#fdba74', bottom: '#ea580c', glow: 'rgba(253, 186, 116, 0.75)' };
  }
  return { top: '#fcd34d', bottom: '#b45309', glow: 'rgba(252, 211, 77, 0.75)' };
};

interface UIElement {
  x: number;
  y: number;
  w: number;
  h: number;
  f: () => void;
  id?: string;
}

export const CacapaShop: React.FC<CacapaShopProps> = ({
  engine,
  onNextRound,
  onUpdate,
  onOpenMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isBallRackOpen, setIsBallRackOpen] = useState(false);

  // Live references to props
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const onNextRoundRef = useRef(onNextRound);
  onNextRoundRef.current = onNextRound;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onOpenMenuRef = useRef(onOpenMenu);
  onOpenMenuRef.current = onOpenMenu;

  // Immediate-mode UI and mouse state in direct pixel coordinates
  const uiRef = useRef<UIElement[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Toast feedback message (rendered directly in canvas)
  const toastRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

  // Sell confirmation state
  const sellConfirmRef = useRef<{ index: number; expireTime: number }>({ index: -1, expireTime: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width || window.innerWidth);
      const h = Math.round(rect.height || window.innerHeight);
      if (w > 0 && h > 0) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const updateMouse = (e: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const isIn = (box: { x: number; y: number; w: number; h: number }) => {
      const m = mouseRef.current;
      return m.x >= box.x && m.x <= box.x + box.w && m.y >= box.y && m.y <= box.y + box.h;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateMouse(e);
      const isOverInteractive = uiRef.current.some(isIn);
      canvas.style.cursor = isOverInteractive ? 'pointer' : 'default';
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      updateMouse(e);
      const hit = [...uiRef.current].reverse().find(isIn);
      if (hit) {
        hit.f();
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.x = -200;
      mouseRef.current.y = -200;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    // --- MAIN 60 FPS IMMEDIATE-MODE RENDER LOOP ---
    const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const eng = engineRef.current;

      const rect = canvas.getBoundingClientRect();
      const W = Math.round(rect.width || window.innerWidth);
      const H = Math.round(rect.height || window.innerHeight);

      // Global responsive scale factor based on standard desktop resolution
      const s = Math.min(W / 1100, H / 620);
      const scale = Math.max(0.85, Math.min(1.35, s));

      // Bar counter split (around 58% height, keeping plenty of room for shelves and counter)
      const counterY = Math.max(
        Math.round(H * 0.52),
        Math.min(Math.round(H * 0.60), H - Math.round(210 * scale))
      );

      // Clear immediate-mode UI click registry for this frame
      const ui: UIElement[] = [];
      ctx.clearRect(0, 0, W, H);

      // ==========================================
      // 1. WARM, BRIGHT TAVERN BAR BACKGROUND
      // ==========================================
      // Rich, warm mahogany / oak wooden back wall
      const wallGrad = ctx.createLinearGradient(0, 0, 0, counterY);
      wallGrad.addColorStop(0, '#3f1f11');
      wallGrad.addColorStop(0.5, '#562a16');
      wallGrad.addColorStop(1, '#3b1c0e');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, W, counterY);

      // Vertical warm wood paneling lines with soft highlight
      const plankW = Math.max(48, Math.round(64 * scale));
      const numPlanks = Math.ceil(W / plankW);
      for (let i = 0; i < numPlanks; i++) {
        const px = i * plankW;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 200, 120, 0.04)' : 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(px, 0, plankW, counterY);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, counterY);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 220, 140, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 1, 0);
        ctx.lineTo(px + 1, counterY);
        ctx.stroke();
      }

      // 2 illuminated liquor shelves on the back wall
      const shelfYList = [
        Math.round(counterY * 0.38),
        Math.round(counterY * 0.68),
      ];

      shelfYList.forEach((sy, shelfIdx) => {
        // Shelf backlight glow (warm LED strip underneath the shelf)
        const shelfGlow = ctx.createLinearGradient(0, sy - 40, 0, sy + 15);
        shelfGlow.addColorStop(0, 'rgba(255, 215, 120, 0)');
        shelfGlow.addColorStop(0.8, 'rgba(255, 215, 120, 0.28)');
        shelfGlow.addColorStop(1, 'rgba(255, 215, 120, 0)');
        ctx.fillStyle = shelfGlow;
        ctx.fillRect(0, sy - 40, W, 55);

        // Decorative background bottles (vibrant, illuminated glass)
        const botStep = Math.round(38 * scale);
        const botCount = Math.floor(W / botStep);
        const bottleColors = [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#f97316', '#06b6d4', '#ec4899',
        ];

        for (let i = 0; i < botCount; i++) {
          const bh = Math.round((28 + ((i * 37 + shelfIdx * 19) % 6) * 6) * scale);
          const bw = Math.round((12 + ((i * 13) % 4) * 3) * scale);
          const bx = 16 + i * botStep + ((i * 7) % 8);
          const col = bottleColors[(i + shelfIdx * 3) % bottleColors.length];

          // Bottle body
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.72;
          ctx.beginPath();
          ctx.roundRect(bx, sy - bh, bw, bh, 3);
          // Neck
          ctx.roundRect(bx + bw / 2 - 2.5 * scale, sy - bh - 10 * scale, 5 * scale, 12 * scale, 2);
          ctx.fill();

          // Glass specular reflection highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.fillRect(bx + 2, sy - bh + 2, 2 * scale, bh - 6);

          // Golden bottle cap
          ctx.fillStyle = '#fde047';
          ctx.fillRect(bx + bw / 2 - 3 * scale, sy - bh - 12 * scale, 6 * scale, 3 * scale);
          ctx.globalAlpha = 1;
        }

        // Solid wood shelf ledge
        const shelfH = Math.round(9 * scale);
        const shelfGrad = ctx.createLinearGradient(0, sy, 0, sy + shelfH);
        shelfGrad.addColorStop(0, '#7c3f1d');
        shelfGrad.addColorStop(0.5, '#5c2d14');
        shelfGrad.addColorStop(1, '#3b1c0b');
        ctx.fillStyle = shelfGrad;
        ctx.fillRect(0, sy, W, shelfH);

        // Polished golden brass shelf trim
        ctx.fillStyle = '#facc15';
        ctx.fillRect(0, sy, W, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(0, sy, W, 1);
      });

      // ==========================================
      // 2. VINTAGE HANGING BRASS TAVERN LAMPS
      // ==========================================
      const lampXList = [
        Math.round(W * 0.20),
        Math.round(W * 0.50),
        Math.round(W * 0.80),
      ];

      lampXList.forEach((lx) => {
        const lampY = Math.round(counterY * 0.30);

        // Volumetric warm golden light cone shining down upon the bar
        const cone = ctx.createRadialGradient(lx, lampY + 10, 15, lx, counterY + 40, Math.round(W * 0.32));
        cone.addColorStop(0, 'rgba(255, 225, 140, 0.36)');
        cone.addColorStop(0.4, 'rgba(255, 205, 110, 0.18)');
        cone.addColorStop(1, 'rgba(255, 180, 80, 0)');
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.moveTo(lx - 25 * scale, lampY + 12);
        ctx.lineTo(lx + 25 * scale, lampY + 12);
        ctx.lineTo(lx + 180 * scale, H);
        ctx.lineTo(lx - 180 * scale, H);
        ctx.closePath();
        ctx.fill();

        // Dark wire / chain from ceiling
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, lampY);
        ctx.stroke();

        // Brass dome fixture
        const domeR = 24 * scale;
        const domeGrad = ctx.createLinearGradient(lx - domeR, lampY, lx + domeR, lampY);
        domeGrad.addColorStop(0, '#78350f');
        domeGrad.addColorStop(0.3, '#f59e0b');
        domeGrad.addColorStop(0.5, '#fef08a');
        domeGrad.addColorStop(0.8, '#d97706');
        domeGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(lx, lampY, domeR, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing Edison bulb filament
        ctx.fillStyle = '#fffbeb';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(lx, lampY + 7 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Overall Warm Golden Ambient Light pool across the bar
      const globalLight = ctx.createRadialGradient(
        W / 2,
        counterY * 0.5,
        40,
        W / 2,
        counterY * 0.6,
        Math.max(W, H) * 0.7
      );
      globalLight.addColorStop(0, 'rgba(255, 220, 130, 0.24)');
      globalLight.addColorStop(0.6, 'rgba(255, 195, 95, 0.12)');
      globalLight.addColorStop(1, 'rgba(255, 170, 60, 0)');
      ctx.fillStyle = globalLight;
      ctx.fillRect(0, 0, W, counterY);

      // ==========================================
      // 3. WARM POLISHED WOODEN BAR COUNTER
      // ==========================================
      const counterH = H - counterY;
      const counterGrad = ctx.createLinearGradient(0, counterY, 0, H);
      counterGrad.addColorStop(0, '#db8437'); // bright warm top where light hits
      counterGrad.addColorStop(0.06, '#be6724');
      counterGrad.addColorStop(0.25, '#924614');
      counterGrad.addColorStop(0.65, '#622b09');
      counterGrad.addColorStop(1, '#421a05');
      ctx.fillStyle = counterGrad;
      ctx.fillRect(0, counterY, W, counterH);

      // Polished woodgrain wavy lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.lineWidth = 2;
      const grainRows = Math.floor(counterH / (16 * scale));
      for (let i = 0; i < grainRows; i++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 32) {
          const y = counterY + 18 * scale + i * 16 * scale + Math.sin(x * 0.01 + i * 1.5) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Glossy sheen reflection on the counter surface
      const counterSheen = ctx.createLinearGradient(0, counterY, 0, counterY + Math.round(90 * scale));
      counterSheen.addColorStop(0, 'rgba(255, 240, 200, 0.38)');
      counterSheen.addColorStop(0.25, 'rgba(255, 225, 160, 0.20)');
      counterSheen.addColorStop(1, 'rgba(255, 210, 140, 0)');
      ctx.fillStyle = counterSheen;
      ctx.fillRect(0, counterY, W, Math.round(90 * scale));

      // Dual Brass & Gold counter edge trim
      const lipGrad = ctx.createLinearGradient(0, counterY - 6, 0, counterY + 6);
      lipGrad.addColorStop(0, '#fffbeb');
      lipGrad.addColorStop(0.3, '#fde047');
      lipGrad.addColorStop(0.7, '#d97706');
      lipGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = lipGrad;
      ctx.fillRect(0, counterY - 5, W, 10);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, counterY + 5, W, 2);

      // Subtle water glass rings on the counter
      ctx.strokeStyle = 'rgba(255, 235, 190, 0.16)';
      ctx.lineWidth = 2;
      [
        [Math.round(W * 0.15), counterY + Math.round(110 * scale)],
        [Math.round(W * 0.85), counterY + Math.round(120 * scale)],
        [Math.round(W * 0.52), counterY + Math.round(140 * scale)],
      ].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(rx, ry, 26 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ==========================================
      // 4. IMMEDIATE-MODE BUTTON HELPER
      // ==========================================
      const drawButton = (
        bx: number,
        by: number,
        bw: number,
        bh: number,
        label: string,
        col: string,
        isEnabled: boolean,
        onClick: () => void
      ) => {
        const box = { x: bx, y: by, w: bw, h: bh };
        const hv = isEnabled && isIn(box);

        ctx.save();
        ctx.translate(bx + bw / 2, by + bh / 2 + (hv ? Math.sin(t * 0.15) * 1.5 : 0));
        if (hv) ctx.scale(1.04, 1.04);

        // 3D Drop shadow (Sticker style)
        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(-bw / 2 + 2, -bh / 2 + 4, bw, bh, 10);
        ctx.fill();

        // Button background
        ctx.fillStyle = isEnabled ? col : '#4b5563';
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 10);
        ctx.fill();

        // Dark outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0b0710';
        ctx.stroke();

        // Button top highlight
        if (isEnabled) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.beginPath();
          ctx.roundRect(-bw / 2 + 2, -bh / 2 + 2, bw - 4, bh * 0.45, 8);
          ctx.fill();
        }

        // Label
        ctx.font = `700 ${Math.round(bh * 0.44)}px Oswald, sans-serif`;
        ctx.fillStyle = isEnabled ? '#0b0710' : '#9ca3af';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 1);
        ctx.restore();

        if (isEnabled) {
          ui.push({ x: bx, y: by, w: bw, h: bh, f: onClick });
        }
      };

      // ==========================================
      // 5. TOP BAR: ACTIVE JOKERS BAR (LEFT)
      // ==========================================
      const maxJokers = 5;
      const cardW = Math.round(62 * scale);
      const cardH = Math.round(84 * scale);
      const startX = Math.max(18, Math.round(W * 0.02));
      const startY = Math.max(12, Math.round(H * 0.02));
      const gap = Math.round(cardW + 12 * scale);

      let hoveredJokerTip: Card | null = null;

      for (let i = 0; i < maxJokers; i++) {
        const cx = startX + i * gap;
        const cy = startY;
        const jCard = eng.ownedJokers[i];

        if (!jCard) {
          // Empty slot - luminous warm dashed outline
          ctx.fillStyle = 'rgba(45, 20, 10, 0.45)';
          ctx.beginPath();
          ctx.roundRect(cx, cy, cardW, cardH, 8);
          ctx.fill();

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = `700 ${Math.round(10 * scale)}px Oswald, sans-serif`;
          ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(`SLOT ${i + 1}`, cx + cardW / 2, cy + cardH / 2);
          continue;
        }

        const cardBox = { x: cx, y: cy, w: cardW, h: cardH };
        const isCardHover = isIn(cardBox);
        if (isCardHover) hoveredJokerTip = jCard;

        // Card Drop Shadow
        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(cx + 2, cy + 4, cardW, cardH, 8);
        ctx.fill();

        // Card Face (Bright Ivory Parchment)
        ctx.fillStyle = '#fffdf5';
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 8);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = jCard.rarity === 'Lendária' ? '#ffd700' : '#0b0710';
        ctx.stroke();

        // Card Icon
        ctx.font = `${Math.round(22 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(jCard.icon || '🃏', cx + cardW / 2, cy + Math.round(32 * scale));

        // Card Name
        ctx.font = `700 ${Math.round(9.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#1b1226';
        ctx.textAlign = 'center';
        ctx.fillText(jCard.name, cx + cardW / 2, cy + Math.round(62 * scale), cardW - 6);

        // VENDER Button under card
        const sellVal = Math.max(1, Math.floor(jCard.cost * 0.75));
        const btnBox = { x: cx, y: cy + cardH + Math.round(4 * scale), w: cardW, h: Math.round(22 * scale) };
        const isArmed = sellConfirmRef.current.index === i && t < sellConfirmRef.current.expireTime;
        const btnCol = isArmed ? '#ef4444' : '#f59e0b';
        const btnTxt = isArmed ? 'CONFIRMAR?' : `VENDER $${sellVal}`;

        drawButton(btnBox.x, btnBox.y, btnBox.w, btnBox.h, btnTxt, btnCol, true, () => {
          if (isArmed) {
            sellConfirmRef.current = { index: -1, expireTime: 0 };
            const res = eng.sellJoker(i);
            toastRef.current = { text: `Vendido por $${res.value}!`, time: t + 90 };
            onUpdateRef.current();
          } else {
            sellConfirmRef.current = { index: i, expireTime: t + 150 };
          }
        });
      }

      // Sell instructions text in luminous gold
      ctx.font = `600 ${Math.round(11 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'left';
      ctx.fillText(
        'vender curinga: 75% do valor',
        startX,
        startY + cardH + Math.round(38 * scale)
      );

      // ==========================================
      // 6. TOP BAR: NEON SIGNS, MONEY & MENU (RIGHT)
      // ==========================================
      const rightMargin = Math.max(20, Math.round(W * 0.025));

      // Neon Shop Title (Radiant Warm Amber Glow)
      const neonX = Math.round(W - Math.max(260 * scale, W * 0.28));
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 16;
      ctx.font = `700 ${Math.round(32 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('LOJA DO BOTECO', neonX, startY + Math.round(30 * scale));

      ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.fillText('OPEN BAR • CAÇAPA ROGUELIKE', neonX, startY + Math.round(50 * scale));
      ctx.restore();

      // Money Display (Big Radiant Yellow)
      ctx.save();
      ctx.shadowColor = '#ca8a04';
      ctx.shadowBlur = 12;
      ctx.font = `700 ${Math.round(34 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'right';
      ctx.fillText(`$${eng.money}`, W - rightMargin, startY + Math.round(32 * scale));
      ctx.restore();

      // Menu Button (Top Right)
      if (onOpenMenuRef.current) {
        const menuW = Math.round(68 * scale);
        const menuH = Math.round(28 * scale);
        drawButton(
          W - rightMargin - menuW,
          startY + Math.round(44 * scale),
          menuW,
          menuH,
          '≡ MENU',
          '#f59e0b',
          true,
          () => {
            onOpenMenuRef.current?.();
          }
        );
      }

      // ==========================================
      // 7. COUNTER ITEMS: JOKER BOTTLES & BALL MODIFIERS
      // ==========================================
      const yBase = counterY + Math.round(75 * scale);
      let activeTooltip: {
        x: number;
        y: number;
        title: string;
        desc: string;
        cost: number;
        canAfford: boolean;
        col: string;
      } | null = null;

      // Coaster drawing helper (Bright retro pub cardboard coaster)
      const drawCoaster = (cx: number, cy: number, cost: number, canAfford: boolean) => {
        const cRadiusX = Math.round(34 * scale);
        const cRadiusY = Math.round(12 * scale);

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy + 4, cRadiusX + 2, cRadiusY + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Paper coaster (Bright warm ivory)
        ctx.fillStyle = '#fffdf0';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX, cRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red outer ring
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX - 4 * scale, cRadiusY - 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Price
        ctx.font = `700 ${Math.round(15 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = canAfford ? '#854d0e' : '#dc2626';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${cost}`, cx, cy + 1);
      };

      // Empty Sold Coaster helper
      const drawSoldCoaster = (cx: number, cy: number) => {
        const cRadiusX = Math.round(34 * scale);
        const cRadiusY = Math.round(12 * scale);

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX, cRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `700 ${Math.round(12 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VENDIDO', cx, cy + 1);
      };

      // 4 JOKER BOTTLES (Positioned in the left-to-center bar zone)
      const cardStock = eng.shopManager.cardStock;
      const bGap = Math.min(130 * scale, (W * 0.42) / 4);
      const bCenterX = (W / 2) - (W * 0.23);
      const bottleXList = [0, 1, 2, 3].map((i) => Math.round(bCenterX + (i - 1.5) * bGap));

      // Section Header: "GARRAFAS CURINGA"
      ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('GARRAFAS CURINGA', bCenterX, counterY + Math.round(22 * scale));

      for (let i = 0; i < 4; i++) {
        const bx = bottleXList[i];
        const card = cardStock[i];

        if (!card) {
          drawSoldCoaster(bx, yBase + Math.round(30 * scale));
          continue;
        }

        const hitBox = {
          x: bx - Math.round(44 * scale),
          y: yBase - Math.round(180 * scale),
          w: Math.round(88 * scale),
          h: Math.round(225 * scale),
        };
        const isHover = isIn(hitBox);
        const canAfford = eng.money >= card.cost;
        const theme = getJokerBottleTheme(card);

        if (isHover) {
          activeTooltip = {
            x: bx,
            y: yBase - Math.round(195 * scale),
            title: `Garrafa Coringa: ${card.name}`,
            desc: `${card.description} • ${card.rarity.toUpperCase()}`,
            cost: card.cost,
            canAfford,
            col: '#facc15',
          };
        }

        const lift = isHover ? -14 * scale : 0;
        const tilt = isHover ? Math.sin(t * 0.12) * 0.03 : 0;
        const itemHoverScale = isHover ? 1.06 : 1.0;

        ctx.save();
        // Warm golden spotlight pool under bottle
        const bSpot = ctx.createRadialGradient(bx, yBase + 10, 5, bx, yBase + 10, Math.round(45 * scale));
        bSpot.addColorStop(0, 'rgba(255, 220, 130, 0.4)');
        bSpot.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = bSpot;
        ctx.beginPath();
        ctx.ellipse(bx, yBase + 10, 44 * scale, 14 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow on counter
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx + 6 * scale, yBase + 4 * scale, 38 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bx, yBase + lift);
        ctx.rotate(tilt);
        ctx.scale(scale * itemHoverScale, scale * itemHoverScale);

        // Radiant bottle glow on hover
        if (isHover) {
          ctx.fillStyle = theme.glow;
          ctx.beginPath();
          ctx.arc(0, -75, 58, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bottle Silhouette
        const P = new Path2D();
        P.roundRect(-28, -114, 56, 114, 16);
        P.roundRect(-9, -164, 18, 56, 6);

        ctx.save();
        ctx.clip(P);
        // Clear glass background with bright transmission
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(-35, -170, 70, 175);

        // Liquid fill (Bright Jewel-Toned)
        const liq = ctx.createLinearGradient(0, -96, 0, 0);
        liq.addColorStop(0, theme.top);
        liq.addColorStop(1, theme.bottom);
        ctx.fillStyle = liq;
        ctx.fillRect(-35, -96, 70, 100);

        // Meniscus surface
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, -96, 28, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bubbles rising
        for (let q = 0; q < 5; q++) {
          const bb = (t * 0.7 + q * 22) % 88;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(Math.sin(q * 3.2 + t * 0.05) * 18, -bb, 1.5 + (q % 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Glass highlight reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-22, -110, 4, 105);

        // Glass outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0b0710';
        ctx.stroke(P);

        // Cap
        ctx.beginPath();
        ctx.roundRect(-8, -174, 16, 12, 3);
        ctx.fillStyle = card.rarity === 'Lendária' ? '#ffd700' : '#d97706';
        ctx.fill();
        ctx.stroke();

        // Label (Bright Ivory Paper)
        ctx.beginPath();
        ctx.roundRect(-24, -84, 48, 52, 5);
        ctx.fillStyle = '#fffdf5';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label icon & name
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.icon || '🃏', 0, -64);
        ctx.font = '700 8.5px Oswald, sans-serif';
        ctx.fillStyle = '#1b1226';
        ctx.fillText(card.name, 0, -42, 44);

        ctx.restore();

        // Coaster under bottle
        drawCoaster(bx, yBase + Math.round(30 * scale), card.cost, canAfford);

        // Register immediate-mode click for this bottle
        ui.push({
          x: hitBox.x,
          y: hitBox.y,
          w: hitBox.w,
          h: hitBox.h,
          f: () => {
            const res = eng.buyShopCard(i);
            toastRef.current = { text: res.message, time: t + 90 };
            onUpdateRef.current();
          },
        });
      }

      // 3 BALL MODIFIER OFFERS (Positioned in the center-to-right bar zone)
      const ballStock = eng.shopManager.ballStock;
      const ballGap = Math.min(140 * scale, (W * 0.38) / 3);
      const ballCenterX = (W / 2) + (W * 0.23);
      const ballXList = [0, 1, 2].map((i) => Math.round(ballCenterX + (i - 1) * ballGap));

      // Section Header: "MODIFICADORES DE BOLA"
      ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('MODIFICADORES DE BOLA', ballCenterX, counterY + Math.round(22 * scale));

      for (let i = 0; i < 3; i++) {
        const bx = ballXList[i];
        const offer = ballStock[i];

        if (!offer) {
          drawSoldCoaster(bx, yBase + Math.round(30 * scale));
          continue;
        }

        const hitBox = {
          x: bx - Math.round(44 * scale),
          y: yBase - Math.round(120 * scale),
          w: Math.round(88 * scale),
          h: Math.round(165 * scale),
        };
        const isHover = isIn(hitBox);
        const canAfford = eng.money >= offer.price;
        const ballProps = BALL_COLORS[offer.ballNumber] || { bg: '#dc2626', isStripe: false };

        if (isHover) {
          activeTooltip = {
            x: bx,
            y: yBase - Math.round(135 * scale),
            title: `Bola #${offer.ballNumber}: ${offer.enhancement.name}`,
            desc: `${offer.enhancement.description} • Modifica a Bola #${offer.ballNumber}!`,
            cost: offer.price,
            canAfford,
            col: '#38bdf8',
          };
        }

        const lift = isHover ? -12 * scale : 0;
        const itemHoverScale = isHover ? 1.08 : 1.0;

        ctx.save();
        // Warm spotlight pool under ball
        const bSpot = ctx.createRadialGradient(bx, yBase + 10, 4, bx, yBase + 10, Math.round(40 * scale));
        bSpot.addColorStop(0, 'rgba(255, 220, 130, 0.4)');
        bSpot.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = bSpot;
        ctx.beginPath();
        ctx.ellipse(bx, yBase + 10, 36 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow on counter
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx + 4 * scale, yBase + 4 * scale, 30 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bx, yBase + lift);
        ctx.scale(scale * itemHoverScale, scale * itemHoverScale);

        // Crest Icon
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(offer.enhancement.icon, 0, -84);

        // 3D Pool Ball Sphere (Vibrant & Lit)
        const ballY = -48;
        const r = 26;

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, ballY, r, 0, Math.PI * 2);
        ctx.clip();

        if (ballProps.isStripe) {
          ctx.fillStyle = '#fffdf5';
          ctx.fillRect(-r, ballY - r, r * 2, r * 2);
          ctx.fillStyle = ballProps.bg;
          ctx.fillRect(-r, ballY - r * 0.44, r * 2, r * 0.88);
        } else {
          const ballGrad = ctx.createRadialGradient(-r * 0.35, ballY - r * 0.35, 2, 0, ballY, r);
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.35, ballProps.bg);
          ballGrad.addColorStop(1, '#050302');
          ctx.fillStyle = ballGrad;
          ctx.fillRect(-r, ballY - r, r * 2, r * 2);
        }

        // Center white circle & number
        ctx.fillStyle = '#fffdf5';
        ctx.beginPath();
        ctx.arc(0, ballY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#0b0710';
        ctx.stroke();

        ctx.font = '700 11px Oswald, sans-serif';
        ctx.fillStyle = '#0b0710';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${offer.ballNumber}`, 0, ballY + 0.5);
        ctx.restore();

        // Dark outline
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#0b0710';
        ctx.beginPath();
        ctx.arc(0, ballY, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Coaster under ball
        drawCoaster(bx, yBase + Math.round(30 * scale), offer.price, canAfford);

        // Register immediate-mode click for this ball
        ui.push({
          x: hitBox.x,
          y: hitBox.y,
          w: hitBox.w,
          h: hitBox.h,
          f: () => {
            const res = eng.buyShopBall(i);
            toastRef.current = { text: res.message, time: t + 90 };
            onUpdateRef.current();
          },
        });
      }

      // Ball modifiers summary line
      const activeEnhanced = Array.from(eng.ballDeck.entries())
        .filter(([, enh]) => enh !== null)
        .map(([num, enh]) => `${num}: ${enh!.name}`);
      const summaryText =
        activeEnhanced.length > 0 ? activeEnhanced.join('  •  ') : 'nenhuma ainda';

      ctx.font = `600 ${Math.round(12.5 * scale)}px Oswald, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(
        `suas bolas modificadas: ${summaryText}`,
        ballCenterX,
        yBase + Math.round(58 * scale)
      );

      // ==========================================
      // 8. ACTION BUTTONS AT BOTTOM (FOOTER)
      // ==========================================
      const btnH = Math.round(50 * scale);
      const btnY = H - btnH - Math.round(20 * scale);
      const rerollCost = eng.shopManager.currentRerollCost;
      const canReroll = eng.money >= rerollCost;

      const trocarW = Math.round(210 * scale);
      const nextW = Math.round(220 * scale);
      const centerBtnX = W / 2;

      // TROCAR Button
      const trocarX = centerBtnX - trocarW - Math.round(12 * scale);
      drawButton(
        trocarX,
        btnY,
        trocarW,
        btnH,
        `TROCAR $${rerollCost}`,
        '#f59e0b',
        canReroll,
        () => {
          const res = eng.rerollShop();
          toastRef.current = { text: res.message, time: t + 90 };
          onUpdateRef.current();
        }
      );

      // Subtitle below Trocar
      ctx.font = `600 ${Math.round(11 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('cada troca custa $1 a mais', trocarX + trocarW / 2, btnY + btnH + Math.round(14 * scale));

      // PRÓXIMA MESA Button
      const nextX = centerBtnX + Math.round(12 * scale);
      drawButton(
        nextX,
        btnY,
        nextW,
        btnH,
        'PRÓXIMA MESA',
        '#06b6d4',
        true,
        () => {
          onNextRoundRef.current();
        }
      );

      // 📦 CAIXA DE BOLAS (Bottom Left Button)
      const boxW = Math.round(175 * scale);
      drawButton(
        startX,
        btnY,
        boxW,
        btnH,
        '📦 CAIXA DE BOLAS',
        '#7e22ce',
        true,
        () => {
          setIsBallRackOpen(true);
        }
      );

      // ==========================================
      // 9. TOAST FEEDBACK NOTIFICATION (Canvas native)
      // ==========================================
      if (toastRef.current.text && t < toastRef.current.time) {
        const fade = Math.min(1, (toastRef.current.time - t) / 20);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        const toastW = Math.round(320 * scale);
        const toastH = Math.round(40 * scale);
        ctx.roundRect(W / 2 - toastW / 2, counterY - Math.round(60 * scale), toastW, toastH, 10);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();

        ctx.font = `700 ${Math.round(14 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(toastRef.current.text, W / 2, counterY - Math.round(40 * scale));
        ctx.restore();
      }

      // ==========================================
      // 10. TOOLTIP OVERLAY (Hover Details)
      // ==========================================
      const tipToShow =
        activeTooltip ||
        (hoveredJokerTip
          ? {
              x: mouseRef.current.x,
              y: mouseRef.current.y,
              title: `Coringa Ativo: ${hoveredJokerTip.name}`,
              desc: `${hoveredJokerTip.description} • ${hoveredJokerTip.rarity.toUpperCase()}`,
              cost: Math.max(1, Math.floor(hoveredJokerTip.cost * 0.75)),
              canAfford: true,
              col: '#ffd700',
            }
          : null);

      if (tipToShow) {
        const ttW = Math.round(280 * scale);
        const ttH = Math.round(80 * scale);
        const tx = Math.min(Math.max(tipToShow.x, ttW / 2 + 10), W - ttW / 2 - 10);
        const ty = Math.max(tipToShow.y - Math.round(50 * scale), ttH / 2 + 10);

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#261208';
        ctx.strokeStyle = tipToShow.col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(tx - ttW / 2, ty - ttH / 2, ttW, ttH, 10);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = `700 ${Math.round(13.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = tipToShow.col;
        ctx.textAlign = 'center';
        ctx.fillText(tipToShow.title, tx, ty - Math.round(16 * scale));

        ctx.font = `600 ${Math.round(10.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tipToShow.desc, tx, ty + Math.round(4 * scale), ttW - 20);

        ctx.font = `700 ${Math.round(10.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = tipToShow.canAfford ? '#86efac' : '#f87171';
        ctx.fillText(
          tipToShow.canAfford
            ? `Clique para Comprar ($${tipToShow.cost})`
            : `Sem dinheiro suficiente ($${tipToShow.cost})`,
          tx,
          ty + Math.round(24 * scale)
        );
        ctx.restore();
      }

      // Save registry for click detection
      uiRef.current = ui;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []); // Mounts once and stays rock-solid!

  return (
    <div className="w-full h-full min-h-screen overflow-hidden flex items-center justify-center bg-[#2b1408] relative select-none">
      {/* Full screen tavern shop canvas filling 100% of viewport width and height */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Observation Modal for Ball Box */}
      <BallRackModal
        isOpen={isBallRackOpen}
        onClose={() => setIsBallRackOpen(false)}
        engine={engine}
        onUpdate={onUpdate}
      />
    </div>
  );
};
