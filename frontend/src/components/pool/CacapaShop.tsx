import React, { useRef, useEffect, useState } from 'react';
import { CacapaPoolEngine } from '../../game/engine/CacapaPoolEngine';
import { Card } from '../../game/cards/Card';
import { BallRackModal } from './BallRackModal';
import lojaBackgroundSrc from '../../game/sprites/loja_background.png';

interface CacapaShopProps {
  engine: CacapaPoolEngine;
  onNextRound: () => void;
  onUpdate: () => void;
  onOpenMenu?: () => void;
}

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
  const [replaceOfferIndex, setReplaceOfferIndex] = useState<number | null>(null);

  const engineRef = useRef(engine);
  engineRef.current = engine;
  const onNextRoundRef = useRef(onNextRound);
  onNextRoundRef.current = onNextRound;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onOpenMenuRef = useRef(onOpenMenu);
  onOpenMenuRef.current = onOpenMenu;

  const openReplaceModalRef = useRef<(index: number) => void>(() => {});
  openReplaceModalRef.current = (idx: number) => setReplaceOfferIndex(idx);

    const uiRef = useRef<UIElement[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

    const toastRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const sellConfirmRef = useRef<{ index: number; expireTime: number }>({ index: -1, expireTime: 0 });

  useEffect(() => {
    const bgImg = new Image();
    bgImg.src = lojaBackgroundSrc;
    bgImg.onload = () => {
      bgImageRef.current = bgImg;
    };
    if (bgImg.complete) {
      bgImageRef.current = bgImg;
    }

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

        const render = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      const eng = engineRef.current;

      const rect = canvas.getBoundingClientRect();
      const W = Math.round(rect.width || window.innerWidth);
      const H = Math.round(rect.height || window.innerHeight);

      const s = Math.min(W / 960, H / 580);
      const scale = Math.max(1.0, Math.min(1.5, s));

      const counterY = Math.max(
        Math.round(H * 0.50),
        Math.min(Math.round(H * 0.58), H - Math.round(230 * scale))
      );

            const ui: UIElement[] = [];
      ctx.clearRect(0, 0, W, H);

                              // Fundo da Loja (Sprite)
      const bgImg = bgImageRef.current;
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasRatio = W / H;
        let dw = W;
        let dh = H;
        let dx = 0;
        let dy = 0;

        if (canvasRatio > imgRatio) {
          dw = W;
          dh = W / imgRatio;
          dy = (H - dh) / 2;
        } else {
          dh = H;
          dw = H * imgRatio;
          dx = (W - dw) / 2;
        }

        ctx.drawImage(bgImg, dx, dy, dw, dh);

        // Leve vinheta para destacar a UI e garantir leitura impecável
        const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = '#2b1408';
        ctx.fillRect(0, 0, W, H);
      }

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

                ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(-bw / 2 + 2, -bh / 2 + 4, bw, bh, 10);
        ctx.fill();

                ctx.fillStyle = isEnabled ? col : '#4b5563';
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 10);
        ctx.fill();

                ctx.lineWidth = 3;
        ctx.strokeStyle = '#0b0710';
        ctx.stroke();

                if (isEnabled) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.beginPath();
          ctx.roundRect(-bw / 2 + 2, -bh / 2 + 2, bw - 4, bh * 0.45, 8);
          ctx.fill();
        }

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

      const maxJokers = 5;
      const cardW = Math.round(76 * scale);
      const cardH = Math.round(102 * scale);
      const startX = Math.max(20, Math.round(W * 0.025));
      const startY = Math.max(12, Math.round(H * 0.02));
      const gap = Math.round(cardW + 12 * scale);

      let hoveredJokerTip: Card | null = null;
      let hoveredSellBtnInfo: string | null = null;

      for (let i = 0; i < maxJokers; i++) {
        const cx = startX + i * gap;
        const cy = startY;
        const jCard = eng.ownedJokers[i];

        if (!jCard) {
          ctx.fillStyle = 'rgba(45, 20, 10, 0.45)';
          ctx.beginPath();
          ctx.roundRect(cx, cy, cardW, cardH, 10);
          ctx.fill();

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = `700 ${Math.round(12 * scale)}px Oswald, sans-serif`;
          ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(`SLOT ${i + 1}`, cx + cardW / 2, cy + cardH / 2);
          continue;
        }

        const cardBox = { x: cx, y: cy, w: cardW, h: cardH };
        const isCardHover = isIn(cardBox);
        if (isCardHover) hoveredJokerTip = jCard;

        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        ctx.roundRect(cx + 3, cy + 5, cardW, cardH, 10);
        ctx.fill();

        ctx.fillStyle = '#fffdf5';
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 10);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = jCard.rarity === 'Lendária' ? '#ffd700' : '#0b0710';
        ctx.stroke();

        ctx.font = `${Math.round(30 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(jCard.icon || '🃏', cx + cardW / 2, cy + Math.round(40 * scale));

        ctx.font = `700 ${Math.round(11 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#1b1226';
        ctx.textAlign = 'center';
        ctx.fillText(jCard.name, cx + cardW / 2, cy + Math.round(78 * scale), cardW - 8);

        const sellVal = Math.max(1, Math.floor(jCard.cost * 0.75));
        const btnBox = { x: cx, y: cy + cardH + Math.round(5 * scale), w: cardW, h: Math.round(26 * scale) };
        if (isIn(btnBox)) {
          hoveredSellBtnInfo = 'vender curinga: 75% do valor';
        }
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

      if (hoveredSellBtnInfo) {
        ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'left';
        ctx.fillText(
          hoveredSellBtnInfo,
          startX,
          startY + cardH + Math.round(44 * scale)
        );
      }

      const rightMargin = Math.max(20, Math.round(W * 0.025));

      const neonX = Math.round(W - Math.max(280 * scale, W * 0.30));
      ctx.save();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      ctx.font = `700 ${Math.round(38 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('LOJA DO BOTECO', neonX, startY + Math.round(34 * scale));

      ctx.font = `700 ${Math.round(13.5 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 12;
      ctx.fillText('OPEN BAR • CAÇAPA ROGUELIKE', neonX, startY + Math.round(58 * scale));
      ctx.restore();

      ctx.save();
      ctx.shadowColor = '#ca8a04';
      ctx.shadowBlur = 14;
      ctx.font = `700 ${Math.round(42 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'right';
      ctx.fillText(`$${eng.money}`, W - rightMargin, startY + Math.round(36 * scale));
      ctx.restore();

      if (onOpenMenuRef.current) {
        const menuW = Math.round(82 * scale);
        const menuH = Math.round(34 * scale);
        drawButton(
          W - rightMargin - menuW,
          startY + Math.round(48 * scale),
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

      const drawCoaster = (cx: number, cy: number, cost: number, canAfford: boolean) => {
        const cRadiusX = Math.round(42 * scale);
        const cRadiusY = Math.round(15 * scale);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx + 3, cy + 4, cRadiusX + 2, cRadiusY + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fffdf0';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX, cRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX - 4 * scale, cRadiusY - 2 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = `700 ${Math.round(18 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = canAfford ? '#854d0e' : '#dc2626';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${cost}`, cx, cy + 1);
      };

      const drawSoldCoaster = (cx: number, cy: number) => {
        const cRadiusX = Math.round(42 * scale);
        const cRadiusY = Math.round(15 * scale);

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, cRadiusX, cRadiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = `700 ${Math.round(14 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VENDIDO', cx, cy + 1);
      };

      const cardStock = eng.shopManager.cardStock;
      const bGap = Math.min(130 * scale, (W * 0.42) / 4);
      const bCenterX = (W / 2) - (W * 0.23);
      const bottleXList = [0, 1, 2, 3].map((i) => Math.round(bCenterX + (i - 1.5) * bGap));

      ctx.font = `700 ${Math.round(16 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('GARRAFAS CURINGA', bCenterX, counterY + Math.round(24 * scale));

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
                const bSpot = ctx.createRadialGradient(bx, yBase + 10, 5, bx, yBase + 10, Math.round(45 * scale));
        bSpot.addColorStop(0, 'rgba(255, 220, 130, 0.4)');
        bSpot.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = bSpot;
        ctx.beginPath();
        ctx.ellipse(bx, yBase + 10, 44 * scale, 14 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx + 6 * scale, yBase + 4 * scale, 38 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bx, yBase + lift);
        ctx.rotate(tilt);
        ctx.scale(scale * itemHoverScale, scale * itemHoverScale);

                if (isHover) {
          ctx.fillStyle = theme.glow;
          ctx.beginPath();
          ctx.arc(0, -75, 58, 0, Math.PI * 2);
          ctx.fill();
        }

                const P = new Path2D();
        P.roundRect(-28, -114, 56, 114, 16);
        P.roundRect(-9, -164, 18, 56, 6);

        ctx.save();
        ctx.clip(P);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(-35, -170, 70, 175);

                const liq = ctx.createLinearGradient(0, -96, 0, 0);
        liq.addColorStop(0, theme.top);
        liq.addColorStop(1, theme.bottom);
        ctx.fillStyle = liq;
        ctx.fillRect(-35, -96, 70, 100);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(0, -96, 28, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

                for (let q = 0; q < 5; q++) {
          const bb = (t * 0.7 + q * 22) % 88;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(Math.sin(q * 3.2 + t * 0.05) * 18, -bb, 1.5 + (q % 2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-22, -110, 4, 105);

                ctx.lineWidth = 3;
        ctx.strokeStyle = '#0b0710';
        ctx.stroke(P);

                ctx.beginPath();
        ctx.roundRect(-8, -174, 16, 12, 3);
        ctx.fillStyle = card.rarity === 'Lendária' ? '#ffd700' : '#d97706';
        ctx.fill();
        ctx.stroke();

                ctx.beginPath();
        ctx.roundRect(-24, -84, 48, 52, 5);
        ctx.fillStyle = '#fffdf5';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.icon || '🃏', 0, -64);
        ctx.font = '700 10.5px Oswald, sans-serif';
        ctx.fillStyle = '#1b1226';
        ctx.fillText(card.name, 0, -42, 44);

        ctx.restore();

        drawCoaster(bx, yBase + Math.round(30 * scale), card.cost, canAfford);

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

      const ballStock = eng.shopManager.ballStock;
      const ballGap = Math.min(140 * scale, (W * 0.38) / 3);
      const ballCenterX = (W / 2) + (W * 0.23);
      const ballXList = [0, 1, 2].map((i) => Math.round(ballCenterX + (i - 1) * ballGap));

      ctx.font = `700 ${Math.round(16 * scale)}px Oswald, sans-serif`;
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('MODIFICADORES DE BOLA', ballCenterX, counterY + Math.round(24 * scale));

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

        const hasEnh = offer.hasEnhancement && offer.enhancement !== null;
        const rarityCol = offer.rarity === 'Lendária'
          ? '#c084fc'
          : offer.rarity === 'Rara'
          ? '#f59e0b'
          : offer.rarity === 'Incomum'
          ? '#38bdf8'
          : '#9fb4a8';

        if (isHover) {
          activeTooltip = {
            x: bx,
            y: yBase - Math.round(135 * scale),
            title: hasEnh
              ? `Bola #${offer.ballNumber} (${offer.isStripe ? 'Listrada' : 'Lisa'}) • ${offer.enhancement!.name}`
              : `Bola #${offer.ballNumber} (${offer.isStripe ? 'Listrada' : 'Lisa'}) • Bola Normal`,
            desc: hasEnh
              ? `[${offer.rarity || 'Modificada'}] ${offer.enhancement!.description} • Clique para substituir uma bola!`
              : `Bola comum sem modificador • Preço: $${offer.price} • Clique para substituir uma bola!`,
            cost: offer.price,
            canAfford,
            col: hasEnh ? rarityCol : '#ffd700',
          };
        }

        const lift = isHover ? -12 * scale : 0;
        const itemHoverScale = isHover ? 1.08 : 1.0;

        ctx.save();
        const bSpot = ctx.createRadialGradient(bx, yBase + 10, 4, bx, yBase + 10, Math.round(40 * scale));
        bSpot.addColorStop(0, 'rgba(255, 220, 130, 0.4)');
        bSpot.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = bSpot;
        ctx.beginPath();
        ctx.ellipse(bx, yBase + 10, 36 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bx + 4 * scale, yBase + 4 * scale, 30 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(bx, yBase + lift);
        ctx.scale(scale * itemHoverScale, scale * itemHoverScale);

        if (hasEnh) {
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(offer.enhancement!.icon, 0, -84);

          // Rótulo da raridade
          ctx.font = '700 11px Oswald, sans-serif';
          ctx.fillStyle = rarityCol;
          ctx.fillText(offer.rarity?.toUpperCase() || 'MOD', 0, -104);
        }

        const ballY = -48;
        const r = 30;

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, ballY, r, 0, Math.PI * 2);
        ctx.clip();

        if (offer.isStripe) {
          ctx.fillStyle = '#fffdf5';
          ctx.fillRect(-r, ballY - r, r * 2, r * 2);
          ctx.fillStyle = ballProps.bg;
          ctx.fillRect(-r, ballY - r * 0.44, r * 2, r * 0.88);
        } else {
          ctx.fillStyle = ballProps.bg;
          ctx.fillRect(-r, ballY - r, r * 2, r * 2);
        }

        ctx.fillStyle = '#fffdf5';
        ctx.beginPath();
        ctx.arc(0, ballY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '700 13px Oswald, sans-serif';
        ctx.fillStyle = '#0b0710';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${offer.ballNumber}`, 0, ballY + 0.5);
        ctx.restore();

        ctx.lineWidth = 2.8;
        ctx.strokeStyle = '#0b0710';
        ctx.beginPath();
        ctx.arc(0, ballY, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        drawCoaster(bx, yBase + Math.round(30 * scale), offer.price, canAfford);

        ui.push({
          x: hitBox.x,
          y: hitBox.y,
          w: hitBox.w,
          h: hitBox.h,
          f: () => {
            if (!canAfford) {
              toastRef.current = { text: 'Dinheiro insuficiente!', time: t + 90 };
              return;
            }
            openReplaceModalRef.current(i);
          },
        });
      }

      const activeEnhanced = eng.deck
        ? eng.deck
            .filter((b) => b.enhancement !== null)
            .map((b) => `#${b.number} (${b.enhancement!.name})`)
        : [];
      const summaryText =
        activeEnhanced.length > 0 ? activeEnhanced.join('  •  ') : 'nenhuma ainda';

      ctx.font = `700 ${Math.round(14 * scale)}px Oswald, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(
        `suas bolas modificadas: ${summaryText}`,
        ballCenterX,
        yBase + Math.round(62 * scale)
      );

      const btnH = Math.round(56 * scale);
      const btnY = H - btnH - Math.round(18 * scale);
      const rerollCost = eng.shopManager.currentRerollCost;
      const canReroll = eng.money >= rerollCost;

      const trocarW = Math.round(230 * scale);
      const nextW = Math.round(240 * scale);
      const centerBtnX = W / 2;

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

      if (isIn({ x: trocarX, y: btnY, w: trocarW, h: btnH })) {
        ctx.font = `700 ${Math.round(13 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('cada troca custa $1 a mais', trocarX + trocarW / 2, btnY + btnH + Math.round(14 * scale));
      }

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

      const boxW = Math.round(200 * scale);
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

      if (toastRef.current.text && t < toastRef.current.time) {
        const fade = Math.min(1, (toastRef.current.time - t) / 20);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = '#0b0710';
        ctx.beginPath();
        const toastW = Math.round(360 * scale);
        const toastH = Math.round(48 * scale);
        ctx.roundRect(W / 2 - toastW / 2, counterY - Math.round(65 * scale), toastW, toastH, 12);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();

        ctx.font = `700 ${Math.round(16 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(toastRef.current.text, W / 2, counterY - Math.round(41 * scale));
        ctx.restore();
      }

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
        const ttW = Math.round(340 * scale);
        const ttH = Math.round(96 * scale);
        const tx = Math.min(Math.max(tipToShow.x, ttW / 2 + 10), W - ttW / 2 - 10);
        const ty = Math.max(tipToShow.y - Math.round(55 * scale), ttH / 2 + 10);

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#261208';
        ctx.strokeStyle = tipToShow.col;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(tx - ttW / 2, ty - ttH / 2, ttW, ttH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = `700 ${Math.round(16 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = tipToShow.col;
        ctx.textAlign = 'center';
        ctx.fillText(tipToShow.title, tx, ty - Math.round(18 * scale));

        ctx.font = `600 ${Math.round(12.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tipToShow.desc, tx, ty + Math.round(4 * scale), ttW - 24);

        ctx.font = `700 ${Math.round(12.5 * scale)}px Oswald, sans-serif`;
        ctx.fillStyle = tipToShow.canAfford ? '#86efac' : '#f87171';
        ctx.fillText(
          tipToShow.canAfford
            ? `Clique para Comprar ($${tipToShow.cost})`
            : `Sem dinheiro suficiente ($${tipToShow.cost})`,
          tx,
          ty + Math.round(28 * scale)
        );
        ctx.restore();
      }

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
  }, []);

  return (
    <div className="w-full h-full min-h-screen overflow-hidden flex items-center justify-center bg-[#2b1408] relative select-none">
            <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

            <BallRackModal
        isOpen={isBallRackOpen}
        onClose={() => setIsBallRackOpen(false)}
        engine={engine}
        onUpdate={onUpdate}
      />

      {/* Modal de Substituição de Bola no Deck */}
      {replaceOfferIndex !== null && (() => {
        const offer = engine.shopManager.ballStock[replaceOfferIndex];
        if (!offer) return null;
        const offerBaseColor = BALL_COLORS[offer.ballNumber]?.bg || '#dc2626';
        const deckBalls = engine.deck && engine.deck.length > 0
          ? engine.deck
          : [1, 2, 3, 4, 5, 8, 9, 10, 11, 12].map((num) => ({
              id: `deck-${num}`,
              number: num,
              isStripe: num >= 9,
              enhancement: engine.ballDeck.get(num) || null,
            }));

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl xl:max-w-6xl bg-[#1b2427] border-[5px] border-[#0b0710] rounded-3xl p-6 sm:p-8 shadow-[0_10px_0_rgba(0,0,0,0.6)] relative max-h-[94vh] overflow-y-auto font-cacapa select-none">
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-[#0b0710] pb-4 mb-5">
                <div>
                  <span className="text-sm sm:text-base uppercase font-black tracking-widest text-[#f2b632] block cacapa-stroke-sm">
                    Caçapa • Oficina de Bolas
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 cacapa-stroke mt-0.5">
                    <span>🔄</span> SUBSTITUIR BOLA NO SEU DECK
                  </h3>
                  <p className="text-sm sm:text-base text-[#9fb4a8] mt-1 cacapa-stroke-sm">
                    Escolha qual bola do seu deck será descartada para dar lugar à nova bola comprada
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#12181a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] px-4 py-2 rounded-2xl font-black text-[#f2b632] text-base sm:text-lg cacapa-stroke-sm">
                    ${engine.money}
                  </div>
                  <button
                    onClick={() => setReplaceOfferIndex(null)}
                    className="bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] hover:border-[#f2b632] text-[#f2b632] px-4 py-2 rounded-2xl text-sm sm:text-base font-black cursor-pointer transition-all active:scale-95 cacapa-stroke-sm"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>

              {/* Offer Banner Preview */}
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#12181a] border-[3px] border-[#f2b632] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_0_rgba(0,0,0,0.45)]">
                <div className="flex items-center gap-4">
                  {/* Ball Graphic */}
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center overflow-hidden border-[3px] border-[#0b0710] shrink-0"
                    style={{
                      backgroundColor: offer.isStripe ? '#ffffff' : (offer.enhancement?.color || offerBaseColor),
                    }}
                  >
                    {offer.isStripe && (
                      <div
                        className="absolute inset-x-0 h-5 sm:h-6"
                        style={{ backgroundColor: offer.enhancement?.color || offerBaseColor }}
                      />
                    )}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#0b0710] font-black text-sm sm:text-base z-10 shadow-inner">
                      {offer.ballNumber}
                    </div>
                    {offer.enhancement && (
                      <div className="absolute top-1 right-1 text-sm sm:text-base z-20 drop-shadow">
                        {offer.enhancement.icon}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm uppercase font-black tracking-wider text-[#38bdf8] flex items-center gap-2">
                      <span>Nova Bola a Adicionar (${offer.price}):</span>
                      {offer.hasEnhancement && offer.rarity && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-slate-950"
                          style={{
                            backgroundColor:
                              offer.rarity === 'Lendária'
                                ? '#c084fc'
                                : offer.rarity === 'Rara'
                                ? '#f59e0b'
                                : offer.rarity === 'Incomum'
                                ? '#38bdf8'
                                : '#9fb4a8',
                          }}
                        >
                          {offer.rarity}
                        </span>
                      )}
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-black text-[#f2b632] cacapa-stroke mt-0.5">
                      Bola #{offer.ballNumber} ({offer.isStripe ? 'Listrada' : 'Lisa'}) •{' '}
                      {offer.enhancement ? offer.enhancement.name : 'Bola Normal'}
                    </h4>
                    <p className="text-sm sm:text-base text-[#f4ecd8] mt-1 cacapa-stroke-sm">
                      {offer.enhancement
                        ? offer.enhancement.description
                        : 'Bola comum sem modificador para ajustar seu deck.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-4 py-2 rounded-xl bg-[#22c55e]/20 border-2 border-[#22c55e] text-[#4ade80] font-black text-sm sm:text-base uppercase tracking-wider block">
                    Preço: ${offer.price}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider cacapa-stroke-sm flex items-center gap-2">
                  <span>🎱</span> Selecione a Bola do Seu Deck para Substituir:
                </span>
                <span className="text-xs sm:text-sm text-[#9fb4a8] font-medium">
                  A bola escolhida será descartada e substituída pela nova bola
                </span>
              </div>

              {/* Deck Balls Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
                {deckBalls.map((deckBall, idx) => {
                  const currentEnh = deckBall.enhancement;
                  const baseColor = BALL_COLORS[deckBall.number]?.bg || '#ffffff';
                  const isStripe = deckBall.isStripe;

                  return (
                    <div
                      key={deckBall.id || `replace-deck-ball-${idx}`}
                      onClick={() => {
                        const res = engine.buyAndReplaceShopBall(replaceOfferIndex, idx);
                        toastRef.current = { text: res.message, time: timeRef.current + 90 };
                        setReplaceOfferIndex(null);
                        onUpdate();
                      }}
                      className="group p-3.5 sm:p-4 rounded-2xl border-[3px] border-[#0b0710] bg-[#12181a] hover:border-[#f2b632] hover:bg-[#3a2a4a] flex flex-col items-center justify-between text-center relative transition-all cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.45)] hover:scale-102 active:scale-95"
                    >
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 border border-[#0b0710] bg-[#0b0710] text-[#9fb4a8] group-hover:text-[#f2b632]">
                        Deck Slot #{idx + 1}
                      </span>

                      <div
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-xl flex items-center justify-center my-2 overflow-hidden border-[3px] border-[#0b0710]"
                        style={{
                          backgroundColor: isStripe ? '#ffffff' : (currentEnh?.color || baseColor),
                        }}
                      >
                        {isStripe && (
                          <div
                            className="absolute inset-x-0 h-5 sm:h-6"
                            style={{ backgroundColor: currentEnh?.color || baseColor }}
                          />
                        )}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#0b0710] font-black text-sm sm:text-base z-10 shadow-inner">
                          {deckBall.number}
                        </div>

                        {currentEnh && (
                          <div className="absolute top-1 right-1 text-sm sm:text-base z-20 drop-shadow">
                            {currentEnh.icon}
                          </div>
                        )}
                      </div>

                      <div className="mt-1 w-full">
                        <span className="text-xs sm:text-sm font-bold text-[#9fb4a8] block">
                          Bola #{deckBall.number} {isStripe ? '(Listrada)' : '(Lisa)'}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-black block mt-0.5 truncate max-w-full cacapa-stroke-sm ${
                            currentEnh ? 'text-[#f2b632]' : 'text-white'
                          }`}
                        >
                          {currentEnh ? currentEnh.name : 'Normal'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="mt-3 w-full py-1.5 px-2 rounded-xl bg-[#e0392b] group-hover:bg-[#22c55e] border-2 border-[#0b0710] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all cacapa-stroke-sm shadow-[0_2px_0_rgba(0,0,0,0.4)]"
                      >
                        Substituir
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t-2 border-[#0b0710] flex justify-end">
                <button
                  onClick={() => setReplaceOfferIndex(null)}
                  className="px-6 py-2.5 rounded-2xl bg-[#3a2a4a] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.45)] text-[#f2b632] font-black text-sm sm:text-base hover:border-[#f2b632] transition-all cursor-pointer cacapa-stroke-sm"
                >
                  Cancelar Compra
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
