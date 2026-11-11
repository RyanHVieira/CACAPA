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
        className="w-[72px] h-[104px] sm:w-[88px] sm:h-[120px] xl:w-[104px] xl:h-[144px] rounded-2xl border-[3px] border-dashed border-white/35 bg-black/35 flex flex-col items-center justify-center transition-all hover:border-[#f2b632] hover:bg-black/50 cursor-pointer shadow-inner relative group select-none"
        title="Espaço para Coringa (Clique para abrir a Caixa de Bolas)"
      >
        <div className="w-8 h-12 sm:w-10 sm:h-14 rounded-lg border-2 border-white/20 group-hover:border-[#f2b632]/70 transition-colors flex items-center justify-center">
          <span className="text-xl sm:text-2xl opacity-30 group-hover:opacity-60">🃏</span>
        </div>
        <span className="text-xs sm:text-sm font-black text-white/50 font-cacapa mt-1.5">#{index + 1}</span>
      </div>
    );
  }

  const isLegendary = card.rarity === 'Lendária' || card.edition !== 'Base';

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
      className={`w-[72px] h-[104px] sm:w-[88px] sm:h-[120px] xl:w-[104px] xl:h-[144px] rounded-2xl p-1.5 sm:p-2 relative flex flex-col justify-between items-center text-center select-none cursor-grab active:cursor-grabbing transition-transform duration-150 ${
        isActivating
          ? 'animate-card-hop z-40 border-[5px] border-[#ffd36a] shadow-[0_0_25px_#ffd36a,0_4px_0_rgba(0,0,0,0.45)] bg-[#f4ecd8]'
          : isLegendary
          ? 'border-[5px] border-[#ffd36a] shadow-[0_0_15px_rgba(255,211,106,0.65),0_4px_0_rgba(0,0,0,0.45)] bg-[#f4ecd8] animate-cacapa-bob'
          : 'border-[5px] border-[#0b0710] shadow-[0_4px_0_rgba(0,0,0,0.45)] bg-[#f4ecd8] animate-cacapa-bob'
      }`}
    >
      {/* Legendary rays */}
      {isLegendary && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none opacity-25">
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 -left-8 -top-8 absolute animate-rotate-rays"
            style={{
              background:
                'conic-gradient(from 0deg, #ffd36a 0deg 20deg, transparent 20deg 40deg, #ffd36a 40deg 60deg, transparent 60deg 80deg, #ffd36a 80deg 100deg, transparent 100deg 120deg, #ffd36a 120deg 140deg, transparent 140deg 160deg, #ffd36a 160deg 180deg, transparent 180deg 200deg, #ffd36a 200deg 220deg, transparent 220deg 240deg, #ffd36a 240deg 260deg, transparent 260deg 280deg, #ffd36a 280deg 300deg, transparent 300deg 320deg, #ffd36a 320deg 340deg, transparent 340deg 360deg)',
            }}
          />
        </div>
      )}

      {/* Activation shimmer */}
      {isActivating && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="w-16 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent absolute animate-sheen-sweep" />
        </div>
      )}

      {/* Icon */}
      <div className="w-full flex-1 flex items-center justify-center bg-slate-900/10 rounded-xl py-1 relative z-10">
        <span className="text-2xl sm:text-3xl xl:text-4xl drop-shadow select-none">{card.icon}</span>
      </div>

      {/* Name */}
      <span className="text-xs sm:text-sm xl:text-base font-black text-[#2a1a2e] line-clamp-1 leading-tight font-cacapa relative z-10 px-1 mt-1">
        {card.name}
      </span>

      {/* Rarity */}
      <span className="text-[8px] sm:text-[9.5px] xl:text-[11px] font-black uppercase px-1.5 py-0.5 rounded font-cacapa text-[#78350f] relative z-10 mb-0.5">
        {isLegendary ? '★ LENDÁRIO ★' : card.rarity}
      </span>

      {/* Hover tooltip */}
      {isHovered && !isActivating && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-60 sm:w-72 bg-[#1b2427] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.5)] rounded-2xl p-3.5 z-50 text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-100 font-cacapa select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#0b0710]">
            <span className="text-sm sm:text-base font-black text-[#f4ecd8] tracking-wider truncate cacapa-stroke-sm">
              {card.name}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                isLegendary
                  ? 'bg-[#f2b632] text-slate-950 border-[#0b0710]'
                  : 'bg-[#3a2a4a] text-[#ffd36a] border-[#0b0710]'
              }`}
            >
              {card.rarity}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#9fb4a8] leading-tight my-2.5">
            {card.description}
          </p>

          <button
            onClick={handleSellClick}
            title={`Vender curinga: 75% do valor (+$${Math.max(1, Math.floor(card.cost * 0.75))})`}
            className={`w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              confirmSell
                ? 'bg-[#e0392b] text-white animate-pulse'
                : 'bg-[#2a1a3a] text-[#ffd36a] hover:bg-[#3a2a4a]'
            }`}
          >
            <span>💰</span>
            <span>
              {confirmSell
                ? `Confirmar? +$${Math.max(1, Math.floor(card.cost * 0.75))}`
                : `Vender +$${Math.max(1, Math.floor(card.cost * 0.75))}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
