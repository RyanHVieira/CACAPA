import React, { useState, useRef } from 'react';
import { Card } from '../../game/cards/Card';

interface CacapaJokerSlotProps {
  card: Card | null;
  index: number;
  isActivating?: boolean;
  onOpenDeck: () => void;
  onSellCard?: (index: number) => void;
  onDragStartSlot?: (index: number) => void;
  onDropOnSlot?: (fromIndex: number, toIndex: number) => void;
}

export const CacapaJokerSlot: React.FC<CacapaJokerSlotProps> = ({
  card,
  index,
  isActivating = false,
  onOpenDeck,
  onSellCard,
  onDragStartSlot,
  onDropOnSlot,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [confirmSell, setConfirmSell] = useState(false);
  const confirmTimeoutRef = useRef<number | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Empty slot
  if (!card) {
    return (
      <div
        onClick={onOpenDeck}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const fromIdxStr = e.dataTransfer.getData('text/plain');
          const fromIdx = parseInt(fromIdxStr, 10);
          if (!isNaN(fromIdx) && onDropOnSlot) {
            onDropOnSlot(fromIdx, index);
          }
        }}
        className="w-10 h-13 sm:w-12 sm:h-15 xl:w-14 xl:h-18 rounded-xl border-2 border-dashed border-white/20 bg-black/25 flex flex-col items-center justify-center transition-all hover:border-[#f2b632] hover:bg-black/40 cursor-pointer shadow-inner relative group select-none"
        title="Espaço para Coringa (Clique para abrir a Caixa de Bolas)"
      >
        <div className="w-4 h-6 rounded-md border border-white/10 group-hover:border-[#f2b632]/50 transition-colors" />
        <span className="text-[8px] font-black text-white/30 font-cacapa mt-0.5">#{index + 1}</span>
      </div>
    );
  }

  const isLegendary = card.rarity === 'Lendária' || card.edition !== 'Base';

  // Handle mouse move for Caçapa dynamic 3D card tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setTilt({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // 2-Click Sell Confirmation Flow
  const handleSellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmSell) {
      setConfirmSell(true);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = window.setTimeout(() => {
        setConfirmSell(false);
      }, 3000);
    } else {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      setConfirmSell(false);
      if (onSellCard) {
        onSellCard(index);
      }
    }
  };

  return (
    <div
      ref={cardRef}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', index.toString());
        if (onDragStartSlot) onDragStartSlot(index);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const fromIdxStr = e.dataTransfer.getData('text/plain');
        const fromIdx = parseInt(fromIdxStr, 10);
        if (!isNaN(fromIdx) && onDropOnSlot) {
          onDropOnSlot(fromIdx, index);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isActivating
          ? undefined
          : isHovered
          ? `perspective(400px) rotateY(${tilt.x * 16}deg) rotateX(${-tilt.y * 16}deg) translateY(-8px) scale(1.12)`
          : undefined,
        animationDelay: `${index * 0.18}s`,
      }}
      className={`w-10 h-13 sm:w-12 sm:h-15 xl:w-14 xl:h-18 rounded-xl p-1 relative flex flex-col justify-between items-center text-center select-none cursor-grab active:cursor-grabbing transition-transform duration-150 ${
        isActivating
          ? 'animate-card-hop z-40 border-[3px] border-[#ffd36a] shadow-[0_0_25px_#ffd36a,0_4px_0_rgba(0,0,0,0.45)] bg-[#f4ecd8]'
          : isLegendary
          ? 'border-[3px] border-[#ffd36a] shadow-[0_0_12px_rgba(255,211,106,0.6),0_4px_0_rgba(0,0,0,0.45)] bg-[#f4ecd8] animate-cacapa-bob'
          : 'border-[3px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] bg-[#f4ecd8] animate-cacapa-bob'
      }`}
    >
      {/* Legendary Rotating Sunburst Rays behind icon */}
      {isLegendary && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none opacity-25">
          <div
            className="w-20 h-20 -left-5 -top-5 absolute animate-rotate-rays"
            style={{
              background:
                'conic-gradient(from 0deg, #ffd36a 0deg 20deg, transparent 20deg 40deg, #ffd36a 40deg 60deg, transparent 60deg 80deg, #ffd36a 80deg 100deg, transparent 100deg 120deg, #ffd36a 120deg 140deg, transparent 140deg 160deg, #ffd36a 160deg 180deg, transparent 180deg 200deg, #ffd36a 200deg 220deg, transparent 220deg 240deg, #ffd36a 240deg 260deg, transparent 260deg 280deg, #ffd36a 280deg 300deg, transparent 300deg 320deg, #ffd36a 320deg 340deg, transparent 340deg 360deg)',
            }}
          />
        </div>
      )}

      {/* Sheen beam sweep during activation */}
      {isActivating && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="w-12 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent absolute animate-sheen-sweep" />
        </div>
      )}

      {/* Top Icon Box */}
      <div className="w-full flex-1 flex items-center justify-center bg-slate-900/10 rounded-lg py-0.5 relative z-10">
        <span className="text-sm sm:text-base drop-shadow select-none">{card.icon}</span>
      </div>

      {/* Card Name */}
      <span className="text-[7px] xl:text-[8px] font-black text-[#2a1a2e] line-clamp-1 leading-tight font-cacapa relative z-10">
        {card.name}
      </span>

      {/* Card Rarity Tag */}
      <span className="text-[5.5px] xl:text-[6.5px] font-black uppercase px-0.5 rounded font-cacapa text-[#78350f] relative z-10">
        {isLegendary ? '★ LENDÁRIO ★' : card.rarity}
      </span>

      {/* RICH CAÇAPA FLOATING TOOLTIP ON HOVER */}
      {isHovered && !isActivating && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 sm:w-52 bg-[#1b2427] border-[3px] border-[#0b0710] shadow-[0_6px_0_rgba(0,0,0,0.45)] rounded-2xl p-2.5 z-50 text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-100 font-cacapa select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-[#0b0710]">
            <span className="text-xs font-black text-[#f4ecd8] tracking-wider truncate cacapa-stroke-sm">
              {card.name}
            </span>
            <span
              className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                isLegendary
                  ? 'bg-[#f2b632] text-slate-950 border-[#0b0710]'
                  : 'bg-[#3a2a4a] text-[#ffd36a] border-[#0b0710]'
              }`}
            >
              {card.rarity}
            </span>
          </div>

          {/* Description */}
          <p className="text-[10px] sm:text-[11px] text-[#9fb4a8] leading-tight my-2">
            {card.description}
          </p>

          {/* Sell Button with 2-Click Confirmation */}
          <button
            onClick={handleSellClick}
            className={`w-full py-1 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              confirmSell
                ? 'bg-[#e0392b] text-white animate-pulse'
                : 'bg-[#2a1a3a] text-[#ffd36a] hover:bg-[#3a2a4a]'
            }`}
          >
            <span>💰</span>
            <span>{confirmSell ? `Confirmar? +$${card.cost}` : `Vender +$${card.cost}`}</span>
          </button>
        </div>
      )}
    </div>
  );
};