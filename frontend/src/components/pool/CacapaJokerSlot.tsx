import React, { useState, useRef } from 'react';
import { Card } from '../../game/cards/Card';
import { JokerBottleCanvas } from './JokerBottleCanvas';

/**
 * Multiplicador de tamanho configurável para os Joker Card Slots.
 * Altere este valor para redimensionar proporcionalmente todos os slots de coringa.
 */
export const JOKER_SLOT_SCALE_MULTIPLIER = 1.0;

interface CacapaJokerSlotProps {
  card: Card | null;
  index: number;
  isActivating?: boolean;
  scale?: number;
  canDrag?: boolean;
  onOpenDeck: () => void;
  onSellCard?: (index: number) => void;
  onDragStartSlot?: (index: number) => void;
  onDropOnSlot?: (fromIndex: number, toIndex: number) => void;
}

export const CacapaJokerSlot: React.FC<CacapaJokerSlotProps> = ({
  card,
  index,
  isActivating = false,
  scale = JOKER_SLOT_SCALE_MULTIPLIER,
  canDrag = true,
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

  const currentScale = scale ?? JOKER_SLOT_SCALE_MULTIPLIER;
  const cardWidth = Math.round(86 * currentScale);
  const cardHeight = Math.round(126 * currentScale);

  if (!card) {
    return (
      <div
        onClick={onOpenDeck}
        onDragOver={(e) => {
          if (!canDrag) return;
          e.preventDefault();
        }}
        onDrop={(e) => {
          if (!canDrag) return;
          e.preventDefault();
          const fromIdxStr = e.dataTransfer.getData('text/plain');
          const fromIdx = parseInt(fromIdxStr, 10);
          if (!isNaN(fromIdx) && onDropOnSlot) {
            onDropOnSlot(fromIdx, index);
          }
        }}
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
        }}
        className="rounded-2xl border-[3px] border-dashed border-white/30 bg-black/30 flex flex-col items-center justify-center transition-all hover:border-[#f2b632] hover:bg-black/50 cursor-pointer shadow-inner relative group select-none flex-shrink-0"
        title="Espaço para Garrafa Coringa (Clique para abrir a Caixa de Bolas)"
      >
        <div
          style={{
            width: `${Math.round(44 * currentScale)}px`,
            height: `${Math.round(62 * currentScale)}px`,
          }}
          className="rounded-xl border-2 border-dashed border-white/20 group-hover:border-[#f2b632]/70 transition-colors flex flex-col items-center justify-center gap-0.5"
        >
          <span
            style={{ fontSize: `${Math.round(24 * currentScale)}px` }}
            className="opacity-35 group-hover:opacity-75 transition-opacity"
          >
            🍾
          </span>
        </div>
        <span
          style={{ fontSize: `${Math.max(10, Math.round(12 * currentScale))}px` }}
          className="font-black text-white/50 font-cacapa mt-1.5"
        >
          #{index + 1}
        </span>
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
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', index.toString());
        if (onDragStartSlot) onDragStartSlot(index);
      }}
      onDragOver={(e) => {
        if (!canDrag) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (!canDrag) return;
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
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transform: isActivating
          ? undefined
          : isHovered
          ? `perspective(400px) rotateY(${tilt.x * 14}deg) rotateX(${-tilt.y * 14}deg) translateY(-8px) scale(1.08)`
          : undefined,
        animationDelay: `${index * 0.18}s`,
      }}
      className={`rounded-2xl p-1 relative flex flex-col justify-end items-center text-center select-none flex-shrink-0 transition-transform duration-150 ${
        !canDrag ? 'cursor-default opacity-95' : 'cursor-grab active:cursor-grabbing'
      } ${
        isActivating
          ? 'animate-card-hop z-40'
          : 'animate-cacapa-bob'
      }`}
    >
      {/* Suporte de descanso / Porta-copos de madeira */}
      <div className="absolute inset-x-2 bottom-1 h-5 rounded-full bg-gradient-to-b from-[#3b2314] to-[#1a0f08] border-2 border-[#0b0710] shadow-[0_3px_0_rgba(0,0,0,0.6)] pointer-events-none" />

      {/* Garrafa Coringa em Canvas 2D idêntica à da Loja */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-end">
        <JokerBottleCanvas
          card={card}
          width={cardWidth}
          height={Math.round(cardHeight * 0.88)}
          isHovered={isHovered}
          isActivating={isActivating}
        />

        {/* Nome do Coringa em estilo placa de bar */}
        <div className="w-full bg-[#171d22]/90 border border-[#0b0710] rounded-lg px-1 py-0.5 -mt-1 shadow-md z-20">
          <span className="text-[10px] sm:text-[11px] font-black text-[#ffd36a] truncate block cacapa-stroke-sm leading-tight">
            {card.name}
          </span>
        </div>
      </div>

      {/* Hover tooltip com Detalhes e Botão de Vender */}
      {isHovered && !isActivating && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 sm:w-72 bg-[#1b2427] border-[4px] border-[#0b0710] shadow-[0_8px_0_rgba(0,0,0,0.6)] rounded-2xl p-3.5 z-50 text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-100 font-cacapa select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 border-b-2 border-[#0b0710]">
            <span className="text-sm sm:text-base font-black text-[#f4ecd8] tracking-wider truncate cacapa-stroke-sm">
              Garrafa: {card.name}
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
            title={`Vender garrafa coringa: 75% do valor (+$${Math.max(1, Math.floor(card.cost * 0.75))})`}
            className={`w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-[#0b0710] shadow-[0_2px_0_rgba(0,0,0,0.45)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
              confirmSell
                ? 'bg-[#e0392b] text-white animate-pulse'
                : 'bg-[#2a1a3a] text-[#ffd36a] hover:bg-[#3a2a4a]'
            }`}
          >
            <span>💰</span>
            <span>
              {confirmSell
                ? `Confirmar Venda? +$${Math.max(1, Math.floor(card.cost * 0.75))}`
                : `Vender Garrafa +$${Math.max(1, Math.floor(card.cost * 0.75))}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

